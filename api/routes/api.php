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
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\SmartProductionController;
use App\Http\Controllers\DashboardController;
use App\Services\WooCommerceService;
use App\Http\Controllers\Api\WooCommerceController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\BiometricController;

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
Route::get('orders/client/{client_id}', [OrderController::class, 'getByClient']);

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

// Production Routes (Original)
Route::prefix('production')->group(function () {
    Route::post('orders/{order}/start', [ProductionController::class, 'startProduction']);
    Route::post('stages/{trackingId}/start', [ProductionController::class, 'startStage']);
    Route::post('stages/{trackingId}/complete', [ProductionController::class, 'completeStage']);
    Route::post('orders/{order}/materials', [ProductionController::class, 'recordMaterialUsage']);
    Route::post('orders/{order}/sales', [ProductionController::class, 'recordSale']);
    Route::post('attendance', [ProductionController::class, 'recordAttendance']);
    Route::get('attendance', [BiometricController::class, 'getAttendanceReport']);
    Route::get('orders/{order}/progress', [ProductionController::class, 'getOrderProgress']);
    Route::get('dashboard', [ProductionController::class, 'getDashboard']);
});

// Smart Production Routes (New Enhanced System)
Route::prefix('smart-production')->group(function () {
    // الإنتاج الذكي
    Route::post('orders/{order}/start', [SmartProductionController::class, 'startProduction']);
    Route::post('orders/{order}/next-stage', [SmartProductionController::class, 'moveToNextStage']);
    Route::post('orders/{order}/assign-worker', [SmartProductionController::class, 'assignWorkerByStage']);
    Route::post('orders/{order}/quality-check', [SmartProductionController::class, 'updateQualityStatus']);
    
    // إحصائيات وتقارير
    Route::get('stats', [SmartProductionController::class, 'getStats']);
    Route::get('worker-performance', [SmartProductionController::class, 'getWorkerPerformance']);
    Route::get('workers/specialty/{specialty}', [SmartProductionController::class, 'getWorkersBySpecialty']);
    
    // طلبات ومنتجات
    Route::get('orders/stage/{stage}', [SmartProductionController::class, 'getOrdersByStage']);
    Route::get('products', [SmartProductionController::class, 'getProductsWithHours']);
    Route::get('collections', [SmartProductionController::class, 'getCollections']);
});

// WooCommerce Import Routes
Route::prefix('woocommerce')->group(function () {
    // GET routes for documentation/info purposes
    Route::get('import/customers', function () {
        return response()->json([
            'message' => 'This endpoint requires POST method',
            'method' => 'POST',
            'endpoint' => '/api/woocommerce/import/customers'
        ], 405);
    });

    Route::get('import/orders', function () {
        return response()->json([
            'message' => 'This endpoint requires POST method',
            'method' => 'POST',
            'endpoint' => '/api/woocommerce/import/orders'
        ], 405);
    });

    Route::get('import/products', function () {
        return response()->json([
            'message' => 'This endpoint requires POST method',
            'method' => 'POST',
            'endpoint' => '/api/woocommerce/import/products'
        ], 405);
    });

    Route::get('import/all', function () {
        return response()->json([
            'message' => 'This endpoint requires POST method',
            'method' => 'POST',
            'endpoint' => '/api/woocommerce/import/all',
            'description' => 'Imports all data from WooCommerce (customers, products, orders)'
        ], 405);
    });

    // POST routes for actual import functionality
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

// WooCommerce Integration Routes
Route::prefix('woocommerce')->group(function () {
    Route::post('test-connection', [WooCommerceController::class, 'testConnection']);
    Route::post('sync-products', [WooCommerceController::class, 'syncProducts']);
    Route::post('sync-orders', [WooCommerceController::class, 'syncOrders']);
    Route::post('sync-customers', [WooCommerceController::class, 'syncCustomers']);
    Route::post('sync-all', [WooCommerceController::class, 'syncAll']);
});

// Roles & Permissions Routes
Route::prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index']);
    Route::post('/', [RoleController::class, 'store']);
    Route::get('/{role}', [RoleController::class, 'show']);
    Route::put('/{role}', [RoleController::class, 'update']);
    Route::delete('/{role}', [RoleController::class, 'destroy']);
    Route::get('/permissions/available', [RoleController::class, 'getPermissions']);
    Route::get('/defaults', [RoleController::class, 'getDefaultRoles']);
});

Route::prefix('permissions')->group(function () {
    Route::get('/', [PermissionController::class, 'index']);
    Route::get('/grouped', [PermissionController::class, 'getGroupedPermissions']);
});

// General Attendance Route (direct from biometric system)
Route::get('attendance', [BiometricController::class, 'getBiometricAttendance']);

// Biometric System Integration Routes
Route::prefix('biometric')->group(function () {
    Route::post('/sync-workers', [BiometricController::class, 'syncWorkers']);
    Route::post('/sync-attendance', [BiometricController::class, 'syncAttendance']);
    Route::get('/attendance-report', [BiometricController::class, 'getAttendanceReport']);
    Route::get('/worker/{id}/attendance', [BiometricController::class, 'getWorkerAttendance']);
    Route::get('/token-info', [BiometricController::class, 'getTokenInfo']);
    Route::get('/workers', [BiometricController::class, 'getBiometricWorkers']);
    
    // CRUD Operations for Employees
    Route::post('/employees', [BiometricController::class, 'createEmployee']);
    Route::get('/employees/{id}', [BiometricController::class, 'getEmployee']);
    Route::put('/employees/{id}', [BiometricController::class, 'updateEmployee']);
    Route::delete('/employees/{id}', [BiometricController::class, 'deleteEmployee']);
    
    // Support Data Routes
    Route::get('/areas', [BiometricController::class, 'getAreas']);
    Route::get('/departments', [BiometricController::class, 'getDepartments']);
    Route::get('/positions', [BiometricController::class, 'getPositions']);
}); 