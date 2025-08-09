<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiDashboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\BiometricController;
use App\Http\Controllers\ProductionTrackingController;
use App\Http\Controllers\BarcodeController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\WorkerSyncController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ManagementController;
use App\Http\Controllers\SystemMonitoringController;
use App\Http\Controllers\ErrorReportingController;
use App\Http\Controllers\LoyaltyController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\InventoryProductController;
use App\Http\Controllers\SmartProductionUiController;
use App\Http\Controllers\WorkerIpadUiController;
use App\Http\Controllers\LoyaltyReportsController;

Route::get('/', function () {
    return redirect()->route('ui.dashboard');
});

// API Dashboard Routes
Route::prefix('dashboard')->group(function () {
    Route::get('/', [ApiDashboardController::class, 'index'])->name('api.dashboard');
    Route::get('/status', [ApiDashboardController::class, 'apiStatus'])->name('api.dashboard.status');
    Route::get('/health', [ApiDashboardController::class, 'healthCheck'])->name('api.dashboard.health');
    Route::get('/docs', [ApiDashboardController::class, 'documentation'])->name('api.dashboard.docs');
});

// UI (Blade + Controllers)
Route::prefix('ui')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('ui.dashboard');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('ui.orders');
    Route::get('/orders/create', [OrderController::class, 'create'])->name('ui.orders.create');
    Route::post('/orders/create', [OrderController::class, 'store'])->name('ui.orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('ui.orders.show');
    Route::get('/orders/{order}/edit', [OrderController::class, 'edit'])->name('ui.orders.edit');
    Route::put('/orders/{order}/edit', [OrderController::class, 'update'])->name('ui.orders.update');
    Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('ui.orders.destroy');

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index'])->name('ui.inventory');
    Route::get('/inventory/create', [InventoryController::class, 'create'])->name('ui.inventory.create');
    Route::post('/inventory/create', [InventoryController::class, 'store'])->name('ui.inventory.store');
    Route::get('/inventory/{item}', [InventoryController::class, 'show'])->name('ui.inventory.show');
    Route::get('/inventory/{item}/edit', [InventoryController::class, 'edit'])->name('ui.inventory.edit');
    Route::put('/inventory/{item}/edit', [InventoryController::class, 'update'])->name('ui.inventory.update');
    Route::delete('/inventory/{item}', [InventoryController::class, 'destroy'])->name('ui.inventory.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('ui.reports');
});

// UI Routes for Human Resources
Route::prefix('ui/hr')->group(function () {
    // Workers
    Route::get('/workers', [WorkerController::class, 'index'])->name('ui.workers.index');
    Route::get('/workers/create', [WorkerController::class, 'create'])->name('ui.workers.create');
    Route::post('/workers/create', [WorkerController::class, 'store'])->name('ui.workers.store');
    Route::get('/workers/{worker}', [WorkerController::class, 'show'])->name('ui.workers.show');
    Route::get('/workers/{worker}/edit', [WorkerController::class, 'edit'])->name('ui.workers.edit');
    Route::put('/workers/{worker}/edit', [WorkerController::class, 'update'])->name('ui.workers.update');
    Route::delete('/workers/{worker}', [WorkerController::class, 'destroy'])->name('ui.workers.destroy');

    // Payroll
    Route::get('/payroll', [PayrollController::class, 'index'])->name('ui.payroll.index');
    Route::get('/payroll/{payroll}', [PayrollController::class, 'show'])->name('ui.payroll.show');

    // Biometrics
    Route::get('/biometrics', [BiometricController::class, 'index'])->name('ui.biometrics.index');
    Route::get('/biometrics/{record}', [BiometricController::class, 'show'])->name('ui.biometrics.show');
});

// Workshop Custom Orders Routes
Route::prefix('ui/workshop')->group(function () {
    Route::get('/custom-orders', [App\Http\Controllers\WorkshopController::class, 'customOrdersIndex'])->name('ui.workshop.custom-orders.index');
    Route::get('/custom-orders/create', [App\Http\Controllers\WorkshopController::class, 'customOrdersCreate'])->name('ui.workshop.custom-orders.create');
    Route::post('/custom-orders', [App\Http\Controllers\WorkshopController::class, 'customOrdersStore'])->name('ui.workshop.custom-orders.store');
    Route::get('/custom-orders/{customOrder}', [App\Http\Controllers\WorkshopController::class, 'customOrdersShow'])->name('ui.workshop.custom-orders.show');
    Route::get('/custom-orders/{customOrder}/edit', [App\Http\Controllers\WorkshopController::class, 'customOrdersEdit'])->name('ui.workshop.custom-orders.edit');
    Route::put('/custom-orders/{customOrder}', [App\Http\Controllers\WorkshopController::class, 'customOrdersUpdate'])->name('ui.workshop.custom-orders.update');
    Route::delete('/custom-orders/{customOrder}', [App\Http\Controllers\WorkshopController::class, 'customOrdersDestroy'])->name('ui.workshop.custom-orders.destroy');
});

// Production Routes
Route::prefix('ui/production')->group(function () {
    Route::get('/tracking', [ProductionTrackingController::class, 'index'])->name('ui.production.tracking.index');
    Route::get('/tracking/{order}', [ProductionTrackingController::class, 'show'])->name('ui.production.tracking.show');
    Route::get('/barcode', [BarcodeController::class, 'index'])->name('ui.production.barcode.index');
    Route::get('/barcode/{item}/generate', [BarcodeController::class, 'generate'])->name('ui.production.barcode.generate');
    Route::post('/barcode/print', [BarcodeController::class, 'print'])->name('ui.production.barcode.print');

    // Smart Production
    Route::get('/smart', [SmartProductionUiController::class, 'index'])->name('ui.production.smart.index');
    Route::get('/smart/stations', [SmartProductionUiController::class, 'stations'])->name('ui.production.smart.stations');
    Route::get('/smart/assignments', [SmartProductionUiController::class, 'assignments'])->name('ui.production.smart.assignments');

    // Worker iPad
    Route::get('/worker-ipad', [WorkerIpadUiController::class, 'index'])->name('ui.production.worker-ipad.index');
    Route::get('/worker-ipad/orders/{order}', [WorkerIpadUiController::class, 'show'])->name('ui.production.worker-ipad.show');
});

// Inventory Materials Routes
Route::prefix('ui/inventory')->group(function () {
    Route::get('/materials', [MaterialController::class, 'index'])->name('ui.inventory.materials.index');
    Route::get('/materials/create', [MaterialController::class, 'create'])->name('ui.inventory.materials.create');
    Route::post('/materials', [MaterialController::class, 'store'])->name('ui.inventory.materials.store');
    Route::get('/materials/{material}', [MaterialController::class, 'show'])->name('ui.inventory.materials.show');
    Route::get('/materials/{material}/edit', [MaterialController::class, 'edit'])->name('ui.inventory.materials.edit');
    Route::put('/materials/{material}', [MaterialController::class, 'update'])->name('ui.inventory.materials.update');
    Route::delete('/materials/{material}', [MaterialController::class, 'destroy'])->name('ui.inventory.materials.destroy');

    // Products
    Route::get('/products', [InventoryProductController::class, 'index'])->name('ui.inventory.products.index');
    Route::get('/products/create', [InventoryProductController::class, 'create'])->name('ui.inventory.products.create');
    Route::post('/products', [InventoryProductController::class, 'store'])->name('ui.inventory.products.store');
    Route::get('/products/{product}', [InventoryProductController::class, 'show'])->name('ui.inventory.products.show');
    Route::get('/products/{product}/edit', [InventoryProductController::class, 'edit'])->name('ui.inventory.products.edit');
    Route::put('/products/{product}', [InventoryProductController::class, 'update'])->name('ui.inventory.products.update');
    Route::delete('/products/{product}', [InventoryProductController::class, 'destroy'])->name('ui.inventory.products.destroy');
});

// Worker Sync Routes
Route::prefix('ui/hr')->group(function () {
    Route::get('/worker-sync', [WorkerSyncController::class, 'index'])->name('ui.hr.worker-sync.index');
    Route::post('/worker-sync/sync-now', [WorkerSyncController::class, 'syncNow'])->name('ui.hr.worker-sync.sync-now');
    Route::post('/worker-sync/bulk-sync', [WorkerSyncController::class, 'bulkSync'])->name('ui.hr.worker-sync.bulk-sync');
    Route::get('/worker-sync/settings', [WorkerSyncController::class, 'settings'])->name('ui.hr.worker-sync.settings');
    Route::put('/worker-sync/settings', [WorkerSyncController::class, 'updateSettings'])->name('ui.hr.worker-sync.update-settings');
});

// Analytics Routes
Route::prefix('ui/reports')->group(function () {
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('ui.reports.analytics.index');
    Route::get('/analytics/production', [AnalyticsController::class, 'production'])->name('ui.reports.analytics.production');
    Route::get('/analytics/financial', [AnalyticsController::class, 'financial'])->name('ui.reports.analytics.financial');
    Route::get('/analytics/workforce', [AnalyticsController::class, 'workforce'])->name('ui.reports.analytics.workforce');
});

// Management Routes
Route::prefix('ui/management')->group(function () {
    Route::get('/dashboard', [ManagementController::class, 'dashboard'])->name('ui.management.dashboard');
    Route::get('/performance', [ManagementController::class, 'performance'])->name('ui.management.performance');
    Route::get('/planning', [ManagementController::class, 'planning'])->name('ui.management.planning');
    Route::get('/quality', [ManagementController::class, 'quality'])->name('ui.management.quality');
    Route::get('/costs', [ManagementController::class, 'costs'])->name('ui.management.costs');
});

// System Monitoring Routes
Route::prefix('ui/system')->group(function () {
    Route::get('/monitoring', [SystemMonitoringController::class, 'index'])->name('ui.system.monitoring.index');
    Route::get('/monitoring/performance', [SystemMonitoringController::class, 'performance'])->name('ui.system.monitoring.performance');
    Route::get('/monitoring/database', [SystemMonitoringController::class, 'database'])->name('ui.system.monitoring.database');
    Route::get('/monitoring/security', [SystemMonitoringController::class, 'security'])->name('ui.system.monitoring.security');
    
    Route::get('/errors', [ErrorReportingController::class, 'index'])->name('ui.system.errors.index');
    Route::get('/errors/{error}', [ErrorReportingController::class, 'show'])->name('ui.system.errors.show');
    Route::post('/errors/{error}/resolve', [ErrorReportingController::class, 'resolve'])->name('ui.system.errors.resolve');
});

// Loyalty Routes
Route::prefix('ui/loyalty')->group(function () {
    Route::get('/', [LoyaltyController::class, 'index'])->name('ui.loyalty.index');
    Route::get('/{customer}', [LoyaltyController::class, 'show'])->name('ui.loyalty.show');
    Route::get('/rewards/list', [LoyaltyController::class, 'rewards'])->name('ui.loyalty.rewards');
    Route::get('/transactions/all', [LoyaltyController::class, 'transactions'])->name('ui.loyalty.transactions');
    Route::post('/{customer}/add-points', [LoyaltyController::class, 'addPoints'])->name('ui.loyalty.add-points');
    Route::post('/{customer}/redeem-points', [LoyaltyController::class, 'redeemPoints'])->name('ui.loyalty.redeem-points');
    Route::get('/reports', [LoyaltyReportsController::class, 'index'])->name('ui.loyalty.reports.index');
});

// Admin Routes
Route::prefix('ui/admin')->group(function () {
    // Role Management
    Route::get('/roles', [RoleManagementController::class, 'index'])->name('ui.admin.roles.index');
    Route::get('/roles/create', [RoleManagementController::class, 'create'])->name('ui.admin.roles.create');
    Route::post('/roles', [RoleManagementController::class, 'store'])->name('ui.admin.roles.store');
    Route::get('/roles/{role}', [RoleManagementController::class, 'show'])->name('ui.admin.roles.show');
    Route::get('/roles/{role}/edit', [RoleManagementController::class, 'edit'])->name('ui.admin.roles.edit');
    Route::put('/roles/{role}', [RoleManagementController::class, 'update'])->name('ui.admin.roles.update');
    Route::delete('/roles/{role}', [RoleManagementController::class, 'destroy'])->name('ui.admin.roles.destroy');
    Route::get('/permissions', [RoleManagementController::class, 'permissions'])->name('ui.admin.permissions.index');
    
    // System Settings
    Route::get('/settings', [SystemSettingsController::class, 'index'])->name('ui.admin.settings.index');
    Route::get('/settings/general', [SystemSettingsController::class, 'general'])->name('ui.admin.settings.general');
    Route::get('/settings/email', [SystemSettingsController::class, 'email'])->name('ui.admin.settings.email');
    Route::get('/settings/notifications', [SystemSettingsController::class, 'notifications'])->name('ui.admin.settings.notifications');
    Route::get('/settings/backup', [SystemSettingsController::class, 'backup'])->name('ui.admin.settings.backup');
    Route::get('/settings/security', [SystemSettingsController::class, 'security'])->name('ui.admin.settings.security');
    Route::post('/settings/update', [SystemSettingsController::class, 'update'])->name('ui.admin.settings.update');
    Route::post('/settings/backup/create', [SystemSettingsController::class, 'createBackup'])->name('ui.admin.settings.backup.create');
    Route::post('/settings/email/test', [SystemSettingsController::class, 'testEmail'])->name('ui.admin.settings.email.test');
    
    // User Management
    Route::get('/users', [UserManagementController::class, 'index'])->name('ui.admin.users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('ui.admin.users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('ui.admin.users.store');
    Route::get('/users/{user}', [UserManagementController::class, 'show'])->name('ui.admin.users.show');
    Route::get('/users/{user}/edit', [UserManagementController::class, 'edit'])->name('ui.admin.users.edit');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('ui.admin.users.update');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('ui.admin.users.destroy');
    Route::post('/users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('ui.admin.users.toggle-status');
    Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('ui.admin.users.reset-password');
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
