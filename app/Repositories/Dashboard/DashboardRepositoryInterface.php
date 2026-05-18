<?php

namespace App\Repositories\Dashboard;

use Illuminate\Support\Collection;

interface DashboardRepositoryInterface
{
    /**
     * @return array<string, int|float>
     */
    public function getSummary(): array;

    /**
     * @return Collection<int, array{month: string, sales: float, purchases: float}>
     */
    public function getMonthlyPerformance(): Collection;

    /**
     * @return Collection<int, array{label: string, value: int}>
     */
    public function getProductionStatusMix(): Collection;

    /**
     * @return Collection<int, array{name: string, sku: string, current_stock: float, reorder_point: float, unit: string, alert_percent: float}>
     */
    public function getForecastAlerts(): Collection;

    /**
     * @return Collection<int, array{name: string, quantity: float, revenue: float}>
     */
    public function getTopSellingItems(): Collection;
}
