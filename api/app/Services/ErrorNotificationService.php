<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use App\Mail\CriticalErrorNotification;
use App\Mail\ErrorDigestNotification;

class ErrorNotificationService
{
    private const CRITICAL_ERRORS_CACHE_KEY = 'critical_errors_count';
    private const NOTIFICATION_COOLDOWN = 300; // 5 minutes
    private const MAX_NOTIFICATIONS_PER_HOUR = 10;

    /**
     * Send notification for critical errors
     */
    public function notifyCriticalError(\Throwable $exception, array $context = []): void
    {
        try {
            // Check if we should send notification
            if (!$this->shouldSendNotification($exception)) {
                return;
            }

            // Get notification recipients
            $recipients = $this->getNotificationRecipients();
            if (empty($recipients)) {
                return;
            }

            // Prepare error data
            $errorData = $this->prepareErrorData($exception, $context);

            // Send email notifications
            foreach ($recipients as $recipient) {
                Mail::to($recipient['email'])
                    ->send(new CriticalErrorNotification($errorData, $recipient));
            }

            // Update notification tracking
            $this->updateNotificationTracking($exception);

            Log::info('Critical error notification sent', [
                'error_type' => get_class($exception),
                'recipients_count' => count($recipients),
            ]);

        } catch (\Exception $e) {
            // Avoid infinite loops by logging notification errors separately
            Log::error('Failed to send error notification', [
                'notification_error' => $e->getMessage(),
                'original_error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send daily error digest
     */
    public function sendDailyDigest(): void
    {
        try {
            $digestData = $this->prepareDailyDigest();
            
            if (empty($digestData['errors'])) {
                return; // No errors to report
            }

            $recipients = $this->getDigestRecipients();
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient['email'])
                    ->send(new ErrorDigestNotification($digestData, $recipient));
            }

            Log::info('Daily error digest sent', [
                'total_errors' => count($digestData['errors']),
                'recipients_count' => count($recipients),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send daily digest', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check if notification should be sent
     */
    private function shouldSendNotification(\Throwable $exception): bool
    {
        // Only send for critical errors
        if (!$this->isCriticalError($exception)) {
            return false;
        }

        // Check notification rate limiting
        if (!$this->checkRateLimit()) {
            return false;
        }

        // Check if same error was recently reported
        if ($this->isDuplicateError($exception)) {
            return false;
        }

        // Check if notifications are enabled
        return config('error-monitoring.notifications.email.enabled', true);
    }

    /**
     * Determine if error is critical
     */
    private function isCriticalError(\Throwable $exception): bool
    {
        $criticalTypes = [
            \Error::class,
            \ParseError::class,
            \TypeError::class,
            \RuntimeException::class,
            \PDOException::class,
            \Illuminate\Database\QueryException::class,
        ];

        foreach ($criticalTypes as $type) {
            if ($exception instanceof $type) {
                return true;
            }
        }

        // Check for critical keywords in message
        $criticalKeywords = [
            'fatal',
            'segmentation fault',
            'out of memory',
            'database connection failed',
            'payment failed',
            'security',
            'unauthorized access',
        ];

        $message = strtolower($exception->getMessage());
        foreach ($criticalKeywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check notification rate limiting
     */
    private function checkRateLimit(): bool
    {
        $hourlyKey = 'error_notifications_hour_' . date('Y-m-d-H');
        $currentCount = Cache::get($hourlyKey, 0);

        if ($currentCount >= self::MAX_NOTIFICATIONS_PER_HOUR) {
            return false;
        }

        Cache::put($hourlyKey, $currentCount + 1, 3600); // 1 hour
        return true;
    }

    /**
     * Check if this is a duplicate error
     */
    private function isDuplicateError(\Throwable $exception): bool
    {
        $errorSignature = $this->getErrorSignature($exception);
        $cacheKey = 'error_cooldown_' . md5($errorSignature);

        if (Cache::has($cacheKey)) {
            return true;
        }

        Cache::put($cacheKey, true, self::NOTIFICATION_COOLDOWN);
        return false;
    }

    /**
     * Get unique signature for error
     */
    private function getErrorSignature(\Throwable $exception): string
    {
        return get_class($exception) . '|' . $exception->getFile() . '|' . $exception->getLine();
    }

    /**
     * Get notification recipients
     */
    private function getNotificationRecipients(): array
    {
        $recipients = config('error-monitoring.notifications.recipients', []);
        
        // Add default admin emails if none configured
        if (empty($recipients)) {
            $recipients = [
                [
                    'email' => 'admin@workshop.local',
                    'name' => 'System Administrator',
                    'role' => 'admin',
                    'severity_threshold' => 'critical',
                ],
            ];
        }

        return $recipients;
    }

    /**
     * Get digest recipients
     */
    private function getDigestRecipients(): array
    {
        return array_filter($this->getNotificationRecipients(), function ($recipient) {
            return ($recipient['digest'] ?? true);
        });
    }

    /**
     * Prepare error data for notification
     */
    private function prepareErrorData(\Throwable $exception, array $context = []): array
    {
        return [
            'type' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'url' => request()->fullUrl() ?? 'N/A',
            'method' => request()->method() ?? 'N/A',
            'user_agent' => request()->userAgent() ?? 'N/A',
            'ip' => request()->ip() ?? 'N/A',
            'timestamp' => now()->toISOString(),
            'environment' => config('app.env'),
            'server_name' => gethostname(),
            'context' => $context,
            'system_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'memory_usage' => memory_get_usage(true),
                'memory_limit' => ini_get('memory_limit'),
            ],
        ];
    }

    /**
     * Prepare daily digest data
     */
    private function prepareDailyDigest(): array
    {
        $startDate = now()->startOfDay();
        $endDate = now()->endOfDay();

        // Get error logs from database
        $errors = \App\Models\ErrorLog::whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $summary = [
            'total_errors' => $errors->count(),
            'by_severity' => $errors->countBy('severity'),
            'by_type' => $errors->countBy('type'),
            'critical_errors' => $errors->where('severity', 'critical')->count(),
            'unresolved_errors' => $errors->where('resolved', false)->count(),
        ];

        $topErrors = $errors->groupBy('type')
            ->map(function ($group) {
                return [
                    'type' => $group->first()->type,
                    'count' => $group->count(),
                    'latest' => $group->first()->created_at,
                    'message' => $group->first()->message,
                ];
            })
            ->sortByDesc('count')
            ->take(10)
            ->values();

        return [
            'date' => $startDate->format('Y-m-d'),
            'summary' => $summary,
            'top_errors' => $topErrors,
            'errors' => $errors->take(20)->toArray(),
            'system_health' => $this->getSystemHealth(),
        ];
    }

    /**
     * Get system health overview
     */
    private function getSystemHealth(): array
    {
        $last24h = now()->subDay();
        
        $totalErrors = \App\Models\ErrorLog::where('created_at', '>=', $last24h)->count();
        $criticalErrors = \App\Models\ErrorLog::where('created_at', '>=', $last24h)
            ->where('severity', 'critical')->count();
        
        $resolvedCount = \App\Models\ErrorLog::where('created_at', '>=', $last24h)
            ->where('resolved', true)->count();
        
        $resolutionRate = $totalErrors > 0 ? ($resolvedCount / $totalErrors * 100) : 100;
        
        // Determine health status
        $healthStatus = 'healthy';
        if ($criticalErrors > 10) {
            $healthStatus = 'critical';
        } elseif ($criticalErrors > 5 || $totalErrors > 50) {
            $healthStatus = 'warning';
        } elseif ($totalErrors > 20) {
            $healthStatus = 'attention';
        }

        return [
            'status' => $healthStatus,
            'total_errors_24h' => $totalErrors,
            'critical_errors_24h' => $criticalErrors,
            'resolution_rate' => round($resolutionRate, 1),
            'last_critical_error' => \App\Models\ErrorLog::where('severity', 'critical')
                ->latest()
                ->first()?->created_at,
        ];
    }

    /**
     * Update notification tracking
     */
    private function updateNotificationTracking(\Throwable $exception): void
    {
        $key = self::CRITICAL_ERRORS_CACHE_KEY . '_' . date('Y-m-d');
        $count = Cache::get($key, 0);
        Cache::put($key, $count + 1, 86400); // 24 hours
    }

    /**
     * Get notification statistics
     */
    public function getNotificationStats(): array
    {
        $today = date('Y-m-d');
        $hourlyKey = 'error_notifications_hour_' . date('Y-m-d-H');
        
        return [
            'notifications_sent_today' => Cache::get(self::CRITICAL_ERRORS_CACHE_KEY . '_' . $today, 0),
            'notifications_sent_this_hour' => Cache::get($hourlyKey, 0),
            'rate_limit_remaining' => max(0, self::MAX_NOTIFICATIONS_PER_HOUR - Cache::get($hourlyKey, 0)),
            'cooldown_active_errors' => $this->getActiveCooldowns(),
        ];
    }

    /**
     * Get active error cooldowns
     */
    private function getActiveCooldowns(): int
    {
        // This would require storing cooldown keys in a way we can count them
        // For now, return 0 as this is primarily for monitoring
        return 0;
    }
}