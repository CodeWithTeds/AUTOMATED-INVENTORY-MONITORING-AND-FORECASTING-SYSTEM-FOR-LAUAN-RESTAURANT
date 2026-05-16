<?php

use App\Enums\ProductionBatchStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_batches', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number')->unique();
            $table->decimal('planned_quantity', 10, 2)->default(0);
            $table->decimal('completed_quantity', 10, 2)->default(0);
            $table->decimal('waste_quantity', 10, 2)->default(0);
            $table->decimal('stock_synced_quantity', 10, 2)->default(0);
            $table->string('production_area')->nullable();
            $table->date('planned_start_date')->nullable();
            $table->date('target_completion_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('status')->default(ProductionBatchStatus::Planned->value);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['inventory_item_id', 'status']);
            $table->index('planned_start_date');
            $table->index('completed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_batches');
    }
};
