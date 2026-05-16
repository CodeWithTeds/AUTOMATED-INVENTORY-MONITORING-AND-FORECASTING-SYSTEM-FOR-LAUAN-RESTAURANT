<?php

namespace App\Repositories\Inventory;

use App\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface InventoryItemRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForInventory(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function find(int $id): InventoryItem;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function productOptions(): array;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): InventoryItem;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateOrCreateBySku(array $attributes): InventoryItem;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(InventoryItem $inventoryItem, array $attributes): bool;

    public function adjustCurrentStock(InventoryItem $inventoryItem, float $quantityDelta): bool;

    public function delete(InventoryItem $inventoryItem): bool;

    /**
     * @return array<string, int>
     */
    public function summary(): array;
}
