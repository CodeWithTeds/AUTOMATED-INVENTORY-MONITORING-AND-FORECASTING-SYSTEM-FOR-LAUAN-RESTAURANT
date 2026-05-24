<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($request->is('admin/dashboard') && $user?->role === UserRole::Staff) {
            return redirect()->route('staff.dashboard');
        }

        if ($request->is('staff/dashboard') && $user?->role === UserRole::Admin) {
            return redirect()->route('dashboard');
        }

        $page = $user?->role === UserRole::Staff
            ? 'staff/dashboard'
            : 'dashboard';

        return Inertia::render($page, [
            ...$this->dashboardService->getDashboardData(),
            'welcomeMessage' => $this->welcomeMessage($request),
        ]);
    }

    private function welcomeMessage(Request $request): string
    {
        $name = $request->user()?->name;
        $firstName = $name ? explode(' ', trim($name))[0] : 'there';

        return $request->user()?->role === UserRole::Staff
            ? "Welcome back, {$firstName}. Here is today's kitchen and inventory snapshot."
            : "Welcome back, {$firstName}. Here is your management overview for today.";
    }
}
