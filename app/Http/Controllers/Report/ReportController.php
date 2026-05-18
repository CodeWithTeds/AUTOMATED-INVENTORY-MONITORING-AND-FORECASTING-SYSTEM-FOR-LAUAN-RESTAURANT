<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\ReportFilterRequest;
use App\Services\Report\ReportsService;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private readonly ReportsService $reportsService) {}

    public function index(ReportFilterRequest $request): Response
    {
        return Inertia::render('reports/index', $this->reportsService->getDashboardData($request->filters()));
    }
}
