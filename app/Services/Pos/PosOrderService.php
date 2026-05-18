<?php

namespace App\Services\Pos;

use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use App\Http\Resources\PosOrderResource;
use App\Http\Resources\PosProductResource;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\InventoryItem;
use App\Models\PosOrder;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Pos\PosOrderRepositoryInterface;
use App\Repositories\PurchaseOrder\PurchaseOrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PosOrderService
{
    public function __construct(
        private readonly PosOrderRepositoryInterface $posOrderRepository,
        private readonly InventoryItemRepositoryInterface $inventoryItemRepository,
        private readonly PurchaseOrderRepositoryInterface $purchaseOrderRepository,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function indexData(): array
    {
        return [
            'products' => $this->products(),
            'recentOrders' => PosOrderResource::collection($this->posOrderRepository->recentOrders())->resolve(),
            'purchaseOrders' => PurchaseOrderResource::collection($this->purchaseOrderRepository->recentForPos())->resolve(),
            'purchaseOrderSummary' => $this->purchaseOrderRepository->summary(),
            'summary' => $this->posOrderRepository->todaySummary(),
            'paymentMethodOptions' => $this->paymentMethodOptions(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function products(): array
    {
        return PosProductResource::collection($this->posOrderRepository->sellableProducts())->resolve();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes, int $userId): PosOrder
    {
        return DB::transaction(function () use ($attributes, $userId): PosOrder {
            $items = collect($attributes['items']);
            $productIds = $items->pluck('inventory_item_id')->map(fn ($id): int => (int) $id)->all();
            $products = $this->posOrderRepository->sellableProductsForCheckout($productIds);

            $orderItems = [];
            $subtotal = 0.0;

            foreach ($items as $item) {
                $productId = (int) $item['inventory_item_id'];
                $quantity = (float) $item['quantity'];
                $product = $products->get($productId);

                if (! $product instanceof InventoryItem) {
                    throw ValidationException::withMessages([
                        'items' => 'One or more selected products are no longer available for POS sale.',
                    ]);
                }

                if ($quantity > (float) $product->current_stock) {
                    throw ValidationException::withMessages([
                        'items' => "{$product->name} has only {$product->current_stock} {$product->unit} available.",
                    ]);
                }

                $unitPrice = (float) $product->selling_price;
                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'inventory_item_id' => $product->id,
                    'item_sku' => $product->sku,
                    'item_name' => $product->name,
                    'quantity' => $quantity,
                    'unit' => $product->unit,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];

                $this->inventoryItemRepository->adjustCurrentStock($product, -1 * $quantity);
            }

            $subtotal = round($subtotal, 2);
            $total = $subtotal;
            $amountPaid = (float) ($attributes['amount_paid'] ?: $total);

            if ($amountPaid < $total) {
                throw ValidationException::withMessages([
                    'amount_paid' => 'Amount paid must cover the order total.',
                ]);
            }

            $order = $this->posOrderRepository->create([
                'user_id' => $userId,
                'order_number' => $this->posOrderRepository->nextOrderNumber(),
                'customer_name' => $attributes['customer_name'] ?: null,
                'status' => PosOrderStatus::Paid,
                'payment_method' => $attributes['payment_method'],
                'subtotal_amount' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $total,
                'amount_paid' => $amountPaid,
                'change_amount' => round($amountPaid - $total, 2),
                'paid_at' => now(),
            ]);

            $this->posOrderRepository->createItems($order, $orderItems);

            return $order->refresh()->load(['items', 'cashier:id,name']);
        });
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function paymentMethodOptions(): array
    {
        return array_map(fn ($case): array => [
            'value' => $case->value,
            'label' => $case->label(),
        ], PosPaymentMethod::cases());
    }
}
