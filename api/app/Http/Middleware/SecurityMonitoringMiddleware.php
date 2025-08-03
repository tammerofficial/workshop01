<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SecurityEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SecurityMonitoringMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        
        // فحص الأنشطة المشبوهة قبل معالجة الطلب
        $this->checkSuspiciousActivity($request);
        
        // فحص محاولات Brute Force
        $this->checkBruteForceAttempts($request);
        
        // فحص معدل الطلبات
        $this->checkRateLimit($request);

        $response = $next($request);
        
        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000; // بالميللي ثانية

        // تسجيل معلومات الطلب
        $this->logRequestMetrics($request, $response, $responseTime);
        
        // فحص الاستجابات المشبوهة
        $this->checkSuspiciousResponse($request, $response);

        return $response;
    }

    /**
     * فحص الأنشطة المشبوهة
     */
    protected function checkSuspiciousActivity(Request $request): void
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        
        // فحص User Agent مشبوه
        if ($this->isSuspiciousUserAgent($userAgent)) {
            SecurityEvent::logSuspiciousActivity(
                'suspicious_user_agent',
                [
                    'user_agent' => $userAgent,
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                ]
            );
        }

        // فحص المعاملات المشبوهة في الطلب
        if ($this->hasSuspiciousParameters($request)) {
            SecurityEvent::logSuspiciousActivity(
                'suspicious_parameters',
                [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'parameters' => $this->getSanitizedParameters($request),
                ]
            );
        }

        // فحص محاولات SQL Injection
        if ($this->detectSQLInjection($request)) {
            SecurityEvent::logEvent(
                'data_breach_attempt',
                'critical',
                [
                    'type' => 'sql_injection_attempt',
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'parameters' => $this->getSanitizedParameters($request),
                ],
                auth()->user(),
                'blocked'
            );
        }
    }

    /**
     * فحص محاولات Brute Force
     */
    protected function checkBruteForceAttempts(Request $request): void
    {
        $ip = $request->ip();
        $route = $request->route()?->getName();
        
        // فحص محاولات تسجيل الدخول
        if ($route === 'login' || str_contains($request->path(), 'login')) {
            $key = "login_attempts:{$ip}";
            $attempts = Cache::get($key, 0);
            
            if ($attempts > 5) {
                SecurityEvent::logEvent(
                    'brute_force',
                    'high',
                    [
                        'type' => 'login_brute_force',
                        'attempts' => $attempts,
                        'blocked' => true,
                    ]
                );
                
                abort(429, 'Too many login attempts. Please try again later.');
            }
        }

        // فحص محاولات الوصول للـ API
        if (str_starts_with($request->path(), 'api/')) {
            $key = "api_requests:{$ip}";
            $requests = Cache::get($key, 0);
            
            if ($requests > 100) { // 100 طلب في الدقيقة
                SecurityEvent::logEvent(
                    'brute_force',
                    'medium',
                    [
                        'type' => 'api_abuse',
                        'requests_count' => $requests,
                        'endpoint' => $request->path(),
                    ]
                );
            }
        }
    }

    /**
     * فحص معدل الطلبات
     */
    protected function checkRateLimit(Request $request): void
    {
        $ip = $request->ip();
        $key = "rate_limit:{$ip}";
        
        $requests = Cache::get($key, 0);
        Cache::put($key, $requests + 1, Carbon::now()->addMinute());
        
        if ($requests > 200) { // 200 طلب في الدقيقة
            SecurityEvent::logSuspiciousActivity(
                'rate_limit_exceeded',
                [
                    'requests_count' => $requests,
                    'endpoint' => $request->path(),
                    'method' => $request->method(),
                ]
            );
        }
    }

    /**
     * تسجيل معايير الطلب
     */
    protected function logRequestMetrics(Request $request, Response $response, float $responseTime): void
    {
        $user = auth()->user();
        
        // تسجيل الطلبات البطيئة
        if ($responseTime > 2000) { // أكثر من 2 ثانية
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_id' => $user?->id,
                'response_time' => $responseTime,
                'memory_usage' => memory_get_peak_usage(true),
            ]);
        }

        // تسجيل الأخطاء
        if ($response->getStatusCode() >= 500) {
            SecurityEvent::logEvent(
                'suspicious_activity',
                'medium',
                [
                    'type' => 'server_error',
                    'status_code' => $response->getStatusCode(),
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'response_time' => $responseTime,
                ],
                $user
            );
        }
    }

    /**
     * فحص الاستجابات المشبوهة
     */
    protected function checkSuspiciousResponse(Request $request, Response $response): void
    {
        $statusCode = $response->getStatusCode();
        
        // تسجيل محاولات الوصول غير المصرح بها
        if ($statusCode === 401 || $statusCode === 403) {
            $user = auth()->user();
            
            SecurityEvent::logEvent(
                'unauthorized_access',
                $statusCode === 403 ? 'high' : 'medium',
                [
                    'status_code' => $statusCode,
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_id' => $user?->id,
                ],
                $user
            );
        }
    }

    /**
     * فحص User Agent مشبوه
     */
    protected function isSuspiciousUserAgent(?string $userAgent): bool
    {
        if (!$userAgent) return true;
        
        $suspiciousPatterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'curl', 'wget', 'python', 'perl',
            'postman', 'insomnia'
        ];
        
        $userAgentLower = strtolower($userAgent);
        
        foreach ($suspiciousPatterns as $pattern) {
            if (str_contains($userAgentLower, $pattern)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * فحص المعاملات المشبوهة
     */
    protected function hasSuspiciousParameters(Request $request): bool
    {
        $allParams = array_merge(
            $request->query(),
            $request->post(),
            $request->json() ? $request->json()->all() : []
        );
        
        $suspiciousPatterns = [
            'script', 'javascript:', 'vbscript:',
            'onload', 'onerror', 'onclick',
            '../', '..\\', '/etc/passwd',
            'union select', 'drop table', 'delete from'
        ];
        
        foreach ($allParams as $value) {
            if (is_string($value)) {
                $valueLower = strtolower($value);
                foreach ($suspiciousPatterns as $pattern) {
                    if (str_contains($valueLower, $pattern)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * اكتشاف محاولات SQL Injection
     */
    protected function detectSQLInjection(Request $request): bool
    {
        $allParams = array_merge(
            $request->query(),
            $request->post(),
            $request->json() ? $request->json()->all() : []
        );
        
        $sqlPatterns = [
            '/(\bselect\b|\bunion\b|\binsert\b|\bupdate\b|\bdelete\b)/i',
            '/(\bdrop\b|\balter\b|\bcreate\b|\btruncate\b)/i',
            '/(\'|\")(\s)*(or|and)(\s)*(\d|\w)/i',
            '/\b(exec|execute|sp_|xp_)\b/i'
        ];
        
        foreach ($allParams as $value) {
            if (is_string($value)) {
                foreach ($sqlPatterns as $pattern) {
                    if (preg_match($pattern, $value)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * الحصول على معاملات آمنة للتسجيل
     */
    protected function getSanitizedParameters(Request $request): array
    {
        $params = array_merge(
            $request->query(),
            $request->post(),
            $request->json() ? $request->json()->all() : []
        );
        
        // إخفاء المعلومات الحساسة
        $sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
        
        foreach ($params as $key => $value) {
            foreach ($sensitiveKeys as $sensitiveKey) {
                if (str_contains(strtolower($key), $sensitiveKey)) {
                    $params[$key] = '[REDACTED]';
                }
            }
        }
        
        return $params;
    }
}