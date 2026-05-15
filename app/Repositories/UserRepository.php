<?php

namespace App\Repositories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRepository implements UserRepositoryInterface
{
    /**
     * @param  array{email: string, password: string}  $credentials
     */
    public function findByCredentials(array $credentials): ?User
    {
        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function createDefaultAdmin(array $attributes): User
    {
        return User::query()->updateOrCreate(
            ['email' => $attributes['email']],
            [
                'name' => $attributes['name'],
                'password' => $attributes['password'],
                'email_verified_at' => now(),
                'role' => UserRole::Admin,
            ],
        );
    }
}
