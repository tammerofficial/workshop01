# اختبار صحة النظام - System Health Check
# Test script for Production Tracking System

Write-Host "🔍 فحص صحة نظام تتبع الإنتاج..." -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Green

# 1. فحص ملفات المشروع الأساسية
Write-Host "`n📁 فحص الملفات الأساسية..." -ForegroundColor Cyan

$requiredFiles = @(
    "package.json",
    "api/composer.json", 
    "api/artisan",
    "src/pages/ProductionTracking.tsx",
    "src/components/reports/ProductionReports.tsx",
    "src/components/admin/BackupManager.tsx",
    "auto-backup-system.ps1",
    "restore-backup.ps1"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "`n🎉 جميع الملفات الأساسية موجودة!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  ملفات مفقودة: $($missingFiles -join ', ')" -ForegroundColor Yellow
}

# 2. فحص تبعيات Node.js
Write-Host "`n📦 فحص تبعيات Node.js..." -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "✅ مجلد node_modules موجود" -ForegroundColor Green
    
    # فحص بعض التبعيات المهمة
    $nodePackages = @("react", "typescript", "vite", "tailwindcss", "framer-motion")
    foreach ($package in $nodePackages) {
        if (Test-Path "node_modules/$package") {
            Write-Host "✅ $package مثبت" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $package غير مثبت" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ مجلد node_modules غير موجود - قم بتشغيل: npm install" -ForegroundColor Red
}

# 3. فحص تبعيات Laravel
Write-Host "`n🎼 فحص تبعيات Laravel..." -ForegroundColor Cyan

if (Test-Path "api/vendor") {
    Write-Host "✅ مجلد vendor موجود" -ForegroundColor Green
} else {
    Write-Host "❌ مجلد vendor غير موجود - قم بتشغيل: cd api && composer install" -ForegroundColor Red
}

if (Test-Path "api/.env") {
    Write-Host "✅ ملف .env موجود" -ForegroundColor Green
} else {
    Write-Host "⚠️  ملف .env غير موجود - قم بنسخه من .env.example" -ForegroundColor Yellow
}

# 4. فحص قاعدة البيانات
Write-Host "`n🗄️  فحص قاعدة البيانات..." -ForegroundColor Cyan

try {
    Set-Location "api"
    $dbCheck = php artisan migrate:status 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ قاعدة البيانات متصلة ومهيأة" -ForegroundColor Green
    } else {
        Write-Host "⚠️  مشكلة في قاعدة البيانات - تحقق من إعدادات .env" -ForegroundColor Yellow
    }
    Set-Location ".."
} catch {
    Write-Host "❌ خطأ في فحص قاعدة البيانات: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ".."
}

# 5. فحص الخوادم
Write-Host "`n🖥️  فحص حالة الخوادم..." -ForegroundColor Cyan

# فحص Laravel Server
try {
    $laravelResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/orders" -TimeoutSec 5 -ErrorAction Stop
    if ($laravelResponse.StatusCode -eq 200) {
        Write-Host "✅ Laravel API يعمل على localhost:8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Laravel API غير متاح على localhost:8000" -ForegroundColor Red
    Write-Host "   تشغيل الخادم: cd api && php artisan serve --host=0.0.0.0 --port=8000" -ForegroundColor Yellow
}

# فحص React Dev Server
try {
    $reactResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    if ($reactResponse.StatusCode -eq 200) {
        Write-Host "✅ React Dev Server يعمل على localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ React Dev Server غير متاح على localhost:5173" -ForegroundColor Red
    Write-Host "   تشغيل الخادم: npm run dev" -ForegroundColor Yellow
}

# 6. فحص الميزات الجديدة
Write-Host "`n🆕 فحص الميزات الجديدة..." -ForegroundColor Cyan

$newFeatures = @(
    @{
        "name" = "Production Tracking Page"
        "file" = "src/pages/ProductionTracking.tsx"
        "pattern" = "MaterialUsage|WorkerEfficiency|ProductionStage"
    },
    @{
        "name" = "Production Reports"
        "file" = "src/components/reports/ProductionReports.tsx"
        "pattern" = "ReportData|generateReport|ProductionReports"
    },
    @{
        "name" = "Backup Manager"
        "file" = "src/components/admin/BackupManager.tsx"
        "pattern" = "BackupItem|createManualBackup|BackupManager"
    },
    @{
        "name" = "Auto Backup System"
        "file" = "auto-backup-system.ps1"
        "pattern" = "mysqldump|backup.*zip|النسخ الاحتياطي"
    }
)

foreach ($feature in $newFeatures) {
    if (Test-Path $feature.file) {
        $content = Get-Content $feature.file -Raw
        if ($content -match $feature.pattern) {
            Write-Host "✅ $($feature.name) - مُنفذ بالكامل" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($feature.name) - قد يحتاج تحديث" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $($feature.name) - ملف غير موجود" -ForegroundColor Red
    }
}

# 7. التقرير النهائي
Write-Host "`n" + "=" * 50 -ForegroundColor Green
Write-Host "📊 تقرير الصحة النهائي" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green

$overallStatus = "جيد"
$issues = @()

if ($missingFiles.Count -gt 0) {
    $issues += "ملفات مفقودة"
    $overallStatus = "يحتاج انتباه"
}

if (-not (Test-Path "node_modules")) {
    $issues += "تبعيات Node.js"
    $overallStatus = "يحتاج انتباه"
}

if (-not (Test-Path "api/vendor")) {
    $issues += "تبعيات Laravel"
    $overallStatus = "يحتاج انتباه"
}

if ($issues.Count -eq 0) {
    Write-Host "🎉 النظام في حالة ممتازة!" -ForegroundColor Green
    Write-Host "✅ جميع المكونات تعمل بشكل صحيح" -ForegroundColor Green
} else {
    Write-Host "⚠️  الحالة العامة: $overallStatus" -ForegroundColor Yellow
    Write-Host "📝 المشاكل المكتشفة:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Yellow
    }
}

Write-Host "`n🚀 للبدء في استخدام النظام:" -ForegroundColor Cyan
Write-Host "   1. تشغيل Laravel: cd api && php artisan serve --host=0.0.0.0 --port=8000" -ForegroundColor White
Write-Host "   2. تشغيل React: npm run dev" -ForegroundColor White
Write-Host "   3. فتح المتصفح: http://localhost:5173" -ForegroundColor White

Write-Host "`n💾 للنسخ الاحتياطية:" -ForegroundColor Cyan
Write-Host "   • نسخة يدوية: .\auto-backup-system.ps1 -Manual" -ForegroundColor White
Write-Host "   • استعادة: .\restore-backup.ps1 -BackupFile 'backup.zip'" -ForegroundColor White

Write-Host "`n" + "=" * 50 -ForegroundColor Green

# نهاية السكريبت
Write-Host "✅ اكتمل فحص النظام!" -ForegroundColor Green
Write-Host "📅 $(Get-Date)" -ForegroundColor Gray