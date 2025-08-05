<?php
/**
 * Simple Installer - للتثبيت السريع بدون مشاكل Composer
 */

// تعطيل عرض الأخطاء لمنع تلف JSON
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class SimpleInstaller
{
    public function handleRequest()
    {
        $action = $_GET['action'] ?? $_POST['action'] ?? '';
        
        switch ($action) {
            case 'setup_complete':
                return $this->setupComplete();
            default:
                return $this->error('Invalid action');
        }
    }
    
    private function setupComplete()
    {
        $host = $_POST['db_host'] ?? '127.0.0.1';
        $name = $_POST['db_name'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_password'] ?? '';
        
        if (empty($name) || empty($user)) {
            return $this->error('Database name and username are required');
        }
        
        try {
            // تنظيف اسم قاعدة البيانات
            $name = preg_replace('/[^a-zA-Z0-9_]/', '', $name);
            if (empty($name)) {
                return $this->error('Invalid database name');
            }
            
            // إنشاء قاعدة البيانات
            $dsn = "mysql:host={$host}";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // الاتصال بقاعدة البيانات
            $dsn = "mysql:host={$host};dbname={$name}";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // إنشاء جدول المستخدمين
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
            
            // إنشاء المستخدم الإداري
            $adminEmail = 'admin@workshop.com';
            $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
            
            // حذف المستخدم إذا كان موجوداً
            $stmt = $pdo->prepare("DELETE FROM users WHERE email = ?");
            $stmt->execute([$adminEmail]);
            
            // إنشاء المستخدم الجديد
            $stmt = $pdo->prepare("
                INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at) 
                VALUES (?, ?, ?, NOW(), NOW(), NOW())
            ");
            $stmt->execute(['System Admin', $adminEmail, $adminPassword]);
            
            // إنشاء ملف .env
            $envContent = $this->generateEnvFile($host, $name, $user, $pass);
            $envPath = '../api/.env';
            
            if (!is_dir('../api')) {
                return $this->error('API directory not found');
            }
            
            if (file_put_contents($envPath, $envContent) === false) {
                return $this->error('Failed to create .env file');
            }
            
            return $this->success([
                'message' => 'Installation completed successfully!',
                'admin_email' => $adminEmail,
                'admin_password' => 'admin123',
                'database' => $name
            ]);
            
        } catch (PDOException $e) {
            return $this->error('Database error: ' . $e->getMessage());
        } catch (Exception $e) {
            return $this->error('Installation failed: ' . $e->getMessage());
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

VITE_APP_NAME=\"\${APP_NAME}\"";
    }
    
    private function success($data = [])
    {
        return json_encode(['success' => true, 'data' => $data]);
    }
    
    private function error($message, $data = [])
    {
        return json_encode(['success' => false, 'error' => $message, 'data' => $data]);
    }
}

// Handle the request
try {
    ob_clean();
    $installer = new SimpleInstaller();
    echo $installer->handleRequest();
} catch (Exception $e) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Fatal error: ' . $e->getMessage()]);
}
?>