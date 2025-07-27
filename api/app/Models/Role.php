<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'is_system_role',
        'permissions'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system_role' => 'boolean'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function hasAnyPermission($permissions)
    {
        if (!is_array($permissions)) {
            $permissions = [$permissions];
        }
        
        return !empty(array_intersect($permissions, $this->permissions ?? []));
    }

    public function hasAllPermissions($permissions)
    {
        if (!is_array($permissions)) {
            $permissions = [$permissions];
        }
        
        return empty(array_diff($permissions, $this->permissions ?? []));
    }
} 