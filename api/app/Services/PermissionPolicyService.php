<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PermissionPolicyService
{
    /**
     * تقييم الشروط الديناميكية للصلاحية
     */
    public function evaluateConditions(
        User $user,
        string $permission,
        $resource = null,
        array $context = []
    ): array {
        $role = $user->role;
        if (!$role) {
            return ['allowed' => false, 'reason' => 'No role assigned'];
        }

        $conditions = $role->conditions[$permission] ?? [];
        if (empty($conditions)) {
            return ['allowed' => true, 'reason' => 'No conditions to check'];
        }

        foreach ($conditions as $conditionType => $conditionValue) {
            $result = $this->evaluateCondition(
                $conditionType,
                $conditionValue,
                $user,
                $resource,
                $context
            );

            if (!$result['allowed']) {
                return $result;
            }
        }

        return ['allowed' => true, 'reason' => 'All conditions satisfied'];
    }

    /**
     * تقييم شرط واحد
     */
    protected function evaluateCondition(
        string $type,
        $value,
        User $user,
        $resource = null,
        array $context = []
    ): array {
        return match($type) {
            'time_restriction' => $this->evaluateTimeRestriction($value),
            'department' => $this->evaluateDepartmentRestriction($value, $user, $resource),
            'ip_restriction' => $this->evaluateIPRestriction($value),
            'device_restriction' => $this->evaluateDeviceRestriction($value),
            'location_restriction' => $this->evaluateLocationRestriction($value),
            'requires_approval' => $this->evaluateApprovalRequirement($value, $context),
            'max_duration_hours' => $this->evaluateDurationLimit($value, $context),
            'daily_limit' => $this->evaluateDailyLimit($value, $user, $permission),
            'concurrent_sessions' => $this->evaluateConcurrentSessions($value, $user),
            'minimum_role_level' => $this->evaluateMinimumRoleLevel($value, $user),
            'resource_ownership' => $this->evaluateResourceOwnership($value, $user, $resource),
            'business_hours_only' => $this->evaluateBusinessHours($value),
            'holiday_restriction' => $this->evaluateHolidayRestriction($value),
            'mfa_required' => $this->evaluateMFARequirement($value, $context),
            'vpn_required' => $this->evaluateVPNRequirement($value),
            default => ['allowed' => true, 'reason' => "Unknown condition type: {$type}"]
        };
    }

    /**
     * تقييم قيود الوقت
     */
    protected function evaluateTimeRestriction(array $timeRestriction): array
    {
        $currentHour = Carbon::now()->hour;
        $start = $timeRestriction['start'] ?? 0;
        $end = $timeRestriction['end'] ?? 23;

        if ($currentHour < $start || $currentHour > $end) {
            return [
                'allowed' => false,
                'reason' => "Access restricted outside allowed hours ({$start}:00 - {$end}:00)"
            ];
        }

        return ['allowed' => true, 'reason' => 'Within allowed time window'];
    }

    /**
     * تقييم قيود القسم
     */
    protected function evaluateDepartmentRestriction(
        string $requiredDepartment,
        User $user,
        $resource = null
    ): array {
        $userDepartment = $user->getDepartment();
        
        if ($userDepartment !== $requiredDepartment) {
            return [
                'allowed' => false,
                'reason' => "Access restricted to {$requiredDepartment} department"
            ];
        }

        // فحص انتماء المورد للقسم إذا كان متاحاً
        if ($resource && method_exists($resource, 'getDepartment')) {
            $resourceDepartment = $resource->getDepartment();
            if ($resourceDepartment !== $requiredDepartment) {
                return [
                    'allowed' => false,
                    'reason' => "Resource belongs to different department"
                ];
            }
        }

        return ['allowed' => true, 'reason' => 'Department access granted'];
    }

    /**
     * تقييم قيود IP
     */
    protected function evaluateIPRestriction(array $allowedIPs): array
    {
        $currentIP = request()->ip();
        
        foreach ($allowedIPs as $allowedIP) {
            if ($this->ipMatchesCIDR($currentIP, $allowedIP)) {
                return ['allowed' => true, 'reason' => 'IP address authorized'];
            }
        }

        return [
            'allowed' => false,
            'reason' => "IP address {$currentIP} not in allowed list"
        ];
    }

    /**
     * تقييم قيود الجهاز
     */
    protected function evaluateDeviceRestriction(array $allowedDevices): array
    {
        $userAgent = request()->userAgent();
        $deviceType = $this->getDeviceType($userAgent);

        if (!in_array($deviceType, $allowedDevices)) {
            return [
                'allowed' => false,
                'reason' => "Device type {$deviceType} not allowed"
            ];
        }

        return ['allowed' => true, 'reason' => 'Device type authorized'];
    }

    /**
     * تقييم قيود الموقع الجغرافي
     */
    protected function evaluateLocationRestriction(array $allowedCountries): array
    {
        $ip = request()->ip();
        $country = $this->getCountryFromIP($ip);

        if (!in_array($country, $allowedCountries)) {
            return [
                'allowed' => false,
                'reason' => "Location {$country} not allowed"
            ];
        }

        return ['allowed' => true, 'reason' => 'Location authorized'];
    }

    /**
     * تقييم متطلبات الموافقة
     */
    protected function evaluateApprovalRequirement(bool $required, array $context): array
    {
        if (!$required) {
            return ['allowed' => true, 'reason' => 'No approval required'];
        }

        $hasApproval = $context['has_approval'] ?? false;
        $approver = $context['approver'] ?? null;

        if (!$hasApproval) {
            return [
                'allowed' => false,
                'reason' => 'Administrative approval required'
            ];
        }

        return [
            'allowed' => true,
            'reason' => "Approved by {$approver}"
        ];
    }

    /**
     * تقييم حدود المدة الزمنية
     */
    protected function evaluateDurationLimit(int $maxHours, array $context): array
    {
        $sessionStart = $context['session_start'] ?? Carbon::now();
        $elapsed = Carbon::now()->diffInHours(Carbon::parse($sessionStart));

        if ($elapsed > $maxHours) {
            return [
                'allowed' => false,
                'reason' => "Session duration exceeded {$maxHours} hours limit"
            ];
        }

        return [
            'allowed' => true,
            'reason' => "Within {$maxHours} hours duration limit"
        ];
    }

    /**
     * تقييم الحد اليومي
     */
    protected function evaluateDailyLimit(int $dailyLimit, User $user, string $permission): array
    {
        $today = Carbon::today();
        $usageCount = \App\Models\PermissionAuditLog::where('user_id', $user->id)
            ->where('permission_name', $permission)
            ->where('result', 'success')
            ->whereDate('created_at', $today)
            ->count();

        if ($usageCount >= $dailyLimit) {
            return [
                'allowed' => false,
                'reason' => "Daily limit of {$dailyLimit} uses exceeded"
            ];
        }

        return [
            'allowed' => true,
            'reason' => "Within daily limit ({$usageCount}/{$dailyLimit})"
        ];
    }

    /**
     * تقييم الجلسات المتزامنة
     */
    protected function evaluateConcurrentSessions(int $maxSessions, User $user): array
    {
        // هذا يتطلب نظام إدارة الجلسات - مبسط هنا
        $activeSessions = 1; // يمكن تطويره لاحقاً

        if ($activeSessions > $maxSessions) {
            return [
                'allowed' => false,
                'reason' => "Maximum {$maxSessions} concurrent sessions allowed"
            ];
        }

        return ['allowed' => true, 'reason' => 'Within concurrent sessions limit'];
    }

    /**
     * تقييم الحد الأدنى لمستوى الدور
     */
    protected function evaluateMinimumRoleLevel(int $minLevel, User $user): array
    {
        $userLevel = $user->role?->hierarchy_level ?? 999;

        if ($userLevel > $minLevel) {
            return [
                'allowed' => false,
                'reason' => "Requires minimum role level {$minLevel}"
            ];
        }

        return ['allowed' => true, 'reason' => 'Role level sufficient'];
    }

    /**
     * تقييم ملكية المورد
     */
    protected function evaluateResourceOwnership(bool $required, User $user, $resource): array
    {
        if (!$required || !$resource) {
            return ['allowed' => true, 'reason' => 'Resource ownership not required'];
        }

        $ownershipProperties = ['user_id', 'created_by', 'assigned_to', 'owner_id'];
        
        foreach ($ownershipProperties as $property) {
            if (isset($resource->$property) && $resource->$property == $user->id) {
                return ['allowed' => true, 'reason' => 'Resource owned by user'];
            }
        }

        return [
            'allowed' => false,
            'reason' => 'Resource not owned by user'
        ];
    }

    /**
     * تقييم ساعات العمل فقط
     */
    protected function evaluateBusinessHours(bool $required): array
    {
        if (!$required) {
            return ['allowed' => true, 'reason' => 'Business hours not required'];
        }

        $now = Carbon::now();
        $isWeekend = $now->isWeekend();
        $hour = $now->hour;
        $isBusinessHours = !$isWeekend && $hour >= 8 && $hour <= 17;

        if (!$isBusinessHours) {
            return [
                'allowed' => false,
                'reason' => 'Access restricted to business hours (8 AM - 5 PM, weekdays)'
            ];
        }

        return ['allowed' => true, 'reason' => 'Within business hours'];
    }

    /**
     * تقييم قيود العطل
     */
    protected function evaluateHolidayRestriction(bool $restricted): array
    {
        if (!$restricted) {
            return ['allowed' => true, 'reason' => 'Holiday restriction not applied'];
        }

        $isHoliday = $this->isHoliday(Carbon::now());

        if ($isHoliday) {
            return [
                'allowed' => false,
                'reason' => 'Access restricted during holidays'
            ];
        }

        return ['allowed' => true, 'reason' => 'Not a holiday'];
    }

    /**
     * تقييم متطلبات المصادقة الثنائية
     */
    protected function evaluateMFARequirement(bool $required, array $context): array
    {
        if (!$required) {
            return ['allowed' => true, 'reason' => 'MFA not required'];
        }

        $hasMFA = $context['mfa_verified'] ?? false;

        if (!$hasMFA) {
            return [
                'allowed' => false,
                'reason' => 'Multi-factor authentication required'
            ];
        }

        return ['allowed' => true, 'reason' => 'MFA verified'];
    }

    /**
     * تقييم متطلبات VPN
     */
    protected function evaluateVPNRequirement(bool $required): array
    {
        if (!$required) {
            return ['allowed' => true, 'reason' => 'VPN not required'];
        }

        $isVPN = $this->isVPNConnection(request()->ip());

        if (!$isVPN) {
            return [
                'allowed' => false,
                'reason' => 'VPN connection required'
            ];
        }

        return ['allowed' => true, 'reason' => 'VPN connection detected'];
    }

    /**
     * Helper methods
     */
    protected function ipMatchesCIDR(string $ip, string $cidr): bool
    {
        if (!str_contains($cidr, '/')) {
            return $ip === $cidr;
        }

        [$subnet, $mask] = explode('/', $cidr);
        return (ip2long($ip) & ~((1 << (32 - $mask)) - 1)) === ip2long($subnet);
    }

    protected function getDeviceType(string $userAgent): string
    {
        if (str_contains($userAgent, 'Mobile')) return 'mobile';
        if (str_contains($userAgent, 'Tablet')) return 'tablet';
        return 'desktop';
    }

    protected function getCountryFromIP(string $ip): string
    {
        // تطبيق مبسط - يمكن دمج خدمة GeoIP
        return 'Unknown';
    }

    protected function isHoliday(Carbon $date): bool
    {
        // تطبيق مبسط - يمكن دمج قاعدة بيانات العطل
        return false;
    }

    protected function isVPNConnection(string $ip): bool
    {
        // تطبيق مبسط - يمكن دمج خدمة فحص VPN
        return false;
    }
}