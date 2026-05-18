<?php

namespace App\Repositories\Forecasting;

use App\Enums\InventoryCategory;
use App\Enums\PosOrderStatus;
use App\Models\InventoryItem;
use App\Models\PosOrderItem;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ForecastingRepository implements ForecastingRepositoryInterface
{
    public function getForecastItems(array $filters): Collection
    {
        $sales = $this->salesAggregateQuery($filters)
            ->get()
            ->keyBy('inventory_item_id');

        $recentSales = $this->salesAggregateQuery(array_merge($filters, [
            'start_date' => Carbon::parse((string) $filters['end_date'])->subDays(6)->toDateString(),
        ]))
            ->get()
            ->keyBy('inventory_item_id');

        return InventoryItem::query()
            ->where(function (Builder $query) use ($sales): void {
                $query->where('is_menu_item', true)
                    ->orWhereIn('id', $sales->keys());
            })
            ->when(! empty($filters['category']), fn (Builder $query): Builder => $query->where('category', $filters['category']))
            ->orderBy('name')
            ->get([
                'id',
                'sku',
                'name',
                'category',
                'unit',
                'current_stock',
                'reorder_point',
                'reorder_quantity',
                'lead_time_days',
                'selling_price',
                'status',
            ])
            ->map(function (InventoryItem $item) use ($sales, $recentSales): array {
                $sold = $sales->get($item->id);
                $recent = $recentSales->get($item->id);

                return [
                    'id' => $item->id,
                    'sku' => $item->sku,
                    'name' => $item->name,
                    'category' => $item->category instanceof InventoryCategory ? $item->category->label() : (string) $item->category,
                    'category_value' => $item->category instanceof InventoryCategory ? $item->category->value : (string) $item->category,
                    'unit' => $item->unit,
                    'current_stock' => (float) $item->current_stock,
                    'reorder_point' => (float) $item->reorder_point,
                    'reorder_quantity' => (float) $item->reorder_quantity,
                    'lead_time_days' => (int) $item->lead_time_days,
                    'selling_price' => (float) $item->selling_price,
                    'sold_quantity' => $sold !== null ? (float) $sold->quantity : 0,
                    'sales_revenue' => $sold !== null ? (float) $sold->revenue : 0,
                    'order_count' => $sold !== null ? (int) $sold->orders : 0,
                    'recent_quantity' => $recent !== null ? (float) $recent->quantity : 0,
                ];
            });
    }

    public function getDemandTrend(array $filters): Collection
    {
        $query = PosOrderItem::query()
            ->join('pos_orders', 'pos_orders.id', '=', 'pos_order_items.pos_order_id')
            ->where('pos_orders.status', PosOrderStatus::Paid->value)
            ->whereNotNull('pos_orders.paid_at');

        if (! empty($filters['category'])) {
            $query->join('inventory_items', 'inventory_items.id', '=', 'pos_order_items.inventory_item_id')
                ->where('inventory_items.category', $filters['category']);
        }

        $this->applyDateRange($query, $filters, 'pos_orders.paid_at');

        return $query
            ->select([
                DB::raw('DATE(pos_orders.paid_at) as date'),
                DB::raw('SUM(pos_order_items.quantity) as quantity'),
                DB::raw('SUM(pos_order_items.line_total) as revenue'),
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn (PosOrderItem $row): array => [
                'date' => (string) $row->date,
                'quantity' => (float) $row->quantity,
                'revenue' => (float) $row->revenue,
            ]);
    }

    public function getCategoryDemand(array $filters): Collection
    {
        $query = PosOrderItem::query()
            ->join('pos_orders', 'pos_orders.id', '=', 'pos_order_items.pos_order_id')
            ->join('inventory_items', 'inventory_items.id', '=', 'pos_order_items.inventory_item_id')
            ->where('pos_orders.status', PosOrderStatus::Paid->value)
            ->whereNotNull('pos_orders.paid_at');

        if (! empty($filters['category'])) {
            $query->where('inventory_items.category', $filters['category']);
        }

        $this->applyDateRange($query, $filters, 'pos_orders.paid_at');

        return $query
            ->select([
                'inventory_items.category',
                DB::raw('SUM(pos_order_items.quantity) as quantity'),
                DB::raw('SUM(pos_order_items.line_total) as revenue'),
            ])
            ->groupBy('inventory_items.category')
            ->orderByDesc('quantity')
            ->get()
            ->map(fn (PosOrderItem $row): array => [
                'category' => InventoryCategory::tryFrom((string) $row->category)?->label() ?? ucfirst((string) $row->category),
                'quantity' => (float) $row->quantity,
                'revenue' => (float) $row->revenue,
            ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function salesAggregateQuery(array $filters): Builder
    {
        $query = PosOrderItem::query()
            ->join('pos_orders', 'pos_orders.id', '=', 'pos_order_items.pos_order_id')
            ->where('pos_orders.status', PosOrderStatus::Paid->value)
            ->whereNotNull('pos_orders.paid_at')
            ->whereNotNull('pos_order_items.inventory_item_id');

        $this->applyDateRange($query, $filters, 'pos_orders.paid_at');

        return $query
            ->select([
                'pos_order_items.inventory_item_id',
                DB::raw('SUM(pos_order_items.quantity) as quantity'),
                DB::raw('SUM(pos_order_items.line_total) as revenue'),
                DB::raw('COUNT(DISTINCT pos_orders.id) as orders'),
            ])
            ->groupBy('pos_order_items.inventory_item_id');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyDateRange(Builder $query, array $filters, string $column): void
    {
        if (! empty($filters['start_date'])) {
            $query->whereDate($column, '>=', Carbon::parse((string) $filters['start_date'])->toDateString());
        }

        if (! empty($filters['end_date'])) {
            $query->whereDate($column, '<=', Carbon::parse((string) $filters['end_date'])->toDateString());
        }
    }
}
