<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class WorkerRoleSeeder extends Seeder
{
    public function run()
    {
        // Worker role with basic permissions
        $workerRole = Role::firstOrCreate(
            ['name' => 'worker'],
            [
                'display_name' => 'عامل',
                'description' => 'عامل في الورشة مع صلاحيات أساسية',
                'permissions' => json_encode([
                    'attendance.view_own',
                    'tasks.view_assigned',
                    'tasks.update_status',
                    'profile.view',
                    'profile.edit',
                    'dashboard.view_worker'
                ]),
                'is_system_role' => false,
                'hierarchy_level' => 10, // Lower level than admin
                'priority' => 10,
                'department' => 'Production'
            ]
        );
        
        echo "Worker role created/updated: " . $workerRole->id . "\n";
        echo "Role name: " . $workerRole->display_name . "\n";
        $permissions = is_array($workerRole->permissions) ? $workerRole->permissions : json_decode($workerRole->permissions, true);
        echo "Permissions: " . count($permissions) . "\n";
    }
}