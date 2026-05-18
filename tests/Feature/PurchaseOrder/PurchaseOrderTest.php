<?php

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated users can view purchase orders', function (): void {
    $user = User::factory()->create();

    $this->withoutVite();

    PurchaseOrder::query()->create([
        'order_number' => 'PO-2026-001',
        'supplier_name' => 'Fresh Market Supplier',
        'status' => PurchaseOrderStatus::Pending,
        'items_count' => 4,
        'total_amount' => 4200,
        'ordered_at' => '2026-05-18',
        'expected_at' => '2026-05-20',
    ]);

    $this->actingAs($user)
        ->get('/admin/purchase-orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('purchase-orders/index')
            ->where('purchaseOrders.data.0.status', PurchaseOrderStatus::Pending->value)
            ->where('purchaseOrders.data.0.status_label', 'Pending'));
});

test('authenticated users can download a purchase order receipt', function (): void {
    $user = User::factory()->create();

    $purchaseOrder = PurchaseOrder::query()->create([
        'order_number' => 'PO-2026-002',
        'supplier_name' => 'Receipt Supplier',
        'status' => PurchaseOrderStatus::Pending,
        'items_count' => 2,
        'total_amount' => 1250,
        'ordered_at' => '2026-05-18',
        'expected_at' => '2026-05-20',
        'notes' => 'Receipt test order.',
    ]);

    $response = $this->actingAs($user)
        ->get("/admin/purchase-orders/{$purchaseOrder->id}/receipt");

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('po-2026-002-receipt');
    expect($response->streamedContent())
        ->toContain('PURCHASE ORDER RECEIPT')
        ->toContain('Status: Pending')
        ->toContain('Receipt Supplier');
});
