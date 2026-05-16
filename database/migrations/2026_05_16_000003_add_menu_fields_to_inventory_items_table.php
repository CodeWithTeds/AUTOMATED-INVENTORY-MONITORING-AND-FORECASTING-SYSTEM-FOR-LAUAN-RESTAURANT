<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table): void {
            $table->boolean('is_menu_item')->default(false)->after('image_path');
            $table->decimal('selling_price', 10, 2)->nullable()->after('is_menu_item');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table): void {
            $table->dropColumn(['is_menu_item', 'selling_price']);
        });
    }
};
