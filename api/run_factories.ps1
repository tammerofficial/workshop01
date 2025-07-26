# Run Factories Script
Write-Host "🚀 Starting Factory Data Generation..." -ForegroundColor Green

# Navigate to API directory
Set-Location api

# Clear cache
Write-Host "🧹 Clearing cache..." -ForegroundColor Yellow
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations
Write-Host "📊 Running migrations..." -ForegroundColor Yellow
php artisan migrate:fresh

# Run seeders
Write-Host "🌱 Running seeders..." -ForegroundColor Yellow
php artisan db:seed

Write-Host "✅ Factory data generation completed!" -ForegroundColor Green
Write-Host "📈 Generated 20 records for each model" -ForegroundColor Cyan
Write-Host "🎯 Total records created: 520+" -ForegroundColor Cyan

# Show summary
Write-Host "`n📋 Summary:" -ForegroundColor Magenta
Write-Host "   • Users: 20" -ForegroundColor White
Write-Host "   • Clients: 20" -ForegroundColor White
Write-Host "   • Workers: 20" -ForegroundColor White
Write-Host "   • Materials: 20" -ForegroundColor White
Write-Host "   • Orders: 20" -ForegroundColor White
Write-Host "   • Invoices: 20" -ForegroundColor White
Write-Host "   • Tasks: 20" -ForegroundColor White
Write-Host "   • Measurements: 20" -ForegroundColor White
Write-Host "   • And many more..." -ForegroundColor White

Write-Host "`n🎉 Ready to test the application!" -ForegroundColor Green 