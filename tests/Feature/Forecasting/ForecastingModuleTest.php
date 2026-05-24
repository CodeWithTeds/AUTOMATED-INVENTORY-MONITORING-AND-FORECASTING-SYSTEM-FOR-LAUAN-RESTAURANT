<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use App\Models\InventoryItem;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the forecasting module', function (): void {
    $this->get('/admin/forcasting')->assertRedirect(route('login'));
});

test('authenticated users can view POS-driven inventory forecasts', function (): void {
    $user = User::factory()->admin()->create();
    $menuItem = InventoryItem::query()->create([
        'sku' => 'FCST-MENU-001',
        'name' => 'Forecast Burger',
        'category' => InventoryCategory::DryGoods,
        'supplier' => 'Forecast Kitchen',
        'unit' => 'serving',
        'current_stock' => 3,
        'par_level' => 10,
        'reorder_point' => 5,
        'reorder_quantity' => 12,
        'unit_cost' => 55,
        'daily_usage_rate' => 1,
        'lead_time_days' => 2,
        'storage_area' => 'Hot Kitchen',
        'status' => InventoryItemStatus::Active,
        'is_menu_item' => true,
        'selling_price' => 150,
    ]);
    $order = PosOrder::query()->create([
        'user_id' => $user->id,
        'order_number' => 'FCST-POS-001',
        'customer_name' => 'Forecast Guest',
        'status' => PosOrderStatus::Paid,
        'payment_method' => PosPaymentMethod::Cash,
        'subtotal_amount' => 1500,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total_amount' => 1500,
        'amount_paid' => 1500,
        'change_amount' => 0,
        'paid_at' => now(),
    ]);

    PosOrderItem::query()->create([
        'pos_order_id' => $order->id,
        'inventory_item_id' => $menuItem->id,
        'item_sku' => $menuItem->sku,
        'item_name' => $menuItem->name,
        'quantity' => 10,
        'unit' => 'serving',
        'unit_price' => 150,
        'line_total' => 1500,
    ]);

    $this->actingAs($user)
        ->get('/admin/forcasting?start_date='.now()->subDays(6)->toDateString().'&end_date='.now()->toDateString().'&horizon_days=7')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('forecasting/index')
            ->where('summary.critical_items', 1)
            ->where('summary.tracked_items', 1)
            ->where('items.0.sku', 'FCST-MENU-001')
            ->where('items.0.risk_level', 'critical')
            ->where('items.0.forecast_quantity', 10)
            ->where('items.0.suggested_restock_quantity', 12));
});
