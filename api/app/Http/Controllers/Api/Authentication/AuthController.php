<?php

namespace App\Http\Controllers\Api\Authentication;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\HasApiTokens;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,manager,accountant,worker'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true
        ]);

        // Assign role-based permissions
        $this->assignRolePermissions($user, $request->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load roles using Spatie permissions
        $user->load(['roles']);
        
        // Get the first role (assuming single role per user for simplicity)
        $primaryRole = $user->roles->first();
        
        // Get all user permissions using Spatie methods - handle potential issues
        try {
            $permissionsCollection = $user->getAllPermissions();
            $allPermissions = is_array($permissionsCollection) ? [] : $permissionsCollection->pluck('name')->toArray();
        } catch (\Exception $e) {
            // Fallback to empty array if permissions can't be loaded
            $allPermissions = [];
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department,
                    'role' => [
                        'id' => $primaryRole?->id,
                        'name' => $primaryRole?->name,
                        'display_name' => $primaryRole?->name ?? 'مستخدم',
                        'permissions' => $allPermissions
                    ],
                    'permissions' => $allPermissions
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('permissions')
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices']);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Assign role-based permissions
     */
    private function assignRolePermissions(User $user, string $role): void
    {
        $permissions = match($role) {
            'admin' => [
                'users.view', 'users.create', 'users.edit', 'users.delete',
                'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
                'production.view', 'production.manage',
                'inventory.view', 'inventory.manage',
                'workers.view', 'workers.manage',
                'reports.view', 'settings.manage'
            ],
            'manager' => [
                'orders.view', 'orders.create', 'orders.edit',
                'production.view', 'production.manage',
                'inventory.view', 'inventory.manage',
                'workers.view', 'workers.manage',
                'reports.view'
            ],
            'accountant' => [
                'orders.view', 'orders.edit',
                'production.view',
                'inventory.view',
                'reports.view',
                'payroll.view', 'payroll.manage'
            ],
            'worker' => [
                'orders.view',
                'production.view',
                'tasks.view', 'tasks.update'
            ],
            default => []
        };

        foreach ($permissions as $permission) {
            $user->permissions()->firstOrCreate(['name' => $permission]);
        }
    }
}