<?php

namespace App\Repositories\Production;

use App\Models\ProductionBatch;
use App\Models\ProductionBatchMaterial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductionBatchRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForProduction(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function find(int $id): ProductionBatch;

    public function nextBatchNumber(int $year): string;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): ProductionBatch;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(ProductionBatch $productionBatch, array $attributes): bool;

    /**
     * @param  array<int, array<string, mixed>>  $materials
     */
    public function replaceMaterials(ProductionBatch $productionBatch, array $materials): void;

    public function updateMaterialSyncedQuantity(ProductionBatchMaterial $material, float $quantity): bool;

    public function delete(ProductionBatch $productionBatch): bool;

    /**
     * @return array<string, int>
     */
    public function summary(): array;
}
