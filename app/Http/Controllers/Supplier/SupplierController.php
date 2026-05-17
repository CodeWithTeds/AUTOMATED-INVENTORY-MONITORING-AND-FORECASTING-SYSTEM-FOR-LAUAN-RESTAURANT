<?php

namespace App\Http\Controllers\Supplier;

use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Repositories\Supplier\SupplierRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SupplierController extends Controller
{
    public function __construct(private readonly SupplierRepositoryInterface $suppliers) {}

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $paginator = $this->suppliers->paginateForSuppliers($filters, 15);

        return Inertia::render('suppliers/index', [
            'suppliers' => $this->paginatedSuppliers($paginator),
            'filters' => $filters,
            'summary' => $this->suppliers->summary(),
            'categoryOptions' => $this->enumOptions(SupplierCategory::cases()),
            'statusOptions' => $this->enumOptions(SupplierStatus::cases()),
            'cityOptions' => $this->suppliers->cities(),
        ]);
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $attributes = $request->validated();
        $attributes['code'] = empty($attributes['code'])
            ? $this->suppliers->nextCode()
            : $attributes['code'];

        $this->suppliers->create($attributes);

        return back()->with('success', 'Supplier created successfully.');
    }

    public function update(UpdateSupplierRequest $request, string $supplier): RedirectResponse
    {
        $supplierModel = $this->suppliers->find((int) $supplier);
        $attributes = $request->validated();
        $attributes['code'] = empty($attributes['code'])
            ? $supplierModel->code
            : $attributes['code'];

        $this->suppliers->update(
            $supplierModel,
            $attributes,
        );

        return back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(string $supplier): RedirectResponse
    {
        $this->suppliers->delete($this->suppliers->find((int) $supplier));

        return back()->with('success', 'Supplier deleted successfully.');
    }

    public function report(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $rows = $this->suppliers->reportRows($filters);
        $filename = 'supplier-report-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($rows): void {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                return;
            }

            fputcsv($output, [
                'Code',
                'Supplier',
                'Category',
                'Contact',
                'Location',
                'Terms',
                'Status',
            ]);

            foreach ($rows as $supplier) {
                $category = $supplier->category instanceof SupplierCategory
                    ? $supplier->category->label()
                    : (string) $supplier->category;
                $status = $supplier->status instanceof SupplierStatus
                    ? $supplier->status->label()
                    : (string) $supplier->status;

                fputcsv($output, [
                    $supplier->code,
                    $supplier->name,
                    $category,
                    trim(implode(' / ', array_filter([
                        $supplier->contact_person,
                        $supplier->phone,
                        $supplier->email,
                    ]))),
                    $supplier->city ?: 'Unspecified',
                    trim(($supplier->payment_terms ?: 'Terms TBD').' | '.$supplier->lead_time_days.'d | '.$supplier->rating.'/5'),
                    $status,
                ]);
            }

            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request): array
    {
        return array_filter(
            $request->only(['search', 'category', 'status', 'city', 'rating', 'sort', 'direction']),
            fn ($value) => $value !== null && $value !== '',
        );
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function enumOptions(array $cases): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], $cases);
    }

    /**
     * @return array<string, mixed>
     */
    private function paginatedSuppliers(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => SupplierResource::collection($paginator->items())->resolve(),
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
