<?php

namespace App\Providers;

use App\Policies\StaffAccessPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureAuthorization();
        $this->configureDefaults();
    }

    /**
     * Configure authorization policies used by staff/admin routes.
     */
    protected function configureAuthorization(): void
    {
        Gate::define('view-admin-only-page', [StaffAccessPolicy::class, 'viewAdminOnlyPage']);
        Gate::define('update-operational-record', [StaffAccessPolicy::class, 'updateOperationalRecord']);
        Gate::define('delete-operational-record', [StaffAccessPolicy::class, 'deleteOperationalRecord']);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
