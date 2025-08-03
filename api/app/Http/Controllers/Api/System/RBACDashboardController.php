<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\Permission;
use App\Models\ActivityLog;
use App\Models\PermissionAuditLog;
use App\Models\SecurityEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RBACDashboardController extends Controller
{
    /**
     * الحصول على بيانات لوحة تحكم RBAC الرئيسية
     */
    public function index(): JsonResponse
    {
        try {
            $data = [
                'overview' => $this->getOverviewStats(),
                'security_alerts' => $this->getSecurityAlerts(),
                'recent_activities' => $this->getRecentActivities(),
                'permission_usage' => $this->getPermissionUsageStats(),
                'role_distribution' => $this->getRoleDistribution(),
                'audit_summary' => $this->getAuditSummary(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'RBAC dashboard data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على إحصائيات عامة
     */
    protected function getOverviewStats(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_roles' => Role::count(),
            'system_roles' => Role::where('is_system_role', true)->count(),
            'total_permissions' => count(Permission::getAvailablePermissions()),
            'security_events_today' => SecurityEvent::whereDate('created_at', Carbon::today())->count(),
            'failed_permissions_today' => PermissionAuditLog::where('result', 'denied')
                ->whereDate('created_at', Carbon::today())->count(),
        ];
    }

    /**
     * الحصول على تنبيهات الأمان
     */
    protected function getSecurityAlerts(): array
    {
        $criticalEvents = SecurityEvent::where('severity', 'critical')
            ->where('investigated', false)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $suspiciousPatterns = SecurityEvent::detectPatterns();

        return [
            'critical_events' => $criticalEvents,
            'patterns' => $suspiciousPatterns,
            'alerts_count' => $criticalEvents->count(),
        ];
    }

    /**
     * الحصول على الأنشطة الأخيرة
     */
    protected function getRecentActivities(): array
    {
        $activities = ActivityLog::with(['causer', 'subject'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->formatted_description,
                    'causer' => $activity->causer?->name ?? 'System',
                    'subject_type' => $activity->subject_type,
                    'event' => $activity->event,
                    'severity' => $activity->severity_level,
                    'created_at' => $activity->created_at,
                ];
            });

        return $activities->toArray();
    }

    /**
     * الحصول على إحصائيات استخدام الصلاحيات
     */
    protected function getPermissionUsageStats(): array
    {
        $topPermissions = PermissionAuditLog::selectRaw('
                permission_name,
                COUNT(*) as total_uses,
                SUM(CASE WHEN result = "success" THEN 1 ELSE 0 END) as successful_uses,
                SUM(CASE WHEN result = "denied" THEN 1 ELSE 0 END) as denied_uses
            ')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('permission_name')
            ->orderByDesc('total_uses')
            ->limit(10)
            ->get();

        $usageByHour = PermissionAuditLog::selectRaw("
                strftime('%H', created_at) as hour,
                COUNT(*) as count
            ")
            ->whereDate('created_at', Carbon::today())
            ->groupBy('hour')
            ->pluck('count', 'hour');

        return [
            'top_permissions' => $topPermissions,
            'hourly_usage' => $usageByHour,
        ];
    }

    /**
     * الحصول على توزيع الأدوار
     */
    protected function getRoleDistribution(): array
    {
        $roleStats = Role::withCount('users')
            ->orderBy('hierarchy_level')
            ->get()
            ->map(function ($role) {
                return [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'users_count' => $role->users_count,
                    'hierarchy_level' => $role->hierarchy_level,
                    'department' => $role->department,
                    'is_system_role' => $role->is_system_role,
                ];
            });

        $departmentDistribution = User::join('roles', 'users.role_id', '=', 'roles.id')
            ->whereNotNull('roles.department')
            ->selectRaw('roles.department, COUNT(*) as users_count')
            ->groupBy('roles.department')
            ->pluck('users_count', 'department');

        return [
            'roles' => $roleStats,
            'departments' => $departmentDistribution,
        ];
    }

    /**
     * الحصول على ملخص المراجعة
     */
    protected function getAuditSummary(): array
    {
        $last24Hours = Carbon::now()->subDay();
        $last7Days = Carbon::now()->subDays(7);

        return [
            'permission_checks_24h' => PermissionAuditLog::where('created_at', '>=', $last24Hours)->count(),
            'failed_permissions_24h' => PermissionAuditLog::where('result', 'denied')
                ->where('created_at', '>=', $last24Hours)->count(),
            'security_events_7d' => SecurityEvent::where('created_at', '>=', $last7Days)->count(),
            'unique_users_24h' => PermissionAuditLog::where('created_at', '>=', $last24Hours)
                ->distinct('user_id')->count(),
        ];
    }

    /**
     * الحصول على تفاصيل الأمان
     */
    public function getSecurityDetails(): JsonResponse
    {
        try {
            $data = [
                'events_by_type' => $this->getEventsByType(),
                'events_by_severity' => $this->getEventsBySeverity(),
                'top_violating_users' => $this->getTopViolatingUsers(),
                'ip_analysis' => $this->getIPAnalysis(),
                'timeline' => $this->getSecurityTimeline(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load security details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على الأحداث حسب النوع
     */
    protected function getEventsByType(): array
    {
        return SecurityEvent::selectRaw('event_type, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('event_type')
            ->orderByDesc('count')
            ->pluck('count', 'event_type')
            ->toArray();
    }

    /**
     * الحصول على الأحداث حسب مستوى الخطورة
     */
    protected function getEventsBySeverity(): array
    {
        return SecurityEvent::selectRaw('severity, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('severity')
            ->pluck('count', 'severity')
            ->toArray();
    }

    /**
     * الحصول على أكثر المستخدمين انتهاكاً
     */
    protected function getTopViolatingUsers(): array
    {
        return PermissionAuditLog::select('user_id')
            ->selectRaw('COUNT(*) as violations')
            ->where('result', 'denied')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('user_id')
            ->orderByDesc('violations')
            ->limit(10)
            ->with('user:id,name,email')
            ->get()
            ->map(function ($record) {
                return [
                    'user' => $record->user,
                    'violations' => $record->violations
                ];
            })
            ->toArray();
    }

    /**
     * تحليل عناوين IP
     */
    protected function getIPAnalysis(): array
    {
        $suspiciousIPs = SecurityEvent::selectRaw('ip_address, COUNT(*) as events')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('ip_address')
            ->orderByDesc('events')
            ->limit(10)
            ->get();

        $blockedIPs = SecurityEvent::where('action_taken', 'blocked')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->distinct('ip_address')
            ->count();

        return [
            'suspicious_ips' => $suspiciousIPs,
            'blocked_count' => $blockedIPs,
        ];
    }

    /**
     * الحصول على الجدول الزمني للأمان
     */
    protected function getSecurityTimeline(): array
    {
        return SecurityEvent::selectRaw('
                DATE(created_at) as date,
                severity,
                COUNT(*) as count
            ')
            ->where('created_at', '>=', Carbon::now()->subDays(14))
            ->groupBy('date', 'severity')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(function ($events, $date) {
                return [
                    'date' => $date,
                    'events' => $events->pluck('count', 'severity')->toArray()
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * تصدير تقرير RBAC
     */
    public function exportReport(Request $request): JsonResponse
    {
        try {
            $format = $request->get('format', 'json');
            $startDate = $request->get('start_date', Carbon::now()->subDays(30));
            $endDate = $request->get('end_date', Carbon::now());

            $report = [
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate
                ],
                'summary' => $this->getReportSummary($startDate, $endDate),
                'detailed_logs' => $this->getDetailedLogs($startDate, $endDate),
                'security_incidents' => $this->getSecurityIncidents($startDate, $endDate),
                'generated_at' => Carbon::now()->toISOString(),
            ];

            return response()->json([
                'success' => true,
                'data' => $report,
                'message' => 'RBAC report generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ملخص التقرير
     */
    protected function getReportSummary($startDate, $endDate): array
    {
        return [
            'total_permission_checks' => PermissionAuditLog::whereBetween('created_at', [$startDate, $endDate])->count(),
            'failed_permission_checks' => PermissionAuditLog::where('result', 'denied')
                ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'security_events' => SecurityEvent::whereBetween('created_at', [$startDate, $endDate])->count(),
            'unique_users' => PermissionAuditLog::whereBetween('created_at', [$startDate, $endDate])
                ->distinct('user_id')->count(),
        ];
    }

    /**
     * السجلات المفصلة
     */
    protected function getDetailedLogs($startDate, $endDate): array
    {
        return PermissionAuditLog::with('user:id,name,email')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderByDesc('created_at')
            ->limit(1000)
            ->get()
            ->toArray();
    }

    /**
     * الحوادث الأمنية
     */
    protected function getSecurityIncidents($startDate, $endDate): array
    {
        return SecurityEvent::with('user:id,name,email')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderByDesc('created_at')
            ->get()
            ->toArray();
    }
}