<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Forecasting\ForecastingController;
use App\Http\Controllers\Inventory\InventoryItemController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Production\ProductionBatchController;
use App\Http\Controllers\PurchaseOrder\PurchaseOrderController;
use App\Http\Controllers\Recipe\RecipeBomController;
use App\Http\Controllers\Report\ReportController;
use App\Http\Controllers\Sales\SalesController;
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
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
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
    Route::patch('purchase-orders/{purchase_order}/status', [PurchaseOrderController::class, 'updateStatus'])
        ->name('purchase-orders.status');
    Route::get('purchase-orders/{purchase_order}/receipt', [PurchaseOrderController::class, 'receipt'])
        ->name('purchase-orders.receipt');
    Route::resource('recipes', RecipeBomController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('suppliers/report', [SupplierController::class, 'report'])
        ->name('suppliers.report');
    Route::resource('suppliers', SupplierController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('sales', [SalesController::class, 'index'])
        ->name('sales.index');
    Route::get('forcasting', [ForecastingController::class, 'index'])
        ->name('forecasting.index');
    Route::get('report', [ReportController::class, 'index'])
        ->name('report.index');
});

require __DIR__.'/settings.php';
