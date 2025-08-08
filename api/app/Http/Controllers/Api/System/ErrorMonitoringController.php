<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Services\ErrorMonitoringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ErrorMonitoringController extends Controller
{
    protected ErrorMonitoringService $errorMonitoringService;
    
    public function __construct(ErrorMonitoringService $errorMonitoringService)
    {
        $this->errorMonitoringService = $errorMonitoringService;
    }
    
    /**
     * Get error dashboard overview
     */
    public function getDashboard(): JsonResponse
    {
        try {
            $stats = $this->errorMonitoringService->getErrorStats();
            
            $dashboard = [
                'overview' => $stats,
                'trends' => $this->getErrorTrends(),
                'top_errors' => $this->getTopErrors(),
                'recent_activity' => $this->getRecentActivity(),
                'system_health' => $this->getSystemHealth()
            ];
            
            return response()->json([
                'success' => true,
                'data' => $dashboard
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load error dashboard'
            ], 500);
        }
    }
    
    /**
     * Get paginated error logs
     */
    public function getErrorLogs(Request $request): JsonResponse
    {
        try {
            $query = DB::table('error_logs')
                ->select([
                    'id', 'error_id', 'type', 'message', 'file', 'line',
                    'url', 'method', 'ip', 'user_id', 'severity',
                    'resolved', 'created_at'
                ])
                ->orderBy('created_at', 'desc');
            
            // Apply filters
            if ($request->filled('severity')) {
                $query->where('severity', $request->severity);
            }
            
            if ($request->filled('type')) {
                $query->where('type', 'like', '%' . $request->type . '%');
            }
            
            if ($request->filled('resolved')) {
                $query->where('resolved', $request->boolean('resolved'));
            }
            
            if ($request->filled('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }
            
            if ($request->filled('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }
            
            $errors = $query->paginate($request->get('per_page', 20));
            
            return response()->json([
                'success' => true,
                'data' => $errors
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load error logs'
            ], 500);
        }
    }
    
    /**
     * Get detailed error information
     */
    public function getErrorDetails(string $errorId): JsonResponse
    {
        try {
            $error = DB::table('error_logs')
                ->where('error_id', $errorId)
                ->first();
            
            if (!$error) {
                return response()->json([
                    'success' => false,
                    'error' => 'Error not found'
                ], 404);
            }
            
            // Decode context if exists
            if ($error->context) {
                $error->context = json_decode($error->context, true);
            }
            
            return response()->json([
                'success' => true,
                'data' => $error
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load error details'
            ], 500);
        }
    }
    
    /**
     * Mark error as resolved
     */
    public function resolveError(Request $request, string $errorId): JsonResponse
    {
        try {
            $request->validate([
                'resolution_notes' => 'nullable|string|max:1000'
            ]);
            
            $updated = DB::table('error_logs')
                ->where('error_id', $errorId)
                ->update([
                    'resolved' => true,
                    'resolution_notes' => $request->resolution_notes,
                    'resolved_at' => now(),
                    'updated_at' => now()
                ]);
            
            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'error' => 'Error not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Error marked as resolved'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to resolve error'
            ], 500);
        }
    }
    
    /**
     * Get error trends for charts
     */
    private function getErrorTrends(): array
    {
        try {
            $last7Days = collect(range(6, 0))->map(function ($daysAgo) {
                $date = Carbon::now()->subDays($daysAgo);
                
                $count = DB::table('error_logs')
                    ->whereDate('created_at', $date->toDateString())
                    ->count();
                
                return [
                    'date' => $date->format('Y-m-d'),
                    'count' => $count
                ];
            });
            
            return $last7Days->toArray();
            
        } catch (\Exception $e) {
            return [];
        }
    }
    
    /**
     * Get top error types
     */
    private function getTopErrors(): array
    {
        try {
            return DB::table('error_logs')
                ->select('type', DB::raw('count(*) as count'))
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->groupBy('type')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->toArray();
                
        } catch (\Exception $e) {
            return [];
        }
    }
    
    /**
     * Get recent error activity
     */
    private function getRecentActivity(): array
    {
        try {
            return DB::table('error_logs')
                ->select(['error_id', 'type', 'message', 'severity', 'created_at'])
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->toArray();
                
        } catch (\Exception $e) {
            return [];
        }
    }
    
    /**
     * Get system health metrics
     */
    private function getSystemHealth(): array
    {
        try {
            $totalErrors = DB::table('error_logs')
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->count();
            
            $criticalErrors = DB::table('error_logs')
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->where('severity', 'critical')
                ->count();
            
            $resolvedRate = DB::table('error_logs')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->where('resolved', true)
                ->count();
            
            $totalLast7Days = DB::table('error_logs')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->count();
            
            $resolvedPercentage = $totalLast7Days > 0 ? round(($resolvedRate / $totalLast7Days) * 100, 2) : 100;
            
            return [
                'total_errors_24h' => $totalErrors,
                'critical_errors_24h' => $criticalErrors,
                'resolved_percentage' => $resolvedPercentage,
                'health_status' => $this->calculateHealthStatus($totalErrors, $criticalErrors)
            ];
            
        } catch (\Exception $e) {
            return [
                'total_errors_24h' => 0,
                'critical_errors_24h' => 0,
                'resolved_percentage' => 100,
                'health_status' => 'unknown'
            ];
        }
    }
    
    /**
     * Calculate overall system health status
     */
    private function calculateHealthStatus(int $totalErrors, int $criticalErrors): string
    {
        if ($criticalErrors > 0) {
            return 'critical';
        }
        
        if ($totalErrors > 50) {
            return 'warning';
        }
        
        if ($totalErrors > 20) {
            return 'attention';
        }
        
        return 'healthy';
    }
    
    /**
     * Clear old error logs
     */
    public function clearOldLogs(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            
            $deleted = DB::table('error_logs')
                ->where('created_at', '<', Carbon::now()->subDays($days))
                ->delete();
            
            return response()->json([
                'success' => true,
                'message' => "Deleted {$deleted} old error logs"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to clear old logs'
            ], 500);
        }
    }
}