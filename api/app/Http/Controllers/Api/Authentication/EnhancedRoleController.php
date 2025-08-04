<?php

namespace App\Http\Controllers\Api\Authentication;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EnhancedRoleController extends Controller
{
    /**
     * عرض الأدوار بترتيب هرمي
     */
    public function index(): JsonResponse
    {
        try {
            $roles = Role::with(['parentRole', 'childRoles', 'users'])
                ->orderBy('hierarchy_level')
                ->orderBy('priority')
                ->get();

            $hierarchicalRoles = $this->buildHierarchicalTree($roles);

            return response()->json([
                'success' => true,
                'data' => [
                    'roles' => $roles,
                    'hierarchical_tree' => $hierarchicalRoles,
                    'total_count' => $roles->count()
                ],
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
     * إنشاء دور جديد
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|unique:roles,name|max:255',
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'parent_role_id' => 'nullable|exists:roles,id',
                'department' => 'nullable|string|max:255',
                'priority' => 'nullable|integer|min:1|max:100',
                'permissions' => 'nullable|array',
                'permissions.*' => 'string',
                'conditions' => 'nullable|array',
                'is_inheritable' => 'boolean',
                'expires_at' => 'nullable|date|after:now'
            ]);

            // تحديد مستوى التسلسل الهرمي
            if ($validatedData['parent_role_id']) {
                $parentRole = Role::find($validatedData['parent_role_id']);
                $validatedData['hierarchy_level'] = $parentRole->hierarchy_level + 1;
            } else {
                $validatedData['hierarchy_level'] = 0;
            }

            $role = Role::create($validatedData);
            
            // تحديث مستوى التسلسل الهرمي للأدوار الفرعية
            $role->updateHierarchyLevel();

            $role->load(['parentRole', 'childRoles']);

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
     * عرض دور محدد مع جميع المعلومات
     */
    public function show(Role $role): JsonResponse
    {
        try {
            $role->load(['parentRole', 'childRoles', 'users']);
            
            $effectivePermissions = $role->getAllPermissions();
            $inheritedPermissions = [];
            
            if ($role->parentRole && $role->is_inheritable) {
                $parentPermissions = $role->parentRole->getAllPermissions();
                $directPermissions = $role->permissions ?? [];
                $inheritedPermissions = array_diff($parentPermissions, $directPermissions);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $role,
                    'effective_permissions' => $effectivePermissions,
                    'inherited_permissions' => $inheritedPermissions,
                    'direct_permissions' => $role->permissions ?? [],
                    'conditions' => $role->conditions ?? [],
                    'users_count' => $role->users->count(),
                    'child_roles_count' => $role->childRoles->count()
                ],
                'message' => 'Role details retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث دور
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => ['sometimes', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
                'display_name' => 'sometimes|string|max:255',
                'description' => 'nullable|string|max:1000',
                'parent_role_id' => 'nullable|exists:roles,id',
                'department' => 'nullable|string|max:255',
                'priority' => 'nullable|integer|min:1|max:100',
                'permissions' => 'nullable|array',
                'permissions.*' => 'string',
                'conditions' => 'nullable|array',
                'is_inheritable' => 'boolean',
                'expires_at' => 'nullable|date|after:now'
            ]);

            // التحقق من عدم إنشاء دائرة في التسلسل الهرمي
            if (isset($validatedData['parent_role_id']) && $validatedData['parent_role_id']) {
                $newParentRole = Role::find($validatedData['parent_role_id']);
                if (!$role->canInheritFrom($newParentRole)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot set parent role: would create circular hierarchy'
                    ], 400);
                }
            }

            $role->update($validatedData);
            
            // تحديث مستوى التسلسل الهرمي
            $role->updateHierarchyLevel();

            $role->load(['parentRole', 'childRoles']);

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
     * حذف دور
     */
    public function destroy(Role $role): JsonResponse
    {
        try {
            // التحقق من عدم إمكانية حذف الأدوار النظامية
            if ($role->is_system_role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete system roles'
                ], 400);
            }

            // التحقق من عدم وجود مستخدمين مرتبطين
            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role with assigned users'
                ], 400);
            }

            // التحقق من عدم وجود أدوار فرعية
            if ($role->childRoles()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role with child roles. Please reassign or delete child roles first.'
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
     * إضافة صلاحية لدور مع شروط
     */
    public function addPermissionWithConditions(Request $request, Role $role): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'permission' => 'required|string',
                'conditions' => 'nullable|array'
            ]);

            $role->addPermissionWithConditions(
                $validatedData['permission'],
                $validatedData['conditions'] ?? []
            );

            return response()->json([
                'success' => true,
                'message' => 'Permission added successfully',
                'data' => [
                    'permission' => $validatedData['permission'],
                    'conditions' => $validatedData['conditions'] ?? []
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add permission: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إزالة صلاحية من دور
     */
    public function removePermission(Request $request, Role $role): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'permission' => 'required|string'
            ]);

            $role->removePermission($validatedData['permission']);

            return response()->json([
                'success' => true,
                'message' => 'Permission removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove permission: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على الصلاحيات المتاحة مجموعة حسب الوحدة
     */
    public function getAvailablePermissions(): JsonResponse
    {
        try {
            $permissions = Permission::getAvailablePermissions();
            
            $groupedPermissions = [];
            foreach ($permissions as $key => $permission) {
                $module = $permission['module'];
                if (!isset($groupedPermissions[$module])) {
                    $groupedPermissions[$module] = [];
                }
                $groupedPermissions[$module][$key] = $permission;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'permissions' => $permissions,
                    'grouped' => $groupedPermissions,
                    'total_count' => count($permissions)
                ],
                'message' => 'Available permissions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على الأدوار المتاحة للوراثة
     */
    public function getParentableRoles(Role $role): JsonResponse
    {
        try {
            $parentableRoles = Role::where('id', '!=', $role->id)
                ->where('hierarchy_level', '<', $role->hierarchy_level)
                ->orderBy('hierarchy_level')
                ->orderBy('priority')
                ->get()
                ->filter(function ($potentialParent) use ($role) {
                    return $role->canInheritFrom($potentialParent);
                });

            return response()->json([
                'success' => true,
                'data' => $parentableRoles->values(),
                'message' => 'Parentable roles retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve parentable roles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * بناء الشجرة الهرمية للأدوار
     */
    private function buildHierarchicalTree($roles): array
    {
        $tree = [];
        $lookup = [];

        // إنشاء lookup table
        foreach ($roles as $role) {
            $lookup[$role->id] = [
                'role' => $role,
                'children' => []
            ];
        }

        // بناء الشجرة
        foreach ($roles as $role) {
            if ($role->parent_role_id && isset($lookup[$role->parent_role_id])) {
                $lookup[$role->parent_role_id]['children'][] = &$lookup[$role->id];
            } else {
                $tree[] = &$lookup[$role->id];
            }
        }

        return $tree;
    }
}