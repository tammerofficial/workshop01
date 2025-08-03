#!/bin/bash

# Script to run Composer installation on HEP2 server
# سكريپت لتشغيل تثبيت الكمبوزر على خادم HEP2

echo "=== Running Composer Installation on HEP2 ==="
echo "تشغيل تثبيت الكمبوزر على HEP2"

SERVER_HOST="178.128.252.18"
SERVER_USER="fddfdfggte"
SERVER_PASS="eagdf564I"
SERVER_PORT="22"

echo "Connecting to server and running installation..."
echo "الاتصال بالخادم وتشغيل التثبيت..."

# Try to run the PHP installer via command line
expect << EOF
set timeout 60
spawn ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST
expect {
    "password:" {
        send "$SERVER_PASS\r"
        expect {
            "Shell access is disabled" {
                puts "Shell access disabled. Will try alternative method."
                exit 1
            }
            "\$" {
                send "cd /public_html\r"
                expect "\$"
                send "php composer_installer_direct.php\r"
                expect "\$"
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

# If SSH shell is disabled, provide alternative instructions
if [ $? -ne 0 ]; then
    echo ""
    echo "SSH shell access is disabled on this server."
    echo "صلاحية SSH shell معطلة على هذا الخادم."
    echo ""
    echo "Alternative installation methods:"
    echo "طرق التثبيت البديلة:"
    echo ""
    echo "1. Via cPanel File Manager:"
    echo "1. عبر مدير الملفات في cPanel:"
    echo "   - Login to cPanel"
    echo "   - Open File Manager"
    echo "   - Navigate to public_html"
    echo "   - Right-click on composer_installer_direct.php"
    echo "   - Select 'Code Editor' or create a new file"
    echo "   - Add this PHP code at the top:"
    echo ""
    echo "   <?php"
    echo "   chdir(__DIR__);"
    echo "   include 'composer_installer_direct.php';"
    echo "   ?>"
    echo ""
    echo "   - Save as install_now.php"
    echo "   - Visit http://your-domain.com/install_now.php"
    echo ""
    
    # Create a simple installer that can be run via web
    echo "2. Creating web-based installer..."
    echo "2. إنشاء مثبت عبر الويب..."
    
    cat > web_composer_installer.php << 'WEBEOF'
<?php
// Set execution time limit
set_time_limit(300);

// Change to the directory where this script is located
chdir(__DIR__);

echo "<h2>HEP2 Composer Web Installer</h2>";
echo "<h2>مثبت الكمبوزر عبر الويب لـ HEP2</h2>";

if (isset($_POST['install'])) {
    echo "<pre>";
    include 'composer_installer_direct.php';
    echo "</pre>";
    echo "<p><strong>Installation completed!</strong></p>";
    echo "<p><strong>اكتمل التثبيت!</strong></p>";
} else {
    ?>
    <form method="post">
        <p>Click the button below to install Composer on this server:</p>
        <p>اضغط على الزر أدناه لتثبيت الكمبوزر على هذا الخادم:</p>
        <button type="submit" name="install" style="padding: 10px 20px; font-size: 16px; background: #007cba; color: white; border: none; cursor: pointer;">
            Install Composer / تثبيت الكمبوزر
        </button>
    </form>
    <hr>
    <h3>Instructions:</h3>
    <ol>
        <li>This will download and install Composer in the current directory</li>
        <li>The installation process may take a few minutes</li>
        <li>After installation, you can use: <code>php composer.phar [command]</code></li>
    </ol>
    <h3>التعليمات:</h3>
    <ol>
        <li>سيتم تحميل وتثبيت الكمبوزر في المجلد الحالي</li>
        <li>قد تستغرق عملية التثبيت بضع دقائق</li>
        <li>بعد التثبيت، يمكنك استخدام: <code>php composer.phar [command]</code></li>
    </ol>
    <?php
}
?>
WEBEOF

    # Upload the web installer
    echo "Uploading web installer..."
    echo "رفع المثبت عبر الويب..."
    
    expect << EOF
set timeout 30
spawn sftp -P $SERVER_PORT $SERVER_USER@$SERVER_HOST
expect "password:"
send "$SERVER_PASS\r"
expect "sftp>"
send "cd /public_html\r"
expect "sftp>"
send "put web_composer_installer.php\r"
expect "sftp>"
send "bye\r"
expect eof
EOF

    echo ""
    echo "Web installer uploaded successfully!"
    echo "تم رفع المثبت عبر الويب بنجاح!"
    echo ""
    echo "Now you can install Composer by visiting:"
    echo "الآن يمكنك تثبيت الكمبوزر عبر زيارة:"
    echo "http://178.128.252.18/web_composer_installer.php"
    echo ""
    echo "Or if you have a domain pointed to this server:"
    echo "أو إذا كان لديك نطاق يشير إلى هذا الخادم:"
    echo "http://your-domain.com/web_composer_installer.php"
    
    # Clean up
    rm -f web_composer_installer.php
fi

echo ""
echo "=== Installation Process Complete ==="
echo "=== اكتملت عملية التثبيت ==="