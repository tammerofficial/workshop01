<?php
// Simple API without Laravel routing for testing
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get the request path
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    $path = parse_url($requestUri, PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    
    // Simple routing
    if (strpos($path, '/simple-api.php/roles') !== false) {
        // Mock roles data
        $roles = [
            [
                'id' => 1,
                'name' => 'admin',
                'display_name' => 'مدير النظام',
                'description' => 'مدير عام للنظام',
                'users_count' => 1
            ],
            [
                'id' => 2,
                'name' => 'manager',
                'display_name' => 'مدير الورشة',
                'description' => 'مدير الورشة والإنتاج',
                'users_count' => 3
            ],
            [
                'id' => 3,
                'name' => 'worker',
                'display_name' => 'عامل',
                'description' => 'عامل في الورشة',
                'users_count' => 10
            ]
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $roles,
            'message' => 'Roles retrieved successfully'
        ]);
        
    } elseif (strpos($path, '/simple-api.php/users') !== false) {
        // Mock users data
        $users = [
            [
                'id' => 1,
                'name' => 'أحمد محمد',
                'email' => 'admin@workshop.com',
                'role' => [
                    'id' => 1,
                    'name' => 'admin',
                    'display_name' => 'مدير النظام'
                ],
                'is_active' => true,
                'created_at' => '2025-01-01 10:00:00'
            ],
            [
                'id' => 2,
                'name' => 'سارة أحمد',
                'email' => 'manager@workshop.com',
                'role' => [
                    'id' => 2,
                    'name' => 'manager',
                    'display_name' => 'مدير الورشة'
                ],
                'is_active' => true,
                'created_at' => '2025-01-02 11:00:00'
            ]
        ];
        
        echo json_encode([
            'success' => true,
            'data' => [
                'data' => $users,
                'total' => count($users)
            ],
            'message' => 'Users retrieved successfully'
        ]);
        
    } elseif (strpos($path, '/simple-api.php/dashboard') !== false) {
        // Mock dashboard data
        echo json_encode([
            'success' => true,
            'data' => [
                'total_orders' => 150,
                'total_users' => 25,
                'total_products' => 80,
                'total_clients' => 45,
                'active_workers' => 12,
                'pending_orders' => 8,
                'completed_orders' => 142,
                'revenue_this_month' => 125000
            ],
            'message' => 'Dashboard stats retrieved successfully'
        ]);
        
    } else {
        // Default response
        echo json_encode([
            'success' => true,
            'message' => 'Workshop API is working!',
            'available_endpoints' => [
                'GET /simple-api.php/roles' => 'Get all roles',
                'GET /simple-api.php/users' => 'Get all users',
                'GET /simple-api.php/dashboard' => 'Get dashboard stats'
            ],
            'server_info' => [
                'method' => $method,
                'path' => $path,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'API Error: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>