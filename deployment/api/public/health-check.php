<?php
// ملف فحص سريع للتأكد من أن Laravel يعمل بشكل صحيح

header('Content-Type: application/json');

$checks = [
    'php_version' => PHP_VERSION,
    'laravel_readable' => file_exists(__DIR__ . '/../vendor/laravel/framework/src/Illuminate/Foundation/Application.php'),
    'env_file' => file_exists(__DIR__ . '/../.env'),
    'storage_writable' => is_writable(__DIR__ . '/../storage'),
    'cache_writable' => is_writable(__DIR__ . '/../bootstrap/cache'),
    'app_key_set' => !empty(getenv('APP_KEY')),
];

// فحص اتصال قاعدة البيانات
try {
    if (file_exists(__DIR__ . '/../.env')) {
        $env = parse_ini_file(__DIR__ . '/../.env');
        if ($env) {
            $dsn = "mysql:host={$env['DB_HOST']};dbname={$env['DB_DATABASE']}";
            $pdo = new PDO($dsn, $env['DB_USERNAME'], $env['DB_PASSWORD']);
            $checks['database_connection'] = true;
        } else {
            $checks['database_connection'] = false;
        }
    } else {
        $checks['database_connection'] = false;
    }
} catch (Exception $e) {
    $checks['database_connection'] = false;
    $checks['database_error'] = $e->getMessage();
}

$allGood = true;
foreach ($checks as $key => $value) {
    if ($key !== 'php_version' && $key !== 'database_error' && !$value) {
        $allGood = false;
        break;
    }
}

echo json_encode([
    'status' => $allGood ? 'success' : 'error',
    'message' => $allGood ? 'Laravel is ready!' : 'Some checks failed',
    'checks' => $checks,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
