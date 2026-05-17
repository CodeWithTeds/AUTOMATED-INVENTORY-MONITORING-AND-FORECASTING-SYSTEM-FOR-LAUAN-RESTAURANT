<?php

namespace App\Services\Inventory;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Supplier\SupplierRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class InventoryItemService
{
    public function __construct(
        private readonly InventoryItemRepositoryInterface $inventoryItemRepository,
        private readonly SupplierRepositoryInterface $supplierRepository,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function indexData(array $filters): array
    {
        $normalizedFilters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $paginator = $this->inventoryItemRepository->paginateForInventory($normalizedFilters, 15);

        return [
            'items' => $this->paginatedItems($paginator),
            'filters' => $normalizedFilters,
            'summary' => $this->inventoryItemRepository->summary(),
            'categoryOptions' => $this->enumOptions(InventoryCategory::cases()),
            'supplierOptions' => $this->supplierRepository->options(),
            'statusOptions' => $this->enumOptions(InventoryItemStatus::cases()),
            'stockStateOptions' => [
                ['value' => 'healthy', 'label' => 'Healthy'],
                ['value' => 'low', 'label' => 'Low'],
                ['value' => 'critical', 'label' => 'Critical'],
                ['value' => 'out', 'label' => 'Out'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): InventoryItem
    {
        return $this->inventoryItemRepository->create($this->normalizeAttributes($attributes));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(int $id, array $attributes): InventoryItem
    {
        $inventoryItem = $this->inventoryItemRepository->find($id);
        $attributes = $this->normalizeAttributes($attributes, $inventoryItem);

        $this->inventoryItemRepository->update($inventoryItem, $attributes);

        return $inventoryItem->refresh();
    }

    public function delete(int $id): bool
    {
        $inventoryItem = $this->inventoryItemRepository->find($id);

        if ($inventoryItem->image_path) {
            Storage::disk('public')->delete($inventoryItem->image_path);
        }

        return $this->inventoryItemRepository->delete($inventoryItem);
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
    private function paginatedItems(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => InventoryItemResource::collection($paginator->items())->resolve(),
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
    private function normalizeAttributes(array $attributes, ?InventoryItem $inventoryItem = null): array
    {
        $image = $attributes['image'] ?? null;
        unset($attributes['image']);

        if (empty($attributes['sku'])) {
            $attributes['sku'] = $inventoryItem?->sku
                ?? $this->inventoryItemRepository->nextSku($this->skuPrefix((string) ($attributes['category'] ?? 'general')));
        }

        $attributes['daily_usage_rate'] ??= 0;
        $attributes['lead_time_days'] ??= 1;

        if ($image instanceof UploadedFile) {
            $attributes['image_path'] = $image->store('inventory-items', 'public');

            if ($inventoryItem?->image_path) {
                Storage::disk('public')->delete($inventoryItem->image_path);
            }
        }

        return $attributes;
    }

    private function skuPrefix(string $category): string
    {
        return match ($category) {
            'produce' => 'PRO',
            'meat' => 'MEAT',
            'seafood' => 'SEA',
            'dairy' => 'DAI',
            'dry_goods' => 'DRY',
            'beverage' => 'BEV',
            'condiment' => 'CON',
            'packaging' => 'PKG',
            'cleaning' => 'CLN',
            default => 'GEN',
        };
    }
}
