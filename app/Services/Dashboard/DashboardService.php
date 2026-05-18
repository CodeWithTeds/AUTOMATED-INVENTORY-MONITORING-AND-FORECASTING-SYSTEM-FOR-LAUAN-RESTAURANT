<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\DashboardRepositoryInterface;
use App\Services\Forecasting\ForecastingService;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    public function __construct(
        private readonly DashboardRepositoryInterface $dashboardRepository,
        private readonly ForecastingService $forecastingService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getDashboardData(): array
    {
        $summary = $this->dashboardRepository->getSummary();
        $monthlyPerformance = $this->scaleMonthlyPerformance($this->dashboardRepository->getMonthlyPerformance());
        $productionStatusMix = $this->decorateMix($this->dashboardRepository->getProductionStatusMix());
        $topSellingItems = $this->dashboardRepository->getTopSellingItems();

        return [
            'summary' => $summary,
            'statCards' => $this->buildStatCards($summary, $monthlyPerformance),
            'monthlyPerformance' => $monthlyPerformance,
            'productionStatusMix' => $productionStatusMix,
            'forecastAlerts' => $this->buildForecastAlerts(),
            'topSellingItems' => $topSellingItems,
            'quickOverviewMix' => $this->buildQuickOverviewMix($topSellingItems),
            'dateRangeLabel' => Carbon::now()->startOfMonth()->format('d M Y').' - '.Carbon::now()->format('d M Y'),
        ];
    }

    /**
     * @param  array<string, int|float>  $summary
     * @param  Collection<int, array<string, mixed>>  $monthlyPerformance
     * @return array<int, array<string, mixed>>
     */
    private function buildStatCards(array $summary, Collection $monthlyPerformance): array
    {
        return [
            [
                'label' => 'Low Stock',
                'value' => (string) $summary['low_stock_items'],
                'delta' => $summary['critical_items'].' critical',
                'tone' => $summary['critical_items'] > 0 ? 'negative' : 'positive',
                'bars' => $this->sampleBars($monthlyPerformance, 'purchases_height'),
            ],
            [
                'label' => 'Critical Items',
                'value' => (string) $summary['critical_items'],
                'delta' => $summary['critical_items'] > 0 ? 'Action' : 'Clear',
                'tone' => $summary['critical_items'] > 0 ? 'negative' : 'positive',
                'bars' => $this->sampleBars($monthlyPerformance, 'purchases_height'),
            ],
            [
                'label' => 'Total Inventory',
                'value' => (string) $summary['total_inventory_items'],
                'delta' => '₱'.number_format((float) $summary['inventory_value'], 0),
                'tone' => 'positive',
                'bars' => $this->sampleBars($monthlyPerformance, 'sales_height'),
            ],
            [
                'label' => 'Total Earnings',
                'value' => '₱'.number_format((float) $summary['month_sales'], 0),
                'delta' => $summary['today_orders'].' today',
                'tone' => 'positive',
                'bars' => $this->sampleBars($monthlyPerformance, 'sales_height'),
            ],
        ];
    }

    /**
     * @param  Collection<int, array{month: string, sales: float, purchases: float}>  $monthlyPerformance
     * @return Collection<int, array{month: string, sales: float, purchases: float, sales_height: float, purchases_height: float}>
     */
    private function scaleMonthlyPerformance(Collection $monthlyPerformance): Collection
    {
        $maxValue = max(
            1,
            (float) $monthlyPerformance->max('sales'),
            (float) $monthlyPerformance->max('purchases'),
        );

        return $monthlyPerformance->map(fn (array $month): array => [
            ...$month,
            'sales_height' => $month['sales'] > 0 ? max(8, ($month['sales'] / $maxValue) * 100) : 0,
            'purchases_height' => $month['purchases'] > 0 ? max(8, ($month['purchases'] / $maxValue) * 100) : 0,
        ]);
    }

    /**
     * @param  Collection<int, array{label: string, value: int}>  $items
     * @return Collection<int, array{label: string, value: int, percent: int, color: string}>
     */
    private function decorateMix(Collection $items): Collection
    {
        $colors = ['#faa340', '#facc15', '#1f63ed', '#2ec66d'];
        $total = max(1, (int) $items->sum('value'));

        return $items->values()->map(fn (array $item, int $index): array => [
            ...$item,
            'percent' => (int) round(($item['value'] / $total) * 100),
            'color' => $colors[$index % count($colors)],
        ]);
    }

    /**
     * @param  Collection<int, array{name: string, quantity: float, revenue: float}>  $items
     * @return Collection<int, array{label: string, value: int, percent: int, color: string}>
     */
    private function buildQuickOverviewMix(Collection $items): Collection
    {
        $colors = ['#faa340', '#facc15', '#1f63ed'];
        $total = max(1, (float) $items->sum('revenue'));

        return $items->values()->map(fn (array $item, int $index): array => [
            'label' => $item['name'],
            'value' => (int) round($item['quantity']),
            'percent' => (int) round(($item['revenue'] / $total) * 100),
            'color' => $colors[$index % count($colors)],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function buildForecastAlerts(): Collection
    {
        $forecasting = $this->forecastingService->getDashboardData([
            'horizon_days' => 7,
            'risk' => 'all',
        ]);

        return collect($forecasting['items'])
            ->filter(fn (array $item): bool => in_array($item['risk_level'], ['critical', 'watch'], true))
            ->take(4)
            ->map(function (array $item): array {
                $coverageTarget = max(
                    1,
                    (float) $item['forecast_quantity'],
                    (float) $item['reorder_point'],
                );

                return [
                    'name' => $item['name'],
                    'sku' => $item['sku'],
                    'current_stock' => (float) $item['current_stock'],
                    'reorder_point' => (float) $item['reorder_point'],
                    'unit' => $item['unit'],
                    'forecast_quantity' => (float) $item['forecast_quantity'],
                    'suggested_restock_quantity' => (float) $item['suggested_restock_quantity'],
                    'days_of_cover' => $item['days_of_cover'],
                    'risk_level' => $item['risk_level'],
                    'alert_percent' => min(100, max(0, ((float) $item['current_stock'] / $coverageTarget) * 100)),
                ];
            })
            ->values();
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $monthlyPerformance
     * @return array<int, float>
     */
    private function sampleBars(Collection $monthlyPerformance, string $key): array
    {
        $values = $monthlyPerformance->pluck($key)->filter(fn (float|int $height): bool => $height > 0)->values();

        if ($values->isEmpty()) {
            return [28, 52, 40, 72, 48, 66, 38];
        }

        return $values->pad(7, 16)->take(7)->all();
    }
}
