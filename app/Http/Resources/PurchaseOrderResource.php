<?php

namespace App\Http\Resources;

use App\Enums\PurchaseOrderStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof PurchaseOrderStatus
            ? $this->status
            : PurchaseOrderStatus::tryFrom((string) $this->status);

        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'supplier_name' => $this->supplier_name,
            'status' => $status?->value ?? $this->status,
            'status_label' => $status?->label() ?? $this->status,
            'items_count' => $this->items_count,
            'total_amount' => (float) $this->total_amount,
            'ordered_at' => $this->ordered_at?->format('Y-m-d'),
            'expected_at' => $this->expected_at?->format('Y-m-d'),
            'received_at' => $this->received_at?->format('Y-m-d'),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
