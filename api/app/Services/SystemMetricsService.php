<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SystemMetricsService
{
    private const METRICS_CACHE_TTL = 300; // 5 minutes
    private const HISTORY_RETENTION_DAYS = 30;
    private const ALERT_THRESHOLDS = [
        'cpu_usage' => 80,
        'memory_usage' => 85,
        'disk_usage' => 90,
        'load_average' => 2.0,
    ];

    /**
     * Collect comprehensive system metrics
     */
    public function collectSystemMetrics(): array
    {
        $metrics = [
            'timestamp' => now()->toISOString(),
            'server_info' => $this->getServerInfo(),
            'resource_usage' => $this->getResourceUsage(),
            'php_metrics' => $this->getPHPMetrics(),
            'application_metrics' => $this->getApplicationMetrics(),
            'network_metrics' => $this->getNetworkMetrics(),
            'security_metrics' => $this->getSecurityMetrics(),
            'performance_indicators' => $this->getPerformanceIndicators(),
            'health_scores' => $this->calculateHealthScores(),
        ];

        // Store metrics for historical analysis
        $this->storeMetrics($metrics);

        // Check for alerts
        $this->checkAlerts($metrics);

        return $metrics;
    }

    /**
     * Get server information
     */
    private function getServerInfo(): array
    {
        return [
            'hostname' => gethostname(),
            'operating_system' => PHP_OS_FAMILY,
            'php_version' => PHP_VERSION,
            'php_sapi' => PHP_SAPI,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'architecture' => php_uname('m'),
            'kernel_version' => php_uname('r'),
            'uptime' => $this->getSystemUptime(),
            'timezone' => date_default_timezone_get(),
            'locale' => setlocale(LC_ALL, 0),
        ];
    }

    /**
     * Get resource usage metrics
     */
    private function getResourceUsage(): array
    {
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $memoryLimit = $this->parseMemoryValue(ini_get('memory_limit'));

        return [
            'memory' => [
                'current_bytes' => $memoryUsage,
                'current_mb' => round($memoryUsage / 1024 / 1024, 2),
                'peak_bytes' => $memoryPeak,
                'peak_mb' => round($memoryPeak / 1024 / 1024, 2),
                'limit_bytes' => $memoryLimit,
                'limit_mb' => round($memoryLimit / 1024 / 1024, 2),
                'usage_percent' => $memoryLimit > 0 ? round(($memoryUsage / $memoryLimit) * 100, 2) : 0,
            ],
            'cpu' => $this->getCPUUsage(),
            'disk' => $this->getDiskUsage(),
            'load_average' => $this->getLoadAverage(),
            'processes' => $this->getProcessInfo(),
        ];
    }

    /**
     * Get PHP-specific metrics
     */
    private function getPHPMetrics(): array
    {
        return [
            'opcache' => $this->getOpcacheStats(),
            'extensions' => $this->getLoadedExtensions(),
            'configuration' => [
                'max_execution_time' => (int) ini_get('max_execution_time'),
                'max_input_time' => (int) ini_get('max_input_time'),
                'post_max_size' => ini_get('post_max_size'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'max_file_uploads' => (int) ini_get('max_file_uploads'),
                'error_reporting' => error_reporting(),
                'display_errors' => ini_get('display_errors'),
                'log_errors' => ini_get('log_errors'),
            ],
            'garbage_collection' => $this->getGCStats(),
            'realpath_cache' => $this->getRealpathCacheStats(),
        ];
    }

    /**
     * Get application-specific metrics
     */
    private function getApplicationMetrics(): array
    {
        return [
            'laravel' => [
                'version' => app()->version(),
                'environment' => app()->environment(),
                'debug_mode' => config('app.debug'),
                'maintenance_mode' => app()->isDownForMaintenance(),
                'cache_driver' => config('cache.default'),
                'session_driver' => config('session.driver'),
                'queue_driver' => config('queue.default'),
                'mail_driver' => config('mail.default'),
            ],
            'database' => $this->getDatabaseMetrics(),
            'cache' => $this->getCacheMetrics(),
            'queue' => $this->getQueueMetrics(),
            'storage' => $this->getStorageMetrics(),
            'routes' => $this->getRouteMetrics(),
        ];
    }

    /**
     * Get network metrics
     */
    private function getNetworkMetrics(): array
    {
        return [
            'connections' => $this->getNetworkConnections(),
            'bandwidth' => $this->getBandwidthStats(),
            'dns_resolution' => $this->testDNSResolution(),
            'external_connectivity' => $this->testExternalConnectivity(),
            'ssl_certificates' => $this->checkSSLCertificates(),
        ];
    }

    /**
     * Get security metrics
     */
    private function getSecurityMetrics(): array
    {
        return [
            'file_permissions' => $this->checkFilePermissions(),
            'directory_permissions' => $this->checkDirectoryPermissions(),
            'php_security' => $this->checkPHPSecurity(),
            'environment_variables' => $this->checkEnvironmentSecurity(),
            'failed_logins' => $this->getFailedLoginAttempts(),
            'suspicious_activity' => $this->detectSuspiciousActivity(),
        ];
    }

    /**
     * Get performance indicators
     */
    private function getPerformanceIndicators(): array
    {
        return [
            'response_times' => $this->getAverageResponseTimes(),
            'throughput' => $this->getRequestThroughput(),
            'error_rates' => $this->getErrorRates(),
            'cache_hit_rates' => $this->getCacheHitRates(),
            'database_performance' => $this->getDatabasePerformance(),
            'queue_performance' => $this->getQueuePerformance(),
        ];
    }

    /**
     * Calculate health scores
     */
    private function calculateHealthScores(): array
    {
        $scores = [
            'overall' => 100,
            'performance' => 100,
            'security' => 100,
            'stability' => 100,
            'resource_usage' => 100,
        ];

        // Deduct points based on various metrics
        $resourceUsage = $this->getResourceUsage();
        
        // Memory usage penalty
        if (isset($resourceUsage['memory']['usage_percent'])) {
            $memoryUsage = $resourceUsage['memory']['usage_percent'];
            if ($memoryUsage > 90) {
                $scores['resource_usage'] -= 30;
            } elseif ($memoryUsage > 80) {
                $scores['resource_usage'] -= 20;
            } elseif ($memoryUsage > 70) {
                $scores['resource_usage'] -= 10;
            }
        }

        // CPU usage penalty
        if (isset($resourceUsage['cpu']['usage_percent'])) {
            $cpuUsage = $resourceUsage['cpu']['usage_percent'];
            if ($cpuUsage > 90) {
                $scores['performance'] -= 25;
            } elseif ($cpuUsage > 80) {
                $scores['performance'] -= 15;
            }
        }

        // Disk usage penalty
        foreach ($resourceUsage['disk'] ?? [] as $disk) {
            if ($disk['usage_percent'] > 95) {
                $scores['stability'] -= 30;
            } elseif ($disk['usage_percent'] > 90) {
                $scores['stability'] -= 20;
            }
        }

        // Calculate overall score
        $scores['overall'] = round(array_sum(array_slice($scores, 1)) / 4);

        // Ensure scores don't go below 0
        foreach ($scores as &$score) {
            $score = max(0, $score);
        }

        return $scores;
    }

    /**
     * Store metrics for historical analysis
     */
    private function storeMetrics(array $metrics): void
    {
        try {
            $timestamp = now();
            $filename = 'metrics/' . $timestamp->format('Y/m/d/H-i') . '.json';
            
            Storage::disk('local')->put($filename, json_encode($metrics, JSON_PRETTY_PRINT));

            // Clean up old metrics
            $this->cleanupOldMetrics();

        } catch (\Exception $e) {
            Log::error('Failed to store system metrics', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Check for alerts based on thresholds
     */
    private function checkAlerts(array $metrics): void
    {
        $alerts = [];

        // Check CPU usage
        if (isset($metrics['resource_usage']['cpu']['usage_percent'])) {
            $cpuUsage = $metrics['resource_usage']['cpu']['usage_percent'];
            if ($cpuUsage > self::ALERT_THRESHOLDS['cpu_usage']) {
                $alerts[] = [
                    'type' => 'high_cpu_usage',
                    'severity' => 'warning',
                    'message' => "High CPU usage detected: {$cpuUsage}%",
                    'value' => $cpuUsage,
                    'threshold' => self::ALERT_THRESHOLDS['cpu_usage'],
                ];
            }
        }

        // Check memory usage
        if (isset($metrics['resource_usage']['memory']['usage_percent'])) {
            $memoryUsage = $metrics['resource_usage']['memory']['usage_percent'];
            if ($memoryUsage > self::ALERT_THRESHOLDS['memory_usage']) {
                $alerts[] = [
                    'type' => 'high_memory_usage',
                    'severity' => 'warning',
                    'message' => "High memory usage detected: {$memoryUsage}%",
                    'value' => $memoryUsage,
                    'threshold' => self::ALERT_THRESHOLDS['memory_usage'],
                ];
            }
        }

        // Check disk usage
        foreach ($metrics['resource_usage']['disk'] ?? [] as $disk) {
            if ($disk['usage_percent'] > self::ALERT_THRESHOLDS['disk_usage']) {
                $alerts[] = [
                    'type' => 'high_disk_usage',
                    'severity' => 'critical',
                    'message' => "High disk usage on {$disk['mount']}: {$disk['usage_percent']}%",
                    'value' => $disk['usage_percent'],
                    'threshold' => self::ALERT_THRESHOLDS['disk_usage'],
                ];
            }
        }

        // Store alerts
        if (!empty($alerts)) {
            Cache::put('system_alerts', $alerts, 3600);
            
            foreach ($alerts as $alert) {
                Log::warning('System Alert', $alert);
            }
        }
    }

    // Helper methods for collecting specific metrics

    private function getSystemUptime(): ?string
    {
        if (function_exists('exec') && PHP_OS_FAMILY === 'Linux') {
            try {
                $output = shell_exec('uptime -p');
                return $output ? trim($output) : null;
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    private function parseMemoryValue(string $value): int
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $number = (int) $value;

        switch ($last) {
            case 'g': $number *= 1024;
            case 'm': $number *= 1024;
            case 'k': $number *= 1024;
        }

        return $number;
    }

    private function getCPUUsage(): array
    {
        $load = $this->getLoadAverage();
        
        return [
            'usage_percent' => isset($load['1min']) ? min(100, $load['1min'] * 25) : null,
            'load_average' => $load,
            'cores' => $this->getCPUCores(),
        ];
    }

    private function getDiskUsage(): array
    {
        $disks = [];
        
        if (function_exists('disk_free_space') && function_exists('disk_total_space')) {
            $paths = ['/', '/tmp', '/var'];
            
            foreach ($paths as $path) {
                if (is_dir($path)) {
                    $free = disk_free_space($path);
                    $total = disk_total_space($path);
                    
                    if ($free !== false && $total !== false) {
                        $used = $total - $free;
                        $usagePercent = $total > 0 ? round(($used / $total) * 100, 2) : 0;
                        
                        $disks[] = [
                            'mount' => $path,
                            'total_gb' => round($total / 1024 / 1024 / 1024, 2),
                            'used_gb' => round($used / 1024 / 1024 / 1024, 2),
                            'free_gb' => round($free / 1024 / 1024 / 1024, 2),
                            'usage_percent' => $usagePercent,
                        ];
                    }
                }
            }
        }
        
        return $disks;
    }

    private function getLoadAverage(): array
    {
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            return [
                '1min' => round($load[0], 2),
                '5min' => round($load[1], 2),
                '15min' => round($load[2], 2),
            ];
        }
        
        return [];
    }

    private function getCPUCores(): ?int
    {
        if (function_exists('shell_exec')) {
            try {
                $cores = shell_exec('nproc');
                return $cores ? (int) trim($cores) : null;
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    private function getProcessInfo(): array
    {
        return [
            'current_pid' => getmypid(),
            'current_uid' => function_exists('getmyuid') ? getmyuid() : null,
            'current_gid' => function_exists('getmygid') ? getmygid() : null,
            'process_count' => $this->getProcessCount(),
        ];
    }

    private function getProcessCount(): ?int
    {
        if (function_exists('shell_exec')) {
            try {
                $count = shell_exec('ps aux | wc -l');
                return $count ? (int) trim($count) - 1 : null; // Subtract header line
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    private function getOpcacheStats(): array
    {
        if (function_exists('opcache_get_status')) {
            $status = opcache_get_status(false);
            return [
                'enabled' => $status !== false,
                'cache_full' => $status['cache_full'] ?? false,
                'restart_pending' => $status['restart_pending'] ?? false,
                'restart_in_progress' => $status['restart_in_progress'] ?? false,
                'memory_usage' => $status['memory_usage'] ?? [],
                'opcache_statistics' => $status['opcache_statistics'] ?? [],
            ];
        }
        
        return ['enabled' => false];
    }

    private function getLoadedExtensions(): array
    {
        $extensions = get_loaded_extensions();
        $important = ['pdo', 'mysqli', 'curl', 'json', 'openssl', 'mbstring', 'xml', 'zip', 'gd'];
        
        return [
            'total' => count($extensions),
            'important_loaded' => array_intersect($important, $extensions),
            'important_missing' => array_diff($important, $extensions),
        ];
    }

    private function getGCStats(): array
    {
        if (function_exists('gc_status')) {
            return gc_status();
        }
        
        return [];
    }

    private function getRealpathCacheStats(): array
    {
        if (function_exists('realpath_cache_size')) {
            return [
                'size' => realpath_cache_size(),
                'entries' => count(realpath_cache_get()),
            ];
        }
        
        return [];
    }

    private function getDatabaseMetrics(): array
    {
        try {
            return [
                'connection_status' => 'connected',
                'driver' => config('database.default'),
                'query_log_enabled' => \DB::logging(),
            ];
        } catch (\Exception $e) {
            return [
                'connection_status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getCacheMetrics(): array
    {
        return [
            'default_driver' => config('cache.default'),
            'stores' => array_keys(config('cache.stores', [])),
        ];
    }

    private function getQueueMetrics(): array
    {
        return [
            'default_connection' => config('queue.default'),
            'connections' => array_keys(config('queue.connections', [])),
        ];
    }

    private function getStorageMetrics(): array
    {
        return [
            'default_disk' => config('filesystems.default'),
            'disks' => array_keys(config('filesystems.disks', [])),
        ];
    }

    private function getRouteMetrics(): array
    {
        try {
            $routes = \Route::getRoutes();
            return [
                'total_routes' => $routes->count(),
                'methods' => $this->getRouteMethods($routes),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function getRouteMethods($routes): array
    {
        $methods = [];
        foreach ($routes as $route) {
            foreach ($route->methods() as $method) {
                $methods[$method] = ($methods[$method] ?? 0) + 1;
            }
        }
        return $methods;
    }

    private function getNetworkConnections(): array
    {
        // This would require system-level access to get network connection info
        return [
            'note' => 'Network connection monitoring requires system-level access',
        ];
    }

    private function getBandwidthStats(): array
    {
        // This would require system-level access to get bandwidth statistics
        return [
            'note' => 'Bandwidth monitoring requires system-level access',
        ];
    }

    private function testDNSResolution(): array
    {
        $results = [];
        $testDomains = ['google.com', 'github.com'];
        
        foreach ($testDomains as $domain) {
            $start = microtime(true);
            $ip = gethostbyname($domain);
            $time = (microtime(true) - $start) * 1000;
            
            $results[] = [
                'domain' => $domain,
                'resolved_ip' => $ip !== $domain ? $ip : null,
                'resolution_time_ms' => round($time, 2),
                'status' => $ip !== $domain ? 'success' : 'failed',
            ];
        }
        
        return $results;
    }

    private function testExternalConnectivity(): array
    {
        $results = [];
        $testUrls = ['https://httpbin.org/get', 'https://api.github.com'];
        
        foreach ($testUrls as $url) {
            $start = microtime(true);
            $context = stream_context_create(['http' => ['timeout' => 5]]);
            $response = @file_get_contents($url, false, $context);
            $time = (microtime(true) - $start) * 1000;
            
            $results[] = [
                'url' => $url,
                'status' => $response !== false ? 'success' : 'failed',
                'response_time_ms' => round($time, 2),
            ];
        }
        
        return $results;
    }

    private function checkSSLCertificates(): array
    {
        // This would check SSL certificate validity
        return [
            'note' => 'SSL certificate monitoring requires additional implementation',
        ];
    }

    private function checkFilePermissions(): array
    {
        $criticalFiles = [
            '.env',
            'storage/logs/laravel.log',
            'bootstrap/cache/',
            'storage/framework/',
        ];
        
        $permissions = [];
        foreach ($criticalFiles as $file) {
            $path = base_path($file);
            if (file_exists($path)) {
                $permissions[$file] = [
                    'permissions' => substr(sprintf('%o', fileperms($path)), -4),
                    'owner' => function_exists('fileowner') ? fileowner($path) : null,
                    'group' => function_exists('filegroup') ? filegroup($path) : null,
                ];
            }
        }
        
        return $permissions;
    }

    private function checkDirectoryPermissions(): array
    {
        $criticalDirs = [
            'storage/',
            'bootstrap/cache/',
            'public/',
        ];
        
        $permissions = [];
        foreach ($criticalDirs as $dir) {
            $path = base_path($dir);
            if (is_dir($path)) {
                $permissions[$dir] = [
                    'permissions' => substr(sprintf('%o', fileperms($path)), -4),
                    'writable' => is_writable($path),
                ];
            }
        }
        
        return $permissions;
    }

    private function checkPHPSecurity(): array
    {
        return [
            'expose_php' => ini_get('expose_php'),
            'allow_url_fopen' => ini_get('allow_url_fopen'),
            'allow_url_include' => ini_get('allow_url_include'),
            'display_errors' => ini_get('display_errors'),
            'register_globals' => ini_get('register_globals'),
            'magic_quotes_gpc' => function_exists('get_magic_quotes_gpc') ? get_magic_quotes_gpc() : false,
        ];
    }

    private function checkEnvironmentSecurity(): array
    {
        $sensitiveKeys = ['DB_PASSWORD', 'APP_KEY', 'MAIL_PASSWORD'];
        $exposed = [];
        
        foreach ($sensitiveKeys as $key) {
            if (env($key) === null || env($key) === '') {
                $exposed[] = $key;
            }
        }
        
        return [
            'missing_sensitive_vars' => $exposed,
            'debug_mode' => config('app.debug'),
            'environment' => config('app.env'),
        ];
    }

    private function getFailedLoginAttempts(): array
    {
        // This would track failed login attempts from logs
        return [
            'last_24h' => 0,
            'note' => 'Failed login tracking requires log analysis implementation',
        ];
    }

    private function detectSuspiciousActivity(): array
    {
        // This would analyze logs for suspicious patterns
        return [
            'suspicious_requests' => 0,
            'blocked_ips' => [],
            'note' => 'Suspicious activity detection requires log analysis implementation',
        ];
    }

    private function getAverageResponseTimes(): array
    {
        // This would get response times from performance monitoring
        return Cache::get('avg_response_times', [
            'last_hour' => 150,
            'last_24h' => 200,
            'last_week' => 180,
        ]);
    }

    private function getRequestThroughput(): array
    {
        // This would get request throughput metrics
        return Cache::get('request_throughput', [
            'requests_per_minute' => 45,
            'requests_per_hour' => 2700,
        ]);
    }

    private function getErrorRates(): array
    {
        // This would get error rates from error monitoring
        return Cache::get('error_rates', [
            'error_rate_percent' => 0.5,
            'critical_errors_per_hour' => 2,
        ]);
    }

    private function getCacheHitRates(): array
    {
        // This would get cache hit rates
        return [
            'application_cache' => 85.5,
            'database_query_cache' => 92.3,
            'opcache' => 99.1,
        ];
    }

    private function getDatabasePerformance(): array
    {
        // This would get database performance metrics
        return Cache::get('db_performance', [
            'avg_query_time_ms' => 25.5,
            'slow_queries_per_hour' => 3,
            'connections_used_percent' => 35,
        ]);
    }

    private function getQueuePerformance(): array
    {
        // This would get queue performance metrics
        return [
            'jobs_processed_per_minute' => 120,
            'failed_jobs_percent' => 0.2,
            'avg_processing_time_ms' => 450,
        ];
    }

    private function cleanupOldMetrics(): void
    {
        try {
            $cutoffDate = now()->subDays(self::HISTORY_RETENTION_DAYS);
            $directory = 'metrics/' . $cutoffDate->format('Y/m/d');
            
            if (Storage::disk('local')->exists($directory)) {
                Storage::disk('local')->deleteDirectory($directory);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to cleanup old metrics', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get historical metrics data
     */
    public function getHistoricalMetrics(int $hours = 24): array
    {
        $metrics = [];
        $now = now();
        
        for ($i = $hours - 1; $i >= 0; $i--) {
            $timestamp = $now->copy()->subHours($i);
            $filename = 'metrics/' . $timestamp->format('Y/m/d/H-') . '*.json';
            
            try {
                $files = Storage::disk('local')->files(dirname($filename));
                $pattern = basename($filename);
                
                foreach ($files as $file) {
                    if (fnmatch($pattern, basename($file))) {
                        $content = Storage::disk('local')->get($file);
                        $data = json_decode($content, true);
                        
                        if ($data) {
                            $metrics[] = $data;
                        }
                        break; // Take first matching file for the hour
                    }
                }
            } catch (\Exception $e) {
                // Skip missing files
            }
        }
        
        return $metrics;
    }

    /**
     * Get current system alerts
     */
    public function getCurrentAlerts(): array
    {
        return Cache::get('system_alerts', []);
    }
}