<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        return $request->user()
            ? redirect()->to($this->homePathFor($request->user()->role))
            : Inertia::render('auth/login', [
                'canResetPassword' => Features::enabled(Features::resetPasswords()),
                'canRegister' => Features::enabled(Features::registration()),
                'status' => $request->session()->get('status'),
            ]);
    }

    public function store(LoginRequest $request, UserRepositoryInterface $users): RedirectResponse
    {
        $user = $users->findByCredentials($request->credentials());

        throw_if(! $user, ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]));

        Auth::guard('web')->login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended($this->homePathFor($user->role));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    private function homePathFor(UserRole|string|null $role): string
    {
        return $role === UserRole::Staff || $role === UserRole::Staff->value
            ? route('staff.dashboard', absolute: false)
            : route('dashboard', absolute: false);
    }
}
