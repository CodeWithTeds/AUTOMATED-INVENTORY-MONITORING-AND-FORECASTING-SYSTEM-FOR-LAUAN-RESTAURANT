<?php

namespace App\Repositories\Pos;

use App\Models\InventoryItem;
use App\Models\PosOrder;
use Illuminate\Support\Collection;

interface PosOrderRepositoryInterface
{
    /**
     * @return Collection<int, InventoryItem>
     */
    public function sellableProducts(): Collection;

    /**
     * @param  array<int, int>  $ids
     * @return Collection<int, InventoryItem>
     */
    public function sellableProductsForCheckout(array $ids): Collection;

    public function nextOrderNumber(): string;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): PosOrder;

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function createItems(PosOrder $order, array $items): void;

    public function findPaidForVoid(int $id): PosOrder;

    public function void(PosOrder $order, string $notes): bool;

    /**
     * @return Collection<int, PosOrder>
     */
    public function recentOrders(int $limit = 8): Collection;

    /**
     * @return array<string, float|int>
     */
    public function todaySummary(): array;
}
