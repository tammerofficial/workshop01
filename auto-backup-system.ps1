# نظام النسخ الاحتياطي التلقائي للمشروع
# Auto Backup System for Production Tracking Project

param(
    [switch]$Manual,
    [string]$BackupPath = ".\backups",
    [string]$DatabaseName = "workshop_production",
    [string]$MySQLUser = "root",
    [string]$MySQLPassword = "",
    [int]$RetentionDays = 30
)

# إعداد المتغيرات
$ProjectRoot = Get-Location
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupDir = Join-Path $BackupPath $Timestamp

# إنشاء مجلد النسخ الاحتياطية
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "✅ تم إنشاء مجلد النسخ الاحتياطية: $BackupPath" -ForegroundColor Green
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

Write-Host "🔄 بدء عملية النسخ الاحتياطي..." -ForegroundColor Yellow
Write-Host "📅 التاريخ والوقت: $(Get-Date)" -ForegroundColor Cyan
Write-Host "📁 مجلد النسخة الاحتياطية: $BackupDir" -ForegroundColor Cyan

# 1. نسخ احتياطي لقاعدة البيانات
Write-Host "`n🗄️  نسخ احتياطي لقاعدة البيانات..." -ForegroundColor Yellow

$DatabaseBackupFile = Join-Path $BackupDir "database_$Timestamp.sql"

try {
    if ($MySQLPassword -eq "") {
        & mysqldump -u $MySQLUser $DatabaseName > $DatabaseBackupFile
    } else {
        & mysqldump -u $MySQLUser -p$MySQLPassword $DatabaseName > $DatabaseBackupFile
    }
    
    if ($LASTEXITCODE -eq 0) {
        $DbSize = [math]::Round((Get-Item $DatabaseBackupFile).Length / 1MB, 2)
        Write-Host "✅ تم نسخ قاعدة البيانات بنجاح ($DbSize MB)" -ForegroundColor Green
    } else {
        Write-Host "❌ فشل في نسخ قاعدة البيانات" -ForegroundColor Red
        throw "Database backup failed"
    }
} catch {
    Write-Host "⚠️  تحذير: لم يتم العثور على mysqldump أو فشل في الاتصال بقاعدة البيانات" -ForegroundColor Yellow
    Write-Host "💡 تأكد من تشغيل MySQL وصحة إعدادات الاتصال" -ForegroundColor Yellow
}

# 2. نسخ احتياطي لملفات المشروع
Write-Host "`n📁 نسخ احتياطي لملفات المشروع..." -ForegroundColor Yellow

$ProjectBackupDir = Join-Path $BackupDir "project_files"
New-Item -ItemType Directory -Path $ProjectBackupDir -Force | Out-Null

# قائمة الملفات والمجلدات المهمة
$ImportantPaths = @(
    "src",
    "api/app",
    "api/config", 
    "api/database",
    "api/routes",
    "api/composer.json",
    "api/composer.lock",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "*.md",
    "*.ps1"
)

foreach ($Path in $ImportantPaths) {
    $SourcePath = Join-Path $ProjectRoot $Path
    
    if (Test-Path $SourcePath) {
        $DestPath = Join-Path $ProjectBackupDir $Path
        
        if ((Get-Item $SourcePath) -is [System.IO.DirectoryInfo]) {
            # نسخ المجلد
            $ParentDir = Split-Path $DestPath -Parent
            if (-not (Test-Path $ParentDir)) {
                New-Item -ItemType Directory -Path $ParentDir -Force | Out-Null
            }
            Copy-Item -Path $SourcePath -Destination $DestPath -Recurse -Force
            Write-Host "📂 تم نسخ المجلد: $Path" -ForegroundColor Gray
        } else {
            # نسخ الملف
            $ParentDir = Split-Path $DestPath -Parent
            if (-not (Test-Path $ParentDir)) {
                New-Item -ItemType Directory -Path $ParentDir -Force | Out-Null
            }
            Copy-Item -Path $SourcePath -Destination $DestPath -Force
            Write-Host "📄 تم نسخ الملف: $Path" -ForegroundColor Gray
        }
    }
}

# نسخ ملفات إضافية بأنماط البحث
Get-ChildItem -Path $ProjectRoot -Filter "*.md" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $ProjectBackupDir -Force
}

Get-ChildItem -Path $ProjectRoot -Filter "*.ps1" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $ProjectBackupDir -Force
}

Write-Host "✅ تم نسخ ملفات المشروع بنجاح" -ForegroundColor Green

# 3. إنشاء ملف معلومات النسخة الاحتياطية
Write-Host "`n📋 إنشاء ملف معلومات النسخة الاحتياطية..." -ForegroundColor Yellow

$BackupInfo = @{
    "backup_date" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "backup_type" = if ($Manual) { "manual" } else { "automatic" }
    "project_path" = $ProjectRoot.ToString()
    "database_name" = $DatabaseName
    "mysql_user" = $MySQLUser
    "backup_size_mb" = [math]::Round((Get-ChildItem -Path $BackupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    "files_count" = (Get-ChildItem -Path $BackupDir -Recurse -File).Count
    "git_commit" = ""
    "git_branch" = ""
}

# معلومات Git إذا كانت متوفرة
try {
    $BackupInfo.git_commit = (git rev-parse HEAD 2>$null).Trim()
    $BackupInfo.git_branch = (git branch --show-current 2>$null).Trim()
} catch {
    Write-Host "⚠️  معلومات Git غير متوفرة" -ForegroundColor Yellow
}

$BackupInfoFile = Join-Path $BackupDir "backup_info.json"
$BackupInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath $BackupInfoFile -Encoding UTF8

Write-Host "✅ تم إنشاء ملف معلومات النسخة الاحتياطية" -ForegroundColor Green

# 4. ضغط النسخة الاحتياطية
Write-Host "`n🗜️  ضغط النسخة الاحتياطية..." -ForegroundColor Yellow

$ZipFile = Join-Path $BackupPath "backup_$Timestamp.zip"

try {
    Compress-Archive -Path $BackupDir -DestinationPath $ZipFile -Force
    
    $ZipSize = [math]::Round((Get-Item $ZipFile).Length / 1MB, 2)
    Write-Host "✅ تم ضغط النسخة الاحتياطية بنجاح ($ZipSize MB)" -ForegroundColor Green
    
    # حذف المجلد المؤقت
    Remove-Item -Path $BackupDir -Recurse -Force
    Write-Host "🧹 تم تنظيف الملفات المؤقتة" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ فشل في ضغط النسخة الاحتياطية: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. تنظيف النسخ الاحتياطية القديمة
Write-Host "`n🧹 تنظيف النسخ الاحتياطية القديمة..." -ForegroundColor Yellow

$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldBackups = Get-ChildItem -Path $BackupPath -Filter "backup_*.zip" | Where-Object { $_.CreationTime -lt $CutoffDate }

if ($OldBackups) {
    foreach ($OldBackup in $OldBackups) {
        Remove-Item -Path $OldBackup.FullName -Force
        Write-Host "🗑️  تم حذف النسخة الاحتياطية القديمة: $($OldBackup.Name)" -ForegroundColor Gray
    }
    Write-Host "✅ تم تنظيف $($OldBackups.Count) نسخة احتياطية قديمة" -ForegroundColor Green
} else {
    Write-Host "ℹ️  لا توجد نسخ احتياطية قديمة للحذف" -ForegroundColor Gray
}

# 6. تقرير النهائي
Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "🎉 تمت عملية النسخ الاحتياطي بنجاح!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green

Write-Host "📊 تفاصيل النسخة الاحتياطية:" -ForegroundColor Cyan
Write-Host "   📁 المسار: $ZipFile" -ForegroundColor White
Write-Host "   📏 الحجم: $ZipSize MB" -ForegroundColor White
Write-Host "   📄 عدد الملفات: $($BackupInfo.files_count)" -ForegroundColor White
Write-Host "   🕐 وقت الإنشاء: $($BackupInfo.backup_date)" -ForegroundColor White

if ($BackupInfo.git_commit -ne "") {
    Write-Host "   🌿 الفرع: $($BackupInfo.git_branch)" -ForegroundColor White
    Write-Host "   📝 آخر commit: $($BackupInfo.git_commit.Substring(0,8))" -ForegroundColor White
}

# 7. إعداد المهمة المجدولة (إذا لم تكن موجودة)
if ($Manual -eq $false) {
    Write-Host "`n⏰ فحص المهمة المجدولة..." -ForegroundColor Yellow
    
    $TaskName = "ProductionTrackingBackup"
    $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    
    if (-not $ExistingTask) {
        Write-Host "📅 إنشاء مهمة مجدولة للنسخ الاحتياطي التلقائي..." -ForegroundColor Yellow
        
        $Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
        $Trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        
        try {
            Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "نسخ احتياطي تلقائي يومي لمشروع تتبع الإنتاج" -Force
            Write-Host "✅ تم إنشاء المهمة المجدولة بنجاح (تشغيل يومي في 2:00 صباحاً)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  فشل في إنشاء المهمة المجدولة: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "💡 يمكنك إعداد المهمة المجدولة يدوياً من خلال إدارة المهام" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  المهمة المجدولة موجودة بالفعل" -ForegroundColor Gray
    }
}

Write-Host "`n🔧 لاستعادة النسخة الاحتياطية:" -ForegroundColor Cyan
Write-Host "   1. استخراج الملف المضغوط: $ZipFile" -ForegroundColor White
Write-Host "   2. استعادة قاعدة البيانات: mysql -u $MySQLUser -p $DatabaseName < database_$Timestamp.sql" -ForegroundColor White
Write-Host "   3. نسخ ملفات المشروع إلى المجلد الأصلي" -ForegroundColor White

Write-Host "`n💡 نصائح:" -ForegroundColor Cyan
Write-Host "   • تحقق من النسخ الاحتياطية بانتظام" -ForegroundColor White
Write-Host "   • احتفظ بنسخ إضافية في مواقع خارجية" -ForegroundColor White
Write-Host "   • اختبر عملية الاستعادة دورياً" -ForegroundColor White

Write-Host "`n" + "="*60 -ForegroundColor Green

# إنهاء السكريبت
if ($Manual) {
    Write-Host "اضغط أي مفتاح للمتابعة..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}