# سكريبت تجهيز المشروع للنشر على cPanel (محدث)
Write-Host "🚀 تجهيز المشروع للنشر على cPanel..." -ForegroundColor Green

# تنظيف الكاش
Write-Host "1️⃣ تنظيف الكاش..." -ForegroundColor Yellow
Set-Location -Path "api"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# تحسين للإنتاج
Write-Host "2️⃣ تحسين Laravel للإنتاج..." -ForegroundColor Yellow
php artisan config:cache
php artisan route:cache
php artisan view:cache

# بناء الـ Frontend مع التحديثات الجديدة
Write-Host "3️⃣ بناء الـ Frontend مع API integration..." -ForegroundColor Yellow
Set-Location -Path ".."
npm run build

# إنشاء مجلد النشر
Write-Host "4️⃣ إنشاء مجلد النشر..." -ForegroundColor Yellow
if (Test-Path "deployment") {
    Remove-Item "deployment" -Recurse -Force
}
New-Item -ItemType Directory -Force -Path "deployment\frontend"
New-Item -ItemType Directory -Force -Path "deployment\api"

# نسخ ملفات الـ Frontend
Write-Host "5️⃣ نسخ ملفات الـ Frontend..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination "deployment\frontend" -Recurse -Force

# نسخ ملفات الـ API
Write-Host "6️⃣ نسخ ملفات الـ API..." -ForegroundColor Yellow
Copy-Item -Path "api\*" -Destination "deployment\api" -Recurse -Force

# حذف ملفات التطوير
if (Test-Path "deployment\api\node_modules") {
    Remove-Item "deployment\api\node_modules" -Recurse -Force
}
if (Test-Path "deployment\api\.git") {
    Remove-Item "deployment\api\.git" -Recurse -Force
}
if (Test-Path "deployment\api\.env") {
    Remove-Item "deployment\api\.env" -Force
}

# نسخ ملف البيئة للإنتاج
Copy-Item -Path "api\.env.production" -Destination "deployment\api\.env.example" -Force

# نسخ الملفات التوجيهية
Write-Host "7️⃣ نسخ الملفات التوجيهية..." -ForegroundColor Yellow
Copy-Item -Path "DEPLOYMENT_GUIDE.md" -Destination "deployment\" -Force
Copy-Item -Path "PRODUCTION_SUMMARY.md" -Destination "deployment\" -Force

# إنشاء ملف ZIP محدث
Write-Host "8️⃣ إنشاء ملف ZIP للنشر..." -ForegroundColor Yellow
if (Test-Path "workshop-production-ready-api.zip") {
    Remove-Item "workshop-production-ready-api.zip" -Force
}
Compress-Archive -Path "deployment\*" -DestinationPath "workshop-production-ready-api.zip" -Force

Write-Host "✅ تم تجهيز المشروع للنشر مع API integration!" -ForegroundColor Green
Write-Host "📁 الملفات جاهزة في مجلد deployment/" -ForegroundColor Cyan
Write-Host "🗜️ ملف ZIP: workshop-production-ready-api.zip" -ForegroundColor Cyan
Write-Host "📖 راجع DEPLOYMENT_GUIDE.md للتعليمات التفصيلية" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 المحدث للـ API:" -ForegroundColor Green
Write-Host "  ✅ Dashboard - يسحب من Laravel API" -ForegroundColor Green
Write-Host "  ✅ Orders - CRUD كامل مع API" -ForegroundColor Green  
Write-Host "  ✅ Inventory - CRUD كامل مع API" -ForegroundColor Green
Write-Host "  ✅ Invoices - CRUD كامل مع API" -ForegroundColor Green
Write-Host "  ✅ Workers - CRUD مع API" -ForegroundColor Green
Write-Host "  ✅ Calendar - يستخدم DepartmentAwareComponent" -ForegroundColor Green
Write-Host "  ✅ Analytics - يستخدم DepartmentAwareComponent" -ForegroundColor Green
Write-Host "  ✅ Notifications - يستخدم DepartmentAwareComponent" -ForegroundColor Green
Write-Host "  ✅ Settings - محلي (لا يحتاج API)" -ForegroundColor Green
Write-Host ""
Write-Host "🔶 بعض المكونات ما زالت تحتاج تحديث:" -ForegroundColor Yellow
Write-Host "  🔸 Advanced Features - MaterialTracker يحتاج تحديث" -ForegroundColor Yellow
Write-Host "  🔸 Production Flow - StageReports يحتاج تحديث" -ForegroundColor Yellow
Write-Host "  🔸 Client Manager - يحتاج تحديث" -ForegroundColor Yellow
