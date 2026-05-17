<?php

namespace App\Models;

use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'code',
    'name',
    'category',
    'contact_person',
    'phone',
    'email',
    'city',
    'address',
    'payment_terms',
    'lead_time_days',
    'rating',
    'status',
    'notes',
])]
class Supplier extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $casts = [
        'category' => SupplierCategory::class,
        'lead_time_days' => 'integer',
        'rating' => 'integer',
        'status' => SupplierStatus::class,
    ];
}
