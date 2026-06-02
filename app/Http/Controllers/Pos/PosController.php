<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pos\StorePosOrderRequest;
use App\Http\Requests\Pos\VoidPosOrderRequest;
use App\Http\Resources\PosOrderResource;
use App\Models\PosOrder;
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
        $result = $this->posOrderService->create($request->validated(), (int) $request->user()->id);
        $receipt = PosOrderResource::make($result['order'])->resolve($request);
        $receipt['purchase_order_receipt_url'] = route('purchase-orders.receipt', $result['purchaseOrder'], false);

        return back()
            ->with('success', 'Cash order completed. Receipt is ready and stock was deducted.')
            ->with('receipt', $receipt);
    }

    public function void(VoidPosOrderRequest $request, PosOrder $posOrder): RedirectResponse
    {
        $this->posOrderService->void(
            $posOrder->id,
            (string) $request->validated('admin_pin'),
            (int) $request->user()->id,
        );

        return redirect()->route('pos.index')->with('success', 'POS transaction voided. Stock has been restored.');
    }
}
