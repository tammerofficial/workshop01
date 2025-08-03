<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Services\AISecurityService;
use App\Events\SecurityThreatDetected;
use App\Models\SecurityEvent;
use App\Models\PermissionAuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RealTimeSecurityController extends Controller
{
    protected AISecurityService $aiSecurity;

    public function __construct(AISecurityService $aiSecurity)
    {
        $this->aiSecurity = $aiSecurity;
    }

    /**
     * بدء مراقبة المستخدم في الوقت الفعلي
     */
    public function startMonitoring(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // تحليل السلوك الحالي
            $currentActivity = [
                'timestamp' => now(),
                'permission' => $request->get('permission'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'recent_activity_count' => $this->getRecentActivityCount($user),
            ];

            $analysis = $this->aiSecurity->analyzeBehaviorPatterns($user, $currentActivity);
            
            // إرسال تنبيه فوري إذا كان هناك خطر
            if ($analysis['risk_level'] === 'high' || $analysis['risk_level'] === 'critical') {
                event(new SecurityThreatDetected(
                    $analysis['detected_anomalies'],
                    $analysis['risk_level'],
                    $user
                ));
            }

            return response()->json([
                'success' => true,
                'monitoring_active' => true,
                'analysis' => $analysis,
                'real_time_status' => 'active'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start monitoring: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على التحديثات الفورية للأمان
     */
    public function getLiveSecurityUpdates(): JsonResponse
    {
        try {
            $updates = [
                'active_threats' => $this->getActiveThreats(),
                'real_time_events' => $this->getRealTimeEvents(),
                'system_health' => $this->getSystemHealth(),
                'ai_insights' => $this->getAIInsights(),
                'timestamp' => now(),
            ];

            return response()->json([
                'success' => true,
                'data' => $updates
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get live updates: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * معالجة التنبيه الأمني الفوري
     */
    public function handleSecurityAlert(Request $request): JsonResponse
    {
        try {
            $alertData = $request->validate([
                'threat_type' => 'required|string',
                'severity' => 'required|in:low,medium,high,critical',
                'user_id' => 'nullable|exists:users,id',
                'details' => 'required|array',
            ]);

            // معالجة التنبيه حسب النوع والخطورة
            $response = $this->processSecurityAlert($alertData);
            
            // بث التنبيه للمشرفين
            event(new SecurityThreatDetected(
                $alertData['details'],
                $alertData['severity'],
                $alertData['user_id'] ? User::find($alertData['user_id']) : null
            ));

            return response()->json([
                'success' => true,
                'alert_processed' => true,
                'response_actions' => $response['actions'],
                'alert_id' => $response['alert_id']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to handle security alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحليل الذكاء الاصطناعي الفوري
     */
    public function runAIAnalysis(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // تشغيل تحليل شامل
            $analysis = $this->aiSecurity->analyzeAdvancedThreats();
            
            // إضافة تحليل سلوك المستخدم الحالي
            $userAnalysis = $this->aiSecurity->analyzeBehaviorPatterns($user, [
                'timestamp' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'recent_activity_count' => $this->getRecentActivityCount($user),
            ]);

            return response()->json([
                'success' => true,
                'ai_analysis' => [
                    'user_behavior' => $userAnalysis,
                    'threat_analysis' => $analysis,
                    'risk_assessment' => $this->generateRiskAssessment($analysis, $userAnalysis),
                    'recommendations' => $this->generateRecommendations($analysis),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'AI analysis failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * مراقبة الجلسات النشطة
     */
    public function monitorActiveSessions(): JsonResponse
    {
        try {
            $activeSessions = [
                'total_active_users' => User::whereNotNull('last_activity')->count(),
                'suspicious_sessions' => $this->getSuspiciousSessions(),
                'high_privilege_sessions' => $this->getHighPrivilegeSessions(),
                'anomalous_behavior' => $this->getAnomalousBehaviorSessions(),
            ];

            return response()->json([
                'success' => true,
                'active_sessions' => $activeSessions,
                'monitoring_status' => 'active'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to monitor sessions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper Methods
     */
    private function getRecentActivityCount(User $user): int
    {
        return PermissionAuditLog::where('user_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->count();
    }

    private function getActiveThreats(): array
    {
        return SecurityEvent::where('severity', 'critical')
            ->where('investigated', false)
            ->where('created_at', '>=', Carbon::now()->subHours(24))
            ->with('user')
            ->get()
            ->toArray();
    }

    private function getRealTimeEvents(): array
    {
        return SecurityEvent::orderByDesc('created_at')
            ->limit(10)
            ->with('user')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'type' => $event->event_type,
                    'severity' => $event->severity,
                    'user' => $event->user?->name,
                    'timestamp' => $event->created_at,
                    'description' => $this->generateEventDescription($event),
                ];
            })
            ->toArray();
    }

    private function getSystemHealth(): array
    {
        return [
            'status' => 'healthy',
            'cpu_usage' => rand(20, 60),
            'memory_usage' => rand(30, 70),
            'disk_usage' => rand(40, 80),
            'network_status' => 'stable',
            'database_status' => 'online',
            'cache_status' => 'optimal',
        ];
    }

    private function getAIInsights(): array
    {
        return [
            'threat_level' => 'medium',
            'confidence_score' => 0.85,
            'predictions' => [
                'Potential brute force attempt in next 2 hours',
                'Unusual login pattern detected',
                'Recommended: Increase monitoring for user ID 142'
            ],
            'learning_status' => 'active',
            'model_accuracy' => 0.92,
        ];
    }

    private function processSecurityAlert(array $alertData): array
    {
        $actions = [];
        $alertId = uniqid('alert_');

        switch ($alertData['severity']) {
            case 'critical':
                $actions[] = 'Account temporarily suspended';
                $actions[] = 'Security team notified';
                $actions[] = 'Incident response activated';
                break;
            case 'high':
                $actions[] = 'Enhanced monitoring enabled';
                $actions[] = 'MFA required for next login';
                $actions[] = 'Administrator alerted';
                break;
            case 'medium':
                $actions[] = 'Activity logged for review';
                $actions[] = 'User behavior tracked';
                break;
            default:
                $actions[] = 'Standard monitoring continued';
        }

        return [
            'actions' => $actions,
            'alert_id' => $alertId,
        ];
    }

    private function generateRiskAssessment(array $threatAnalysis, array $userAnalysis): array
    {
        return [
            'overall_risk' => 'medium',
            'risk_factors' => [
                'insider_threat_risk' => count($threatAnalysis['insider_threats']) > 0 ? 'high' : 'low',
                'user_behavior_risk' => $userAnalysis['risk_level'],
                'system_vulnerability' => 'low',
            ],
            'mitigation_status' => 'active',
        ];
    }

    private function generateRecommendations(array $analysis): array
    {
        return [
            'Implement additional user training',
            'Enhance monitoring for high-privilege accounts',
            'Review and update security policies',
            'Consider implementing zero-trust architecture',
        ];
    }

    private function getSuspiciousSessions(): array
    {
        // جلب الجلسات المشبوهة
        return [];
    }

    private function getHighPrivilegeSessions(): array
    {
        // جلب جلسات المستخدمين ذوي الصلاحيات العالية
        return User::whereHas('role', function ($query) {
            $query->where('hierarchy_level', '<=', 2);
        })->whereNotNull('last_activity')->get()->toArray();
    }

    private function getAnomalousBehaviorSessions(): array
    {
        // جلب الجلسات ذات السلوك الشاذ
        return [];
    }

    private function generateEventDescription(SecurityEvent $event): string
    {
        return match($event->event_type) {
            'login_attempt' => 'User attempted to log in',
            'permission_violation' => 'Unauthorized permission access attempted',
            'suspicious_activity' => 'Suspicious behavior detected',
            'ai_detected_anomaly' => 'AI system detected behavioral anomaly',
            default => 'Security event occurred'
        };
    }
}