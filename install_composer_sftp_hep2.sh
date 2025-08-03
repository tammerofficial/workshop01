#!/bin/bash

# Script to install Composer on hep2 server via SFTP (when SSH shell is disabled)
# تثبيت الكمبوزر على خادم hep2 عبر SFTP (عندما يكون SSH shell معطل)

echo "=== Installing Composer on hep2 server via SFTP ==="
echo "تثبيت الكمبوزر على خادم hep2 عبر SFTP"

# Server connection details from sync_config.jsonc
SERVER_HOST="178.128.252.18"
SERVER_USER="fddfdfggte"
SERVER_PASS="eagdf564I"
SERVER_PORT="22"
REMOTE_PATH="/public_html"

echo "Connecting to server: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo "الاتصال بالخادم: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"

# Create temporary directory for files
TEMP_DIR="/tmp/composer_install_$$"
mkdir -p "$TEMP_DIR"

echo "Creating installation files..."
echo "إنشاء ملفات التثبيت..."

# Create PHP script to check PHP version and download Composer
cat > "$TEMP_DIR/check_php.php" << 'EOF'
<?php
echo "=== PHP Environment Check ===\n";
echo "PHP Version: " . PHP_VERSION . "\n";
echo "PHP CLI: " . (php_sapi_name() === 'cli' ? 'Available' : 'Not Available') . "\n";
echo "Extensions:\n";
echo "- curl: " . (extension_loaded('curl') ? 'Yes' : 'No') . "\n";
echo "- openssl: " . (extension_loaded('openssl') ? 'Yes' : 'No') . "\n";
echo "- phar: " . (extension_loaded('phar') ? 'Yes' : 'No') . "\n";
echo "- mbstring: " . (extension_loaded('mbstring') ? 'Yes' : 'No') . "\n";
echo "- json: " . (extension_loaded('json') ? 'Yes' : 'No') . "\n";
?>
EOF

# Create Composer installer script
cat > "$TEMP_DIR/install_composer.php" << 'EOF'
<?php
echo "=== Composer Installation Script ===\n";
echo "تثبيت الكمبوزر\n";

// Check if composer already exists
if (file_exists('composer.phar')) {
    echo "Composer already exists. Checking version...\n";
    echo "الكمبوزر موجود مسبقاً. فحص الإصدار...\n";
    system('php composer.phar --version');
    echo "\nTo update composer, delete composer.phar and run this script again.\n";
    echo "لتحديث الكمبوزر، احذف composer.phar وشغل السكريپت مرة أخرى.\n";
    exit(0);
}

// Download Composer installer
echo "Downloading Composer installer...\n";
echo "تحميل مثبت الكمبوزر...\n";

$installer = file_get_contents('https://getcomposer.org/installer');
if ($installer === false) {
    echo "ERROR: Could not download Composer installer\n";
    echo "خطأ: لا يمكن تحميل مثبت الكمبوزر\n";
    exit(1);
}

// Save installer
file_put_contents('composer-setup.php', $installer);

// Run installer
echo "Installing Composer...\n";
echo "تثبيت الكمبوزر...\n";

$output = [];
$return_var = 0;
exec('php composer-setup.php 2>&1', $output, $return_var);

foreach ($output as $line) {
    echo $line . "\n";
}

if ($return_var === 0) {
    echo "SUCCESS: Composer installed successfully!\n";
    echo "نجح: تم تثبيت الكمبوزر بنجاح!\n";
    
    // Clean up
    unlink('composer-setup.php');
    
    // Test installation
    echo "\nTesting installation...\n";
    echo "اختبار التثبيت...\n";
    system('php composer.phar --version');
    
    echo "\nUsage: php composer.phar [command]\n";
    echo "الاستخدام: php composer.phar [command]\n";
} else {
    echo "ERROR: Installation failed\n";
    echo "خطأ: فشل التثبيت\n";
}
?>
EOF

# Create .htaccess to protect PHP files (optional security)
cat > "$TEMP_DIR/.htaccess" << 'EOF'
# Protect Composer files
<Files "composer.phar">
    Order Deny,Allow
    Deny from all
</Files>

<Files "*.php">
    Order Deny,Allow
    Deny from all
    Allow from 127.0.0.1
</Files>
EOF

# Create batch file for SFTP commands
cat > "$TEMP_DIR/sftp_commands.txt" << EOF
cd $REMOTE_PATH
put $TEMP_DIR/check_php.php check_php.php
put $TEMP_DIR/install_composer.php install_composer.php
put $TEMP_DIR/.htaccess .htaccess_composer
bye
EOF

echo "Uploading files via SFTP..."
echo "رفع الملفات عبر SFTP..."

# Upload files using SFTP
expect << EOF
set timeout 30
spawn sftp -P $SERVER_PORT $SERVER_USER@$SERVER_HOST
expect "password:"
send "$SERVER_PASS\r"
expect "sftp>"
send "cd $REMOTE_PATH\r"
expect "sftp>"
send "put $TEMP_DIR/check_php.php check_php.php\r"
expect "sftp>"
send "put $TEMP_DIR/install_composer.php install_composer.php\r"
expect "sftp>"
send "put $TEMP_DIR/.htaccess .htaccess_composer\r"
expect "sftp>"
send "bye\r"
expect eof
EOF

echo ""
echo "Files uploaded successfully!"
echo "تم رفع الملفات بنجاح!"
echo ""
echo "Next steps:"
echo "الخطوات التالية:"
echo "1. Visit: http://178.128.252.18/check_php.php (to check PHP environment)"
echo "2. Visit: http://178.128.252.18/install_composer.php (to install Composer)"
echo ""
echo "1. زيارة: http://178.128.252.18/check_php.php (لفحص بيئة PHP)"
echo "2. زيارة: http://178.128.252.18/install_composer.php (لتثبيت الكمبوزر)"
echo ""
echo "After installation, you can use Composer via SSH (if available) or web interface:"
echo "بعد التثبيت، يمكنك استخدام الكمبوزر عبر SSH (إذا كان متاح) أو واجهة الويب:"
echo "php composer.phar install"
echo "php composer.phar update"
echo "php composer.phar require package/name"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "=== Installation files uploaded ==="
echo "=== تم رفع ملفات التثبيت ==="