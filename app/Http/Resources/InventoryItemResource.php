<?php

namespace App\Http\Resources;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $stockState = match (true) {
            (float) $this->current_stock <= 0 => 'out',
            (float) $this->current_stock <= (float) $this->reorder_point => 'critical',
            (float) $this->current_stock <= (float) $this->par_level => 'low',
            default => 'healthy',
        };

        $category = $this->category instanceof InventoryCategory
            ? $this->category
            : InventoryCategory::tryFrom((string) $this->category);

        $status = $this->status instanceof InventoryItemStatus
            ? $this->status
            : InventoryItemStatus::tryFrom((string) $this->status);

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'category' => $category?->value ?? $this->category,
            'category_label' => $category?->label() ?? $this->category,
            'supplier' => $this->supplier,
            'unit' => $this->unit,
            'current_stock' => (float) $this->current_stock,
            'starting_stock' => (float) $this->starting_stock,
            'stock_in' => (float) $this->stock_in,
            'stock_out' => (float) $this->stock_out,
            'ending_stock' => (float) $this->ending_stock,
            'par_level' => (float) $this->par_level,
            'reorder_point' => (float) $this->reorder_point,
            'reorder_quantity' => (float) $this->reorder_quantity,
            'unit_cost' => (float) $this->unit_cost,
            'daily_usage_rate' => (float) $this->daily_usage_rate,
            'lead_time_days' => $this->lead_time_days,
            'storage_area' => $this->storage_area,
            'expiration_date' => $this->expiration_date?->format('Y-m-d'),
            'status' => $status?->value ?? $this->status,
            'status_label' => $status?->label() ?? $this->status,
            'stock_state' => $stockState,
            'image_url' => $this->image_path ? "/storage/{$this->image_path}" : null,
            'is_menu_item' => (bool) $this->is_menu_item,
            'selling_price' => $this->selling_price !== null ? (float) $this->selling_price : null,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
