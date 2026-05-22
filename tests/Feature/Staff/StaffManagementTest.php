<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

function adminUser(array $attributes = []): User
{
    return User::factory()->create(array_merge([
        'role' => UserRole::Admin,
    ], $attributes));
}

function staffUser(array $attributes = []): User
{
    return User::factory()->create(array_merge([
        'role' => UserRole::Staff,
    ], $attributes));
}

test('admins can view staff accounts', function (): void {
    $admin = adminUser();
    staffUser([
        'name' => 'Maria Staff',
        'email' => 'maria.staff@aimfs.test',
    ]);

    $this->actingAs($admin)
        ->get(route('staff.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('staff/index')
            ->where('staff.data.0.name', 'Maria Staff')
            ->where('summary.total', 1));
});

test('admins can create login-ready staff accounts', function (): void {
    $admin = adminUser();

    $this->actingAs($admin)
        ->withSession(['_token' => 'test-token'])
        ->post(route('staff.store'), [
            '_token' => 'test-token',
            'name' => 'Juan Staff',
            'email' => 'juan.staff@aimfs.test',
            'password' => 'staff-password',
            'password_confirmation' => 'staff-password',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $staff = User::query()->where('email', 'juan.staff@aimfs.test')->firstOrFail();

    expect($staff->role)->toBe(UserRole::Staff)
        ->and($staff->email_verified_at)->not->toBeNull()
        ->and(Hash::check('staff-password', $staff->password))->toBeTrue();

    Auth::logout();

    $this->post(route('login.store'), [
        'email' => 'juan.staff@aimfs.test',
        'password' => 'staff-password',
        'remember' => false,
    ])->assertRedirect('/staff/dashboard');
});

test('staff users are redirected away from the admin dashboard url', function (): void {
    $staff = staffUser();

    $this->actingAs($staff)
        ->get('/admin/dashboard')
        ->assertRedirect(route('staff.dashboard'));
});

test('admins can update and delete staff accounts', function (): void {
    $admin = adminUser();
    $staff = staffUser([
        'name' => 'Old Staff',
        'email' => 'old.staff@aimfs.test',
    ]);

    $this->actingAs($admin)
        ->withSession(['_token' => 'test-token'])
        ->put(route('staff.update', $staff), [
            '_token' => 'test-token',
            'name' => 'Updated Staff',
            'email' => 'updated.staff@aimfs.test',
            'password' => 'updated-password',
            'password_confirmation' => 'updated-password',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $staff->refresh();

    expect($staff->name)->toBe('Updated Staff')
        ->and($staff->email)->toBe('updated.staff@aimfs.test')
        ->and($staff->role)->toBe(UserRole::Staff)
        ->and(Hash::check('updated-password', $staff->password))->toBeTrue();

    $this->actingAs($admin)
        ->withSession(['_token' => 'test-token'])
        ->delete(route('staff.destroy', $staff), [
            '_token' => 'test-token',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('users', [
        'id' => $staff->id,
    ]);
});

test('staff users cannot manage staff accounts', function (): void {
    $staff = staffUser();

    $this->actingAs($staff)
        ->get(route('staff.index'))
        ->assertForbidden();

    $this->actingAs($staff)
        ->withSession(['_token' => 'test-token'])
        ->post(route('staff.store'), [
            '_token' => 'test-token',
            'name' => 'Blocked Staff',
            'email' => 'blocked.staff@aimfs.test',
            'password' => 'staff-password',
            'password_confirmation' => 'staff-password',
        ])
        ->assertForbidden();
});
