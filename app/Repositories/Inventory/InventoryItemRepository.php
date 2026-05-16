<?php

namespace App\Repositories\Inventory;

use App\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class InventoryItemRepository implements InventoryItemRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForInventory(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $sortable = ['name', 'sku', 'category', 'current_stock', 'expiration_date', 'unit_cost'];
        $sort = in_array($filters['sort'] ?? '', $sortable, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? '') === 'desc' ? 'desc' : 'asc';

        return InventoryItem::query()
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('sku', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('supplier', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['storage_area'] ?? null, fn (Builder $query, string $storageArea) => $query->where('storage_area', $storageArea))
            ->when($filters['stock_state'] ?? null, function (Builder $query, string $stockState): void {
                match ($stockState) {
                    'out' => $query->where('current_stock', '<=', 0),
                    'critical' => $query->whereColumn('current_stock', '<=', 'reorder_point')->where('current_stock', '>', 0),
                    'low' => $query->whereColumn('current_stock', '<=', 'par_level')->whereColumn('current_stock', '>', 'reorder_point'),
                    'healthy' => $query->whereColumn('current_stock', '>', 'par_level'),
                    default => null,
                };
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function find(int $id): InventoryItem
    {
        return InventoryItem::query()->findOrFail($id);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function rawMaterialOptions(): array
    {
        return InventoryItem::query()
            ->where('is_menu_item', false)
            ->orderBy('name')
            ->get(['id', 'sku', 'name', 'unit', 'current_stock'])
            ->map(fn (InventoryItem $item): array => [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'unit' => $item->unit,
                'current_stock' => (float) $item->current_stock,
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): InventoryItem
    {
        return InventoryItem::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateOrCreateBySku(array $attributes): InventoryItem
    {
        return InventoryItem::query()->updateOrCreate(
            ['sku' => $attributes['sku']],
            $attributes,
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(InventoryItem $inventoryItem, array $attributes): bool
    {
        return $inventoryItem->update($attributes);
    }

    public function adjustCurrentStock(InventoryItem $inventoryItem, float $quantityDelta): bool
    {
        $inventoryItem->current_stock = max(0, (float) $inventoryItem->current_stock + $quantityDelta);

        return $inventoryItem->save();
    }

    public function delete(InventoryItem $inventoryItem): bool
    {
        return $inventoryItem->delete();
    }

    /**
     * @return array<string, int>
     */
    public function summary(): array
    {
        return [
            'total' => InventoryItem::query()->count(),
            'critical' => InventoryItem::query()
                ->where('current_stock', '>', 0)
                ->whereColumn('current_stock', '<=', 'reorder_point')
                ->count(),
            'low' => InventoryItem::query()
                ->whereColumn('current_stock', '<=', 'par_level')
                ->whereColumn('current_stock', '>', 'reorder_point')
                ->count(),
            'out' => InventoryItem::query()->where('current_stock', '<=', 0)->count(),
        ];
    }
}
