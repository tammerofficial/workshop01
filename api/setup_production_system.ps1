# Production System Setup Script
Write-Host "🚀 Setting up Production System..." -ForegroundColor Green

# Run migrations
Write-Host "📊 Running migrations..." -ForegroundColor Yellow
php artisan migrate

# Run seeders
Write-Host "🌱 Running seeders..." -ForegroundColor Yellow
php artisan db:seed --class=ProductionStagesSeeder
php artisan db:seed --class=StationsSeeder

# Clear cache
Write-Host "🧹 Clearing cache..." -ForegroundColor Yellow
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Generate application key if not exists
Write-Host "🔑 Checking application key..." -ForegroundColor Yellow
php artisan key:generate --force

Write-Host "✅ Production system setup completed!" -ForegroundColor Green
Write-Host "📋 Available API endpoints:" -ForegroundColor Cyan
Write-Host "   POST /api/production/orders/{order}/start" -ForegroundColor White
Write-Host "   POST /api/production/stages/{trackingId}/start" -ForegroundColor White
Write-Host "   POST /api/production/stages/{trackingId}/complete" -ForegroundColor White
Write-Host "   POST /api/production/orders/{order}/materials" -ForegroundColor White
Write-Host "   POST /api/production/orders/{order}/sales" -ForegroundColor White
Write-Host "   POST /api/production/attendance" -ForegroundColor White
Write-Host "   GET  /api/production/orders/{order}/progress" -ForegroundColor White
Write-Host "   GET  /api/production/dashboard" -ForegroundColor White 