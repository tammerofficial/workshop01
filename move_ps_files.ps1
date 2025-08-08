# نقل جميع ملفات PowerShell إلى مجلد tammerbuilder
Write-Host "🔄 نقل ملفات PowerShell إلى مجلد tammerbuilder..." -ForegroundColor Green

# إنشاء مجلد tammerbuilder إذا لم يكن موجوداً
if (-not (Test-Path "tammerbuilder")) {
    New-Item -ItemType Directory -Path "tammerbuilder"
    Write-Host "✅ تم إنشاء مجلد tammerbuilder" -ForegroundColor Yellow
}

# الحصول على جميع ملفات .ps1 في المجلد الجذر
$psFiles = Get-ChildItem -Path "." -Filter "*.ps1" | Where-Object { $_.Name -ne "move_ps_files.ps1" }

Write-Host "📁 تم العثور على $($psFiles.Count) ملف PowerShell" -ForegroundColor Cyan

foreach ($file in $psFiles) {
    $destinationPath = Join-Path "tammerbuilder" $file.Name
    
    # نقل الملف إلى مجلد tammerbuilder
    Move-Item -Path $file.FullName -Destination $destinationPath -Force
    Write-Host "➡️  تم نقل: $($file.Name)" -ForegroundColor White
}

Write-Host "`n✅ تم نقل جميع ملفات PowerShell بنجاح!" -ForegroundColor Green
Write-Host "📂 المجلد: tammerbuilder" -ForegroundColor Cyan
Write-Host "📊 العدد الإجمالي: $($psFiles.Count) ملف" -ForegroundColor Yellow

# عرض محتويات المجلد
Write-Host "`n📋 محتويات مجلد tammerbuilder:" -ForegroundColor Magenta
Get-ChildItem -Path "tammerbuilder" -Filter "*.ps1" | ForEach-Object {
    Write-Host "   - $($_.Name)" -ForegroundColor Gray
}
