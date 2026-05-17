<?php

namespace App\Http\Resources;

use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $category = $this->category instanceof SupplierCategory
            ? $this->category
            : SupplierCategory::tryFrom((string) $this->category);

        $status = $this->status instanceof SupplierStatus
            ? $this->status
            : SupplierStatus::tryFrom((string) $this->status);

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'category' => $category?->value ?? $this->category,
            'category_label' => $category?->label() ?? $this->category,
            'contact_person' => $this->contact_person,
            'phone' => $this->phone,
            'email' => $this->email,
            'city' => $this->city,
            'address' => $this->address,
            'payment_terms' => $this->payment_terms,
            'lead_time_days' => $this->lead_time_days,
            'rating' => $this->rating,
            'status' => $status?->value ?? $this->status,
            'status_label' => $status?->label() ?? $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
