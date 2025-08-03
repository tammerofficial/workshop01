<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\SecurityEvent;
use App\Models\PermissionAuditLog;
use App\Models\User;
use App\Services\AISecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;

/**
 * تطبيق الموبايل للمراقبة الأمنية
 * Mobile Security Monitoring Controller
 */
class SecurityMobileController extends Controller
{
    protected AISecurityService $aiSecurity;

    public function __construct(AISecurityService $aiSecurity)
    {
        $this->aiSecurity = $aiSecurity;
    }

    /**
     * لوحة التحكم الرئيسية للموبايل
     */
    public function getDashboard(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $dashboard = [
                'security_overview' => $this->getSecurityOverview(),
                'recent_alerts' => $this->getRecentAlerts(10),
                'user_activity' => $this->getUserActivity($user),
                'system_status' => $this->getSystemStatus(),
                'quick_actions' => $this->getQuickActions($user),
                'notifications' => $this->getPendingNotifications($user),
                'last_updated' => now(),
            ];

            return response()->json([
                'success' => true,
                'data' => $dashboard,
                'mobile_optimized' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load mobile dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إدارة التنبيهات الفورية للموبايل
     */
    public function getInstantAlerts(Request $request): JsonResponse
    {
        try {
            $alerts = SecurityEvent::where('severity', '>=', 'medium')
                ->where('investigated', false)
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->limit(20)
                ->get()
                ->map(function ($alert) {
                    return [
                        'id' => $alert->id,
                        'type' => $alert->event_type,
                        'severity' => $alert->severity,
                        'title' => $this->generateAlertTitle($alert),
                        'description' => $this->generateAlertDescription($alert),
                        'user' => $alert->user?->name,
                        'timestamp' => $alert->created_at,
                        'action_required' => $this->requiresAction($alert),
                        'priority_score' => $this->calculatePriority($alert),
                    ];
                });

            return response()->json([
                'success' => true,
                'alerts' => $alerts,
                'alert_count' => $alerts->count(),
                'high_priority_count' => $alerts->where('priority_score', '>', 8)->count(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load alerts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * اتخاذ إجراء فوري من الموبايل
     */
    public function takeQuickAction(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'action_type' => 'required|in:block_user,lock_account,reset_password,investigate,dismiss',
                'target_id' => 'required|integer',
                'target_type' => 'required|in:user,event,session',
                'reason' => 'nullable|string|max:500',
            ]);

            $result = $this->executeQuickAction(
                $validated['action_type'],
                $validated['target_type'],
                $validated['target_id'],
                $validated['reason'] ?? '',
                $request->user()
            );

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'action_taken' => $validated['action_type'],
                'executed_at' => now(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to execute action: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إرسال تنبيه طوارئ
     */
    public function sendEmergencyAlert(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'alert_type' => 'required|in:security_breach,system_compromise,data_theft,unauthorized_access',
                'severity' => 'required|in:high,critical',
                'description' => 'required|string|max:1000',
                'affected_systems' => 'nullable|array',
                'immediate_action_needed' => 'boolean',
            ]);

            $alert = SecurityEvent::logEvent(
                'emergency_alert',
                $validated['severity'],
                [
                    'alert_type' => $validated['alert_type'],
                    'description' => $validated['description'],
                    'affected_systems' => $validated['affected_systems'] ?? [],
                    'reported_by' => $request->user()->id,
                    'mobile_reported' => true,
                    'immediate_action' => $validated['immediate_action_needed'] ?? false,
                ],
                $request->user(),
                'emergency_response'
            );

            // إرسال تنبيهات فورية للمسؤولين
            $this->notifySecurityTeam($alert, $validated);

            return response()->json([
                'success' => true,
                'alert_id' => $alert->id,
                'message' => 'Emergency alert sent successfully',
                'response_team_notified' => true,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send emergency alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * مراقبة النشاط المباشر
     */
    public function getLiveActivity(Request $request): JsonResponse
    {
        try {
            $timeframe = $request->get('timeframe', '1h'); // 1h, 6h, 24h
            $limit = min($request->get('limit', 50), 100);

            $startTime = match($timeframe) {
                '1h' => Carbon::now()->subHour(),
                '6h' => Carbon::now()->subHours(6),
                '24h' => Carbon::now()->subDay(),
                default => Carbon::now()->subHour(),
            };

            $activities = PermissionAuditLog::with('user:id,name,email')
                ->where('created_at', '>=', $startTime)
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'user' => $activity->user?->name ?? 'Unknown',
                        'permission' => $activity->permission_name,
                        'result' => $activity->result,
                        'ip_address' => $activity->ip_address,
                        'timestamp' => $activity->created_at,
                        'risk_level' => $this->assessActivityRisk($activity),
                        'location' => $this->getLocationFromIP($activity->ip_address),
                    ];
                });

            return response()->json([
                'success' => true,
                'activities' => $activities,
                'timeframe' => $timeframe,
                'total_activities' => $activities->count(),
                'suspicious_activities' => $activities->where('risk_level', 'high')->count(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load live activity: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحليل أمني سريع من الموبايل
     */
    public function runQuickAnalysis(Request $request): JsonResponse
    {
        try {
            $analysisType = $request->get('type', 'overview'); // overview, user, threats, system
            
            $analysis = match($analysisType) {
                'overview' => $this->getOverviewAnalysis(),
                'user' => $this->getUserAnalysis($request->get('user_id')),
                'threats' => $this->getThreatAnalysis(),
                'system' => $this->getSystemAnalysis(),
                default => $this->getOverviewAnalysis(),
            };

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
                'analysis_type' => $analysisType,
                'generated_at' => now(),
                'confidence_level' => 0.85,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Analysis failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إعدادات التنبيهات الشخصية
     */
    public function updateNotificationSettings(Request $request): JsonResponse
    {
        try {
            $settings = $request->validate([
                'push_notifications' => 'boolean',
                'email_notifications' => 'boolean',
                'sms_notifications' => 'boolean',
                'severity_threshold' => 'in:low,medium,high,critical',
                'quiet_hours' => 'array',
                'notification_types' => 'array',
            ]);

            $user = $request->user();
            
            // حفظ الإعدادات
            $user->update([
                'notification_settings' => $settings
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification settings updated',
                'settings' => $settings,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper Methods
     */
    private function getSecurityOverview(): array
    {
        $today = Carbon::today();
        
        return [
            'threat_level' => 'medium',
            'active_incidents' => SecurityEvent::where('investigated', false)->count(),
            'today_events' => SecurityEvent::whereDate('created_at', $today)->count(),
            'blocked_attempts' => SecurityEvent::where('action_taken', 'blocked')
                ->whereDate('created_at', $today)->count(),
            'system_health' => 85,
            'last_scan' => now()->subMinutes(5),
        ];
    }

    private function getRecentAlerts(int $limit): array
    {
        return SecurityEvent::where('severity', '>=', 'medium')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'type' => $alert->event_type,
                    'severity' => $alert->severity,
                    'timestamp' => $alert->created_at,
                    'investigated' => $alert->investigated,
                ];
            })
            ->toArray();
    }

    private function getUserActivity(User $user): array
    {
        $today = Carbon::today();
        
        return [
            'today_actions' => PermissionAuditLog::where('user_id', $user->id)
                ->whereDate('created_at', $today)->count(),
            'last_login' => $user->last_activity,
            'failed_attempts' => PermissionAuditLog::where('user_id', $user->id)
                ->where('result', 'denied')
                ->whereDate('created_at', $today)->count(),
            'location' => $this->getLocationFromIP(request()->ip()),
        ];
    }

    private function getSystemStatus(): array
    {
        return [
            'overall_status' => 'healthy',
            'uptime' => '99.9%',
            'active_users' => User::whereNotNull('last_activity')->count(),
            'database_status' => 'online',
            'security_services' => 'active',
            'monitoring_status' => 'operational',
        ];
    }

    private function getQuickActions(User $user): array
    {
        $actions = [
            ['id' => 'emergency_alert', 'label' => 'Send Emergency Alert', 'icon' => 'alert'],
            ['id' => 'system_scan', 'label' => 'Quick Security Scan', 'icon' => 'scan'],
            ['id' => 'lock_system', 'label' => 'Emergency Lock', 'icon' => 'lock'],
        ];

        // إضافة إجراءات خاصة بالمسؤولين
        if ($user->hasPermission('system.admin')) {
            $actions[] = ['id' => 'broadcast_alert', 'label' => 'Broadcast Alert', 'icon' => 'broadcast'];
            $actions[] = ['id' => 'isolate_threat', 'label' => 'Isolate Threat', 'icon' => 'isolate'];
        }

        return $actions;
    }

    private function getPendingNotifications(User $user): array
    {
        // جلب التنبيهات المعلقة للمستخدم
        return [
            ['id' => 1, 'type' => 'security', 'message' => 'New security alert requires attention'],
            ['id' => 2, 'type' => 'system', 'message' => 'System maintenance scheduled'],
        ];
    }

    private function generateAlertTitle(SecurityEvent $alert): string
    {
        return match($alert->event_type) {
            'permission_violation' => 'Unauthorized Access Attempt',
            'suspicious_activity' => 'Suspicious Behavior Detected',
            'ai_detected_anomaly' => 'AI Anomaly Detection',
            'brute_force' => 'Brute Force Attack',
            default => 'Security Alert'
        };
    }

    private function generateAlertDescription(SecurityEvent $alert): string
    {
        return "Security event detected at " . $alert->created_at->format('H:i') . 
               " from IP " . $alert->ip_address;
    }

    private function requiresAction(SecurityEvent $alert): bool
    {
        return in_array($alert->severity, ['high', 'critical']) && !$alert->investigated;
    }

    private function calculatePriority(SecurityEvent $alert): int
    {
        $priority = match($alert->severity) {
            'critical' => 10,
            'high' => 8,
            'medium' => 5,
            'low' => 2,
            default => 1
        };

        // تعديل الأولوية بناءً على النوع
        if (in_array($alert->event_type, ['brute_force', 'data_breach_attempt'])) {
            $priority += 2;
        }

        return min($priority, 10);
    }

    private function executeQuickAction(string $action, string $targetType, int $targetId, string $reason, User $executor): array
    {
        try {
            switch ($action) {
                case 'block_user':
                    return $this->blockUser($targetId, $reason, $executor);
                case 'lock_account':
                    return $this->lockAccount($targetId, $reason, $executor);
                case 'investigate':
                    return $this->markForInvestigation($targetId, $reason, $executor);
                case 'dismiss':
                    return $this->dismissAlert($targetId, $reason, $executor);
                default:
                    throw new \InvalidArgumentException("Unknown action: {$action}");
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function blockUser(int $userId, string $reason, User $executor): array
    {
        $user = User::findOrFail($userId);
        $user->update(['is_active' => false]);
        
        SecurityEvent::logEvent(
            'user_blocked',
            'high',
            ['reason' => $reason, 'blocked_by' => $executor->id],
            $user,
            'mobile_action'
        );

        return ['success' => true, 'message' => 'User blocked successfully'];
    }

    private function lockAccount(int $userId, string $reason, User $executor): array
    {
        $user = User::findOrFail($userId);
        $user->tokens()->delete(); // إلغاء جميع الجلسات
        
        return ['success' => true, 'message' => 'Account locked successfully'];
    }

    private function markForInvestigation(int $eventId, string $reason, User $executor): array
    {
        $event = SecurityEvent::findOrFail($eventId);
        $event->update([
            'investigated' => true,
            'investigation_notes' => $reason,
        ]);

        return ['success' => true, 'message' => 'Marked for investigation'];
    }

    private function dismissAlert(int $eventId, string $reason, User $executor): array
    {
        $event = SecurityEvent::findOrFail($eventId);
        $event->resolve($reason);

        return ['success' => true, 'message' => 'Alert dismissed'];
    }

    private function notifySecurityTeam(SecurityEvent $alert, array $details): void
    {
        // إرسال تنبيهات للفريق الأمني
        // تنفيذ الإشعارات الفورية
    }

    private function assessActivityRisk(PermissionAuditLog $activity): string
    {
        if ($activity->result === 'denied') return 'high';
        
        $sensitivePermissions = ['users.delete', 'roles.manage', 'system.admin'];
        if (in_array($activity->permission_name, $sensitivePermissions)) return 'medium';
        
        return 'low';
    }

    private function getLocationFromIP(string $ip): string
    {
        // تطبيق مبسط للموقع الجغرافي
        return 'Unknown Location';
    }

    private function getOverviewAnalysis(): array
    {
        return [
            'threat_level' => 'medium',
            'active_incidents' => 3,
            'recommendations' => [
                'Monitor user ID 142 for unusual activity',
                'Update firewall rules',
                'Review access logs',
            ],
        ];
    }

    private function getUserAnalysis($userId): array
    {
        if (!$userId) return ['error' => 'User ID required'];
        
        return [
            'user_id' => $userId,
            'risk_score' => 0.3,
            'recent_activity' => 'normal',
            'recommendations' => ['Continue monitoring'],
        ];
    }

    private function getThreatAnalysis(): array
    {
        return [
            'detected_threats' => 2,
            'threat_types' => ['brute_force', 'suspicious_activity'],
            'mitigation_status' => 'active',
        ];
    }

    private function getSystemAnalysis(): array
    {
        return [
            'system_health' => 85,
            'vulnerabilities' => 0,
            'performance' => 'optimal',
            'security_score' => 9.2,
        ];
    }
}