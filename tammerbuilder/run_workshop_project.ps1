# 🚀 تشغيل مشروع نظام إدارة الورشة الكامل
# Workshop Management System - Complete Startup Script
# تاريخ الإنشاء: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "🚀 بدء تشغيل مشروع نظام إدارة الورشة..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# التحقق من وجود المتطلبات الأساسية
Write-Host "🔍 فحص المتطلبات الأساسية..." -ForegroundColor Yellow

# التحقق من وجود Composer
$composerExists = Get-Command composer -ErrorAction SilentlyContinue
if (-not $composerExists) {
    Write-Host "❌ Composer غير مثبت!" -ForegroundColor Red
    Write-Host "يرجى تثبيت Composer من: https://getcomposer.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Composer متوفر" -ForegroundColor Green

# التحقق من وجود PHP
$phpExists = Get-Command php -ErrorAction SilentlyContinue
if (-not $phpExists) {
    Write-Host "❌ PHP غير مثبت!" -ForegroundColor Red
    Write-Host "يرجى تثبيت PHP أو تشغيل Laragon" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ PHP متوفر" -ForegroundColor Green

# التحقق من وجود Node.js
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "❌ Node.js غير مثبت!" -ForegroundColor Red
    Write-Host "يرجى تثبيت Node.js من: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js متوفر" -ForegroundColor Green

Write-Host "`n🔧 إعداد Laravel Backend..." -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray

# الانتقال إلى مجلد api
Set-Location "api"

Write-Host "📦 تثبيت Composer dependencies..." -ForegroundColor Yellow
try {
    & composer install --optimize-autoloader
    Write-Host "✅ تم تثبيت Composer dependencies بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل في تثبيت Composer dependencies: $_" -ForegroundColor Red
    Write-Host "🔧 محاولة إصلاح المشكلة..." -ForegroundColor Yellow
    & composer update
}

Write-Host "🔑 توليد مفتاح التطبيق..." -ForegroundColor Yellow
try {
    & php artisan key:generate --force
    Write-Host "✅ تم توليد مفتاح التطبيق" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل في توليد مفتاح التطبيق: $_" -ForegroundColor Red
}

Write-Host "🗂️ مسح cache..." -ForegroundColor Yellow
try {
    & php artisan config:clear
    & php artisan cache:clear
    & php artisan route:clear
    & php artisan view:clear
    Write-Host "✅ تم مسح cache بنجاح" -ForegroundColor Green
} catch {
    Write-Host "⚠️ تحذير: لم يتمكن من مسح cache: $_" -ForegroundColor Yellow
}

Write-Host "🗄️ إعداد قاعدة البيانات..." -ForegroundColor Yellow
try {
    & php artisan migrate:status
    $migrateResponse = Read-Host "هل تريد تشغيل migrations؟ (y/N)"
    if ($migrateResponse -eq 'y' -or $migrateResponse -eq 'Y') {
        & php artisan migrate --force
        Write-Host "✅ تم تشغيل migrations بنجاح" -ForegroundColor Green
        
        $seedResponse = Read-Host "هل تريد إضافة بيانات تجريبية؟ (y/N)"
        if ($seedResponse -eq 'y' -or $seedResponse -eq 'Y') {
            & php artisan db:seed --force
            Write-Host "✅ تم إضافة البيانات التجريبية" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "⚠️ تحذير: مشكلة في قاعدة البيانات: $_" -ForegroundColor Yellow
    Write-Host "تأكد من تشغيل MySQL في Laragon وإنشاء قاعدة البيانات" -ForegroundColor White
}

# العودة إلى المجلد الجذر
Set-Location ".."

Write-Host "`n⚡ إعداد React Frontend..." -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray

Write-Host "📦 تثبيت NPM dependencies..." -ForegroundColor Yellow
try {
    & npm install
    Write-Host "✅ تم تثبيت NPM dependencies بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل في تثبيت NPM dependencies: $_" -ForegroundColor Red
    Write-Host "🔧 محاولة استخدام npm ci..." -ForegroundColor Yellow
    try {
        & npm ci
        Write-Host "✅ تم تثبيت NPM dependencies باستخدام ci" -ForegroundColor Green
    } catch {
        Write-Host "❌ فشل في تثبيت dependencies. تحقق من اتصال الإنترنت" -ForegroundColor Red
    }
}

Write-Host "`n🌟 تشغيل النظام..." -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray

Write-Host "🔥 تشغيل Laravel Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\api'; Write-Host '🚀 Laravel Backend يعمل على http://localhost:8000' -ForegroundColor Green; php artisan serve --host=0.0.0.0 --port=8000"

# انتظار قصير للتأكد من تشغيل الباكند
Start-Sleep -Seconds 3

Write-Host "⚡ تشغيل React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🚀 React Frontend يعمل على http://localhost:5173' -ForegroundColor Green; npm run dev"

Write-Host "`n🎉 تم تشغيل النظام بنجاح!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n🔗 روابط النظام:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend (React): http://localhost:5173" -ForegroundColor White
Write-Host "  🔧 Backend (Laravel): http://localhost:8000" -ForegroundColor White
Write-Host "  📊 API Documentation: http://localhost:8000/api" -ForegroundColor White
Write-Host "  🗄️ Database: متصل عبر Laravel" -ForegroundColor White

Write-Host "`n👤 بيانات تسجيل الدخول الافتراضية:" -ForegroundColor Cyan
Write-Host "  📧 البريد الإلكتروني: admin@workshop.com" -ForegroundColor White
Write-Host "  🔐 كلمة المرور: password" -ForegroundColor White

Write-Host "`n📝 ملاحظات مهمة:" -ForegroundColor Yellow
Write-Host "  • تأكد من تشغيل Laragon (Apache + MySQL)" -ForegroundColor White
Write-Host "  • Laravel يعمل على البورت 8000" -ForegroundColor White
Write-Host "  • React يعمل على البورت 5173" -ForegroundColor White
Write-Host "  • لإيقاف الخوادم اضغط Ctrl+C في كل نافذة" -ForegroundColor White

Write-Host "`n🛠️ استكشاف الأخطاء:" -ForegroundColor Yellow
Write-Host "  🔧 إذا فشل Laravel: تحقق من ملف .env" -ForegroundColor White
Write-Host "  🔧 إذا فشل React: تحقق من node_modules" -ForegroundColor White
Write-Host "  🔧 إذا فشلت قاعدة البيانات: تحقق من إعدادات MySQL" -ForegroundColor White

Write-Host "`n🚀 النظام جاهز للاستخدام!" -ForegroundColor Green

# انتظار حتى يضغط المستخدم على أي مفتاح
Write-Host "`nاضغط أي مفتاح للخروج..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
