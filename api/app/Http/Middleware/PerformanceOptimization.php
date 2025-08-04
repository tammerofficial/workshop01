<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerformanceOptimization
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        $startQueries = DB::getQueryLog();
        
        // Enable query logging for performance monitoring
        if (config('app.debug')) {
            DB::enableQueryLog();
        }
        
        $response = $next($request);
        
        // Log performance metrics
        $this->logPerformanceMetrics($request, $startTime, $startQueries);
        
        // Add performance headers
        $this->addPerformanceHeaders($response, $startTime);
        
        return $response;
    }

    private function logPerformanceMetrics(Request $request, float $startTime, array $startQueries): void
    {
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        $endQueries = DB::getQueryLog();
        $queryCount = count($endQueries) - count($startQueries);
        
        // Log slow requests (> 1000ms)
        if ($executionTime > 1000) {
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'execution_time_ms' => $executionTime,
                'query_count' => $queryCount,
                'memory_usage_mb' => memory_get_peak_usage(true) / 1024 / 1024,
                'user_id' => auth()->id()
            ]);
        }
        
        // Log requests with many queries (> 50)
        if ($queryCount > 50) {
            Log::warning('High query count detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'query_count' => $queryCount,
                'execution_time_ms' => $executionTime
            ]);
        }
        
        // Store performance metrics in cache for dashboard
        $this->storePerformanceMetrics($request, $executionTime, $queryCount);
    }

    private function addPerformanceHeaders($response, float $startTime): void
    {
        $executionTime = (microtime(true) - $startTime) * 1000;
        
        $response->headers->set('X-Response-Time', round($executionTime, 2) . 'ms');
        $response->headers->set('X-Memory-Usage', round(memory_get_peak_usage(true) / 1024 / 1024, 2) . 'MB');
        
        if (config('app.debug')) {
            $response->headers->set('X-Query-Count', count(DB::getQueryLog()));
        }
    }

    private function storePerformanceMetrics(Request $request, float $executionTime, int $queryCount): void
    {
        $key = 'performance_metrics_' . date('Y-m-d-H');
        
        $metrics = Cache::get($key, [
            'requests' => 0,
            'total_time' => 0,
            'total_queries' => 0,
            'slow_requests' => 0,
            'high_query_requests' => 0
        ]);
        
        $metrics['requests']++;
        $metrics['total_time'] += $executionTime;
        $metrics['total_queries'] += $queryCount;
        
        if ($executionTime > 1000) {
            $metrics['slow_requests']++;
        }
        
        if ($queryCount > 50) {
            $metrics['high_query_requests']++;
        }
        
        Cache::put($key, $metrics, now()->addHours(25));
    }
}