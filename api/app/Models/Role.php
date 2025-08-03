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
     * فحص الصلاحيات مع الوراثة الهرمية
     */
    public function hasPermission($permission, $resource = null)
    {
        // فحص الصلاحيات المباشرة
        if (in_array($permission, $this->permissions ?? [])) {
            return $this->checkConditions($permission, $resource);
        }

        // فحص الصلاحيات الموروثة من الأدوار الأعلى
        if ($this->is_inheritable && $this->parentRole) {
            return $this->parentRole->hasPermission($permission, $resource);
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
     * فحص الشروط الإضافية للصلاحية
     */
    protected function checkConditions($permission, $resource = null): bool
    {
        if (!$this->conditions || !isset($this->conditions[$permission])) {
            return true;
        }

        $conditions = $this->conditions[$permission];

        // فحص شروط القسم
        if (isset($conditions['department']) && $resource) {
            if (is_object($resource) && method_exists($resource, 'getDepartment')) {
                if ($resource->getDepartment() !== $conditions['department']) {
                    return false;
                }
            }
        }

        // فحص شروط الوقت
        if (isset($conditions['time_restriction'])) {
            $currentHour = Carbon::now()->hour;
            $timeRestriction = $conditions['time_restriction'];
            
            if ($currentHour < $timeRestriction['start'] || $currentHour > $timeRestriction['end']) {
                return false;
            }
        }

        // فحص انتهاء صلاحية الدور
        if ($this->expires_at && Carbon::now()->gt($this->expires_at)) {
            return false;
        }

        return true;
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