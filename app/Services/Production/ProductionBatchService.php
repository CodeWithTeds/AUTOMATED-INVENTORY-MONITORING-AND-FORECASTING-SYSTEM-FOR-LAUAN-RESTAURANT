<?php

namespace App\Services\Production;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\ProductionBatchStatus;
use App\Http\Resources\ProductionBatchResource;
use App\Models\InventoryItem;
use App\Models\ProductionBatch;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Production\ProductionBatchRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductionBatchService
{
    public function __construct(
        private readonly ProductionBatchRepositoryInterface $productionBatchRepository,
        private readonly InventoryItemRepositoryInterface $inventoryItemRepository,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function indexData(array $filters): array
    {
        $normalizedFilters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $paginator = $this->productionBatchRepository->paginateForProduction($normalizedFilters, 15);

        return [
            'batches' => $this->paginatedBatches($paginator),
            'filters' => $normalizedFilters,
            'summary' => $this->productionBatchRepository->summary(),
            'rawMaterialOptions' => $this->inventoryItemRepository->rawMaterialOptions(),
            'statusOptions' => $this->enumOptions(ProductionBatchStatus::cases()),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): ProductionBatch
    {
        $materials = $this->normalizeMaterials($attributes['materials'] ?? []);
        $productAttributes = $this->productAttributes($attributes);
        unset($attributes['materials']);

        $product = $this->createMenuProduct($productAttributes);
        $attributes['inventory_item_id'] = $product->id;
        $productionBatch = $this->productionBatchRepository->create($this->normalizeAttributes($attributes));
        $this->productionBatchRepository->replaceMaterials($productionBatch, $materials);

        return $this->syncStock($productionBatch->refresh()->load(['product', 'materials.rawMaterial']));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(int $id, array $attributes): ProductionBatch
    {
        $productionBatch = $this->productionBatchRepository->find($id);
        $materials = $this->normalizeMaterials($attributes['materials'] ?? []);
        $productAttributes = $this->productAttributes($attributes);
        unset($attributes['materials']);

        $this->revertSyncedStock($productionBatch);
        $attributes['stock_synced_quantity'] = 0;

        $this->productionBatchRepository->update($productionBatch, $this->normalizeAttributes($attributes, $productionBatch));
        $this->updateMenuProduct($productionBatch->refresh()->load('product'), $productAttributes);
        $this->productionBatchRepository->replaceMaterials($productionBatch->refresh(), $materials);

        return $this->syncStock($productionBatch->refresh()->load(['product', 'materials.rawMaterial']));
    }

    public function delete(int $id): bool
    {
        $productionBatch = $this->productionBatchRepository->find($id);

        $this->revertSyncedStock($productionBatch);

        return $this->productionBatchRepository->delete($productionBatch);
    }

    /**
     * @param  array<int, object>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    private function enumOptions(array $cases): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], $cases);
    }

    /**
     * @return array<string, mixed>
     */
    private function paginatedBatches(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => ProductionBatchResource::collection($paginator->items())->resolve(),
            'links' => $paginator->linkCollection()->toArray(),
            'meta' => [
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function normalizeAttributes(array $attributes, ?ProductionBatch $productionBatch = null): array
    {
        unset(
            $attributes['product_image'],
            $attributes['product_name'],
            $attributes['product_sku'],
            $attributes['product_unit'],
            $attributes['selling_price'],
        );

        $attributes['planned_quantity'] ??= 0;
        $attributes['completed_quantity'] ??= 0;
        $attributes['waste_quantity'] ??= 0;

        if (($attributes['status'] ?? $productionBatch?->status?->value) === ProductionBatchStatus::Completed->value && empty($attributes['completed_at'])) {
            $attributes['completed_at'] = now();
        }

        if (array_key_exists('status', $attributes) && $attributes['status'] !== ProductionBatchStatus::Completed->value) {
            $attributes['completed_at'] = null;
        }

        return $attributes;
    }

    /**
     * @param  array<int, array<string, mixed>>  $materials
     * @return array<int, array<string, mixed>>
     */
    private function normalizeMaterials(array $materials): array
    {
        return array_map(fn (array $material): array => [
            'inventory_item_id' => $material['inventory_item_id'],
            'quantity' => $material['quantity'],
            'unit' => $material['unit'],
            'notes' => $material['notes'] ?? null,
            'stock_synced_quantity' => 0,
        ], $materials);
    }

    private function syncStock(ProductionBatch $productionBatch): ProductionBatch
    {
        $targetSyncedQuantity = $productionBatch->status === ProductionBatchStatus::Completed
            ? (float) $productionBatch->completed_quantity
            : 0;

        $quantityDelta = $targetSyncedQuantity - (float) $productionBatch->stock_synced_quantity;

        if (abs($quantityDelta) >= 0.01) {
            $this->inventoryItemRepository->adjustCurrentStock($productionBatch->product, $quantityDelta);
        }

        $this->productionBatchRepository->update($productionBatch, [
            'stock_synced_quantity' => $targetSyncedQuantity,
        ]);

        foreach ($productionBatch->materials as $material) {
            $targetMaterialQuantity = $productionBatch->status === ProductionBatchStatus::Completed
                ? $this->quantityForInventoryUnit((float) $material->quantity, $material->unit, $material->rawMaterial->unit)
                : 0;
            $materialDelta = $targetMaterialQuantity - (float) $material->stock_synced_quantity;

            if (abs($materialDelta) >= 0.01) {
                $this->inventoryItemRepository->adjustCurrentStock($material->rawMaterial, -1 * $materialDelta);
            }

            $this->productionBatchRepository->updateMaterialSyncedQuantity($material, $targetMaterialQuantity);
        }

        return $productionBatch->refresh()->load(['product', 'materials.rawMaterial']);
    }

    private function revertSyncedStock(ProductionBatch $productionBatch): void
    {
        if ((float) $productionBatch->stock_synced_quantity > 0) {
            $this->inventoryItemRepository->adjustCurrentStock($productionBatch->product, -1 * (float) $productionBatch->stock_synced_quantity);
            $this->productionBatchRepository->update($productionBatch, [
                'stock_synced_quantity' => 0,
            ]);
        }

        foreach ($productionBatch->materials as $material) {
            if ((float) $material->stock_synced_quantity <= 0) {
                continue;
            }

            $this->inventoryItemRepository->adjustCurrentStock($material->rawMaterial, (float) $material->stock_synced_quantity);
            $this->productionBatchRepository->updateMaterialSyncedQuantity($material, 0);
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function productAttributes(array $attributes): array
    {
        return [
            'product_image' => $attributes['product_image'] ?? null,
            'product_name' => $attributes['product_name'],
            'product_sku' => $attributes['product_sku'] ?: 'MENU-'.$attributes['batch_number'],
            'product_unit' => $attributes['product_unit'],
            'selling_price' => $attributes['selling_price'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createMenuProduct(array $attributes): InventoryItem
    {
        $productAttributes = [
            'sku' => $attributes['product_sku'],
            'name' => $attributes['product_name'],
            'category' => InventoryCategory::DryGoods,
            'supplier' => 'Production',
            'unit' => $attributes['product_unit'],
            'current_stock' => 0,
            'par_level' => 0,
            'reorder_point' => 0,
            'reorder_quantity' => 0,
            'unit_cost' => 0,
            'daily_usage_rate' => 0,
            'lead_time_days' => 1,
            'storage_area' => 'Menu / POS',
            'status' => InventoryItemStatus::Active,
            'is_menu_item' => true,
            'selling_price' => $attributes['selling_price'],
            'notes' => 'Created from production as a sellable POS menu item.',
        ];

        $image = $attributes['product_image'] ?? null;

        if ($image instanceof UploadedFile) {
            $productAttributes['image_path'] = $image->store('inventory-items', 'public');
        }

        return $this->inventoryItemRepository->create($productAttributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function updateMenuProduct(ProductionBatch $productionBatch, array $attributes): void
    {
        $productAttributes = [
            'sku' => $attributes['product_sku'],
            'name' => $attributes['product_name'],
            'unit' => $attributes['product_unit'],
            'is_menu_item' => true,
            'selling_price' => $attributes['selling_price'],
        ];

        $image = $attributes['product_image'] ?? null;

        if ($image instanceof UploadedFile) {
            $productAttributes['image_path'] = $image->store('inventory-items', 'public');

            if ($productionBatch->product->image_path) {
                Storage::disk('public')->delete($productionBatch->product->image_path);
            }
        }

        $this->inventoryItemRepository->update($productionBatch->product, $productAttributes);
    }

    private function quantityForInventoryUnit(float $quantity, string $usedUnit, string $inventoryUnit): float
    {
        $usedUnit = strtolower($usedUnit);
        $inventoryUnit = strtolower($inventoryUnit);

        return match (true) {
            $usedUnit === $inventoryUnit => $quantity,
            $usedUnit === 'g' && $inventoryUnit === 'kg' => $quantity / 1000,
            $usedUnit === 'kg' && $inventoryUnit === 'g' => $quantity * 1000,
            $usedUnit === 'ml' && in_array($inventoryUnit, ['l', 'liter', 'liters'], true) => $quantity / 1000,
            in_array($usedUnit, ['l', 'liter', 'liters'], true) && $inventoryUnit === 'ml' => $quantity * 1000,
            default => $quantity,
        };
    }
}
