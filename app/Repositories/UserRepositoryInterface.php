<?php

namespace App\Repositories;

use App\Models\User;

interface UserRepositoryInterface
{
    /**
     * @param  array{email: string, password: string}  $credentials
     */
    public function findByCredentials(array $credentials): ?User;

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function createDefaultAdmin(array $attributes): User;
}
