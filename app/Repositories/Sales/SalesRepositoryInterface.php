<?php

namespace App\Repositories\Sales;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface SalesRepositoryInterface
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginateSales(array $filters, int $perPage = 15): LengthAwarePaginator;

    /**
     * @param array<string, mixed> $filters
     * @return array{total_sales: float, total_orders: int, average_order_value: float}
     */
    public function getSummary(array $filters): array;

    /**
     * @param array<string, mixed> $filters
     * @return Collection<int, array{date: string, total: float}>
     */
    public function getSalesOverTime(array $filters): Collection;

    /**
     * @param array<string, mixed> $filters
     * @return Collection<int, array{method: string, total: float, count: int}>
     */
    public function getSalesByPaymentMethod(array $filters): Collection;
}
