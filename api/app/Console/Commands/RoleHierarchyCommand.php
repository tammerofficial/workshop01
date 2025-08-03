<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\User;

class RoleHierarchyCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'role:hierarchy {action} {--role=} {--user=} {--permission=} {--department=}';

    /**
     * The console command description.
     */
    protected $description = 'Manage role hierarchy and permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        return match($action) {
            'list' => $this->listHierarchy(),
            'show' => $this->showRole(),
            'create' => $this->createRole(),
            'assign' => $this->assignRole(),
            'permissions' => $this->managePermissions(),
            'users' => $this->listRoleUsers(),
            'tree' => $this->displayTree(),
            default => $this->displayHelp()
        };
    }

    /**
     * عرض التسلسل الهرمي للأدوار
     */
    private function listHierarchy()
    {
        $roles = Role::with(['parentRole', 'childRoles'])
            ->orderBy('hierarchy_level')
            ->orderBy('priority')
            ->get();

        $this->info('📋 Role Hierarchy Structure:');
        $this->line('');

        $headers = ['ID', 'Name', 'Display Name', 'Level', 'Parent', 'Children', 'Users', 'Department'];
        $rows = [];

        foreach ($roles as $role) {
            $rows[] = [
                $role->id,
                $role->name,
                $role->display_name,
                $role->hierarchy_level,
                $role->parentRole?->name ?? '-',
                $role->childRoles->count(),
                $role->users->count(),
                $role->department ?? 'All'
            ];
        }

        $this->table($headers, $rows);
    }

    /**
     * عرض تفاصيل دور محدد
     */
    private function showRole()
    {
        $roleName = $this->option('role');
        if (!$roleName) {
            $this->error('Please specify --role option');
            return 1;
        }

        $role = Role::with(['parentRole', 'childRoles', 'users'])->where('name', $roleName)->first();
        if (!$role) {
            $this->error("Role '{$roleName}' not found");
            return 1;
        }

        $this->info("🔐 Role Details: {$role->display_name}");
        $this->line('');
        
        $this->line("<fg=yellow>Basic Information:</>");
        $this->line("Name: {$role->name}");
        $this->line("Display Name: {$role->display_name}");
        $this->line("Description: {$role->description}");
        $this->line("Department: " . ($role->department ?? 'All'));
        $this->line("Hierarchy Level: {$role->hierarchy_level}");
        $this->line("Priority: {$role->priority}");
        $this->line("Is System Role: " . ($role->is_system_role ? 'Yes' : 'No'));
        $this->line("Is Inheritable: " . ($role->is_inheritable ? 'Yes' : 'No'));
        $this->line('');

        if ($role->parentRole) {
            $this->line("<fg=yellow>Parent Role:</>");
            $this->line("- {$role->parentRole->display_name} ({$role->parentRole->name})");
            $this->line('');
        }

        if ($role->childRoles->count() > 0) {
            $this->line("<fg=yellow>Child Roles:</>");
            foreach ($role->childRoles as $child) {
                $this->line("- {$child->display_name} ({$child->name})");
            }
            $this->line('');
        }

        $permissionCount = $role->permissions ? count($role->permissions) : 0;
        $this->line("<fg=yellow>Direct Permissions ({$permissionCount}):</>");
        if ($role->permissions) {
            foreach ($role->permissions as $permission) {
                $this->line("- {$permission}");
            }
        } else {
            $this->line("- No direct permissions");
        }
        $this->line('');

        $allPermissions = $role->getAllPermissions();
        $allPermissionCount = count($allPermissions);
        $this->line("<fg=yellow>All Permissions (including inherited) ({$allPermissionCount}):</>");
        foreach ($allPermissions as $permission) {
            $isInherited = !in_array($permission, $role->permissions ?? []);
            $this->line("- {$permission}" . ($isInherited ? ' <fg=cyan>(inherited)</>' : ''));
        }
        $this->line('');

        $this->line("<fg=yellow>Assigned Users ({$role->users->count()}):</>");
        foreach ($role->users as $user) {
            $this->line("- {$user->name} ({$user->email})");
        }
    }

    /**
     * إنشاء دور جديد
     */
    private function createRole()
    {
        $this->info('🆕 Creating New Role');
        
        $name = $this->ask('Role name (unique identifier)');
        $displayName = $this->ask('Display name');
        $description = $this->ask('Description');
        $department = $this->ask('Department (optional)');
        
        $parents = Role::whereNull('parent_role_id')->orWhere('hierarchy_level', '<', 5)->get();
        if ($parents->count() > 0) {
            $this->line('Available parent roles:');
            foreach ($parents as $parent) {
                $this->line("- {$parent->name} (Level {$parent->hierarchy_level})");
            }
            $parentName = $this->ask('Parent role (optional)');
            $parentRole = $parentName ? Role::where('name', $parentName)->first() : null;
        } else {
            $parentRole = null;
        }

        try {
            $role = Role::create([
                'name' => $name,
                'display_name' => $displayName,
                'description' => $description,
                'department' => $department ?: null,
                'parent_role_id' => $parentRole?->id,
                'hierarchy_level' => $parentRole ? $parentRole->hierarchy_level + 1 : 0,
                'priority' => 1,
                'is_system_role' => false,
                'is_inheritable' => true,
                'permissions' => []
            ]);

            $this->info("✅ Role '{$role->display_name}' created successfully!");
            $this->line("ID: {$role->id}");
            $this->line("Hierarchy Level: {$role->hierarchy_level}");
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to create role: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * تعيين دور لمستخدم
     */
    private function assignRole()
    {
        $roleName = $this->option('role');
        $userEmail = $this->option('user');

        if (!$roleName || !$userEmail) {
            $this->error('Please specify both --role and --user options');
            return 1;
        }

        $role = Role::where('name', $roleName)->first();
        $user = User::where('email', $userEmail)->first();

        if (!$role) {
            $this->error("Role '{$roleName}' not found");
            return 1;
        }

        if (!$user) {
            $this->error("User '{$userEmail}' not found");
            return 1;
        }

        $user->role_id = $role->id;
        $user->save();

        $this->info("✅ Role '{$role->display_name}' assigned to user '{$user->name}'");
    }

    /**
     * إدارة صلاحيات الدور
     */
    private function managePermissions()
    {
        $roleName = $this->option('role');
        $permission = $this->option('permission');

        if (!$roleName) {
            $this->error('Please specify --role option');
            return 1;
        }

        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            $this->error("Role '{$roleName}' not found");
            return 1;
        }

        if (!$permission) {
            // عرض الصلاحيات الحالية
            $this->info("🔑 Permissions for role: {$role->display_name}");
            $permissions = $role->permissions ?? [];
            foreach ($permissions as $perm) {
                $this->line("- {$perm}");
            }
            return;
        }

        $action = $this->choice('What would you like to do?', ['add', 'remove'], 'add');

        if ($action === 'add') {
            $role->addPermissionWithConditions($permission);
            $this->info("✅ Permission '{$permission}' added to role '{$role->display_name}'");
        } else {
            $role->removePermission($permission);
            $this->info("✅ Permission '{$permission}' removed from role '{$role->display_name}'");
        }
    }

    /**
     * عرض مستخدمي دور محدد
     */
    private function listRoleUsers()
    {
        $roleName = $this->option('role');
        if (!$roleName) {
            $this->error('Please specify --role option');
            return 1;
        }

        $role = Role::with('users')->where('name', $roleName)->first();
        if (!$role) {
            $this->error("Role '{$roleName}' not found");
            return 1;
        }

        $this->info("👥 Users with role: {$role->display_name}");
        $this->line('');

        if ($role->users->count() === 0) {
            $this->line('No users assigned to this role.');
            return;
        }

        $headers = ['ID', 'Name', 'Email', 'Active', 'Last Login'];
        $rows = [];

        foreach ($role->users as $user) {
            $rows[] = [
                $user->id,
                $user->name,
                $user->email,
                $user->is_active ? 'Yes' : 'No',
                $user->last_login_at?->format('Y-m-d H:i') ?? 'Never'
            ];
        }

        $this->table($headers, $rows);
    }

    /**
     * عرض شجرة الأدوار
     */
    private function displayTree()
    {
        $this->info('🌳 Role Hierarchy Tree:');
        $this->line('');

        $rootRoles = Role::whereNull('parent_role_id')->orderBy('priority')->get();
        
        foreach ($rootRoles as $root) {
            $this->displayRoleTree($root, 0);
        }
    }

    /**
     * عرض شجرة دور محدد
     */
    private function displayRoleTree(Role $role, int $level)
    {
        $indent = str_repeat('  ', $level);
        $prefix = $level > 0 ? '└─ ' : '';
        
        $this->line("{$indent}{$prefix}{$role->display_name} ({$role->name})");
        $this->line("{$indent}   Level: {$role->hierarchy_level} | Users: {$role->users->count()} | Dept: " . ($role->department ?? 'All'));
        
        foreach ($role->childRoles as $child) {
            $this->displayRoleTree($child, $level + 1);
        }
    }

    /**
     * عرض مساعدة الأوامر
     */
    private function displayHelp()
    {
        $this->info('🔐 Role Hierarchy Management Commands:');
        $this->line('');
        $this->line('Available actions:');
        $this->line('  <fg=yellow>list</> - List all roles in hierarchy order');
        $this->line('  <fg=yellow>show</> - Show detailed role information (requires --role)');
        $this->line('  <fg=yellow>create</> - Create a new role interactively');
        $this->line('  <fg=yellow>assign</> - Assign role to user (requires --role and --user)');
        $this->line('  <fg=yellow>permissions</> - Manage role permissions (requires --role, optional --permission)');
        $this->line('  <fg=yellow>users</> - List users with specific role (requires --role)');
        $this->line('  <fg=yellow>tree</> - Display role hierarchy as a tree');
        $this->line('');
        $this->line('Examples:');
        $this->line('  <fg=green>php artisan role:hierarchy list</>');
        $this->line('  <fg=green>php artisan role:hierarchy show --role=production_manager</>');
        $this->line('  <fg=green>php artisan role:hierarchy assign --role=worker --user=john@example.com</>');
        $this->line('  <fg=green>php artisan role:hierarchy permissions --role=worker --permission=orders.view.own</>');
    }
}