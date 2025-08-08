<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\ErrorLog;

class ErrorMonitoringService
{
    private const MAX_CONTEXT_SIZE = 65535; // Max text field size
    private const CRITICAL_ERRORS_THRESHOLD = 10;
    private const ERROR_RATE_WINDOW = 3600; // 1 hour in seconds

    /**
     * Log error with enhanced context and monitoring
     */
    public function logError(\Throwable $exception, Request $request = null): void
    {
        try {
            // Enhanced context with additional debugging information
            $contextService = app(ContextEnrichmentService::class);
            $context = $contextService->enrichErrorContext($exception, $request);
            
            $errorData = [
                'error_id' => $this->generateErrorId(),
                'type' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'code' => $exception->getCode() ?: null,
                'url' => $request ? $request->fullUrl() : (request() ? request()->fullUrl() : ''),
                'method' => $request ? $request->method() : (request() ? request()->method() : ''),
                'ip' => $request ? $request->ip() : (request() ? request()->ip() : ''),
                'user_id' => Auth::id(),
                'severity' => $this->determineSeverity($exception),
                'context' => $this->limitContextSize($context),
                'stack_trace' => $exception->getTraceAsString(),
            ];

            // Store in database
            $errorLog = ErrorLog::create($errorData);

            // Send notifications for critical errors
            if ($errorData['severity'] === 'critical') {
                $notificationService = app(ErrorNotificationService::class);
                $notificationService->notifyCriticalError($exception, $context);
            }

            // Track error rate and patterns
            $this->trackErrorMetrics($exception, $errorData);

            // Log to Laravel's logging system as well
            Log::error('Application Error Monitored', [
                'error_id' => $errorData['error_id'],
                'type' => $errorData['type'],
                'message' => $errorData['message'],
                'severity' => $errorData['severity'],
            ]);

        } catch (\Exception $e) {
            // Fallback logging to prevent infinite loops
            Log::critical('Failed to log error to monitoring system', [
                'original_error' => $exception->getMessage(),
                'logging_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Determine error severity based on exception type and context
     */
    private function determineSeverity(\Throwable $exception): string
    {
        // Critical errors that can break the application
        $criticalTypes = [
            \Error::class,
            \ParseError::class,
            \TypeError::class,
            \Illuminate\Database\QueryException::class,
            \PDOException::class,
        ];

        foreach ($criticalTypes as $type) {
            if ($exception instanceof $type) {
                return 'critical';
            }
        }

        // High priority errors
        $highTypes = [
            \RuntimeException::class,
            \Symfony\Component\HttpKernel\Exception\HttpException::class,
            \Illuminate\Auth\AuthenticationException::class,
        ];

        foreach ($highTypes as $type) {
            if ($exception instanceof $type) {
                return 'high';
            }
        }

        // Check message content for severity indicators
        $message = strtolower($exception->getMessage());
        
        if (str_contains($message, 'fatal') || 
            str_contains($message, 'critical') || 
            str_contains($message, 'security')) {
            return 'critical';
        }

        if (str_contains($message, 'warning') || 
            str_contains($message, 'deprecated')) {
            return 'low';
        }

        return 'medium';
    }

    /**
     * Generate unique error ID
     */
    private function generateErrorId(): string
    {
        return 'err_' . date('Ymd_His') . '_' . uniqid();
    }

    /**
     * Limit context size to prevent database issues
     */
    private function limitContextSize(array $context): array
    {
        $json = json_encode($context);
        
        if (strlen($json) <= self::MAX_CONTEXT_SIZE) {
            return $context;
        }

        // Progressively remove less important context data
        unset($context['trace']);
        $json = json_encode($context);
        
        if (strlen($json) <= self::MAX_CONTEXT_SIZE) {
            return $context;
        }

        unset($context['environment']);
        $json = json_encode($context);
        
        if (strlen($json) <= self::MAX_CONTEXT_SIZE) {
            return $context;
        }

        // Last resort: keep only essential context
        return [
            'system' => $context['system'] ?? [],
            'request' => array_slice($context['request'] ?? [], 0, 5, true),
            'user' => $context['user'] ?? [],
        ];
    }

    /**
     * Track error metrics and patterns
     */
    private function trackErrorMetrics(\Throwable $exception, array $errorData): void
    {
        try {
            $errorType = get_class($exception);
            $hourKey = 'error_rate_' . date('Y-m-d-H');
            $typeKey = 'error_type_' . md5($errorType) . '_' . date('Y-m-d-H');

            // Increment hourly error count with expiration
            $currentCount = Cache::get($hourKey, 0) + 1;
            Cache::put($hourKey, $currentCount, self::ERROR_RATE_WINDOW);

            // Increment error type count with expiration
            $currentTypeCount = Cache::get($typeKey, 0) + 1;
            Cache::put($typeKey, $currentTypeCount, self::ERROR_RATE_WINDOW);

            // Check for error rate spikes
            $currentRate = Cache::get($hourKey, 0);
            if ($currentRate > self::CRITICAL_ERRORS_THRESHOLD) {
                $this->handleErrorRateSpike($currentRate, $hourKey);
            }

        } catch (\Exception $e) {
            Log::warning('Failed to track error metrics', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Handle error rate spikes
     */
    private function handleErrorRateSpike(int $currentRate, string $timeKey): void
    {
        $spikeKey = "error_spike_notified_{$timeKey}";
        
        // Only notify once per hour for spikes
        if (!Cache::has($spikeKey)) {
            Cache::put($spikeKey, true, self::ERROR_RATE_WINDOW);
            
            Log::alert('Error rate spike detected', [
                'error_count' => $currentRate,
                'threshold' => self::CRITICAL_ERRORS_THRESHOLD,
                'time_window' => $timeKey,
            ]);

            // Could send additional notifications here
        }
    }

    /**
     * Get error monitoring dashboard data
     */
    public function getDashboardData(): array
    {
        $now = now();
        $today = $now->startOfDay();
        $yesterday = $now->copy()->subDay()->startOfDay();
        $weekAgo = $now->copy()->subWeek();

        // Basic statistics
        $todayErrors = ErrorLog::where('created_at', '>=', $today)->get();
        $yesterdayErrors = ErrorLog::whereBetween('created_at', [$yesterday, $today])->count();
        $weekErrors = ErrorLog::where('created_at', '>=', $weekAgo)->get();

        // System health calculation
        $criticalErrors24h = ErrorLog::where('created_at', '>=', $now->copy()->subDay())
            ->where('severity', 'critical')->count();
        $totalErrors24h = ErrorLog::where('created_at', '>=', $now->copy()->subDay())->count();
        $resolvedCount = ErrorLog::where('created_at', '>=', $now->copy()->subDay())
            ->where('resolved', true)->count();

        $resolutionRate = $totalErrors24h > 0 ? ($resolvedCount / $totalErrors24h * 100) : 100;

        // Determine health status
        $healthStatus = $this->calculateHealthStatus($criticalErrors24h, $totalErrors24h, $resolutionRate);

        return [
            'overview' => [
                'total_today' => $todayErrors->count(),
                'total_yesterday' => $yesterdayErrors,
                'by_severity' => $todayErrors->countBy('severity'),
                'by_type' => $todayErrors->countBy(fn($error) => class_basename($error->type)),
                'recent_errors' => ErrorLog::latest()->limit(5)->get(),
            ],
            'trends' => $this->getErrorTrends(7),
            'top_errors' => $this->getTopErrors(10),
            'recent_activity' => ErrorLog::latest()->limit(20)->get(),
            'system_health' => [
                'total_errors_24h' => $totalErrors24h,
                'critical_errors_24h' => $criticalErrors24h,
                'resolved_percentage' => round($resolutionRate, 1),
                'health_status' => $healthStatus,
                'error_rate_trend' => $this->getErrorRateTrend(),
            ],
        ];
    }

    /**
     * Calculate system health status
     */
    private function calculateHealthStatus(int $criticalErrors, int $totalErrors, float $resolutionRate): string
    {
        if ($criticalErrors > 10) {
            return 'critical';
        }

        if ($criticalErrors > 5 || $totalErrors > 100) {
            return 'warning';
        }

        if ($totalErrors > 50 || $resolutionRate < 80) {
            return 'attention';
        }

        return 'healthy';
    }

    /**
     * Get error trends over time
     */
    private function getErrorTrends(int $days): array
    {
        $trends = [];
        $startDate = now()->subDays($days);

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $count = ErrorLog::whereDate('created_at', $date)->count();
            
            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count,
            ];
        }

        return $trends;
    }

    /**
     * Get top error types
     */
    private function getTopErrors(int $limit): array
    {
        return ErrorLog::select('type')
            ->selectRaw('COUNT(*) as count')
            ->where('created_at', '>=', now()->subWeek())
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'type' => class_basename($item->type),
                    'full_type' => $item->type,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get error rate trend (hourly for last 24 hours)
     */
    private function getErrorRateTrend(): array
    {
        $trend = [];
        $now = now();

        for ($i = 23; $i >= 0; $i--) {
            $hour = $now->copy()->subHours($i);
            $hourKey = 'error_rate_' . $hour->format('Y-m-d-H');
            $count = Cache::get($hourKey, 0);
            
            $trend[] = [
                'hour' => $hour->format('H:00'),
                'count' => $count,
            ];
        }

        return $trend;
    }

    /**
     * Get detailed error statistics
     */
    public function getErrorStatistics(array $filters = []): array
    {
        $query = ErrorLog::query();

        // Apply filters
        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (isset($filters['type'])) {
            $query->where('type', 'like', '%' . $filters['type'] . '%');
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['resolved'])) {
            $query->where('resolved', filter_var($filters['resolved'], FILTER_VALIDATE_BOOLEAN));
        }

        $errors = $query->get();

        return [
            'total' => $errors->count(),
            'by_severity' => $errors->countBy('severity'),
            'by_type' => $errors->countBy(fn($error) => class_basename($error->type)),
            'by_status' => [
                'resolved' => $errors->where('resolved', true)->count(),
                'unresolved' => $errors->where('resolved', false)->count(),
            ],
            'recent_errors' => $errors->sortByDesc('created_at')->take(20)->values(),
        ];
    }

    /**
     * Clean up old error logs
     */
    public function cleanupOldLogs(int $daysToKeep = 30): int
    {
        $cutoffDate = now()->subDays($daysToKeep);
        
        return ErrorLog::where('resolved', true)
            ->where('created_at', '<', $cutoffDate)
            ->delete();
    }
}