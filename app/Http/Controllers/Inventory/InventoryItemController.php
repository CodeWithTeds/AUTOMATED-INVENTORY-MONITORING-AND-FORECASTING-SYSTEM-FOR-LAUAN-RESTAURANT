<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryItemRequest;
use App\Http\Requests\Inventory\UpdateInventoryItemRequest;
use App\Services\Inventory\InventoryItemService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    public function __construct(private readonly InventoryItemService $inventoryItemService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('inventory/index', $this->inventoryItemService->indexData($request->only(['search', 'category', 'status', 'stock_state', 'storage_area', 'sort', 'direction'])));
    }

    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        try {
            $this->inventoryItemService->create($request->validated());
        } catch (UniqueConstraintViolationException) {
            return back()->withErrors(['sku' => 'This SKU already exists. Please use a different SKU or leave blank to auto-generate.'])->withInput();
        }

        return back()->with('success', 'Inventory product created successfully.');
    }

    public function update(UpdateInventoryItemRequest $request, string $inventory): RedirectResponse
    {
        $this->inventoryItemService->update((int) $inventory, $request->validated());

        return back()->with('success', 'Inventory product updated successfully.');
    }

    public function destroy(string $inventory): RedirectResponse
    {
        $this->inventoryItemService->delete((int) $inventory);

        return back()->with('success', 'Inventory product deleted successfully.');
    }
}
