<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Route;
use Carbon\Carbon;

class SystemHealthService
{
    /**
     * فحص شامل لصحة النظام
     */
    public function performHealthCheck(): array
    {
        return [
            'timestamp' => now()->toISOString(),
            'overall_status' => $this->getOverallStatus(),
            'checks' => [
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'storage' => $this->checkStorage(),
                'queue' => $this->checkQueue(),
                'logs' => $this->checkLogs(),
                'permissions' => $this->checkPermissions(),
                'memory' => $this->checkMemory(),
                'disk_space' => $this->checkDiskSpace(),
                'dependencies' => $this->checkDependencies(),
            ],
            'metrics' => $this->getSystemMetrics(),
            'recommendations' => $this->generateRecommendations(),
        ];
    }

    /**
     * فحص قاعدة البيانات
     */
    public function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            
            // فحص الاتصال
            $pdo = DB::connection()->getPdo();
            $connectionTime = (microtime(true) - $start) * 1000;
            
            // فحص الجداول الأساسية
            $requiredTables = ['users', 'roles', 'activity_log'];
            $existingTables = collect(DB::select('SHOW TABLES'))->pluck('Tables_in_' . config('database.connections.mysql.database'));
            $missingTables = collect($requiredTables)->diff($existingTables);
            
            // فحص الفهارس
            $indexStatus = $this->checkDatabaseIndexes();
            
            // فحص حجم قاعدة البيانات
            $sizeInfo = $this->getDatabaseSize();
            
            $status = $missingTables->isEmpty() ? 'healthy' : 'warning';
            
            return [
                'status' => $status,
                'connection_time' => round($connectionTime, 2) . ' ms',
                'tables_count' => $existingTables->count(),
                'missing_tables' => $missingTables->toArray(),
                'size' => $sizeInfo,
                'indexes' => $indexStatus,
                'message' => $status === 'healthy' ? 'Database is operational' : 'Some tables are missing',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'connection_time' => null,
            ];
        }
    }

    /**
     * فحص نظام التخزين المؤقت
     */
    public function checkCache(): array
    {
        try {
            $start = microtime(true);
            
            // اختبار الكتابة والقراءة
            $testKey = 'health_check_' . time();
            $testValue = 'test_value_' . rand(1000, 9999);
            
            Cache::put($testKey, $testValue, 60);
            $retrievedValue = Cache::get($testKey);
            $writeReadTime = (microtime(true) - $start) * 1000;
            
            // تنظيف
            Cache::forget($testKey);
            
            $isWorking = $retrievedValue === $testValue;
            
            // فحص إحصائيات الكاش
            $cacheStats = $this->getCacheStats();
            
            return [
                'status' => $isWorking ? 'healthy' : 'error',
                'driver' => config('cache.default'),
                'write_read_time' => round($writeReadTime, 2) . ' ms',
                'stats' => $cacheStats,
                'message' => $isWorking ? 'Cache is working properly' : 'Cache read/write failed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * فحص نظام التخزين
     */
    public function checkStorage(): array
    {
        try {
            $disks = ['local', 'public'];
            $results = [];
            
            foreach ($disks as $disk) {
                if (!config("filesystems.disks.{$disk}")) {
                    continue;
                }
                
                $start = microtime(true);
                $testFile = 'health_check_' . time() . '.txt';
                $testContent = 'Health check test file';
                
                // اختبار الكتابة
                $writeSuccess = Storage::disk($disk)->put($testFile, $testContent);
                
                // اختبار القراءة
                $readContent = Storage::disk($disk)->get($testFile);
                $readSuccess = $readContent === $testContent;
                
                // اختبار الحذف
                $deleteSuccess = Storage::disk($disk)->delete($testFile);
                
                $operationTime = (microtime(true) - $start) * 1000;
                
                $results[$disk] = [
                    'writable' => $writeSuccess,
                    'readable' => $readSuccess,
                    'deletable' => $deleteSuccess,
                    'operation_time' => round($operationTime, 2) . ' ms',
                    'status' => ($writeSuccess && $readSuccess && $deleteSuccess) ? 'healthy' : 'error',
                ];
            }
            
            $overallStatus = collect($results)->every(fn($result) => $result['status'] === 'healthy') ? 'healthy' : 'warning';
            
            return [
                'status' => $overallStatus,
                'disks' => $results,
                'message' => $overallStatus === 'healthy' ? 'All storage disks are working' : 'Some storage issues detected',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * فحص نظام الطوابير
     */
    public function checkQueue(): array
    {
        try {
            $driver = config('queue.default');
            $connection = config("queue.connections.{$driver}");
            
            // فحص أساسي للإعدادات
            $status = $connection ? 'healthy' : 'error';
            
            // يمكن إضافة فحص أكثر تفصيلاً للطوابير المختلفة هنا
            
            return [
                'status' => $status,
                'driver' => $driver,
                'connection' => $connection ? 'configured' : 'missing',
                'message' => $status === 'healthy' ? 'Queue system is configured' : 'Queue configuration missing',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * فحص ملفات السجلات
     */
    public function checkLogs(): array
    {
        try {
            $logPath = storage_path('logs');
            $logFile = $logPath . '/laravel.log';
            
            $results = [
                'directory_writable' => is_writable($logPath),
                'log_file_exists' => file_exists($logFile),
                'log_file_writable' => file_exists($logFile) ? is_writable($logFile) : null,
            ];
            
            if (file_exists($logFile)) {
                $results['log_file_size'] = $this->formatBytes(filesize($logFile));
                $results['last_modified'] = date('Y-m-d H:i:s', filemtime($logFile));
                
                // فحص آخر الأخطاء
                $recentErrors = $this->getRecentLogErrors();
                $results['recent_errors'] = $recentErrors;
            }
            
            $status = $results['directory_writable'] ? 'healthy' : 'warning';
            
            return [
                'status' => $status,
                'details' => $results,
                'message' => $status === 'healthy' ? 'Logging system is working' : 'Logging issues detected',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * فحص الصلاحيات
     */
    public function checkPermissions(): array
    {
        try {
            $directories = [
                storage_path(),
                storage_path('app'),
                storage_path('framework'),
                storage_path('logs'),
                base_path('bootstrap/cache'),
            ];
            
            $results = [];
            foreach ($directories as $dir) {
                $results[basename($dir)] = [
                    'exists' => is_dir($dir),
                    'writable' => is_writable($dir),
                    'readable' => is_readable($dir),
                ];
            }
            
            $allGood = collect($results)->every(fn($result) => $result['exists'] && $result['writable'] && $result['readable']);
            
            return [
                'status' => $allGood ? 'healthy' : 'warning',
                'directories' => $results,
                'message' => $allGood ? 'All directories have correct permissions' : 'Some permission issues detected',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * فحص استخدام الذاكرة
     */
    public function checkMemory(): array
    {
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));
        
        $usagePercentage = ($memoryUsage / $memoryLimit) * 100;
        $status = $usagePercentage < 80 ? 'healthy' : ($usagePercentage < 95 ? 'warning' : 'critical');
        
        return [
            'status' => $status,
            'current_usage' => $this->formatBytes($memoryUsage),
            'peak_usage' => $this->formatBytes($memoryPeak),
            'limit' => $this->formatBytes($memoryLimit),
            'usage_percentage' => round($usagePercentage, 2),
            'message' => "Memory usage at {$usagePercentage}%",
        ];
    }

    /**
     * فحص مساحة القرص
     */
    public function checkDiskSpace(): array
    {
        $totalSpace = disk_total_space('.');
        $freeSpace = disk_free_space('.');
        $usedSpace = $totalSpace - $freeSpace;
        $usagePercentage = ($usedSpace / $totalSpace) * 100;
        
        $status = $usagePercentage < 80 ? 'healthy' : ($usagePercentage < 95 ? 'warning' : 'critical');
        
        return [
            'status' => $status,
            'total' => $this->formatBytes($totalSpace),
            'used' => $this->formatBytes($usedSpace),
            'free' => $this->formatBytes($freeSpace),
            'usage_percentage' => round($usagePercentage, 2),
            'message' => "Disk usage at {$usagePercentage}%",
        ];
    }

    /**
     * فحص التبعيات
     */
    public function checkDependencies(): array
    {
        $requiredExtensions = ['pdo', 'mbstring', 'openssl', 'tokenizer', 'xml', 'json'];
        $results = [];
        
        foreach ($requiredExtensions as $extension) {
            $results[$extension] = extension_loaded($extension);
        }
        
        $allLoaded = collect($results)->every();
        
        return [
            'status' => $allLoaded ? 'healthy' : 'warning',
            'php_version' => PHP_VERSION,
            'extensions' => $results,
            'message' => $allLoaded ? 'All required extensions are loaded' : 'Some extensions are missing',
        ];
    }

    /**
     * الحصول على مقاييس النظام
     */
    public function getSystemMetrics(): array
    {
        return [
            'uptime' => $this->getSystemUptime(),
            'load_average' => $this->getLoadAverage(),
            'active_users' => User::where('is_active', true)->count(),
            'total_users' => User::count(),
            'recent_activity' => ActivityLog::where('created_at', '>=', now()->subHour())->count(),
            'api_endpoints' => $this->countApiEndpoints(),
        ];
    }

    /**
     * توليد التوصيات
     */
    public function generateRecommendations(): array
    {
        $recommendations = [];
        
        // فحص الذاكرة
        $memoryCheck = $this->checkMemory();
        if ($memoryCheck['usage_percentage'] > 80) {
            $recommendations[] = [
                'type' => 'memory',
                'priority' => 'high',
                'message' => 'استخدام الذاكرة مرتفع. فكر في زيادة memory_limit أو تحسين التطبيق.',
            ];
        }
        
        // فحص القرص
        $diskCheck = $this->checkDiskSpace();
        if ($diskCheck['usage_percentage'] > 80) {
            $recommendations[] = [
                'type' => 'disk',
                'priority' => 'medium',
                'message' => 'مساحة القرص منخفضة. قم بتنظيف الملفات غير الضرورية.',
            ];
        }
        
        // فحص البيئة
        if (config('app.env') === 'local' && config('app.debug') === true) {
            $recommendations[] = [
                'type' => 'security',
                'priority' => 'high',
                'message' => 'تذكر تعطيل Debug mode في بيئة الإنتاج.',
            ];
        }
        
        return $recommendations;
    }

    /**
     * الحصول على الحالة العامة
     */
    private function getOverallStatus(): string
    {
        $checks = [
            $this->checkDatabase(),
            $this->checkCache(),
            $this->checkStorage(),
            $this->checkMemory(),
            $this->checkDiskSpace(),
        ];
        
        $hasError = collect($checks)->contains('status', 'error');
        $hasWarning = collect($checks)->contains('status', 'warning');
        
        if ($hasError) return 'error';
        if ($hasWarning) return 'warning';
        return 'healthy';
    }

    // Helper Methods
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function parseMemoryLimit($limit): int
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

    private function getSystemUptime(): string
    {
        if (function_exists('shell_exec')) {
            $uptime = shell_exec('uptime');
            return $uptime ? trim($uptime) : 'غير متاح';
        }
        return 'غير متاح';
    }

    private function getLoadAverage(): string
    {
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            return implode(', ', array_map(fn($l) => round($l, 2), $load));
        }
        return 'غير متاح';
    }

    private function countApiEndpoints(): int
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

    private function getDatabaseSize(): array
    {
        try {
            $dbStats = DB::select('SHOW TABLE STATUS');
            $totalSize = 0;
            $totalRows = 0;
            
            foreach ($dbStats as $table) {
                $size = $table->Data_length + $table->Index_length;
                $totalSize += $size;
                $totalRows += $table->Rows;
            }
            
            return [
                'total_size' => $this->formatBytes($totalSize),
                'total_rows' => $totalRows,
                'tables_count' => count($dbStats),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function checkDatabaseIndexes(): array
    {
        try {
            // فحص بسيط للفهارس الأساسية
            $indexes = DB::select("SHOW INDEX FROM users WHERE Key_name != 'PRIMARY'");
            return [
                'users_indexes' => count($indexes),
                'status' => count($indexes) > 0 ? 'good' : 'needs_attention',
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function getCacheStats(): array
    {
        // هذا يعتمد على نوع driver المستخدم
        // يمكن تحسينه حسب نوع Cache المستخدم
        return [
            'driver' => config('cache.default'),
            'status' => 'working',
        ];
    }

    private function getRecentLogErrors(): array
    {
        try {
            $logFile = storage_path('logs/laravel.log');
            if (!file_exists($logFile)) {
                return [];
            }
            
            $lines = file($logFile);
            $errors = [];
            $recentLines = array_slice($lines, -100); // آخر 100 سطر
            
            foreach ($recentLines as $line) {
                if (str_contains(strtolower($line), 'error') || str_contains(strtolower($line), 'exception')) {
                    $errors[] = trim($line);
                }
            }
            
            return array_slice($errors, -5); // آخر 5 أخطاء
        } catch (\Exception $e) {
            return [];
        }
    }
}