<?php

namespace App\Repositories\Dashboard;

use App\Enums\PosOrderStatus;
use App\Enums\ProductionBatchStatus;
use App\Enums\PurchaseOrderStatus;
use App\Models\InventoryItem;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\ProductionBatch;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function getSummary(): array
    {
        return [
            'today_orders' => PosOrder::query()
                ->where('status', PosOrderStatus::Paid->value)
                ->whereDate('paid_at', Carbon::today()->toDateString())
                ->count(),
            'today_sales' => (float) PosOrder::query()
                ->where('status', PosOrderStatus::Paid->value)
                ->whereDate('paid_at', Carbon::today()->toDateString())
                ->sum('total_amount'),
            'month_sales' => (float) PosOrder::query()
                ->where('status', PosOrderStatus::Paid->value)
                ->whereDate('paid_at', '>=', Carbon::now()->startOfMonth()->toDateString())
                ->sum('total_amount'),
            'low_stock_items' => InventoryItem::query()
                ->whereColumn('current_stock', '<=', 'par_level')
                ->count(),
            'critical_items' => InventoryItem::query()
                ->whereColumn('current_stock', '<=', 'reorder_point')
                ->count(),
            'total_inventory_items' => InventoryItem::query()->count(),
            'inventory_value' => (float) InventoryItem::query()
                ->selectRaw('COALESCE(SUM(current_stock * unit_cost), 0) as total_value')
                ->value('total_value'),
            'open_purchase_orders' => PurchaseOrder::query()
                ->whereNotIn('status', [
                    PurchaseOrderStatus::Received->value,
                    PurchaseOrderStatus::Cancelled->value,
                ])
                ->count(),
            'open_purchase_value' => (float) PurchaseOrder::query()
                ->whereNotIn('status', [
                    PurchaseOrderStatus::Received->value,
                    PurchaseOrderStatus::Cancelled->value,
                ])
                ->sum('total_amount'),
            'active_production_batches' => ProductionBatch::query()
                ->whereIn('status', [
                    ProductionBatchStatus::Planned->value,
                    ProductionBatchStatus::InProgress->value,
                ])
                ->count(),
        ];
    }

    public function getMonthlyPerformance(): Collection
    {
        $start = Carbon::now()->startOfYear();
        $months = collect(range(1, 12))->mapWithKeys(fn (int $month): array => [
            $month => [
                'month' => Carbon::create(null, $month, 1)->format('M'),
                'sales' => 0.0,
                'purchases' => 0.0,
            ],
        ]);

        PosOrder::query()
            ->where('status', PosOrderStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '>=', $start->toDateString())
            ->get(['paid_at', 'total_amount'])
            ->each(function (PosOrder $order) use ($months): void {
                $month = $order->paid_at?->month;

                if ($month === null) {
                    return;
                }

                $current = $months->get($month);
                $current['sales'] += (float) $order->total_amount;
                $months->put($month, $current);
            });

        PurchaseOrder::query()
            ->where(function (Builder $query) use ($start): void {
                $query->whereDate('ordered_at', '>=', $start->toDateString())
                    ->orWhere(function (Builder $nested) use ($start): void {
                        $nested->whereNull('ordered_at')
                            ->whereDate('created_at', '>=', $start->toDateString());
                    });
            })
            ->get(['ordered_at', 'created_at', 'total_amount'])
            ->each(function (PurchaseOrder $purchaseOrder) use ($months): void {
                $month = ($purchaseOrder->ordered_at ?? $purchaseOrder->created_at)?->month;

                if ($month === null) {
                    return;
                }

                $current = $months->get($month);
                $current['purchases'] += (float) $purchaseOrder->total_amount;
                $months->put($month, $current);
            });

        return $months->values();
    }

    public function getProductionStatusMix(): Collection
    {
        return ProductionBatch::query()
            ->select(['status', DB::raw('COUNT(*) as value')])
            ->groupBy('status')
            ->get()
            ->map(fn (ProductionBatch $batch): array => [
                'label' => ProductionBatchStatus::tryFrom((string) $batch->status->value)?->label() ?? ucfirst((string) $batch->status),
                'value' => (int) $batch->value,
            ]);
    }

    public function getForecastAlerts(): Collection
    {
        return InventoryItem::query()
            ->where(function (Builder $query): void {
                $query->whereColumn('current_stock', '<=', 'reorder_point')
                    ->orWhere(function (Builder $nested): void {
                        $nested->where('daily_usage_rate', '>', 0)
                            ->whereRaw('(current_stock / daily_usage_rate) <= lead_time_days');
                    });
            })
            ->orderByRaw('CASE WHEN current_stock <= reorder_point THEN 0 ELSE 1 END')
            ->orderBy('current_stock')
            ->limit(4)
            ->get(['sku', 'name', 'current_stock', 'reorder_point', 'unit'])
            ->map(fn (InventoryItem $item): array => [
                'name' => $item->name,
                'sku' => $item->sku,
                'current_stock' => (float) $item->current_stock,
                'reorder_point' => (float) $item->reorder_point,
                'unit' => $item->unit,
                'alert_percent' => (float) $item->reorder_point > 0
                    ? min(100, ((float) $item->current_stock / (float) $item->reorder_point) * 100)
                    : 0,
            ]);
    }

    public function getTopSellingItems(): Collection
    {
        return PosOrderItem::query()
            ->join('pos_orders', 'pos_orders.id', '=', 'pos_order_items.pos_order_id')
            ->where('pos_orders.status', PosOrderStatus::Paid->value)
            ->whereNotNull('pos_orders.paid_at')
            ->whereDate('pos_orders.paid_at', '>=', Carbon::now()->subDays(30)->toDateString())
            ->select([
                'pos_order_items.item_name as name',
                DB::raw('SUM(pos_order_items.quantity) as quantity'),
                DB::raw('SUM(pos_order_items.line_total) as revenue'),
            ])
            ->groupBy('pos_order_items.item_name')
            ->orderByDesc('revenue')
            ->limit(3)
            ->get()
            ->map(fn (PosOrderItem $item): array => [
                'name' => (string) $item->name,
                'quantity' => (float) $item->quantity,
                'revenue' => (float) $item->revenue,
            ]);
    }
}
