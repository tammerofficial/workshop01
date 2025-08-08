<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class PerformanceMonitoringService
{
    private const SLOW_QUERY_THRESHOLD = 1000; // 1 second in milliseconds
    private const MEMORY_WARNING_THRESHOLD = 128 * 1024 * 1024; // 128MB
    private const REQUEST_TIME_WARNING = 5000; // 5 seconds in milliseconds

    private array $metrics = [];
    private float $requestStartTime;
    private int $requestStartMemory;

    public function __construct()
    {
        $this->requestStartTime = microtime(true);
        $this->requestStartMemory = memory_get_usage(true);
    }

    /**
     * Start monitoring a request
     */
    public function startRequest(Request $request): void
    {
        $this->metrics = [
            'request_id' => uniqid('req_'),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => auth()->id(),
            'start_time' => $this->requestStartTime,
            'start_memory' => $this->requestStartMemory,
            'queries' => [],
            'cache_operations' => [],
            'external_requests' => [],
        ];

        // Enable query logging
        DB::enableQueryLog();
    }

    /**
     * End monitoring and analyze performance
     */
    public function endRequest(): array
    {
        $endTime = microtime(true);
        $endMemory = memory_get_usage(true);
        $peakMemory = memory_get_peak_usage(true);

        $executionTime = ($endTime - $this->requestStartTime) * 1000; // Convert to milliseconds
        $memoryUsed = $endMemory - $this->requestStartMemory;

        // Get database queries
        $queries = DB::getQueryLog();
        $slowQueries = $this->analyzeQueries($queries);

        $performance = [
            'request_id' => $this->metrics['request_id'] ?? uniqid('req_'),
            'url' => $this->metrics['url'] ?? request()->fullUrl(),
            'method' => $this->metrics['method'] ?? request()->method(),
            'execution_time_ms' => round($executionTime, 2),
            'memory_used_mb' => round($memoryUsed / 1024 / 1024, 2),
            'peak_memory_mb' => round($peakMemory / 1024 / 1024, 2),
            'query_count' => count($queries),
            'slow_queries' => $slowQueries,
            'total_query_time_ms' => $this->getTotalQueryTime($queries),
            'timestamp' => now()->toISOString(),
            'warnings' => $this->generateWarnings($executionTime, $memoryUsed, $slowQueries),
        ];

        // Store performance data
        $this->storePerformanceData($performance);

        // Check for performance issues
        $this->checkPerformanceThresholds($performance);

        return $performance;
    }

    /**
     * Analyze database queries for performance issues
     */
    private function analyzeQueries(array $queries): array
    {
        $slowQueries = [];

        foreach ($queries as $query) {
            $timeMs = $query['time'];
            
            if ($timeMs > self::SLOW_QUERY_THRESHOLD) {
                $slowQueries[] = [
                    'sql' => $query['query'],
                    'bindings' => $query['bindings'],
                    'time_ms' => $timeMs,
                    'type' => $this->getQueryType($query['query']),
                    'table' => $this->extractTableName($query['query']),
                    'severity' => $this->getQuerySeverity($timeMs),
                ];
            }
        }

        return $slowQueries;
    }

    /**
     * Get total time spent on database queries
     */
    private function getTotalQueryTime(array $queries): float
    {
        return round(array_sum(array_column($queries, 'time')), 2);
    }

    /**
     * Generate performance warnings
     */
    private function generateWarnings(float $executionTime, int $memoryUsed, array $slowQueries): array
    {
        $warnings = [];

        if ($executionTime > self::REQUEST_TIME_WARNING) {
            $warnings[] = [
                'type' => 'slow_request',
                'message' => "Request took {$executionTime}ms (threshold: " . self::REQUEST_TIME_WARNING . "ms)",
                'severity' => 'high',
            ];
        }

        if ($memoryUsed > self::MEMORY_WARNING_THRESHOLD) {
            $memoryMB = round($memoryUsed / 1024 / 1024, 2);
            $thresholdMB = round(self::MEMORY_WARNING_THRESHOLD / 1024 / 1024, 2);
            $warnings[] = [
                'type' => 'high_memory_usage',
                'message' => "High memory usage: {$memoryMB}MB (threshold: {$thresholdMB}MB)",
                'severity' => 'medium',
            ];
        }

        if (!empty($slowQueries)) {
            $warnings[] = [
                'type' => 'slow_queries',
                'message' => count($slowQueries) . " slow database queries detected",
                'severity' => 'high',
                'queries' => array_slice($slowQueries, 0, 3), // Include top 3 slowest
            ];
        }

        return $warnings;
    }

    /**
     * Store performance data for analysis
     */
    private function storePerformanceData(array $performance): void
    {
        try {
            // Store in cache for real-time monitoring
            $cacheKey = 'performance_' . date('Y-m-d-H-i');
            $cached = Cache::get($cacheKey, []);
            $cached[] = $performance;
            
            // Keep only last 100 requests per minute
            if (count($cached) > 100) {
                $cached = array_slice($cached, -100);
            }
            
            Cache::put($cacheKey, $cached, 3600); // 1 hour

            // Log to file for historical analysis
            Log::channel('performance')->info('Request Performance', $performance);

            // Store aggregated metrics
            $this->updateAggregatedMetrics($performance);

        } catch (\Exception $e) {
            Log::error('Failed to store performance data', [
                'error' => $e->getMessage(),
                'performance' => $performance,
            ]);
        }
    }

    /**
     * Update aggregated performance metrics
     */
    private function updateAggregatedMetrics(array $performance): void
    {
        $hourKey = 'perf_metrics_' . date('Y-m-d-H');
        $metrics = Cache::get($hourKey, [
            'request_count' => 0,
            'total_execution_time' => 0,
            'total_memory_used' => 0,
            'slow_requests' => 0,
            'error_count' => 0,
        ]);

        $metrics['request_count']++;
        $metrics['total_execution_time'] += $performance['execution_time_ms'];
        $metrics['total_memory_used'] += $performance['memory_used_mb'];
        
        if ($performance['execution_time_ms'] > self::REQUEST_TIME_WARNING) {
            $metrics['slow_requests']++;
        }

        if (!empty($performance['warnings'])) {
            $metrics['error_count']++;
        }

        Cache::put($hourKey, $metrics, 3600);
    }

    /**
     * Check performance thresholds and alert if needed
     */
    private function checkPerformanceThresholds(array $performance): void
    {
        foreach ($performance['warnings'] as $warning) {
            if ($warning['severity'] === 'high') {
                Log::warning('Performance Warning', [
                    'request_id' => $performance['request_id'],
                    'url' => $performance['url'],
                    'warning' => $warning,
                ]);

                // Could trigger notifications here
                $this->triggerPerformanceAlert($warning, $performance);
            }
        }
    }

    /**
     * Trigger performance alerts
     */
    private function triggerPerformanceAlert(array $warning, array $performance): void
    {
        $alertKey = 'perf_alert_' . $warning['type'] . '_' . date('Y-m-d-H');
        
        // Rate limit alerts - max 5 per hour per type
        $alertCount = Cache::get($alertKey, 0);
        if ($alertCount >= 5) {
            return;
        }

        Cache::increment($alertKey);
        Cache::expire($alertKey, 3600);

        // Log alert
        Log::alert('Performance Alert Triggered', [
            'warning_type' => $warning['type'],
            'message' => $warning['message'],
            'request_details' => [
                'url' => $performance['url'],
                'execution_time' => $performance['execution_time_ms'],
                'memory_used' => $performance['memory_used_mb'],
            ],
        ]);
    }

    /**
     * Get query type from SQL
     */
    private function getQueryType(string $sql): string
    {
        $sql = trim(strtoupper($sql));
        
        if (str_starts_with($sql, 'SELECT')) return 'SELECT';
        if (str_starts_with($sql, 'INSERT')) return 'INSERT';
        if (str_starts_with($sql, 'UPDATE')) return 'UPDATE';
        if (str_starts_with($sql, 'DELETE')) return 'DELETE';
        if (str_starts_with($sql, 'CREATE')) return 'CREATE';
        if (str_starts_with($sql, 'ALTER')) return 'ALTER';
        if (str_starts_with($sql, 'DROP')) return 'DROP';
        
        return 'OTHER';
    }

    /**
     * Extract table name from SQL query
     */
    private function extractTableName(string $sql): ?string
    {
        // Simple regex to extract table name - could be improved
        if (preg_match('/(?:from|into|update|join)\s+`?(\w+)`?/i', $sql, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    /**
     * Determine query severity based on execution time
     */
    private function getQuerySeverity(float $timeMs): string
    {
        if ($timeMs > 5000) return 'critical';  // > 5 seconds
        if ($timeMs > 3000) return 'high';      // > 3 seconds
        if ($timeMs > 1000) return 'medium';    // > 1 second
        
        return 'low';
    }

    /**
     * Get performance dashboard data
     */
    public function getDashboardData(): array
    {
        $currentHour = date('Y-m-d-H');
        $metrics = Cache::get('perf_metrics_' . $currentHour, []);
        
        $hourlyTrends = $this->getHourlyTrends(24);
        $slowQueries = $this->getRecentSlowQueries();
        $topEndpoints = $this->getTopSlowEndpoints();

        return [
            'current_metrics' => $metrics,
            'hourly_trends' => $hourlyTrends,
            'slow_queries' => $slowQueries,
            'top_slow_endpoints' => $topEndpoints,
            'system_health' => $this->getSystemHealthMetrics(),
            'recommendations' => $this->getPerformanceRecommendations($metrics),
        ];
    }

    /**
     * Get hourly performance trends
     */
    private function getHourlyTrends(int $hours): array
    {
        $trends = [];
        $now = now();

        for ($i = $hours - 1; $i >= 0; $i--) {
            $hour = $now->copy()->subHours($i);
            $key = 'perf_metrics_' . $hour->format('Y-m-d-H');
            $metrics = Cache::get($key, []);
            
            $avgExecutionTime = 0;
            $avgMemoryUsage = 0;
            
            if (isset($metrics['request_count']) && $metrics['request_count'] > 0) {
                $avgExecutionTime = $metrics['total_execution_time'] / $metrics['request_count'];
                $avgMemoryUsage = $metrics['total_memory_used'] / $metrics['request_count'];
            }

            $trends[] = [
                'hour' => $hour->format('H:00'),
                'request_count' => $metrics['request_count'] ?? 0,
                'avg_execution_time' => round($avgExecutionTime, 2),
                'avg_memory_usage' => round($avgMemoryUsage, 2),
                'slow_requests' => $metrics['slow_requests'] ?? 0,
            ];
        }

        return $trends;
    }

    /**
     * Get recent slow queries from logs
     */
    private function getRecentSlowQueries(): array
    {
        // This would typically read from a database table or log files
        // For now, return cached data
        $queries = [];
        
        for ($i = 0; $i < 60; $i++) { // Last 60 minutes
            $key = 'performance_' . date('Y-m-d-H-i', time() - ($i * 60));
            $cached = Cache::get($key, []);
            
            foreach ($cached as $performance) {
                if (!empty($performance['slow_queries'])) {
                    foreach ($performance['slow_queries'] as $query) {
                        $queries[] = array_merge($query, [
                            'request_url' => $performance['url'],
                            'timestamp' => $performance['timestamp'],
                        ]);
                    }
                }
            }
        }

        // Sort by execution time and return top 20
        usort($queries, fn($a, $b) => $b['time_ms'] <=> $a['time_ms']);
        
        return array_slice($queries, 0, 20);
    }

    /**
     * Get top slow endpoints
     */
    private function getTopSlowEndpoints(): array
    {
        $endpoints = [];
        
        for ($i = 0; $i < 60; $i++) {
            $key = 'performance_' . date('Y-m-d-H-i', time() - ($i * 60));
            $cached = Cache::get($key, []);
            
            foreach ($cached as $performance) {
                $url = $performance['url'];
                
                if (!isset($endpoints[$url])) {
                    $endpoints[$url] = [
                        'url' => $url,
                        'request_count' => 0,
                        'total_time' => 0,
                        'max_time' => 0,
                    ];
                }
                
                $endpoints[$url]['request_count']++;
                $endpoints[$url]['total_time'] += $performance['execution_time_ms'];
                $endpoints[$url]['max_time'] = max($endpoints[$url]['max_time'], $performance['execution_time_ms']);
            }
        }

        // Calculate averages and sort
        foreach ($endpoints as &$endpoint) {
            $endpoint['avg_time'] = round($endpoint['total_time'] / $endpoint['request_count'], 2);
        }

        uasort($endpoints, fn($a, $b) => $b['avg_time'] <=> $a['avg_time']);
        
        return array_slice(array_values($endpoints), 0, 10);
    }

    /**
     * Get system health metrics
     */
    private function getSystemHealthMetrics(): array
    {
        return [
            'php_memory_limit' => ini_get('memory_limit'),
            'php_max_execution_time' => ini_get('max_execution_time'),
            'current_memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'peak_memory_usage' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'opcache_enabled' => function_exists('opcache_get_status') && opcache_get_status()['opcache_enabled'],
            'server_load' => function_exists('sys_getloadavg') ? sys_getloadavg() : null,
        ];
    }

    /**
     * Get performance recommendations
     */
    private function getPerformanceRecommendations(array $metrics): array
    {
        $recommendations = [];

        if (isset($metrics['slow_requests']) && $metrics['slow_requests'] > 5) {
            $recommendations[] = [
                'type' => 'slow_requests',
                'title' => 'High number of slow requests detected',
                'description' => 'Multiple requests are taking longer than expected to complete.',
                'actions' => [
                    'Review database queries for optimization opportunities',
                    'Consider implementing caching for frequently accessed data',
                    'Check for external API calls that might be slow',
                    'Monitor server resources (CPU, memory, disk I/O)',
                ],
                'priority' => 'high',
            ];
        }

        if (isset($metrics['total_memory_used']) && $metrics['request_count'] > 0) {
            $avgMemory = $metrics['total_memory_used'] / $metrics['request_count'];
            
            if ($avgMemory > 64) { // 64MB average per request
                $recommendations[] = [
                    'type' => 'memory_usage',
                    'title' => 'High memory usage per request',
                    'description' => "Average memory usage is {$avgMemory}MB per request.",
                    'actions' => [
                        'Profile memory usage to identify memory leaks',
                        'Optimize data loading and processing',
                        'Consider pagination for large datasets',
                        'Review object instantiation and disposal',
                    ],
                    'priority' => 'medium',
                ];
            }
        }

        return $recommendations;
    }
}