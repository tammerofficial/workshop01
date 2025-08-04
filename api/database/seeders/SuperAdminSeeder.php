<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run()
    {
        // Get all permissions
        $allPermissions = DB::table('permissions')->pluck('name')->toArray();
        
        echo "Found " . count($allPermissions) . " permissions\n";
        
        // Create or get Super Admin role
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin'],
            [
                'display_name' => 'سوبر أدمن',
                'description' => 'صلاحيات كاملة لجميع أجزاء النظام',
                'permissions' => json_encode($allPermissions), // Store all permissions as JSON
                'is_system_role' => true,
                'hierarchy_level' => 0, // Highest level
                'priority' => 1, // Highest priority
                'department' => 'System'
            ]
        );
        
        // Update permissions if role exists
        $superAdminRole->update([
            'permissions' => json_encode($allPermissions)
        ]);
        
        echo "Super Admin role ID: " . $superAdminRole->id . "\n";
        echo "Assigned " . count($allPermissions) . " permissions to Super Admin role\n";
        
        // Create or update super admin user
        $superAdminUser = User::firstOrCreate(
            ['email' => 'superadmin@workshop.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('SuperAdmin123!'),
                'role_id' => $superAdminRole->id,
                'department' => 'System',
                'is_active' => true,
            ]
        );
        
        // Update role if user exists
        $superAdminUser->update(['role_id' => $superAdminRole->id]);
        
        echo "Super Admin user created/updated:\n";
        echo "Email: superadmin@workshop.com\n";
        echo "Password: SuperAdmin123!\n";
        echo "User ID: " . $superAdminUser->id . "\n";
        
        // Also create your personal super admin account
        $personalSuperAdmin = User::firstOrCreate(
            ['email' => 'admin@workshop.local'],
            [
                'name' => 'المدير العام',
                'password' => Hash::make('Admin123456'),
                'role_id' => $superAdminRole->id,
                'department' => 'الإدارة العامة',
                'is_active' => true,
            ]
        );
        
        $personalSuperAdmin->update(['role_id' => $superAdminRole->id]);
        
        echo "\nPersonal Super Admin account:\n";
        echo "Email: admin@workshop.local\n";
        echo "Password: Admin123456\n";
        echo "User ID: " . $personalSuperAdmin->id . "\n";
    }
}