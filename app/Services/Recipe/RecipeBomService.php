<?php

namespace App\Services\Recipe;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Http\Resources\RecipeBomResource;
use App\Models\InventoryItem;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Recipe\RecipeBomRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RecipeBomService
{
    public function __construct(
        private readonly RecipeBomRepositoryInterface $recipeBomRepository,
        private readonly InventoryItemRepositoryInterface $inventoryItemRepository,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function indexData(array $filters): array
    {
        $normalizedFilters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $paginator = $this->recipeBomRepository->paginate($normalizedFilters, 15);

        return [
            'recipes' => $this->paginatedRecipes($paginator),
            'filters' => $normalizedFilters,
            'summary' => $this->recipeBomRepository->summary(),
            'rawMaterialOptions' => $this->inventoryItemRepository->rawMaterialOptions(),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): InventoryItem
    {
        $materials = $this->normalizeMaterials($attributes['materials'] ?? []);
        unset($attributes['materials']);

        $menuItem = $this->recipeBomRepository->createMenuItem($this->normalizeMenuAttributes($attributes));
        $this->recipeBomRepository->replaceMaterials($menuItem, $materials);

        return $menuItem->refresh()->load('recipeMaterials.rawMaterial');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(int $id, array $attributes): InventoryItem
    {
        $menuItem = $this->recipeBomRepository->findMenuItem($id);
        $materials = $this->normalizeMaterials($attributes['materials'] ?? []);
        unset($attributes['materials']);

        $this->recipeBomRepository->updateMenuItem($menuItem, $this->normalizeMenuAttributes($attributes, $menuItem));
        $this->recipeBomRepository->replaceMaterials($menuItem->refresh(), $materials);

        return $menuItem->refresh()->load('recipeMaterials.rawMaterial');
    }

    public function delete(int $id): bool
    {
        $menuItem = $this->recipeBomRepository->findMenuItem($id);

        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }

        return $this->recipeBomRepository->deleteMenuItem($menuItem);
    }

    /**
     * @return array<string, mixed>
     */
    private function paginatedRecipes(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => RecipeBomResource::collection($paginator->items())->resolve(),
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
    private function normalizeMenuAttributes(array $attributes, ?InventoryItem $menuItem = null): array
    {
        $image = $attributes['image'] ?? null;
        unset($attributes['image']);

        $sku = $attributes['sku'] ?: $this->generatedSku($attributes['name']);

        $normalized = [
            'sku' => $sku,
            'name' => $attributes['name'],
            'category' => InventoryCategory::DryGoods,
            'supplier' => 'Recipe / BOM',
            'unit' => $attributes['unit'],
            'current_stock' => $menuItem?->current_stock ?? 0,
            'par_level' => $menuItem?->par_level ?? 0,
            'reorder_point' => $menuItem?->reorder_point ?? 0,
            'reorder_quantity' => $menuItem?->reorder_quantity ?? 0,
            'unit_cost' => $menuItem?->unit_cost ?? 0,
            'daily_usage_rate' => $menuItem?->daily_usage_rate ?? 0,
            'lead_time_days' => $menuItem?->lead_time_days ?? 1,
            'storage_area' => 'Menu / POS',
            'status' => InventoryItemStatus::Active,
            'is_menu_item' => true,
            'selling_price' => $attributes['selling_price'],
            'notes' => $attributes['notes'] ?? null,
        ];

        if ($image instanceof UploadedFile) {
            $normalized['image_path'] = $image->store('inventory-items', 'public');

            if ($menuItem?->image_path) {
                Storage::disk('public')->delete($menuItem->image_path);
            }
        }

        return $normalized;
    }

    /**
     * @param  array<int, array<string, mixed>>  $materials
     * @return array<int, array<string, mixed>>
     */
    private function normalizeMaterials(array $materials): array
    {
        return array_map(fn (array $material): array => [
            'raw_material_id' => $material['raw_material_id'],
            'quantity' => $material['quantity'],
            'unit' => $material['unit'],
            'notes' => $material['notes'] ?? null,
        ], $materials);
    }

    private function generatedSku(string $name): string
    {
        return 'MENU-'.strtoupper(Str::slug($name, '-')).'-'.now()->format('His');
    }
}
