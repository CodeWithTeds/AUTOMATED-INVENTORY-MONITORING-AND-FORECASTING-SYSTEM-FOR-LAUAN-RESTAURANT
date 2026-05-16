<?php

namespace App\Providers;

use App\Repositories\Inventory\InventoryItemRepository;
use App\Repositories\Inventory\InventoryItemRepositoryInterface;
use App\Repositories\Production\ProductionBatchRepository;
use App\Repositories\Production\ProductionBatchRepositoryInterface;
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
        $this->app->singleton(ProductionBatchRepositoryInterface::class, ProductionBatchRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void {}
}
