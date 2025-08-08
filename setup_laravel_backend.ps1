# Setup Laravel Backend - Complete Installation
Write-Host "🚀 Setting up Laravel Backend..." -ForegroundColor Green

# Navigate to API directory
Set-Location "C:\laragon\www\workshop01\api"

Write-Host "📦 Installing Composer Dependencies..." -ForegroundColor Yellow
try {
    # Install composer dependencies
    & composer install --no-dev --optimize-autoloader
    Write-Host "✅ Composer dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install composer dependencies: $_" -ForegroundColor Red
    Write-Host "Please make sure Composer is installed and in your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Setting up Environment..." -ForegroundColor Yellow

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
APP_NAME="Workshop Management System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workshop01
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
LOG_CHANNEL=stack

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "✅ .env file created" -ForegroundColor Green
}

Write-Host "🔑 Generating Application Key..." -ForegroundColor Yellow
try {
    & php artisan key:generate --force
    Write-Host "✅ Application key generated" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to generate key: $_" -ForegroundColor Red
}

Write-Host "🗂️ Clearing caches..." -ForegroundColor Yellow
try {
    & php artisan config:clear
    & php artisan cache:clear
    & php artisan view:clear
    & php artisan route:clear
    Write-Host "✅ Caches cleared" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to clear caches: $_" -ForegroundColor Red
}

Write-Host "🗄️ Setting up Database..." -ForegroundColor Yellow
try {
    # Test database connection first
    & php artisan migrate:status
    Write-Host "✅ Database connection successful" -ForegroundColor Green
    
    # Run migrations
    & php artisan migrate --force
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
    
    # Seed database if needed
    $seedResponse = Read-Host "Do you want to seed the database with sample data? (y/N)"
    if ($seedResponse -eq 'y' -or $seedResponse -eq 'Y') {
        & php artisan db:seed --force
        Write-Host "✅ Database seeded with sample data" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️ Database setup failed: $_" -ForegroundColor Yellow
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. MySQL/MariaDB is running in Laragon" -ForegroundColor White
    Write-Host "  2. Database 'workshop01' exists" -ForegroundColor White
    Write-Host "  3. Database credentials in .env are correct" -ForegroundColor White
}

Write-Host "`n🌟 Laravel Backend Setup Complete!" -ForegroundColor Green
Write-Host "🔗 API will be available at: http://localhost:8000/api" -ForegroundColor Cyan

Write-Host "`n🚀 Starting Development Server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

try {
    & php artisan serve --host=localhost --port=8000
} catch {
    Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
    Write-Host "You can manually start it with: php artisan serve --host=localhost --port=8000" -ForegroundColor Yellow
}
