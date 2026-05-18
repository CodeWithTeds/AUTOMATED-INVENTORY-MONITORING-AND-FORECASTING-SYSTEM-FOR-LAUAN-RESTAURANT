<?php

namespace App\Repositories\PurchaseOrder;

use App\Models\PosOrder;
use App\Models\PurchaseOrder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PurchaseOrderRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 12): LengthAwarePaginator;

    public function find(int $id): PurchaseOrder;

    public function updateStatus(PurchaseOrder $purchaseOrder, string $status): bool;

    /**
     * @return Collection<int, PurchaseOrder>
     */
    public function recentForPos(int $limit = 3): Collection;

    /**
     * @return array<string, float|int>
     */
    public function summary(): array;

    public function createFromPosOrder(PosOrder $order): PurchaseOrder;
}
