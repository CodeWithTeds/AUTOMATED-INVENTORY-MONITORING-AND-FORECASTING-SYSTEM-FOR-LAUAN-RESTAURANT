<?php

namespace App\Repositories\Forecasting;

use Illuminate\Support\Collection;

interface ForecastingRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array<string, mixed>>
     */
    public function getForecastItems(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{date: string, quantity: float, revenue: float}>
     */
    public function getDemandTrend(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array{category: string, quantity: float, revenue: float}>
     */
    public function getCategoryDemand(array $filters): Collection;
}
