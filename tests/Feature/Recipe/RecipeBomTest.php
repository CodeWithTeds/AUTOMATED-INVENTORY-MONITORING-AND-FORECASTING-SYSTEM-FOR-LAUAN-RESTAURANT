<?php

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Models\InventoryItem;
use App\Models\User;

function recipeRawMaterial(array $attributes = []): InventoryItem
{
    return InventoryItem::query()->create(array_merge([
        'sku' => fake()->unique()->bothify('RAW-###'),
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

test('authenticated users can view recipe BOM records', function (): void {
    $user = User::factory()->create();

    $this->withoutVite();

    $this->actingAs($user)
        ->get('/admin/recipes')
        ->assertOk();
});

test('users can create a menu item with raw-material BOM', function (): void {
    $user = User::factory()->create();
    $rawMaterial = recipeRawMaterial([
        'sku' => 'RAW-CHICKEN-001',
        'name' => 'Chicken Breast',
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/admin/recipes', [
            '_token' => 'test-token',
            'name' => 'Chicken Rice Meal',
            'sku' => 'MENU-CRM-001',
            'unit' => 'pack',
            'selling_price' => 149,
            'notes' => 'POS menu item.',
            'materials' => [
                [
                    'raw_material_id' => $rawMaterial->id,
                    'quantity' => 500,
                    'unit' => 'g',
                    'notes' => 'Per meal',
                ],
            ],
        ])
        ->assertRedirect();

    $menuItem = InventoryItem::query()->where('sku', 'MENU-CRM-001')->firstOrFail();

    expect((bool) $menuItem->is_menu_item)->toBeTrue();
    expect((float) $menuItem->selling_price)->toBe(149.0);

    $this->assertDatabaseHas('recipe_materials', [
        'menu_item_id' => $menuItem->id,
        'raw_material_id' => $rawMaterial->id,
        'quantity' => 500,
        'unit' => 'g',
    ]);
});
