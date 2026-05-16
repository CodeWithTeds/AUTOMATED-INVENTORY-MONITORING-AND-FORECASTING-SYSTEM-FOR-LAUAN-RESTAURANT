<?php

namespace Database\Seeders;

use App\Enums\InventoryCategory;
use App\Enums\InventoryItemStatus;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use Illuminate\Database\Seeder;

class InventoryItemSeeder extends Seeder
{
    public function __construct(
        private readonly InventoryItemRepositoryInterface $inventoryItems,
    ) {}

    public function run(): void
    {
        foreach ($this->items() as $item) {
            $this->inventoryItems->updateOrCreateBySku($item);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function items(): array
    {
        return [
            $this->item('LR-MEAT-001', 'Chicken Breast Fillet', InventoryCategory::Meat, 'kg', 28, 40, 18, 25, 235, 6, 2, 'Walk-in Chiller', 8),
            $this->item('LR-MEAT-002', 'Pork Belly Slab', InventoryCategory::Meat, 'kg', 12, 30, 14, 20, 310, 4, 2, 'Walk-in Chiller', 7, InventoryItemStatus::Watchlist),
            $this->item('LR-MEAT-003', 'Beef Sirloin', InventoryCategory::Meat, 'kg', 9, 20, 10, 15, 520, 3, 3, 'Freezer', 18, InventoryItemStatus::Watchlist),
            $this->item('LR-SEA-001', 'Fresh Bangus', InventoryCategory::Seafood, 'kg', 6, 22, 8, 16, 260, 5, 1, 'Seafood Chiller', 3, InventoryItemStatus::Watchlist),
            $this->item('LR-DRY-001', 'Sinandomeng Rice', InventoryCategory::DryGoods, 'sack', 18, 24, 8, 12, 1380, 1.2, 5, 'Dry Storage', 120),
            $this->item('LR-DRY-002', 'All-purpose Flour', InventoryCategory::DryGoods, 'kg', 16, 20, 7, 12, 68, 1.5, 3, 'Dry Storage', 90),
            $this->item('LR-DRY-003', 'White Sugar', InventoryCategory::DryGoods, 'kg', 22, 25, 8, 12, 82, 1.1, 3, 'Dry Storage', 120),
            $this->item('LR-PRO-001', 'Red Onion', InventoryCategory::Produce, 'kg', 14, 25, 10, 15, 130, 3, 2, 'Produce Rack', 10),
            $this->item('LR-PRO-002', 'Garlic', InventoryCategory::Produce, 'kg', 8, 16, 6, 10, 165, 1.8, 2, 'Produce Rack', 14),
            $this->item('LR-PRO-003', 'Tomato', InventoryCategory::Produce, 'kg', 5, 18, 7, 12, 95, 4, 1, 'Produce Chiller', 5, InventoryItemStatus::Watchlist),
            $this->item('LR-DAI-001', 'Fresh Milk', InventoryCategory::Dairy, 'liter', 10, 18, 8, 12, 92, 2.5, 2, 'Dairy Chiller', 6),
            $this->item('LR-DAI-002', 'Eggs Large', InventoryCategory::Dairy, 'tray', 7, 16, 6, 10, 235, 1.2, 2, 'Dairy Chiller', 12),
            $this->item('LR-CON-001', 'Soy Sauce', InventoryCategory::Condiment, 'liter', 9, 14, 5, 8, 78, 0.6, 4, 'Sauce Shelf', 180),
            $this->item('LR-CON-002', 'Fish Sauce', InventoryCategory::Condiment, 'liter', 4, 12, 5, 8, 85, 0.7, 4, 'Sauce Shelf', 180, InventoryItemStatus::Watchlist),
            $this->item('LR-PKG-001', 'Takeout Meal Box', InventoryCategory::Packaging, 'pack', 11, 30, 12, 20, 145, 3, 3, 'Packaging Shelf', 365, InventoryItemStatus::Watchlist),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function item(
        string $sku,
        string $name,
        InventoryCategory $category,
        string $unit,
        float $currentStock,
        float $parLevel,
        float $reorderPoint,
        float $reorderQuantity,
        float $unitCost,
        float $dailyUsageRate,
        int $leadTimeDays,
        string $storageArea,
        int $expiresInDays,
        InventoryItemStatus $status = InventoryItemStatus::Active,
    ): array {
        return [
            'sku' => $sku,
            'name' => $name,
            'category' => $category,
            'supplier' => 'Lauan Preferred Supplier',
            'unit' => $unit,
            'current_stock' => $currentStock,
            'par_level' => $parLevel,
            'reorder_point' => $reorderPoint,
            'reorder_quantity' => $reorderQuantity,
            'unit_cost' => $unitCost,
            'daily_usage_rate' => $dailyUsageRate,
            'lead_time_days' => $leadTimeDays,
            'storage_area' => $storageArea,
            'expiration_date' => now()->addDays($expiresInDays)->toDateString(),
            'status' => $status,
            'is_menu_item' => false,
            'selling_price' => null,
            'notes' => 'Raw material seed for production consumption and inventory forecasting.',
        ];
    }
}
