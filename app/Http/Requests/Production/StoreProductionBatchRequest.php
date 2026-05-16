<?php

namespace App\Http\Requests\Production;

use App\Enums\ProductionBatchStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductionBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'batch_number' => ['required', 'string', 'max:60', 'unique:production_batches,batch_number'],
            'product_name' => ['required', 'string', 'max:160'],
            'product_sku' => ['nullable', 'string', 'max:40', 'unique:inventory_items,sku'],
            'product_unit' => ['required', 'string', 'max:24'],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'product_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'planned_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'completed_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'waste_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'production_area' => ['nullable', 'string', 'max:120'],
            'planned_start_date' => ['nullable', 'date'],
            'target_completion_date' => ['nullable', 'date', 'after_or_equal:planned_start_date'],
            'completed_at' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(ProductionBatchStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
            'materials' => ['required', 'array', 'min:1'],
            'materials.*.inventory_item_id' => ['required', 'integer', 'exists:inventory_items,id'],
            'materials.*.quantity' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'materials.*.unit' => ['required', 'string', 'max:24'],
            'materials.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
