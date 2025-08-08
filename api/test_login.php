<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    echo "Testing login functionality...\n";
    
    // Test 1: Check if user exists
    $user = User::where('email', 'superadmin@gmail.com')->first();
    if (!$user) {
        echo "❌ User not found\n";
        exit(1);
    }
    
    echo "✅ User found: " . $user->name . " (" . $user->email . ")\n";
    echo "✅ User active: " . ($user->is_active ? 'Yes' : 'No') . "\n";
    
    // Test 2: Check password
    if (!Hash::check('admin123', $user->password)) {
        echo "❌ Password doesn't match\n";
        exit(1);
    }
    
    echo "✅ Password matches\n";
    
    // Test 3: Check roles
    $user->load(['roles']);
    $roles = $user->roles->pluck('name')->toArray();
    echo "✅ User roles: " . implode(', ', $roles) . "\n";
    
    // Test 4: Check permissions
    $permissions = $user->getAllPermissions()->pluck('name')->toArray();
    echo "✅ User permissions count: " . count($permissions) . "\n";
    
    // Test 5: Create token
    $token = $user->createToken('test_token')->plainTextToken;
    echo "✅ Token created: " . substr($token, 0, 20) . "...\n";
    
    echo "\n🎉 All tests passed! Login should work.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}