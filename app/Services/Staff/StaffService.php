<?php

namespace App\Services\Staff;

use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StaffService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->users->paginateStaff($filters, $perPage);
    }

    /**
     * @return array<string, int>
     */
    public function summary(): array
    {
        return $this->users->staffSummary();
    }

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function create(array $attributes): User
    {
        return $this->users->createStaff($attributes);
    }

    /**
     * @param  array{name: string, email: string, password?: string|null}  $attributes
     */
    public function update(int $id, array $attributes): User
    {
        $staff = $this->users->findStaff($id);

        if (empty($attributes['password'])) {
            unset($attributes['password']);
        }

        $this->users->updateStaff($staff, $attributes);

        return $staff->refresh();
    }

    public function delete(int $id): bool
    {
        return $this->users->deleteStaff($this->users->findStaff($id));
    }
}
