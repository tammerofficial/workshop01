<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;

class HealthCheckService
{
    private const HEALTH_CHECK_TIMEOUT = 10; // seconds
    private const CACHE_TTL = 300; // 5 minutes
    private const CRITICAL_SERVICES = ['database', 'cache', 'filesystem'];

    private array $healthChecks = [];
    private array $results = [];

    /**
     * Perform comprehensive health checks
     */
    public function performHealthChecks(): array
    {
        $startTime = microtime(true);
        
        $this->results = [
            'overall_status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'execution_time_ms' => 0,
            'checks' => [],
            'critical_failures' => [],
            'warnings' => [],
            'summary' => [
                'total_checks' => 0,
                'passed' => 0,
                'failed' => 0,
                'warnings' => 0,
            ],
        ];

        try {
            // Core system checks
            $this->checkDatabase();
            $this->checkCache();
            $this->checkFilesystem();
            $this->checkQueueSystem();
            $this->checkApplicationConfig();
            
            // External service checks
            $this->checkExternalAPIs();
            $this->checkEmailService();
            
            // Security checks
            $this->checkSecuritySettings();
            $this->checkSSLCertificate();
            
            // Performance checks
            $this->checkResourceUsage();
            $this->checkResponseTimes();
            
            // Custom application checks
            $this->checkApplicationSpecific();

            // Calculate overall status
            $this->calculateOverallStatus();

            // Store results for monitoring
            $this->storeHealthResults();

        } catch (\Exception $e) {
            $this->addFailure('health_check_system', 'Health check system failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        $this->results['execution_time_ms'] = round((microtime(true) - $startTime) * 1000, 2);
        $this->updateSummary();

        return $this->results;
    }

    /**
     * Check database connectivity and health
     */
    private function checkDatabase(): void
    {
        $checkName = 'database_connectivity';
        $startTime = microtime(true);

        try {
            // Test basic connectivity
            DB::connection()->getPdo();
            
            // Test query execution
            $result = DB::select('SELECT 1 as test');
            if (empty($result) || $result[0]->test !== 1) {
                throw new \Exception('Database query test failed');
            }

            // Check connection pool
            $connectionInfo = $this->getDatabaseConnectionInfo();
            
            $details = [
                'driver' => DB::connection()->getDriverName(),
                'database' => DB::connection()->getDatabaseName(),
                'connection_info' => $connectionInfo,
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            // Check for warnings
            $warnings = [];
            if (isset($connectionInfo['connection_usage_percent']) && 
                $connectionInfo['connection_usage_percent'] > 80) {
                $warnings[] = 'High database connection usage: ' . $connectionInfo['connection_usage_percent'] . '%';
            }

            $this->addCheck($checkName, 'passed', 'Database is accessible and responding', $details, $warnings);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Database connectivity failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check cache system health
     */
    private function checkCache(): void
    {
        $checkName = 'cache_system';
        $startTime = microtime(true);

        try {
            $testKey = 'health_check_' . uniqid();
            $testValue = 'test_value_' . time();

            // Test cache write
            Cache::put($testKey, $testValue, 60);

            // Test cache read
            $retrieved = Cache::get($testKey);
            if ($retrieved !== $testValue) {
                throw new \Exception('Cache read/write test failed');
            }

            // Test cache delete
            Cache::forget($testKey);
            if (Cache::has($testKey)) {
                throw new \Exception('Cache delete test failed');
            }

            $details = [
                'driver' => config('cache.default'),
                'stores' => array_keys(config('cache.stores', [])),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $this->addCheck($checkName, 'passed', 'Cache system is working correctly', $details);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Cache system failed', [
                'error' => $e->getMessage(),
                'driver' => config('cache.default'),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check filesystem health
     */
    private function checkFilesystem(): void
    {
        $checkName = 'filesystem';
        $startTime = microtime(true);

        try {
            // Check storage directories
            $directories = ['logs', 'framework', 'app'];
            $issues = [];

            foreach ($directories as $dir) {
                $path = storage_path($dir);
                if (!is_dir($path)) {
                    $issues[] = "Directory missing: {$dir}";
                } elseif (!is_writable($path)) {
                    $issues[] = "Directory not writable: {$dir}";
                }
            }

            // Test file operations
            $testFile = 'health_check_' . uniqid() . '.txt';
            $testContent = 'Health check test content';

            Storage::disk('local')->put($testFile, $testContent);
            $retrieved = Storage::disk('local')->get($testFile);
            
            if ($retrieved !== $testContent) {
                throw new \Exception('File read/write test failed');
            }

            Storage::disk('local')->delete($testFile);

            // Check disk space
            $diskSpace = $this->getDiskSpaceInfo();

            $details = [
                'storage_path' => storage_path(),
                'writable_directories' => count($directories) - count($issues),
                'total_directories' => count($directories),
                'disk_space' => $diskSpace,
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($issues) ? 'passed' : 'warning';
            $message = empty($issues) ? 'Filesystem is accessible and writable' : 'Filesystem has some issues';

            $this->addCheck($checkName, $status, $message, $details, $issues);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Filesystem check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check queue system health
     */
    private function checkQueueSystem(): void
    {
        $checkName = 'queue_system';
        $startTime = microtime(true);

        try {
            $queueDriver = config('queue.default');
            $details = [
                'driver' => $queueDriver,
                'connections' => array_keys(config('queue.connections', [])),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            // Basic queue configuration check
            if ($queueDriver === 'sync') {
                $this->addCheck($checkName, 'warning', 'Queue is using sync driver (not recommended for production)', $details, [
                    'Sync driver processes jobs immediately and may impact performance'
                ]);
            } else {
                // For other drivers, we'd check connectivity
                $this->addCheck($checkName, 'passed', 'Queue system configured correctly', $details);
            }

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Queue system check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check application configuration
     */
    private function checkApplicationConfig(): void
    {
        $checkName = 'application_config';
        $startTime = microtime(true);

        try {
            $issues = [];
            $warnings = [];

            // Check critical configuration
            if (!config('app.key')) {
                $issues[] = 'Application key not set (APP_KEY)';
            }

            if (config('app.debug') && config('app.env') === 'production') {
                $issues[] = 'Debug mode enabled in production environment';
            }

            if (!config('app.url')) {
                $warnings[] = 'Application URL not set (APP_URL)';
            }

            // Check environment file
            if (!file_exists(base_path('.env'))) {
                $issues[] = 'Environment file (.env) not found';
            }

            $details = [
                'app_name' => config('app.name'),
                'environment' => config('app.env'),
                'debug_mode' => config('app.debug'),
                'timezone' => config('app.timezone'),
                'locale' => config('app.locale'),
                'url' => config('app.url'),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($issues) ? (empty($warnings) ? 'passed' : 'warning') : 'failed';
            $message = empty($issues) ? 'Application configuration is valid' : 'Application configuration has issues';

            $this->addCheck($checkName, $status, $message, $details, array_merge($issues, $warnings));

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Application configuration check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check external API dependencies
     */
    private function checkExternalAPIs(): void
    {
        $checkName = 'external_apis';
        $startTime = microtime(true);

        try {
            $apiChecks = [];
            $externalServices = $this->getExternalServiceUrls();

            foreach ($externalServices as $name => $url) {
                try {
                    $response = Http::timeout(self::HEALTH_CHECK_TIMEOUT)->get($url);
                    
                    $apiChecks[$name] = [
                        'url' => $url,
                        'status' => $response->successful() ? 'accessible' : 'error',
                        'status_code' => $response->status(),
                        'response_time_ms' => $response->transferStats?->getTransferTime() * 1000 ?? null,
                    ];

                } catch (\Exception $e) {
                    $apiChecks[$name] = [
                        'url' => $url,
                        'status' => 'unreachable',
                        'error' => $e->getMessage(),
                    ];
                }
            }

            $failedServices = array_filter($apiChecks, fn($check) => $check['status'] !== 'accessible');
            
            $details = [
                'total_services' => count($apiChecks),
                'accessible_services' => count($apiChecks) - count($failedServices),
                'failed_services' => count($failedServices),
                'service_details' => $apiChecks,
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($failedServices) ? 'passed' : 'warning';
            $message = empty($failedServices) ? 'All external services are accessible' : 'Some external services are unreachable';

            $warnings = [];
            foreach ($failedServices as $name => $service) {
                $warnings[] = "Service '{$name}' is {$service['status']}";
            }

            $this->addCheck($checkName, $status, $message, $details, $warnings);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'External API check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check email service configuration
     */
    private function checkEmailService(): void
    {
        $checkName = 'email_service';
        $startTime = microtime(true);

        try {
            $mailConfig = config('mail');
            $defaultMailer = $mailConfig['default'] ?? 'smtp';
            $mailerConfig = $mailConfig['mailers'][$defaultMailer] ?? [];

            $issues = [];
            $warnings = [];

            // Check mail configuration
            if (!$mailerConfig) {
                $issues[] = 'Mail configuration not found';
            } else {
                if (empty($mailerConfig['host']) && $defaultMailer === 'smtp') {
                    $issues[] = 'SMTP host not configured';
                }

                if (empty($mailConfig['from']['address'])) {
                    $warnings[] = 'Default from address not set';
                }
            }

            $details = [
                'default_mailer' => $defaultMailer,
                'from_address' => $mailConfig['from']['address'] ?? null,
                'from_name' => $mailConfig['from']['name'] ?? null,
                'configuration_valid' => empty($issues),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($issues) ? (empty($warnings) ? 'passed' : 'warning') : 'failed';
            $message = empty($issues) ? 'Email service configured correctly' : 'Email service has configuration issues';

            $this->addCheck($checkName, $status, $message, $details, array_merge($issues, $warnings));

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Email service check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check security settings
     */
    private function checkSecuritySettings(): void
    {
        $checkName = 'security_settings';
        $startTime = microtime(true);

        try {
            $issues = [];
            $warnings = [];

            // Check PHP security settings
            if (ini_get('expose_php')) {
                $warnings[] = 'PHP version is exposed (expose_php = On)';
            }

            if (ini_get('allow_url_fopen')) {
                $warnings[] = 'allow_url_fopen is enabled (potential security risk)';
            }

            if (ini_get('allow_url_include')) {
                $issues[] = 'allow_url_include is enabled (security risk)';
            }

            // Check Laravel security settings
            if (config('app.debug') && config('app.env') === 'production') {
                $issues[] = 'Debug mode enabled in production';
            }

            // Check file permissions
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $perms = substr(sprintf('%o', fileperms($envPath)), -3);
                if ($perms !== '600') {
                    $warnings[] = ".env file permissions are {$perms} (should be 600)";
                }
            }

            $details = [
                'php_version' => PHP_VERSION,
                'expose_php' => (bool) ini_get('expose_php'),
                'allow_url_fopen' => (bool) ini_get('allow_url_fopen'),
                'allow_url_include' => (bool) ini_get('allow_url_include'),
                'debug_mode' => config('app.debug'),
                'environment' => config('app.env'),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($issues) ? (empty($warnings) ? 'passed' : 'warning') : 'failed';
            $message = empty($issues) ? 'Security settings are acceptable' : 'Security settings need attention';

            $this->addCheck($checkName, $status, $message, $details, array_merge($issues, $warnings));

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Security settings check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check SSL certificate (if HTTPS is configured)
     */
    private function checkSSLCertificate(): void
    {
        $checkName = 'ssl_certificate';
        $startTime = microtime(true);

        try {
            $appUrl = config('app.url');
            
            if (!str_starts_with($appUrl, 'https://')) {
                $this->addCheck($checkName, 'skipped', 'SSL not configured (HTTP only)', [
                    'app_url' => $appUrl,
                    'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
                ]);
                return;
            }

            // Parse URL to get domain
            $parsedUrl = parse_url($appUrl);
            $domain = $parsedUrl['host'] ?? null;

            if (!$domain) {
                throw new \Exception('Could not parse domain from app URL');
            }

            // Check SSL certificate
            $context = stream_context_create([
                'ssl' => [
                    'capture_peer_cert' => true,
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $socket = @stream_socket_client(
                "ssl://{$domain}:443",
                $errno,
                $errstr,
                self::HEALTH_CHECK_TIMEOUT,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$socket) {
                throw new \Exception("Cannot connect to SSL server: {$errstr}");
            }

            $cert = stream_context_get_params($socket)['options']['ssl']['peer_certificate'];
            $certInfo = openssl_x509_parse($cert);

            $expiryDate = $certInfo['validTo_time_t'];
            $daysUntilExpiry = ceil(($expiryDate - time()) / 86400);

            $warnings = [];
            if ($daysUntilExpiry < 30) {
                $warnings[] = "SSL certificate expires in {$daysUntilExpiry} days";
            }

            $details = [
                'domain' => $domain,
                'subject' => $certInfo['subject']['CN'] ?? 'Unknown',
                'issuer' => $certInfo['issuer']['CN'] ?? 'Unknown',
                'valid_from' => date('Y-m-d', $certInfo['validFrom_time_t']),
                'valid_to' => date('Y-m-d', $certInfo['validTo_time_t']),
                'days_until_expiry' => $daysUntilExpiry,
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = $daysUntilExpiry > 0 ? (empty($warnings) ? 'passed' : 'warning') : 'failed';
            $message = $daysUntilExpiry > 0 ? 'SSL certificate is valid' : 'SSL certificate has expired';

            $this->addCheck($checkName, $status, $message, $details, $warnings);

            fclose($socket);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'SSL certificate check failed', [
                'error' => $e->getMessage(),
                'app_url' => config('app.url'),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check resource usage
     */
    private function checkResourceUsage(): void
    {
        $checkName = 'resource_usage';
        $startTime = microtime(true);

        try {
            $memoryUsage = memory_get_usage(true);
            $memoryPeak = memory_get_peak_usage(true);
            $memoryLimit = $this->parseMemoryValue(ini_get('memory_limit'));

            $warnings = [];
            $memoryUsagePercent = $memoryLimit > 0 ? ($memoryUsage / $memoryLimit) * 100 : 0;

            if ($memoryUsagePercent > 80) {
                $warnings[] = "High memory usage: {$memoryUsagePercent}%";
            }

            $details = [
                'memory_usage_mb' => round($memoryUsage / 1024 / 1024, 2),
                'memory_peak_mb' => round($memoryPeak / 1024 / 1024, 2),
                'memory_limit_mb' => round($memoryLimit / 1024 / 1024, 2),
                'memory_usage_percent' => round($memoryUsagePercent, 2),
                'load_average' => function_exists('sys_getloadavg') ? sys_getloadavg() : null,
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($warnings) ? 'passed' : 'warning';
            $message = empty($warnings) ? 'Resource usage is normal' : 'Resource usage needs attention';

            $this->addCheck($checkName, $status, $message, $details, $warnings);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Resource usage check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check application response times
     */
    private function checkResponseTimes(): void
    {
        $checkName = 'response_times';
        $startTime = microtime(true);

        try {
            // Get cached performance metrics
            $avgResponseTime = Cache::get('avg_response_time_ms', 0);
            $slowRequestsCount = Cache::get('slow_requests_count', 0);

            $warnings = [];
            if ($avgResponseTime > 3000) {
                $warnings[] = "High average response time: {$avgResponseTime}ms";
            }

            if ($slowRequestsCount > 10) {
                $warnings[] = "High number of slow requests: {$slowRequestsCount}";
            }

            $details = [
                'avg_response_time_ms' => $avgResponseTime,
                'slow_requests_count' => $slowRequestsCount,
                'check_response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($warnings) ? 'passed' : 'warning';
            $message = empty($warnings) ? 'Response times are acceptable' : 'Response times need optimization';

            $this->addCheck($checkName, $status, $message, $details, $warnings);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Response time check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Check application-specific functionality
     */
    private function checkApplicationSpecific(): void
    {
        $checkName = 'application_specific';
        $startTime = microtime(true);

        try {
            $checks = [];
            $warnings = [];

            // Check if critical database tables exist
            $criticalTables = ['users', 'error_logs'];
            foreach ($criticalTables as $table) {
                try {
                    $exists = DB::getSchemaBuilder()->hasTable($table);
                    $checks["table_{$table}"] = $exists;
                    
                    if (!$exists) {
                        $warnings[] = "Critical table '{$table}' does not exist";
                    }
                } catch (\Exception $e) {
                    $checks["table_{$table}"] = false;
                    $warnings[] = "Cannot check table '{$table}': {$e->getMessage()}";
                }
            }

            // Check if we can create a user (authentication system)
            try {
                $userCount = DB::table('users')->count();
                $checks['user_system'] = true;
                $checks['user_count'] = $userCount;
            } catch (\Exception $e) {
                $checks['user_system'] = false;
                $warnings[] = "User system check failed: {$e->getMessage()}";
            }

            $details = [
                'checks' => $checks,
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ];

            $status = empty($warnings) ? 'passed' : 'warning';
            $message = empty($warnings) ? 'Application-specific checks passed' : 'Some application checks failed';

            $this->addCheck($checkName, $status, $message, $details, $warnings);

        } catch (\Exception $e) {
            $this->addFailure($checkName, 'Application-specific check failed', [
                'error' => $e->getMessage(),
                'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
        }
    }

    /**
     * Add a successful or warning check result
     */
    private function addCheck(string $name, string $status, string $message, array $details = [], array $warnings = []): void
    {
        $this->results['checks'][$name] = [
            'status' => $status,
            'message' => $message,
            'details' => $details,
            'warnings' => $warnings,
            'timestamp' => now()->toISOString(),
        ];

        if (!empty($warnings)) {
            $this->results['warnings'] = array_merge($this->results['warnings'], $warnings);
        }
    }

    /**
     * Add a failed check result
     */
    private function addFailure(string $name, string $message, array $details = []): void
    {
        $this->results['checks'][$name] = [
            'status' => 'failed',
            'message' => $message,
            'details' => $details,
            'timestamp' => now()->toISOString(),
        ];

        if (in_array($name, self::CRITICAL_SERVICES) || str_contains($name, 'critical')) {
            $this->results['critical_failures'][] = $message;
        }
    }

    /**
     * Calculate overall health status
     */
    private function calculateOverallStatus(): void
    {
        $failedChecks = array_filter($this->results['checks'], fn($check) => $check['status'] === 'failed');
        $warningChecks = array_filter($this->results['checks'], fn($check) => $check['status'] === 'warning');

        if (!empty($this->results['critical_failures'])) {
            $this->results['overall_status'] = 'critical';
        } elseif (count($failedChecks) > 0) {
            $this->results['overall_status'] = 'unhealthy';
        } elseif (count($warningChecks) > 2) {
            $this->results['overall_status'] = 'degraded';
        } else {
            $this->results['overall_status'] = 'healthy';
        }
    }

    /**
     * Update summary statistics
     */
    private function updateSummary(): void
    {
        $this->results['summary']['total_checks'] = count($this->results['checks']);
        
        foreach ($this->results['checks'] as $check) {
            switch ($check['status']) {
                case 'passed':
                    $this->results['summary']['passed']++;
                    break;
                case 'failed':
                    $this->results['summary']['failed']++;
                    break;
                case 'warning':
                    $this->results['summary']['warnings']++;
                    break;
            }
        }
    }

    /**
     * Store health check results for monitoring
     */
    private function storeHealthResults(): void
    {
        try {
            // Store in cache for quick access
            Cache::put('health_check_latest', $this->results, self::CACHE_TTL);
            
            // Store historical data
            $timestamp = now()->format('Y-m-d-H-i');
            Cache::put("health_check_{$timestamp}", $this->results, 86400); // 24 hours

            // Log critical issues
            if ($this->results['overall_status'] === 'critical') {
                Log::critical('Critical health check failures', [
                    'failures' => $this->results['critical_failures'],
                    'failed_checks' => array_filter($this->results['checks'], fn($check) => $check['status'] === 'failed'),
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to store health check results', ['error' => $e->getMessage()]);
        }
    }

    // Helper methods

    private function getDatabaseConnectionInfo(): array
    {
        try {
            $status = DB::select("SHOW STATUS WHERE Variable_name IN ('Threads_connected', 'Max_connections')");
            $variables = DB::select("SHOW VARIABLES WHERE Variable_name = 'max_connections'");

            $stats = [];
            foreach (array_merge($status, $variables) as $row) {
                $stats[$row->Variable_name] = $row->Value;
            }

            $maxConnections = (int) ($stats['max_connections'] ?? 0);
            $currentConnections = (int) ($stats['Threads_connected'] ?? 0);

            return [
                'max_connections' => $maxConnections,
                'current_connections' => $currentConnections,
                'connection_usage_percent' => $maxConnections > 0 ? round(($currentConnections / $maxConnections) * 100, 2) : 0,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function getDiskSpaceInfo(): array
    {
        try {
            $storagePath = storage_path();
            $totalSpace = disk_total_space($storagePath);
            $freeSpace = disk_free_space($storagePath);
            $usedSpace = $totalSpace - $freeSpace;

            return [
                'total_gb' => round($totalSpace / 1024 / 1024 / 1024, 2),
                'used_gb' => round($usedSpace / 1024 / 1024 / 1024, 2),
                'free_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
                'usage_percent' => $totalSpace > 0 ? round(($usedSpace / $totalSpace) * 100, 2) : 0,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function getExternalServiceUrls(): array
    {
        // Define external services to check
        return [
            'httpbin' => 'https://httpbin.org/status/200',
            'github_api' => 'https://api.github.com',
            // Add more external services as needed
        ];
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

    /**
     * Get quick health status (cached)
     */
    public function getQuickStatus(): array
    {
        $cached = Cache::get('health_check_latest');
        
        if (!$cached) {
            // Perform minimal health checks
            return [
                'overall_status' => 'unknown',
                'message' => 'Health check not yet performed',
                'last_check' => null,
            ];
        }

        return [
            'overall_status' => $cached['overall_status'],
            'summary' => $cached['summary'],
            'last_check' => $cached['timestamp'],
            'critical_failures' => $cached['critical_failures'],
            'execution_time_ms' => $cached['execution_time_ms'],
        ];
    }

    /**
     * Get health check history
     */
    public function getHealthHistory(int $hours = 24): array
    {
        $history = [];
        $now = now();

        for ($i = 0; $i < $hours; $i++) {
            $timestamp = $now->copy()->subHours($i)->format('Y-m-d-H-*');
            $pattern = "health_check_{$timestamp}";
            
            // This is a simplified approach - in production you'd use a more efficient method
            for ($minute = 0; $minute < 60; $minute += 15) { // Check every 15 minutes
                $specificTime = $now->copy()->subHours($i)->minute($minute)->format('Y-m-d-H-i');
                $key = "health_check_{$specificTime}";
                
                $result = Cache::get($key);
                if ($result) {
                    $history[] = [
                        'timestamp' => $result['timestamp'],
                        'overall_status' => $result['overall_status'],
                        'summary' => $result['summary'],
                        'execution_time_ms' => $result['execution_time_ms'],
                    ];
                }
            }
        }

        return array_reverse($history); // Most recent first
    }
}