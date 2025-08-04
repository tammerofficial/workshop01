<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiDashboardController;

Route::get('/', function () {
    return view('welcome');
});

// API Dashboard Routes
Route::prefix('dashboard')->group(function () {
    Route::get('/', [ApiDashboardController::class, 'index'])->name('api.dashboard');
    Route::get('/status', [ApiDashboardController::class, 'apiStatus'])->name('api.dashboard.status');
    Route::get('/health', [ApiDashboardController::class, 'healthCheck'])->name('api.dashboard.health');
    Route::get('/docs', [ApiDashboardController::class, 'documentation'])->name('api.dashboard.docs');
});
