<?php

namespace App\Http\Controllers\Staff;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Services\Staff\StaffService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function __construct(private readonly StaffService $staff) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->role === UserRole::Admin, 403);

        $filters = $this->filters($request);
        $paginator = $this->staff->paginate($filters, 15);

        return Inertia::render('staff/index', [
            'staff' => $this->paginatedStaff($paginator),
            'filters' => $filters,
            'summary' => $this->staff->summary(),
        ]);
    }

    public function store(StoreStaffRequest $request): RedirectResponse
    {
        $this->staff->create($request->validated());

        return back()->with('success', 'Staff account created successfully.');
    }

    public function update(UpdateStaffRequest $request, string $staff): RedirectResponse
    {
        $this->staff->update((int) $staff, $request->validated());

        return back()->with('success', 'Staff account updated successfully.');
    }

    public function destroy(Request $request, string $staff): RedirectResponse
    {
        abort_unless($request->user()?->role === UserRole::Admin, 403);

        $this->staff->delete((int) $staff);

        return back()->with('success', 'Staff account deleted successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request): array
    {
        return array_filter(
            $request->only(['search', 'sort', 'direction']),
            fn ($value) => $value !== null && $value !== '',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function paginatedStaff(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => StaffResource::collection($paginator->items())->resolve(),
            'links' => $this->paginationLinks($paginator),
            'meta' => [
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    /**
     * @return array<int, array{url: string|null, label: string, active: bool}>
     */
    private function paginationLinks(LengthAwarePaginator $paginator): array
    {
        $links = [
            [
                'url' => $paginator->previousPageUrl(),
                'label' => '&laquo; Previous',
                'active' => false,
            ],
        ];

        foreach ($paginator->getUrlRange(1, $paginator->lastPage()) as $page => $url) {
            $links[] = [
                'url' => $url,
                'label' => (string) $page,
                'active' => $page === $paginator->currentPage(),
            ];
        }

        $links[] = [
            'url' => $paginator->nextPageUrl(),
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }
}
