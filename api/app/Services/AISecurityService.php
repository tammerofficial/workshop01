<?php

namespace App\Services;

use App\Models\SecurityEvent;
use App\Models\PermissionAuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * خدمة الذكاء الاصطناعي للأمان
 * AI-Powered Security Service
 */
class AISecurityService
{
    private const ANOMALY_THRESHOLD = 0.7;
    private const LEARNING_PERIOD_DAYS = 30;
    private const BEHAVIOR_PATTERNS_CACHE_KEY = 'ai_behavior_patterns';

    /**
     * تحليل السلوك باستخدام الذكاء الاصطناعي
     */
    public function analyzeBehaviorPatterns(User $user, array $currentActivity): array
    {
        $userBaseline = $this->getUserBaseline($user);
        $anomalyScore = $this->calculateAnomalyScore($userBaseline, $currentActivity);
        
        $analysis = [
            'user_id' => $user->id,
            'anomaly_score' => $anomalyScore,
            'risk_level' => $this->getRiskLevel($anomalyScore),
            'detected_anomalies' => $this->getDetectedAnomalies($userBaseline, $currentActivity),
            'recommendations' => $this->getSecurityRecommendations($anomalyScore),
            'timestamp' => now(),
        ];

        // تسجيل النشاط المشبوه إذا كان مستوى الخطر مرتفع
        if ($analysis['risk_level'] === 'high' || $analysis['risk_level'] === 'critical') {
            $this->logSuspiciousActivity($user, $analysis);
        }

        return $analysis;
    }

    /**
     * الحصول على خط الأساس لسلوك المستخدم
     */
    private function getUserBaseline(User $user): array
    {
        $cacheKey = "user_baseline_{$user->id}";
        
        return Cache::remember($cacheKey, now()->addHours(6), function () use ($user) {
            $startDate = Carbon::now()->subDays(self::LEARNING_PERIOD_DAYS);
            
            // تحليل أنماط تسجيل الدخول
            $loginPatterns = $this->analyzeLoginPatterns($user, $startDate);
            
            // تحليل أنماط استخدام الصلاحيات
            $permissionPatterns = $this->analyzePermissionPatterns($user, $startDate);
            
            // تحليل الأوقات النشطة
            $activityTimes = $this->analyzeActivityTimes($user, $startDate);
            
            // تحليل المواقع الجغرافية
            $locationPatterns = $this->analyzeLocationPatterns($user, $startDate);
            
            return [
                'login_patterns' => $loginPatterns,
                'permission_patterns' => $permissionPatterns,
                'activity_times' => $activityTimes,
                'location_patterns' => $locationPatterns,
                'last_updated' => now(),
            ];
        });
    }

    /**
     * تحليل أنماط تسجيل الدخول
     */
    private function analyzeLoginPatterns(User $user, Carbon $startDate): array
    {
        $events = SecurityEvent::where('user_id', $user->id)
            ->where('event_type', 'login_attempt')
            ->where('created_at', '>=', $startDate)
            ->get();

        $hourlyDistribution = [];
        $dailyDistribution = [];
        $deviceTypes = [];
        
        foreach ($events as $event) {
            $hour = $event->created_at->hour;
            $day = $event->created_at->dayOfWeek;
            $deviceType = $event->event_data['device_type'] ?? 'unknown';
            
            $hourlyDistribution[$hour] = ($hourlyDistribution[$hour] ?? 0) + 1;
            $dailyDistribution[$day] = ($dailyDistribution[$day] ?? 0) + 1;
            $deviceTypes[$deviceType] = ($deviceTypes[$deviceType] ?? 0) + 1;
        }

        return [
            'avg_daily_logins' => $events->count() / self::LEARNING_PERIOD_DAYS,
            'hourly_distribution' => $hourlyDistribution,
            'daily_distribution' => $dailyDistribution,
            'common_devices' => $deviceTypes,
            'peak_hours' => array_keys(array_slice(arsort($hourlyDistribution) ?: [], 0, 3, true)),
        ];
    }

    /**
     * تحليل أنماط استخدام الصلاحيات
     */
    private function analyzePermissionPatterns(User $user, Carbon $startDate): array
    {
        $logs = PermissionAuditLog::where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $permissionFrequency = [];
        $hourlyUsage = [];
        $successRate = [];

        foreach ($logs as $log) {
            $permission = $log->permission_name;
            $hour = $log->created_at->hour;
            
            $permissionFrequency[$permission] = ($permissionFrequency[$permission] ?? 0) + 1;
            $hourlyUsage[$hour] = ($hourlyUsage[$hour] ?? 0) + 1;
            
            if (!isset($successRate[$permission])) {
                $successRate[$permission] = ['success' => 0, 'total' => 0];
            }
            
            $successRate[$permission]['total']++;
            if ($log->result === 'success') {
                $successRate[$permission]['success']++;
            }
        }

        // حساب معدل النجاح لكل صلاحية
        foreach ($successRate as $permission => &$data) {
            $data['rate'] = $data['total'] > 0 ? $data['success'] / $data['total'] : 0;
        }

        return [
            'avg_daily_permissions' => $logs->count() / self::LEARNING_PERIOD_DAYS,
            'permission_frequency' => $permissionFrequency,
            'hourly_usage' => $hourlyUsage,
            'success_rates' => $successRate,
            'most_used_permissions' => array_keys(array_slice(arsort($permissionFrequency) ?: [], 0, 5, true)),
        ];
    }

    /**
     * تحليل أوقات النشاط
     */
    private function analyzeActivityTimes(User $user, Carbon $startDate): array
    {
        $activities = PermissionAuditLog::where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->pluck('count', 'hour')
            ->toArray();

        $totalActivities = array_sum($activities);
        $averagePerHour = $totalActivities / 24;
        
        return [
            'hourly_activities' => $activities,
            'peak_hours' => array_keys(array_filter($activities, fn($count) => $count > $averagePerHour * 1.5)),
            'quiet_hours' => array_keys(array_filter($activities, fn($count) => $count < $averagePerHour * 0.3)),
            'average_per_hour' => $averagePerHour,
        ];
    }

    /**
     * تحليل أنماط المواقع الجغرافية
     */
    private function analyzeLocationPatterns(User $user, Carbon $startDate): array
    {
        $events = SecurityEvent::where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $ipFrequency = [];
        $locationFrequency = [];

        foreach ($events as $event) {
            $ip = $event->ip_address;
            $location = $this->getLocationFromIP($ip);
            
            $ipFrequency[$ip] = ($ipFrequency[$ip] ?? 0) + 1;
            $locationFrequency[$location] = ($locationFrequency[$location] ?? 0) + 1;
        }

        return [
            'common_ips' => array_keys(array_slice(arsort($ipFrequency) ?: [], 0, 5, true)),
            'common_locations' => array_keys(array_slice(arsort($locationFrequency) ?: [], 0, 3, true)),
            'ip_diversity' => count($ipFrequency),
            'location_diversity' => count($locationFrequency),
        ];
    }

    /**
     * حساب نتيجة الشذوذ
     */
    private function calculateAnomalyScore(array $baseline, array $currentActivity): float
    {
        $scores = [];

        // تحليل توقيت النشاط
        $timeScore = $this->calculateTimeAnomalyScore($baseline, $currentActivity);
        $scores[] = $timeScore;

        // تحليل نمط الصلاحيات
        $permissionScore = $this->calculatePermissionAnomalyScore($baseline, $currentActivity);
        $scores[] = $permissionScore;

        // تحليل الموقع الجغرافي
        $locationScore = $this->calculateLocationAnomalyScore($baseline, $currentActivity);
        $scores[] = $locationScore;

        // تحليل تكرار النشاط
        $frequencyScore = $this->calculateFrequencyAnomalyScore($baseline, $currentActivity);
        $scores[] = $frequencyScore;

        return array_sum($scores) / count($scores);
    }

    /**
     * حساب نتيجة شذوذ التوقيت
     */
    private function calculateTimeAnomalyScore(array $baseline, array $currentActivity): float
    {
        $currentHour = Carbon::parse($currentActivity['timestamp'])->hour;
        $hourlyActivities = $baseline['activity_times']['hourly_activities'] ?? [];
        
        $averageForHour = $hourlyActivities[$currentHour] ?? 0;
        $overallAverage = $baseline['activity_times']['average_per_hour'] ?? 1;
        
        if ($averageForHour == 0 && $overallAverage > 0) {
            return 0.8; // نشاط في وقت غير عادي
        }
        
        $ratio = $overallAverage > 0 ? $averageForHour / $overallAverage : 0;
        
        if ($ratio < 0.2) return 0.6; // وقت هادئ جداً
        if ($ratio > 3.0) return 0.3; // وقت ذروة عادي
        
        return 0.1; // وقت عادي
    }

    /**
     * حساب نتيجة شذوذ الصلاحيات
     */
    private function calculatePermissionAnomalyScore(array $baseline, array $currentActivity): float
    {
        $requestedPermission = $currentActivity['permission'] ?? '';
        $commonPermissions = $baseline['permission_patterns']['most_used_permissions'] ?? [];
        
        if (empty($requestedPermission)) return 0.0;
        
        if (in_array($requestedPermission, $commonPermissions)) {
            return 0.1; // صلاحية مألوفة
        }
        
        // فحص إذا كانت صلاحية إدارية أو حساسة
        $sensitivePermissions = [
            'users.delete', 'roles.manage', 'system.admin', 
            'database.backup', 'emergency.access'
        ];
        
        if (in_array($requestedPermission, $sensitivePermissions)) {
            return 0.9; // صلاحية حساسة جداً
        }
        
        return 0.4; // صلاحية غير مألوفة
    }

    /**
     * حساب نتيجة شذوذ الموقع
     */
    private function calculateLocationAnomalyScore(array $baseline, array $currentActivity): float
    {
        $currentIP = $currentActivity['ip_address'] ?? '';
        $commonIPs = $baseline['location_patterns']['common_ips'] ?? [];
        
        if (in_array($currentIP, $commonIPs)) {
            return 0.1; // IP مألوف
        }
        
        $currentLocation = $this->getLocationFromIP($currentIP);
        $commonLocations = $baseline['location_patterns']['common_locations'] ?? [];
        
        if (in_array($currentLocation, $commonLocations)) {
            return 0.3; // موقع مألوف لكن IP جديد
        }
        
        return 0.8; // موقع جديد تماماً
    }

    /**
     * حساب نتيجة شذوذ التكرار
     */
    private function calculateFrequencyAnomalyScore(array $baseline, array $currentActivity): float
    {
        $avgDailyPermissions = $baseline['permission_patterns']['avg_daily_permissions'] ?? 1;
        $recentActivityCount = $currentActivity['recent_activity_count'] ?? 0;
        
        if ($recentActivityCount > $avgDailyPermissions * 3) {
            return 0.8; // نشاط مفرط
        }
        
        if ($recentActivityCount > $avgDailyPermissions * 1.5) {
            return 0.4; // نشاط أعلى من المعتاد
        }
        
        return 0.1; // نشاط عادي
    }

    /**
     * تحديد مستوى الخطر
     */
    private function getRiskLevel(float $anomalyScore): string
    {
        if ($anomalyScore >= 0.8) return 'critical';
        if ($anomalyScore >= 0.6) return 'high';
        if ($anomalyScore >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * الحصول على الشذوذات المكتشفة
     */
    private function getDetectedAnomalies(array $baseline, array $currentActivity): array
    {
        $anomalies = [];
        
        // فحص الوقت
        $currentHour = Carbon::parse($currentActivity['timestamp'])->hour;
        $quietHours = $baseline['activity_times']['quiet_hours'] ?? [];
        
        if (in_array($currentHour, $quietHours)) {
            $anomalies[] = [
                'type' => 'unusual_time',
                'description' => 'Activity during usually quiet hours',
                'severity' => 'medium'
            ];
        }
        
        // فحص الصلاحيات
        $permission = $currentActivity['permission'] ?? '';
        $commonPermissions = $baseline['permission_patterns']['most_used_permissions'] ?? [];
        
        if (!in_array($permission, $commonPermissions) && !empty($permission)) {
            $anomalies[] = [
                'type' => 'unusual_permission',
                'description' => "Accessing uncommon permission: {$permission}",
                'severity' => 'high'
            ];
        }
        
        // فحص الموقع
        $currentIP = $currentActivity['ip_address'] ?? '';
        $commonIPs = $baseline['location_patterns']['common_ips'] ?? [];
        
        if (!in_array($currentIP, $commonIPs)) {
            $anomalies[] = [
                'type' => 'new_location',
                'description' => "Access from new IP address: {$currentIP}",
                'severity' => 'medium'
            ];
        }
        
        return $anomalies;
    }

    /**
     * الحصول على توصيات الأمان
     */
    private function getSecurityRecommendations(float $anomalyScore): array
    {
        $recommendations = [];
        
        if ($anomalyScore >= 0.8) {
            $recommendations[] = 'Immediate investigation required';
            $recommendations[] = 'Consider temporary account suspension';
            $recommendations[] = 'Require additional authentication';
            $recommendations[] = 'Alert security team';
        } elseif ($anomalyScore >= 0.6) {
            $recommendations[] = 'Enhanced monitoring recommended';
            $recommendations[] = 'Require MFA for sensitive operations';
            $recommendations[] = 'Log additional activity details';
        } elseif ($anomalyScore >= 0.4) {
            $recommendations[] = 'Continue monitoring';
            $recommendations[] = 'Note unusual pattern';
        } else {
            $recommendations[] = 'Normal activity - no action required';
        }
        
        return $recommendations;
    }

    /**
     * تسجيل النشاط المشبوه
     */
    private function logSuspiciousActivity(User $user, array $analysis): void
    {
        SecurityEvent::logEvent(
            'ai_detected_anomaly',
            $analysis['risk_level'] === 'critical' ? 'critical' : 'high',
            [
                'ai_analysis' => $analysis,
                'anomaly_score' => $analysis['anomaly_score'],
                'detected_anomalies' => $analysis['detected_anomalies'],
                'recommendations' => $analysis['recommendations'],
            ],
            $user,
            'ai_monitoring'
        );
        
        Log::warning('AI detected suspicious activity', [
            'user_id' => $user->id,
            'anomaly_score' => $analysis['anomaly_score'],
            'risk_level' => $analysis['risk_level'],
        ]);
    }

    /**
     * تحليل التهديدات المتقدمة
     */
    public function analyzeAdvancedThreats(): array
    {
        return [
            'insider_threats' => $this->detectInsiderThreats(),
            'account_takeover' => $this->detectAccountTakeover(),
            'privilege_escalation' => $this->detectPrivilegeEscalation(),
            'data_exfiltration' => $this->detectDataExfiltration(),
        ];
    }

    /**
     * كشف التهديدات الداخلية
     */
    private function detectInsiderThreats(): array
    {
        // منطق معقد لكشف التهديدات الداخلية
        $suspiciousUsers = [];
        
        // البحث عن مستخدمين يصلون لبيانات خارج نطاق عملهم
        $users = User::with('role')->get();
        
        foreach ($users as $user) {
            $baseline = $this->getUserBaseline($user);
            $recentActivity = $this->getRecentActivity($user);
            
            $anomalyScore = $this->calculateAnomalyScore($baseline, $recentActivity);
            
            if ($anomalyScore > 0.7) {
                $suspiciousUsers[] = [
                    'user' => $user,
                    'anomaly_score' => $anomalyScore,
                    'threat_indicators' => $this->getInsiderThreatIndicators($user, $baseline, $recentActivity)
                ];
            }
        }
        
        return $suspiciousUsers;
    }

    /**
     * كشف اختطاف الحسابات
     */
    private function detectAccountTakeover(): array
    {
        // منطق لكشف اختطاف الحسابات
        return [];
    }

    /**
     * كشف تصعيد الصلاحيات
     */
    private function detectPrivilegeEscalation(): array
    {
        // منطق لكشف محاولات تصعيد الصلاحيات
        return [];
    }

    /**
     * كشف سرقة البيانات
     */
    private function detectDataExfiltration(): array
    {
        // منطق لكشف محاولات سرقة البيانات
        return [];
    }

    /**
     * Helper methods
     */
    private function getLocationFromIP(string $ip): string
    {
        // تطبيق مبسط - يمكن تطويره باستخدام خدمة GeoIP
        return 'Unknown';
    }

    private function getRecentActivity(User $user): array
    {
        // جلب النشاط الأخير للمستخدم
        return [
            'timestamp' => now(),
            'permission' => '',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'recent_activity_count' => 0,
        ];
    }

    private function getInsiderThreatIndicators(User $user, array $baseline, array $recentActivity): array
    {
        return [
            'unusual_data_access',
            'off_hours_activity',
            'permission_abuse',
        ];
    }
}