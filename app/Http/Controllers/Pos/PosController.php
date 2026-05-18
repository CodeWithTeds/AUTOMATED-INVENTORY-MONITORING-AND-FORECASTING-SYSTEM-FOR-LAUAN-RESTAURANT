<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pos\StorePosOrderRequest;
use App\Http\Resources\PosOrderResource;
use App\Services\Pos\PosOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(private readonly PosOrderService $posOrderService) {}

    public function index(): Response
    {
        return Inertia::render('pos/index', $this->posOrderService->indexData());
    }

    public function products(): JsonResponse
    {
        return response()->json(['products' => $this->posOrderService->products()]);
    }

    public function store(StorePosOrderRequest $request): RedirectResponse
    {
        $order = $this->posOrderService->create($request->validated(), (int) $request->user()->id);

        return back()
            ->with('success', 'Cash order completed. Receipt is ready and stock was deducted.')
            ->with('receipt', PosOrderResource::make($order)->resolve($request));
    }
}
