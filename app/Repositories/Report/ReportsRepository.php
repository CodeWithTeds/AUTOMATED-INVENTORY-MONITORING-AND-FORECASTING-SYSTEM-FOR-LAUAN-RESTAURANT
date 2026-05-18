<?php

namespace App\Repositories\Report;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use App\Enums\ProductionBatchStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\SupplierStatus;
use App\Models\InventoryItem;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\ProductionBatch;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportsRepository implements ReportsRepositoryInterface
{
    public function getSalesSummary(array $filters): array
    {
        $query = $this->salesQuery($filters);
        $totalSales = (float) $query->sum('total_amount');
        $totalOrders = $this->salesQuery($filters)->count();

        return [
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'average_order_value' => $totalOrders > 0 ? $totalSales / $totalOrders : 0,
        ];
    }

    public function getSalesTrend(array $filters): Collection
    {
        return $this->salesQuery($filters)
            ->select([
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(total_amount) as total'),
                DB::raw('COUNT(*) as orders'),
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn (PosOrder $row): array => [
                'date' => (string) $row->date,
                'total' => (float) $row->total,
                'orders' => (int) $row->orders,
            ]);
    }

    public function getPaymentMethodBreakdown(array $filters): Collection
    {
        return $this->salesQuery($filters)
            ->select([
                'payment_method as method',
                DB::raw('SUM(total_amount) as total'),
                DB::raw('COUNT(*) as orders'),
            ])
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get()
            ->map(fn (PosOrder $row): array => [
                'method' => PosPaymentMethod::tryFrom((string) $row->method)?->label() ?? ucfirst((string) $row->method),
                'total' => (float) $row->total,
                'orders' => (int) $row->orders,
            ]);
    }

    public function getTopSellingItems(array $filters): Collection
    {
        $query = PosOrderItem::query()
            ->join('pos_orders', 'pos_orders.id', '=', 'pos_order_items.pos_order_id')
            ->where('pos_orders.status', PosOrderStatus::Paid->value)
            ->whereNotNull('pos_orders.paid_at');

        $this->applyQualifiedDateRange($query, $filters, 'pos_orders.paid_at');

        return $query
            ->select([
                'pos_order_items.item_name as name',
                DB::raw('SUM(pos_order_items.quantity) as quantity'),
                DB::raw('SUM(pos_order_items.line_total) as total'),
            ])
            ->groupBy('pos_order_items.item_name')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn (PosOrderItem $row): array => [
                'name' => (string) $row->name,
                'quantity' => (float) $row->quantity,
                'total' => (float) $row->total,
            ]);
    }

    public function getInventorySummary(): array
    {
        return [
            'total_items' => InventoryItem::query()->count(),
            'low_stock_items' => InventoryItem::query()
                ->whereColumn('current_stock', '<=', 'reorder_point')
                ->count(),
            'watchlist_items' => InventoryItem::query()
                ->where('status', InventoryItemStatus::Watchlist->value)
                ->count(),
            'menu_items' => InventoryItem::query()
                ->where('is_menu_item', true)
                ->count(),
            'inventory_value' => (float) InventoryItem::query()
                ->selectRaw('COALESCE(SUM(current_stock * unit_cost), 0) as inventory_value')
                ->value('inventory_value'),
        ];
    }

    public function getStockRiskItems(): Collection
    {
        return InventoryItem::query()
            ->where(function (Builder $query): void {
                $query->whereColumn('current_stock', '<=', 'reorder_point')
                    ->orWhereDate('expiration_date', '<=', Carbon::now()->addDays(7)->toDateString());
            })
            ->orderByRaw('CASE WHEN current_stock <= reorder_point THEN 0 ELSE 1 END')
            ->orderBy('expiration_date')
            ->limit(6)
            ->get(['sku', 'name', 'category', 'current_stock', 'reorder_point', 'unit', 'expiration_date'])
            ->map(fn (InventoryItem $item): array => [
                'name' => $item->name,
                'sku' => $item->sku,
                'category' => $item->category instanceof InventoryCategory ? $item->category->label() : (string) $item->category,
                'current_stock' => (float) $item->current_stock,
                'reorder_point' => (float) $item->reorder_point,
                'unit' => $item->unit,
                'expiration_date' => $item->expiration_date?->toDateString(),
            ]);
    }

    public function getInventoryValueByCategory(): Collection
    {
        return InventoryItem::query()
            ->select([
                'category',
                DB::raw('COALESCE(SUM(current_stock * unit_cost), 0) as value'),
                DB::raw('COUNT(*) as items'),
            ])
            ->groupBy('category')
            ->orderByDesc('value')
            ->get()
            ->map(fn (InventoryItem $row): array => [
                'category' => $row->category instanceof InventoryCategory ? $row->category->label() : (string) $row->category,
                'value' => (float) $row->value,
                'items' => (int) $row->items,
            ]);
    }

    public function getProductionSummary(array $filters): array
    {
        return [
            'planned_batches' => $this->productionQuery($filters)
                ->where('status', ProductionBatchStatus::Planned->value)
                ->count(),
            'active_batches' => $this->productionQuery($filters)
                ->where('status', ProductionBatchStatus::InProgress->value)
                ->count(),
            'completed_batches' => $this->productionQuery($filters)
                ->where('status', ProductionBatchStatus::Completed->value)
                ->count(),
            'completed_quantity' => (float) $this->productionQuery($filters)->sum('completed_quantity'),
            'waste_quantity' => (float) $this->productionQuery($filters)->sum('waste_quantity'),
        ];
    }

    public function getProductionStatusBreakdown(array $filters): Collection
    {
        return $this->productionQuery($filters)
            ->select(['status', DB::raw('COUNT(*) as count')])
            ->groupBy('status')
            ->get()
            ->map(fn (ProductionBatch $row): array => [
                'status' => ProductionBatchStatus::tryFrom((string) $row->status->value)?->label() ?? ucfirst((string) $row->status),
                'count' => (int) $row->count,
            ]);
    }

    public function getProcurementSummary(array $filters): array
    {
        return [
            'open_orders' => $this->purchaseOrderQuery($filters)
                ->whereIn('status', [
                    PurchaseOrderStatus::Pending->value,
                    PurchaseOrderStatus::Draft->value,
                    PurchaseOrderStatus::Ordered->value,
                    PurchaseOrderStatus::PartiallyReceived->value,
                ])
                ->count(),
            'received_orders' => $this->purchaseOrderQuery($filters)
                ->where('status', PurchaseOrderStatus::Received->value)
                ->count(),
            'cancelled_orders' => $this->purchaseOrderQuery($filters)
                ->where('status', PurchaseOrderStatus::Cancelled->value)
                ->count(),
            'purchase_value' => (float) $this->purchaseOrderQuery($filters)->sum('total_amount'),
            'expected_this_week' => PurchaseOrder::query()
                ->whereDate('expected_at', '>=', Carbon::now()->toDateString())
                ->whereDate('expected_at', '<=', Carbon::now()->addWeek()->toDateString())
                ->count(),
        ];
    }

    public function getProcurementStatusBreakdown(array $filters): Collection
    {
        return $this->purchaseOrderQuery($filters)
            ->select([
                'status',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as total'),
            ])
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn (PurchaseOrder $row): array => [
                'status' => PurchaseOrderStatus::tryFrom((string) $row->status->value)?->label() ?? ucfirst((string) $row->status),
                'count' => (int) $row->count,
                'total' => (float) $row->total,
            ]);
    }

    public function getSupplierSummary(): array
    {
        return [
            'total_suppliers' => Supplier::query()->count(),
            'active_suppliers' => Supplier::query()
                ->whereIn('status', [SupplierStatus::Active->value, SupplierStatus::Preferred->value])
                ->count(),
            'preferred_suppliers' => Supplier::query()
                ->where('status', SupplierStatus::Preferred->value)
                ->count(),
            'watchlist_suppliers' => Supplier::query()
                ->where('status', SupplierStatus::Watchlist->value)
                ->count(),
            'average_rating' => (float) Supplier::query()->avg('rating'),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function salesQuery(array $filters): Builder
    {
        $query = PosOrder::query()
            ->where('status', PosOrderStatus::Paid->value)
            ->whereNotNull('paid_at');

        $this->applyDateRange($query, $filters, 'paid_at');

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function productionQuery(array $filters): Builder
    {
        $query = ProductionBatch::query();

        $this->applyDateRange($query, $filters, 'created_at');

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function purchaseOrderQuery(array $filters): Builder
    {
        $query = PurchaseOrder::query();

        $this->applyDateRange($query, $filters, 'created_at');

        return $query;
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

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyQualifiedDateRange(Builder $query, array $filters, string $column): void
    {
        $this->applyDateRange($query, $filters, $column);
    }
}
