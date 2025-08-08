# 🚀 تشغيل سريع لمشروع الورشة
# Quick Start for Workshop Management System

Write-Host "🚀 تشغيل سريع للمشروع..." -ForegroundColor Green

# 1. تشغيل Laravel Backend
Write-Host "🔥 تشغيل Laravel Backend..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", "cd /d `"$PWD\api`" && php artisan serve --host=0.0.0.0 --port=8000"

# انتظار قصير
Start-Sleep -Seconds 2

# 2. تشغيل React Frontend
Write-Host "⚡ تشغيل React Frontend..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", "cd /d `"$PWD`" && npm run dev"

Write-Host "`n✅ تم تشغيل النظام!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan

Write-Host "`nاضغط أي مفتاح للخروج..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
