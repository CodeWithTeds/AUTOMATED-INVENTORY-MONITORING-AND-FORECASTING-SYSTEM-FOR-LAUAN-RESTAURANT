<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\ProductionBatchStatus;
use App\Models\InventoryItem;
use App\Models\ProductionBatch;
use App\Models\RecipeMaterial;
use App\Models\User;

function productionInventoryItem(array $attributes = []): InventoryItem
{
    return InventoryItem::query()->create(array_merge([
        'sku' => fake()->unique()->bothify('INV-###'),
        'name' => 'Chicken Breast',
        'category' => InventoryCategory::Meat,
        'supplier' => 'Kitchen',
        'unit' => 'kg',
        'current_stock' => 50,
        'par_level' => 20,
        'reorder_point' => 5,
        'reorder_quantity' => 12,
        'unit_cost' => 250,
        'daily_usage_rate' => 2,
        'lead_time_days' => 1,
        'storage_area' => 'Kitchen',
        'status' => InventoryItemStatus::Active,
        'is_menu_item' => false,
        'selling_price' => null,
    ], $attributes));
}

function productionMenuItem(array $attributes = []): InventoryItem
{
    return productionInventoryItem(array_merge([
        'sku' => fake()->unique()->bothify('MENU-###'),
        'name' => 'Chicken Rice Meal',
        'category' => InventoryCategory::DryGoods,
        'supplier' => 'Recipe / BOM',
        'unit' => 'pack',
        'current_stock' => 0,
        'storage_area' => 'Menu / POS',
        'is_menu_item' => true,
        'selling_price' => 149,
    ], $attributes));
}

test('authenticated users can view production batches', function (): void {
    $user = User::factory()->create();

    $this->withoutVite();

    $this->actingAs($user)
        ->get('/production')
        ->assertOk();
});

test('completed production uses the selected menu BOM and deducts raw inventory', function (): void {
    $user = User::factory()->create();
    $menuItem = productionMenuItem([
        'sku' => 'MENU-CRM-001',
        'name' => 'Chicken Rice Meal',
    ]);
    $rawMaterial = productionInventoryItem([
        'sku' => 'RAW-CHICKEN-001',
        'name' => 'Chicken Breast',
        'unit' => 'kg',
        'current_stock' => 50,
    ]);

    RecipeMaterial::query()->create([
        'menu_item_id' => $menuItem->id,
        'raw_material_id' => $rawMaterial->id,
        'quantity' => 500,
        'unit' => 'g',
        'notes' => 'Chicken per meal',
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/production', [
            '_token' => 'test-token',
            'batch_number' => 'PRD-2026-001',
            'inventory_item_id' => $menuItem->id,
            'planned_quantity' => 20,
            'completed_quantity' => 18.5,
            'waste_quantity' => 1.5,
            'production_area' => 'Hot Kitchen',
            'planned_start_date' => '2026-05-16',
            'target_completion_date' => '2026-05-17',
            'completed_at' => '',
            'status' => ProductionBatchStatus::Completed->value,
            'notes' => 'Dinner service batch.',
        ])
        ->assertRedirect();

    expect((float) $menuItem->refresh()->current_stock)->toBe(18.5);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(40.75);

    $this->assertDatabaseHas('production_batches', [
        'batch_number' => 'PRD-2026-001',
        'inventory_item_id' => $menuItem->id,
        'status' => ProductionBatchStatus::Completed->value,
        'stock_synced_quantity' => 18.5,
    ]);
    $this->assertDatabaseHas('production_batch_materials', [
        'inventory_item_id' => $rawMaterial->id,
        'quantity' => 9250,
        'unit' => 'g',
        'stock_synced_quantity' => 9.25,
    ]);
});

test('updating and deleting a completed batch keeps product and raw stock in sync', function (): void {
    $user = User::factory()->create();
    $menuItem = productionMenuItem(['current_stock' => 10]);
    $rawMaterial = productionInventoryItem([
        'sku' => 'RAW-RICE-001',
        'name' => 'Cooked Rice',
        'unit' => 'kg',
        'current_stock' => 30,
    ]);
    RecipeMaterial::query()->create([
        'menu_item_id' => $menuItem->id,
        'raw_material_id' => $rawMaterial->id,
        'quantity' => 0.25,
        'unit' => 'kg',
    ]);
    $batch = ProductionBatch::query()->create([
        'inventory_item_id' => $menuItem->id,
        'batch_number' => 'PRD-2026-002',
        'planned_quantity' => 20,
        'completed_quantity' => 8,
        'waste_quantity' => 0,
        'stock_synced_quantity' => 0,
        'production_area' => 'Hot Kitchen',
        'status' => ProductionBatchStatus::Planned,
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->put("/production/{$batch->id}", [
            '_token' => 'test-token',
            'batch_number' => 'PRD-2026-002',
            'inventory_item_id' => $menuItem->id,
            'planned_quantity' => 20,
            'completed_quantity' => 12,
            'waste_quantity' => 1,
            'production_area' => 'Hot Kitchen',
            'planned_start_date' => '',
            'target_completion_date' => '',
            'completed_at' => '',
            'status' => ProductionBatchStatus::Completed->value,
            'notes' => '',
        ])
        ->assertRedirect();

    expect((float) $menuItem->refresh()->current_stock)->toBe(22.0);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(27.0);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->delete("/production/{$batch->id}", [
            '_token' => 'test-token',
        ])
        ->assertRedirect();

    expect((float) $menuItem->refresh()->current_stock)->toBe(10.0);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(30.0);
});

test('completed production is rejected when raw materials are not enough', function (): void {
    $user = User::factory()->create();
    $menuItem = productionMenuItem();
    $rawMaterial = productionInventoryItem([
        'sku' => 'RAW-FLOUR-001',
        'name' => 'All-purpose Flour',
        'unit' => 'kg',
        'current_stock' => 1000,
    ]);
    RecipeMaterial::query()->create([
        'menu_item_id' => $menuItem->id,
        'raw_material_id' => $rawMaterial->id,
        'quantity' => 300,
        'unit' => 'kg',
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/production', [
            '_token' => 'test-token',
            'batch_number' => 'PRD-2026-003',
            'inventory_item_id' => $menuItem->id,
            'planned_quantity' => 200,
            'completed_quantity' => 200,
            'waste_quantity' => 0,
            'production_area' => 'Hot Kitchen',
            'planned_start_date' => '',
            'target_completion_date' => '',
            'completed_at' => '',
            'status' => ProductionBatchStatus::Completed->value,
            'notes' => '',
        ])
        ->assertSessionHasErrors('completed_quantity');

    expect((float) $menuItem->refresh()->current_stock)->toBe(0.0);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(1000.0);
    $this->assertDatabaseMissing('production_batches', [
        'batch_number' => 'PRD-2026-003',
    ]);
});
