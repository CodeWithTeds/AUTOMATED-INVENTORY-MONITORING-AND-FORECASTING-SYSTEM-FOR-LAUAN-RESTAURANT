<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\ProductionBatchStatus;
use App\Models\InventoryItem;
use App\Models\ProductionBatch;
use App\Models\User;

function productionProduct(array $attributes = []): InventoryItem
{
    return InventoryItem::query()->create(array_merge([
        'sku' => fake()->unique()->bothify('PRD-###'),
        'name' => 'Chicken Adobo Tray',
        'category' => InventoryCategory::DryGoods,
        'supplier' => 'Kitchen',
        'unit' => 'tray',
        'current_stock' => 10,
        'par_level' => 20,
        'reorder_point' => 5,
        'reorder_quantity' => 12,
        'unit_cost' => 250,
        'daily_usage_rate' => 2,
        'lead_time_days' => 1,
        'storage_area' => 'Finished Goods',
        'status' => InventoryItemStatus::Active,
    ], $attributes));
}

test('authenticated users can view production batches', function (): void {
    $user = User::factory()->create();

    $this->withoutVite();

    $this->actingAs($user)
        ->get('/production')
        ->assertOk();
});

test('completed production batch syncs finished stock to the connected product', function (): void {
    $user = User::factory()->create();
    $rawMaterial = productionProduct([
        'sku' => 'RAW-CHICKEN-001',
        'name' => 'Chicken Breast',
        'unit' => 'kg',
        'current_stock' => 50,
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/production', [
            '_token' => 'test-token',
            'batch_number' => 'PRD-2026-001',
            'product_name' => 'Chicken Rice Meal',
            'product_sku' => 'MENU-CRM-001',
            'product_unit' => 'pack',
            'selling_price' => 149,
            'planned_quantity' => 20,
            'completed_quantity' => 18.5,
            'waste_quantity' => 1.5,
            'production_area' => 'Hot Kitchen',
            'planned_start_date' => '2026-05-16',
            'target_completion_date' => '2026-05-17',
            'completed_at' => '',
            'status' => ProductionBatchStatus::Completed->value,
            'notes' => 'Dinner service batch.',
            'materials' => [
                [
                    'inventory_item_id' => $rawMaterial->id,
                    'quantity' => 500,
                    'unit' => 'g',
                    'notes' => 'Marinated chicken',
                ],
            ],
        ])
        ->assertRedirect();

    $menuProduct = InventoryItem::query()->where('sku', 'MENU-CRM-001')->firstOrFail();

    expect((float) $menuProduct->current_stock)->toBe(18.5);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(49.5);
    expect((bool) $menuProduct->is_menu_item)->toBeTrue();
    expect((float) $menuProduct->selling_price)->toBe(149.0);

    $this->assertDatabaseHas('production_batches', [
        'batch_number' => 'PRD-2026-001',
        'inventory_item_id' => $menuProduct->id,
        'status' => ProductionBatchStatus::Completed->value,
        'stock_synced_quantity' => 18.5,
    ]);
    $this->assertDatabaseHas('production_batch_materials', [
        'inventory_item_id' => $rawMaterial->id,
        'quantity' => 500,
        'unit' => 'g',
        'stock_synced_quantity' => 0.5,
    ]);
});

test('updating and deleting a completed batch keeps product stock in sync', function (): void {
    $user = User::factory()->create();
    $product = productionProduct(['current_stock' => 10]);
    $rawMaterial = productionProduct([
        'sku' => 'RAW-RICE-001',
        'name' => 'Cooked Rice',
        'unit' => 'kg',
        'current_stock' => 30,
    ]);
    $batch = ProductionBatch::query()->create([
        'inventory_item_id' => $product->id,
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
            'product_name' => 'Chicken Adobo Tray',
            'product_sku' => $product->sku,
            'product_unit' => 'tray',
            'selling_price' => 199,
            'planned_quantity' => 20,
            'completed_quantity' => 12,
            'waste_quantity' => 1,
            'production_area' => 'Hot Kitchen',
            'planned_start_date' => '',
            'target_completion_date' => '',
            'completed_at' => '',
            'status' => ProductionBatchStatus::Completed->value,
            'notes' => '',
            'materials' => [
                [
                    'inventory_item_id' => $rawMaterial->id,
                    'quantity' => 4,
                    'unit' => 'kg',
                    'notes' => '',
                ],
            ],
        ])
        ->assertRedirect();

    expect((float) $product->refresh()->current_stock)->toBe(22.0);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(26.0);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->delete("/production/{$batch->id}", [
            '_token' => 'test-token',
        ])
        ->assertRedirect();

    expect((float) $product->refresh()->current_stock)->toBe(10.0);
    expect((float) $rawMaterial->refresh()->current_stock)->toBe(30.0);
});
