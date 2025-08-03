<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permission extends Model
{
    protected $fillable = ['name', 'display_name', 'description', 'module', 'action'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all available permissions in the system
     */
    public static function getAvailablePermissions(): array
    {
        return [
            // Dashboard Permissions
            'dashboard.view' => [
                'name' => 'dashboard.view',
                'display_name' => 'View Dashboard',
                'description' => 'Access to main dashboard',
                'module' => 'dashboard',
                'action' => 'view'
            ],
            'dashboard.customize' => [
                'name' => 'dashboard.customize',
                'display_name' => 'Customize Dashboard',
                'description' => 'Customize dashboard layout and widgets',
                'module' => 'dashboard',
                'action' => 'customize'
            ],

            // Users & Authentication
            'users.view' => [
                'name' => 'users.view',
                'display_name' => 'View Users',
                'description' => 'View user list and details',
                'module' => 'users',
                'action' => 'view'
            ],
            'users.create' => [
                'name' => 'users.create',
                'display_name' => 'Create Users',
                'description' => 'Create new users',
                'module' => 'users',
                'action' => 'create'
            ],
            'users.edit' => [
                'name' => 'users.edit',
                'display_name' => 'Edit Users',
                'description' => 'Edit existing users',
                'module' => 'users',
                'action' => 'edit'
            ],
            'users.delete' => [
                'name' => 'users.delete',
                'display_name' => 'Delete Users',
                'description' => 'Delete users from system',
                'module' => 'users',
                'action' => 'delete'
            ],

            // Orders Management
            'orders.view' => [
                'name' => 'orders.view',
                'display_name' => 'View Orders',
                'description' => 'View orders and order details',
                'module' => 'orders',
                'action' => 'view'
            ],
            'orders.create' => [
                'name' => 'orders.create',
                'display_name' => 'Create Orders',
                'description' => 'Create new orders',
                'module' => 'orders',
                'action' => 'create'
            ],
            'orders.edit' => [
                'name' => 'orders.edit',
                'display_name' => 'Edit Orders',
                'description' => 'Modify existing orders',
                'module' => 'orders',
                'action' => 'edit'
            ],
            'orders.delete' => [
                'name' => 'orders.delete',
                'display_name' => 'Delete Orders',
                'description' => 'Delete orders from system',
                'module' => 'orders',
                'action' => 'delete'
            ],

            // Production Management
            'production.view' => [
                'name' => 'production.view',
                'display_name' => 'View Production',
                'description' => 'View production processes and stages',
                'module' => 'production',
                'action' => 'view'
            ],
            'production.edit' => [
                'name' => 'production.edit',
                'display_name' => 'Edit Production',
                'description' => 'Modify production processes',
                'module' => 'production',
                'action' => 'edit'
            ],
            'production.manage' => [
                'name' => 'production.manage',
                'display_name' => 'Manage Production',
                'description' => 'Full production management access',
                'module' => 'production',
                'action' => 'manage'
            ],

            // Inventory Management
            'inventory.view' => [
                'name' => 'inventory.view',
                'display_name' => 'View Inventory',
                'description' => 'View inventory items and stock levels',
                'module' => 'inventory',
                'action' => 'view'
            ],
            'inventory.create' => [
                'name' => 'inventory.create',
                'display_name' => 'Create Inventory Items',
                'description' => 'Add new inventory items',
                'module' => 'inventory',
                'action' => 'create'
            ],
            'inventory.edit' => [
                'name' => 'inventory.edit',
                'display_name' => 'Edit Inventory',
                'description' => 'Modify inventory items and stock',
                'module' => 'inventory',
                'action' => 'edit'
            ],
            'inventory.manage' => [
                'name' => 'inventory.manage',
                'display_name' => 'Manage Inventory',
                'description' => 'Full inventory management access',
                'module' => 'inventory',
                'action' => 'manage'
            ],

            // Workers Management
            'workers.view' => [
                'name' => 'workers.view',
                'display_name' => 'View Workers',
                'description' => 'View worker information',
                'module' => 'workers',
                'action' => 'view'
            ],
            'workers.create' => [
                'name' => 'workers.create',
                'display_name' => 'Create Workers',
                'description' => 'Add new workers',
                'module' => 'workers',
                'action' => 'create'
            ],
            'workers.edit' => [
                'name' => 'workers.edit',
                'display_name' => 'Edit Workers',
                'description' => 'Modify worker information',
                'module' => 'workers',
                'action' => 'edit'
            ],
            'workers.manage' => [
                'name' => 'workers.manage',
                'display_name' => 'Manage Workers',
                'description' => 'Full worker management access',
                'module' => 'workers',
                'action' => 'manage'
            ],

            // Clients Management
            'clients.view' => [
                'name' => 'clients.view',
                'display_name' => 'View Clients',
                'description' => 'View client information',
                'module' => 'clients',
                'action' => 'view'
            ],
            'clients.create' => [
                'name' => 'clients.create',
                'display_name' => 'Create Clients',
                'description' => 'Add new clients',
                'module' => 'clients',
                'action' => 'create'
            ],
            'clients.edit' => [
                'name' => 'clients.edit',
                'display_name' => 'Edit Clients',
                'description' => 'Modify client information',
                'module' => 'clients',
                'action' => 'edit'
            ],

            // Reports & Analytics
            'reports.view' => [
                'name' => 'reports.view',
                'display_name' => 'View Reports',
                'description' => 'Access reports and analytics',
                'module' => 'reports',
                'action' => 'view'
            ],
            'reports.export' => [
                'name' => 'reports.export',
                'display_name' => 'Export Reports',
                'description' => 'Export reports to various formats',
                'module' => 'reports',
                'action' => 'export'
            ],
            'analytics.view' => [
                'name' => 'analytics.view',
                'display_name' => 'View Analytics',
                'description' => 'Access analytics and metrics',
                'module' => 'analytics',
                'action' => 'view'
            ],

            // Calendar & Tasks
            'calendar.view' => [
                'name' => 'calendar.view',
                'display_name' => 'View Calendar',
                'description' => 'Access calendar and schedules',
                'module' => 'calendar',
                'action' => 'view'
            ],
            'calendar.edit' => [
                'name' => 'calendar.edit',
                'display_name' => 'Edit Calendar',
                'description' => 'Modify calendar events and schedules',
                'module' => 'calendar',
                'action' => 'edit'
            ],
            'tasks.view' => [
                'name' => 'tasks.view',
                'display_name' => 'View Tasks',
                'description' => 'View assigned tasks',
                'module' => 'tasks',
                'action' => 'view'
            ],
            'tasks.update' => [
                'name' => 'tasks.update',
                'display_name' => 'Update Tasks',
                'description' => 'Update task status and progress',
                'module' => 'tasks',
                'action' => 'update'
            ],

            // Financial Management
            'payroll.view' => [
                'name' => 'payroll.view',
                'display_name' => 'View Payroll',
                'description' => 'Access payroll information',
                'module' => 'payroll',
                'action' => 'view'
            ],
            'payroll.manage' => [
                'name' => 'payroll.manage',
                'display_name' => 'Manage Payroll',
                'description' => 'Full payroll management access',
                'module' => 'payroll',
                'action' => 'manage'
            ],
            'invoices.view' => [
                'name' => 'invoices.view',
                'display_name' => 'View Invoices',
                'description' => 'Access invoice information',
                'module' => 'invoices',
                'action' => 'view'
            ],
            'invoices.create' => [
                'name' => 'invoices.create',
                'display_name' => 'Create Invoices',
                'description' => 'Create new invoices',
                'module' => 'invoices',
                'action' => 'create'
            ],
            'invoices.edit' => [
                'name' => 'invoices.edit',
                'display_name' => 'Edit Invoices',
                'description' => 'Modify existing invoices',
                'module' => 'invoices',
                'action' => 'edit'
            ],

            // System Settings
            'settings.manage' => [
                'name' => 'settings.manage',
                'display_name' => 'Manage Settings',
                'description' => 'Access and modify system settings',
                'module' => 'settings',
                'action' => 'manage'
            ],
            'roles.view' => [
                'name' => 'roles.view',
                'display_name' => 'View Roles',
                'description' => 'View system roles',
                'module' => 'roles',
                'action' => 'view'
            ],
            'roles.manage' => [
                'name' => 'roles.manage',
                'display_name' => 'Manage Roles',
                'description' => 'Create and modify user roles',
                'module' => 'roles',
                'action' => 'manage'
            ],
            'permissions.manage' => [
                'name' => 'permissions.manage',
                'display_name' => 'Manage Permissions',
                'description' => 'Manage system permissions',
                'module' => 'permissions',
                'action' => 'manage'
            ],

            // Enhanced Orders Management with Resource Levels
            'orders.view.own' => [
                'name' => 'orders.view.own',
                'display_name' => 'View Own Orders',
                'description' => 'View only orders created by the user',
                'module' => 'orders',
                'action' => 'view',
                'scope' => 'own'
            ],
            'orders.view.department' => [
                'name' => 'orders.view.department',
                'display_name' => 'View Department Orders',
                'description' => 'View orders within user department',
                'module' => 'orders',
                'action' => 'view',
                'scope' => 'department'
            ],
            'orders.view.all' => [
                'name' => 'orders.view.all',
                'display_name' => 'View All Orders',
                'description' => 'View all orders in the system',
                'module' => 'orders',
                'action' => 'view',
                'scope' => 'all'
            ],
            'orders.edit.own' => [
                'name' => 'orders.edit.own',
                'display_name' => 'Edit Own Orders',
                'description' => 'Edit only orders created by the user',
                'module' => 'orders',
                'action' => 'edit',
                'scope' => 'own'
            ],
            'orders.edit.department' => [
                'name' => 'orders.edit.department',
                'display_name' => 'Edit Department Orders',
                'description' => 'Edit orders within user department',
                'module' => 'orders',
                'action' => 'edit',
                'scope' => 'department'
            ],
            'orders.edit.all' => [
                'name' => 'orders.edit.all',
                'display_name' => 'Edit All Orders',
                'description' => 'Edit all orders in the system',
                'module' => 'orders',
                'action' => 'edit',
                'scope' => 'all'
            ],
            'orders.approve' => [
                'name' => 'orders.approve',
                'display_name' => 'Approve Orders',
                'description' => 'Approve or reject orders',
                'module' => 'orders',
                'action' => 'approve'
            ],
            'orders.cancel' => [
                'name' => 'orders.cancel',
                'display_name' => 'Cancel Orders',
                'description' => 'Cancel existing orders',
                'module' => 'orders',
                'action' => 'cancel'
            ],

            // Enhanced Production Management
            'production.view.assigned' => [
                'name' => 'production.view.assigned',
                'display_name' => 'View Assigned Production',
                'description' => 'View production tasks assigned to user',
                'module' => 'production',
                'action' => 'view',
                'scope' => 'assigned'
            ],
            'production.view.department' => [
                'name' => 'production.view.department',
                'display_name' => 'View Department Production',
                'description' => 'View production within department',
                'module' => 'production',
                'action' => 'view',
                'scope' => 'department'
            ],
            'production.view.all' => [
                'name' => 'production.view.all',
                'display_name' => 'View All Production',
                'description' => 'View all production processes',
                'module' => 'production',
                'action' => 'view',
                'scope' => 'all'
            ],
            'production.update.assigned' => [
                'name' => 'production.update.assigned',
                'display_name' => 'Update Assigned Production',
                'description' => 'Update production tasks assigned to user',
                'module' => 'production',
                'action' => 'update',
                'scope' => 'assigned'
            ],
            'production.manage.department' => [
                'name' => 'production.manage.department',
                'display_name' => 'Manage Department Production',
                'description' => 'Full production management within department',
                'module' => 'production',
                'action' => 'manage',
                'scope' => 'department'
            ],
            'production.manage.all' => [
                'name' => 'production.manage.all',
                'display_name' => 'Manage All Production',
                'description' => 'Full production management access',
                'module' => 'production',
                'action' => 'manage',
                'scope' => 'all'
            ],

            // Enhanced Workers Management
            'workers.view.own' => [
                'name' => 'workers.view.own',
                'display_name' => 'View Own Profile',
                'description' => 'View own worker profile',
                'module' => 'workers',
                'action' => 'view',
                'scope' => 'own'
            ],
            'workers.view.department' => [
                'name' => 'workers.view.department',
                'display_name' => 'View Department Workers',
                'description' => 'View workers within department',
                'module' => 'workers',
                'action' => 'view',
                'scope' => 'department'
            ],
            'workers.view.all' => [
                'name' => 'workers.view.all',
                'display_name' => 'View All Workers',
                'description' => 'View all workers in the system',
                'module' => 'workers',
                'action' => 'view',
                'scope' => 'all'
            ],
            'workers.manage.department' => [
                'name' => 'workers.manage.department',
                'display_name' => 'Manage Department Workers',
                'description' => 'Manage workers within department',
                'module' => 'workers',
                'action' => 'manage',
                'scope' => 'department'
            ],
            'workers.manage.all' => [
                'name' => 'workers.manage.all',
                'display_name' => 'Manage All Workers',
                'description' => 'Manage all workers in the system',
                'module' => 'workers',
                'action' => 'manage',
                'scope' => 'all'
            ],

            // Enhanced Inventory Management
            'inventory.view.assigned' => [
                'name' => 'inventory.view.assigned',
                'display_name' => 'View Assigned Inventory',
                'description' => 'View inventory items assigned to user',
                'module' => 'inventory',
                'action' => 'view',
                'scope' => 'assigned'
            ],
            'inventory.view.department' => [
                'name' => 'inventory.view.department',
                'display_name' => 'View Department Inventory',
                'description' => 'View inventory within department',
                'module' => 'inventory',
                'action' => 'view',
                'scope' => 'department'
            ],
            'inventory.view.all' => [
                'name' => 'inventory.view.all',
                'display_name' => 'View All Inventory',
                'description' => 'View all inventory items',
                'module' => 'inventory',
                'action' => 'view',
                'scope' => 'all'
            ],
            'inventory.update.assigned' => [
                'name' => 'inventory.update.assigned',
                'display_name' => 'Update Assigned Inventory',
                'description' => 'Update inventory items assigned to user',
                'module' => 'inventory',
                'action' => 'update',
                'scope' => 'assigned'
            ],
            'inventory.manage.department' => [
                'name' => 'inventory.manage.department',
                'display_name' => 'Manage Department Inventory',
                'description' => 'Manage inventory within department',
                'module' => 'inventory',
                'action' => 'manage',
                'scope' => 'department'
            ],
            'inventory.manage.all' => [
                'name' => 'inventory.manage.all',
                'display_name' => 'Manage All Inventory',
                'description' => 'Full inventory management access',
                'module' => 'inventory',
                'action' => 'manage',
                'scope' => 'all'
            ],

            // Enhanced Reports & Analytics
            'reports.view.own' => [
                'name' => 'reports.view.own',
                'display_name' => 'View Own Reports',
                'description' => 'View reports related to user activities',
                'module' => 'reports',
                'action' => 'view',
                'scope' => 'own'
            ],
            'reports.view.department' => [
                'name' => 'reports.view.department',
                'display_name' => 'View Department Reports',
                'description' => 'View reports for department',
                'module' => 'reports',
                'action' => 'view',
                'scope' => 'department'
            ],
            'reports.view.all' => [
                'name' => 'reports.view.all',
                'display_name' => 'View All Reports',
                'description' => 'View all system reports',
                'module' => 'reports',
                'action' => 'view',
                'scope' => 'all'
            ],
            'reports.create' => [
                'name' => 'reports.create',
                'display_name' => 'Create Reports',
                'description' => 'Create custom reports',
                'module' => 'reports',
                'action' => 'create'
            ],

            // Advanced System Administration
            'system.backup' => [
                'name' => 'system.backup',
                'display_name' => 'System Backup',
                'description' => 'Create and manage system backups',
                'module' => 'system',
                'action' => 'backup'
            ],
            'system.restore' => [
                'name' => 'system.restore',
                'display_name' => 'System Restore',
                'description' => 'Restore system from backups',
                'module' => 'system',
                'action' => 'restore'
            ],
            'system.maintenance' => [
                'name' => 'system.maintenance',
                'display_name' => 'System Maintenance',
                'description' => 'Put system in maintenance mode',
                'module' => 'system',
                'action' => 'maintenance'
            ],
            'system.logs' => [
                'name' => 'system.logs',
                'display_name' => 'View System Logs',
                'description' => 'Access system logs and error reports',
                'module' => 'system',
                'action' => 'logs'
            ],

            // Department-specific Permissions
            'department.manage.own' => [
                'name' => 'department.manage.own',
                'display_name' => 'Manage Own Department',
                'description' => 'Manage settings and users within own department',
                'module' => 'department',
                'action' => 'manage',
                'scope' => 'own'
            ],
            'department.view.all' => [
                'name' => 'department.view.all',
                'display_name' => 'View All Departments',
                'description' => 'View information about all departments',
                'module' => 'department',
                'action' => 'view',
                'scope' => 'all'
            ],
            'department.manage.all' => [
                'name' => 'department.manage.all',
                'display_name' => 'Manage All Departments',
                'description' => 'Full management access to all departments',
                'module' => 'department',
                'action' => 'manage',
                'scope' => 'all'
            ],

            // Loyalty System
            'loyalty.view' => [
                'name' => 'loyalty.view',
                'display_name' => 'View Loyalty',
                'description' => 'Access loyalty system data',
                'module' => 'loyalty',
                'action' => 'view'
            ],
            'loyalty.manage' => [
                'name' => 'loyalty.manage',
                'display_name' => 'Manage Loyalty',
                'description' => 'Full loyalty system management',
                'module' => 'loyalty',
                'action' => 'manage'
            ],

            // Time-restricted Permissions
            'overtime.approve' => [
                'name' => 'overtime.approve',
                'display_name' => 'Approve Overtime',
                'description' => 'Approve overtime requests',
                'module' => 'attendance',
                'action' => 'approve'
            ],
            'attendance.modify' => [
                'name' => 'attendance.modify',
                'display_name' => 'Modify Attendance',
                'description' => 'Modify attendance records',
                'module' => 'attendance',
                'action' => 'modify'
            ],

            // Emergency Permissions
            'emergency.access' => [
                'name' => 'emergency.access',
                'display_name' => 'Emergency Access',
                'description' => 'Emergency access to critical systems',
                'module' => 'system',
                'action' => 'emergency'
            ],
        ];
    }
}