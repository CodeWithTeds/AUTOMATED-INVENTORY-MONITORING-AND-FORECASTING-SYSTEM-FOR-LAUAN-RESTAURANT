<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('summary')
            ->has('statCards', 4)
            ->has('monthlyPerformance', 12)
            ->has('productionStatusMix')
            ->has('forecastAlerts')
            ->has('quickOverviewMix'));
});

test('staff users have their own dashboard', function () {
    $user = User::factory()->staff()->create();

    $this->actingAs($user)
        ->get(route('staff.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('staff/dashboard')
            ->has('summary')
            ->has('statCards', 4)
            ->has('forecastAlerts')
            ->has('welcomeMessage'));
});
