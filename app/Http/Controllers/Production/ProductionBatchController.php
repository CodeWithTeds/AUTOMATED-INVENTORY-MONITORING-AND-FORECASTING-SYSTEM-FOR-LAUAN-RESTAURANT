<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Http\Requests\Production\StoreProductionBatchRequest;
use App\Http\Requests\Production\UpdateProductionBatchRequest;
use App\Services\Production\ProductionBatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductionBatchController extends Controller
{
    public function __construct(private readonly ProductionBatchService $productionBatchService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('production/index', $this->productionBatchService->indexData($request->only(['search', 'category', 'status', 'production_area', 'sort', 'direction'])));
    }

    public function store(StoreProductionBatchRequest $request): RedirectResponse
    {
        $this->productionBatchService->create($request->validated());

        return back()->with('success', 'Production batch created successfully.');
    }

    public function update(UpdateProductionBatchRequest $request, string $production): RedirectResponse
    {
        $this->productionBatchService->update((int) $production, $request->validated());

        return back()->with('success', 'Production batch updated successfully.');
    }

    public function destroy(string $production): RedirectResponse
    {
        $this->productionBatchService->delete((int) $production);

        return back()->with('success', 'Production batch deleted successfully.');
    }
}
