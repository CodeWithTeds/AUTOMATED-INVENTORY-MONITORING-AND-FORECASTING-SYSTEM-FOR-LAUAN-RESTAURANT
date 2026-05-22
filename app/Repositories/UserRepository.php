<?php

namespace App\Repositories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
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

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateStaff(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->staffQuery($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findStaff(int $id): User
    {
        return User::query()
            ->where('role', UserRole::Staff->value)
            ->findOrFail($id);
    }

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function createStaff(array $attributes): User
    {
        return User::query()->create([
            'name' => $attributes['name'],
            'email' => $attributes['email'],
            'password' => $attributes['password'],
            'email_verified_at' => now(),
            'role' => UserRole::Staff,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateStaff(User $staff, array $attributes): bool
    {
        return $staff->update([
            ...$attributes,
            'role' => UserRole::Staff,
        ]);
    }

    public function deleteStaff(User $staff): bool
    {
        return $staff->delete();
    }

    /**
     * @return array<string, int>
     */
    public function staffSummary(): array
    {
        return [
            'total' => User::query()->where('role', UserRole::Staff->value)->count(),
            'verified' => User::query()
                ->where('role', UserRole::Staff->value)
                ->whereNotNull('email_verified_at')
                ->count(),
            'created_this_month' => User::query()
                ->where('role', UserRole::Staff->value)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function staffQuery(array $filters): Builder
    {
        $sortable = ['name', 'email', 'created_at'];
        $sort = in_array($filters['sort'] ?? '', $sortable, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? '') === 'desc' ? 'desc' : 'asc';

        return User::query()
            ->where('role', UserRole::Staff->value)
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->orderBy('id');
    }
}
