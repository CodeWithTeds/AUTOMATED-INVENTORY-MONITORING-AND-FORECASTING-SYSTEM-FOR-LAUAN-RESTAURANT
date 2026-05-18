<?php

namespace App\Http\Controllers\Forecasting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Forecasting\ForecastingFilterRequest;
use App\Services\Forecasting\ForecastingService;
use Inertia\Inertia;
use Inertia\Response;

class ForecastingController extends Controller
{
    public function __construct(private readonly ForecastingService $forecastingService) {}

    public function index(ForecastingFilterRequest $request): Response
    {
        return Inertia::render('forecasting/index', $this->forecastingService->getDashboardData($request->filters()));
    }
}
