<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipe_materials', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->foreignId('raw_material_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('quantity', 10, 2)->default(0);
            $table->string('unit', 24);
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['menu_item_id', 'raw_material_id'], 'recipe_materials_menu_raw_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_materials');
    }
};
