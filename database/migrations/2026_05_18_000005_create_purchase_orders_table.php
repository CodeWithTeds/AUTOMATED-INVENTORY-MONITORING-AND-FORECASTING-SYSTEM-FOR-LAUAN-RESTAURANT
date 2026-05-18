<?php

use App\Enums\PurchaseOrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table): void {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('supplier_name');
            $table->string('status')->default(PurchaseOrderStatus::Draft->value);
            $table->unsignedInteger('items_count')->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->date('ordered_at')->nullable();
            $table->date('expected_at')->nullable();
            $table->date('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'expected_at']);
            $table->index('supplier_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
