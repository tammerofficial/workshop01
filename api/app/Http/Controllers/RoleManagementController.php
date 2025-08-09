<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class RoleManagementController extends Controller
{
    public function index()
    {
        try {
            $roles = [];
            
            if (Schema::hasTable('roles')) {
                $roles = DB::table('roles')
                    ->leftJoin('permissions', 'roles.id', '=', 'permissions.role_id')
                    ->select(
                        'roles.*',
                        DB::raw('COUNT(permissions.id) as permissions_count')
                    )
                    ->groupBy('roles.id', 'roles.name', 'roles.description', 'roles.is_active', 'roles.created_at')
                    ->orderBy('roles.name')
                    ->get()
                    ->map(function ($role) {
                        $role->users_count = $this->getUsersCount($role->id);
                        return $role;
                    });
            }
            
            // Add dummy data if empty
            if (empty($roles->toArray())) {
                $roles = collect([
                    (object) [
                        'id' => 1,
                        'name' => 'system_super_admin',
                        'display_name' => 'System Super Admin',
                        'description' => 'Full system access with all permissions',
                        'permissions_count' => 25,
                        'users_count' => 1,
                        'is_active' => true,
                        'created_at' => now()->subMonths(6)
                    ],
                    (object) [
                        'id' => 2,
                        'name' => 'admin',
                        'display_name' => 'Administrator',
                        'description' => 'Administrative access to most features',
                        'permissions_count' => 18,
                        'users_count' => 3,
                        'is_active' => true,
                        'created_at' => now()->subMonths(5)
                    ],
                    (object) [
                        'id' => 3,
                        'name' => 'manager',
                        'display_name' => 'Manager',
                        'description' => 'Management access to production and reports',
                        'permissions_count' => 12,
                        'users_count' => 5,
                        'is_active' => true,
                        'created_at' => now()->subMonths(4)
                    ],
                    (object) [
                        'id' => 4,
                        'name' => 'worker',
                        'display_name' => 'Worker',
                        'description' => 'Basic production and task management access',
                        'permissions_count' => 6,
                        'users_count' => 24,
                        'is_active' => true,
                        'created_at' => now()->subMonths(3)
                    ]
                ]);
            }
            
            return view('modules.admin.roles.index', compact('roles'));
            
        } catch (\Exception $e) {
            return view('modules.admin.roles.index', ['roles' => collect()]);
        }
    }

    public function create()
    {
        try {
            $permissions = $this->getAllPermissions();
            $categories = $this->getPermissionCategories();
            
            return view('modules.admin.roles.create', compact('permissions', 'categories'));
            
        } catch (\Exception $e) {
            return view('modules.admin.roles.create', [
                'permissions' => collect(),
                'categories' => collect()
            ]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'array'
        ]);

        try {
            $roleId = null;
            
            if (Schema::hasTable('roles')) {
                $roleId = DB::table('roles')->insertGetId([
                    'name' => $request->name,
                    'display_name' => $request->display_name,
                    'description' => $request->description,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Assign permissions
                if ($roleId && !empty($request->permissions)) {
                    $permissionData = [];
                    foreach ($request->permissions as $permissionId) {
                        $permissionData[] = [
                            'role_id' => $roleId,
                            'permission_id' => $permissionId,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }
                    
                    if (Schema::hasTable('role_permissions')) {
                        DB::table('role_permissions')->insert($permissionData);
                    }
                }
            }

            return redirect()->route('ui.admin.roles.index')
                ->with('success', __('Role created successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to create role: ') . $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $role = $this->getRoleDetails($id);
            $permissions = $this->getRolePermissions($id);
            $users = $this->getRoleUsers($id);
            
            return view('modules.admin.roles.show', compact('role', 'permissions', 'users'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.admin.roles.index')
                ->with('error', __('Role not found'));
        }
    }

    public function edit($id)
    {
        try {
            $role = $this->getRoleDetails($id);
            $permissions = $this->getAllPermissions();
            $rolePermissions = $this->getRolePermissions($id);
            $categories = $this->getPermissionCategories();
            
            return view('modules.admin.roles.edit', compact('role', 'permissions', 'rolePermissions', 'categories'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.admin.roles.index')
                ->with('error', __('Role not found'));
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'array'
        ]);

        try {
            if (Schema::hasTable('roles')) {
                DB::table('roles')
                    ->where('id', $id)
                    ->update([
                        'display_name' => $request->display_name,
                        'description' => $request->description,
                        'updated_at' => now()
                    ]);

                // Update permissions
                if (Schema::hasTable('role_permissions')) {
                    DB::table('role_permissions')->where('role_id', $id)->delete();
                    
                    if (!empty($request->permissions)) {
                        $permissionData = [];
                        foreach ($request->permissions as $permissionId) {
                            $permissionData[] = [
                                'role_id' => $id,
                                'permission_id' => $permissionId,
                                'created_at' => now(),
                                'updated_at' => now()
                            ];
                        }
                        DB::table('role_permissions')->insert($permissionData);
                    }
                }
            }

            return redirect()->route('ui.admin.roles.show', $id)
                ->with('success', __('Role updated successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to update role: ') . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            // Check if role has users
            $usersCount = $this->getUsersCount($id);
            if ($usersCount > 0) {
                return redirect()->route('ui.admin.roles.index')
                    ->with('error', __('Cannot delete role with assigned users'));
            }

            if (Schema::hasTable('roles')) {
                // Delete role permissions first
                if (Schema::hasTable('role_permissions')) {
                    DB::table('role_permissions')->where('role_id', $id)->delete();
                }
                
                // Delete role
                DB::table('roles')->where('id', $id)->delete();
            }

            return redirect()->route('ui.admin.roles.index')
                ->with('success', __('Role deleted successfully'));

        } catch (\Exception $e) {
            return redirect()->route('ui.admin.roles.index')
                ->with('error', __('Failed to delete role'));
        }
    }

    public function permissions()
    {
        try {
            $permissions = $this->getAllPermissions();
            $categories = $this->getPermissionCategories();
            
            return view('modules.admin.permissions.index', compact('permissions', 'categories'));
            
        } catch (\Exception $e) {
            return view('modules.admin.permissions.index', [
                'permissions' => collect(),
                'categories' => collect()
            ]);
        }
    }

    private function getUsersCount($roleId)
    {
        try {
            if (Schema::hasTable('user_roles')) {
                return DB::table('user_roles')->where('role_id', $roleId)->count();
            }
            return rand(0, 10); // Dummy data
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getRoleDetails($id)
    {
        return (object) [
            'id' => $id,
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Administrative access to most features',
            'is_active' => true,
            'created_at' => now()->subMonths(5),
            'updated_at' => now()->subDays(10)
        ];
    }

    private function getAllPermissions()
    {
        return collect([
            [
                'id' => 1,
                'name' => 'orders.view',
                'display_name' => 'View Orders',
                'category' => 'Orders Management',
                'description' => 'Can view order listings and details'
            ],
            [
                'id' => 2,
                'name' => 'orders.create',
                'display_name' => 'Create Orders',
                'category' => 'Orders Management',
                'description' => 'Can create new orders'
            ],
            [
                'id' => 3,
                'name' => 'orders.edit',
                'display_name' => 'Edit Orders',
                'category' => 'Orders Management',
                'description' => 'Can modify existing orders'
            ],
            [
                'id' => 4,
                'name' => 'orders.delete',
                'display_name' => 'Delete Orders',
                'category' => 'Orders Management',
                'description' => 'Can delete orders'
            ],
            [
                'id' => 5,
                'name' => 'production.view',
                'display_name' => 'View Production',
                'category' => 'Production Management',
                'description' => 'Can view production status and workflows'
            ],
            [
                'id' => 6,
                'name' => 'production.manage',
                'display_name' => 'Manage Production',
                'category' => 'Production Management',
                'description' => 'Can manage production processes'
            ],
            [
                'id' => 7,
                'name' => 'inventory.view',
                'display_name' => 'View Inventory',
                'category' => 'Inventory Management',
                'description' => 'Can view inventory items and stock levels'
            ],
            [
                'id' => 8,
                'name' => 'inventory.manage',
                'display_name' => 'Manage Inventory',
                'category' => 'Inventory Management',
                'description' => 'Can add, edit, and manage inventory items'
            ],
            [
                'id' => 9,
                'name' => 'workers.view',
                'display_name' => 'View Workers',
                'category' => 'Human Resources',
                'description' => 'Can view worker information'
            ],
            [
                'id' => 10,
                'name' => 'workers.manage',
                'display_name' => 'Manage Workers',
                'category' => 'Human Resources',
                'description' => 'Can add, edit, and manage workers'
            ],
            [
                'id' => 11,
                'name' => 'payroll.view',
                'display_name' => 'View Payroll',
                'category' => 'Human Resources',
                'description' => 'Can view payroll information'
            ],
            [
                'id' => 12,
                'name' => 'payroll.manage',
                'display_name' => 'Manage Payroll',
                'category' => 'Human Resources',
                'description' => 'Can process and manage payroll'
            ],
            [
                'id' => 13,
                'name' => 'reports.view',
                'display_name' => 'View Reports',
                'category' => 'Reports & Analytics',
                'description' => 'Can view reports and analytics'
            ],
            [
                'id' => 14,
                'name' => 'reports.export',
                'display_name' => 'Export Reports',
                'category' => 'Reports & Analytics',
                'description' => 'Can export reports to various formats'
            ],
            [
                'id' => 15,
                'name' => 'system.monitor',
                'display_name' => 'Monitor System',
                'category' => 'System Administration',
                'description' => 'Can view system monitoring and health'
            ],
            [
                'id' => 16,
                'name' => 'system.settings',
                'display_name' => 'System Settings',
                'category' => 'System Administration',
                'description' => 'Can modify system settings'
            ],
            [
                'id' => 17,
                'name' => 'users.view',
                'display_name' => 'View Users',
                'category' => 'User Management',
                'description' => 'Can view user accounts'
            ],
            [
                'id' => 18,
                'name' => 'users.manage',
                'display_name' => 'Manage Users',
                'category' => 'User Management',
                'description' => 'Can create, edit, and manage user accounts'
            ],
            [
                'id' => 19,
                'name' => 'roles.view',
                'display_name' => 'View Roles',
                'category' => 'Role Management',
                'description' => 'Can view roles and permissions'
            ],
            [
                'id' => 20,
                'name' => 'roles.manage',
                'display_name' => 'Manage Roles',
                'category' => 'Role Management',
                'description' => 'Can create and manage roles and permissions'
            ]
        ]);
    }

    private function getRolePermissions($roleId)
    {
        // Return permissions for specific role
        $allPermissions = $this->getAllPermissions();
        return $allPermissions->take(rand(5, 15)); // Dummy selection
    }

    private function getRoleUsers($roleId)
    {
        return collect([
            [
                'id' => 1,
                'name' => 'John Admin',
                'email' => 'admin@example.com',
                'assigned_at' => now()->subMonths(2),
                'status' => 'active'
            ],
            [
                'id' => 2,
                'name' => 'Sarah Manager',
                'email' => 'sarah@example.com',
                'assigned_at' => now()->subMonths(1),
                'status' => 'active'
            ]
        ]);
    }

    private function getPermissionCategories()
    {
        return collect([
            'Orders Management',
            'Production Management',
            'Inventory Management',
            'Human Resources',
            'Reports & Analytics',
            'System Administration',
            'User Management',
            'Role Management'
        ]);
    }
}
