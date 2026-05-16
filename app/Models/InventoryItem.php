<?php

namespace App\Models;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'sku',
    'name',
    'category',
    'supplier',
    'unit',
    'current_stock',
    'par_level',
    'reorder_point',
    'reorder_quantity',
    'unit_cost',
    'daily_usage_rate',
    'lead_time_days',
    'storage_area',
    'expiration_date',
    'status',
    'image_path',
    'notes',
])]
class InventoryItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $casts = [
        'category' => InventoryCategory::class,
        'status' => InventoryItemStatus::class,
        'current_stock' => 'decimal:2',
        'par_level' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'reorder_quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'daily_usage_rate' => 'decimal:2',
        'lead_time_days' => 'integer',
        'expiration_date' => 'date',
    ];

    public function productionBatches(): HasMany
    {
        return $this->hasMany(ProductionBatch::class);
    }

    public function productionMaterialUsages(): HasMany
    {
        return $this->hasMany(ProductionBatchMaterial::class);
    }
}
