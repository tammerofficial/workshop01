#!/bin/bash

# Script to install Composer on hep2 server via SSH
# تثبيت الكمبوزر على خادم hep2

echo "=== Installing Composer on hep2 server ==="
echo "تثبيت الكمبوزر على خادم hep2"

# Server connection details
SERVER_HOST="hep2"
SERVER_USER="${1:-root}"  # Default to root if no user provided
SERVER_PORT="${2:-22}"    # Default SSH port

echo "Connecting to server: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo "الاتصال بالخادم: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"

# Function to execute commands on remote server
execute_remote() {
    local command="$1"
    echo "Executing: $command"
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "$command"
}

# Check if server is accessible
echo "Testing connection to hep2..."
echo "اختبار الاتصال بـ hep2..."
if ! ssh -p $SERVER_PORT -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'Connection successful'"; then
    echo "ERROR: Cannot connect to hep2 server"
    echo "خطأ: لا يمكن الاتصال بخادم hep2"
    exit 1
fi

echo "Connection successful! Installing Composer..."
echo "تم الاتصال بنجاح! جاري تثبيت الكمبوزر..."

# Install PHP if not already installed
echo "Checking PHP installation..."
echo "فحص تثبيت PHP..."
execute_remote "
    if ! command -v php &> /dev/null; then
        echo 'PHP not found. Installing PHP...'
        echo 'PHP غير موجود. جاري تثبيت PHP...'
        
        # For Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y php php-cli php-mbstring php-xml php-curl unzip
        # For CentOS/RHEL
        elif command -v yum &> /dev/null; then
            yum install -y php php-cli php-mbstring php-xml php-curl unzip
        # For newer CentOS/RHEL with dnf
        elif command -v dnf &> /dev/null; then
            dnf install -y php php-cli php-mbstring php-xml php-curl unzip
        else
            echo 'Package manager not found. Please install PHP manually.'
            echo 'مدير الحزم غير موجود. يرجى تثبيت PHP يدوياً.'
            exit 1
        fi
    else
        echo 'PHP is already installed'
        echo 'PHP مثبت مسبقاً'
        php --version
    fi
"

# Download and install Composer
echo "Downloading and installing Composer..."
echo "تحميل وتثبيت الكمبوزر..."
execute_remote "
    # Download Composer installer
    echo 'Downloading Composer installer...'
    echo 'تحميل مثبت الكمبوزر...'
    curl -sS https://getcomposer.org/installer -o composer-setup.php
    
    # Verify installer (optional but recommended)
    echo 'Verifying installer...'
    echo 'التحقق من المثبت...'
    php composer-setup.php --check
    
    # Install Composer globally
    echo 'Installing Composer globally...'
    echo 'تثبيت الكمبوزر عالمياً...'
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer
    
    # Clean up
    echo 'Cleaning up...'
    echo 'تنظيف الملفات المؤقتة...'
    rm composer-setup.php
    
    # Verify installation
    echo 'Verifying Composer installation...'
    echo 'التحقق من تثبيت الكمبوزر...'
    composer --version
"

# Set proper permissions
echo "Setting proper permissions..."
echo "تعيين الصلاحيات المناسبة..."
execute_remote "
    chmod +x /usr/local/bin/composer
    echo 'Composer permissions set successfully'
    echo 'تم تعيين صلاحيات الكمبوزر بنجاح'
"

# Final verification
echo "Final verification..."
echo "التحقق النهائي..."
execute_remote "
    echo '=== Composer Installation Summary ==='
    echo '=== ملخص تثبيت الكمبوزر ==='
    echo ''
    echo 'Composer version:'
    echo 'إصدار الكمبوزر:'
    composer --version
    echo ''
    echo 'Composer location:'
    echo 'موقع الكمبوزر:'
    which composer
    echo ''
    echo 'PHP version:'
    echo 'إصدار PHP:'
    php --version
"

echo ""
echo "=== Installation Complete ==="
echo "=== اكتمل التثبيت ==="
echo ""
echo "Composer has been successfully installed on hep2 server!"
echo "تم تثبيت الكمبوزر بنجاح على خادم hep2!"
echo ""
echo "You can now use Composer on hep2 by running:"
echo "يمكنك الآن استخدام الكمبوزر على hep2 عن طريق تشغيل:"
echo "ssh $SERVER_USER@$SERVER_HOST 'composer --version'"