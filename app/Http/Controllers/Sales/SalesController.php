<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Services\Sales\SalesService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function __construct(private readonly SalesService $salesService) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date', 'payment_method', 'search']);
        $data = $this->salesService->getSalesDashboardData($filters);

        return Inertia::render('sales/index', $data);
    }
}
