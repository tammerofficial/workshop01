<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * عرض قائمة الأدوار مع التسلسل الهرمي
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Role::with(['parentRole', 'childRoles', 'users']);

            // البحث
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // ترتيب حسب المستوى الهرمي
            $roles = $query->orderBy('hierarchy_level')->orderBy('priority')->get();

            // إضافة معلومات إضافية لكل دور
            $roles->each(function($role) {
                $role->users_count = $role->users->count();
                $role->permissions_count = is_array($role->permissions) ? count($role->permissions) : 0;
                $role->children_count = $role->childRoles->count();
                
                // معلومات الدور الأب
                if ($role->parentRole) {
                    $role->parent_display_name = $role->parentRole->display_name;
                }
            });

            return response()->json([
                'success' => true,
                'data' => $roles,
                'summary' => [
                    'total_roles' => Role::count(),
                    'system_roles' => Role::where('is_system_role', true)->count(),
                    'custom_roles' => Role::where('is_system_role', false)->count(),
                    'inheritable_roles' => Role::where('is_inheritable', true)->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الأدوار: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء دور جديد
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles,name',
                'display_name' => 'required|string|max:255',
                'description' => 'required|string|max:1000',
                'parent_role_id' => 'nullable|exists:roles,id',
                'department' => 'nullable|string|max:255',
                'is_inheritable' => 'boolean',
                'permissions' => 'array',
                'permissions.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // تحديد المستوى الهرمي
            $hierarchyLevel = 0;
            $priority = 1;
            
            if ($request->parent_role_id) {
                $parentRole = Role::find($request->parent_role_id);
                $hierarchyLevel = $parentRole->hierarchy_level + 1;
                $priority = $parentRole->priority + 1;
            }

            // إنشاء الدور
            $role = Role::create([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'parent_role_id' => $request->parent_role_id,
                'hierarchy_level' => $hierarchyLevel,
                'priority' => $priority,
                'department' => $request->department,
                'is_system_role' => false, // الأدوار المنشأة يدوياً ليست أدوار نظام
                'is_inheritable' => $request->get('is_inheritable', true),
                'permissions' => $request->get('permissions', [])
            ]);

            // تحديث المستويات الهرمية للأدوار التابعة
            $this->updateChildrenHierarchy($role);

            DB::commit();

            // تحميل العلاقات
            $role->load(['parentRole', 'childRoles', 'users']);
            $role->users_count = $role->users->count();
            $role->permissions_count = is_array($role->permissions) ? count($role->permissions) : 0;

            // تسجيل النشاط
            activity()
                ->performedOn($role)
                ->causedBy(auth()->user())
                ->withProperties(['action' => 'role_created'])
                ->log('تم إنشاء دور جديد: ' . $role->display_name);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الدور بنجاح',
                'data' => $role
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في إنشاء الدور: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض دور محدد
     */
    public function show(Role $role): JsonResponse
    {
        try {
            $role->load(['parentRole', 'childRoles.users', 'users.activityLogs' => function($query) {
                $query->latest()->limit(5);
            }]);

            $role->users_count = $role->users->count();
            $role->permissions_count = is_array($role->permissions) ? count($role->permissions) : 0;
            $role->children_count = $role->childRoles->count();

            // إحصائيات إضافية
            $role->total_inherited_users = $this->getTotalInheritedUsers($role);
            $role->permission_groups = $this->groupPermissionsByModule($role->permissions);

            return response()->json([
                'success' => true,
                'data' => $role
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب بيانات الدور: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث دور
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        try {
            // التحقق من عدم تعديل أدوار النظام الأساسية
            if ($role->is_system_role && !auth()->user()->hasRole('system_super_admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن تعديل أدوار النظام'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
                'display_name' => 'required|string|max:255',
                'description' => 'required|string|max:1000',
                'parent_role_id' => 'nullable|exists:roles,id|not_in:' . $role->id,
                'department' => 'nullable|string|max:255',
                'is_inheritable' => 'boolean',
                'permissions' => 'array',
                'permissions.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $oldData = $role->toArray();

            // تحديث الدور
            $updateData = [
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'parent_role_id' => $request->parent_role_id,
                'department' => $request->department,
                'is_inheritable' => $request->get('is_inheritable', true),
                'permissions' => $request->get('permissions', [])
            ];

            // إعادة حساب المستوى الهرمي إذا تم تغيير الدور الأب
            if ($request->parent_role_id !== $role->parent_role_id) {
                if ($request->parent_role_id) {
                    $parentRole = Role::find($request->parent_role_id);
                    $updateData['hierarchy_level'] = $parentRole->hierarchy_level + 1;
                    $updateData['priority'] = $parentRole->priority + 1;
                } else {
                    $updateData['hierarchy_level'] = 0;
                    $updateData['priority'] = 1;
                }
            }

            $role->update($updateData);

            // تحديث المستويات الهرمية للأدوار التابعة
            $this->updateChildrenHierarchy($role);

            DB::commit();

            $role->load(['parentRole', 'childRoles', 'users']);
            $role->users_count = $role->users->count();
            $role->permissions_count = is_array($role->permissions) ? count($role->permissions) : 0;

            // تسجيل النشاط
            activity()
                ->performedOn($role)
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => 'role_updated',
                    'old_data' => $oldData,
                    'new_data' => $role->toArray()
                ])
                ->log('تم تحديث الدور: ' . $role->display_name);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الدور بنجاح',
                'data' => $role
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث الدور: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف دور
     */
    public function destroy(Role $role): JsonResponse
    {
        try {
            // التحقق من عدم حذف أدوار النظام
            if ($role->is_system_role) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف أدوار النظام'
                ], 403);
            }

            // التحقق من عدم وجود مستخدمين مرتبطين
            if ($role->users()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف الدور لأن هناك مستخدمين مرتبطين به'
                ], 403);
            }

            // التحقق من عدم وجود أدوار تابعة
            if ($role->childRoles()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف الدور لأن هناك أدوار تابعة له'
                ], 403);
            }

            $roleName = $role->display_name;
            $role->delete();

            // تسجيل النشاط
            activity()
                ->causedBy(auth()->user())
                ->withProperties(['action' => 'role_deleted', 'deleted_role' => $roleName])
                ->log('تم حذف الدور: ' . $roleName);

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الدور بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف الدور: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث صلاحيات دور
     */
    public function updatePermissions(Request $request, Role $role): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'permissions' => 'required|array',
                'permissions.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldPermissions = $role->permissions;
            $role->update(['permissions' => $request->permissions]);

            // تسجيل النشاط
            activity()
                ->performedOn($role)
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => 'permissions_updated',
                    'old_permissions' => $oldPermissions,
                    'new_permissions' => $request->permissions
                ])
                ->log('تم تحديث صلاحيات الدور: ' . $role->display_name);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الصلاحيات بنجاح',
                'data' => $role
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث الصلاحيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على جميع الصلاحيات المتاحة مجمعة حسب الوحدة
     */
    public function getAvailablePermissions(): JsonResponse
    {
        try {
            $permissions = Permission::getAvailablePermissions();
            
            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الصلاحيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على الأدوار المتاحة للاختيار كدور أب
     */
    public function getParentableRoles(Role $role): JsonResponse
    {
        try {
            // استبعاد الدور نفسه وأدواره التابعة لتجنب الحلقات
            $excludedIds = $this->getAllChildrenIds($role);
            $excludedIds[] = $role->id;

            $parentableRoles = Role::whereNotIn('id', $excludedIds)
                ->where('hierarchy_level', '<', 10) // تحديد عمق أقصى للهرم
                ->orderBy('hierarchy_level')
                ->orderBy('priority')
                ->get(['id', 'name', 'display_name', 'hierarchy_level']);

            return response()->json([
                'success' => true,
                'data' => $parentableRoles
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الأدوار المتاحة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إحصائيات الأدوار
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_roles' => Role::count(),
                'system_roles' => Role::where('is_system_role', true)->count(),
                'custom_roles' => Role::where('is_system_role', false)->count(),
                'inheritable_roles' => Role::where('is_inheritable', true)->count(),
                'roles_with_users' => Role::has('users')->count(),
                'empty_roles' => Role::doesntHave('users')->count(),
                'hierarchy_levels' => Role::max('hierarchy_level') + 1,
                'roles_by_level' => Role::selectRaw('hierarchy_level, COUNT(*) as count')
                    ->groupBy('hierarchy_level')
                    ->orderBy('hierarchy_level')
                    ->get(),
                'roles_by_department' => Role::selectRaw('department, COUNT(*) as count')
                    ->whereNotNull('department')
                    ->groupBy('department')
                    ->get(),
                'top_roles_by_users' => Role::withCount('users')
                    ->orderByDesc('users_count')
                    ->limit(5)
                    ->get(['id', 'display_name', 'users_count']),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الإحصائيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث التسلسل الهرمي للأدوار التابعة
     */
    private function updateChildrenHierarchy(Role $role): void
    {
        $children = $role->childRoles;
        
        foreach ($children as $child) {
            $child->update([
                'hierarchy_level' => $role->hierarchy_level + 1,
                'priority' => $role->priority + 1
            ]);
            
            // تحديث تكراري للأطفال
            $this->updateChildrenHierarchy($child);
        }
    }

    /**
     * الحصول على جميع معرفات الأدوار التابعة (recursive)
     */
    private function getAllChildrenIds(Role $role): array
    {
        $ids = [];
        
        foreach ($role->childRoles as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->getAllChildrenIds($child));
        }
        
        return $ids;
    }

    /**
     * حساب إجمالي المستخدمين الوارثين للدور
     */
    private function getTotalInheritedUsers(Role $role): int
    {
        $count = $role->users->count();
        
        foreach ($role->childRoles as $child) {
            $count += $this->getTotalInheritedUsers($child);
        }
        
        return $count;
    }

    /**
     * تجميع الصلاحيات حسب الوحدة
     */
    private function groupPermissionsByModule(array $permissions): array
    {
        $grouped = [];
        
        foreach ($permissions as $permission) {
            $parts = explode('.', $permission);
            $module = $parts[0] ?? 'general';
            
            if (!isset($grouped[$module])) {
                $grouped[$module] = [];
            }
            
            $grouped[$module][] = $permission;
        }
        
        return $grouped;
    }
}