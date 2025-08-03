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

        // Create hierarchical roles
        $defaultRoles = [
            // Root Level - System Administrator
            'system_administrator' => [
                'name' => 'system_administrator',
                'display_name' => 'System Administrator',
                'description' => 'Full system access with all permissions and emergency access',
                'parent_role_id' => null,
                'hierarchy_level' => 0,
                'priority' => 1,
                'department' => null,
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => array_keys($permissions)
            ],

            // Level 1 - General Administrator  
            'administrator' => [
                'name' => 'administrator',
                'display_name' => 'Administrator',
                'description' => 'General administrative access without emergency permissions',
                'parent_role_id' => 'system_administrator', // Will be updated with actual ID
                'hierarchy_level' => 1,
                'priority' => 1,
                'department' => null,
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view', 'dashboard.customize',
                    'users.view', 'users.create', 'users.edit',
                    'orders.view.all', 'orders.create', 'orders.edit.all', 'orders.approve',
                    'production.view.all', 'production.manage.all',
                    'inventory.view.all', 'inventory.manage.all',
                    'workers.view.all', 'workers.manage.all',
                    'clients.view', 'clients.create', 'clients.edit',
                    'reports.view.all', 'reports.create', 'reports.export',
                    'analytics.view',
                    'calendar.view', 'calendar.edit',
                    'roles.view', 'roles.manage',
                    'settings.manage',
                    'loyalty.view', 'loyalty.manage',
                    'system.backup', 'system.logs'
                ]
            ],

            // Level 2 - Department Managers
            'general_manager' => [
                'name' => 'general_manager',
                'display_name' => 'General Manager',
                'description' => 'Cross-department management with limited system access',
                'parent_role_id' => 'administrator',
                'hierarchy_level' => 2,
                'priority' => 1,
                'department' => null,
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.all', 'orders.create', 'orders.edit.all', 'orders.approve',
                    'production.view.all', 'production.manage.all',
                    'inventory.view.all', 'inventory.manage.department',
                    'workers.view.all', 'workers.manage.department',
                    'clients.view', 'clients.create', 'clients.edit',
                    'reports.view.all', 'reports.create',
                    'analytics.view',
                    'calendar.view', 'calendar.edit',
                    'department.view.all', 'department.manage.all'
                ]
            ],

            'production_manager' => [
                'name' => 'production_manager', 
                'display_name' => 'Production Manager',
                'description' => 'Production department management',
                'parent_role_id' => 'general_manager',
                'hierarchy_level' => 3,
                'priority' => 1,
                'department' => 'production',
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.department', 'orders.edit.department',
                    'production.view.all', 'production.manage.department',
                    'inventory.view.department', 'inventory.manage.department',
                    'workers.view.department', 'workers.manage.department',
                    'reports.view.department', 'reports.create',
                    'analytics.view',
                    'calendar.view', 'calendar.edit',
                    'department.manage.own'
                ]
            ],

            'inventory_manager' => [
                'name' => 'inventory_manager',
                'display_name' => 'Inventory Manager', 
                'description' => 'Inventory and materials management',
                'parent_role_id' => 'general_manager',
                'hierarchy_level' => 3,
                'priority' => 2,
                'department' => 'inventory',
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.department',
                    'inventory.view.all', 'inventory.manage.all',
                    'workers.view.department', 'workers.manage.department',
                    'reports.view.department', 'reports.create',
                    'calendar.view', 'calendar.edit',
                    'department.manage.own'
                ]
            ],

            // Level 3 - Supervisors
            'production_supervisor' => [
                'name' => 'production_supervisor',
                'display_name' => 'Production Supervisor',
                'description' => 'Production line supervision and task management',
                'parent_role_id' => 'production_manager',
                'hierarchy_level' => 4,
                'priority' => 1,
                'department' => 'production',
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.department', 'orders.edit.own',
                    'production.view.department', 'production.update.assigned',
                    'inventory.view.department', 'inventory.update.assigned',
                    'workers.view.department',
                    'reports.view.own',
                    'calendar.view', 'calendar.edit',
                    'overtime.approve'
                ]
            ],

            'quality_supervisor' => [
                'name' => 'quality_supervisor',
                'display_name' => 'Quality Control Supervisor',
                'description' => 'Quality control and inspection oversight',
                'parent_role_id' => 'production_manager',
                'hierarchy_level' => 4,
                'priority' => 2,
                'department' => 'quality',
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.department', 'orders.approve',
                    'production.view.department', 'production.manage.department',
                    'inventory.view.department',
                    'workers.view.department',
                    'reports.view.department', 'reports.create',
                    'calendar.view'
                ]
            ],

            // Level 4 - Regular Workers
            'senior_worker' => [
                'name' => 'senior_worker',
                'display_name' => 'Senior Worker',
                'description' => 'Experienced worker with training and mentoring responsibilities',
                'parent_role_id' => 'production_supervisor',
                'hierarchy_level' => 5,
                'priority' => 1,
                'department' => 'production',
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.own', 'orders.edit.own',
                    'production.view.assigned', 'production.update.assigned',
                    'inventory.view.assigned', 'inventory.update.assigned',
                    'workers.view.own',
                    'calendar.view',
                    'tasks.view', 'tasks.update'
                ]
            ],

            'worker' => [
                'name' => 'worker',
                'display_name' => 'Worker',
                'description' => 'Regular worker with access to assigned tasks only',
                'parent_role_id' => 'senior_worker',
                'hierarchy_level' => 6,
                'priority' => 1,
                'department' => 'production',
                'is_system_role' => true,
                'is_inheritable' => true,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.own',
                    'production.view.assigned', 'production.update.assigned',
                    'inventory.view.assigned',
                    'workers.view.own',
                    'calendar.view',
                    'tasks.view', 'tasks.update'
                ]
            ],

            // Special Roles
            'accountant' => [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Financial and accounting access',
                'parent_role_id' => 'general_manager',
                'hierarchy_level' => 3,
                'priority' => 3,
                'department' => 'finance',
                'is_system_role' => true,
                'is_inheritable' => false, // لا ترث صلاحيات إضافية
                'permissions' => [
                    'dashboard.view',
                    'orders.view.all',
                    'invoices.view', 'invoices.create', 'invoices.edit',
                    'payroll.view', 'payroll.manage',
                    'reports.view.all', 'reports.create', 'reports.export',
                    'analytics.view',
                    'loyalty.view'
                ]
            ],

            'viewer' => [
                'name' => 'viewer',
                'display_name' => 'Viewer',
                'description' => 'Read-only access for auditing and monitoring',
                'parent_role_id' => null, // منفصل عن التسلسل الهرمي
                'hierarchy_level' => 10, // أقل مستوى
                'priority' => 1,
                'department' => null,
                'is_system_role' => true,
                'is_inheritable' => false,
                'permissions' => [
                    'dashboard.view',
                    'orders.view.all',
                    'production.view.all',
                    'inventory.view.all',
                    'workers.view.all',
                    'clients.view',
                    'reports.view.all',
                    'analytics.view',
                    'calendar.view'
                ]
            ]
        ];

        // First pass: Create roles without parent relationships
        $createdRoles = [];
        foreach ($defaultRoles as $roleName => $roleData) {
            $roleDataWithoutParent = $roleData;
            $roleDataWithoutParent['parent_role_id'] = null; // مؤقتاً
            
            $role = Role::updateOrCreate(
                ['name' => $roleName],
                $roleDataWithoutParent
            );
            $createdRoles[$roleName] = $role;
        }

        // Second pass: Update parent relationships
        foreach ($defaultRoles as $roleName => $roleData) {
            if (isset($roleData['parent_role_id']) && $roleData['parent_role_id']) {
                $parentRoleName = $roleData['parent_role_id'];
                if (isset($createdRoles[$parentRoleName])) {
                    $role = $createdRoles[$roleName];
                    $role->parent_role_id = $createdRoles[$parentRoleName]->id;
                    $role->save();
                    
                    // تحديث مستوى التسلسل الهرمي
                    $role->updateHierarchyLevel();
                }
            }
        }

        // Create some example role conditions for demonstration
        $this->createExampleConditions($createdRoles);

        // Assign administrator role to existing users if they don't have a role
        $adminRole = $createdRoles['administrator'] ?? null;
        if ($adminRole) {
            User::whereNull('role_id')->update(['role_id' => $adminRole->id]);
        }

        $this->command->info('Hierarchical roles and permissions seeded successfully!');
        $this->command->info('Created ' . count($createdRoles) . ' roles with hierarchical structure.');
    }

    /**
     * إنشاء أمثلة على الشروط للأدوار
     */
    private function createExampleConditions(array $roles): void
    {
        // شروط زمنية للعمال
        if (isset($roles['worker'])) {
            $roles['worker']->addPermissionWithConditions('production.update.assigned', [
                'time_restriction' => [
                    'start' => 8, // 8 AM
                    'end' => 17    // 5 PM
                ]
            ]);
        }

        // شروط قسم للمشرفين
        if (isset($roles['production_supervisor'])) {
            $roles['production_supervisor']->addPermissionWithConditions('orders.edit.own', [
                'department' => 'production'
            ]);
        }

        // شروط طوارئ للمديرين
        if (isset($roles['general_manager'])) {
            $roles['general_manager']->addPermissionWithConditions('emergency.access', [
                'requires_approval' => true,
                'max_duration_hours' => 4
            ]);
        }

        $this->command->info('Example role conditions created successfully!');
    }
}
