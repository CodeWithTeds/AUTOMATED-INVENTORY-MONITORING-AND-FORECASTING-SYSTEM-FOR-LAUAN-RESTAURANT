<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_batch_materials', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('production_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 10, 2)->default(0);
            $table->string('unit', 24);
            $table->decimal('stock_synced_quantity', 10, 2)->default(0);
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['production_batch_id', 'inventory_item_id'], 'prod_batch_materials_batch_item_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_batch_materials');
    }
};
