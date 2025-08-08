<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'department',
        'is_active',
        'last_login_at',
        'last_activity',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'last_activity' => 'datetime',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function worker()
    {
        return $this->hasOne(Worker::class);
    }

    public function hasPermission($permission, $resource = null)
    {
        return $this->role && $this->role->hasPermission($permission, $resource);
    }

    public function hasAnyPermission($permissions, $resource = null)
    {
        return $this->role && $this->role->hasAnyPermission($permissions, $resource);
    }

    public function hasAllPermissions($permissions, $resource = null)
    {
        return $this->role && $this->role->hasAllPermissions($permissions, $resource);
    }

    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * فحص ما إذا كان المستخدم لديه أي من الأدوار المحددة
     */
    public function hasAnyRole($roles)
    {
        if (!$this->role) {
            return false;
        }

        if (!is_array($roles)) {
            $roles = [$roles];
        }

        // فحص الدور المباشر
        if (in_array($this->role->name, $roles)) {
            return true;
        }

        // فحص الأدوار الأب (الوراثة)
        $currentRole = $this->role->parentRole;
        while ($currentRole) {
            if (in_array($currentRole->name, $roles)) {
                return true;
            }
            $currentRole = $currentRole->parentRole;
        }

        return false;
    }

    /**
     * الحصول على جميع الصلاحيات للمستخدم
     */
    public function getAllPermissions(): array
    {
        if (!$this->role) {
            return [];
        }

        return $this->role->getAllPermissions();
    }

    /**
     * فحص ما إذا كان المستخدم يمكنه الوصول إلى مورد معين
     */
    public function canAccess($resource, $action = 'view')
    {
        if (!$this->role) {
            return false;
        }

        // تحديد اسم الصلاحية المطلوبة
        $resourceType = is_object($resource) ? class_basename($resource) : $resource;
        $permission = strtolower($resourceType) . '.' . $action;

        return $this->hasPermission($permission, $resource);
    }

    /**
     * فحص ما إذا كان المستخدم يمكنه إدارة مستخدم آخر
     */
    public function canManageUser(User $targetUser): bool
    {
        // المدير العام يمكنه إدارة الجميع
        if ($this->hasRole('administrator')) {
            return true;
        }

        // المستخدم لا يمكنه إدارة نفسه بهذه الطريقة
        if ($this->id === $targetUser->id) {
            return false;
        }

        // فحص التسلسل الهرمي
        if ($this->role && $targetUser->role) {
            return $this->role->hierarchy_level < $targetUser->role->hierarchy_level;
        }

        return false;
    }

    /**
     * فحص ما إذا كان المستخدم ينتمي لقسم معين
     */
    public function belongsToDepartment(string $department): bool
    {
        return $this->role && $this->role->department === $department;
    }

    /**
     * الحصول على قسم المستخدم
     */
    public function getDepartment(): ?string
    {
        return $this->role ? $this->role->department : null;
    }
}
