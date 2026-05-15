<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table): void {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('category')->default(InventoryCategory::DryGoods->value);
            $table->string('supplier')->nullable();
            $table->string('unit', 24);
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('par_level', 10, 2)->default(0);
            $table->decimal('reorder_point', 10, 2)->default(0);
            $table->decimal('reorder_quantity', 10, 2)->default(0);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('daily_usage_rate', 10, 2)->default(0);
            $table->unsignedSmallInteger('lead_time_days')->default(1);
            $table->string('storage_area')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('status')->default(InventoryItemStatus::Active->value);
            $table->string('image_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'status']);
            $table->index('expiration_date');
            $table->index('current_stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
