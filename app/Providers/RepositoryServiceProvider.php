<?php

namespace App\Providers;

use App\Repositories\Inventory\InventoryItemRepository;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Pos\PosOrderRepository;
use App\Repositories\Pos\PosOrderRepositoryInterface;
use App\Repositories\Production\ProductionBatchRepository;
use App\Repositories\Production\ProductionBatchRepositoryInterface;
use App\Repositories\PurchaseOrder\PurchaseOrderRepository;
use App\Repositories\PurchaseOrder\PurchaseOrderRepositoryInterface;
use App\Repositories\Recipe\RecipeBomRepository;
use App\Repositories\Recipe\RecipeBomRepositoryInterface;
use App\Repositories\Supplier\SupplierRepository;
use App\Repositories\Supplier\SupplierRepositoryInterface;
use App\Repositories\TaskRepository;
use App\Repositories\TaskRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TaskRepositoryInterface::class, TaskRepository::class);
        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(InventoryItemRepositoryInterface::class, InventoryItemRepository::class);
        $this->app->singleton(PosOrderRepositoryInterface::class, PosOrderRepository::class);
        $this->app->singleton(ProductionBatchRepositoryInterface::class, ProductionBatchRepository::class);
        $this->app->singleton(PurchaseOrderRepositoryInterface::class, PurchaseOrderRepository::class);
        $this->app->singleton(RecipeBomRepositoryInterface::class, RecipeBomRepository::class);
        $this->app->singleton(SupplierRepositoryInterface::class, SupplierRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void {}
}
