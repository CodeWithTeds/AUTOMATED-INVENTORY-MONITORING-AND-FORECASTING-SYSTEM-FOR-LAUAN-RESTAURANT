<?php

namespace App\Services\Forecasting;

use App\Enums\InventoryCategory;
use App\Repositories\Forecasting\ForecastingRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ForecastingService
{
    public function __construct(private readonly ForecastingRepositoryInterface $forecastingRepository) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getDashboardData(array $filters): array
    {
        $filters = $this->normalizeFilters($filters);
        $rangeDays = $this->dateRangeDays($filters);
        $recentDays = min(7, $rangeDays);
        $forecastItems = $this->buildForecastItems($filters, $rangeDays, $recentDays);

        return [
            'filters' => $filters,
            'summary' => $this->buildSummary($forecastItems),
            'items' => $forecastItems->values(),
            'charts' => [
                'demand_trend' => $this->fillMissingDemandDates(
                    $this->forecastingRepository->getDemandTrend($filters),
                    Carbon::parse((string) $filters['start_date']),
                    Carbon::parse((string) $filters['end_date']),
                ),
                'category_demand' => $this->forecastingRepository->getCategoryDemand($filters),
                'risk_mix' => $this->buildRiskMix($forecastItems),
            ],
            'categoryOptions' => $this->categoryOptions(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{start_date: string, end_date: string, horizon_days: int, category: string, risk: string}
     */
    private function normalizeFilters(array $filters): array
    {
        return [
            'start_date' => (string) ($filters['start_date'] ?? Carbon::now()->subDays(30)->toDateString()),
            'end_date' => (string) ($filters['end_date'] ?? Carbon::now()->toDateString()),
            'horizon_days' => (int) ($filters['horizon_days'] ?? 14),
            'category' => (string) ($filters['category'] ?? ''),
            'risk' => (string) ($filters['risk'] ?? 'all'),
        ];
    }

    /**
     * @param  array{start_date: string, end_date: string, horizon_days: int, category: string, risk: string}  $filters
     * @return Collection<int, array<string, mixed>>
     */
    private function buildForecastItems(array $filters, int $rangeDays, int $recentDays): Collection
    {
        return $this->forecastingRepository
            ->getForecastItems($filters)
            ->map(function (array $item) use ($filters, $rangeDays, $recentDays): array {
                $averageDailyDemand = $item['sold_quantity'] / $rangeDays;
                $recentDailyDemand = $item['recent_quantity'] / $recentDays;
                $weightedDailyDemand = ($averageDailyDemand * 0.65) + ($recentDailyDemand * 0.35);
                $forecastQuantity = $weightedDailyDemand * $filters['horizon_days'];
                $daysOfCover = $weightedDailyDemand > 0 ? $item['current_stock'] / $weightedDailyDemand : null;
                $suggestedRestock = max(
                    0,
                    ceil($forecastQuantity + $item['reorder_point'] - $item['current_stock']),
                );
                $trendPercent = $averageDailyDemand > 0
                    ? (($recentDailyDemand - $averageDailyDemand) / $averageDailyDemand) * 100
                    : ($recentDailyDemand > 0 ? 100 : 0);
                $riskLevel = $this->riskLevel($item, $forecastQuantity, $daysOfCover, $trendPercent);

                return [
                    ...$item,
                    'average_daily_demand' => round($averageDailyDemand, 2),
                    'recent_daily_demand' => round($recentDailyDemand, 2),
                    'weighted_daily_demand' => round($weightedDailyDemand, 2),
                    'forecast_quantity' => round($forecastQuantity, 2),
                    'forecast_revenue' => round($forecastQuantity * $item['selling_price'], 2),
                    'days_of_cover' => $daysOfCover !== null ? round($daysOfCover, 1) : null,
                    'suggested_restock_quantity' => $suggestedRestock,
                    'trend_percent' => round($trendPercent, 1),
                    'confidence' => $this->confidenceLevel($item['sold_quantity'], $item['order_count']),
                    'risk_level' => $riskLevel,
                ];
            })
            ->filter(fn (array $item): bool => $filters['risk'] === 'all' || $item['risk_level'] === $filters['risk'])
            ->sortBy([
                fn (array $item): int => ['critical' => 0, 'watch' => 1, 'stable' => 2][$item['risk_level']] ?? 3,
                fn (array $item): float => -$item['forecast_quantity'],
            ])
            ->values();
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $items
     * @return array<string, mixed>
     */
    private function buildSummary(Collection $items): array
    {
        return [
            'total_forecast_units' => round((float) $items->sum('forecast_quantity'), 2),
            'forecast_revenue' => round((float) $items->sum('forecast_revenue'), 2),
            'critical_items' => $items->where('risk_level', 'critical')->count(),
            'watch_items' => $items->where('risk_level', 'watch')->count(),
            'restock_units' => round((float) $items->sum('suggested_restock_quantity'), 2),
            'tracked_items' => $items->count(),
        ];
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $items
     * @return array<int, array{risk: string, count: int}>
     */
    private function buildRiskMix(Collection $items): array
    {
        return collect(['critical', 'watch', 'stable'])
            ->map(fn (string $risk): array => [
                'risk' => ucfirst($risk),
                'count' => $items->where('risk_level', $risk)->count(),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function riskLevel(array $item, float $forecastQuantity, ?float $daysOfCover, float $trendPercent): string
    {
        if (
            $item['current_stock'] <= $item['reorder_point']
            || $item['current_stock'] < $forecastQuantity
            || ($daysOfCover !== null && $daysOfCover <= max(1, $item['lead_time_days']))
        ) {
            return 'critical';
        }

        if ($item['current_stock'] <= ($forecastQuantity * 1.25) || $trendPercent > 25) {
            return 'watch';
        }

        return 'stable';
    }

    private function confidenceLevel(float $soldQuantity, int $orderCount): string
    {
        if ($soldQuantity >= 20 || $orderCount >= 10) {
            return 'high';
        }

        if ($soldQuantity >= 5 || $orderCount >= 3) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * @param  array{start_date: string, end_date: string}  $filters
     */
    private function dateRangeDays(array $filters): int
    {
        return max(
            1,
            Carbon::parse($filters['start_date'])->diffInDays(Carbon::parse($filters['end_date'])) + 1,
        );
    }

    /**
     * @param  Collection<int, array{date: string, quantity: float, revenue: float}>  $data
     * @return Collection<int, array{date: string, quantity: float, revenue: float}>
     */
    private function fillMissingDemandDates(Collection $data, Carbon $startDate, Carbon $endDate): Collection
    {
        $keyedData = $data->keyBy('date');
        $filledData = collect();

        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            $dateString = $date->toDateString();
            $day = $keyedData->get($dateString);

            $filledData->push([
                'date' => $dateString,
                'quantity' => $day !== null ? (float) $day['quantity'] : 0,
                'revenue' => $day !== null ? (float) $day['revenue'] : 0,
            ]);
        }

        return $filledData;
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function categoryOptions(): array
    {
        return collect(InventoryCategory::cases())
            ->map(fn (InventoryCategory $category): array => [
                'label' => $category->label(),
                'value' => $category->value,
            ])
            ->all();
    }
}
