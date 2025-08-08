<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);

        // Enable CORS for API routes - Laravel 11 has built-in CORS support
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Global Exception Handler
        $exceptions->render(function (Throwable $e, $request) {
            // إذا كان API request
            if ($request->expectsJson() || $request->is('api/*')) {
                return app(\App\Services\ErrorResponseService::class)->handle($e, $request);
            }
            
            return null; // يرجع للمعالجة الافتراضية للـ web routes
        });
        
        // تسجيل الأخطاء في نظام المراقبة
        $exceptions->reportable(function (Throwable $e) {
            try {
                app(\App\Services\ErrorMonitoringService::class)->logError($e);
            } catch (\Exception $loggingError) {
                // Prevent infinite loops - just log to Laravel's default logger
                \Log::error('Failed to log error to monitoring system', ['original_error' => $e->getMessage(), 'logging_error' => $loggingError->getMessage()]);
            }
        });
    })->create();
