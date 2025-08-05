<?php

require_once 'api/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'api/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;

echo "=== SUPER ADMIN SETUP ===" . PHP_EOL;

// Find the user
$user = User::where('email', 'admin@washapp.com')->first();
if (!$user) {
    echo "❌ User not found!" . PHP_EOL;
    exit;
}

echo "✅ Found user: " . $user->name . " (" . $user->email . ")" . PHP_EOL;

// Check if super admin role exists
$superAdminRole = Role::where('name', 'super_admin')->first();
if (!$superAdminRole) {
    $superAdminRole = Role::create([
        'name' => 'super_admin',
        'display_name' => 'سوبر ادمن',
        'description' => 'Super Administrator with all permissions'
    ]);
    echo "✅ Created super admin role (ID: " . $superAdminRole->id . ")" . PHP_EOL;
} else {
    echo "✅ Super admin role already exists (ID: " . $superAdminRole->id . ")" . PHP_EOL;
}

// Set comprehensive super admin permissions
$superAdminPermissions = [
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage',
    'orders.view', 'orders.create', 'orders.edit', 'orders.delete', 'orders.manage',
    'production.view', 'production.create', 'production.edit', 'production.delete', 'production.manage',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage',
    'workers.view', 'workers.create', 'workers.edit', 'workers.delete', 'workers.manage',
    'reports.view', 'reports.create', 'reports.edit', 'reports.delete', 'reports.manage',
    'settings.view', 'settings.create', 'settings.edit', 'settings.delete', 'settings.manage',
    'dashboard.view', 'dashboard.manage',
    'analytics.view', 'analytics.manage',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.manage',
    'materials.view', 'materials.create', 'materials.edit', 'materials.delete', 'materials.manage',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.manage',
    'calendar.view', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.manage',
    'stations.view', 'stations.create', 'stations.edit', 'stations.delete', 'stations.manage',
    'boutique.view', 'boutique.create', 'boutique.edit', 'boutique.delete', 'boutique.manage',
    'pos.view', 'pos.create', 'pos.edit', 'pos.delete', 'pos.manage',
    'loyalty.view', 'loyalty.create', 'loyalty.edit', 'loyalty.delete', 'loyalty.manage',
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete', 'invoices.manage',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete', 'sales.manage',
    'biometric.view', 'biometric.create', 'biometric.edit', 'biometric.delete', 'biometric.manage',
    'workflow.view', 'workflow.create', 'workflow.edit', 'workflow.delete', 'workflow.manage',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage',
    'permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete', 'permissions.manage',
    'system.view', 'system.create', 'system.edit', 'system.delete', 'system.manage',
    'backup.view', 'backup.create', 'backup.edit', 'backup.delete', 'backup.manage',
    'logs.view', 'logs.create', 'logs.edit', 'logs.delete', 'logs.manage'
];

// Update role permissions
$superAdminRole->permissions = $superAdminPermissions;
$superAdminRole->save();

echo "✅ Updated super admin permissions (" . count($superAdminPermissions) . " permissions)" . PHP_EOL;

// Assign super admin role to user
$user->role_id = $superAdminRole->id;
$user->save();

echo "✅ User updated with super admin role" . PHP_EOL;
echo "✅ Total permissions assigned: " . count($superAdminPermissions) . PHP_EOL;

echo PHP_EOL . "=== SETUP COMPLETE ===" . PHP_EOL;
echo "User " . $user->email . " now has SUPER ADMIN access with full permissions!" . PHP_EOL;