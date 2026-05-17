<?php

namespace App\Http\Requests\Supplier;

use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:40', 'unique:suppliers,code'],
            'name' => ['required', 'string', 'max:160'],
            'category' => ['required', Rule::enum(SupplierCategory::class)],
            'contact_person' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:60'],
            'email' => ['nullable', 'email:rfc,dns', 'max:160'],
            'city' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'payment_terms' => ['nullable', 'string', 'max:80'],
            'lead_time_days' => ['required', 'integer', 'min:1', 'max:365'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'status' => ['required', Rule::enum(SupplierStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
