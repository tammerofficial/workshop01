<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'action'
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public static function getAvailablePermissions()
    {
        return [
            // Dashboard
            'dashboard.view' => [
                'display_name' => 'View Dashboard',
                'description' => 'Access to view dashboard and statistics',
                'module' => 'Dashboard',
                'action' => 'view'
            ],
            'dashboard.edit' => [
                'display_name' => 'Edit Dashboard',
                'description' => 'Ability to customize dashboard widgets and layout',
                'module' => 'Dashboard',
                'action' => 'edit'
            ],

            // Orders
            'orders.view' => [
                'display_name' => 'View Orders',
                'description' => 'Access to view all orders',
                'module' => 'Orders',
                'action' => 'view'
            ],
            'orders.create' => [
                'display_name' => 'Create Orders',
                'description' => 'Ability to create new orders',
                'module' => 'Orders',
                'action' => 'create'
            ],
            'orders.edit' => [
                'display_name' => 'Edit Orders',
                'description' => 'Ability to modify existing orders',
                'module' => 'Orders',
                'action' => 'edit'
            ],
            'orders.delete' => [
                'display_name' => 'Delete Orders',
                'description' => 'Ability to delete orders',
                'module' => 'Orders',
                'action' => 'delete'
            ],

            // Inventory
            'inventory.view' => [
                'display_name' => 'View Inventory',
                'description' => 'Access to view inventory items',
                'module' => 'Inventory',
                'action' => 'view'
            ],
            'inventory.create' => [
                'display_name' => 'Create Inventory',
                'description' => 'Ability to add new inventory items',
                'module' => 'Inventory',
                'action' => 'create'
            ],
            'inventory.edit' => [
                'display_name' => 'Edit Inventory',
                'description' => 'Ability to modify inventory items',
                'module' => 'Inventory',
                'action' => 'edit'
            ],
            'inventory.delete' => [
                'display_name' => 'Delete Inventory',
                'description' => 'Ability to delete inventory items',
                'module' => 'Inventory',
                'action' => 'delete'
            ],

            // Workers
            'workers.view' => [
                'display_name' => 'View Workers',
                'description' => 'Access to view worker profiles',
                'module' => 'Workers',
                'action' => 'view'
            ],
            'workers.create' => [
                'display_name' => 'Create Workers',
                'description' => 'Ability to add new workers',
                'module' => 'Workers',
                'action' => 'create'
            ],
            'workers.edit' => [
                'display_name' => 'Edit Workers',
                'description' => 'Ability to modify worker information',
                'module' => 'Workers',
                'action' => 'edit'
            ],
            'workers.delete' => [
                'display_name' => 'Delete Workers',
                'description' => 'Ability to remove workers',
                'module' => 'Workers',
                'action' => 'delete'
            ],

            // Reports & Analytics
            'reports.view' => [
                'display_name' => 'View Reports',
                'description' => 'Access to view reports and analytics',
                'module' => 'Reports',
                'action' => 'view'
            ],
            'reports.export' => [
                'display_name' => 'Export Reports',
                'description' => 'Ability to export reports',
                'module' => 'Reports',
                'action' => 'export'
            ],

            // Settings
            'settings.view' => [
                'display_name' => 'View Settings',
                'description' => 'Access to view system settings',
                'module' => 'Settings',
                'action' => 'view'
            ],
            'settings.edit' => [
                'display_name' => 'Edit Settings',
                'description' => 'Ability to modify system settings',
                'module' => 'Settings',
                'action' => 'edit'
            ],

            // User Management
            'users.view' => [
                'display_name' => 'View Users',
                'description' => 'Access to view system users',
                'module' => 'Users',
                'action' => 'view'
            ],
            'users.create' => [
                'display_name' => 'Create Users',
                'description' => 'Ability to add new users',
                'module' => 'Users',
                'action' => 'create'
            ],
            'users.edit' => [
                'display_name' => 'Edit Users',
                'description' => 'Ability to modify user information',
                'module' => 'Users',
                'action' => 'edit'
            ],
            'users.delete' => [
                'display_name' => 'Delete Users',
                'description' => 'Ability to remove users',
                'module' => 'Users',
                'action' => 'delete'
            ],

            // Clients
            'clients.view' => [
                'display_name' => 'View Clients',
                'description' => 'Access to view client profiles',
                'module' => 'Clients',
                'action' => 'view'
            ],
            'clients.create' => [
                'display_name' => 'Create Clients',
                'description' => 'Ability to add new clients',
                'module' => 'Clients',
                'action' => 'create'
            ],
            'clients.edit' => [
                'display_name' => 'Edit Clients',
                'description' => 'Ability to modify client information',
                'module' => 'Clients',
                'action' => 'edit'
            ],
            'clients.delete' => [
                'display_name' => 'Delete Clients',
                'description' => 'Ability to remove clients',
                'module' => 'Clients',
                'action' => 'delete'
            ],

            // Production
            'production.view' => [
                'display_name' => 'View Production',
                'description' => 'Access to view production tracking',
                'module' => 'Production',
                'action' => 'view'
            ],
            'production.edit' => [
                'display_name' => 'Edit Production',
                'description' => 'Ability to modify production stages',
                'module' => 'Production',
                'action' => 'edit'
            ],

            // Calendar
            'calendar.view' => [
                'display_name' => 'View Calendar',
                'description' => 'Access to view calendar and schedules',
                'module' => 'Calendar',
                'action' => 'view'
            ],
            'calendar.edit' => [
                'display_name' => 'Edit Calendar',
                'description' => 'Ability to modify calendar events',
                'module' => 'Calendar',
                'action' => 'edit'
            ],

            // Analytics
            'analytics.view' => [
                'display_name' => 'View Analytics',
                'description' => 'Access to view analytics and statistics',
                'module' => 'Analytics',
                'action' => 'view'
            ],

            // Backup & Restore
            'backup.view' => [
                'display_name' => 'View Backups',
                'description' => 'Access to view system backups',
                'module' => 'Backup',
                'action' => 'view'
            ],
            'backup.create' => [
                'display_name' => 'Create Backups',
                'description' => 'Ability to create system backups',
                'module' => 'Backup',
                'action' => 'create'
            ],
            'backup.restore' => [
                'display_name' => 'Restore Backups',
                'description' => 'Ability to restore system from backups',
                'module' => 'Backup',
                'action' => 'restore'
            ],

            // WooCommerce Integration
            'woocommerce.view' => [
                'display_name' => 'View WooCommerce',
                'description' => 'Access to view WooCommerce integration',
                'module' => 'WooCommerce',
                'action' => 'view'
            ],
            'woocommerce.sync' => [
                'display_name' => 'Sync WooCommerce',
                'description' => 'Ability to sync WooCommerce data',
                'module' => 'WooCommerce',
                'action' => 'sync'
            ]
        ];
    }
} 