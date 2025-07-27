<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): JsonResponse
    {
        try {
            $roles = Role::with('users')->get();
            
            return response()->json([
                'success' => true,
                'data' => $roles,
                'message' => 'Roles retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve roles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:roles,name',
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'is_system_role' => 'boolean'
            ]);

            $role = Role::create([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'permissions' => $request->permissions ?? [],
                'is_system_role' => $request->is_system_role ?? false
            ]);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): JsonResponse
    {
        try {
            $role->load('users');
            
            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'is_system_role' => 'boolean'
            ]);

            $role->update([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'permissions' => $request->permissions ?? [],
                'is_system_role' => $request->is_system_role ?? false
            ]);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): JsonResponse
    {
        try {
            if ($role->is_system_role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete system roles'
                ], 400);
            }

            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role with assigned users'
                ], 400);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available permissions for roles.
     */
    public function getPermissions(): JsonResponse
    {
        try {
            $permissions = Permission::getAvailablePermissions();
            
            return response()->json([
                'success' => true,
                'data' => $permissions,
                'message' => 'Permissions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get default roles with their permissions.
     */
    public function getDefaultRoles(): JsonResponse
    {
        try {
            $defaultRoles = [
                'administrator' => [
                    'name' => 'administrator',
                    'display_name' => 'Administrator',
                    'description' => 'Full system access with all permissions',
                    'is_system_role' => true,
                    'permissions' => array_keys(Permission::getAvailablePermissions())
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

            return response()->json([
                'success' => true,
                'data' => $defaultRoles,
                'message' => 'Default roles retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve default roles: ' . $e->getMessage()
            ], 500);
        }
    }
}
