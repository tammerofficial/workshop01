<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class SecurityEvent extends Model
{
    protected $fillable = [
        'event_type',
        'severity',
        'user_id',
        'ip_address',
        'user_agent',
        'event_data',
        'action_taken',
        'investigated',
        'investigation_notes',
        'resolved_at',
    ];

    protected $casts = [
        'event_data' => 'array',
        'investigated' => 'boolean',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // أنواع الأحداث الأمنية
    const EVENT_TYPES = [
        'login_attempt' => 'Login Attempt',
        'failed_login' => 'Failed Login',
        'permission_violation' => 'Permission Violation',
        'suspicious_activity' => 'Suspicious Activity',
        'account_lockout' => 'Account Lockout',
        'privilege_escalation' => 'Privilege Escalation',
        'data_breach_attempt' => 'Data Breach Attempt',
        'unauthorized_access' => 'Unauthorized Access',
        'session_hijack' => 'Session Hijack Attempt',
        'brute_force' => 'Brute Force Attack',
    ];

    // مستويات الخطورة
    const SEVERITY_LEVELS = [
        'low' => 'Low',
        'medium' => 'Medium', 
        'high' => 'High',
        'critical' => 'Critical',
    ];

    /**
     * علاقة مع المستخدم
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * الحصول على الأحداث غير المحققة
     */
    public static function uninvestigated()
    {
        return static::where('investigated', false);
    }

    /**
     * الحصول على الأحداث الحرجة
     */
    public static function critical()
    {
        return static::where('severity', 'critical');
    }

    /**
     * الحصول على الأحداث لمستخدم محدد
     */
    public static function forUser($userId)
    {
        return static::where('user_id', $userId);
    }

    /**
     * الحصول على الأحداث لـ IP محدد
     */
    public static function forIP(string $ip)
    {
        return static::where('ip_address', $ip);
    }

    /**
     * الحصول على الأحداث المشبوهة الأخيرة
     */
    public static function recentSuspicious()
    {
        return static::whereIn('event_type', [
                'permission_violation',
                'suspicious_activity',
                'privilege_escalation',
                'unauthorized_access'
            ])
            ->where('created_at', '>=', Carbon::now()->subHours(24))
            ->orderByDesc('created_at');
    }

    /**
     * تسجيل حدث أمني
     */
    public static function logEvent(
        string $eventType,
        string $severity,
        array $eventData,
        $user = null,
        string $actionTaken = null
    ): static {
        return static::create([
            'event_type' => $eventType,
            'severity' => $severity,
            'user_id' => $user?->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'event_data' => $eventData,
            'action_taken' => $actionTaken,
        ]);
    }

    /**
     * تسجيل محاولة دخول فاشلة
     */
    public static function logFailedLogin(string $email, string $reason = null): static
    {
        return static::logEvent(
            'failed_login',
            'medium',
            [
                'email' => $email,
                'reason' => $reason,
                'timestamp' => now()->toISOString(),
            ]
        );
    }

    /**
     * تسجيل انتهاك صلاحيات
     */
    public static function logPermissionViolation(
        $user,
        string $permission,
        array $context = []
    ): static {
        return static::logEvent(
            'permission_violation',
            'high',
            [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'permission' => $permission,
                'context' => $context,
                'timestamp' => now()->toISOString(),
            ],
            $user,
            'logged'
        );
    }

    /**
     * تسجيل نشاط مشبوه
     */
    public static function logSuspiciousActivity(
        string $activity,
        array $details,
        $user = null
    ): static {
        return static::logEvent(
            'suspicious_activity',
            'high',
            [
                'activity' => $activity,
                'details' => $details,
                'timestamp' => now()->toISOString(),
            ],
            $user,
            'monitored'
        );
    }

    /**
     * تحديد ما إذا كان الحدث يتطلب تدخل فوري
     */
    public function requiresImmediateAction(): bool
    {
        return $this->severity === 'critical' || 
               in_array($this->event_type, [
                   'data_breach_attempt',
                   'privilege_escalation',
                   'session_hijack'
               ]);
    }

    /**
     * تحديث حالة التحقيق
     */
    public function markAsInvestigated(string $notes = null): void
    {
        $this->update([
            'investigated' => true,
            'investigation_notes' => $notes,
        ]);
    }

    /**
     * إغلاق الحدث
     */
    public function resolve(string $notes = null): void
    {
        $this->update([
            'investigated' => true,
            'resolved_at' => now(),
            'investigation_notes' => $notes,
        ]);
    }

    /**
     * الحصول على إحصائيات الأحداث الأمنية
     */
    public static function getSecurityStats()
    {
        return [
            'total_events' => static::count(),
            'critical_events' => static::where('severity', 'critical')->count(),
            'uninvestigated' => static::where('investigated', false)->count(),
            'recent_events' => static::where('created_at', '>=', Carbon::now()->subDay())->count(),
            'by_severity' => static::selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity'),
            'by_type' => static::selectRaw('event_type, COUNT(*) as count')
                ->groupBy('event_type')
                ->orderByDesc('count')
                ->limit(10)
                ->pluck('count', 'event_type'),
        ];
    }

    /**
     * البحث عن أنماط أمنية
     */
    public static function detectPatterns()
    {
        return [
            'repeated_failures' => static::where('event_type', 'permission_violation')
                ->where('created_at', '>=', now()->subHours(24))
                ->count(),
            'suspicious_ips' => static::select('ip_address')
                ->where('created_at', '>=', now()->subHours(24))
                ->groupBy('ip_address')
                ->havingRaw('COUNT(*) > 5')
                ->count(),
            'unusual_activities' => static::where('severity', '>=', 'medium')
                ->where('created_at', '>=', now()->subHours(24))
                ->count(),
        ];
    }

    /**
     * اكتشاف محاولات فاشلة متكررة
     */
    private static function detectRepeatedFailures()
    {
        return static::where('event_type', 'failed_login')
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->selectRaw('ip_address, COUNT(*) as attempts')
            ->groupBy('ip_address')
            ->having('attempts', '>', 5)
            ->get();
    }

    /**
     * اكتشاف IPs مشبوهة
     */
    private static function detectSuspiciousIPs()
    {
        return static::whereIn('event_type', [
                'permission_violation',
                'suspicious_activity',
                'unauthorized_access'
            ])
            ->where('created_at', '>=', Carbon::now()->subDay())
            ->selectRaw('ip_address, COUNT(*) as violations')
            ->groupBy('ip_address')
            ->having('violations', '>', 3)
            ->get();
    }

    /**
     * اكتشاف أنشطة غير عادية
     */
    private static function detectUnusualActivities()
    {
        return static::where('created_at', '>=', Carbon::now()->subDay())
            ->whereNotNull('user_id')
            ->selectRaw('user_id, COUNT(*) as events, COUNT(DISTINCT event_type) as event_types')
            ->groupBy('user_id')
            ->having('events', '>', 20)
            ->orHaving('event_types', '>', 5)
            ->with('user')
            ->get();
    }
}