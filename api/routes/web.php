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

// UI Preview (Blade + Alpine.js)
Route::prefix('ui')->group(function () {
    Route::get('/', function () { return view('modules.dashboard.index'); })->name('ui.dashboard');
    Route::get('/orders', function () { return view('modules.orders.index'); })->name('ui.orders');
    Route::get('/inventory', function () { return view('modules.inventory.index'); })->name('ui.inventory');
    Route::get('/reports', function () { return view('modules.reports.index'); })->name('ui.reports');
});

// UI Routes for Human Resources
Route::prefix('ui/hr')->group(function () {
    // Workers
    Route::get('/workers', function () { return view('modules.workers.index'); })->name('ui.workers.index');
    Route::get('/workers/create', function () { return view('modules.workers.create'); })->name('ui.workers.create');
    
    // Payroll
    Route::get('/payroll', function () { return view('modules.payroll.index'); })->name('ui.payroll.index');
    
    // Biometrics
    Route::get('/biometrics', function () { return view('modules.biometrics.index'); })->name('ui.biometrics.index');
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});
