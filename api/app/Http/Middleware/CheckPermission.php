<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission, string $scope = null): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = auth()->user();

        // Admin bypass - check for administrator role
        if ($user->hasRole('administrator')) {
            return $next($request);
        }

        // Get resource from request if available
        $resource = $this->getResourceFromRequest($request);

        // Build full permission name with scope
        $fullPermission = $this->buildPermissionName($permission, $scope, $user, $resource);

        // Check if user has required permission
        if (!$user->hasPermission($fullPermission, $resource)) {
            return response()->json([
                'message' => 'Insufficient permissions',
                'required_permission' => $fullPermission,
                'user_permissions' => $user->getAllPermissions(),
                'user_role' => $user->role?->name,
                'user_department' => $user->getDepartment()
            ], 403);
        }

        return $next($request);
    }

    /**
     * استخراج المورد من الطلب
     */
    private function getResourceFromRequest(Request $request)
    {
        // محاولة الحصول على المورد من المعاملات
        $resourceId = $request->route('id') ?? $request->route('order') ?? $request->route('worker') ?? $request->route('inventory');
        
        if ($resourceId && is_numeric($resourceId)) {
            // محاولة تحديد نوع المورد من المسار
            $path = $request->path();
            
            if (str_contains($path, 'orders')) {
                return \App\Models\Order::find($resourceId);
            } elseif (str_contains($path, 'workers')) {
                return \App\Models\Worker::find($resourceId);
            } elseif (str_contains($path, 'inventory')) {
                return \App\Models\Material::find($resourceId);
            } elseif (str_contains($path, 'clients')) {
                return \App\Models\Client::find($resourceId);
            }
        }

        return null;
    }

    /**
     * بناء اسم الصلاحية الكامل مع النطاق
     */
    private function buildPermissionName(string $permission, ?string $scope, $user, $resource): string
    {
        // إذا لم يتم تحديد نطاق، جرب تحديده تلقائياً
        if (!$scope) {
            $scope = $this->determineScope($user, $resource);
        }

        // إذا كانت الصلاحية تحتوي على نطاق مسبقاً، استخدمها كما هي
        if (str_contains($permission, '.own') || str_contains($permission, '.department') || str_contains($permission, '.all')) {
            return $permission;
        }

        // بناء اسم الصلاحية مع النطاق
        if ($scope) {
            return $permission . '.' . $scope;
        }

        return $permission;
    }

    /**
     * تحديد النطاق المناسب بناءً على المستخدم والمورد
     */
    private function determineScope($user, $resource): string
    {
        if (!$resource) {
            // إذا لم يكن هناك مورد محدد، ابدأ بالنطاق الأوسع المتاح
            if ($user->hasPermission('*.all')) {
                return 'all';
            } elseif ($user->hasPermission('*.department')) {
                return 'department';
            } else {
                return 'own';
            }
        }

        // فحص ملكية المورد
        if ($this->isResourceOwnedByUser($resource, $user)) {
            return 'own';
        }

        // فحص انتماء المورد لنفس القسم
        if ($this->isResourceInUserDepartment($resource, $user)) {
            return 'department';
        }

        // الافتراضي هو النطاق العام
        return 'all';
    }

    /**
     * فحص ما إذا كان المورد مملوك للمستخدم
     */
    private function isResourceOwnedByUser($resource, $user): bool
    {
        if (!$resource || !$user) {
            return false;
        }

        // فحص الخصائص المختلفة للملكية
        $ownershipProperties = ['user_id', 'created_by', 'assigned_to', 'owner_id'];
        
        foreach ($ownershipProperties as $property) {
            if (isset($resource->$property) && $resource->$property == $user->id) {
                return true;
            }
        }

        return false;
    }

    /**
     * فحص ما إذا كان المورد في نفس قسم المستخدم
     */
    private function isResourceInUserDepartment($resource, $user): bool
    {
        if (!$resource || !$user) {
            return false;
        }

        $userDepartment = $user->getDepartment();
        
        if (!$userDepartment) {
            return false;
        }

        // فحص قسم المورد
        if (method_exists($resource, 'getDepartment')) {
            return $resource->getDepartment() === $userDepartment;
        }

        // فحص خاصية department
        if (isset($resource->department)) {
            return $resource->department === $userDepartment;
        }

        return false;
    }
}