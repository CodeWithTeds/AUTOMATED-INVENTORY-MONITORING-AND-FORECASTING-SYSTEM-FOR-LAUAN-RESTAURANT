<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Inventory\InventoryItemController;
use App\Http\Controllers\Production\ProductionBatchController;
use App\Http\Controllers\Recipe\RecipeBomController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('inventory', InventoryItemController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('production', ProductionBatchController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('recipes', RecipeBomController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

require __DIR__.'/settings.php';
