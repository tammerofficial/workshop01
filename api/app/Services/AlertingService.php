<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Mail\SystemAlertNotification;

class AlertingService
{
    private const ALERT_COOLDOWN_MINUTES = 30;
    private const MAX_ALERTS_PER_HOUR = 20;
    private const ESCALATION_DELAY_MINUTES = 60;

    private array $alertRules = [
        'system_health' => [
            'cpu_usage' => ['threshold' => 80, 'severity' => 'warning', 'comparison' => '>'],
            'memory_usage' => ['threshold' => 85, 'severity' => 'warning', 'comparison' => '>'],
            'disk_usage' => ['threshold' => 90, 'severity' => 'critical', 'comparison' => '>'],
            'load_average' => ['threshold' => 2.0, 'severity' => 'warning', 'comparison' => '>'],
        ],
        'application' => [
            'error_rate' => ['threshold' => 5, 'severity' => 'warning', 'comparison' => '>'],
            'response_time' => ['threshold' => 3000, 'severity' => 'warning', 'comparison' => '>'],
            'failed_jobs' => ['threshold' => 10, 'severity' => 'warning', 'comparison' => '>'],
            'critical_errors' => ['threshold' => 1, 'severity' => 'critical', 'comparison' => '>'],
        ],
        'database' => [
            'slow_queries' => ['threshold' => 10, 'severity' => 'warning', 'comparison' => '>'],
            'connection_usage' => ['threshold' => 80, 'severity' => 'warning', 'comparison' => '>'],
            'deadlocks' => ['threshold' => 1, 'severity' => 'critical', 'comparison' => '>'],
            'replication_lag' => ['threshold' => 300, 'severity' => 'warning', 'comparison' => '>'],
        ],
        'security' => [
            'failed_logins' => ['threshold' => 50, 'severity' => 'warning', 'comparison' => '>'],
            'suspicious_requests' => ['threshold' => 100, 'severity' => 'warning', 'comparison' => '>'],
            'unauthorized_access' => ['threshold' => 1, 'severity' => 'critical', 'comparison' => '>'],
        ],
    ];

    /**
     * Process and evaluate all monitoring data for alerts
     */
    public function processAlerts(): array
    {
        $triggeredAlerts = [];

        try {
            // Collect current metrics
            $systemMetrics = app(SystemMetricsService::class)->collectSystemMetrics();
            $databaseHealth = app(DatabaseMonitoringService::class)->getDatabaseHealth();
            $performanceData = $this->getPerformanceData();
            $securityData = $this->getSecurityData();

            // Evaluate system health alerts
            $systemAlerts = $this->evaluateSystemAlerts($systemMetrics);
            $triggeredAlerts = array_merge($triggeredAlerts, $systemAlerts);

            // Evaluate database alerts
            $databaseAlerts = $this->evaluateDatabaseAlerts($databaseHealth);
            $triggeredAlerts = array_merge($triggeredAlerts, $databaseAlerts);

            // Evaluate application performance alerts
            $performanceAlerts = $this->evaluatePerformanceAlerts($performanceData);
            $triggeredAlerts = array_merge($triggeredAlerts, $performanceAlerts);

            // Evaluate security alerts
            $securityAlerts = $this->evaluateSecurityAlerts($securityData);
            $triggeredAlerts = array_merge($triggeredAlerts, $securityAlerts);

            // Process composite alerts (multiple conditions)
            $compositeAlerts = $this->evaluateCompositeAlerts($systemMetrics, $databaseHealth, $performanceData);
            $triggeredAlerts = array_merge($triggeredAlerts, $compositeAlerts);

            // Handle triggered alerts
            foreach ($triggeredAlerts as $alert) {
                $this->handleAlert($alert);
            }

            // Store alert summary
            $this->storeAlertSummary($triggeredAlerts);

        } catch (\Exception $e) {
            Log::error('Alert processing failed', ['error' => $e->getMessage()]);
            
            // Create an alert about the alerting system failure
            $this->handleAlert([
                'type' => 'alerting_system_failure',
                'severity' => 'critical',
                'message' => 'Alerting system encountered an error',
                'details' => ['error' => $e->getMessage()],
                'timestamp' => now(),
            ]);
        }

        return $triggeredAlerts;
    }

    /**
     * Evaluate system health alerts
     */
    private function evaluateSystemAlerts(array $metrics): array
    {
        $alerts = [];
        $rules = $this->alertRules['system_health'];

        // CPU Usage
        if (isset($metrics['resource_usage']['cpu']['usage_percent'])) {
            $cpuUsage = $metrics['resource_usage']['cpu']['usage_percent'];
            if ($this->evaluateThreshold($cpuUsage, $rules['cpu_usage'])) {
                $alerts[] = [
                    'type' => 'high_cpu_usage',
                    'category' => 'system_health',
                    'severity' => $rules['cpu_usage']['severity'],
                    'message' => "High CPU usage detected: {$cpuUsage}%",
                    'current_value' => $cpuUsage,
                    'threshold' => $rules['cpu_usage']['threshold'],
                    'metric_name' => 'CPU Usage',
                    'timestamp' => now(),
                    'context' => $metrics['resource_usage']['cpu'] ?? [],
                ];
            }
        }

        // Memory Usage
        if (isset($metrics['resource_usage']['memory']['usage_percent'])) {
            $memoryUsage = $metrics['resource_usage']['memory']['usage_percent'];
            if ($this->evaluateThreshold($memoryUsage, $rules['memory_usage'])) {
                $alerts[] = [
                    'type' => 'high_memory_usage',
                    'category' => 'system_health',
                    'severity' => $rules['memory_usage']['severity'],
                    'message' => "High memory usage detected: {$memoryUsage}%",
                    'current_value' => $memoryUsage,
                    'threshold' => $rules['memory_usage']['threshold'],
                    'metric_name' => 'Memory Usage',
                    'timestamp' => now(),
                    'context' => $metrics['resource_usage']['memory'] ?? [],
                ];
            }
        }

        // Disk Usage
        foreach ($metrics['resource_usage']['disk'] ?? [] as $disk) {
            if ($this->evaluateThreshold($disk['usage_percent'], $rules['disk_usage'])) {
                $alerts[] = [
                    'type' => 'high_disk_usage',
                    'category' => 'system_health',
                    'severity' => $rules['disk_usage']['severity'],
                    'message' => "High disk usage on {$disk['mount']}: {$disk['usage_percent']}%",
                    'current_value' => $disk['usage_percent'],
                    'threshold' => $rules['disk_usage']['threshold'],
                    'metric_name' => 'Disk Usage',
                    'timestamp' => now(),
                    'context' => $disk,
                ];
            }
        }

        // Load Average
        if (isset($metrics['resource_usage']['load_average']['1min'])) {
            $loadAvg = $metrics['resource_usage']['load_average']['1min'];
            if ($this->evaluateThreshold($loadAvg, $rules['load_average'])) {
                $alerts[] = [
                    'type' => 'high_load_average',
                    'category' => 'system_health',
                    'severity' => $rules['load_average']['severity'],
                    'message' => "High system load average: {$loadAvg}",
                    'current_value' => $loadAvg,
                    'threshold' => $rules['load_average']['threshold'],
                    'metric_name' => 'Load Average (1min)',
                    'timestamp' => now(),
                    'context' => $metrics['resource_usage']['load_average'] ?? [],
                ];
            }
        }

        return $alerts;
    }

    /**
     * Evaluate database alerts
     */
    private function evaluateDatabaseAlerts(array $dbHealth): array
    {
        $alerts = [];
        $rules = $this->alertRules['database'];

        // Connection Usage
        if (isset($dbHealth['connection_info']['connection_usage_percent'])) {
            $connUsage = $dbHealth['connection_info']['connection_usage_percent'];
            if ($this->evaluateThreshold($connUsage, $rules['connection_usage'])) {
                $alerts[] = [
                    'type' => 'high_database_connections',
                    'category' => 'database',
                    'severity' => $rules['connection_usage']['severity'],
                    'message' => "High database connection usage: {$connUsage}%",
                    'current_value' => $connUsage,
                    'threshold' => $rules['connection_usage']['threshold'],
                    'metric_name' => 'Database Connection Usage',
                    'timestamp' => now(),
                    'context' => $dbHealth['connection_info'] ?? [],
                ];
            }
        }

        // Slow Queries
        if (isset($dbHealth['query_analysis']['slow_queries'])) {
            $slowQueries = count($dbHealth['query_analysis']['slow_queries']);
            if ($this->evaluateThreshold($slowQueries, $rules['slow_queries'])) {
                $alerts[] = [
                    'type' => 'database_slow_queries',
                    'category' => 'database',
                    'severity' => $rules['slow_queries']['severity'],
                    'message' => "High number of slow database queries: {$slowQueries}",
                    'current_value' => $slowQueries,
                    'threshold' => $rules['slow_queries']['threshold'],
                    'metric_name' => 'Slow Queries Count',
                    'timestamp' => now(),
                    'context' => array_slice($dbHealth['query_analysis']['slow_queries'], 0, 5),
                ];
            }
        }

        // Deadlocks
        if (isset($dbHealth['lock_information']['deadlocks_detected'])) {
            $deadlocks = $dbHealth['lock_information']['deadlocks_detected'];
            if ($this->evaluateThreshold($deadlocks, $rules['deadlocks'])) {
                $alerts[] = [
                    'type' => 'database_deadlocks',
                    'category' => 'database',
                    'severity' => $rules['deadlocks']['severity'],
                    'message' => "Database deadlocks detected: {$deadlocks}",
                    'current_value' => $deadlocks,
                    'threshold' => $rules['deadlocks']['threshold'],
                    'metric_name' => 'Database Deadlocks',
                    'timestamp' => now(),
                    'context' => $dbHealth['lock_information'] ?? [],
                ];
            }
        }

        return $alerts;
    }

    /**
     * Evaluate application performance alerts
     */
    private function evaluatePerformanceAlerts(array $performance): array
    {
        $alerts = [];
        $rules = $this->alertRules['application'];

        // Error Rate
        if (isset($performance['error_rate'])) {
            $errorRate = $performance['error_rate'];
            if ($this->evaluateThreshold($errorRate, $rules['error_rate'])) {
                $alerts[] = [
                    'type' => 'high_error_rate',
                    'category' => 'application',
                    'severity' => $rules['error_rate']['severity'],
                    'message' => "High application error rate: {$errorRate}%",
                    'current_value' => $errorRate,
                    'threshold' => $rules['error_rate']['threshold'],
                    'metric_name' => 'Error Rate',
                    'timestamp' => now(),
                    'context' => $performance,
                ];
            }
        }

        // Response Time
        if (isset($performance['avg_response_time'])) {
            $responseTime = $performance['avg_response_time'];
            if ($this->evaluateThreshold($responseTime, $rules['response_time'])) {
                $alerts[] = [
                    'type' => 'slow_response_time',
                    'category' => 'application',
                    'severity' => $rules['response_time']['severity'],
                    'message' => "Slow application response time: {$responseTime}ms",
                    'current_value' => $responseTime,
                    'threshold' => $rules['response_time']['threshold'],
                    'metric_name' => 'Average Response Time',
                    'timestamp' => now(),
                    'context' => $performance,
                ];
            }
        }

        // Critical Errors
        if (isset($performance['critical_errors'])) {
            $criticalErrors = $performance['critical_errors'];
            if ($this->evaluateThreshold($criticalErrors, $rules['critical_errors'])) {
                $alerts[] = [
                    'type' => 'critical_application_errors',
                    'category' => 'application',
                    'severity' => $rules['critical_errors']['severity'],
                    'message' => "Critical application errors detected: {$criticalErrors}",
                    'current_value' => $criticalErrors,
                    'threshold' => $rules['critical_errors']['threshold'],
                    'metric_name' => 'Critical Errors',
                    'timestamp' => now(),
                    'context' => $performance,
                ];
            }
        }

        return $alerts;
    }

    /**
     * Evaluate security alerts
     */
    private function evaluateSecurityAlerts(array $security): array
    {
        $alerts = [];
        $rules = $this->alertRules['security'];

        // Failed Logins
        if (isset($security['failed_logins'])) {
            $failedLogins = $security['failed_logins'];
            if ($this->evaluateThreshold($failedLogins, $rules['failed_logins'])) {
                $alerts[] = [
                    'type' => 'high_failed_logins',
                    'category' => 'security',
                    'severity' => $rules['failed_logins']['severity'],
                    'message' => "High number of failed login attempts: {$failedLogins}",
                    'current_value' => $failedLogins,
                    'threshold' => $rules['failed_logins']['threshold'],
                    'metric_name' => 'Failed Login Attempts',
                    'timestamp' => now(),
                    'context' => $security,
                ];
            }
        }

        // Suspicious Requests
        if (isset($security['suspicious_requests'])) {
            $suspiciousRequests = $security['suspicious_requests'];
            if ($this->evaluateThreshold($suspiciousRequests, $rules['suspicious_requests'])) {
                $alerts[] = [
                    'type' => 'suspicious_activity',
                    'category' => 'security',
                    'severity' => $rules['suspicious_requests']['severity'],
                    'message' => "Suspicious request activity detected: {$suspiciousRequests} requests",
                    'current_value' => $suspiciousRequests,
                    'threshold' => $rules['suspicious_requests']['threshold'],
                    'metric_name' => 'Suspicious Requests',
                    'timestamp' => now(),
                    'context' => $security,
                ];
            }
        }

        return $alerts;
    }

    /**
     * Evaluate composite alerts (multiple conditions)
     */
    private function evaluateCompositeAlerts(array $systemMetrics, array $dbHealth, array $performance): array
    {
        $alerts = [];

        // System Under Stress (High CPU + High Memory + Slow Response)
        $cpuUsage = $systemMetrics['resource_usage']['cpu']['usage_percent'] ?? 0;
        $memoryUsage = $systemMetrics['resource_usage']['memory']['usage_percent'] ?? 0;
        $responseTime = $performance['avg_response_time'] ?? 0;

        if ($cpuUsage > 70 && $memoryUsage > 70 && $responseTime > 2000) {
            $alerts[] = [
                'type' => 'system_under_stress',
                'category' => 'composite',
                'severity' => 'critical',
                'message' => 'System is under severe stress (High CPU, Memory, and slow responses)',
                'current_values' => [
                    'cpu_usage' => $cpuUsage,
                    'memory_usage' => $memoryUsage,
                    'response_time' => $responseTime,
                ],
                'metric_name' => 'System Stress Index',
                'timestamp' => now(),
                'context' => [
                    'system' => $systemMetrics['resource_usage'] ?? [],
                    'performance' => $performance,
                ],
            ];
        }

        // Database Performance Issues (High Connections + Slow Queries + High CPU)
        $dbConnections = $dbHealth['connection_info']['connection_usage_percent'] ?? 0;
        $slowQueries = count($dbHealth['query_analysis']['slow_queries'] ?? []);

        if ($dbConnections > 60 && $slowQueries > 5 && $cpuUsage > 60) {
            $alerts[] = [
                'type' => 'database_performance_degradation',
                'category' => 'composite',
                'severity' => 'warning',
                'message' => 'Database performance is degrading (High connections, slow queries, and CPU usage)',
                'current_values' => [
                    'db_connections' => $dbConnections,
                    'slow_queries' => $slowQueries,
                    'cpu_usage' => $cpuUsage,
                ],
                'metric_name' => 'Database Performance Index',
                'timestamp' => now(),
                'context' => [
                    'database' => $dbHealth,
                    'system' => $systemMetrics['resource_usage']['cpu'] ?? [],
                ],
            ];
        }

        return $alerts;
    }

    /**
     * Handle a triggered alert
     */
    private function handleAlert(array $alert): void
    {
        try {
            // Check if alert should be suppressed due to cooldown
            if ($this->isAlertSuppressed($alert)) {
                return;
            }

            // Check rate limiting
            if (!$this->checkAlertRateLimit()) {
                Log::warning('Alert rate limit exceeded', ['alert' => $alert]);
                return;
            }

            // Add unique alert ID
            $alert['alert_id'] = $this->generateAlertId($alert);

            // Store alert in database
            $this->storeAlert($alert);

            // Send notifications based on severity
            $this->sendAlertNotifications($alert);

            // Log the alert
            Log::channel('alerts')->alert('System Alert Triggered', $alert);

            // Update alert tracking
            $this->updateAlertTracking($alert);

            // Schedule escalation if needed
            if (in_array($alert['severity'], ['critical', 'high'])) {
                $this->scheduleEscalation($alert);
            }

        } catch (\Exception $e) {
            Log::error('Failed to handle alert', [
                'alert' => $alert,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check if alert should be suppressed due to cooldown
     */
    private function isAlertSuppressed(array $alert): bool
    {
        $cooldownKey = 'alert_cooldown_' . $alert['type'];
        return Cache::has($cooldownKey);
    }

    /**
     * Check alert rate limiting
     */
    private function checkAlertRateLimit(): bool
    {
        $hourlyKey = 'alert_count_' . date('Y-m-d-H');
        $currentCount = Cache::get($hourlyKey, 0);

        if ($currentCount >= self::MAX_ALERTS_PER_HOUR) {
            return false;
        }

        Cache::put($hourlyKey, $currentCount + 1, 3600);
        return true;
    }

    /**
     * Generate unique alert ID
     */
    private function generateAlertId(array $alert): string
    {
        return 'alert_' . date('Ymd_His') . '_' . substr(md5($alert['type'] . $alert['message']), 0, 8);
    }

    /**
     * Store alert in database
     */
    private function storeAlert(array $alert): void
    {
        try {
            DB::table('system_alerts')->insert([
                'alert_id' => $alert['alert_id'],
                'type' => $alert['type'],
                'category' => $alert['category'] ?? 'general',
                'severity' => $alert['severity'],
                'message' => $alert['message'],
                'current_value' => $alert['current_value'] ?? null,
                'threshold' => $alert['threshold'] ?? null,
                'metric_name' => $alert['metric_name'] ?? null,
                'context' => json_encode($alert['context'] ?? []),
                'resolved' => false,
                'created_at' => $alert['timestamp'],
                'updated_at' => $alert['timestamp'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store alert in database', [
                'alert' => $alert,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send alert notifications
     */
    private function sendAlertNotifications(array $alert): void
    {
        try {
            // Get notification recipients based on alert severity and type
            $recipients = $this->getAlertRecipients($alert);

            foreach ($recipients as $recipient) {
                // Send email notification
                if ($recipient['email_enabled'] && $this->shouldSendEmailAlert($alert, $recipient)) {
                    Mail::to($recipient['email'])->send(new SystemAlertNotification($alert, $recipient));
                }

                // Send Slack notification (if configured)
                if ($recipient['slack_enabled'] ?? false) {
                    $this->sendSlackNotification($alert, $recipient);
                }

                // Send SMS notification for critical alerts (if configured)
                if ($alert['severity'] === 'critical' && ($recipient['sms_enabled'] ?? false)) {
                    $this->sendSMSNotification($alert, $recipient);
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send alert notifications', [
                'alert' => $alert,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get alert notification recipients
     */
    private function getAlertRecipients(array $alert): array
    {
        // Default recipients
        $recipients = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@workshop.local',
                'email_enabled' => true,
                'severity_threshold' => 'warning',
                'categories' => ['system_health', 'database', 'application', 'security', 'composite'],
            ],
            [
                'name' => 'Database Administrator',
                'email' => 'dba@workshop.local',
                'email_enabled' => true,
                'severity_threshold' => 'warning',
                'categories' => ['database'],
            ],
        ];

        // Filter recipients based on alert category and severity
        return array_filter($recipients, function ($recipient) use ($alert) {
            // Check if recipient handles this category
            if (!in_array($alert['category'] ?? 'general', $recipient['categories'])) {
                return false;
            }

            // Check severity threshold
            $severityLevels = ['low' => 1, 'warning' => 2, 'high' => 3, 'critical' => 4];
            $alertLevel = $severityLevels[$alert['severity']] ?? 1;
            $thresholdLevel = $severityLevels[$recipient['severity_threshold']] ?? 2;

            return $alertLevel >= $thresholdLevel;
        });
    }

    /**
     * Check if email alert should be sent
     */
    private function shouldSendEmailAlert(array $alert, array $recipient): bool
    {
        // Don't send emails for low severity alerts during off-hours
        if ($alert['severity'] === 'low' && $this->isOffHours()) {
            return false;
        }

        // Check if we've already sent an email for this alert type recently
        $emailKey = 'email_sent_' . $alert['type'] . '_' . $recipient['email'];
        if (Cache::has($emailKey)) {
            return false;
        }

        // Set cooldown
        Cache::put($emailKey, true, self::ALERT_COOLDOWN_MINUTES * 60);

        return true;
    }

    /**
     * Check if current time is off-hours
     */
    private function isOffHours(): bool
    {
        $hour = (int) date('H');
        return $hour < 8 || $hour > 20; // Before 8 AM or after 8 PM
    }

    /**
     * Send Slack notification
     */
    private function sendSlackNotification(array $alert, array $recipient): void
    {
        // Implementation would depend on Slack webhook configuration
        Log::info('Slack notification would be sent', [
            'alert' => $alert,
            'recipient' => $recipient['name'],
        ]);
    }

    /**
     * Send SMS notification
     */
    private function sendSMSNotification(array $alert, array $recipient): void
    {
        // Implementation would depend on SMS service configuration
        Log::info('SMS notification would be sent', [
            'alert' => $alert,
            'recipient' => $recipient['name'],
        ]);
    }

    /**
     * Update alert tracking
     */
    private function updateAlertTracking(array $alert): void
    {
        // Set cooldown for this alert type
        $cooldownKey = 'alert_cooldown_' . $alert['type'];
        Cache::put($cooldownKey, true, self::ALERT_COOLDOWN_MINUTES * 60);

        // Update alert statistics
        $statsKey = 'alert_stats_' . date('Y-m-d');
        $stats = Cache::get($statsKey, []);
        $stats[$alert['type']] = ($stats[$alert['type']] ?? 0) + 1;
        Cache::put($statsKey, $stats, 86400); // 24 hours
    }

    /**
     * Schedule alert escalation
     */
    private function scheduleEscalation(array $alert): void
    {
        // This would typically use a queue system to schedule escalation
        $escalationTime = now()->addMinutes(self::ESCALATION_DELAY_MINUTES);
        
        Cache::put('escalation_' . $alert['alert_id'], [
            'alert' => $alert,
            'escalation_time' => $escalationTime,
            'escalated' => false,
        ], self::ESCALATION_DELAY_MINUTES * 60 + 300); // Extra 5 minutes buffer

        Log::info('Alert escalation scheduled', [
            'alert_id' => $alert['alert_id'],
            'escalation_time' => $escalationTime,
        ]);
    }

    /**
     * Evaluate threshold condition
     */
    private function evaluateThreshold($value, array $rule): bool
    {
        $threshold = $rule['threshold'];
        $comparison = $rule['comparison'];

        return match ($comparison) {
            '>' => $value > $threshold,
            '>=' => $value >= $threshold,
            '<' => $value < $threshold,
            '<=' => $value <= $threshold,
            '==' => $value == $threshold,
            '!=' => $value != $threshold,
            default => false,
        };
    }

    /**
     * Get performance data for alerting
     */
    private function getPerformanceData(): array
    {
        return [
            'error_rate' => Cache::get('error_rate_percent', 0),
            'avg_response_time' => Cache::get('avg_response_time_ms', 0),
            'critical_errors' => Cache::get('critical_errors_count', 0),
            'failed_jobs' => Cache::get('failed_jobs_count', 0),
        ];
    }

    /**
     * Get security data for alerting
     */
    private function getSecurityData(): array
    {
        return [
            'failed_logins' => Cache::get('failed_logins_24h', 0),
            'suspicious_requests' => Cache::get('suspicious_requests_count', 0),
            'unauthorized_access' => Cache::get('unauthorized_access_count', 0),
        ];
    }

    /**
     * Store alert summary
     */
    private function storeAlertSummary(array $alerts): void
    {
        $summary = [
            'timestamp' => now(),
            'total_alerts' => count($alerts),
            'by_severity' => [],
            'by_category' => [],
            'by_type' => [],
        ];

        foreach ($alerts as $alert) {
            $severity = $alert['severity'];
            $category = $alert['category'] ?? 'general';
            $type = $alert['type'];

            $summary['by_severity'][$severity] = ($summary['by_severity'][$severity] ?? 0) + 1;
            $summary['by_category'][$category] = ($summary['by_category'][$category] ?? 0) + 1;
            $summary['by_type'][$type] = ($summary['by_type'][$type] ?? 0) + 1;
        }

        Cache::put('alert_summary_latest', $summary, 3600);
    }

    /**
     * Get current alert status
     */
    public function getAlertStatus(): array
    {
        $summary = Cache::get('alert_summary_latest', []);
        $activeAlerts = $this->getActiveAlerts();
        
        return [
            'summary' => $summary,
            'active_alerts' => $activeAlerts,
            'alert_history' => $this->getAlertHistory(24), // Last 24 hours
        ];
    }

    /**
     * Get active alerts
     */
    private function getActiveAlerts(): array
    {
        try {
            return DB::table('system_alerts')
                ->where('resolved', false)
                ->where('created_at', '>=', now()->subHours(24))
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get alert history
     */
    private function getAlertHistory(int $hours): array
    {
        try {
            return DB::table('system_alerts')
                ->where('created_at', '>=', now()->subHours($hours))
                ->orderBy('created_at', 'desc')
                ->limit(100)
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Resolve an alert
     */
    public function resolveAlert(string $alertId, string $notes = null): bool
    {
        try {
            $updated = DB::table('system_alerts')
                ->where('alert_id', $alertId)
                ->update([
                    'resolved' => true,
                    'resolution_notes' => $notes,
                    'resolved_at' => now(),
                    'updated_at' => now(),
                ]);

            if ($updated) {
                Log::info('Alert resolved', [
                    'alert_id' => $alertId,
                    'notes' => $notes,
                ]);
            }

            return $updated > 0;

        } catch (\Exception $e) {
            Log::error('Failed to resolve alert', [
                'alert_id' => $alertId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}