<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeBomResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'unit' => $this->unit,
            'current_stock' => (float) $this->current_stock,
            'selling_price' => $this->selling_price !== null ? (float) $this->selling_price : null,
            'image_url' => $this->image_path ? "/storage/{$this->image_path}" : null,
            'notes' => $this->notes,
            'materials' => $this->recipeMaterials->map(fn ($material): array => [
                'id' => $material->id,
                'raw_material_id' => $material->raw_material_id,
                'name' => $material->rawMaterial?->name,
                'sku' => $material->rawMaterial?->sku,
                'inventory_unit' => $material->rawMaterial?->unit,
                'available_stock' => $material->rawMaterial ? (float) $material->rawMaterial->current_stock : 0,
                'quantity' => (float) $material->quantity,
                'unit' => $material->unit,
                'notes' => $material->notes,
            ])->values()->all(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
