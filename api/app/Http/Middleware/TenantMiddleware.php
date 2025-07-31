<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Config;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     * دعم Multi-tenancy للمستقبل (عدة ورش في نفس النظام)
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get tenant from subdomain or header
        $tenant = $this->resolveTenant($request);

        if ($tenant) {
            // Set tenant-specific database connection
            $this->setTenantConnection($tenant);
            
            // Set tenant context
            app()->instance('current_tenant', $tenant);
        }

        return $next($request);
    }

    /**
     * Resolve tenant from request
     */
    private function resolveTenant(Request $request): ?string
    {
        // Method 1: From subdomain
        $host = $request->getHost();
        $parts = explode('.', $host);
        
        if (count($parts) > 2) {
            return $parts[0]; // e.g., workshop1.erp.com -> workshop1
        }

        // Method 2: From header
        $tenantHeader = $request->header('X-Tenant-ID');
        if ($tenantHeader) {
            return $tenantHeader;
        }

        // Method 3: From query parameter (for testing)
        $tenantQuery = $request->query('tenant');
        if ($tenantQuery) {
            return $tenantQuery;
        }

        return null;
    }

    /**
     * Set tenant-specific database connection
     */
    private function setTenantConnection(string $tenant): void
    {
        // For future implementation
        // Currently using single database
        
        // Example for multiple databases:
        /*
        Config::set('database.connections.tenant', [
            'driver' => 'mysql',
            'host' => env('DB_HOST'),
            'database' => "workshop_erp_{$tenant}",
            'username' => env('DB_USERNAME'),
            'password' => env('DB_PASSWORD'),
        ]);
        
        Config::set('database.default', 'tenant');
        */
        
        // For now, just log the tenant context
        logger()->info("Tenant context set: {$tenant}");
    }
}