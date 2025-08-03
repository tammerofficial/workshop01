<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plugin extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'version',
        'author',
        'author_email',
        'status',
        'config',
        'dependencies',
        'permissions',
        'routes',
        'hooks',
        'assets',
        'install_date',
        'last_update',
        'compatibility_version',
        'priority',
        'category',
    ];

    protected $casts = [
        'config' => 'array',
        'dependencies' => 'array',
        'permissions' => 'array',
        'routes' => 'array',
        'hooks' => 'array',
        'assets' => 'array',
        'install_date' => 'datetime',
        'last_update' => 'datetime',
        'status' => 'boolean',
        'priority' => 'integer',
    ];

    // Plugin statuses
    const STATUS_ACTIVE = true;
    const STATUS_INACTIVE = false;

    // Plugin categories
    const CATEGORIES = [
        'automation',
        'integrations',
        'reporting',
        'communication',
        'security',
        'productivity',
        'manufacturing',
        'inventory',
        'hr',
        'finance',
        'other'
    ];

    /**
     * Scope for active plugins
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for plugins by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Check if plugin is compatible with current system version
     */
    public function isCompatible($systemVersion = null): bool
    {
        if (!$systemVersion) {
            $systemVersion = config('app.version', '1.0.0');
        }
        
        return version_compare($systemVersion, $this->compatibility_version, '>=');
    }

    /**
     * Get plugin configuration value
     */
    public function getConfig($key = null, $default = null)
    {
        if ($key === null) {
            return $this->config ?? [];
        }
        
        return data_get($this->config, $key, $default);
    }

    /**
     * Set plugin configuration value
     */
    public function setConfig($key, $value = null)
    {
        if (is_array($key)) {
            $this->config = array_merge($this->config ?? [], $key);
        } else {
            $config = $this->config ?? [];
            data_set($config, $key, $value);
            $this->config = $config;
        }
        
        return $this;
    }

    /**
     * Check if plugin has required permissions
     */
    public function hasPermission($permission): bool
    {
        return in_array($permission, $this->permissions ?? []);
    }

    /**
     * Get plugin hooks for specific event
     */
    public function getHooks($event = null): array
    {
        if ($event === null) {
            return $this->hooks ?? [];
        }
        
        return collect($this->hooks ?? [])
            ->where('event', $event)
            ->all();
    }
}
