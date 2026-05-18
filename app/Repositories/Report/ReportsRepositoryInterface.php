<?php

namespace App\Repositories\Report;

use Illuminate\Support\Collection;

interface ReportsRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{total_sales: float, total_orders: int, average_order_value: float}
     */
    public function getSalesSummary(array $filters): array;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{date: string, total: float, orders: int}>
     */
    public function getSalesTrend(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{method: string, total: float, orders: int}>
     */
    public function getPaymentMethodBreakdown(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{name: string, quantity: float, total: float}>
     */
    public function getTopSellingItems(array $filters): Collection;

    /**
     * @return array{total_items: int, low_stock_items: int, watchlist_items: int, menu_items: int, inventory_value: float}
     */
    public function getInventorySummary(): array;

    /**
     * @return Collection<int, array{name: string, sku: string, category: string, current_stock: float, reorder_point: float, unit: string, expiration_date: string|null}>
     */
    public function getStockRiskItems(): Collection;

    /**
     * @return Collection<int, array{category: string, value: float, items: int}>
     */
    public function getInventoryValueByCategory(): Collection;

    /**
     * @param  array<string, mixed>  $filters
     * @return array{planned_batches: int, active_batches: int, completed_batches: int, completed_quantity: float, waste_quantity: float}
     */
    public function getProductionSummary(array $filters): array;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{status: string, count: int}>
     */
    public function getProductionStatusBreakdown(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $filters
     * @return array{open_orders: int, received_orders: int, cancelled_orders: int, purchase_value: float, expected_this_week: int}
     */
    public function getProcurementSummary(array $filters): array;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{status: string, count: int, total: float}>
     */
    public function getProcurementStatusBreakdown(array $filters): Collection;

    /**
     * @return array{total_suppliers: int, active_suppliers: int, preferred_suppliers: int, watchlist_suppliers: int, average_rating: float}
     */
    public function getSupplierSummary(): array;
}
