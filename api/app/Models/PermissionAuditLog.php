<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PermissionAuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'permission_name',
        'action',
        'resource_type',
        'resource_id',
        'scope',
        'context',
        'result',
        'reason',
        'ip_address',
        'user_agent',
        'session_id',
        'created_at',
    ];

    protected $casts = [
        'context' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * علاقة مع المستخدم
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * الحصول على سجلات الصلاحيات المرفوضة
     */
    public static function denied()
    {
        return static::where('result', 'denied');
    }

    /**
     * الحصول على سجلات نشاط مستخدم محدد
     */
    public static function forUser($userId)
    {
        return static::where('user_id', $userId);
    }

    /**
     * الحصول على سجلات صلاحية محددة
     */
    public static function forPermission(string $permission)
    {
        return static::where('permission_name', $permission);
    }

    /**
     * الحصول على سجلات مورد محدد
     */
    public static function forResource(string $type, $id = null)
    {
        $query = static::where('resource_type', $type);
        
        if ($id !== null) {
            $query->where('resource_id', $id);
        }

        return $query;
    }

    /**
     * الحصول على الأنشطة المشبوهة
     */
    public static function suspicious()
    {
        return static::where('result', 'denied')
            ->where('created_at', '>=', Carbon::now()->subHours(24))
            ->havingRaw('COUNT(*) > 5')
            ->groupBy(['user_id', 'permission_name']);
    }

    /**
     * الحصول على إحصائيات الصلاحيات
     */
    public static function getPermissionStats(string $period = '24h')
    {
        $startTime = match($period) {
            '1h' => Carbon::now()->subHour(),
            '24h' => Carbon::now()->subDay(),
            '7d' => Carbon::now()->subWeek(),
            '30d' => Carbon::now()->subMonth(),
            default => Carbon::now()->subDay()
        };

        return static::where('created_at', '>=', $startTime)
            ->selectRaw('
                permission_name,
                result,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users
            ')
            ->groupBy(['permission_name', 'result'])
            ->get();
    }

    /**
     * الحصول على أهم المستخدمين نشاطاً
     */
    public static function getTopActiveUsers(int $limit = 10)
    {
        return static::with('user')
            ->where('created_at', '>=', Carbon::now()->subDay())
            ->selectRaw('user_id, COUNT(*) as activity_count')
            ->groupBy('user_id')
            ->orderByDesc('activity_count')
            ->limit($limit)
            ->get();
    }

    /**
     * الحصول على معلومات الموقع من IP
     */
    public function getLocationAttribute(): ?string
    {
        // يمكن تطويرها لاحقاً للحصول على الموقع من IP
        return $this->ip_address;
    }

    /**
     * الحصول على معلومات الجهاز
     */
    public function getDeviceInfoAttribute(): array
    {
        $userAgent = $this->user_agent;
        
        return [
            'browser' => $this->extractBrowser($userAgent),
            'os' => $this->extractOS($userAgent),
            'device' => $this->extractDevice($userAgent),
        ];
    }

    /**
     * استخراج معلومات المتصفح
     */
    private function extractBrowser(?string $userAgent): string
    {
        if (!$userAgent) return 'Unknown';

        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        
        return 'Other';
    }

    /**
     * استخراج معلومات نظام التشغيل
     */
    private function extractOS(?string $userAgent): string
    {
        if (!$userAgent) return 'Unknown';

        if (str_contains($userAgent, 'Windows')) return 'Windows';
        if (str_contains($userAgent, 'Mac OS')) return 'macOS';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        if (str_contains($userAgent, 'Android')) return 'Android';
        if (str_contains($userAgent, 'iOS')) return 'iOS';
        
        return 'Other';
    }

    /**
     * استخراج معلومات الجهاز
     */
    private function extractDevice(?string $userAgent): string
    {
        if (!$userAgent) return 'Unknown';

        if (str_contains($userAgent, 'Mobile')) return 'Mobile';
        if (str_contains($userAgent, 'Tablet')) return 'Tablet';
        
        return 'Desktop';
    }

    /**
     * تسجيل فحص صلاحية
     */
    public static function logPermissionCheck(
        $user,
        string $permission,
        string $result,
        array $context = []
    ): void {
        static::create([
            'user_id' => $user->id,
            'permission_name' => $permission,
            'action' => 'checked',
            'resource_type' => $context['resource_type'] ?? null,
            'resource_id' => $context['resource_id'] ?? null,
            'scope' => $context['scope'] ?? null,
            'context' => $context,
            'result' => $result,
            'reason' => $context['reason'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'created_at' => now(),
        ]);
    }
}