<?php

namespace App\Services\Report;

use App\Repositories\Report\ReportsRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportsService
{
    public function __construct(private readonly ReportsRepositoryInterface $reportsRepository) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getDashboardData(array $filters): array
    {
        $filters = $this->normalizeFilters($filters);
        $salesSummary = $this->reportsRepository->getSalesSummary($filters);
        $inventorySummary = $this->reportsRepository->getInventorySummary();
        $productionSummary = $this->reportsRepository->getProductionSummary($filters);
        $procurementSummary = $this->reportsRepository->getProcurementSummary($filters);
        $supplierSummary = $this->reportsRepository->getSupplierSummary();

        return [
            'filters' => $filters,
            'summary' => [
                'sales' => $salesSummary,
                'inventory' => $inventorySummary,
                'production' => $productionSummary,
                'procurement' => $procurementSummary,
                'suppliers' => $supplierSummary,
            ],
            'cards' => $this->buildExecutiveCards(
                $salesSummary,
                $inventorySummary,
                $productionSummary,
                $procurementSummary,
            ),
            'charts' => [
                'sales_trend' => $this->fillMissingSalesDates(
                    $this->reportsRepository->getSalesTrend($filters),
                    Carbon::parse((string) $filters['start_date']),
                    Carbon::parse((string) $filters['end_date']),
                ),
                'payment_methods' => $this->reportsRepository->getPaymentMethodBreakdown($filters),
                'top_selling_items' => $this->reportsRepository->getTopSellingItems($filters),
                'inventory_value_by_category' => $this->reportsRepository->getInventoryValueByCategory(),
                'production_statuses' => $this->reportsRepository->getProductionStatusBreakdown($filters),
                'procurement_statuses' => $this->reportsRepository->getProcurementStatusBreakdown($filters),
            ],
            'risk_items' => $this->reportsRepository->getStockRiskItems(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{start_date: string, end_date: string, focus: string}
     */
    private function normalizeFilters(array $filters): array
    {
        return [
            'start_date' => (string) ($filters['start_date'] ?? Carbon::now()->subDays(30)->toDateString()),
            'end_date' => (string) ($filters['end_date'] ?? Carbon::now()->toDateString()),
            'focus' => (string) ($filters['focus'] ?? 'overview'),
        ];
    }

    /**
     * @param  array{total_sales: float, total_orders: int, average_order_value: float}  $salesSummary
     * @param  array{total_items: int, low_stock_items: int, watchlist_items: int, menu_items: int, inventory_value: float}  $inventorySummary
     * @param  array{planned_batches: int, active_batches: int, completed_batches: int, completed_quantity: float, waste_quantity: float}  $productionSummary
     * @param  array{open_orders: int, received_orders: int, cancelled_orders: int, purchase_value: float, expected_this_week: int}  $procurementSummary
     * @return array<int, array{label: string, value: float|int, helper: string, tone: string, format: string}>
     */
    private function buildExecutiveCards(
        array $salesSummary,
        array $inventorySummary,
        array $productionSummary,
        array $procurementSummary,
    ): array {
        return [
            [
                'label' => 'Gross Revenue',
                'value' => $salesSummary['total_sales'],
                'helper' => $salesSummary['total_orders'].' paid POS orders',
                'tone' => 'green',
                'format' => 'currency',
            ],
            [
                'label' => 'Inventory Value',
                'value' => $inventorySummary['inventory_value'],
                'helper' => $inventorySummary['low_stock_items'].' items below reorder point',
                'tone' => 'amber',
                'format' => 'currency',
            ],
            [
                'label' => 'Production Output',
                'value' => $productionSummary['completed_quantity'],
                'helper' => $productionSummary['completed_batches'].' completed batches',
                'tone' => 'blue',
                'format' => 'number',
            ],
            [
                'label' => 'Purchase Exposure',
                'value' => $procurementSummary['purchase_value'],
                'helper' => $procurementSummary['open_orders'].' open purchase orders',
                'tone' => 'red',
                'format' => 'currency',
            ],
        ];
    }

    /**
     * @param  Collection<int, array{date: string, total: float, orders: int}>  $data
     * @return Collection<int, array{date: string, total: float, orders: int}>
     */
    private function fillMissingSalesDates(Collection $data, Carbon $startDate, Carbon $endDate): Collection
    {
        $keyedData = $data->keyBy('date');
        $filledData = collect();

        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            $dateString = $date->toDateString();
            $day = $keyedData->get($dateString);

            $filledData->push([
                'date' => $dateString,
                'total' => $day !== null ? (float) $day['total'] : 0,
                'orders' => $day !== null ? (int) $day['orders'] : 0,
            ]);
        }

        return $filledData;
    }
}
