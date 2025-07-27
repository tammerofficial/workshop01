<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions.
     */
    public function index(): JsonResponse
    {
        try {
            $permissions = Permission::getAvailablePermissions();
            
            // Group permissions by module
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
                'data' => $groupedPermissions,
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
     * Get permissions grouped by module.
     */
    public function getGroupedPermissions(): JsonResponse
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
                'data' => $groupedPermissions,
                'message' => 'Grouped permissions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve grouped permissions: ' . $e->getMessage()
            ], 500);
        }
    }
}
