<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->users->createDefaultAdmin([
            'name' => env('DEFAULT_ADMIN_NAME', 'Renz Admin'),
            'email' => env('DEFAULT_ADMIN_EMAIL', 'admin@aimfs.test'),
            'password' => env('DEFAULT_ADMIN_PASSWORD', 'password'),
        ]);

        $this->call(InventoryItemSeeder::class);
        $this->call(LauanProductionMenuSeeder::class);
    }
}
