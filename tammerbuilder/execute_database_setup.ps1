# 🗄️ تنفيذ إعداد قاعدة البيانات - Execute Database Setup
# Database Setup Execution Script for Workshop Management System

Write-Host "🗄️ بدء إعداد قاعدة البيانات workshop_asdgdgh45" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# التحقق من وجود MySQL
Write-Host "`n🔍 التحقق من MySQL..." -ForegroundColor Yellow
try {
    $mysqlPath = "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"
    if (Test-Path $mysqlPath) {
        Write-Host "✅ تم العثور على MySQL في Laragon" -ForegroundColor Green
        $mysql = $mysqlPath
    } else {
        Write-Host "⚠️  لم يتم العثور على MySQL في Laragon، جاري البحث في النظام..." -ForegroundColor Yellow
        $mysql = "mysql"
    }
} catch {
    Write-Host "❌ خطأ في العثور على MySQL" -ForegroundColor Red
    exit 1
}

# إنشاء قاعدة البيانات
Write-Host "`n📋 إنشاء قاعدة البيانات..." -ForegroundColor Yellow
$createDbCommand = "CREATE DATABASE IF NOT EXISTS ``workshop_asdgdgh45`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    Write-Host "تنفيذ: $createDbCommand" -ForegroundColor Cyan
    & $mysql -u root -p -e $createDbCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ تم إنشاء قاعدة البيانات بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "❌ فشل في إنشاء قاعدة البيانات" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ خطأ أثناء إنشاء قاعدة البيانات: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# تنفيذ المخطط الكامل
Write-Host "`n🏗️  تنفيذ مخطط قاعدة البيانات الكامل..." -ForegroundColor Yellow
$schemaFile = "tammerbuilder\complete_database_schema.sql"

if (Test-Path $schemaFile) {
    try {
        Write-Host "📄 تنفيذ ملف: $schemaFile" -ForegroundColor Cyan
        & $mysql -u root -p "workshop_asdgdgh45" -e "source $schemaFile"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم تنفيذ مخطط قاعدة البيانات بنجاح!" -ForegroundColor Green
        } else {
            Write-Host "❌ فشل في تنفيذ مخطط قاعدة البيانات" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ خطأ أثناء تنفيذ المخطط: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ لم يتم العثور على ملف المخطط: $schemaFile" -ForegroundColor Red
}

# التحقق من الجداول
Write-Host "`n📊 التحقق من الجداول..." -ForegroundColor Yellow
$checkTablesCommand = "SELECT COUNT(*) as 'Total Tables' FROM information_schema.tables WHERE table_schema = 'workshop_asdgdgh45';"

try {
    Write-Host "تنفيذ: $checkTablesCommand" -ForegroundColor Cyan
    & $mysql -u root -p -e $checkTablesCommand
} catch {
    Write-Host "❌ خطأ أثناء التحقق من الجداول: $($_.Exception.Message)" -ForegroundColor Red
}

# عرض الجداول المنشأة
Write-Host "`n📋 عرض الجداول المنشأة..." -ForegroundColor Yellow
$showTablesCommand = "USE workshop_asdgdgh45; SHOW TABLES;"

try {
    Write-Host "تنفيذ: $showTablesCommand" -ForegroundColor Cyan
    & $mysql -u root -p -e $showTablesCommand
} catch {
    Write-Host "❌ خطأ أثناء عرض الجداول: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 انتهى إعداد قاعدة البيانات!" -ForegroundColor Green
Write-Host "📝 ملاحظات:" -ForegroundColor Yellow
Write-Host "  • اسم قاعدة البيانات: workshop_asdgdgh45" -ForegroundColor White
Write-Host "  • تأكد من تحديث ملف .env في Laravel" -ForegroundColor White
Write-Host "  • يمكنك الآن تشغيل المشروع" -ForegroundColor White

Write-Host "`n🔗 روابط مفيدة:" -ForegroundColor Cyan
Write-Host "  phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host "  API Backend: http://localhost:8000" -ForegroundColor White
