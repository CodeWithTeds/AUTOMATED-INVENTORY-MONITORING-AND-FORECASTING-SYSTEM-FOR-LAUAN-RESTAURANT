<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'menu_item_id',
    'raw_material_id',
    'quantity',
    'unit',
    'notes',
])]
class RecipeMaterial extends Model
{
    use HasFactory;

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'menu_item_id');
    }

    public function rawMaterial(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'raw_material_id');
    }
}
