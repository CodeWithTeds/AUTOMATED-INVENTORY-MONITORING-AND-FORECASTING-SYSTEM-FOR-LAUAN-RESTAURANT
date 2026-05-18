<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrder\UpdatePurchaseOrderStatusRequest;
use App\Services\PurchaseOrder\PurchaseOrderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(private readonly PurchaseOrderService $purchaseOrderService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('purchase-orders/index', $this->purchaseOrderService->indexData($request->only(['search', 'status', 'sort', 'direction'])));
    }

    public function updateStatus(UpdatePurchaseOrderStatusRequest $request, string $purchaseOrder): RedirectResponse
    {
        $this->purchaseOrderService->updateStatus((int) $purchaseOrder, (string) $request->validated('status'));

        return back()->with('success', 'Purchase order status updated.');
    }

    public function receipt(string $purchaseOrder)
    {
        $purchaseOrderModel = $this->purchaseOrderService->find((int) $purchaseOrder);
        $filename = strtolower($purchaseOrderModel->order_number).'-receipt.pdf';

        $pdf = Pdf::loadView('receipts.purchase-order', [
            'purchaseOrder' => $purchaseOrderModel,
        ])->setPaper([0, 0, 226.77, 600]); // 80mm width thermal paper approximation

        return $pdf->download($filename);
    }
}
