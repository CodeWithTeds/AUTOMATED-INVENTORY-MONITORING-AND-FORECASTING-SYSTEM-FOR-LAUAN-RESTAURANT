<?php

namespace App\Models;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'category',
        'supplier',
        'unit',
        'current_stock',
        'starting_stock',
        'stock_in',
        'stock_out',
        'ending_stock',
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
        'is_menu_item',
        'selling_price',
        'notes',
    ];

    protected $casts = [
        'category' => InventoryCategory::class,
        'status' => InventoryItemStatus::class,
        'current_stock' => 'decimal:2',
        'starting_stock' => 'decimal:2',
        'stock_in' => 'decimal:2',
        'stock_out' => 'decimal:2',
        'ending_stock' => 'decimal:2',
        'par_level' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'reorder_quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'daily_usage_rate' => 'decimal:2',
        'lead_time_days' => 'integer',
        'expiration_date' => 'date',
        'is_menu_item' => 'boolean',
        'selling_price' => 'decimal:2',
    ];

    public function productionBatches(): HasMany
    {
        return $this->hasMany(ProductionBatch::class);
    }

    public function productionMaterialUsages(): HasMany
    {
        return $this->hasMany(ProductionBatchMaterial::class);
    }

    public function recipeMaterials(): HasMany
    {
        return $this->hasMany(RecipeMaterial::class, 'menu_item_id');
    }

    public function recipeUsages(): HasMany
    {
        return $this->hasMany(RecipeMaterial::class, 'raw_material_id');
    }
}
