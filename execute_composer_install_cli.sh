#!/bin/bash

# Script to execute Composer installation via PHP CLI on HEP2
# سكريپت لتنفيذ تثبيت الكمبوزر عبر PHP CLI على HEP2

echo "=== Executing Composer Installation via PHP CLI ==="
echo "تنفيذ تثبيت الكمبوزر عبر PHP CLI"

SERVER_HOST="178.128.252.18"
SERVER_USER="fddfdfggte"
SERVER_PASS="eagdf564I"
SERVER_PORT="22"

echo "Creating CLI execution script..."
echo "إنشاء سكريپت التنفيذ..."

# Create a PHP script that will run the installation
cat > composer_cli_install.php << 'EOF'
#!/usr/bin/env php
<?php
/**
 * CLI Composer Installation Script
 * سكريپت تثبيت الكمبوزر عبر سطر الأوامر
 */

echo "=== HEP2 Composer CLI Installation ===\n";
echo "تثبيت الكمبوزر عبر سطر الأوامر لـ HEP2\n\n";

// Change to the web directory
$webDir = '/home/fddfdfggte/public_html';
if (is_dir($webDir)) {
    chdir($webDir);
    echo "Changed directory to: " . getcwd() . "\n";
    echo "تم تغيير المجلد إلى: " . getcwd() . "\n";
} else {
    echo "Web directory not found, using current directory: " . getcwd() . "\n";
    echo "مجلد الويب غير موجود، استخدام المجلد الحالي: " . getcwd() . "\n";
}

echo "\n=== PHP Environment Check ===\n";
echo "فحص بيئة PHP\n";

echo "PHP Version: " . PHP_VERSION . "\n";
echo "إصدار PHP: " . PHP_VERSION . "\n";

echo "Current Directory: " . getcwd() . "\n";
echo "المجلد الحالي: " . getcwd() . "\n";

// Check required extensions
$required = ['curl', 'openssl', 'phar', 'mbstring', 'json'];
$missing = [];

echo "\nExtensions Check:\n";
echo "فحص الإضافات:\n";

foreach ($required as $ext) {
    $loaded = extension_loaded($ext);
    echo "- {$ext}: " . ($loaded ? "✓" : "✗") . "\n";
    if (!$loaded) $missing[] = $ext;
}

if (!empty($missing)) {
    echo "\nERROR: Missing extensions: " . implode(', ', $missing) . "\n";
    echo "خطأ: إضافات مفقودة: " . implode(', ', $missing) . "\n";
    exit(1);
}

echo "\n=== Composer Installation ===\n";
echo "تثبيت الكمبوزر\n";

// Check if composer already exists
if (file_exists('composer.phar')) {
    echo "Composer already exists! Current version:\n";
    echo "الكمبوزر موجود مسبقاً! الإصدار الحالي:\n";
    system('php composer.phar --version');
    echo "\nTo reinstall, delete composer.phar first.\n";
    echo "للإعادة تثبيت، احذف composer.phar أولاً.\n";
    exit(0);
}

echo "Downloading Composer installer...\n";
echo "تحميل مثبت الكمبوزر...\n";

// Download using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://getcomposer.org/installer');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$installer = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($installer === false || !empty($error) || $httpCode !== 200) {
    echo "ERROR downloading installer: HTTP {$httpCode}, {$error}\n";
    echo "خطأ في تحميل المثبت: HTTP {$httpCode}, {$error}\n";
    exit(1);
}

echo "Installer downloaded successfully!\n";
echo "تم تحميل المثبت بنجاح!\n";

// Save installer
file_put_contents('composer-setup.php', $installer);

echo "Running Composer installer...\n";
echo "تشغيل مثبت الكمبوزر...\n";

// Execute installer
$output = [];
$return = 0;
exec('php composer-setup.php 2>&1', $output, $return);

echo "Installation output:\n";
echo "مخرجات التثبيت:\n";
foreach ($output as $line) {
    echo $line . "\n";
}

// Clean up
unlink('composer-setup.php');

if ($return === 0 && file_exists('composer.phar')) {
    echo "\n✓ SUCCESS: Composer installed successfully!\n";
    echo "✓ نجح: تم تثبيت الكمبوزر بنجاح!\n";
    
    echo "\nTesting installation...\n";
    echo "اختبار التثبيت...\n";
    system('php composer.phar --version');
    
    echo "\n=== Installation Complete ===\n";
    echo "اكتمل التثبيت\n";
    
    echo "\nUsage examples:\n";
    echo "أمثلة الاستخدام:\n";
    echo "php composer.phar --version\n";
    echo "php composer.phar install\n";
    echo "php composer.phar update\n";
    echo "php composer.phar require vendor/package\n";
    
} else {
    echo "\n✗ ERROR: Installation failed!\n";
    echo "✗ خطأ: فشل التثبيت!\n";
    exit(1);
}
?>
EOF

echo "Uploading CLI installation script..."
echo "رفع سكريپت التثبيت..."

# Upload the CLI script
expect << EOF
set timeout 30
spawn sftp -P $SERVER_PORT $SERVER_USER@$SERVER_HOST
expect "password:"
send "$SERVER_PASS\r"
expect "sftp>"
send "cd /public_html\r"
expect "sftp>"
send "put composer_cli_install.php\r"
expect "sftp>"
send "bye\r"
expect eof
EOF

echo ""
echo "Script uploaded! Now attempting to execute via SSH..."
echo "تم رفع السكريپت! الآن محاولة التنفيذ عبر SSH..."

# Try to execute the script
expect << EOF
set timeout 120
spawn ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST
expect {
    "password:" {
        send "$SERVER_PASS\r"
        expect {
            "Shell access is disabled" {
                puts "\nShell access disabled. Trying alternative execution..."
                exit 1
            }
            "\$" {
                send "cd /public_html\r"
                expect "\$"
                send "php composer_cli_install.php\r"
                expect {
                    "Installation Complete" {
                        puts "\nInstallation completed successfully!"
                    }
                    "\$" {
                        puts "\nScript execution finished."
                    }
                    timeout {
                        puts "\nExecution timeout, but may have completed."
                    }
                }
                send "exit\r"
                expect eof
            }
        }
    }
    timeout {
        puts "Connection timeout"
        exit 1
    }
}
EOF

execution_result=$?

echo ""
if [ $execution_result -eq 0 ]; then
    echo "✓ CLI execution completed successfully!"
    echo "✓ تم تنفيذ CLI بنجاح!"
else
    echo "⚠ CLI execution had issues, but files are uploaded."
    echo "⚠ تنفيذ CLI واجه مشاكل، لكن الملفات مرفوعة."
    echo ""
    echo "Alternative execution methods:"
    echo "طرق التنفيذ البديلة:"
    echo "1. Via cPanel Terminal (if available)"
    echo "2. Via cPanel File Manager > composer_cli_install.php > Execute"
    echo "3. Contact hosting support to run: php /public_html/composer_cli_install.php"
fi

echo ""
echo "=== CLI Installation Attempt Complete ==="
echo "=== اكتملت محاولة التثبيت عبر CLI ==="

# Cleanup
rm -f composer_cli_install.php