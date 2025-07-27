<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = Permission::getAvailablePermissions();
        
        foreach ($permissions as $name => $permissionData) {
            Permission::updateOrCreate(
                ['name' => $name],
                $permissionData
            );
        }

        // Create default roles
        $defaultRoles = [
            'administrator' => [
                'name' => 'administrator',
                'display_name' => 'Administrator',
                'description' => 'Full system access with all permissions',
                'is_system_role' => true,
                'permissions' => array_keys($permissions)
            ],
            'department_manager' => [
                'name' => 'department_manager',
                'display_name' => 'Department Manager',
                'description' => 'Department-specific management access',
                'is_system_role' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view', 'orders.create', 'orders.edit',
                    'inventory.view', 'inventory.create', 'inventory.edit',
                    'workers.view', 'workers.create', 'workers.edit',
                    'clients.view', 'clients.create', 'clients.edit',
                    'production.view', 'production.edit',
                    'calendar.view', 'calendar.edit',
                    'analytics.view',
                    'reports.view', 'reports.export'
                ]
            ],
            'worker' => [
                'name' => 'worker',
                'display_name' => 'Worker',
                'description' => 'Limited access to assigned tasks and orders',
                'is_system_role' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view',
                    'inventory.view',
                    'production.view',
                    'calendar.view'
                ]
            ],
            'viewer' => [
                'name' => 'viewer',
                'display_name' => 'Viewer',
                'description' => 'Read-only access to system data',
                'is_system_role' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view',
                    'inventory.view',
                    'workers.view',
                    'clients.view',
                    'production.view',
                    'calendar.view',
                    'analytics.view',
                    'reports.view'
                ]
            ]
        ];

        foreach ($defaultRoles as $roleName => $roleData) {
            Role::updateOrCreate(
                ['name' => $roleName],
                $roleData
            );
        }

        // Assign administrator role to existing users if they don't have a role
        $adminRole = Role::where('name', 'administrator')->first();
        if ($adminRole) {
            User::whereNull('role_id')->update(['role_id' => $adminRole->id]);
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
