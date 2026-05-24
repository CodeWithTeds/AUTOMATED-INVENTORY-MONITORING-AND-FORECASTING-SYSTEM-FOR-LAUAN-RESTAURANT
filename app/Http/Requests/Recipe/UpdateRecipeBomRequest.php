<?php

namespace App\Http\Requests\Recipe;

use App\Models\InventoryItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecipeBomRequest extends FormRequest
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
        $menuItem = InventoryItem::query()->find($this->route('recipe'));

        return [
            'name' => ['required', 'string', 'max:160'],
            'sku' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('inventory_items', 'sku')->ignore($menuItem?->id),
            ],
            'unit' => ['required', 'string', 'max:24'],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'materials' => ['required', 'array', 'min:1'],
            'materials.*.raw_material_id' => [
                'required',
                'integer',
                Rule::exists('inventory_items', 'id')->where('is_menu_item', 0),
            ],
            'materials.*.quantity' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'materials.*.unit' => ['required', 'string', 'max:24'],
            'materials.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
