<?php

namespace Database\Seeders;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Enums\ProductionBatchStatus;
use App\Enums\ProductionCategory;
use App\Models\InventoryItem;
use App\Models\ProductionBatch;
use App\Models\ProductionBatchMaterial;
use App\Models\RecipeMaterial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class LauanProductionMenuSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->menuItems() as $item) {
            $rawMaterial = $this->rawMaterial($item);
            $product = $this->product($item);

            RecipeMaterial::query()->updateOrCreate(
                [
                    'menu_item_id' => $product->id,
                    'raw_material_id' => $rawMaterial->id,
                ],
                [
                    'quantity' => $item['portion_size'],
                    'unit' => $item['portion_unit'],
                    'notes' => "Portioning: {$item['portion_size']}{$item['portion_unit']} per serving.",
                ],
            );

            $productionBatch = ProductionBatch::query()->updateOrCreate(
                ['batch_number' => "PRD-{$item['product_sku']}"],
                [
                    'inventory_item_id' => $product->id,
                    'category' => $item['category'],
                    'planned_quantity' => $item['output'],
                    'completed_quantity' => $item['output'],
                    'waste_quantity' => 0,
                    'portion_size' => $item['portion_size'],
                    'portion_unit' => $item['portion_unit'],
                    'stock_synced_quantity' => $item['output'],
                    'production_area' => 'Main Kitchen',
                    'planned_start_date' => now()->toDateString(),
                    'target_completion_date' => now()->toDateString(),
                    'completed_at' => now(),
                    'status' => ProductionBatchStatus::Completed,
                    'notes' => "Seeded production: {$item['raw_quantity']}{$item['raw_unit']} {$item['raw_name']} yielded {$item['output']} servings.",
                ],
            );

            ProductionBatchMaterial::query()->updateOrCreate(
                [
                    'production_batch_id' => $productionBatch->id,
                    'inventory_item_id' => $rawMaterial->id,
                ],
                [
                    'quantity' => $item['raw_quantity'],
                    'unit' => $item['raw_unit'],
                    'stock_synced_quantity' => $item['raw_quantity'],
                    'notes' => "Raw material used for {$item['product_name']}.",
                ],
            );
        }
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function rawMaterial(array $item): InventoryItem
    {
        return InventoryItem::query()->updateOrCreate(
            ['sku' => $item['raw_sku']],
            [
                'name' => $item['raw_name'],
                'category' => $item['inventory_category'],
                'supplier' => 'Lauan Production Supplier',
                'unit' => $item['raw_unit'],
                'current_stock' => 0,
                'par_level' => $item['raw_quantity'],
                'reorder_point' => max(1, $item['raw_quantity'] * 0.25),
                'reorder_quantity' => $item['raw_quantity'],
                'unit_cost' => $item['raw_unit_cost'],
                'daily_usage_rate' => $item['raw_quantity'],
                'lead_time_days' => 2,
                'storage_area' => $item['storage_area'],
                'expiration_date' => now()->addDays(14)->toDateString(),
                'status' => InventoryItemStatus::Active,
                'image_path' => null,
                'is_menu_item' => false,
                'selling_price' => null,
                'notes' => "Seeded raw material. Quantity used: {$item['raw_quantity']}{$item['raw_unit']}.",
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function product(array $item): InventoryItem
    {
        return InventoryItem::query()->updateOrCreate(
            ['sku' => $item['product_sku']],
            [
                'name' => $item['product_name'],
                'category' => InventoryCategory::DryGoods,
                'supplier' => 'Main Kitchen Production',
                'unit' => 'serving',
                'current_stock' => $item['output'],
                'par_level' => max(5, floor($item['output'] * 0.35)),
                'reorder_point' => max(3, floor($item['output'] * 0.15)),
                'reorder_quantity' => $item['output'],
                'unit_cost' => $item['unit_cost'],
                'daily_usage_rate' => max(1, floor($item['output'] * 0.2)),
                'lead_time_days' => 1,
                'storage_area' => 'Menu / POS',
                'expiration_date' => now()->addDays(3)->toDateString(),
                'status' => InventoryItemStatus::Active,
                'image_path' => $this->productImage($item),
                'is_menu_item' => true,
                'selling_price' => $item['selling_price'],
                'notes' => "Inventory label: {$item['inventory_label']}. Start {$item['output']}, IN {$item['output']}, OUT 0, END {$item['output']}.",
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function productImage(array $item): string
    {
        $directory = 'inventory-items/production-menu';
        $filename = strtolower(str_replace(' ', '-', $item['product_sku'])).'.svg';
        $path = "{$directory}/{$filename}";
        $title = htmlspecialchars($item['product_name'], ENT_QUOTES, 'UTF-8');
        $label = htmlspecialchars($item['inventory_label'], ENT_QUOTES, 'UTF-8');
        $accent = $item['image_accent'];
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="620" viewBox="0 0 900 620">
  <rect width="900" height="620" fill="#fbf8f5"/>
  <rect x="52" y="52" width="796" height="516" rx="42" fill="#ffffff" stroke="#040404" stroke-opacity=".12"/>
  <circle cx="690" cy="190" r="118" fill="{$accent}" opacity=".88"/>
  <circle cx="214" cy="410" r="150" fill="#e3dad0"/>
  <rect x="118" y="126" width="352" height="246" rx="32" fill="#040404"/>
  <path d="M176 268c60-70 162-74 232-4 24 24 39 55 43 88H132c4-31 19-60 44-84Z" fill="{$accent}"/>
  <rect x="160" y="360" width="270" height="34" rx="17" fill="#faa340"/>
  <text x="118" y="466" font-family="Instrument Sans, Arial, sans-serif" font-size="44" font-weight="700" fill="#040404">{$title}</text>
  <text x="118" y="516" font-family="Instrument Sans, Arial, sans-serif" font-size="28" font-weight="500" fill="#040404" opacity=".58">{$label}</text>
</svg>
SVG;

        Storage::disk('public')->put($path, $svg);

        return $path;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function menuItems(): array
    {
        return [
            [
                'product_sku' => 'PT-01',
                'product_name' => 'Crispy Liempo karekare',
                'inventory_label' => 'Liempo chips',
                'raw_sku' => 'PT-001',
                'raw_name' => 'Pork Jowls',
                'raw_quantity' => 10,
                'raw_unit' => 'kg',
                'portion_size' => 120,
                'portion_unit' => 'g',
                'output' => 83,
                'category' => ProductionCategory::Pork,
                'inventory_category' => InventoryCategory::Meat,
                'storage_area' => 'Walk-in Chiller',
                'raw_unit_cost' => 280,
                'unit_cost' => 85,
                'selling_price' => 285,
                'image_accent' => '#faa340',
            ],
            [
                'product_sku' => 'PT-02',
                'product_name' => 'Angus Beef Tapa',
                'inventory_label' => 'Tapa meats',
                'raw_sku' => 'PT-002',
                'raw_name' => 'Beef Excel',
                'raw_quantity' => 5,
                'raw_unit' => 'kg',
                'portion_size' => 120,
                'portion_unit' => 'g',
                'output' => 41,
                'category' => ProductionCategory::Beef,
                'inventory_category' => InventoryCategory::Meat,
                'storage_area' => 'Freezer',
                'raw_unit_cost' => 520,
                'unit_cost' => 115,
                'selling_price' => 320,
                'image_accent' => '#e3dad0',
            ],
            [
                'product_sku' => 'PT-03',
                'product_name' => 'Chicken cutlet',
                'inventory_label' => 'Chicken',
                'raw_sku' => 'PT-003',
                'raw_name' => 'Chicken Breast',
                'raw_quantity' => 5,
                'raw_unit' => 'kg',
                'portion_size' => 100,
                'portion_unit' => 'g',
                'output' => 50,
                'category' => ProductionCategory::Chicken,
                'inventory_category' => InventoryCategory::Meat,
                'storage_area' => 'Walk-in Chiller',
                'raw_unit_cost' => 235,
                'unit_cost' => 70,
                'selling_price' => 245,
                'image_accent' => '#f8992f',
            ],
            [
                'product_sku' => 'PT-04',
                'product_name' => 'Pinoy style Shawarma',
                'inventory_label' => 'Shawarma',
                'raw_sku' => 'PT-004',
                'raw_name' => 'Ground Beef',
                'raw_quantity' => 5,
                'raw_unit' => 'kg',
                'portion_size' => 150,
                'portion_unit' => 'g',
                'output' => 33,
                'category' => ProductionCategory::Beef,
                'inventory_category' => InventoryCategory::Meat,
                'storage_area' => 'Freezer',
                'raw_unit_cost' => 420,
                'unit_cost' => 95,
                'selling_price' => 265,
                'image_accent' => '#faa340',
            ],
            [
                'product_sku' => 'PT-05',
                'product_name' => 'Breaded Chops',
                'inventory_label' => 'Bchops',
                'raw_sku' => 'PT-005',
                'raw_name' => 'Pork chop',
                'raw_quantity' => 2.4,
                'raw_unit' => 'kg',
                'portion_size' => 120,
                'portion_unit' => 'g',
                'output' => 20,
                'category' => ProductionCategory::Pork,
                'inventory_category' => InventoryCategory::Meat,
                'storage_area' => 'Walk-in Chiller',
                'raw_unit_cost' => 295,
                'unit_cost' => 80,
                'selling_price' => 255,
                'image_accent' => '#e3dad0',
            ],
            [
                'product_sku' => 'PT-06',
                'product_name' => 'Bangus Ala Pobre',
                'inventory_label' => 'Bangus',
                'raw_sku' => 'PT-006',
                'raw_name' => 'Bangus',
                'raw_quantity' => 3,
                'raw_unit' => 'kg',
                'portion_size' => 150,
                'portion_unit' => 'g',
                'output' => 20,
                'category' => ProductionCategory::Seafood,
                'inventory_category' => InventoryCategory::Seafood,
                'storage_area' => 'Seafood Chiller',
                'raw_unit_cost' => 260,
                'unit_cost' => 90,
                'selling_price' => 275,
                'image_accent' => '#faa340',
            ],
            [
                'product_sku' => 'PT-07',
                'product_name' => 'Oven Baked Salmon',
                'inventory_label' => 'Salmon',
                'raw_sku' => 'PT-007',
                'raw_name' => 'Salmon',
                'raw_quantity' => 1,
                'raw_unit' => 'kg',
                'portion_size' => 100,
                'portion_unit' => 'g',
                'output' => 10,
                'category' => ProductionCategory::Seafood,
                'inventory_category' => InventoryCategory::Seafood,
                'storage_area' => 'Seafood Chiller',
                'raw_unit_cost' => 720,
                'unit_cost' => 125,
                'selling_price' => 420,
                'image_accent' => '#f8992f',
            ],
        ];
    }
}
