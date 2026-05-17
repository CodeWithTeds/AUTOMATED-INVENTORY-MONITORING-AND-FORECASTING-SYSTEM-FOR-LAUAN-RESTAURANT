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
            'batch_number' => ['nullable', 'string', 'max:60', 'unique:production_batches,batch_number'],
            'inventory_item_id' => [
                'required',
                'integer',
                Rule::exists('inventory_items', 'id')->where('is_menu_item', true),
            ],
            'planned_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'completed_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'waste_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'production_area' => ['nullable', 'string', 'max:120'],
            'planned_start_date' => ['nullable', 'date'],
            'target_completion_date' => ['nullable', 'date', 'after_or_equal:planned_start_date'],
            'completed_at' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(ProductionBatchStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
