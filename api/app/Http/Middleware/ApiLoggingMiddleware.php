<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class ApiLoggingMiddleware
{
    /**
     * Handle an incoming request.
     * تسجيل جميع طلبات API لمراقبة الأداء وتتبع الأخطاء
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        $response = $next($request);

        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2); // Convert to milliseconds

        // Log API requests
        $this->logRequest($request, $response, $duration);

        return $response;
    }

    /**
     * Log the API request
     */
    private function logRequest(Request $request, Response $response, float $duration): void
    {
        $user = auth()->user();
        $statusCode = $response->getStatusCode();

        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'status_code' => $statusCode,
            'duration_ms' => $duration,
            'memory_usage' => memory_get_peak_usage(true),
            'timestamp' => now()->toDateTimeString(),
        ];

        // Add query parameters (but not for sensitive routes)
        if (!$this->isSensitiveRoute($request)) {
            $logData['query_params'] = $request->query();
        }

        // Determine log level based on status code
        if ($statusCode >= 500) {
            Log::error('API Error', $logData);
        } elseif ($statusCode >= 400) {
            Log::warning('API Client Error', $logData);
        } elseif ($duration > 1000) { // Slow requests (> 1 second)
            Log::warning('Slow API Request', $logData);
        } else {
            Log::info('API Request', $logData);
        }

        // Log performance metrics for monitoring
        if ($duration > 500) {
            Log::channel('performance')->warning('Slow Request', [
                'route' => $request->path(),
                'duration' => $duration,
                'memory' => $logData['memory_usage']
            ]);
        }
    }

    /**
     * Check if route contains sensitive information
     */
    private function isSensitiveRoute(Request $request): bool
    {
        $sensitiveRoutes = ['auth', 'password', 'biometric', 'token'];
        $path = $request->path();

        foreach ($sensitiveRoutes as $route) {
            if (str_contains($path, $route)) {
                return true;
            }
        }

        return false;
    }
}