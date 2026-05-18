<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\PosOrderStatus;
use App\Enums\PosPaymentMethod;
use App\Enums\ProductionBatchStatus;
use App\Enums\PurchaseOrderStatus;
use App\Models\InventoryItem;
use App\Models\ProductionBatch;
use App\Models\PurchaseOrder;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function posInventoryItem(array $attributes = []): InventoryItem
{
    return InventoryItem::query()->create(array_merge([
        'sku' => fake()->unique()->bothify('POS-RAW-###'),
        'name' => 'POS Raw Item',
        'category' => InventoryCategory::DryGoods,
        'supplier' => 'Kitchen',
        'unit' => 'pack',
        'current_stock' => 10,
        'par_level' => 5,
        'reorder_point' => 2,
        'reorder_quantity' => 5,
        'unit_cost' => 50,
        'daily_usage_rate' => 1,
        'lead_time_days' => 1,
        'storage_area' => 'Kitchen',
        'status' => InventoryItemStatus::Active,
        'is_menu_item' => false,
        'selling_price' => null,
    ], $attributes));
}

function posMenuItem(array $attributes = []): InventoryItem
{
    return posInventoryItem(array_merge([
        'sku' => fake()->unique()->bothify('POS-MENU-###'),
        'name' => 'POS Rice Bowl',
        'unit' => 'serving',
        'current_stock' => 5,
        'storage_area' => 'Menu / POS',
        'is_menu_item' => true,
        'selling_price' => 120,
    ], $attributes));
}

function completedPosProduction(InventoryItem $menuItem, float $quantity = 5): ProductionBatch
{
    return ProductionBatch::query()->create([
        'inventory_item_id' => $menuItem->id,
        'batch_number' => fake()->unique()->bothify('POS-PRD-###'),
        'planned_quantity' => $quantity,
        'completed_quantity' => $quantity,
        'waste_quantity' => 0,
        'stock_synced_quantity' => $quantity,
        'production_area' => 'Hot Kitchen',
        'completed_at' => now(),
        'status' => ProductionBatchStatus::Completed,
    ]);
}

test('authenticated users can view the POS module', function (): void {
    $user = User::factory()->create();

    $this->withoutVite();

    PurchaseOrder::query()->create([
        'order_number' => 'POS-PO-001',
        'supplier_name' => 'Pending Counter',
        'status' => PurchaseOrderStatus::Pending,
        'items_count' => 2,
        'total_amount' => 240,
    ]);

    $this->actingAs($user)
        ->get('/admin/pos')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pos/index')
            ->where('purchaseOrders.0.status', PurchaseOrderStatus::Pending->value)
            ->where('purchaseOrders.0.status_label', 'Pending'));
});

test('POS product feed uses completed production menu items and latest price', function (): void {
    $user = User::factory()->create();
    $menuItem = posMenuItem([
        'name' => 'Live Price Meal',
        'selling_price' => 135,
        'current_stock' => 8,
    ]);
    completedPosProduction($menuItem, 8);
    posMenuItem([
        'name' => 'No Completed Batch Meal',
        'current_stock' => 8,
    ]);

    $this->actingAs($user)
        ->getJson('/admin/pos/products')
        ->assertOk()
        ->assertJsonPath('products.0.name', 'Live Price Meal')
        ->assertJsonPath('products.0.selling_price', 135)
        ->assertJsonCount(1, 'products');

    $menuItem->update(['selling_price' => 150]);

    $this->actingAs($user)
        ->getJson('/admin/pos/products')
        ->assertOk()
        ->assertJsonPath('products.0.selling_price', 150);
});

test('POS checkout stores order snapshots and deducts completed production stock', function (): void {
    $user = User::factory()->create();
    $menuItem = posMenuItem([
        'name' => 'Checkout Meal',
        'sku' => 'POS-CHECKOUT-001',
        'selling_price' => 120,
        'current_stock' => 5,
    ]);
    completedPosProduction($menuItem, 5);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/admin/pos/orders', [
            '_token' => 'test-token',
            'customer_name' => 'Maria Santos',
            'payment_method' => PosPaymentMethod::Cash->value,
            'amount_paid' => 500,
            'items' => [
                [
                    'inventory_item_id' => $menuItem->id,
                    'quantity' => 2,
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success')
        ->assertSessionHas('receipt', fn (array $receipt): bool => $receipt['customer_name'] === 'Maria Santos'
            && $receipt['payment_method'] === PosPaymentMethod::Cash->value
            && (float) $receipt['total_amount'] === 240.0
            && str_contains((string) $receipt['purchase_order_receipt_url'], '/admin/purchase-orders/'));

    expect((float) $menuItem->refresh()->current_stock)->toBe(3.0);

    $this->assertDatabaseHas('pos_orders', [
        'customer_name' => 'Maria Santos',
        'status' => PosOrderStatus::Paid->value,
        'payment_method' => PosPaymentMethod::Cash->value,
        'subtotal_amount' => 240,
        'total_amount' => 240,
        'amount_paid' => 500,
        'change_amount' => 260,
    ]);
    $this->assertDatabaseHas('pos_order_items', [
        'inventory_item_id' => $menuItem->id,
        'item_sku' => 'POS-CHECKOUT-001',
        'item_name' => 'Checkout Meal',
        'quantity' => 2,
        'unit_price' => 120,
        'line_total' => 240,
    ]);
    $this->assertDatabaseHas('purchase_orders', [
        'supplier_name' => 'Maria Santos',
        'status' => PurchaseOrderStatus::Pending->value,
        'items_count' => 2,
        'total_amount' => 240,
        'notes' => 'Generated from POS cash receipt POS-'.now()->format('Ymd').'-0001.',
    ]);
});

test('POS checkout rejects quantities above available stock', function (): void {
    $user = User::factory()->create();
    $menuItem = posMenuItem([
        'current_stock' => 1,
        'selling_price' => 175,
    ]);
    completedPosProduction($menuItem, 1);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/admin/pos/orders', [
            '_token' => 'test-token',
            'customer_name' => 'Walk-in',
            'payment_method' => PosPaymentMethod::Cash->value,
            'amount_paid' => 350,
            'items' => [
                [
                    'inventory_item_id' => $menuItem->id,
                    'quantity' => 2,
                ],
            ],
        ])
        ->assertSessionHasErrors('items');

    expect((float) $menuItem->refresh()->current_stock)->toBe(1.0);
    $this->assertDatabaseCount('pos_orders', 0);
});

test('POS checkout accepts cash only', function (): void {
    $user = User::factory()->create();
    $menuItem = posMenuItem([
        'current_stock' => 3,
        'selling_price' => 90,
    ]);
    completedPosProduction($menuItem, 3);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/admin/pos/orders', [
            '_token' => 'test-token',
            'customer_name' => 'Cash Counter',
            'payment_method' => PosPaymentMethod::GCash->value,
            'amount_paid' => 90,
            'items' => [
                [
                    'inventory_item_id' => $menuItem->id,
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertSessionHasErrors('payment_method');

    expect((float) $menuItem->refresh()->current_stock)->toBe(3.0);
    $this->assertDatabaseCount('pos_orders', 0);
    $this->assertDatabaseCount('purchase_orders', 0);
});
