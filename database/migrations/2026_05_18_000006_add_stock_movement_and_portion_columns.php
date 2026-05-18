<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table): void {
            $table->decimal('starting_stock', 10, 2)->default(0)->after('current_stock');
            $table->decimal('stock_in', 10, 2)->default(0)->after('starting_stock');
            $table->decimal('stock_out', 10, 2)->default(0)->after('stock_in');
            $table->decimal('ending_stock', 10, 2)->default(0)->after('stock_out');
        });

        Schema::table('production_batches', function (Blueprint $table): void {
            $table->decimal('portion_size', 10, 2)->default(0)->after('waste_quantity');
            $table->string('portion_unit', 24)->nullable()->after('portion_size');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table): void {
            $table->dropColumn([
                'starting_stock',
                'stock_in',
                'stock_out',
                'ending_stock',
            ]);
        });

        Schema::table('production_batches', function (Blueprint $table): void {
            $table->dropColumn([
                'portion_size',
                'portion_unit',
            ]);
        });
    }
};
