<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HumanResources\WorkerController;
use App\Http\Controllers\Api\Inventory\MaterialController;
use App\Http\Controllers\Api\Inventory\ProductController;
use App\Http\Controllers\Api\Integrations\WooCommerceProductController;
use App\Http\Controllers\Api\Business\OrderController;
use App\Http\Controllers\Api\Business\ClientController;
use App\Http\Controllers\Api\Business\CategoryController;
use App\Http\Controllers\Api\Business\InvoiceController;
use App\Http\Controllers\Api\Core\TaskController;
use App\Http\Controllers\Api\Business\MeasurementController;
use App\Http\Controllers\Api\Production\ProductionController;
use App\Http\Controllers\Api\Production\SmartProductionController;
use App\Http\Controllers\DashboardController;
use App\Services\WooCommerceService;
use App\Services\WooCommerceProductService;
use App\Http\Controllers\Api\Integrations\WooCommerceController;
use App\Http\Controllers\Api\Authentication\RoleController;
use App\Http\Controllers\Api\Authentication\PermissionController;
use App\Http\Controllers\Api\HumanResources\BiometricController;
use App\Http\Controllers\Api\HumanResources\PayrollController;
use App\Http\Controllers\Api\HumanResources\WorkerSyncController;
use App\Http\Controllers\Api\Production\ProductionTrackingController;
use App\Http\Controllers\Api\Production\ProductionFlowController;
use App\Http\Controllers\Api\Core\StationController;
use App\Http\Controllers\Api\Core\NotificationController;
use App\Http\Controllers\Api\Authentication\AuthController;
use App\Http\Controllers\Api\System\AdvancedFeaturesController;
use App\Http\Controllers\Api\System\ERPController;
use App\Http\Controllers\Api\Business\ClientLoyaltyController;
use App\Http\Controllers\Api\Business\WooCommerceOrderController;
use App\Http\Controllers\Api\Business\WorkshopOrderController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Dashboard Routes
Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('dashboard/recent-orders', [DashboardController::class, 'getRecentOrders']);
Route::get('dashboard/recent-tasks', [DashboardController::class, 'getRecentTasks']);
Route::get('dashboard/worker-performance', [DashboardController::class, 'getWorkerPerformance']);
Route::get('dashboard/production-metrics', [DashboardController::class, 'getProductionMetrics']);
Route::get('dashboard/inventory-alerts', [DashboardController::class, 'getInventoryAlerts']);
Route::get('dashboard/production-flow-summary', [DashboardController::class, 'getProductionFlowSummary']);

// Workers Routes
Route::apiResource('workers', WorkerController::class);
Route::get('workers/available', [WorkerController::class, 'getAvailable']);
Route::patch('workers/{worker}/activate', [WorkerController::class, 'activate']);
Route::patch('workers/{worker}/deactivate', [WorkerController::class, 'deactivate']);

// Stations Routes
Route::get('stations', [StationController::class, 'index']);
Route::get('stations/available', [StationController::class, 'getAvailable']);


// Materials Routes
Route::apiResource('materials', MaterialController::class);
Route::get('materials/low-stock', [MaterialController::class, 'lowStock']);

// Products Routes
Route::get('products/materials-for-bom', [ProductController::class, 'getMaterialsForBOM']);
Route::get('products/production-stages', [ProductController::class, 'getProductionStages']);
Route::get('products/available-workers', [ProductController::class, 'getAvailableWorkers']);
Route::get('products/{product}/manufacturing-requirements', [ProductController::class, 'getManufacturingRequirements']);
Route::get('products/{product}/production-requirements', [ProductController::class, 'getProductionRequirements']);
Route::get('products/{product}/complete-data', [ProductController::class, 'getCompleteProductData']);
Route::post('products/{product}/reserve-materials', [ProductController::class, 'reserveMaterials']);
Route::post('products/{product}/production-stages', [ProductController::class, 'updateProductionStages']);
Route::post('products/{product}/worker-requirements', [ProductController::class, 'updateWorkerRequirements']);
Route::post('products/{product}/auto-assign-workers', [ProductController::class, 'autoAssignWorkers']);
Route::post('products/check-production-readiness', [ProductController::class, 'checkProductionReadiness']);

// WooCommerce Integration Routes
Route::prefix('products/woocommerce')->group(function () {
    Route::get('test-connection', [ProductController::class, 'testWooCommerceConnection']);
    Route::get('stats', [ProductController::class, 'getWooCommerceStats']);
    Route::get('preview', [ProductController::class, 'getWooCommerceProductsPreview']);
    Route::post('import-batch', [ProductController::class, 'importWooCommerceProducts']);
    Route::post('sync-all', [ProductController::class, 'syncAllWooCommerceProducts']);
    Route::post('import-specific', [ProductController::class, 'importSpecificWooCommerceProduct']);
    Route::post('run-command', [ProductController::class, 'runWooCommerceImportCommand']);
    Route::get('import-progress', [ProductController::class, 'getImportProgress']);
});

Route::apiResource('products', ProductController::class);

// WooCommerce Products Sync
Route::post('products/sync-woocommerce', [WooCommerceProductController::class, 'syncProducts']);
Route::post('products/test-woocommerce', [WooCommerceProductController::class, 'testConnection']);
Route::post('products/push-woocommerce', [WooCommerceProductController::class, 'pushProduct']);

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

// Worker Sync Routes
Route::prefix('worker-sync')->group(function () {
    Route::post('/sync', [WorkerSyncController::class, 'syncWorkers']);
    Route::get('/status', [WorkerSyncController::class, 'getSyncStatus']);
    Route::post('/cleanup', [WorkerSyncController::class, 'cleanupInactiveWorkers']);
    Route::post('/sync-specific', [WorkerSyncController::class, 'syncSpecificWorker']);
});

// Payroll Routes
Route::prefix('payroll')->group(function () {
    Route::get('/', [PayrollController::class, 'index']);
    Route::get('/stats', [PayrollController::class, 'stats']);
    Route::get('/workers', [PayrollController::class, 'getWorkers']);
    Route::get('/{id}', [PayrollController::class, 'show']);
    Route::post('/generate', [PayrollController::class, 'generatePayroll']);
    Route::post('/generate-all', [PayrollController::class, 'generateAllPayrolls']);
    Route::patch('/{id}/status', [PayrollController::class, 'updateStatus']);
    Route::delete('/{id}', [PayrollController::class, 'destroy']);
});

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

// Biometric System Integration Routes
Route::prefix('biometric')->group(function () {
    Route::post('/sync-workers', [BiometricController::class, 'syncWorkers']);
    Route::post('/sync-attendance', [BiometricController::class, 'syncAttendance']);
    Route::get('/attendance', [BiometricController::class, 'getBiometricAttendance']);
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
    
    // ERP Management Routes
    Route::prefix('erp')->group(function () {
        // Department Management
        Route::get('/departments', [BiometricController::class, 'getDepartments']);
        Route::post('/departments', [BiometricController::class, 'createDepartment']);
        Route::put('/departments/{id}', [BiometricController::class, 'updateDepartment']);
        Route::delete('/departments/{id}', [BiometricController::class, 'deleteDepartment']);
        
        // Position Management  
        Route::get('/positions', [BiometricController::class, 'getPositions']);
        Route::post('/positions', [BiometricController::class, 'createPosition']);
        Route::put('/positions/{id}', [BiometricController::class, 'updatePosition']);
        Route::delete('/positions/{id}', [BiometricController::class, 'deletePosition']);
        
        // Resignation Management
        Route::get('/resignations', [BiometricController::class, 'getResignations']);
        Route::post('/resignations', [BiometricController::class, 'createResignation']);
        Route::put('/resignations/{id}', [BiometricController::class, 'updateResignation']);
        Route::delete('/resignations/{id}', [BiometricController::class, 'deleteResignation']);
        Route::post('/resignations/reinstate', [BiometricController::class, 'reinstateEmployee']);
        
        // Device Management
        Route::get('/devices', [BiometricController::class, 'getDevices']);
        Route::post('/devices', [BiometricController::class, 'createDevice']);
        Route::put('/devices/{id}', [BiometricController::class, 'updateDevice']);
        Route::delete('/devices/{id}', [BiometricController::class, 'deleteDevice']);
        
        // Transaction Management
        Route::get('/transactions', [BiometricController::class, 'getTransactions']);
        Route::get('/transactions/{id}', [BiometricController::class, 'getTransaction']);
        Route::delete('/transactions/{id}', [BiometricController::class, 'deleteTransaction']);
        
        // Transaction Reports
        Route::get('/transaction-report', [BiometricController::class, 'getTransactionReport']);
        Route::get('/transaction-report/export', [BiometricController::class, 'exportTransactionReport']);
        Route::get('/transaction-stats', [BiometricController::class, 'getTransactionStats']);
    });
});

// Production Tracking Routes (Detailed)
Route::prefix('production-tracking')->group(function () {
    Route::get('/', [ProductionTrackingController::class, 'index']);
    Route::get('/statistics', [ProductionTrackingController::class, 'getStatistics']);
    Route::get('/alerts', [ProductionTrackingController::class, 'getAlerts']);
    Route::get('/worker-analysis', [ProductionTrackingController::class, 'getWorkerAnalysis']);
    Route::get('/orders/{order}', [ProductionTrackingController::class, 'show']);
    Route::post('/orders/{order}/initialize', [ProductionTrackingController::class, 'initializeOrderStages']);
    Route::patch('/stages/{trackingId}/status', [ProductionTrackingController::class, 'updateStageStatus']);
});

// Production Flow Routes (Overview)
Route::prefix('production-flow')->group(function () {
    Route::get('/', [ProductionFlowController::class, 'getFlow']);
    Route::get('/statistics', [ProductionFlowController::class, 'getStatistics']);
    Route::get('/stages/{stageId}/orders', [ProductionFlowController::class, 'getOrdersByStage']);
    Route::post('/orders/{order}/start', [ProductionFlowController::class, 'startProduction']);
    Route::post('/orders/{order}/move-next', [ProductionFlowController::class, 'moveToNextStage']);
    Route::post('/orders/{order}/move-to-stage', [ProductionFlowController::class, 'moveToStage']);
    Route::get('/orders/{order}/cost-report', [ProductionFlowController::class, 'generateCostReport']);
});

// Notifications Routes
Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/stats', [NotificationController::class, 'getStats']);
    Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{notification}', [NotificationController::class, 'destroy']);
});

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
});

// Advanced Features Routes
Route::prefix('advanced')->middleware('auth:sanctum')->group(function () {
    Route::post('/ai-worker-assignment/{order}/{stage}', [AdvancedFeaturesController::class, 'aiWorkerAssignment']);
    Route::get('/predictive-analytics', [AdvancedFeaturesController::class, 'predictiveAnalytics']);
    Route::get('/optimize-production', [AdvancedFeaturesController::class, 'optimizeProduction']);
    Route::get('/predict-quality/{order}', [AdvancedFeaturesController::class, 'predictQuality']);
});

// ERP Management Routes
Route::prefix('erp')->middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [ERPController::class, 'getDashboard']);
    Route::get('/integrated-report', [ERPController::class, 'getIntegratedReport']);
});

// Client Loyalty Routes
Route::prefix('loyalty')->group(function () {
    Route::get('/dashboard', [ClientLoyaltyController::class, 'getLoyaltyDashboard']);
    Route::get('/stats', [ClientLoyaltyController::class, 'getLoyaltyStats']);
    Route::get('/clients/{client}', [ClientLoyaltyController::class, 'getClientLoyalty']);
    Route::post('/clients/{client}/award-points', [ClientLoyaltyController::class, 'awardPoints']);
    Route::post('/clients/{client}/redeem-points', [ClientLoyaltyController::class, 'redeemPoints']);
});

// WooCommerce Orders Routes
Route::prefix('woocommerce-orders')->group(function () {
    Route::get('/', [WooCommerceOrderController::class, 'index']);
    Route::get('/{order}', [WooCommerceOrderController::class, 'show']);
    Route::post('/sync', [WooCommerceOrderController::class, 'syncFromWooCommerce']);
    Route::post('/{order}/clone-to-workshop', [WooCommerceOrderController::class, 'cloneToWorkshop']);
    Route::post('/auto-clone-eligible', [WooCommerceOrderController::class, 'autoCloneEligibleOrders']);
});

// Workshop Orders Routes
Route::prefix('workshop-orders')->group(function () {
    Route::get('/', [WorkshopOrderController::class, 'index']);
    Route::get('/{order}', [WorkshopOrderController::class, 'show']);
    Route::post('/{order}/accept', [WorkshopOrderController::class, 'accept']);
    Route::post('/{order}/start-production', [WorkshopOrderController::class, 'startProduction']);
    Route::patch('/{order}/status', [WorkshopOrderController::class, 'updateStatus']);
}); 