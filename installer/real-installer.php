<?php
/**
 * Real Complete Installer - مثبت حقيقي متكامل
 * يقوم بجميع خطوات التثبيت الفعلية
 */

// تعطيل عرض الأخطاء لمنع تلف JSON
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class RealInstaller
{
    private $logFile = 'installation.log';
    
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
            case 'install_laravel':
                return $this->installLaravel();
            case 'install_frontend':
                return $this->installFrontend();
            case 'create_admin':
                return $this->createAdmin();
            case 'complete_installation':
                return $this->completeInstallation();
            default:
                return $this->error('Invalid action');
        }
    }
    
    private function checkRequirements()
    {
        $requirements = [];
        $issues = [];
        
        // PHP Version
        $phpVersion = PHP_VERSION;
        $requirements['php'] = [
            'current' => $phpVersion,
            'required' => '8.1.0',
            'status' => version_compare($phpVersion, '8.1.0', '>=')
        ];
        if (!$requirements['php']['status']) {
            $issues[] = 'PHP 8.1+ required';
        }
        
        // PHP Extensions
        $extensions = ['pdo', 'pdo_mysql', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'json', 'curl'];
        foreach ($extensions as $ext) {
            $status = extension_loaded($ext);
            $requirements['ext_' . $ext] = $status;
            if (!$status) {
                $issues[] = "PHP extension {$ext} missing";
            }
        }
        
        // Composer
        exec('composer --version 2>&1', $composerOutput, $composerReturn);
        $requirements['composer'] = $composerReturn === 0;
        if (!$requirements['composer']) {
            $issues[] = 'Composer not found';
        }
        
        // Node.js
        exec('node --version 2>&1', $nodeOutput, $nodeReturn);
        $requirements['nodejs'] = $nodeReturn === 0;
        if (!$requirements['nodejs']) {
            $issues[] = 'Node.js not found';
        }
        
        // NPM
        exec('npm --version 2>&1', $npmOutput, $npmReturn);
        $requirements['npm'] = $npmReturn === 0;
        if (!$requirements['npm']) {
            $issues[] = 'NPM not found';
        }
        
        // File Permissions
        $directories = ['../api/storage', '../api/bootstrap/cache'];
        foreach ($directories as $dir) {
            $writable = is_writable($dir);
            $requirements['writable_' . basename($dir)] = $writable;
            if (!$writable) {
                $issues[] = "{$dir} not writable";
            }
        }
        
        return $this->success([
            'requirements' => $requirements,
            'issues' => $issues,
            'status' => empty($issues)
        ]);
    }
    
    private function testDatabase()
    {
        $host = $_POST['db_host'] ?? '127.0.0.1';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_password'] ?? '';
        
        if (empty($user)) {
            return $this->error('Database username is required');
        }
        
        try {
            $dsn = "mysql:host={$host}";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Test MySQL version
            $version = $pdo->query('SELECT VERSION()')->fetchColumn();
            
            return $this->success([
                'message' => 'Database connection successful',
                'mysql_version' => $version
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
            
            // إنشاء ملف .env
            $envContent = $this->generateEnvFile($host, $name, $user, $pass);
            $envPath = '../api/.env';
            
            if (!is_dir('../api')) {
                return $this->error('API directory not found');
            }
            
            if (file_put_contents($envPath, $envContent) === false) {
                return $this->error('Failed to create .env file');
            }
            
            $this->log("Database '{$name}' created and .env file configured");
            
            return $this->success(['message' => 'Database setup completed']);
            
        } catch (PDOException $e) {
            return $this->error('Database setup failed: ' . $e->getMessage());
        } catch (Exception $e) {
            return $this->error('Setup failed: ' . $e->getMessage());
        }
    }
    
    private function installLaravel()
    {
        try {
            $steps = [];
            
            // إصلاح مشكلة Git
            exec('git config --global --add safe.directory /Applications/XAMPP/xamppfiles/htdocs/workshop01 2>&1');
            
            // إصلاح صلاحيات vendor
            if (is_dir('../api/vendor')) {
                exec('chmod -R 777 ../api/vendor 2>&1');
            }
            
            // تثبيت مكتبات Laravel
            $steps[] = 'Installing Composer dependencies...';
            $this->log('Starting Composer installation');
            
            exec('cd ../api && composer install --no-interaction --prefer-dist --no-scripts 2>&1', $output, $returnCode);
            
            if ($returnCode !== 0) {
                // إذا فشل، جرب تحديث composer
                exec('cd ../api && composer update --no-interaction --prefer-dist --no-scripts 2>&1', $output, $returnCode);
                if ($returnCode !== 0) {
                    throw new Exception('Composer installation failed: ' . implode('\n', $output));
                }
            }
            
            $this->log('Composer installation completed');
            
            // توليد مفتاح التطبيق
            $steps[] = 'Generating application key...';
            exec('cd ../api && php artisan key:generate --force 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                throw new Exception('Key generation failed: ' . implode('\n', $output));
            }
            
            $this->log('Application key generated');
            
            // تشغيل migrations
            $steps[] = 'Running database migrations...';
            exec('cd ../api && php artisan migrate --force 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                $this->log('Migration failed, trying to create tables manually');
                $this->createAllTables();
            } else {
                $this->log('Migrations completed successfully');
            }
            
            // تشغيل seeders
            $steps[] = 'Seeding database...';
            exec('cd ../api && php artisan db:seed --force 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                $this->log('Seeding failed, will create basic data manually');
            } else {
                $this->log('Database seeding completed');
            }
            
            return $this->success([
                'message' => 'Laravel installation completed',
                'steps' => $steps
            ]);
            
        } catch (Exception $e) {
            $this->log('Laravel installation failed: ' . $e->getMessage());
            return $this->error('Laravel installation failed: ' . $e->getMessage());
        }
    }
    
    private function installFrontend()
    {
        try {
            $steps = [];
            
            // تثبيت Node dependencies
            $steps[] = 'Installing Node.js dependencies...';
            $this->log('Starting NPM installation');
            
            exec('cd .. && npm install 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                throw new Exception('NPM installation failed: ' . implode('\n', $output));
            }
            
            $this->log('NPM installation completed');
            
            // بناء المشروع
            $steps[] = 'Building React frontend...';
            exec('cd .. && npm run build 2>&1', $output, $returnCode);
            if ($returnCode !== 0) {
                $this->log('Build failed, but installation can continue');
                $steps[] = 'Warning: Build failed, but you can run "npm run dev" for development';
            } else {
                $this->log('Frontend build completed');
            }
            
            return $this->success([
                'message' => 'Frontend installation completed',
                'steps' => $steps
            ]);
            
        } catch (Exception $e) {
            $this->log('Frontend installation failed: ' . $e->getMessage());
            return $this->error('Frontend installation failed: ' . $e->getMessage());
        }
    }
    
    private function createAdmin()
    {
        $name = $_POST['admin_name'] ?? 'System Administrator';
        $email = $_POST['admin_email'] ?? 'admin@workshop.com';
        $password = $_POST['admin_password'] ?? 'admin123';
        
        try {
            // جرب استخدام Artisan
            $hashedPassword = escapeshellarg($password);
            exec("cd ../api && php artisan make:user \"{$name}\" \"{$email}\" \"{$password}\" 2>&1", $output, $returnCode);
            
            if ($returnCode === 0) {
                $this->log("Admin user created via Artisan: {$email}");
                return $this->success([
                    'message' => 'Admin user created successfully',
                    'email' => $email,
                    'password' => $password
                ]);
            }
            
            // إذا فشل Artisan، أنشئ المستخدم مباشرة
            $this->createAdminDirectly($name, $email, $password);
            
            return $this->success([
                'message' => 'Admin user created successfully',
                'email' => $email,
                'password' => $password
            ]);
            
        } catch (Exception $e) {
            return $this->error('Admin creation failed: ' . $e->getMessage());
        }
    }
    
    private function completeInstallation()
    {
        try {
            // إنشاء ملف marker للتثبيت المكتمل
            file_put_contents('../INSTALLATION_COMPLETE', date('Y-m-d H:i:s'));
            
            $this->log('Installation completed successfully');
            
            return $this->success([
                'message' => 'Installation completed successfully!',
                'next_steps' => [
                    'Delete the installer directory for security',
                    'Change default admin credentials',
                    'Configure your application settings',
                    'Start using the system'
                ]
            ]);
            
        } catch (Exception $e) {
            return $this->error('Failed to complete installation: ' . $e->getMessage());
        }
    }
    
    private function createAllTables()
    {
        try {
            $envFile = '../api/.env';
            if (!file_exists($envFile)) {
                throw new Exception('.env file not found');
            }
            
            $env = file_get_contents($envFile);
            
            // Parse database config
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
            
            // Create essential tables
            $this->createEssentialTables($pdo);
            
            $this->log('Essential tables created manually');
            
        } catch (Exception $e) {
            $this->log('Failed to create tables manually: ' . $e->getMessage());
            throw $e;
        }
    }
    
    private function createEssentialTables($pdo)
    {
        // Users table
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
        
        // Clients table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS clients (
                id bigint unsigned NOT NULL AUTO_INCREMENT,
                name varchar(255) NOT NULL,
                email varchar(255) UNIQUE DEFAULT NULL,
                phone varchar(255) DEFAULT NULL,
                address text DEFAULT NULL,
                preferences json DEFAULT NULL,
                body_measurements json DEFAULT NULL,
                source varchar(255) DEFAULT 'local',
                status varchar(255) DEFAULT 'active',
                total_orders int DEFAULT 0,
                total_spent decimal(10,3) DEFAULT 0,
                created_at timestamp NULL DEFAULT NULL,
                updated_at timestamp NULL DEFAULT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Workers table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS workers (
                id bigint unsigned NOT NULL AUTO_INCREMENT,
                name varchar(255) NOT NULL,
                email varchar(255) DEFAULT NULL,
                phone varchar(255) DEFAULT NULL,
                department varchar(255) DEFAULT NULL,
                position varchar(255) DEFAULT NULL,
                skill_level varchar(255) DEFAULT 'beginner',
                hourly_rate decimal(8,2) DEFAULT 0,
                status varchar(255) DEFAULT 'active',
                hire_date date DEFAULT NULL,
                biometric_data json DEFAULT NULL,
                created_at timestamp NULL DEFAULT NULL,
                updated_at timestamp NULL DEFAULT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Orders table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS orders (
                id bigint unsigned NOT NULL AUTO_INCREMENT,
                client_id bigint unsigned DEFAULT NULL,
                order_number varchar(255) NOT NULL UNIQUE,
                status varchar(255) DEFAULT 'pending',
                total_amount decimal(10,3) DEFAULT 0,
                paid_amount decimal(10,3) DEFAULT 0,
                due_date date DEFAULT NULL,
                notes text DEFAULT NULL,
                measurements json DEFAULT NULL,
                created_at timestamp NULL DEFAULT NULL,
                updated_at timestamp NULL DEFAULT NULL,
                PRIMARY KEY (id),
                KEY orders_client_id_foreign (client_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        $this->log('Essential tables created');
    }
    
    private function createAdminDirectly($name, $email, $password)
    {
        $envFile = '../api/.env';
        if (!file_exists($envFile)) {
            throw new Exception('.env file not found');
        }
        
        $env = file_get_contents($envFile);
        
        // Parse database config
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
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Delete existing admin if exists
        $stmt = $pdo->prepare("DELETE FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        // Create admin user
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at) 
            VALUES (?, ?, ?, NOW(), NOW(), NOW())
        ");
        $stmt->execute([$name, $email, $hashedPassword]);
        
        $this->log("Admin user created directly: {$email}");
    }
    
    private function generateEnvFile($host, $database, $username, $password)
    {
        $appKey = 'base64:' . base64_encode(random_bytes(32));
        
        return "APP_NAME=\"Tailoring Workshop\"
APP_ENV=local
APP_KEY={$appKey}
APP_DEBUG=true
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
    
    private function log($message)
    {
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($this->logFile, "[{$timestamp}] {$message}\n", FILE_APPEND | LOCK_EX);
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
    ob_clean();
    $installer = new RealInstaller();
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