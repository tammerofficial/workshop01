#!/bin/bash
# Quick one-liner to install Composer on hep2
# تثبيت سريع للكمبوزر على hep2

SERVER_USER="${1:-root}"
SERVER_HOST="hep2"
SERVER_PORT="${2:-22}"

echo "Installing Composer on $SERVER_USER@$SERVER_HOST..."
echo "تثبيت الكمبوزر على $SERVER_USER@$SERVER_HOST..."

ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST '
    echo "=== Quick Composer Installation ==="
    echo "تثبيت سريع للكمبوزر"
    
    # Install dependencies if needed
    if ! command -v php &> /dev/null; then
        echo "Installing PHP..."
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y php php-cli php-curl unzip
        elif command -v yum &> /dev/null; then
            yum install -y php php-cli php-curl unzip
        elif command -v dnf &> /dev/null; then
            dnf install -y php php-cli php-curl unzip
        fi
    fi
    
    # Install Composer
    echo "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    
    # Verify
    echo "Verification:"
    composer --version
    echo "Installation complete!"
    echo "اكتمل التثبيت!"
'