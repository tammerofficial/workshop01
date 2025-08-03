<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'parent_role_id',
        'hierarchy_level',
        'priority',
        'department',
        'is_system_role',
        'is_inheritable',
        'permissions',
        'conditions',
        'expires_at'
    ];

    protected $casts = [
        'permissions' => 'array',
        'conditions' => 'array',
        'is_system_role' => 'boolean',
        'is_inheritable' => 'boolean',
        'expires_at' => 'datetime',
        'hierarchy_level' => 'integer',
        'priority' => 'integer'
    ];

    /**
     * علاقات النموذج
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function parentRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'parent_role_id');
    }

    public function childRoles(): HasMany
    {
        return $this->hasMany(Role::class, 'parent_role_id');
    }

    public function allChildRoles()
    {
        return $this->childRoles()->with('allChildRoles');
    }

    /**
     * فحص الصلاحيات مع الوراثة الهرمية والشروط المتقدمة
     */
    public function hasPermission($permission, $resource = null, array $context = [])
    {
        // فحص الصلاحيات المباشرة
        if (in_array($permission, $this->permissions ?? [])) {
            $conditionsResult = $this->checkAdvancedConditions($permission, $resource, $context);
            return $conditionsResult['allowed'];
        }

        // فحص الصلاحيات الموروثة من الأدوار الأعلى
        if ($this->is_inheritable && $this->parentRole) {
            return $this->parentRole->hasPermission($permission, $resource, $context);
        }

        return false;
    }

    public function hasAnyPermission($permissions, $resource = null)
    {
        if (!is_array($permissions)) {
            $permissions = [$permissions];
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission, $resource)) {
                return true;
            }
        }

        return false;
    }

    public function hasAllPermissions($permissions, $resource = null)
    {
        if (!is_array($permissions)) {
            $permissions = [$permissions];
        }

        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission, $resource)) {
                return false;
            }
        }

        return true;
    }

    /**
     * الحصول على جميع الصلاحيات (مباشرة وموروثة)
     */
    public function getAllPermissions(): array
    {
        $permissions = $this->permissions ?? [];

        // إضافة الصلاحيات الموروثة
        if ($this->is_inheritable && $this->parentRole) {
            $parentPermissions = $this->parentRole->getAllPermissions();
            $permissions = array_unique(array_merge($permissions, $parentPermissions));
        }

        return $permissions;
    }

    /**
     * فحص الشروط المتقدمة للصلاحية
     */
    protected function checkAdvancedConditions($permission, $resource = null, array $context = []): array
    {
        // فحص انتهاء صلاحية الدور
        if ($this->expires_at && Carbon::now()->gt($this->expires_at)) {
            return [
                'allowed' => false,
                'reason' => 'Role has expired'
            ];
        }

        // إذا لم تكن هناك شروط محددة، السماح بالوصول
        if (!$this->conditions || !isset($this->conditions[$permission])) {
            return ['allowed' => true, 'reason' => 'No conditions to check'];
        }

        // استخدام خدمة تقييم الشروط المتقدمة
        $policyService = app(\App\Services\PermissionPolicyService::class);
        $user = $context['user'] ?? auth()->user();
        
        if (!$user) {
            return [
                'allowed' => false,
                'reason' => 'No authenticated user found'
            ];
        }

        return $policyService->evaluateConditions(
            $user,
            $permission,
            $resource,
            $context
        );
    }

    /**
     * فحص الشروط الإضافية للصلاحية (للتوافق مع النماذج السابقة)
     */
    protected function checkConditions($permission, $resource = null): bool
    {
        $result = $this->checkAdvancedConditions($permission, $resource);
        return $result['allowed'];
    }

    /**
     * الحصول على الأدوار بترتيب هرمي
     */
    public static function getHierarchicalRoles()
    {
        return static::with(['parentRole', 'childRoles'])
            ->orderBy('hierarchy_level')
            ->orderBy('priority')
            ->get();
    }

    /**
     * الحصول على الأدوار الجذر (بدون أدوار أب)
     */
    public static function getRootRoles()
    {
        return static::whereNull('parent_role_id')
            ->orderBy('priority')
            ->get();
    }

    /**
     * فحص ما إذا كان الدور يمكن أن يرث من دور آخر
     */
    public function canInheritFrom(Role $role): bool
    {
        // لا يمكن الوراثة من نفس الدور
        if ($this->id === $role->id) {
            return false;
        }

        // لا يمكن الوراثة إذا كان الدور الحالي أعلى في التسلسل الهرمي
        if ($this->hierarchy_level <= $role->hierarchy_level) {
            return false;
        }

        // فحص عدم وجود دائرة في التسلسل الهرمي
        return !$this->isDescendantOf($role);
    }

    /**
     * فحص ما إذا كان الدور من أحفاد دور آخر
     */
    public function isDescendantOf(Role $role): bool
    {
        $currentParent = $this->parentRole;
        
        while ($currentParent) {
            if ($currentParent->id === $role->id) {
                return true;
            }
            $currentParent = $currentParent->parentRole;
        }

        return false;
    }

    /**
     * تحديث مستوى التسلسل الهرمي تلقائياً
     */
    public function updateHierarchyLevel(): void
    {
        if ($this->parentRole) {
            $this->hierarchy_level = $this->parentRole->hierarchy_level + 1;
        } else {
            $this->hierarchy_level = 0;
        }

        $this->save();

        // تحديث مستويات الأدوار الفرعية
        $this->childRoles->each(function ($childRole) {
            $childRole->updateHierarchyLevel();
        });
    }

    /**
     * إضافة صلاحية مع شروط
     */
    public function addPermissionWithConditions(string $permission, array $conditions = []): void
    {
        $permissions = $this->permissions ?? [];
        
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
        }

        if (!empty($conditions)) {
            $roleConditions = $this->conditions ?? [];
            $roleConditions[$permission] = $conditions;
            $this->conditions = $roleConditions;
        }

        $this->save();
    }

    /**
     * إزالة صلاحية
     */
    public function removePermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_diff($permissions, [$permission]);
        $this->permissions = array_values($permissions);

        // إزالة الشروط المرتبطة بالصلاحية
        if ($this->conditions && isset($this->conditions[$permission])) {
            $conditions = $this->conditions;
            unset($conditions[$permission]);
            $this->conditions = $conditions;
        }

        $this->save();
    }
} 