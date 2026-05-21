<?php

namespace App\Models;

use App\Enums\PurchaseOrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'supplier_name',
        'status',
        'items_count',
        'total_amount',
        'ordered_at',
        'expected_at',
        'received_at',
        'notes',
    ];

    protected $casts = [
        'status' => PurchaseOrderStatus::class,
        'items_count' => 'integer',
        'total_amount' => 'decimal:2',
        'ordered_at' => 'date',
        'expected_at' => 'date',
        'received_at' => 'date',
    ];
}
