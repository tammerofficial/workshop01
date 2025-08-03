<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\System\PluginController;

/*
|--------------------------------------------------------------------------
| Plugin API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('plugins')->middleware(['api'])->group(function () {
    // Plugin management routes
    Route::get('/', [PluginController::class, 'index']);
    Route::post('/', [PluginController::class, 'store']);
    Route::get('/marketplace', [PluginController::class, 'marketplace']);
    Route::get('/{plugin}', [PluginController::class, 'show']);
    Route::put('/{plugin}', [PluginController::class, 'update']);
    Route::delete('/{plugin}', [PluginController::class, 'destroy']);
    
    // Plugin actions
    Route::post('/{plugin}/activate', [PluginController::class, 'activate']);
    Route::post('/{plugin}/deactivate', [PluginController::class, 'deactivate']);
});
