<?php

namespace App\Models;

use App\Enums\ProductionBatchStatus;
use App\Enums\ProductionCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductionBatch extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'inventory_item_id',
        'batch_number',
        'category',
        'planned_quantity',
        'completed_quantity',
        'waste_quantity',
        'portion_size',
        'portion_unit',
        'stock_synced_quantity',
        'production_area',
        'planned_start_date',
        'target_completion_date',
        'completed_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'status' => ProductionBatchStatus::class,
        'category' => ProductionCategory::class,
        'planned_quantity' => 'decimal:2',
        'completed_quantity' => 'decimal:2',
        'waste_quantity' => 'decimal:2',
        'portion_size' => 'decimal:2',
        'stock_synced_quantity' => 'decimal:2',
        'planned_start_date' => 'date',
        'target_completion_date' => 'date',
        'completed_at' => 'immutable_datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(ProductionBatchMaterial::class);
    }
}
