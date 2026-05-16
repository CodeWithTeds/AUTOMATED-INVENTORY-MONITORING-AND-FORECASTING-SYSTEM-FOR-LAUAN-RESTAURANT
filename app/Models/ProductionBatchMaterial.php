<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'production_batch_id',
    'inventory_item_id',
    'quantity',
    'unit',
    'stock_synced_quantity',
    'notes',
])]
class ProductionBatchMaterial extends Model
{
    use HasFactory;

    protected $casts = [
        'quantity' => 'decimal:2',
        'stock_synced_quantity' => 'decimal:2',
    ];

    public function productionBatch(): BelongsTo
    {
        return $this->belongsTo(ProductionBatch::class);
    }

    public function rawMaterial(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
