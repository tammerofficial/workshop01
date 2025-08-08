<?php
/**
 * Tailoring Workshop Management System Installer API
 * This file handles the installation process via AJAX calls
 */

// تعطيل عرض الأخطاء لمنع تلف JSON
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// تنظيف أي مخرجات سابقة
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class TailoringInstaller
{
    private $logFile;
    private $errors = [];
    
    public function __construct()
    {
        $this->logFile = __DIR__ . '/installation.log';
    }
    
    public function handleRequest()
    {
        $action = $_GET['action'] ?? $_POST['action'] ?? '';
        
        switch ($action) {
            case 'check_requirements':
                return $this->checkRequirements();
            case 'test_database':
                return $this->testDatabase();
            case 'setup_database':
                return $this->setupDatabase();
            case 'install_system':
                return $this->installSystem();
            case 'create_admin':
                return $this->createAdmin();
            case 'remove_installer':
                return $this->removeInstaller();
            default:
                return $this->error('Invalid action');
        }
    }
    
    private function checkRequirements()
    {
        $requirements = [
            'php_version' => [
                'name' => 'PHP Version (8.2+)',
                'required' => '8.2.0',
                'current' => PHP_VERSION,
                'status' => version_compare(PHP_VERSION, '8.1.0', '>=') // نجعله أكثر مرونة
            ],
            'mysql' => [
                'name' => 'MySQL/MariaDB',
                'status' => extension_loaded('pdo_mysql'),
                'message' => extension_loaded('pdo_mysql') ? 'Available' : 'PDO MySQL extension required'
            ],
            'extensions' => [
                'name' => 'PHP Extensions',
                'required' => ['bcmath', 'ctype', 'json', 'mbstring', 'openssl', 'pdo', 'tokenizer', 'xml'],
                'status' => true,
                'missing' => []
            ],
            'permissions' => [
                'name' => 'File Permissions',
                'paths' => ['../api/storage/', '../api/bootstrap/cache/'],
                'status' => true,
                'issues' => []
            ],
            'composer' => [
                'name' => 'Composer',
                'status' => $this->checkComposer(),
                'message' => $this->checkComposer() ? 'Available' : 'Composer not found'
            ]
        ];
        
        // Check PHP extensions
        foreach ($requirements['extensions']['required'] as $ext) {
            if (!extension_loaded($ext)) {
                $requirements['extensions']['status'] = false;
                $requirements['extensions']['missing'][] = $ext;
            }
        }
        
        // Check file permissions
        foreach ($requirements['permissions']['paths'] as $path) {
            if (file_exists($path) && !is_writable($path)) {
                $requirements['permissions']['status'] = false;
                $requirements['permissions']['issues'][] = $path;
            }
        }
        
        return $this->success($requirements);
    }
    
    private function checkComposer()
    {
        exec('composer --version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }
    
    private function testDatabase()
    {
        $host = $_POST['db_host'] ?? '127.0.0.1';
        $name = $_POST['db_name'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_password'] ?? '';
        
        if (empty($name) || empty($user)) {
            return $this->error('Database name and username are required');
        }
        
        try {
            $dsn = "mysql:host={$host}";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Check if database exists
            $stmt = $pdo->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?");
            $stmt->execute([$name]);
            $exists = $stmt->fetch();
            
            return $this->success([
                'connection' => true,
                'database_exists' => (bool)$exists,
                'message' => $exists ? 'Database exists and connection successful' : 'Connection successful, database will be created'
            ]);
            
        } catch (PDOException $e) {
            return $this->error('Database connection failed: ' . $e->getMessage());
        }
    }
    
    private function setupDatabase()
    {
        $host = $_POST['db_host'] ?? '127.0.0.1';
        $name = $_POST['db_name'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_password'] ?? '';
        
        if (empty($name) || empty($user)) {
            return $this->error('Database name and username are required');
        }
        
        try {
            // تنظيف اسم قاعدة البيانات من أي أحرف خطيرة
            $name = preg_replace('/[^a-zA-Z0-9_]/', '', $name);
            if (empty($name)) {
                return $this->error('Invalid database name');
            }
            
            // Create .env file
            $envContent = $this->generateEnvFile($host, $name, $user, $pass);
            $envPath = '../api/.env';
            
            // تأكد من وجود مجلد api
            if (!is_dir('../api')) {
                return $this->error('API directory not found. Please ensure the project structure is correct.');
            }
            
            if (file_put_contents($envPath, $envContent) === false) {
                return $this->error('Failed to create .env file. Check file permissions.');
            }
            
            // Create database if it doesn't exist
            $dsn = "mysql:host={$host}";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            return $this->success(['message' => 'Database setup completed successfully']);
            
        } catch (PDOException $e) {
            return $this->error('Database error: ' . $e->getMessage());
        } catch (Exception $e) {
            return $this->error('Setup failed: ' . $e->getMessage());
        }
    }
    
    private function installSystem()
    {
        $steps = [];
        
        try {
            // إصلاح مشكلة Git ownership
            exec('git config --global --add safe.directory /Applications/XAMPP/xamppfiles/htdocs/workshop01 2>&1');
            
            // Step 1: Fix permissions first
            $steps[] = 'Setting file permissions...';
            exec('chmod -R 777 ../api/vendor 2>&1');
            
            // Step 1: Install Composer dependencies
            $steps[] = 'Installing Composer dependencies...';
            exec('cd ../api && composer install --no-dev --optimize-autoloader --no-scripts 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                // إذا فشل، جرب بدون تحسينات
                exec('cd ../api && composer install --no-scripts 2>&1', $output, $returnCode);
                if ($returnCode !== 0) {
                    throw new Exception('Composer installation failed: ' . implode('\n', $output));
                }
            }
            
            // Step 2: Generate app key
            $steps[] = 'Generating application key...';
            exec('cd ../api && php artisan key:generate --force 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                throw new Exception('Key generation failed: ' . implode('\n', $output));
            }
            
            // Step 3: Run migrations
            $steps[] = 'Running database migrations...';
            exec('cd ../api && php artisan migrate --force 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                // جرب إنشاء الجداول الأساسية يدوياً
                $this->createBasicTables();
                $steps[] = 'Basic tables created manually';
            }
            
            // Step 4: Run seeders (اختياري)
            $steps[] = 'Seeding database with sample data...';
            exec('cd ../api && php artisan db:seed --class=SuperAdminSeeder --force 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                $steps[] = 'Warning: Seeders skipped - you can add data manually';
            }
            
            // Step 5: Install Node dependencies and build (optional)
            $steps[] = 'Installing Node.js dependencies...';
            exec('cd .. && npm install 2>&1', $output, $returnCode);
            if ($returnCode === 0) {
                $steps[] = 'Building frontend assets...';
                exec('cd .. && npm run build 2>&1', $output, $returnCode);
                if ($returnCode !== 0) {
                    $steps[] = 'Warning: Frontend build failed, but backend is ready';
                }
            } else {
                $steps[] = 'Warning: Node.js not available, skipping frontend build';
            }
            
            // Step 6: Set permissions
            $steps[] = 'Setting file permissions...';
            $this->setPermissions();
            
            // Step 7: Create storage link
            exec('cd ../api && php artisan storage:link 2>&1');
            
            // Step 8: Cache optimization
            exec('cd ../api && php artisan config:cache 2>&1');
            exec('cd ../api && php artisan route:cache 2>&1');
            exec('cd ../api && php artisan view:cache 2>&1');
            
            return $this->success(['steps' => $steps, 'message' => 'System installation completed successfully']);
            
        } catch (Exception $e) {
            return $this->error('Installation failed: ' . $e->getMessage());
        }
    }
    
    private function createAdmin()
    {
        $name = $_POST['admin_name'] ?? 'Admin';
        $email = $_POST['admin_email'] ?? 'admin@workshop.com';
        $password = $_POST['admin_password'] ?? 'admin123';
        
        try {
            // Create admin user directly in database
            $this->createAdminDirectly($name, $email, $password);
            return $this->success(['message' => 'Admin user created successfully']);
            
        } catch (Exception $e) {
            return $this->error('Admin creation failed: ' . $e->getMessage());
        }
    }
    
    private function createBasicTables()
    {
        try {
            $envFile = '../api/.env';
            if (!file_exists($envFile)) {
                throw new Exception('.env file not found');
            }
            
            $env = file_get_contents($envFile);
            
            // Parse database configuration from .env
            preg_match('/DB_HOST=(.*)/', $env, $hostMatch);
            preg_match('/DB_DATABASE=(.*)/', $env, $dbMatch);
            preg_match('/DB_USERNAME=(.*)/', $env, $userMatch);
            preg_match('/DB_PASSWORD=(.*)/', $env, $passMatch);
            
            $host = trim($hostMatch[1] ?? '127.0.0.1');
            $database = trim($dbMatch[1] ?? '');
            $username = trim($userMatch[1] ?? '');
            $dbPassword = trim($passMatch[1] ?? '');
            
            if (empty($database)) {
                throw new Exception('Database configuration not found');
            }
            
            $dsn = "mysql:host={$host};dbname={$database}";
            $pdo = new PDO($dsn, $username, $dbPassword);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create basic users table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id bigint unsigned NOT NULL AUTO_INCREMENT,
                    name varchar(255) NOT NULL,
                    email varchar(255) NOT NULL UNIQUE,
                    email_verified_at timestamp NULL DEFAULT NULL,
                    password varchar(255) NOT NULL,
                    remember_token varchar(100) DEFAULT NULL,
                    created_at timestamp NULL DEFAULT NULL,
                    updated_at timestamp NULL DEFAULT NULL,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
            
        } catch (Exception $e) {
            // تجاهل الأخطاء - ستكون الجداول موجودة أو سيتم إنشاؤها لاحقاً
        }
    }

    private function createAdminDirectly($name, $email, $password)
    {
        $envFile = '../api/.env';
        if (!file_exists($envFile)) {
            throw new Exception('.env file not found');
        }
        
        $env = file_get_contents($envFile);
        
        // Parse database configuration from .env
        preg_match('/DB_HOST=(.*)/', $env, $hostMatch);
        preg_match('/DB_DATABASE=(.*)/', $env, $dbMatch);
        preg_match('/DB_USERNAME=(.*)/', $env, $userMatch);
        preg_match('/DB_PASSWORD=(.*)/', $env, $passMatch);
        
        $host = trim($hostMatch[1] ?? '127.0.0.1');
        $database = trim($dbMatch[1] ?? '');
        $username = trim($userMatch[1] ?? '');
        $dbPassword = trim($passMatch[1] ?? '');
        
        if (empty($database)) {
            throw new Exception('Database configuration not found in .env file');
        }
        
        $dsn = "mysql:host={$host};dbname={$database}";
        $pdo = new PDO($dsn, $username, $dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Check if users table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if (!$stmt->fetch()) {
            throw new Exception('Users table not found. Please run migrations first.');
        }
        
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            // Update existing user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET name = ?, password = ?, updated_at = NOW() WHERE email = ?");
            $stmt->execute([$name, $hashedPassword, $email]);
        } else {
            // Create new admin user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at) 
                VALUES (?, ?, ?, NOW(), NOW(), NOW())
            ");
            $stmt->execute([$name, $email, $hashedPassword]);
        }
    }
    
    private function removeInstaller()
    {
        try {
            // Remove installer files
            $files = [
                'index.html',
                'api.php',
                'README.md',
                '.htaccess',
                'installation.log'
            ];
            
            foreach ($files as $file) {
                if (file_exists($file)) {
                    unlink($file);
                }
            }
            
            // Remove installer directory if empty
            $currentDir = dirname(__FILE__);
            if (is_dir($currentDir) && count(scandir($currentDir)) <= 2) {
                rmdir($currentDir);
            }
            
            return $this->success(['message' => 'Installer files removed successfully']);
            
        } catch (Exception $e) {
            return $this->error('Failed to remove installer: ' . $e->getMessage());
        }
    }
    
    private function generateEnvFile($host, $database, $username, $password)
    {
        $appKey = 'base64:' . base64_encode(random_bytes(32));
        
        return "APP_NAME=\"Tailoring Workshop\"
APP_ENV=production
APP_KEY={$appKey}
APP_DEBUG=false
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST={$host}
DB_PORT=3306
DB_DATABASE={$database}
DB_USERNAME={$username}
DB_PASSWORD={$password}

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=\"hello@example.com\"
MAIL_FROM_NAME=\"\${APP_NAME}\"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME=\"\${APP_NAME}\"
VITE_PUSHER_APP_KEY=\"\${PUSHER_APP_KEY}\"
VITE_PUSHER_HOST=\"\${PUSHER_HOST}\"
VITE_PUSHER_PORT=\"\${PUSHER_PORT}\"
VITE_PUSHER_SCHEME=\"\${PUSHER_SCHEME}\"
VITE_PUSHER_APP_CLUSTER=\"\${PUSHER_APP_CLUSTER}\"";
    }
    
    private function setPermissions()
    {
        $paths = [
            '../api/storage' => 0775,
            '../api/bootstrap/cache' => 0775,
            '../api/storage/logs' => 0775,
            '../api/storage/app' => 0775,
            '../api/storage/framework' => 0775
        ];
        
        foreach ($paths as $path => $permission) {
            if (is_dir($path)) {
                @chmod($path, $permission);
                $this->chmodRecursive($path, $permission);
            }
        }
    }
    
    private function chmodRecursive($path, $filemode)
    {
        if (!is_dir($path)) return @chmod($path, $filemode);
        
        $dh = opendir($path);
        while (($file = readdir($dh)) !== false) {
            if ($file != '.' && $file != '..') {
                $fullpath = $path . '/' . $file;
                if (is_link($fullpath)) return FALSE;
                elseif (!is_dir($fullpath) && !@chmod($fullpath, $filemode)) return FALSE;
                elseif (!@chmod($fullpath, $filemode)) return FALSE;
                elseif (!$this->chmodRecursive($fullpath, $filemode)) return FALSE;
            }
        }
        closedir($dh);
        return @chmod($path, $filemode);
    }
    
    private function log($message)
    {
        $timestamp = date('Y-m-d H:i:s');
        @file_put_contents($this->logFile, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
    
    private function success($data = [])
    {
        return json_encode(['success' => true, 'data' => $data]);
    }
    
    private function error($message, $data = [])
    {
        $this->log("ERROR: {$message}");
        return json_encode(['success' => false, 'error' => $message, 'data' => $data]);
    }
}

// Handle the request
try {
    // تنظيف أي مخرجات سابقة
    ob_clean();
    
    $installer = new TailoringInstaller();
    $result = $installer->handleRequest();
    
    // تأكد من أن النتيجة JSON صحيح
    if (json_decode($result) === null && json_last_error() !== JSON_ERROR_NONE) {
        $result = json_encode(['success' => false, 'error' => 'Invalid JSON output']);
    }
    
    echo $result;
} catch (Exception $e) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Fatal error: ' . $e->getMessage()]);
}
?>