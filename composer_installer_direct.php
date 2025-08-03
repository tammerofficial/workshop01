<?php
/**
 * Direct Composer Installer for HEP2 Server
 * مثبت الكمبوزر المباشر لخادم HEP2
 * 
 * Upload this file to your server and run it via browser or command line
 * ارفع هذا الملف إلى خادمك وشغله عبر المتصفح أو سطر الأوامر
 */

echo "<h1>Composer Installer for HEP2</h1>\n";
echo "<h1>مثبت الكمبوزر لـ HEP2</h1>\n";

// Check if running via CLI or browser
$isCLI = php_sapi_name() === 'cli';
if (!$isCLI) {
    echo "<pre>\n";
}

echo "=== PHP Environment Check ===\n";
echo "فحص بيئة PHP\n\n";

echo "PHP Version: " . PHP_VERSION . "\n";
echo "إصدار PHP: " . PHP_VERSION . "\n";

echo "Server API: " . php_sapi_name() . "\n";
echo "واجهة الخادم: " . php_sapi_name() . "\n";

// Check required extensions
$required_extensions = ['curl', 'openssl', 'phar', 'mbstring', 'json'];
$missing_extensions = [];

echo "\nRequired Extensions:\n";
echo "الإضافات المطلوبة:\n";

foreach ($required_extensions as $ext) {
    $loaded = extension_loaded($ext);
    echo "- {$ext}: " . ($loaded ? "✓ Available" : "✗ Missing") . "\n";
    if (!$loaded) {
        $missing_extensions[] = $ext;
    }
}

if (!empty($missing_extensions)) {
    echo "\nERROR: Missing required extensions: " . implode(', ', $missing_extensions) . "\n";
    echo "خطأ: إضافات مطلوبة مفقودة: " . implode(', ', $missing_extensions) . "\n";
    echo "Please contact your hosting provider to enable these extensions.\n";
    echo "يرجى الاتصال بمزود الاستضافة لتفعيل هذه الإضافات.\n";
    if (!$isCLI) echo "</pre>";
    exit(1);
}

echo "\n=== Composer Installation ===\n";
echo "تثبيت الكمبوزر\n\n";

// Check if composer already exists
if (file_exists('composer.phar')) {
    echo "Composer already exists. Current version:\n";
    echo "الكمبوزر موجود مسبقاً. الإصدار الحالي:\n";
    
    $output = shell_exec('php composer.phar --version 2>&1');
    echo $output . "\n";
    
    echo "To reinstall, delete composer.phar and run this script again.\n";
    echo "للإعادة تثبيت، احذف composer.phar وشغل السكريپت مرة أخرى.\n";
    
    if (!$isCLI) echo "</pre>";
    exit(0);
}

// Download Composer installer
echo "Downloading Composer installer...\n";
echo "تحميل مثبت الكمبوزر...\n";

$installer_url = 'https://getcomposer.org/installer';
$installer_content = @file_get_contents($installer_url);

if ($installer_content === false) {
    echo "ERROR: Could not download Composer installer from {$installer_url}\n";
    echo "خطأ: لا يمكن تحميل مثبت الكمبوزر من {$installer_url}\n";
    
    // Try alternative method with cURL
    if (function_exists('curl_init')) {
        echo "Trying with cURL...\n";
        echo "جاري المحاولة بـ cURL...\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $installer_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        
        $installer_content = curl_exec($ch);
        $curl_error = curl_error($ch);
        curl_close($ch);
        
        if ($installer_content === false || !empty($curl_error)) {
            echo "ERROR: cURL failed - {$curl_error}\n";
            echo "خطأ: فشل cURL - {$curl_error}\n";
            if (!$isCLI) echo "</pre>";
            exit(1);
        }
    } else {
        echo "ERROR: Neither file_get_contents nor cURL is available\n";
        echo "خطأ: file_get_contents و cURL غير متاحان\n";
        if (!$isCLI) echo "</pre>";
        exit(1);
    }
}

// Save installer
$installer_file = 'composer-setup.php';
if (file_put_contents($installer_file, $installer_content) === false) {
    echo "ERROR: Could not save installer file\n";
    echo "خطأ: لا يمكن حفظ ملف المثبت\n";
    if (!$isCLI) echo "</pre>";
    exit(1);
}

echo "Installer downloaded successfully!\n";
echo "تم تحميل المثبت بنجاح!\n";

// Run Composer installer
echo "Installing Composer...\n";
echo "تثبيت الكمبوزر...\n";

$install_command = "php {$installer_file} 2>&1";
$install_output = shell_exec($install_command);

echo "Installation output:\n";
echo "مخرجات التثبيت:\n";
echo $install_output . "\n";

// Check if installation was successful
if (file_exists('composer.phar')) {
    echo "SUCCESS: Composer installed successfully!\n";
    echo "نجح: تم تثبيت الكمبوزر بنجاح!\n";
    
    // Clean up installer
    @unlink($installer_file);
    
    // Test installation
    echo "\nTesting installation...\n";
    echo "اختبار التثبيت...\n";
    
    $version_output = shell_exec('php composer.phar --version 2>&1');
    echo $version_output . "\n";
    
    echo "\n=== Installation Complete ===\n";
    echo "اكتمل التثبيت\n\n";
    
    echo "Usage examples:\n";
    echo "أمثلة الاستخدام:\n";
    echo "- Check version: php composer.phar --version\n";
    echo "- Install dependencies: php composer.phar install\n";
    echo "- Update packages: php composer.phar update\n";
    echo "- Add package: php composer.phar require vendor/package\n";
    echo "- Show help: php composer.phar help\n";
    
    echo "\n- فحص الإصدار: php composer.phar --version\n";
    echo "- تثبيت التبعيات: php composer.phar install\n";
    echo "- تحديث الحزم: php composer.phar update\n";
    echo "- إضافة حزمة: php composer.phar require vendor/package\n";
    echo "- عرض المساعدة: php composer.phar help\n";
    
} else {
    echo "ERROR: Installation failed\n";
    echo "خطأ: فشل التثبيت\n";
    echo "Installation output was:\n";
    echo "مخرجات التثبيت كانت:\n";
    echo $install_output . "\n";
}

if (!$isCLI) {
    echo "</pre>";
}
?>