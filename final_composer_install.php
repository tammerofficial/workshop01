<?php
/**
 * Final Composer Installation Script for HEP2
 * سكريپت التثبيت النهائي للكمبوزر على HEP2
 * 
 * This script attempts to install Composer regardless of web interface issues
 * هذا السكريپت يحاول تثبيت الكمبوزر بغض النظر عن مشاكل واجهة الويب
 */

// Set headers to prevent caching and ensure proper content type
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Increase execution time and memory
set_time_limit(300);
ini_set('memory_limit', '256M');

// Force output buffering off for real-time output
while (ob_get_level()) {
    ob_end_clean();
}

echo "=== HEP2 Composer Final Installation ===\n";
echo "التثبيت النهائي للكمبوزر على HEP2\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n\n";

// Function to output with flush
function output($message) {
    echo $message . "\n";
    if (ob_get_level()) {
        ob_flush();
    }
    flush();
}

output("Starting installation process...");
output("بدء عملية التثبيت...");

// Get current directory info
output("\nCurrent Directory: " . getcwd());
output("المجلد الحالي: " . getcwd());

output("\nPHP Version: " . PHP_VERSION);
output("إصدار PHP: " . PHP_VERSION);

output("\nPHP SAPI: " . php_sapi_name());
output("واجهة PHP: " . php_sapi_name());

// Check if Composer already exists
if (file_exists('composer.phar')) {
    output("\n✓ Composer already exists!");
    output("✓ الكمبوزر موجود مسبقاً!");
    
    $version = shell_exec('php composer.phar --version 2>&1');
    output("Current version: " . trim($version));
    output("الإصدار الحالي: " . trim($version));
    
    output("\nTo reinstall, delete composer.phar and run this script again.");
    output("للإعادة تثبيت، احذف composer.phar وشغل السكريپت مرة أخرى.");
    exit(0);
}

// Check required extensions
$required_extensions = ['curl', 'openssl', 'phar', 'mbstring', 'json'];
$missing = [];

output("\nChecking PHP extensions...");
output("فحص إضافات PHP...");

foreach ($required_extensions as $ext) {
    $loaded = extension_loaded($ext);
    output("- {$ext}: " . ($loaded ? "✓" : "✗"));
    if (!$loaded) {
        $missing[] = $ext;
    }
}

if (!empty($missing)) {
    output("\n✗ ERROR: Missing required extensions: " . implode(', ', $missing));
    output("✗ خطأ: إضافات مطلوبة مفقودة: " . implode(', ', $missing));
    exit(1);
}

output("\n✓ All required extensions are available!");
output("✓ جميع الإضافات المطلوبة متاحة!");

// Download Composer installer
output("\nDownloading Composer installer...");
output("تحميل مثبت الكمبوزر...");

$installer_url = 'https://getcomposer.org/installer';
$installer_content = null;

// Try multiple download methods
$methods = [
    'file_get_contents' => function($url) {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 60,
                'user_agent' => 'Mozilla/5.0 (compatible; Composer Installer)'
            ]
        ]);
        return @file_get_contents($url, false, $context);
    },
    'curl' => function($url) {
        if (!function_exists('curl_init')) return false;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; Composer Installer)');
        
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($result === false || !empty($error) || $httpCode !== 200) {
            output("cURL error: HTTP {$httpCode}, {$error}");
            return false;
        }
        
        return $result;
    }
];

foreach ($methods as $method_name => $method) {
    output("Trying {$method_name}...");
    output("محاولة {$method_name}...");
    
    $installer_content = $method($installer_url);
    
    if ($installer_content !== false && !empty($installer_content)) {
        output("✓ Downloaded successfully with {$method_name}!");
        output("✓ تم التحميل بنجاح باستخدام {$method_name}!");
        break;
    } else {
        output("✗ Failed with {$method_name}");
        output("✗ فشل مع {$method_name}");
    }
}

if ($installer_content === false || empty($installer_content)) {
    output("\n✗ ERROR: Could not download Composer installer with any method");
    output("✗ خطأ: لا يمكن تحميل مثبت الكمبوزر بأي طريقة");
    exit(1);
}

// Save installer
$installer_file = 'composer-setup.php';
if (file_put_contents($installer_file, $installer_content) === false) {
    output("\n✗ ERROR: Could not save installer file");
    output("✗ خطأ: لا يمكن حفظ ملف المثبت");
    exit(1);
}

output("\n✓ Installer saved successfully!");
output("✓ تم حفظ المثبت بنجاح!");

// Run Composer installer
output("\nRunning Composer installer...");
output("تشغيل مثبت الكمبوزر...");

$install_command = "php {$installer_file} 2>&1";
$install_output = shell_exec($install_command);

output("\nInstallation output:");
output("مخرجات التثبيت:");
output($install_output);

// Clean up installer
@unlink($installer_file);

// Verify installation
if (file_exists('composer.phar')) {
    output("\n🎉 SUCCESS: Composer installed successfully!");
    output("🎉 نجح: تم تثبيت الكمبوزر بنجاح!");
    
    // Test the installation
    output("\nTesting installation...");
    output("اختبار التثبيت...");
    
    $version_output = shell_exec('php composer.phar --version 2>&1');
    output($version_output);
    
    // Get file info
    $composer_size = filesize('composer.phar');
    $composer_perms = substr(sprintf('%o', fileperms('composer.phar')), -4);
    
    output("\nFile Information:");
    output("معلومات الملف:");
    output("- Size: " . number_format($composer_size) . " bytes");
    output("- Permissions: {$composer_perms}");
    output("- Location: " . realpath('composer.phar'));
    
    output("\n=== Installation Complete ===");
    output("=== اكتمل التثبيت ===");
    
    output("\nUsage examples:");
    output("أمثلة الاستخدام:");
    output("php composer.phar --version");
    output("php composer.phar install");
    output("php composer.phar update");
    output("php composer.phar require vendor/package");
    output("php composer.phar show");
    
    // Create a test script
    $test_script = '<?php
echo "Composer Test Script\\n";
echo "سكريپت اختبار الكمبوزر\\n";
echo "Composer location: " . realpath("composer.phar") . "\\n";
echo "موقع الكمبوزر: " . realpath("composer.phar") . "\\n";
if (file_exists("composer.phar")) {
    echo "Composer is accessible!\\n";
    echo "الكمبوزر متاح!\\n";
    $output = shell_exec("php composer.phar --version 2>&1");
    echo $output;
} else {
    echo "Composer not found!\\n";
    echo "الكمبوزر غير موجود!\\n";
}
?>';
    
    file_put_contents('test_composer.php', $test_script);
    output("\nCreated test_composer.php for verification");
    output("تم إنشاء test_composer.php للتحقق");
    
} else {
    output("\n✗ ERROR: Installation failed!");
    output("✗ خطأ: فشل التثبيت!");
    output("Please check the installation output above for details.");
    output("يرجى فحص مخرجات التثبيت أعلاه للتفاصيل.");
    exit(1);
}

output("\nScript completed at: " . date('Y-m-d H:i:s'));
output("اكتمل السكريپت في: " . date('Y-m-d H:i:s'));
?>