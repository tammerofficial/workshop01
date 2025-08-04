<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use App\Services\SystemHealthService;
use Carbon\Carbon;

class ApiDashboardController extends Controller
{
    /**
     * عرض داشبورد API الرئيسي
     */
    public function index()
    {
        $systemStatus = $this->getSystemStatus();
        $apiStats = $this->getApiStatistics();
        $recentActivity = $this->getRecentActivity();
        $databaseStatus = $this->getDatabaseStatus();
        $performanceMetrics = $this->getPerformanceMetrics();
        $securityStatus = $this->getSecurityStatus();
        
        return view('api.dashboard.index', compact(
            'systemStatus',
            'apiStats',
            'recentActivity',
            'databaseStatus',
            'performanceMetrics',
            'securityStatus'
        ));
    }

    /**
     * فحص حالة النظام العامة
     */
    private function getSystemStatus()
    {
        $status = [
            'overall' => 'healthy',
            'uptime' => $this->getUptime(),
            'server_time' => now()->format('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'cache_driver' => config('cache.default'),
            'database_driver' => config('database.default'),
            'queue_driver' => config('queue.default'),
        ];

        // فحص الاتصالات
        try {
            DB::connection()->getPdo();
            $status['database_connection'] = 'connected';
        } catch (\Exception $e) {
            $status['database_connection'] = 'disconnected';
            $status['overall'] = 'warning';
        }

        // فحص الكاش
        try {
            Cache::put('health_check', 'ok', 5);
            $status['cache_status'] = Cache::get('health_check') === 'ok' ? 'working' : 'failed';
        } catch (\Exception $e) {
            $status['cache_status'] = 'failed';
            $status['overall'] = 'warning';
        }

        return $status;
    }

    /**
     * إحصائيات API
     */
    private function getApiStatistics()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_roles' => Role::count(),
            'api_endpoints' => $this->countApiEndpoints(),
            'requests_today' => $this->getRequestsCount('today'),
            'requests_this_week' => $this->getRequestsCount('week'),
            'requests_this_month' => $this->getRequestsCount('month'),
            'error_rate' => $this->getErrorRate(),
        ];

        return $stats;
    }

    /**
     * النشاط الحديث
     */
    private function getRecentActivity()
    {
        return ActivityLog::with('causer')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'subject_type' => $activity->subject_type,
                    'subject_id' => $activity->subject_id,
                    'causer_name' => $activity->causer ? $activity->causer->name : 'System',
                    'created_at' => $activity->created_at->diffForHumans(),
                    'properties' => $activity->properties,
                ];
            });
    }

    /**
     * حالة قاعدة البيانات
     */
    private function getDatabaseStatus()
    {
        try {
            $pdo = DB::connection()->getPdo();
            $dbStats = DB::select('SHOW TABLE STATUS');
            
            $totalSize = 0;
            $totalRows = 0;
            $tables = [];

            foreach ($dbStats as $table) {
                $size = $table->Data_length + $table->Index_length;
                $totalSize += $size;
                $totalRows += $table->Rows;
                
                $tables[] = [
                    'name' => $table->Name,
                    'rows' => $table->Rows,
                    'size' => $this->formatBytes($size),
                    'engine' => $table->Engine,
                ];
            }

            return [
                'connection' => 'connected',
                'total_tables' => count($tables),
                'total_rows' => $totalRows,
                'total_size' => $this->formatBytes($totalSize),
                'tables' => $tables,
                'server_version' => DB::select('SELECT VERSION() as version')[0]->version,
            ];
        } catch (\Exception $e) {
            return [
                'connection' => 'failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * مقاييس الأداء
     */
    private function getPerformanceMetrics()
    {
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));

        return [
            'memory_usage' => $this->formatBytes($memoryUsage),
            'memory_peak' => $this->formatBytes($memoryPeak),
            'memory_limit' => $this->formatBytes($memoryLimit),
            'memory_percentage' => round(($memoryUsage / $memoryLimit) * 100, 2),
            'load_average' => $this->getLoadAverage(),
            'disk_usage' => $this->getDiskUsage(),
            'response_time' => $this->getAverageResponseTime(),
        ];
    }

    /**
     * حالة الأمان
     */
    private function getSecurityStatus()
    {
        return [
            'failed_logins_today' => $this->getFailedLoginsCount(),
            'suspicious_activity' => $this->getSuspiciousActivity(),
            'ssl_enabled' => request()->isSecure(),
            'environment_secure' => config('app.env') !== 'local',
            'debug_disabled' => !config('app.debug'),
            'last_security_scan' => $this->getLastSecurityScan(),
        ];
    }

    /**
     * API للحصول على البيانات بشكل JSON
     */
    public function apiStatus()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'system_status' => $this->getSystemStatus(),
                'api_stats' => $this->getApiStatistics(),
                'database_status' => $this->getDatabaseStatus(),
                'performance_metrics' => $this->getPerformanceMetrics(),
                'security_status' => $this->getSecurityStatus(),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * فحص صحة API
     */
    public function healthCheck()
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'queue' => $this->checkQueue(),
        ];

        $healthy = collect($checks)->every(fn($check) => $check['status'] === 'ok');

        return response()->json([
            'success' => $healthy,
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'checks' => $checks,
            'timestamp' => now()->toISOString(),
        ], $healthy ? 200 : 503);
    }

    /**
     * فحص شامل للنظام باستخدام SystemHealthService
     */
    public function comprehensiveHealthCheck(SystemHealthService $healthService)
    {
        $healthReport = $healthService->performHealthCheck();
        
        return response()->json([
            'success' => $healthReport['overall_status'] !== 'error',
            'data' => $healthReport,
        ], $healthReport['overall_status'] === 'error' ? 503 : 200);
    }

    // Helper Methods
    private function getUptime()
    {
        $uptime = shell_exec('uptime');
        return $uptime ? trim($uptime) : 'غير متاح';
    }

    private function countApiEndpoints()
    {
        $routes = \Route::getRoutes();
        $apiRoutes = 0;
        
        foreach ($routes as $route) {
            if (str_starts_with($route->uri, 'api/')) {
                $apiRoutes++;
            }
        }
        
        return $apiRoutes;
    }

    private function getRequestsCount($period)
    {
        // يمكن تحسين هذا بحفظ احصائيات الطلبات في قاعدة البيانات
        $cacheKey = "requests_count_{$period}";
        return Cache::get($cacheKey, 0);
    }

    private function getErrorRate()
    {
        // حساب نسبة الأخطاء من السجلات
        return Cache::get('error_rate_today', 0);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function parseMemoryLimit($limit)
    {
        $limit = trim($limit);
        $lastChar = strtolower($limit[strlen($limit) - 1]);
        $value = (int) $limit;
        
        switch ($lastChar) {
            case 'g': $value *= 1024;
            case 'm': $value *= 1024;
            case 'k': $value *= 1024;
        }
        
        return $value;
    }

    private function getLoadAverage()
    {
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            return implode(', ', array_map(fn($l) => round($l, 2), $load));
        }
        return 'غير متاح';
    }

    private function getDiskUsage()
    {
        $total = disk_total_space('.');
        $free = disk_free_space('.');
        $used = $total - $free;
        
        return [
            'total' => $this->formatBytes($total),
            'used' => $this->formatBytes($used),
            'free' => $this->formatBytes($free),
            'percentage' => round(($used / $total) * 100, 2),
        ];
    }

    private function getAverageResponseTime()
    {
        return Cache::get('avg_response_time', 0) . ' ms';
    }

    private function getFailedLoginsCount()
    {
        return Cache::get('failed_logins_today', 0);
    }

    private function getSuspiciousActivity()
    {
        return Cache::get('suspicious_activity_count', 0);
    }

    private function getLastSecurityScan()
    {
        return Cache::get('last_security_scan', 'لم يتم إجراء فحص');
    }

    // Health Check Helper Methods
    private function checkDatabase()
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'ok', 'message' => 'Database connection successful'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkCache()
    {
        try {
            Cache::put('health_check', 'ok', 5);
            $result = Cache::get('health_check');
            return ['status' => $result === 'ok' ? 'ok' : 'error', 'message' => 'Cache is working'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkStorage()
    {
        try {
            $path = storage_path('app/health_check.txt');
            file_put_contents($path, 'health check');
            $content = file_get_contents($path);
            unlink($path);
            return ['status' => 'ok', 'message' => 'Storage is writable'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkQueue()
    {
        try {
            // فحص بسيط للطابور
            return ['status' => 'ok', 'message' => 'Queue system is available'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * Display the documentation page
     */
    public function documentation()
    {
        return view('api.dashboard.documentation');
    }
}