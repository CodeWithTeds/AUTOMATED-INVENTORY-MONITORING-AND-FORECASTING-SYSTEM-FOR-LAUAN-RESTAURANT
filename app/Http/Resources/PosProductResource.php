<?php

namespace App\Http\Resources;

use App\Enums\ProductionCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $productionBatch = $this->productionBatches->first();
        $category = $productionBatch?->category instanceof ProductionCategory
            ? $productionBatch->category
            : ProductionCategory::tryFrom((string) $productionBatch?->category);

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'category' => $category?->value ?? ProductionCategory::AllMenu->value,
            'category_label' => $category?->label() ?? ProductionCategory::AllMenu->label(),
            'category_icon' => $category?->icon() ?? ProductionCategory::AllMenu->icon(),
            'unit' => $this->unit,
            'current_stock' => (float) $this->current_stock,
            'selling_price' => $this->selling_price !== null ? (float) $this->selling_price : 0,
            'image_url' => $this->image_path ? "/storage/{$this->image_path}" : null,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
