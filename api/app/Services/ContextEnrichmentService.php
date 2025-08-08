<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ContextEnrichmentService
{
    /**
     * Enrich error context with additional debugging information
     */
    public function enrichErrorContext(\Throwable $exception, Request $request = null): array
    {
        $context = [
            'system' => $this->getSystemContext(),
            'request' => $this->getRequestContext($request),
            'user' => $this->getUserContext(),
            'database' => $this->getDatabaseContext(),
            'performance' => $this->getPerformanceContext(),
            'environment' => $this->getEnvironmentContext(),
            'trace' => $this->getEnhancedStackTrace($exception),
        ];

        return $context;
    }

    /**
     * Get system-level context
     */
    private function getSystemContext(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'memory_usage' => [
                'current' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true),
                'limit' => ini_get('memory_limit'),
            ],
            'server_time' => now()->toISOString(),
            'timezone' => config('app.timezone'),
            'debug_mode' => config('app.debug'),
            'environment' => config('app.env'),
            'server_load' => function_exists('sys_getloadavg') ? sys_getloadavg() : null,
        ];
    }

    /**
     * Get request-specific context
     */
    private function getRequestContext(Request $request = null): array
    {
        if (!$request) {
            $request = request();
        }

        $headers = $request->headers->all();
        
        // Remove sensitive headers
        unset($headers['authorization'], $headers['cookie'], $headers['x-api-key']);

        return [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'query_params' => $request->query(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
            'headers' => $headers,
            'request_id' => $request->header('X-Request-ID', uniqid('req_')),
            'content_type' => $request->header('Content-Type'),
            'accepts' => $request->getAcceptableContentTypes(),
            'is_ajax' => $request->ajax(),
            'is_json' => $request->expectsJson(),
            'input_size' => strlen(json_encode($request->all())),
        ];
    }

    /**
     * Get user-specific context
     */
    private function getUserContext(): array
    {
        $user = Auth::user();
        
        if (!$user) {
            return [
                'authenticated' => false,
                'guest_session_id' => session()->getId(),
            ];
        }

        return [
            'authenticated' => true,
            'user_id' => $user->id,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'last_login' => $user->last_login_at,
            'created_at' => $user->created_at,
            'session_id' => session()->getId(),
            'preferences' => $this->getUserPreferences($user),
        ];
    }

    /**
     * Get database-specific context
     */
    private function getDatabaseContext(): array
    {
        try {
            $connectionName = config('database.default');
            $connection = DB::connection($connectionName);
            
            // Get database stats
            $stats = [
                'connection_name' => $connectionName,
                'driver' => $connection->getDriverName(),
                'database_name' => $connection->getDatabaseName(),
                'query_count' => count(DB::getQueryLog()),
                'active_connections' => $this->getActiveConnectionsCount(),
            ];

            // Add MySQL-specific stats if applicable
            if ($connection->getDriverName() === 'mysql') {
                $stats['mysql_stats'] = $this->getMySQLStats($connection);
            }

            return $stats;
        } catch (\Exception $e) {
            return [
                'error' => 'Unable to retrieve database context: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get performance-related context
     */
    private function getPerformanceContext(): array
    {
        return [
            'execution_time' => defined('LARAVEL_START') ? microtime(true) - LARAVEL_START : null,
            'memory_usage' => [
                'current_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                'peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            ],
            'opcache_enabled' => function_exists('opcache_get_status') && opcache_get_status()['opcache_enabled'],
            'cache_hits' => $this->getCacheStats(),
            'db_query_time' => $this->getTotalQueryTime(),
        ];
    }

    /**
     * Get environment-specific context
     */
    private function getEnvironmentContext(): array
    {
        return [
            'app_name' => config('app.name'),
            'app_url' => config('app.url'),
            'queue_driver' => config('queue.default'),
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'mail_driver' => config('mail.default'),
            'storage_driver' => config('filesystems.default'),
            'broadcast_driver' => config('broadcasting.default'),
            'log_channel' => config('logging.default'),
        ];
    }

    /**
     * Get enhanced stack trace with file content preview
     */
    private function getEnhancedStackTrace(\Throwable $exception): array
    {
        $trace = $exception->getTrace();
        $enhancedTrace = [];

        foreach (array_slice($trace, 0, 10) as $index => $frame) {
            $enhanced = [
                'file' => $frame['file'] ?? 'unknown',
                'line' => $frame['line'] ?? 0,
                'function' => $frame['function'] ?? 'unknown',
                'class' => $frame['class'] ?? null,
                'type' => $frame['type'] ?? null,
            ];

            // Add file content preview for application files
            if (isset($frame['file']) && str_contains($frame['file'], base_path())) {
                $enhanced['file_preview'] = $this->getFilePreview($frame['file'], $frame['line'] ?? 0);
            }

            $enhancedTrace[] = $enhanced;
        }

        return $enhancedTrace;
    }

    /**
     * Get file content preview around error line
     */
    private function getFilePreview(string $file, int $line): array
    {
        if (!file_exists($file) || !is_readable($file)) {
            return ['error' => 'File not accessible'];
        }

        try {
            $lines = file($file, FILE_IGNORE_NEW_LINES);
            $start = max(0, $line - 6);
            $end = min(count($lines), $line + 5);
            
            $preview = [];
            for ($i = $start; $i < $end; $i++) {
                $preview[$i + 1] = $lines[$i];
            }

            return [
                'error_line' => $line,
                'preview' => $preview,
                'total_lines' => count($lines),
            ];
        } catch (\Exception $e) {
            return ['error' => 'Unable to read file: ' . $e->getMessage()];
        }
    }

    /**
     * Get user preferences
     */
    private function getUserPreferences($user): array
    {
        try {
            return [
                'language' => $user->language ?? 'en',
                'timezone' => $user->timezone ?? config('app.timezone'),
                'theme' => $user->theme ?? 'auto',
            ];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get active database connections count
     */
    private function getActiveConnectionsCount(): int
    {
        try {
            $result = DB::select("SHOW STATUS WHERE Variable_name = 'Threads_connected'");
            return (int) ($result[0]->Value ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get MySQL-specific statistics
     */
    private function getMySQLStats($connection): array
    {
        try {
            $stats = [];
            
            // Get server status
            $status = $connection->select("SHOW STATUS WHERE Variable_name IN ('Uptime', 'Questions', 'Slow_queries', 'Connections')");
            foreach ($status as $stat) {
                $stats[strtolower($stat->Variable_name)] = $stat->Value;
            }

            // Get server variables
            $variables = $connection->select("SHOW VARIABLES WHERE Variable_name IN ('version', 'max_connections', 'innodb_buffer_pool_size')");
            foreach ($variables as $var) {
                $stats[strtolower($var->Variable_name)] = $var->Value;
            }

            return $stats;
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get cache statistics
     */
    private function getCacheStats(): array
    {
        try {
            $driver = config('cache.default');
            return [
                'driver' => $driver,
                'redis_info' => $driver === 'redis' ? $this->getRedisInfo() : null,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get Redis information
     */
    private function getRedisInfo(): array
    {
        try {
            if (!class_exists(\Illuminate\Support\Facades\Redis::class)) {
                return ['error' => 'Redis not available'];
            }

            $redis = \Illuminate\Support\Facades\Redis::connection();
            $info = $redis->info();
            
            return [
                'connected_clients' => $info['connected_clients'] ?? 0,
                'used_memory_human' => $info['used_memory_human'] ?? 'unknown',
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get total database query time
     */
    private function getTotalQueryTime(): float
    {
        $totalTime = 0;
        foreach (DB::getQueryLog() as $query) {
            $totalTime += $query['time'];
        }
        return round($totalTime, 2);
    }
}