<?php

namespace App\Http\Requests\Pos;

use App\Enums\PosPaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePosOrderRequest extends FormRequest
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
            'customer_name' => ['nullable', 'string', 'max:120'],
            'payment_method' => ['required', Rule::in([PosPaymentMethod::Cash->value])],
            'amount_paid' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.inventory_item_id' => ['required', 'integer', 'distinct', 'exists:inventory_items,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:1', 'max:9999'],
        ];
    }
}
