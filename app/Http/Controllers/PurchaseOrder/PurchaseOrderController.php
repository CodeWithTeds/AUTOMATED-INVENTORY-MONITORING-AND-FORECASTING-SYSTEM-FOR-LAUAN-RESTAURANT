<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Services\PurchaseOrder\PurchaseOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseOrderController extends Controller
{
    public function __construct(private readonly PurchaseOrderService $purchaseOrderService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('purchase-orders/index', $this->purchaseOrderService->indexData($request->only(['search', 'status', 'sort', 'direction'])));
    }

    public function receipt(string $purchaseOrder): StreamedResponse
    {
        $purchaseOrderModel = $this->purchaseOrderService->find((int) $purchaseOrder);
        $filename = strtolower($purchaseOrderModel->order_number).'-receipt.txt';

        return response()->streamDownload(function () use ($purchaseOrderModel): void {
            echo $this->purchaseOrderService->receiptText($purchaseOrderModel);
        }, $filename, ['Content-Type' => 'text/plain']);
    }
}
