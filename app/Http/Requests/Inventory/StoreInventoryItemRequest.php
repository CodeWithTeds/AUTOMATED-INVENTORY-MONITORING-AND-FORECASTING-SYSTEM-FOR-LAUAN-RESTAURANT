<?php

namespace App\Http\Requests\Inventory;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryItemRequest extends FormRequest
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
            'sku' => ['nullable', 'string', 'max:40', 'unique:inventory_items,sku'],
            'name' => ['required', 'string', 'max:160'],
            'category' => ['required', Rule::enum(InventoryCategory::class)],
            'supplier' => ['nullable', 'string', 'max:160'],
            'unit' => ['required', 'string', 'max:24'],
            'current_stock' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'par_level' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'reorder_point' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'reorder_quantity' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'unit_cost' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'daily_usage_rate' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'lead_time_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'storage_area' => ['nullable', 'string', 'max:120'],
            'expiration_date' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(InventoryItemStatus::class)],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
