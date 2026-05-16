<?php

namespace App\Http\Controllers\Recipe;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recipe\StoreRecipeBomRequest;
use App\Http\Requests\Recipe\UpdateRecipeBomRequest;
use App\Services\Recipe\RecipeBomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeBomController extends Controller
{
    public function __construct(private readonly RecipeBomService $recipeBomService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('recipes/index', $this->recipeBomService->indexData($request->only(['search', 'sort', 'direction'])));
    }

    public function store(StoreRecipeBomRequest $request): RedirectResponse
    {
        $this->recipeBomService->create($request->validated());

        return back()->with('success', 'Recipe / BOM created successfully.');
    }

    public function update(UpdateRecipeBomRequest $request, string $recipe): RedirectResponse
    {
        $this->recipeBomService->update((int) $recipe, $request->validated());

        return back()->with('success', 'Recipe / BOM updated successfully.');
    }

    public function destroy(string $recipe): RedirectResponse
    {
        $this->recipeBomService->delete((int) $recipe);

        return back()->with('success', 'Recipe / BOM deleted successfully.');
    }
}
