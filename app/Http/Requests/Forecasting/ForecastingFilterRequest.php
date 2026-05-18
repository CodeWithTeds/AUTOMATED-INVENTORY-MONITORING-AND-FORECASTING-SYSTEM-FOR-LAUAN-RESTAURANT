<?php

namespace App\Http\Requests\Forecasting;

use App\Enums\InventoryCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ForecastingFilterRequest extends FormRequest
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
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'horizon_days' => ['nullable', 'integer', Rule::in([7, 14, 30, 60])],
            'category' => ['nullable', Rule::enum(InventoryCategory::class)],
            'risk' => ['nullable', Rule::in(['all', 'critical', 'watch', 'stable'])],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return $this->safe()->only([
            'start_date',
            'end_date',
            'horizon_days',
            'category',
            'risk',
        ]);
    }
}
