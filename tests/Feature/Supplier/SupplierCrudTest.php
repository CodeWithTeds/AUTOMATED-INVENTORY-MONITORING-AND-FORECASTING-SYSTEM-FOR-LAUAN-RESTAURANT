<?php

use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use App\Models\Supplier;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function supplierRecord(array $attributes = []): Supplier
{
    return Supplier::query()->create(array_merge([
        'code' => 'SUP-001',
        'name' => 'Northern Fresh Trading',
        'category' => SupplierCategory::Produce,
        'contact_person' => 'Maria Santos',
        'phone' => '+63 917 111 2222',
        'email' => 'orders@gmail.com',
        'city' => 'Manila',
        'address' => 'Warehouse 12, Manila',
        'payment_terms' => 'Net 15',
        'lead_time_days' => 2,
        'rating' => 5,
        'status' => SupplierStatus::Preferred,
        'notes' => 'Morning delivery window.',
    ], $attributes));
}

test('authenticated users can view suppliers with filters', function (): void {
    $user = User::factory()->create();
    supplierRecord();
    supplierRecord([
        'code' => 'SUP-002',
        'name' => 'Laguna Packaging Depot',
        'category' => SupplierCategory::Packaging,
        'city' => 'Laguna',
        'status' => SupplierStatus::Watchlist,
        'rating' => 3,
    ]);

    $response = $this->actingAs($user)
        ->get(route('suppliers.index', [
            'category' => SupplierCategory::Produce->value,
            'status' => SupplierStatus::Preferred->value,
        ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('suppliers/index')
            ->where('suppliers.data.0.code', 'SUP-001')
            ->has('suppliers.data', 1)
            ->where('summary.total', 2)
            ->where('summary.preferred', 1));
});

test('authenticated users can create suppliers', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post(route('suppliers.store'), [
            '_token' => 'test-token',
            'code' => 'SUP-101',
            'name' => 'Quezon Dry Goods',
            'category' => SupplierCategory::DryGoods->value,
            'contact_person' => 'Jose Reyes',
            'phone' => '+63 917 333 4444',
            'email' => 'quezon.dry.goods@gmail.com',
            'city' => 'Quezon City',
            'address' => 'Main warehouse',
            'payment_terms' => 'COD',
            'lead_time_days' => 3,
            'rating' => 4,
            'status' => SupplierStatus::Active->value,
            'notes' => 'Calls before dispatch.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('suppliers', [
        'code' => 'SUP-101',
        'name' => 'Quezon Dry Goods',
        'status' => SupplierStatus::Active->value,
    ]);
});

test('authenticated users can update and delete suppliers', function (): void {
    $user = User::factory()->create();
    $supplier = supplierRecord();

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->put(route('suppliers.update', $supplier), [
            '_token' => 'test-token',
            'code' => 'SUP-001',
            'name' => 'Northern Fresh Trading Updated',
            'category' => SupplierCategory::Produce->value,
            'contact_person' => 'Maria Santos',
            'phone' => '+63 917 111 2222',
            'email' => 'orders@gmail.com',
            'city' => 'Manila',
            'address' => 'Warehouse 12, Manila',
            'payment_terms' => 'Net 30',
            'lead_time_days' => 4,
            'rating' => 4,
            'status' => SupplierStatus::Active->value,
            'notes' => 'Updated terms.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'name' => 'Northern Fresh Trading Updated',
        'payment_terms' => 'Net 30',
    ]);

    $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->delete(route('suppliers.destroy', $supplier), [
            '_token' => 'test-token',
        ])
        ->assertRedirect();

    $this->assertSoftDeleted('suppliers', [
        'id' => $supplier->id,
    ]);
});

test('authenticated users can download compact filtered supplier reports', function (): void {
    $user = User::factory()->create();
    supplierRecord();

    $response = $this->actingAs($user)
        ->get(route('suppliers.report', ['search' => 'Northern']));

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('supplier-report');
    expect($response->streamedContent())->toContain('Northern Fresh Trading');
});
