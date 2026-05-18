<?php

namespace App\Http\Resources;

use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof PosOrderStatus
            ? $this->status
            : PosOrderStatus::tryFrom((string) $this->status);
        $paymentMethod = $this->payment_method instanceof PosPaymentMethod
            ? $this->payment_method
            : PosPaymentMethod::tryFrom((string) $this->payment_method);

        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_name' => $this->customer_name,
            'status' => $status?->value ?? $this->status,
            'status_label' => $status?->label() ?? $this->status,
            'payment_method' => $paymentMethod?->value ?? $this->payment_method,
            'payment_method_label' => $paymentMethod?->label() ?? $this->payment_method,
            'subtotal_amount' => (float) $this->subtotal_amount,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,
            'amount_paid' => (float) $this->amount_paid,
            'change_amount' => (float) $this->change_amount,
            'paid_at' => $this->paid_at?->format('Y-m-d H:i'),
            'cashier_name' => $this->cashier?->name,
            'items' => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'inventory_item_id' => $item->inventory_item_id,
                'item_sku' => $item->item_sku,
                'item_name' => $item->item_name,
                'quantity' => (float) $item->quantity,
                'unit' => $item->unit,
                'unit_price' => (float) $item->unit_price,
                'line_total' => (float) $item->line_total,
            ])->values()->all(),
        ];
    }
}
