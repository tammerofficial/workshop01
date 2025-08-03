# PowerShell script to install Composer on hep2 server
# تثبيت الكمبوزر على خادم hep2 باستخدام PowerShell

param(
    [string]$ServerUser = "root",
    [int]$ServerPort = 22,
    [string]$ServerHost = "hep2"
)

Write-Host "=== Installing Composer on hep2 server ===" -ForegroundColor Green
Write-Host "تثبيت الكمبوزر على خادم hep2" -ForegroundColor Green

# Check if SSH/SCP is available
try {
    Get-Command ssh -ErrorAction Stop | Out-Null
    Write-Host "SSH client found" -ForegroundColor Green
} catch {
    Write-Host "ERROR: SSH client not found. Please install OpenSSH or use WSL." -ForegroundColor Red
    Write-Host "خطأ: عميل SSH غير موجود. يرجى تثبيت OpenSSH أو استخدام WSL." -ForegroundColor Red
    exit 1
}

$ConnectionString = "$ServerUser@$ServerHost"
Write-Host "Connecting to server: $ConnectionString`:$ServerPort" -ForegroundColor Yellow
Write-Host "الاتصال بالخادم: $ConnectionString`:$ServerPort" -ForegroundColor Yellow

# Function to execute remote commands
function Invoke-RemoteCommand {
    param([string]$Command)
    
    Write-Host "Executing: $Command" -ForegroundColor Cyan
    & ssh -p $ServerPort $ConnectionString $Command
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        return $false
    }
    return $true
}

# Test connection
Write-Host "Testing connection to hep2..." -ForegroundColor Yellow
Write-Host "اختبار الاتصال بـ hep2..." -ForegroundColor Yellow

if (!(Invoke-RemoteCommand "echo 'Connection successful'")) {
    Write-Host "ERROR: Cannot connect to hep2 server" -ForegroundColor Red
    Write-Host "خطأ: لا يمكن الاتصال بخادم hep2" -ForegroundColor Red
    exit 1
}

Write-Host "Connection successful! Installing Composer..." -ForegroundColor Green
Write-Host "تم الاتصال بنجاح! جاري تثبيت الكمبوزر..." -ForegroundColor Green

# Create installation script content
$InstallScript = @'
#!/bin/bash
set -e

echo "=== Composer Installation Script ==="
echo "تثبيت الكمبوزر"

# Check and install PHP
if ! command -v php &> /dev/null; then
    echo "PHP not found. Installing PHP..."
    echo "PHP غير موجود. جاري تثبيت PHP..."
    
    # Detect package manager and install PHP
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y php php-cli php-mbstring php-xml php-curl unzip wget
    elif command -v yum &> /dev/null; then
        yum install -y php php-cli php-mbstring php-xml php-curl unzip wget
    elif command -v dnf &> /dev/null; then
        dnf install -y php php-cli php-mbstring php-xml php-curl unzip wget
    else
        echo "Package manager not found. Please install PHP manually."
        echo "مدير الحزم غير موجود. يرجى تثبيت PHP يدوياً."
        exit 1
    fi
else
    echo "PHP is already installed:"
    echo "PHP مثبت مسبقاً:"
    php --version
fi

# Download and install Composer
echo "Downloading Composer installer..."
echo "تحميل مثبت الكمبوزر..."

# Use wget or curl
if command -v curl &> /dev/null; then
    curl -sS https://getcomposer.org/installer -o composer-setup.php
elif command -v wget &> /dev/null; then
    wget -O composer-setup.php https://getcomposer.org/installer
else
    echo "Neither curl nor wget found. Cannot download Composer."
    echo "curl و wget غير موجودان. لا يمكن تحميل الكمبوزر."
    exit 1
fi

# Verify and install Composer
echo "Installing Composer..."
echo "تثبيت الكمبوزر..."
php composer-setup.php --install-dir=/usr/local/bin --filename=composer

# Clean up
rm composer-setup.php

# Set permissions
chmod +x /usr/local/bin/composer

# Verify installation
echo "=== Installation Complete ==="
echo "=== اكتمل التثبيت ==="
echo "Composer version:"
echo "إصدار الكمبوزر:"
composer --version

echo "Installation path:"
echo "مسار التثبيت:"
which composer
'@

# Write installation script to temporary file
$TempScript = "/tmp/install_composer_$(Get-Date -Format 'yyyyMMdd_HHmmss').sh"

Write-Host "Creating installation script on server..." -ForegroundColor Yellow
Write-Host "إنشاء سكريبت التثبيت على الخادم..." -ForegroundColor Yellow

# Upload script content
$InstallScript | & ssh -p $ServerPort $ConnectionString "cat > $TempScript && chmod +x $TempScript"

# Execute installation script
Write-Host "Executing installation script..." -ForegroundColor Yellow
Write-Host "تنفيذ سكريبت التثبيت..." -ForegroundColor Yellow

if (Invoke-RemoteCommand "bash $TempScript") {
    Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
    Invoke-RemoteCommand "rm $TempScript"
    
    Write-Host ""
    Write-Host "=== SUCCESS ===" -ForegroundColor Green
    Write-Host "=== نجح التثبيت ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Composer has been successfully installed on hep2!" -ForegroundColor Green
    Write-Host "تم تثبيت الكمبوزر بنجاح على hep2!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test the installation:" -ForegroundColor Cyan
    Write-Host "اختبار التثبيت:" -ForegroundColor Cyan
    Write-Host "ssh $ConnectionString 'composer --version'" -ForegroundColor White
} else {
    Write-Host "Installation failed!" -ForegroundColor Red
    Write-Host "فشل التثبيت!" -ForegroundColor Red
    exit 1
}