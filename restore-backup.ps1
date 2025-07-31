# سكريبت استعادة النسخ الاحتياطية
# Backup Restoration Script for Production Tracking Project

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$RestorePath = ".\restored",
    [string]$DatabaseName = "workshop_production_restored",
    [string]$MySQLUser = "root",
    [string]$MySQLPassword = "",
    [switch]$Force
)

# التحقق من وجود ملف النسخة الاحتياطية
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ ملف النسخة الاحتياطية غير موجود: $BackupFile" -ForegroundColor Red
    exit 1
}

# التحقق من أن الملف هو ملف مضغوط
if ($BackupFile -notmatch '\.zip$') {
    Write-Host "❌ الملف يجب أن يكون ملف مضغوط (.zip)" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 بدء عملية استعادة النسخة الاحتياطية..." -ForegroundColor Yellow
Write-Host "📅 التاريخ والوقت: $(Get-Date)" -ForegroundColor Cyan
Write-Host "📁 ملف النسخة الاحتياطية: $BackupFile" -ForegroundColor Cyan
Write-Host "📂 مجلد الاستعادة: $RestorePath" -ForegroundColor Cyan

# إنشاء مجلد الاستعادة
if (Test-Path $RestorePath) {
    if ($Force) {
        Write-Host "🗑️  حذف مجلد الاستعادة الموجود..." -ForegroundColor Yellow
        Remove-Item -Path $RestorePath -Recurse -Force
    } else {
        Write-Host "⚠️  مجلد الاستعادة موجود بالفعل: $RestorePath" -ForegroundColor Yellow
        $response = Read-Host "هل تريد الكتابة فوقه؟ (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "❌ تم إلغاء عملية الاستعادة" -ForegroundColor Red
            exit 1
        }
        Remove-Item -Path $RestorePath -Recurse -Force
    }
}

New-Item -ItemType Directory -Path $RestorePath -Force | Out-Null

# 1. استخراج ملف النسخة الاحتياطية
Write-Host "`n📦 استخراج ملف النسخة الاحتياطية..." -ForegroundColor Yellow

try {
    Expand-Archive -Path $BackupFile -DestinationPath $RestorePath -Force
    Write-Host "✅ تم استخراج الملف بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل في استخراج الملف: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# البحث عن المجلد المستخرج
$ExtractedFolders = Get-ChildItem -Path $RestorePath -Directory
if ($ExtractedFolders.Count -eq 1) {
    $BackupContentPath = $ExtractedFolders[0].FullName
} else {
    $BackupContentPath = $RestorePath
}

# 2. قراءة معلومات النسخة الاحتياطية
Write-Host "`n📋 قراءة معلومات النسخة الاحتياطية..." -ForegroundColor Yellow

$BackupInfoFile = Join-Path $BackupContentPath "backup_info.json"
if (Test-Path $BackupInfoFile) {
    try {
        $BackupInfo = Get-Content -Path $BackupInfoFile -Raw | ConvertFrom-Json
        
        Write-Host "📊 معلومات النسخة الاحتياطية:" -ForegroundColor Cyan
        Write-Host "   📅 تاريخ الإنشاء: $($BackupInfo.backup_date)" -ForegroundColor White
        Write-Host "   🔧 نوع النسخة: $($BackupInfo.backup_type)" -ForegroundColor White
        Write-Host "   📏 الحجم: $($BackupInfo.backup_size_mb) MB" -ForegroundColor White
        Write-Host "   📄 عدد الملفات: $($BackupInfo.files_count)" -ForegroundColor White
        Write-Host "   🗄️  قاعدة البيانات: $($BackupInfo.database_name)" -ForegroundColor White
        
        if ($BackupInfo.git_commit -ne "") {
            Write-Host "   🌿 الفرع: $($BackupInfo.git_branch)" -ForegroundColor White
            Write-Host "   📝 Commit: $($BackupInfo.git_commit)" -ForegroundColor White
        }
    } catch {
        Write-Host "⚠️  تحذير: لم يتم العثور على معلومات النسخة الاحتياطية أو تالفة" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  تحذير: لم يتم العثور على ملف معلومات النسخة الاحتياطية" -ForegroundColor Yellow
}

# 3. استعادة قاعدة البيانات
Write-Host "`n🗄️  استعادة قاعدة البيانات..." -ForegroundColor Yellow

$DatabaseFiles = Get-ChildItem -Path $BackupContentPath -Filter "database_*.sql" -Recurse
if ($DatabaseFiles.Count -gt 0) {
    $DatabaseFile = $DatabaseFiles[0].FullName
    Write-Host "📁 ملف قاعدة البيانات: $($DatabaseFiles[0].Name)" -ForegroundColor Gray
    
    # إنشاء قاعدة البيانات الجديدة
    try {
        Write-Host "🔨 إنشاء قاعدة البيانات: $DatabaseName" -ForegroundColor Gray
        
        $CreateDbCommand = "CREATE DATABASE IF NOT EXISTS $DatabaseName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        if ($MySQLPassword -eq "") {
            echo $CreateDbCommand | mysql -u $MySQLUser
        } else {
            echo $CreateDbCommand | mysql -u $MySQLUser -p$MySQLPassword
        }
        
        # استيراد البيانات
        Write-Host "📥 استيراد البيانات..." -ForegroundColor Gray
        if ($MySQLPassword -eq "") {
            mysql -u $MySQLUser $DatabaseName < $DatabaseFile
        } else {
            mysql -u $MySQLUser -p$MySQLPassword $DatabaseName < $DatabaseFile
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم استعادة قاعدة البيانات بنجاح" -ForegroundColor Green
        } else {
            Write-Host "❌ فشل في استعادة قاعدة البيانات" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ خطأ في استعادة قاعدة البيانات: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 تأكد من تشغيل MySQL وصحة إعدادات الاتصال" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  تحذير: لم يتم العثور على ملف قاعدة البيانات" -ForegroundColor Yellow
}

# 4. استعادة ملفات المشروع
Write-Host "`n📁 استعادة ملفات المشروع..." -ForegroundColor Yellow

$ProjectFilesPath = Join-Path $BackupContentPath "project_files"
if (Test-Path $ProjectFilesPath) {
    $RestoredProjectPath = Join-Path $RestorePath "project"
    
    try {
        Copy-Item -Path $ProjectFilesPath -Destination $RestoredProjectPath -Recurse -Force
        Write-Host "✅ تم استعادة ملفات المشروع بنجاح" -ForegroundColor Green
        
        # عد الملفات المستعادة
        $RestoredFiles = Get-ChildItem -Path $RestoredProjectPath -Recurse -File
        Write-Host "📄 تم استعادة $($RestoredFiles.Count) ملف" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ فشل في استعادة ملفات المشروع: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  تحذير: لم يتم العثور على ملفات المشروع" -ForegroundColor Yellow
}

# 5. إنشاء سكريبت إعداد المشروع المستعاد
Write-Host "`n🔧 إنشاء سكريبت الإعداد..." -ForegroundColor Yellow

$SetupScript = @"
# سكريبت إعداد المشروع المستعاد
# Setup script for restored project

Write-Host "🔧 إعداد المشروع المستعاد..." -ForegroundColor Yellow

# الانتقال إلى مجلد المشروع
Set-Location "$RestoredProjectPath"

Write-Host "📦 تثبيت تبعيات Node.js..." -ForegroundColor Gray
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ تم تثبيت تبعيات Node.js" -ForegroundColor Green
} else {
    Write-Host "⚠️  package.json غير موجود" -ForegroundColor Yellow
}

Write-Host "🎼 تثبيت تبعيات Composer..." -ForegroundColor Gray
if (Test-Path "api/composer.json") {
    Set-Location "api"
    composer install --no-dev --optimize-autoloader
    Set-Location ".."
    Write-Host "✅ تم تثبيت تبعيات Composer" -ForegroundColor Green
} else {
    Write-Host "⚠️  api/composer.json غير موجود" -ForegroundColor Yellow
}

Write-Host "⚙️  إنشاء ملف .env..." -ForegroundColor Gray
if (Test-Path "api/.env.example") {
    Copy-Item -Path "api/.env.example" -Destination "api/.env" -Force
    Write-Host "✅ تم إنشاء ملف .env من المثال" -ForegroundColor Green
    Write-Host "💡 لا تنس تحديث إعدادات قاعدة البيانات في api/.env" -ForegroundColor Yellow
    Write-Host "   DB_DATABASE=$DatabaseName" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  api/.env.example غير موجود" -ForegroundColor Yellow
}

Write-Host "🔑 توليد مفتاح التطبيق..." -ForegroundColor Gray
Set-Location "api"
php artisan key:generate --force
Set-Location ".."

Write-Host "🗄️  تشغيل migrations..." -ForegroundColor Gray
Set-Location "api"
php artisan migrate --force
Set-Location ".."

Write-Host "✅ تم إعداد المشروع بنجاح!" -ForegroundColor Green
Write-Host "🚀 لبدء تشغيل المشروع:" -ForegroundColor Cyan
Write-Host "   Frontend: npm run dev" -ForegroundColor White
Write-Host "   Backend: cd api && php artisan serve" -ForegroundColor White
"@

$SetupScriptPath = Join-Path $RestorePath "setup-restored-project.ps1"
$SetupScript | Out-File -FilePath $SetupScriptPath -Encoding UTF8

Write-Host "✅ تم إنشاء سكريبت الإعداد: $SetupScriptPath" -ForegroundColor Green

# 6. التقرير النهائي
Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "🎉 تمت عملية الاستعادة بنجاح!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green

Write-Host "📊 تفاصيل الاستعادة:" -ForegroundColor Cyan
Write-Host "   📁 مجلد الاستعادة: $RestorePath" -ForegroundColor White
Write-Host "   🗄️  قاعدة البيانات المستعادة: $DatabaseName" -ForegroundColor White
Write-Host "   📄 ملفات المشروع: $RestoredProjectPath" -ForegroundColor White

Write-Host "`n🔧 الخطوات التالية:" -ForegroundColor Cyan
Write-Host "   1. تشغيل سكريبت الإعداد: .$SetupScriptPath" -ForegroundColor White
Write-Host "   2. تحديث إعدادات قاعدة البيانات في api/.env" -ForegroundColor White
Write-Host "   3. تشغيل المشروع واختبار الوظائف" -ForegroundColor White

Write-Host "`n💡 ملاحظات:" -ForegroundColor Cyan
Write-Host "   • تأكد من تشغيل MySQL قبل تشغيل المشروع" -ForegroundColor White
Write-Host "   • قد تحتاج لتحديث مسارات الملفات في الإعدادات" -ForegroundColor White
Write-Host "   • اختبر جميع الوظائف للتأكد من سلامة الاستعادة" -ForegroundColor White

Write-Host "`n" + "="*60 -ForegroundColor Green

Write-Host "اضغط أي مفتاح للمتابعة..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")