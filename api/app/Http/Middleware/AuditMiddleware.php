<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use App\Models\AuditLog;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     * تسجيل جميع العمليات الحساسة في النظام
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log specific sensitive operations
        if ($this->shouldAudit($request)) {
            $this->logOperation($request, $response);
        }

        return $response;
    }

    /**
     * Determine if the request should be audited
     */
    private function shouldAudit(Request $request): bool
    {
        $sensitiveRoutes = [
            'workers', 'payroll', 'orders', 'products', 
            'materials', 'production', 'auth', 'roles', 
            'permissions', 'biometric', 'woocommerce'
        ];

        $method = $request->method();
        $path = $request->path();

        // Log only POST, PUT, PATCH, DELETE operations
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return false;
        }

        // Check if path contains sensitive routes
        foreach ($sensitiveRoutes as $route) {
            if (str_contains($path, $route)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log the operation
     */
    private function logOperation(Request $request, Response $response): void
    {
        try {
            $user = auth()->user();
            
            $auditData = [
                'user_id' => $user ? $user->id : null,
                'user_email' => $user ? $user->email : 'guest',
                'action' => $request->method(),
                'route' => $request->path(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'request_data' => $this->sanitizeRequestData($request->all()),
                'response_status' => $response->getStatusCode(),
                'timestamp' => now(),
            ];

            // Create audit log entry
            AuditLog::create($auditData);

            // Also log to Laravel log for backup
            Log::info('Audit Log', $auditData);

        } catch (\Exception $e) {
            // Don't break the request if audit logging fails
            Log::error('Audit logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Sanitize request data to remove sensitive information
     */
    private function sanitizeRequestData(array $data): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'token', 'secret'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '***HIDDEN***';
            }
        }

        return $data;
    }
}