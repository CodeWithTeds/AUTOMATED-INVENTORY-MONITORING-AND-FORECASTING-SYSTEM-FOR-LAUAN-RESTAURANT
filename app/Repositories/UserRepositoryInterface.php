<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateStaff(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function findStaff(int $id): User;

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function createStaff(array $attributes): User;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateStaff(User $staff, array $attributes): bool;

    public function deleteStaff(User $staff): bool;

    /**
     * @return array<string, int>
     */
    public function staffSummary(): array;
}
