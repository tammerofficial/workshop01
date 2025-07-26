<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WorkerController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\MeasurementController;
use App\Http\Controllers\DashboardController;
use App\Services\WooCommerceService;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Dashboard Routes
Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('dashboard/recent-orders', [DashboardController::class, 'getRecentOrders']);
Route::get('dashboard/recent-tasks', [DashboardController::class, 'getRecentTasks']);

// Workers Routes
Route::apiResource('workers', WorkerController::class);
Route::patch('workers/{worker}/activate', [WorkerController::class, 'activate']);
Route::patch('workers/{worker}/deactivate', [WorkerController::class, 'deactivate']);

// Materials Routes
Route::apiResource('materials', MaterialController::class);
Route::get('materials/low-stock', [MaterialController::class, 'lowStock']);

// Categories Routes
Route::apiResource('categories', CategoryController::class);

// Clients Routes
Route::apiResource('clients', ClientController::class);

// Orders Routes
Route::apiResource('orders', OrderController::class);
Route::patch('orders/{order}/assign-worker', [OrderController::class, 'assignWorker']);
Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);

// Tasks Routes
Route::apiResource('tasks', TaskController::class);
Route::patch('tasks/{task}/start', [TaskController::class, 'startTask']);
Route::patch('tasks/{task}/complete', [TaskController::class, 'completeTask']);

// Measurements Routes
Route::apiResource('measurements', MeasurementController::class);
Route::get('measurements/client/{clientId}', [MeasurementController::class, 'getByClient']);

// Invoices Routes
Route::apiResource('invoices', InvoiceController::class);
Route::patch('invoices/{invoice}/mark-paid', [InvoiceController::class, 'markAsPaid']);
Route::patch('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus']);

// WooCommerce Import Routes
Route::prefix('woocommerce')->group(function () {
    Route::post('import/customers', function () {
        $service = new WooCommerceService();
        $imported = $service->importCustomers();
        return response()->json(['message' => "Imported {$imported} customers successfully"]);
    });

    Route::post('import/orders', function () {
        $service = new WooCommerceService();
        $imported = $service->importOrders();
        return response()->json(['message' => "Imported {$imported} orders successfully"]);
    });

    Route::post('import/products', function () {
        $service = new WooCommerceService();
        $imported = $service->importProducts();
        return response()->json(['message' => "Imported {$imported} products successfully"]);
    });

    Route::post('import/all', function () {
        $service = new WooCommerceService();
        $customers = $service->importCustomers();
        $products = $service->importProducts();
        $orders = $service->importOrders();
        
        return response()->json([
            'message' => "Import completed successfully",
            'imported' => [
                'customers' => $customers,
                'products' => $products,
                'orders' => $orders
            ]
        ]);
    });
});

// Dashboard/Analytics Routes
Route::get('dashboard/stats', function () {
    return response()->json([
        'workers_count' => \App\Models\Worker::where('is_active', true)->count(),
        'orders_count' => \App\Models\Order::count(),
        'pending_orders' => \App\Models\Order::where('status', 'pending')->count(),
        'in_progress_orders' => \App\Models\Order::where('status', 'in_progress')->count(),
        'completed_orders' => \App\Models\Order::where('status', 'completed')->count(),
        'clients_count' => \App\Models\Client::count(),
        'materials_count' => \App\Models\Material::where('is_active', true)->count(),
        'low_stock_materials' => \App\Models\Material::whereColumn('quantity', '<=', 'reorder_level')->count(),
        'unpaid_invoices' => \App\Models\Invoice::where('status', '!=', 'paid')->count(),
        'total_revenue' => \App\Models\Invoice::where('status', 'paid')->sum('total_amount'),
    ]);
});

Route::get('dashboard/recent-orders', function () {
    return response()->json(
        \App\Models\Order::with(['client', 'worker', 'category'])
            ->latest()
            ->limit(10)
            ->get()
    );
});

Route::get('dashboard/recent-tasks', function () {
    return response()->json(
        \App\Models\Task::with(['order', 'worker'])
            ->latest()
            ->limit(10)
            ->get()
    );
}); 