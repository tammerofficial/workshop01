<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\ErrorLog;

class UserErrorReportingService
{
    private const MAX_REPORT_LENGTH = 2000;
    private const MAX_REPORTS_PER_USER_PER_HOUR = 10;
    private const ATTACHMENT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Submit user error report
     */
    public function submitErrorReport(array $reportData, Request $request): array
    {
        try {
            // Validate report data
            $validation = $this->validateReportData($reportData);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'errors' => $validation['errors'],
                ];
            }

            // Check rate limiting
            if (!$this->checkRateLimit($request)) {
                return [
                    'success' => false,
                    'error' => 'Too many reports submitted. Please wait before submitting another report.',
                ];
            }

            // Process and store the report
            $processedReport = $this->processUserReport($reportData, $request);
            
            // Store in error logs with special marking
            $errorLog = ErrorLog::create([
                'error_id' => 'user_report_' . uniqid(),
                'type' => 'UserReport',
                'message' => $processedReport['title'],
                'file' => 'user_report',
                'line' => 0,
                'url' => $processedReport['url'],
                'method' => 'USER_REPORT',
                'ip' => $request->ip(),
                'user_id' => Auth::id(),
                'severity' => $this->mapSeverity($reportData['severity'] ?? 'medium'),
                'context' => $processedReport,
                'stack_trace' => 'User-submitted error report',
            ]);

            // Send notification if high priority
            if ($processedReport['priority'] === 'high') {
                $this->notifyHighPriorityReport($processedReport, $errorLog);
            }

            // Log the submission
            Log::info('User error report submitted', [
                'report_id' => $errorLog->error_id,
                'user_id' => Auth::id(),
                'severity' => $processedReport['severity'],
                'category' => $processedReport['category'],
            ]);

            return [
                'success' => true,
                'report_id' => $errorLog->error_id,
                'message' => 'Thank you for your report. We will investigate this issue.',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to process user error report', [
                'error' => $e->getMessage(),
                'report_data' => $reportData,
            ]);

            return [
                'success' => false,
                'error' => 'Failed to submit report. Please try again later.',
            ];
        }
    }

    /**
     * Validate user report data
     */
    private function validateReportData(array $data): array
    {
        $validator = Validator::make($data, [
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:' . self::MAX_REPORT_LENGTH,
            'category' => 'required|in:bug,feature_request,performance,ui_issue,data_issue,security,other',
            'severity' => 'in:low,medium,high,critical',
            'steps_to_reproduce' => 'nullable|string|max:1000',
            'expected_behavior' => 'nullable|string|max:500',
            'actual_behavior' => 'nullable|string|max:500',
            'browser_info' => 'nullable|array',
            'screenshot' => 'nullable|string|max:' . (self::ATTACHMENT_MAX_SIZE * 1.5), // Base64 can be ~1.5x larger
            'additional_info' => 'nullable|string|max:1000',
        ]);

        return [
            'valid' => !$validator->fails(),
            'errors' => $validator->errors()->toArray(),
        ];
    }

    /**
     * Check rate limiting for user reports
     */
    private function checkRateLimit(Request $request): bool
    {
        if (!Auth::check()) {
            return false; // Anonymous users cannot submit reports
        }

        $userId = Auth::id();
        $hourKey = 'user_reports_' . $userId . '_' . date('Y-m-d-H');
        
        $currentCount = \Cache::get($hourKey, 0);
        
        if ($currentCount >= self::MAX_REPORTS_PER_USER_PER_HOUR) {
            return false;
        }

        \Cache::put($hourKey, $currentCount + 1, 3600);
        return true;
    }

    /**
     * Process and enrich user report
     */
    private function processUserReport(array $reportData, Request $request): array
    {
        $user = Auth::user();
        
        $processed = [
            'title' => $reportData['title'],
            'description' => $reportData['description'],
            'category' => $reportData['category'],
            'severity' => $reportData['severity'] ?? 'medium',
            'priority' => $this->calculatePriority($reportData),
            'steps_to_reproduce' => $reportData['steps_to_reproduce'] ?? null,
            'expected_behavior' => $reportData['expected_behavior'] ?? null,
            'actual_behavior' => $reportData['actual_behavior'] ?? null,
            'additional_info' => $reportData['additional_info'] ?? null,
            
            // User context
            'user_info' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name ?? 'Unknown',
                'roles' => $user->roles->pluck('name')->toArray(),
                'created_at' => $user->created_at,
                'last_login' => $user->last_login_at ?? null,
            ],
            
            // Technical context
            'technical_context' => [
                'url' => $request->fullUrl(),
                'referer' => $request->header('referer'),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'session_id' => session()->getId(),
                'timestamp' => now()->toISOString(),
            ],
            
            // Browser/device info if provided
            'browser_info' => $reportData['browser_info'] ?? $this->extractBrowserInfo($request),
            
            // Screenshot handling
            'has_screenshot' => !empty($reportData['screenshot']),
            'screenshot_info' => $this->processScreenshot($reportData['screenshot'] ?? null),
            
            // Automatic categorization
            'auto_tags' => $this->generateAutoTags($reportData),
            'estimated_impact' => $this->estimateImpact($reportData),
        ];

        return $processed;
    }

    /**
     * Calculate priority based on various factors
     */
    private function calculatePriority(array $reportData): string
    {
        $severity = $reportData['severity'] ?? 'medium';
        $category = $reportData['category'];
        
        // Security issues are always high priority
        if ($category === 'security' || $severity === 'critical') {
            return 'high';
        }
        
        // Data issues and performance problems are medium-high priority
        if (in_array($category, ['data_issue', 'performance']) || $severity === 'high') {
            return 'medium-high';
        }
        
        // Bugs are medium priority
        if ($category === 'bug' || $severity === 'medium') {
            return 'medium';
        }
        
        // UI issues and feature requests are lower priority
        return 'low';
    }

    /**
     * Map user severity to system severity
     */
    private function mapSeverity(string $userSeverity): string
    {
        return match($userSeverity) {
            'critical' => 'critical',
            'high' => 'high',
            'medium' => 'medium',
            'low' => 'low',
            default => 'medium',
        };
    }

    /**
     * Extract browser information from request
     */
    private function extractBrowserInfo(Request $request): array
    {
        $userAgent = $request->userAgent();
        
        return [
            'user_agent' => $userAgent,
            'accept_language' => $request->header('accept-language'),
            'screen_resolution' => null, // Would be filled by frontend
            'viewport_size' => null, // Would be filled by frontend
            'timezone' => null, // Would be filled by frontend
            'platform' => $this->detectPlatform($userAgent),
            'browser' => $this->detectBrowser($userAgent),
        ];
    }

    /**
     * Detect platform from user agent
     */
    private function detectPlatform(string $userAgent): string
    {
        if (str_contains($userAgent, 'Windows')) return 'Windows';
        if (str_contains($userAgent, 'Macintosh')) return 'macOS';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        if (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) return 'iOS';
        if (str_contains($userAgent, 'Android')) return 'Android';
        
        return 'Unknown';
    }

    /**
     * Detect browser from user agent
     */
    private function detectBrowser(string $userAgent): string
    {
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        if (str_contains($userAgent, 'Opera')) return 'Opera';
        
        return 'Unknown';
    }

    /**
     * Process screenshot data
     */
    private function processScreenshot(?string $screenshot): ?array
    {
        if (!$screenshot) {
            return null;
        }

        try {
            // Basic validation of base64 image
            if (!str_starts_with($screenshot, 'data:image/')) {
                return ['error' => 'Invalid image format'];
            }

            $imageData = explode(',', $screenshot);
            if (count($imageData) !== 2) {
                return ['error' => 'Invalid base64 format'];
            }

            $decodedSize = strlen(base64_decode($imageData[1]));
            if ($decodedSize > self::ATTACHMENT_MAX_SIZE) {
                return ['error' => 'Image too large'];
            }

            // In a real implementation, you'd save this to storage
            // For now, just return metadata
            return [
                'size_bytes' => $decodedSize,
                'mime_type' => $this->extractMimeType($imageData[0]),
                'saved' => false, // Would be true after saving to storage
                'storage_path' => null, // Would contain path after saving
            ];

        } catch (\Exception $e) {
            return ['error' => 'Failed to process screenshot: ' . $e->getMessage()];
        }
    }

    /**
     * Extract MIME type from data URL
     */
    private function extractMimeType(string $dataHeader): string
    {
        if (preg_match('/data:([^;]+)/', $dataHeader, $matches)) {
            return $matches[1];
        }
        
        return 'unknown';
    }

    /**
     * Generate automatic tags based on report content
     */
    private function generateAutoTags(array $reportData): array
    {
        $tags = [];
        $text = strtolower($reportData['title'] . ' ' . $reportData['description']);
        
        // Technical keywords
        $keywords = [
            'database' => ['database', 'sql', 'query', 'table', 'connection'],
            'frontend' => ['ui', 'interface', 'button', 'form', 'display', 'layout'],
            'backend' => ['api', 'server', 'endpoint', 'response', 'request'],
            'performance' => ['slow', 'timeout', 'loading', 'delay', 'performance'],
            'authentication' => ['login', 'password', 'auth', 'permission', 'access'],
            'mobile' => ['mobile', 'phone', 'tablet', 'responsive', 'touch'],
        ];

        foreach ($keywords as $tag => $words) {
            foreach ($words as $word) {
                if (str_contains($text, $word)) {
                    $tags[] = $tag;
                    break;
                }
            }
        }

        return array_unique($tags);
    }

    /**
     * Estimate impact based on report details
     */
    private function estimateImpact(array $reportData): string
    {
        $category = $reportData['category'];
        $severity = $reportData['severity'] ?? 'medium';
        
        if ($category === 'security' || $severity === 'critical') {
            return 'high';
        }
        
        if (in_array($category, ['data_issue', 'performance']) || $severity === 'high') {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Notify about high priority reports
     */
    private function notifyHighPriorityReport(array $report, ErrorLog $errorLog): void
    {
        try {
            // Send immediate notification for high priority reports
            Log::alert('High Priority User Report', [
                'report_id' => $errorLog->error_id,
                'title' => $report['title'],
                'category' => $report['category'],
                'user' => $report['user_info']['email'],
                'priority' => $report['priority'],
            ]);

            // Could send email notifications here
            // $this->sendHighPriorityNotification($report, $errorLog);

        } catch (\Exception $e) {
            Log::error('Failed to send high priority report notification', [
                'error' => $e->getMessage(),
                'report_id' => $errorLog->error_id,
            ]);
        }
    }

    /**
     * Get user reports dashboard data
     */
    public function getDashboardData(): array
    {
        $reports = ErrorLog::where('type', 'UserReport')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $stats = [
            'total_reports' => $reports->count(),
            'by_category' => [],
            'by_severity' => $reports->countBy('severity'),
            'by_status' => [
                'open' => $reports->where('resolved', false)->count(),
                'resolved' => $reports->where('resolved', true)->count(),
            ],
            'recent_reports' => $reports->take(10),
        ];

        // Extract categories from context
        foreach ($reports as $report) {
            $context = $report->context;
            if (isset($context['category'])) {
                $category = $context['category'];
                $stats['by_category'][$category] = ($stats['by_category'][$category] ?? 0) + 1;
            }
        }

        return [
            'statistics' => $stats,
            'trends' => $this->getReportTrends(),
            'top_issues' => $this->getTopReportedIssues(),
            'user_feedback' => $this->getUserFeedbackMetrics(),
        ];
    }

    /**
     * Get report trends over time
     */
    private function getReportTrends(): array
    {
        $trends = [];
        $startDate = now()->subDays(30);

        for ($i = 0; $i < 30; $i++) {
            $date = $startDate->copy()->addDays($i);
            $count = ErrorLog::where('type', 'UserReport')
                ->whereDate('created_at', $date)
                ->count();
            
            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count,
            ];
        }

        return $trends;
    }

    /**
     * Get top reported issues
     */
    private function getTopReportedIssues(): array
    {
        $reports = ErrorLog::where('type', 'UserReport')
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        $issues = [];
        
        foreach ($reports as $report) {
            $context = $report->context;
            $category = $context['category'] ?? 'unknown';
            $title = $report->message;
            
            $key = $category . '|' . substr($title, 0, 50);
            
            if (!isset($issues[$key])) {
                $issues[$key] = [
                    'category' => $category,
                    'title' => $title,
                    'count' => 0,
                    'latest' => $report->created_at,
                ];
            }
            
            $issues[$key]['count']++;
            if ($report->created_at > $issues[$key]['latest']) {
                $issues[$key]['latest'] = $report->created_at;
            }
        }

        // Sort by count and return top 10
        uasort($issues, fn($a, $b) => $b['count'] <=> $a['count']);
        
        return array_slice(array_values($issues), 0, 10);
    }

    /**
     * Get user feedback metrics
     */
    private function getUserFeedbackMetrics(): array
    {
        $reports = ErrorLog::where('type', 'UserReport')
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        $metrics = [
            'response_time' => 0, // Average time to respond/resolve
            'user_satisfaction' => 'N/A', // Would require follow-up surveys
            'repeat_reporters' => 0,
            'most_active_users' => [],
        ];

        // Calculate repeat reporters
        $userCounts = $reports->countBy('user_id');
        $metrics['repeat_reporters'] = $userCounts->filter(fn($count) => $count > 1)->count();

        // Get most active reporters
        $activeUsers = $userCounts->sortDesc()->take(5);
        foreach ($activeUsers as $userId => $count) {
            $user = \App\Models\User::find($userId);
            if ($user) {
                $metrics['most_active_users'][] = [
                    'name' => $user->name ?? 'Unknown',
                    'email' => $user->email,
                    'report_count' => $count,
                ];
            }
        }

        return $metrics;
    }
}