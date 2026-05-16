<?php

namespace App\Repositories\Production;

use App\Enums\ProductionBatchStatus;
use App\Models\ProductionBatch;
use App\Models\ProductionBatchMaterial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProductionBatchRepository implements ProductionBatchRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForProduction(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $sortable = ['batch_number', 'planned_quantity', 'completed_quantity', 'planned_start_date', 'completed_at', 'status'];
        $sort = in_array($filters['sort'] ?? '', $sortable, true) ? $filters['sort'] : 'planned_start_date';
        $direction = ($filters['direction'] ?? '') === 'asc' ? 'asc' : 'desc';

        return ProductionBatch::query()
            ->with(['product', 'materials.rawMaterial'])
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('batch_number', 'like', "%{$search}%")
                        ->orWhere('production_area', 'like', "%{$search}%")
                        ->orWhereHas('product', function (Builder $query) use ($search): void {
                            $query
                                ->where('sku', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['production_area'] ?? null, fn (Builder $query, string $area) => $query->where('production_area', $area))
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function find(int $id): ProductionBatch
    {
        return ProductionBatch::query()->with(['product', 'materials.rawMaterial'])->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): ProductionBatch
    {
        return ProductionBatch::query()->create($attributes)->load(['product', 'materials.rawMaterial']);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(ProductionBatch $productionBatch, array $attributes): bool
    {
        return $productionBatch->update($attributes);
    }

    /**
     * @param  array<int, array<string, mixed>>  $materials
     */
    public function replaceMaterials(ProductionBatch $productionBatch, array $materials): void
    {
        $productionBatch->materials()->delete();
        $productionBatch->materials()->createMany($materials);
    }

    public function updateMaterialSyncedQuantity(ProductionBatchMaterial $material, float $quantity): bool
    {
        return $material->update([
            'stock_synced_quantity' => $quantity,
        ]);
    }

    public function delete(ProductionBatch $productionBatch): bool
    {
        return $productionBatch->delete();
    }

    /**
     * @return array<string, int>
     */
    public function summary(): array
    {
        return [
            'total' => ProductionBatch::query()->count(),
            'planned' => ProductionBatch::query()->where('status', ProductionBatchStatus::Planned->value)->count(),
            'in_progress' => ProductionBatch::query()->where('status', ProductionBatchStatus::InProgress->value)->count(),
            'completed' => ProductionBatch::query()->where('status', ProductionBatchStatus::Completed->value)->count(),
        ];
    }
}
