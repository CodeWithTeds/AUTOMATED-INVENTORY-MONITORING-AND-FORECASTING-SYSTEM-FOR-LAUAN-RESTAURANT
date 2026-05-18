<?php

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Models\User;

test('authenticated users can view purchase orders', function (): void {
    $user = User::factory()->create();

    $this->withoutVite();

    PurchaseOrder::query()->create([
        'order_number' => 'PO-2026-001',
        'supplier_name' => 'Fresh Market Supplier',
        'status' => PurchaseOrderStatus::Ordered,
        'items_count' => 4,
        'total_amount' => 4200,
        'ordered_at' => '2026-05-18',
        'expected_at' => '2026-05-20',
    ]);

    $this->actingAs($user)
        ->get('/admin/purchase-orders')
        ->assertOk();
});
