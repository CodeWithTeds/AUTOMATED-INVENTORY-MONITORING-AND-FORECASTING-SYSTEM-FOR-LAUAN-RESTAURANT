<?php

namespace App\Models;

use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'status',
        'payment_method',
        'subtotal_amount',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'amount_paid',
        'change_amount',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'status' => PosOrderStatus::class,
        'payment_method' => PosPaymentMethod::class,
        'subtotal_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'paid_at' => 'immutable_datetime',
    ];

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PosOrderItem::class);
    }
}
