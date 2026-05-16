<?php

namespace App\Repositories\Recipe;

use App\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RecipeBomRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function findMenuItem(int $id): InventoryItem;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function createMenuItem(array $attributes): InventoryItem;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateMenuItem(InventoryItem $menuItem, array $attributes): bool;

    /**
     * @param  array<int, array<string, mixed>>  $materials
     */
    public function replaceMaterials(InventoryItem $menuItem, array $materials): void;

    public function deleteMenuItem(InventoryItem $menuItem): bool;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function menuItemOptions(): array;

    /**
     * @return array<string, int>
     */
    public function summary(): array;
}
