<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use App\Enums\ProductionBatchStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\SupplierStatus;
use App\Models\InventoryItem;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\ProductionBatch;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the reports module', function (): void {
    $this->get('/admin/report')->assertRedirect(route('login'));
});

test('authenticated users can view reports with aggregate data', function (): void {
    $user = User::factory()->create();
    $item = InventoryItem::query()->create([
        'sku' => 'REP-RAW-001',
        'name' => 'Report Rice',
        'category' => InventoryCategory::DryGoods,
        'supplier' => 'Report Supplier',
        'unit' => 'kg',
        'current_stock' => 2,
        'par_level' => 10,
        'reorder_point' => 5,
        'reorder_quantity' => 20,
        'unit_cost' => 40,
        'daily_usage_rate' => 1,
        'lead_time_days' => 2,
        'storage_area' => 'Dry Storage',
        'expiration_date' => now()->addDays(3)->toDateString(),
        'status' => InventoryItemStatus::Watchlist,
        'is_menu_item' => true,
        'selling_price' => 120,
    ]);
    $order = PosOrder::query()->create([
        'user_id' => $user->id,
        'order_number' => 'REP-POS-001',
        'customer_name' => 'Report Guest',
        'status' => PosOrderStatus::Paid,
        'payment_method' => PosPaymentMethod::Cash,
        'subtotal_amount' => 240,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total_amount' => 240,
        'amount_paid' => 300,
        'change_amount' => 60,
        'paid_at' => now(),
    ]);

    PosOrderItem::query()->create([
        'pos_order_id' => $order->id,
        'inventory_item_id' => $item->id,
        'item_sku' => $item->sku,
        'item_name' => 'Report Rice Meal',
        'quantity' => 2,
        'unit' => 'serving',
        'unit_price' => 120,
        'line_total' => 240,
    ]);
    ProductionBatch::query()->create([
        'inventory_item_id' => $item->id,
        'batch_number' => 'REP-PRD-001',
        'planned_quantity' => 5,
        'completed_quantity' => 5,
        'waste_quantity' => 1,
        'production_area' => 'Main Kitchen',
        'completed_at' => now(),
        'status' => ProductionBatchStatus::Completed,
    ]);
    PurchaseOrder::query()->create([
        'order_number' => 'REP-PO-001',
        'supplier_name' => 'Report Supplier',
        'status' => PurchaseOrderStatus::Pending,
        'items_count' => 2,
        'total_amount' => 500,
        'ordered_at' => now()->toDateString(),
        'expected_at' => now()->addDays(2)->toDateString(),
    ]);
    Supplier::query()->create([
        'code' => 'REP-SUP-001',
        'name' => 'Report Supplier',
        'status' => SupplierStatus::Preferred,
        'rating' => 5,
    ]);

    $this->actingAs($user)
        ->get('/admin/report')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('summary.sales.total_sales', 240)
            ->where('summary.inventory.low_stock_items', 1)
            ->where('summary.production.completed_batches', 1)
            ->where('summary.procurement.open_orders', 1)
            ->where('summary.suppliers.preferred_suppliers', 1)
            ->where('risk_items.0.sku', 'REP-RAW-001'));
});
