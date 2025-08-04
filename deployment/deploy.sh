#!/bin/bash

# =================================================================
# Boutique Integrated System - Production Deployment Script
# Version: 1.0
# Date: $(date +%Y-%m-%d)
# =================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="boutique-integrated-system"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME-deployment.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a $LOG_FILE
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. This is not recommended for production deployments."
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $(dirname $LOG_FILE)
    sudo mkdir -p /var/www/html/$PROJECT_NAME
    sudo mkdir -p /var/www/html/$PROJECT_NAME/storage/logs
    sudo mkdir -p /var/www/html/$PROJECT_NAME/bootstrap/cache
}

# Backup existing installation
backup_existing() {
    if [ -d "/var/www/html/$PROJECT_NAME" ]; then
        log "Creating backup of existing installation..."
        
        sudo tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
            -C /var/www/html/ $PROJECT_NAME \
            --exclude="$PROJECT_NAME/node_modules" \
            --exclude="$PROJECT_NAME/vendor" \
            --exclude="$PROJECT_NAME/.git"
        
        log "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    else
        info "No existing installation found. Skipping backup."
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    sudo apt update
    
    # Install required packages
    sudo apt install -y \
        nginx \
        php8.1-fpm \
        php8.1-mysql \
        php8.1-redis \
        php8.1-mbstring \
        php8.1-xml \
        php8.1-bcmath \
        php8.1-curl \
        php8.1-gd \
        php8.1-zip \
        php8.1-intl \
        mysql-server \
        redis-server \
        nodejs \
        npm \
        certbot \
        python3-certbot-nginx \
        supervisor
    
    log "System dependencies installed successfully"
}

# Install Composer
install_composer() {
    if ! command -v composer &> /dev/null; then
        log "Installing Composer..."
        
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        php composer-setup.php --install-dir=/usr/local/bin --filename=composer
        php -r "unlink('composer-setup.php');"
        
        log "Composer installed successfully"
    else
        info "Composer already installed"
    fi
}

# Deploy Laravel Backend
deploy_backend() {
    log "Deploying Laravel backend..."
    
    cd /var/www/html/$PROJECT_NAME/api
    
    # Install PHP dependencies
    composer install --optimize-autoloader --no-dev
    
    # Set up environment
    if [ ! -f .env ]; then
        cp .env.example .env
        php artisan key:generate
        
        warning "Please configure your .env file with proper database and cache settings"
    fi
    
    # Run migrations and seeders
    php artisan migrate --force
    php artisan db:seed --force
    
    # Clear and cache configurations
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Set proper permissions
    sudo chown -R www-data:www-data storage bootstrap/cache
    sudo chmod -R 775 storage bootstrap/cache
    
    log "Laravel backend deployed successfully"
}

# Deploy React Frontend
deploy_frontend() {
    log "Deploying React frontend..."
    
    cd /var/www/html/$PROJECT_NAME
    
    # Install Node.js dependencies
    npm ci --production
    
    # Build production assets
    npm run build
    
    # Copy built assets to public directory
    sudo cp -r dist/* /var/www/html/$PROJECT_NAME/public/
    
    log "React frontend deployed successfully"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null << EOF
server {
    listen 80;
    server_name localhost;  # Replace with your domain
    root /var/www/html/$PROJECT_NAME/public;
    
    index index.php index.html index.htm;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Laravel API routes
    location /api {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(README|Procfile|\.env|composer\.(json|lock)|package\.(json|lock)) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    log "Nginx configured successfully"
}

# Configure SSL with Let's Encrypt
configure_ssl() {
    read -p "Do you want to configure SSL with Let's Encrypt? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your domain name: " DOMAIN_NAME
        
        if [ ! -z "$DOMAIN_NAME" ]; then
            log "Configuring SSL for $DOMAIN_NAME..."
            
            # Update Nginx configuration with domain
            sudo sed -i "s/server_name localhost;/server_name $DOMAIN_NAME;/" /etc/nginx/sites-available/$PROJECT_NAME
            sudo systemctl reload nginx
            
            # Obtain SSL certificate
            sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
            
            log "SSL configured successfully for $DOMAIN_NAME"
        else
            warning "No domain provided. Skipping SSL configuration."
        fi
    else
        info "Skipping SSL configuration"
    fi
}

# Configure database
configure_database() {
    log "Configuring database..."
    
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Create database and user
    sudo mysql << EOF
CREATE DATABASE IF NOT EXISTS ${PROJECT_NAME//-/_};
CREATE USER IF NOT EXISTS '${PROJECT_NAME//-/_}'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON ${PROJECT_NAME//-/_}.* TO '${PROJECT_NAME//-/_}'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    # Update .env file
    cd /var/www/html/$PROJECT_NAME/api
    sudo sed -i "s/DB_DATABASE=.*/DB_DATABASE=${PROJECT_NAME//-/_}/" .env
    sudo sed -i "s/DB_USERNAME=.*/DB_USERNAME=${PROJECT_NAME//-/_}/" .env
    sudo sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    
    log "Database configured successfully"
    info "Database credentials saved to .env file"
}

# Set up monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    sudo tee /usr/local/bin/boutique-monitor.sh > /dev/null << 'EOF'
#!/bin/bash

# Monitor system resources and log to file
MONITOR_LOG="/var/log/boutique-monitor.log"

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$(date)] WARNING: Disk usage is ${DISK_USAGE}%" >> $MONITOR_LOG
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "[$(date)] WARNING: Memory usage is ${MEMORY_USAGE}%" >> $MONITOR_LOG
fi

# Check if services are running
systemctl is-active --quiet nginx || echo "[$(date)] ERROR: Nginx is not running" >> $MONITOR_LOG
systemctl is-active --quiet php8.1-fpm || echo "[$(date)] ERROR: PHP-FPM is not running" >> $MONITOR_LOG
systemctl is-active --quiet mysql || echo "[$(date)] ERROR: MySQL is not running" >> $MONITOR_LOG
systemctl is-active --quiet redis || echo "[$(date)] ERROR: Redis is not running" >> $MONITOR_LOG
EOF
    
    sudo chmod +x /usr/local/bin/boutique-monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/boutique-monitor.sh") | crontab -
    
    log "Monitoring setup completed"
}

# Set up backup automation
setup_backup() {
    log "Setting up automated backups..."
    
    # Create backup script
    sudo tee /usr/local/bin/boutique-backup.sh > /dev/null << EOF
#!/bin/bash

BACKUP_DIR="/var/backups/$PROJECT_NAME"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/var/www/html/$PROJECT_NAME"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
mysqldump ${PROJECT_NAME//-/_} > \$BACKUP_DIR/database_\$TIMESTAMP.sql

# Backup files (excluding cache and temporary files)
tar -czf \$BACKUP_DIR/files_\$TIMESTAMP.tar.gz \\
    -C /var/www/html/ $PROJECT_NAME \\
    --exclude="$PROJECT_NAME/node_modules" \\
    --exclude="$PROJECT_NAME/vendor" \\
    --exclude="$PROJECT_NAME/.git" \\
    --exclude="$PROJECT_NAME/storage/logs/*" \\
    --exclude="$PROJECT_NAME/bootstrap/cache/*"

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "[$(date)] Backup completed: \$BACKUP_DIR"
EOF
    
    sudo chmod +x /usr/local/bin/boutique-backup.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/boutique-backup.sh") | crontab -
    
    log "Automated backup setup completed"
}

# Security hardening
security_hardening() {
    log "Applying security hardening..."
    
    # Disable server tokens
    echo "server_tokens off;" | sudo tee -a /etc/nginx/nginx.conf
    
    # Configure firewall
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    
    # Secure MySQL installation
    sudo mysql_secure_installation
    
    # Set proper file permissions
    sudo find /var/www/html/$PROJECT_NAME -type f -exec chmod 644 {} \;
    sudo find /var/www/html/$PROJECT_NAME -type d -exec chmod 755 {} \;
    sudo chmod -R 775 /var/www/html/$PROJECT_NAME/storage
    sudo chmod -R 775 /var/www/html/$PROJECT_NAME/bootstrap/cache
    
    log "Security hardening completed"
}

# Main deployment function
main() {
    log "Starting Boutique Integrated System deployment..."
    
    check_permissions
    create_directories
    backup_existing
    install_dependencies
    install_composer
    deploy_backend
    deploy_frontend
    configure_database
    configure_nginx
    configure_ssl
    setup_monitoring
    setup_backup
    security_hardening
    
    log "🎉 Deployment completed successfully!"
    log "🌐 Your system is now available at: http://localhost"
    log "📊 Admin panel: http://localhost/admin"
    log "🛍️ E-commerce store: http://localhost/ecommerce"
    log "🏭 POS system: http://localhost/pos-system"
    log "📈 Analytics: http://localhost/reports"
    
    info "Next steps:"
    info "1. Configure your .env file with proper settings"
    info "2. Set up your domain name and SSL certificate"
    info "3. Configure email settings for notifications"
    info "4. Set up backup storage (cloud)"
    info "5. Configure monitoring alerts"
    
    warning "Don't forget to:"
    warning "- Change default passwords"
    warning "- Set up proper DNS records"
    warning "- Configure email templates"
    warning "- Test all system integrations"
}

# Run main function
main "$@"