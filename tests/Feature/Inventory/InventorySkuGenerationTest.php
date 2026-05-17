<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use App\Models\InventoryItem;
use App\Models\Supplier;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('inventory create form receives supplier dropdown options', function (): void {
    $user = User::factory()->create();

    Supplier::query()->create([
        'code' => 'SUP-010',
        'name' => 'Dropdown Supplier',
        'category' => SupplierCategory::DryGoods,
        'contact_person' => 'Ana Cruz',
        'phone' => '+63 917 555 0000',
        'email' => 'dropdown.supplier@gmail.com',
        'city' => 'Manila',
        'address' => 'Warehouse',
        'payment_terms' => 'Net 15',
        'lead_time_days' => 2,
        'rating' => 4,
        'status' => SupplierStatus::Active,
        'notes' => '',
    ]);

    $this->actingAs($user)
        ->get('/inventory')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory/index')
            ->where('supplierOptions.0.value', 'Dropdown Supplier')
            ->where('supplierOptions.0.label', 'Dropdown Supplier (SUP-010)'));
});

test('inventory sku is generated from category when left blank', function (): void {
    $user = User::factory()->create();

    InventoryItem::query()->create([
        'sku' => 'LR-DRY-001',
        'name' => 'Existing Rice',
        'category' => InventoryCategory::DryGoods,
        'supplier' => 'Existing Supplier',
        'unit' => 'kg',
        'current_stock' => 10,
        'par_level' => 20,
        'reorder_point' => 5,
        'reorder_quantity' => 10,
        'unit_cost' => 50,
        'daily_usage_rate' => 1,
        'lead_time_days' => 2,
        'storage_area' => 'Dry Storage',
        'status' => InventoryItemStatus::Active,
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/inventory', [
            '_token' => 'test-token',
            'sku' => '',
            'name' => 'Automatic Flour',
            'category' => InventoryCategory::DryGoods->value,
            'supplier' => 'Auto Supplier',
            'unit' => 'kg',
            'current_stock' => 15,
            'par_level' => 25,
            'reorder_point' => 8,
            'reorder_quantity' => 12,
            'unit_cost' => 65,
            'daily_usage_rate' => 1,
            'lead_time_days' => 2,
            'storage_area' => 'Dry Storage',
            'expiration_date' => '',
            'status' => InventoryItemStatus::Active->value,
            'notes' => '',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('inventory_items', [
        'sku' => 'LR-DRY-002',
        'name' => 'Automatic Flour',
    ]);
});
