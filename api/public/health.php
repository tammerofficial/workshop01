<?php
// Health check for Laravel API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Check if Laravel files exist
    $laravelPath = __DIR__ . '/../';
    $artisanExists = file_exists($laravelPath . 'artisan');
    $envExists = file_exists($laravelPath . '.env');
    $vendorExists = is_dir($laravelPath . 'vendor');
    
    // Try to load Laravel
    if ($vendorExists && file_exists($laravelPath . 'vendor/autoload.php')) {
        require_once $laravelPath . 'vendor/autoload.php';
        
        if (file_exists($laravelPath . 'bootstrap/app.php')) {
            $app = require_once $laravelPath . 'bootstrap/app.php';
            $laravelLoaded = true;
        } else {
            $laravelLoaded = false;
        }
    } else {
        $laravelLoaded = false;
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Health check completed',
        'checks' => [
            'artisan_exists' => $artisanExists,
            'env_exists' => $envExists,
            'vendor_exists' => $vendorExists,
            'laravel_loaded' => $laravelLoaded,
        ],
        'paths' => [
            'current_dir' => __DIR__,
            'laravel_path' => $laravelPath,
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Health check failed',
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>