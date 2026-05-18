<?php

use App\Enums\PurchaseOrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('purchase_orders')
            ->where('status', 'draft')
            ->update(['status' => PurchaseOrderStatus::Pending->value]);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE purchase_orders MODIFY status VARCHAR(255) NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        DB::table('purchase_orders')
            ->where('status', PurchaseOrderStatus::Pending->value)
            ->update(['status' => PurchaseOrderStatus::Draft->value]);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE purchase_orders MODIFY status VARCHAR(255) NOT NULL DEFAULT 'draft'");
        }
    }
};
