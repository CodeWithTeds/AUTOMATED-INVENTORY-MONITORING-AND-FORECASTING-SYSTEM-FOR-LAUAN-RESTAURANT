<?php

namespace App\Http\Resources;

use App\Enums\ProductionBatchStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionBatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof ProductionBatchStatus
            ? $this->status
            : ProductionBatchStatus::tryFrom((string) $this->status);

        return [
            'id' => $this->id,
            'inventory_item_id' => $this->inventory_item_id,
            'batch_number' => $this->batch_number,
            'product_name' => $this->product?->name,
            'product_sku' => $this->product?->sku,
            'product_unit' => $this->product?->unit,
            'product_stock' => $this->product ? (float) $this->product->current_stock : 0,
            'product_image_url' => $this->product?->image_path ? "/storage/{$this->product->image_path}" : null,
            'product_is_menu_item' => (bool) $this->product?->is_menu_item,
            'product_selling_price' => $this->product?->selling_price !== null ? (float) $this->product->selling_price : null,
            'planned_quantity' => (float) $this->planned_quantity,
            'completed_quantity' => (float) $this->completed_quantity,
            'waste_quantity' => (float) $this->waste_quantity,
            'stock_synced_quantity' => (float) $this->stock_synced_quantity,
            'materials' => $this->materials->map(fn ($material): array => [
                'id' => $material->id,
                'inventory_item_id' => $material->inventory_item_id,
                'name' => $material->rawMaterial?->name,
                'sku' => $material->rawMaterial?->sku,
                'inventory_unit' => $material->rawMaterial?->unit,
                'available_stock' => $material->rawMaterial ? (float) $material->rawMaterial->current_stock : 0,
                'quantity' => (float) $material->quantity,
                'unit' => $material->unit,
                'stock_synced_quantity' => (float) $material->stock_synced_quantity,
                'notes' => $material->notes,
            ])->values()->all(),
            'production_area' => $this->production_area,
            'planned_start_date' => $this->planned_start_date?->format('Y-m-d'),
            'target_completion_date' => $this->target_completion_date?->format('Y-m-d'),
            'completed_at' => $this->completed_at?->format('Y-m-d\TH:i'),
            'status' => $status?->value ?? $this->status,
            'status_label' => $status?->label() ?? $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
