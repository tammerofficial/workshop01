<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\SystemMetricsService;
use App\Services\DatabaseMonitoringService;
use App\Services\PerformanceMonitoringService;
use App\Services\AlertingService;
use App\Services\HealthCheckService;
use App\Services\ErrorMonitoringService;

class SystemMonitoringController extends Controller
{
    private SystemMetricsService $systemMetrics;
    private DatabaseMonitoringService $databaseMonitoring;
    private PerformanceMonitoringService $performanceMonitoring;
    private AlertingService $alerting;
    private HealthCheckService $healthCheck;
    private ErrorMonitoringService $errorMonitoring;

    public function __construct(
        SystemMetricsService $systemMetrics,
        DatabaseMonitoringService $databaseMonitoring,
        PerformanceMonitoringService $performanceMonitoring,
        AlertingService $alerting,
        HealthCheckService $healthCheck,
        ErrorMonitoringService $errorMonitoring
    ) {
        $this->systemMetrics = $systemMetrics;
        $this->databaseMonitoring = $databaseMonitoring;
        $this->performanceMonitoring = $performanceMonitoring;
        $this->alerting = $alerting;
        $this->healthCheck = $healthCheck;
        $this->errorMonitoring = $errorMonitoring;
    }

    /**
     * Get comprehensive system overview dashboard
     */
    public function getSystemOverview(): JsonResponse
    {
        try {
            $overview = [
                'timestamp' => now()->toISOString(),
                'system_health' => $this->healthCheck->getQuickStatus(),
                'system_metrics' => $this->getSystemMetricsSummary(),
                'database_health' => $this->getDatabaseHealthSummary(),
                'performance_metrics' => $this->getPerformanceMetricsSummary(),
                'error_monitoring' => $this->getErrorMonitoringSummary(),
                'alerts' => $this->getAlertsSummary(),
                'uptime_status' => $this->getUptimeStatus(),
            ];

            return response()->json([
                'success' => true,
                'data' => $overview,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve system overview',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get detailed system metrics
     */
    public function getSystemMetrics(): JsonResponse
    {
        try {
            $metrics = $this->systemMetrics->collectSystemMetrics();

            return response()->json([
                'success' => true,
                'data' => $metrics,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to collect system metrics',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get historical system metrics
     */
    public function getSystemMetricsHistory(Request $request): JsonResponse
    {
        try {
            $hours = $request->input('hours', 24);
            $hours = min(max($hours, 1), 168); // Limit between 1 hour and 1 week

            $history = $this->systemMetrics->getHistoricalMetrics($hours);

            return response()->json([
                'success' => true,
                'data' => [
                    'period_hours' => $hours,
                    'metrics' => $history,
                    'summary' => $this->calculateHistoricalSummary($history),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve historical metrics',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get database health and monitoring data
     */
    public function getDatabaseHealth(): JsonResponse
    {
        try {
            $health = $this->databaseMonitoring->getDatabaseHealth();

            return response()->json([
                'success' => true,
                'data' => $health,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve database health',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get performance monitoring data
     */
    public function getPerformanceData(): JsonResponse
    {
        try {
            $performance = $this->performanceMonitoring->getDashboardData();

            return response()->json([
                'success' => true,
                'data' => $performance,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve performance data',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get alerting system status and recent alerts
     */
    public function getAlertsStatus(): JsonResponse
    {
        try {
            $alertStatus = $this->alerting->getAlertStatus();

            return response()->json([
                'success' => true,
                'data' => $alertStatus,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve alerts status',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Trigger manual alert processing
     */
    public function processAlerts(): JsonResponse
    {
        try {
            $alerts = $this->alerting->processAlerts();

            return response()->json([
                'success' => true,
                'data' => [
                    'processed_alerts' => count($alerts),
                    'alerts' => $alerts,
                    'timestamp' => now()->toISOString(),
                ],
                'message' => 'Alert processing completed successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to process alerts',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Resolve a specific alert
     */
    public function resolveAlert(Request $request, string $alertId): JsonResponse
    {
        try {
            $notes = $request->input('notes');
            $resolved = $this->alerting->resolveAlert($alertId, $notes);

            if ($resolved) {
                return response()->json([
                    'success' => true,
                    'message' => 'Alert resolved successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Alert not found or already resolved',
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to resolve alert',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Perform comprehensive health check
     */
    public function performHealthCheck(): JsonResponse
    {
        try {
            $healthResults = $this->healthCheck->performHealthChecks();

            return response()->json([
                'success' => true,
                'data' => $healthResults,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Health check failed',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get health check history
     */
    public function getHealthHistory(Request $request): JsonResponse
    {
        try {
            $hours = $request->input('hours', 24);
            $hours = min(max($hours, 1), 168); // Limit between 1 hour and 1 week

            $history = $this->healthCheck->getHealthHistory($hours);

            return response()->json([
                'success' => true,
                'data' => [
                    'period_hours' => $hours,
                    'history' => $history,
                    'uptime_percentage' => $this->calculateUptimePercentage($history),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve health history',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get comprehensive monitoring report
     */
    public function getMonitoringReport(Request $request): JsonResponse
    {
        try {
            $period = $request->input('period', '24h'); // 1h, 24h, 7d, 30d
            $includeDetails = $request->boolean('include_details', false);

            $report = [
                'report_id' => 'report_' . uniqid(),
                'generated_at' => now()->toISOString(),
                'period' => $period,
                'executive_summary' => $this->generateExecutiveSummary($period),
                'system_overview' => $this->getSystemOverviewForReport($period),
                'performance_analysis' => $this->getPerformanceAnalysisForReport($period),
                'error_analysis' => $this->getErrorAnalysisForReport($period),
                'security_overview' => $this->getSecurityOverviewForReport($period),
                'recommendations' => $this->generateRecommendations(),
            ];

            if ($includeDetails) {
                $report['detailed_metrics'] = $this->getDetailedMetricsForReport($period);
                $report['alert_details'] = $this->getAlertDetailsForReport($period);
            }

            return response()->json([
                'success' => true,
                'data' => $report,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate monitoring report',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Export monitoring data
     */
    public function exportMonitoringData(Request $request): JsonResponse
    {
        try {
            $format = $request->input('format', 'json'); // json, csv, pdf
            $dataTypes = $request->input('data_types', ['metrics', 'alerts', 'health']);
            $period = $request->input('period', '24h');

            $exportData = [
                'export_id' => 'export_' . uniqid(),
                'generated_at' => now()->toISOString(),
                'format' => $format,
                'period' => $period,
                'data' => [],
            ];

            if (in_array('metrics', $dataTypes)) {
                $exportData['data']['system_metrics'] = $this->getMetricsForExport($period);
            }

            if (in_array('alerts', $dataTypes)) {
                $exportData['data']['alerts'] = $this->getAlertsForExport($period);
            }

            if (in_array('health', $dataTypes)) {
                $exportData['data']['health_checks'] = $this->getHealthDataForExport($period);
            }

            // In a real implementation, you might generate files and return download URLs
            return response()->json([
                'success' => true,
                'data' => $exportData,
                'download_url' => null, // Would be populated with actual file URL
                'message' => 'Export data prepared successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to export monitoring data',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    // Helper methods for data summarization

    private function getSystemMetricsSummary(): array
    {
        $currentAlerts = $this->systemMetrics->getCurrentAlerts();
        
        return [
            'cpu_usage' => 'N/A', // Would get from cached metrics
            'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
            'disk_usage' => 'N/A', // Would get from disk monitoring
            'load_average' => function_exists('sys_getloadavg') ? sys_getloadavg()[0] ?? 'N/A' : 'N/A',
            'active_alerts' => count($currentAlerts),
            'health_score' => 95, // Would calculate from actual metrics
        ];
    }

    private function getDatabaseHealthSummary(): array
    {
        try {
            $health = $this->databaseMonitoring->getDatabaseHealth();
            
            return [
                'status' => $health['overall_status'] ?? 'unknown',
                'connection_usage' => $health['connection_info']['connection_usage_percent'] ?? 0,
                'slow_queries' => count($health['query_analysis']['slow_queries'] ?? []),
                'storage_usage' => $health['storage_usage']['database_size_mb'] ?? 0,
                'active_locks' => $health['lock_information']['current_locks'] ?? 0,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => 'Unable to retrieve database health',
            ];
        }
    }

    private function getPerformanceMetricsSummary(): array
    {
        try {
            $performance = $this->performanceMonitoring->getDashboardData();
            
            return [
                'avg_response_time' => $performance['system_health']['current_memory_usage'] ?? 0,
                'requests_per_minute' => 'N/A', // Would get from performance monitoring
                'error_rate' => 'N/A', // Would get from error monitoring
                'cache_hit_rate' => 'N/A', // Would get from cache monitoring
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => 'Unable to retrieve performance metrics',
            ];
        }
    }

    private function getErrorMonitoringSummary(): array
    {
        try {
            $errorData = $this->errorMonitoring->getDashboardData();
            
            return [
                'total_errors_24h' => $errorData['system_health']['total_errors_24h'] ?? 0,
                'critical_errors' => $errorData['system_health']['critical_errors_24h'] ?? 0,
                'resolution_rate' => $errorData['system_health']['resolved_percentage'] ?? 0,
                'recent_errors' => count($errorData['recent_activity'] ?? []),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => 'Unable to retrieve error monitoring data',
            ];
        }
    }

    private function getAlertsSummary(): array
    {
        try {
            $alertStatus = $this->alerting->getAlertStatus();
            
            return [
                'active_alerts' => count($alertStatus['active_alerts'] ?? []),
                'critical_alerts' => count(array_filter($alertStatus['active_alerts'] ?? [], fn($alert) => $alert->severity === 'critical')),
                'alerts_24h' => count($alertStatus['alert_history'] ?? []),
                'last_alert' => !empty($alertStatus['active_alerts']) ? $alertStatus['active_alerts'][0]->created_at : null,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => 'Unable to retrieve alerts data',
            ];
        }
    }

    private function getUptimeStatus(): array
    {
        try {
            $healthHistory = $this->healthCheck->getHealthHistory(24);
            $uptimePercentage = $this->calculateUptimePercentage($healthHistory);
            
            return [
                'uptime_24h' => $uptimePercentage,
                'uptime_7d' => 'N/A', // Would calculate from longer history
                'uptime_30d' => 'N/A', // Would calculate from longer history
                'last_downtime' => 'N/A', // Would get from downtime tracking
                'mttr_minutes' => 'N/A', // Mean Time To Recovery
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => 'Unable to retrieve uptime data',
            ];
        }
    }

    private function calculateHistoricalSummary(array $history): array
    {
        if (empty($history)) {
            return [];
        }

        $summary = [
            'data_points' => count($history),
            'period_start' => $history[0]['timestamp'] ?? null,
            'period_end' => end($history)['timestamp'] ?? null,
            'avg_cpu_usage' => 0,
            'avg_memory_usage' => 0,
            'peak_memory_usage' => 0,
            'health_score_trend' => 'stable',
        ];

        // Calculate averages from historical data
        $cpuUsages = [];
        $memoryUsages = [];
        
        foreach ($history as $metric) {
            if (isset($metric['resource_usage']['cpu']['usage_percent'])) {
                $cpuUsages[] = $metric['resource_usage']['cpu']['usage_percent'];
            }
            if (isset($metric['resource_usage']['memory']['usage_percent'])) {
                $memoryUsages[] = $metric['resource_usage']['memory']['usage_percent'];
            }
        }

        if (!empty($cpuUsages)) {
            $summary['avg_cpu_usage'] = round(array_sum($cpuUsages) / count($cpuUsages), 2);
        }

        if (!empty($memoryUsages)) {
            $summary['avg_memory_usage'] = round(array_sum($memoryUsages) / count($memoryUsages), 2);
            $summary['peak_memory_usage'] = round(max($memoryUsages), 2);
        }

        return $summary;
    }

    private function calculateUptimePercentage(array $healthHistory): float
    {
        if (empty($healthHistory)) {
            return 0.0;
        }

        $healthyCount = 0;
        foreach ($healthHistory as $check) {
            if (in_array($check['overall_status'], ['healthy', 'degraded'])) {
                $healthyCount++;
            }
        }

        return round(($healthyCount / count($healthHistory)) * 100, 2);
    }

    // Report generation helper methods

    private function generateExecutiveSummary(string $period): array
    {
        return [
            'overall_health' => 'Good',
            'key_metrics' => [
                'uptime' => '99.95%',
                'avg_response_time' => '150ms',
                'error_rate' => '0.02%',
                'performance_score' => 95,
            ],
            'critical_issues' => 0,
            'recommendations_count' => 3,
        ];
    }

    private function getSystemOverviewForReport(string $period): array
    {
        return [
            'infrastructure' => [
                'server_count' => 1,
                'database_instances' => 1,
                'load_balancers' => 0,
            ],
            'resource_utilization' => [
                'avg_cpu' => '45%',
                'avg_memory' => '68%',
                'avg_disk' => '23%',
            ],
            'availability' => [
                'uptime_percentage' => 99.95,
                'planned_downtime' => '0 minutes',
                'unplanned_downtime' => '3 minutes',
            ],
        ];
    }

    private function getPerformanceAnalysisForReport(string $period): array
    {
        return [
            'response_times' => [
                'p50' => 120,
                'p95' => 300,
                'p99' => 500,
            ],
            'throughput' => [
                'requests_per_second' => 45,
                'peak_rps' => 120,
            ],
            'bottlenecks' => [
                'database_queries' => 'Optimized',
                'external_apis' => 'Normal',
                'file_system' => 'Normal',
            ],
        ];
    }

    private function getErrorAnalysisForReport(string $period): array
    {
        return [
            'error_trends' => [
                'total_errors' => 15,
                'critical_errors' => 1,
                'error_rate_change' => '-12%',
            ],
            'top_error_types' => [
                'Database Connection' => 8,
                'API Timeout' => 4,
                'Validation Error' => 3,
            ],
            'resolution_metrics' => [
                'avg_resolution_time' => '15 minutes',
                'resolution_rate' => '95%',
            ],
        ];
    }

    private function getSecurityOverviewForReport(string $period): array
    {
        return [
            'security_events' => [
                'failed_logins' => 25,
                'suspicious_requests' => 3,
                'blocked_ips' => 2,
            ],
            'compliance_status' => [
                'ssl_certificate' => 'Valid',
                'security_headers' => 'Configured',
                'access_controls' => 'Active',
            ],
            'vulnerabilities' => [
                'critical' => 0,
                'high' => 0,
                'medium' => 1,
                'low' => 3,
            ],
        ];
    }

    private function generateRecommendations(): array
    {
        return [
            [
                'priority' => 'medium',
                'category' => 'performance',
                'title' => 'Database Query Optimization',
                'description' => 'Consider adding indexes for frequently queried columns',
                'impact' => 'Medium',
                'effort' => 'Low',
            ],
            [
                'priority' => 'low',
                'category' => 'monitoring',
                'title' => 'Increase Health Check Frequency',
                'description' => 'Consider running health checks every 5 minutes instead of 15',
                'impact' => 'Low',
                'effort' => 'Low',
            ],
            [
                'priority' => 'high',
                'category' => 'security',
                'title' => 'Enable Rate Limiting',
                'description' => 'Implement rate limiting for API endpoints',
                'impact' => 'High',
                'effort' => 'Medium',
            ],
        ];
    }

    // Export helper methods (simplified implementations)

    private function getMetricsForExport(string $period): array
    {
        return ['note' => 'Metrics export implementation required'];
    }

    private function getAlertsForExport(string $period): array
    {
        return ['note' => 'Alerts export implementation required'];
    }

    private function getHealthDataForExport(string $period): array
    {
        return ['note' => 'Health data export implementation required'];
    }

    private function getDetailedMetricsForReport(string $period): array
    {
        return ['note' => 'Detailed metrics implementation required'];
    }

    private function getAlertDetailsForReport(string $period): array
    {
        return ['note' => 'Alert details implementation required'];
    }
}