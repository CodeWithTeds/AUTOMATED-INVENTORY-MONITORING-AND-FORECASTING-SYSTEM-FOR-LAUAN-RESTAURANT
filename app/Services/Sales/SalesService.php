<?php

namespace App\Services\Sales;

use App\Repositories\Sales\SalesRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SalesService
{
    public function __construct(private readonly SalesRepositoryInterface $salesRepository) {}

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getSalesDashboardData(array $filters): array
    {
        // Default to last 30 days if no date filter is provided
        if (empty($filters['start_date']) && empty($filters['end_date'])) {
            $filters['start_date'] = Carbon::now()->subDays(30)->toDateString();
            $filters['end_date'] = Carbon::now()->toDateString();
        }

        $sales = $this->salesRepository->paginateSales($filters);
        $summary = $this->salesRepository->getSummary($filters);
        $salesOverTime = $this->salesRepository->getSalesOverTime($filters);
        $salesByPaymentMethod = $this->salesRepository->getSalesByPaymentMethod($filters);

        // Fill missing dates in sales over time to make the chart look continuous
        $salesOverTimeChart = $this->fillMissingDates(
            $salesOverTime, 
            Carbon::parse($filters['start_date']), 
            Carbon::parse($filters['end_date'] ?? now()->toDateString())
        );

        return [
            'sales' => $sales,
            'summary' => $summary,
            'charts' => [
                'sales_over_time' => $salesOverTimeChart,
                'sales_by_payment_method' => $salesByPaymentMethod,
            ],
            'filters' => $filters,
        ];
    }

    /**
     * @param Collection<int, array{date: string, total: float}> $data
     * @return Collection<int, array{date: string, total: float}>
     */
    private function fillMissingDates(Collection $data, Carbon $startDate, Carbon $endDate): Collection
    {
        $keyedData = $data->keyBy('date');
        $filledData = collect();

        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            $dateString = $date->toDateString();
            
            $filledData->push([
                'date' => $dateString,
                'total' => $keyedData->has($dateString) ? (float) $keyedData->get($dateString)['total'] : 0,
                'count' => $keyedData->has($dateString) ? (int) $keyedData->get($dateString)['count'] : 0,
            ]);
        }

        return $filledData;
    }
}
