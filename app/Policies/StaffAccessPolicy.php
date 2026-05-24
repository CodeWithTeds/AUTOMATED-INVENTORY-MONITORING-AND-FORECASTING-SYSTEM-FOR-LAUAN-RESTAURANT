<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class StaffAccessPolicy
{
    public function viewAdminOnlyPage(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function updateOperationalRecord(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function deleteOperationalRecord(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }
}
