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
        if ($request->is('admin/dashboard') && $request->user()?->role === UserRole::Staff) {
            return redirect()->route('staff.dashboard');
        }

        return Inertia::render('dashboard', $this->dashboardService->getDashboardData());
    }
}
