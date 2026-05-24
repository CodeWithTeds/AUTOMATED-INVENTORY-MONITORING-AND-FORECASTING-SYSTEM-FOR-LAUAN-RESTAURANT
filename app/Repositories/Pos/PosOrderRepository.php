<?php

namespace App\Repositories\Pos;

use App\Enums\InventoryItemStatus;
use App\Enums\PosOrderStatus;
use App\Enums\ProductionBatchStatus;
use App\Models\InventoryItem;
use App\Models\PosOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PosOrderRepository implements PosOrderRepositoryInterface
{
    /**
     * @return Collection<int, InventoryItem>
     */
    public function sellableProducts(): Collection
    {
        return $this->sellableProductQuery()
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  array<int, int>  $ids
     * @return Collection<int, InventoryItem>
     */
    public function sellableProductsForCheckout(array $ids): Collection
    {
        return $this->sellableProductQuery()
            ->whereIn('id', $ids)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
    }

    public function nextOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $latestNumber = PosOrder::query()
            ->where('order_number', 'like', "POS-{$date}-%")
            ->pluck('order_number')
            ->reduce(function (int $highest, string $orderNumber) use ($date): int {
                if (preg_match("/^POS-{$date}-(\\d+)$/", $orderNumber, $matches) !== 1) {
                    return $highest;
                }

                return max($highest, (int) $matches[1]);
            }, 0);

        return sprintf('POS-%s-%04d', $date, $latestNumber + 1);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): PosOrder
    {
        return PosOrder::query()->create($attributes);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function createItems(PosOrder $order, array $items): void
    {
        $order->items()->createMany($items);
    }

    public function findPaidForVoid(int $id): PosOrder
    {
        $order = PosOrder::query()
            ->where('status', PosOrderStatus::Paid->value)
            ->lockForUpdate()
            ->findOrFail($id);

        return $order->load('items.inventoryItem');
    }

    public function void(PosOrder $order, string $notes): bool
    {
        return $order->update([
            'status' => PosOrderStatus::Voided,
            'notes' => trim(implode(PHP_EOL, array_filter([
                $order->notes,
                $notes,
            ]))),
        ]);
    }

    /**
     * @return Collection<int, PosOrder>
     */
    public function recentOrders(int $limit = 8): Collection
    {
        return PosOrder::query()
            ->with(['items', 'cashier:id,name'])
            ->where('status', PosOrderStatus::Paid->value)
            ->whereDate('paid_at', today())
            ->oldest('paid_at')
            ->oldest()
            ->limit($limit)
            ->get();
    }

    /**
     * @return array<string, float|int>
     */
    public function todaySummary(): array
    {
        $paidOrders = PosOrder::query()
            ->where('status', PosOrderStatus::Paid->value)
            ->whereDate('paid_at', today());

        return [
            'orders' => (clone $paidOrders)->count(),
            'gross_sales' => (float) (clone $paidOrders)->sum('total_amount'),
            'items_sold' => (float) PosOrder::query()
                ->where('status', PosOrderStatus::Paid->value)
                ->whereDate('paid_at', today())
                ->join('pos_order_items', 'pos_orders.id', '=', 'pos_order_items.pos_order_id')
                ->sum('pos_order_items.quantity'),
        ];
    }

    private function sellableProductQuery(): Builder
    {
        return InventoryItem::query()
            ->with(['productionBatches' => function ($query): void {
                $query
                    ->where('status', ProductionBatchStatus::Completed->value)
                    ->where('stock_synced_quantity', '>', 0)
                    ->latest('completed_at')
                    ->latest();
            }])
            ->where('is_menu_item', true)
            ->where('status', InventoryItemStatus::Active->value)
            ->where('current_stock', '>', 0)
            ->whereNotNull('selling_price')
            ->where('selling_price', '>', 0)
            ->whereHas('productionBatches', function (Builder $query): void {
                $query
                    ->where('status', ProductionBatchStatus::Completed->value)
                    ->where('stock_synced_quantity', '>', 0);
            });
    }
}
