<?php

namespace App\Repositories\Sales;

use App\Models\PosOrder;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SalesRepository implements SalesRepositoryInterface
{
    public function paginateSales(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->with(['cashier:id,name', 'items.inventoryItem:id,name'])
            ->latest('paid_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getSummary(array $filters): array
    {
        $query = $this->buildQuery($filters);

        $totalSales = (float) $query->sum('total_amount');
        $totalOrders = $query->count();
        $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        return [
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'average_order_value' => $averageOrderValue,
        ];
    }

    public function getSalesOverTime(array $filters): Collection
    {
        return collect(
            $this->buildQuery($filters)
                ->select([
                    DB::raw('DATE(paid_at) as date'),
                    DB::raw('SUM(total_amount) as total')
                ])
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
        );
    }

    public function getSalesByPaymentMethod(array $filters): Collection
    {
        return collect(
            $this->buildQuery($filters)
                ->select([
                    'payment_method as method',
                    DB::raw('SUM(total_amount) as total'),
                    DB::raw('COUNT(*) as count')
                ])
                ->groupBy('payment_method')
                ->get()
        );
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function buildQuery(array $filters): Builder
    {
        $query = PosOrder::query()->whereNotNull('paid_at');

        if (! empty($filters['start_date'])) {
            $query->whereDate('paid_at', '>=', Carbon::parse($filters['start_date'])->toDateString());
        }

        if (! empty($filters['end_date'])) {
            $query->whereDate('paid_at', '<=', Carbon::parse($filters['end_date'])->toDateString());
        }

        if (! empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (! empty($filters['search'])) {
            $query->where(function (Builder $q) use ($filters) {
                $q->where('order_number', 'like', "%{$filters['search']}%")
                  ->orWhere('customer_name', 'like', "%{$filters['search']}%");
            });
        }

        return $query;
    }
}
