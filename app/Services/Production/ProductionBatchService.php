<?php

namespace App\Services\Production;

use App\Enums\ProductionBatchStatus;
use App\Enums\ProductionCategory;
use App\Http\Resources\ProductionBatchResource;
use App\Models\InventoryItem;
use App\Models\ProductionBatch;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Production\ProductionBatchRepositoryInterface;
use App\Repositories\Recipe\RecipeBomRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionBatchService
{
    public function __construct(
        private readonly ProductionBatchRepositoryInterface $productionBatchRepository,
        private readonly InventoryItemRepositoryInterface $inventoryItemRepository,
        private readonly RecipeBomRepositoryInterface $recipeBomRepository,
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
            'menuItemOptions' => $this->recipeBomRepository->menuItemOptions(),
            'categoryOptions' => $this->productionCategoryOptions(),
            'statusOptions' => $this->enumOptions(ProductionBatchStatus::cases()),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): ProductionBatch
    {
        return DB::transaction(function () use ($attributes): ProductionBatch {
            $menuItem = $this->recipeBomRepository->findMenuItem((int) $attributes['inventory_item_id']);
            $materials = $this->materialsFromRecipe($menuItem, $this->outputQuantityForMaterials($attributes));

            $productionBatch = $this->productionBatchRepository->create($this->normalizeAttributes($attributes));
            $this->productionBatchRepository->replaceMaterials($productionBatch, $materials);

            return $this->syncStock($productionBatch->refresh()->load(['product', 'materials.rawMaterial']));
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(int $id, array $attributes): ProductionBatch
    {
        return DB::transaction(function () use ($id, $attributes): ProductionBatch {
            $productionBatch = $this->productionBatchRepository->find($id);
            $menuItem = $this->recipeBomRepository->findMenuItem((int) $attributes['inventory_item_id']);
            $materials = $this->materialsFromRecipe($menuItem, $this->outputQuantityForMaterials($attributes));

            $this->revertSyncedStock($productionBatch);
            $attributes['stock_synced_quantity'] = 0;

            $this->productionBatchRepository->update($productionBatch, $this->normalizeAttributes($attributes, $productionBatch));
            $this->productionBatchRepository->replaceMaterials($productionBatch->refresh(), $materials);

            return $this->syncStock($productionBatch->refresh()->load(['product', 'materials.rawMaterial']));
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            $productionBatch = $this->productionBatchRepository->find($id);

            $this->revertSyncedStock($productionBatch);

            return $this->productionBatchRepository->delete($productionBatch);
        });
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
     * @return array<int, array{value: string, label: string, icon: string}>
     */
    private function productionCategoryOptions(): array
    {
        return array_map(fn (ProductionCategory $case): array => [
            'value' => $case->value,
            'label' => $case->label(),
            'icon' => $case->icon(),
        ], ProductionCategory::cases());
    }

    /**
     * @return array<string, mixed>
     */
    private function paginatedBatches(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => ProductionBatchResource::collection($paginator->items())->resolve(),
            'links' => $this->paginationLinks($paginator),
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
     * @return array<int, array{url: string|null, label: string, active: bool}>
     */
    private function paginationLinks(LengthAwarePaginator $paginator): array
    {
        $links = [
            [
                'url' => $paginator->previousPageUrl(),
                'label' => '&laquo; Previous',
                'active' => false,
            ],
        ];

        foreach ($paginator->getUrlRange(1, $paginator->lastPage()) as $page => $url) {
            $links[] = [
                'url' => $url,
                'label' => (string) $page,
                'active' => $page === $paginator->currentPage(),
            ];
        }

        $links[] = [
            'url' => $paginator->nextPageUrl(),
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function normalizeAttributes(array $attributes, ?ProductionBatch $productionBatch = null): array
    {
        $attributes['planned_quantity'] ??= 0;
        $attributes['completed_quantity'] ??= 0;
        $attributes['waste_quantity'] ??= 0;
        $attributes['category'] ??= ProductionCategory::AllMenu->value;
        $attributes['batch_number'] = empty($attributes['batch_number'])
            ? ($productionBatch?->batch_number ?? $this->productionBatchRepository->nextBatchNumber((int) now()->format('Y')))
            : $attributes['batch_number'];

        if (($attributes['status'] ?? $productionBatch?->status?->value) === ProductionBatchStatus::Completed->value && empty($attributes['completed_at'])) {
            $attributes['completed_at'] = now();
        }

        if (array_key_exists('status', $attributes) && $attributes['status'] !== ProductionBatchStatus::Completed->value) {
            $attributes['completed_at'] = null;
        }

        return $attributes;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function materialsFromRecipe(InventoryItem $menuItem, float $outputQuantity): array
    {
        if ($menuItem->recipeMaterials->isEmpty()) {
            throw ValidationException::withMessages([
                'inventory_item_id' => 'Select a menu item with a saved Recipe / BOM.',
            ]);
        }

        return $menuItem->recipeMaterials->map(fn ($material): array => [
            'inventory_item_id' => $material->raw_material_id,
            'quantity' => (float) $material->quantity * $outputQuantity,
            'unit' => $material->unit,
            'notes' => $material->notes,
            'stock_synced_quantity' => 0,
        ])->values()->all();
    }

    private function syncStock(ProductionBatch $productionBatch): ProductionBatch
    {
        $this->ensureRawMaterialsAvailable($productionBatch);

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

    private function ensureRawMaterialsAvailable(ProductionBatch $productionBatch): void
    {
        if ($productionBatch->status !== ProductionBatchStatus::Completed) {
            return;
        }

        $shortages = [];

        foreach ($productionBatch->materials as $material) {
            $targetMaterialQuantity = $this->quantityForInventoryUnit((float) $material->quantity, $material->unit, $material->rawMaterial->unit);
            $materialDelta = $targetMaterialQuantity - (float) $material->stock_synced_quantity;

            if ($materialDelta <= 0) {
                continue;
            }

            $availableStock = (float) $material->rawMaterial->current_stock;

            if ($materialDelta > $availableStock) {
                $shortages[] = sprintf(
                    '%s needs %s %s but only %s %s is available.',
                    $material->rawMaterial->name,
                    number_format($materialDelta, 2),
                    $material->rawMaterial->unit,
                    number_format($availableStock, 2),
                    $material->rawMaterial->unit,
                );
            }
        }

        if ($shortages !== []) {
            throw ValidationException::withMessages([
                'completed_quantity' => implode(' ', $shortages),
            ]);
        }
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
     */
    private function outputQuantityForMaterials(array $attributes): float
    {
        if (($attributes['status'] ?? null) === ProductionBatchStatus::Completed->value) {
            return (float) ($attributes['completed_quantity'] ?? 0);
        }

        return (float) ($attributes['planned_quantity'] ?? 0);
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
