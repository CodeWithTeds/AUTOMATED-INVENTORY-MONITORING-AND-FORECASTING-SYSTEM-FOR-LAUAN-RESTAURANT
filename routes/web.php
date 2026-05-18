<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Inventory\InventoryItemController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Production\ProductionBatchController;
use App\Http\Controllers\PurchaseOrder\PurchaseOrderController;
use App\Http\Controllers\Recipe\RecipeBomController;
use App\Http\Controllers\Supplier\SupplierController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login.store');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::redirect('/', '/admin/dashboard')->name('admin');
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('inventory', InventoryItemController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('production', ProductionBatchController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('pos/products', [PosController::class, 'products'])
        ->middleware('throttle:120,1')
        ->name('pos.products');
    Route::post('pos/orders', [PosController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('pos.orders.store');
    Route::get('purchase-orders', [PurchaseOrderController::class, 'index'])
        ->name('purchase-orders.index');
    Route::resource('recipes', RecipeBomController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('suppliers/report', [SupplierController::class, 'report'])
        ->name('suppliers.report');
    Route::resource('suppliers', SupplierController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
