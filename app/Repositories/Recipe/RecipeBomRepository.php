<?php

namespace App\Repositories\Recipe;

use App\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class RecipeBomRepository implements RecipeBomRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $sortable = ['name', 'sku', 'selling_price', 'current_stock'];
        $sort = in_array($filters['sort'] ?? '', $sortable, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? '') === 'desc' ? 'desc' : 'asc';

        return InventoryItem::query()
            ->with('recipeMaterials.rawMaterial')
            ->where('is_menu_item', true)
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('sku', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhereHas('recipeMaterials.rawMaterial', function (Builder $query) use ($search): void {
                            $query
                                ->where('sku', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findMenuItem(int $id): InventoryItem
    {
        return InventoryItem::query()
            ->with('recipeMaterials.rawMaterial')
            ->where('is_menu_item', true)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function createMenuItem(array $attributes): InventoryItem
    {
        return InventoryItem::query()->create($attributes)->load('recipeMaterials.rawMaterial');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateMenuItem(InventoryItem $menuItem, array $attributes): bool
    {
        return $menuItem->update($attributes);
    }

    /**
     * @param  array<int, array<string, mixed>>  $materials
     */
    public function replaceMaterials(InventoryItem $menuItem, array $materials): void
    {
        $menuItem->recipeMaterials()->delete();
        $menuItem->recipeMaterials()->createMany($materials);
    }

    public function deleteMenuItem(InventoryItem $menuItem): bool
    {
        return $menuItem->delete();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function menuItemOptions(): array
    {
        return InventoryItem::query()
            ->with('recipeMaterials.rawMaterial')
            ->where('is_menu_item', true)
            ->whereHas('recipeMaterials')
            ->orderBy('name')
            ->get()
            ->map(fn (InventoryItem $menuItem): array => [
                'id' => $menuItem->id,
                'sku' => $menuItem->sku,
                'name' => $menuItem->name,
                'unit' => $menuItem->unit,
                'current_stock' => (float) $menuItem->current_stock,
                'selling_price' => $menuItem->selling_price !== null ? (float) $menuItem->selling_price : null,
                'image_url' => $menuItem->image_path ? "/storage/{$menuItem->image_path}" : null,
                'materials' => $menuItem->recipeMaterials->map(fn ($material): array => [
                    'raw_material_id' => $material->raw_material_id,
                    'name' => $material->rawMaterial?->name,
                    'sku' => $material->rawMaterial?->sku,
                    'quantity' => (float) $material->quantity,
                    'unit' => $material->unit,
                    'available_stock' => $material->rawMaterial ? (float) $material->rawMaterial->current_stock : 0,
                ])->values()->all(),
            ])
            ->all();
    }

    /**
     * @return array<string, int>
     */
    public function summary(): array
    {
        return [
            'menu_items' => InventoryItem::query()->where('is_menu_item', true)->count(),
            'with_bom' => InventoryItem::query()->where('is_menu_item', true)->whereHas('recipeMaterials')->count(),
            'raw_materials' => InventoryItem::query()->where('is_menu_item', false)->count(),
        ];
    }
}
