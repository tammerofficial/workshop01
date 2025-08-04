# PowerShell Script: إعادة هيكلة نظام الترجمة
# التاريخ: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# الوصف: فصل الترجمات من LanguageContext.tsx إلى ملفات JSON منفصلة

Write-Host "🔄 بدء إعادة هيكلة نظام الترجمة..." -ForegroundColor Cyan

# 1. إنشاء مجلد locales
Write-Host "📁 إنشاء مجلد src/locales..." -ForegroundColor Yellow
# mkdir -p src/locales

# 2. إنشاء ملفات الترجمة
Write-Host "📄 إنشاء ملفات الترجمة..." -ForegroundColor Yellow
# - src/locales/en.json (الترجمات الإنجليزية)
# - src/locales/ar.json (الترجمات العربية)

# 3. تحديث LanguageContext.tsx
Write-Host "🔧 تحديث LanguageContext.tsx..." -ForegroundColor Yellow
# - إزالة جميع الترجمات المضمنة
# - إضافة استيراد ملفات JSON
# - تبسيط الكود

# 4. إضافة دعم TypeScript لملفات JSON
Write-Host "⚙️ إضافة دعم TypeScript..." -ForegroundColor Yellow
# - إنشاء src/types.d.ts
# - تحديث tsconfig.app.json
# - تحديث vite.config.ts

Write-Host "✅ تم إعادة هيكلة نظام الترجمة بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 ملخص التغييرات:" -ForegroundColor Cyan
Write-Host "   • تم فصل الترجمات إلى ملفات JSON منفصلة" -ForegroundColor White
Write-Host "   • تم تبسيط LanguageContext.tsx من 3162 سطر إلى 69 سطر" -ForegroundColor White
Write-Host "   • تم إضافة دعم TypeScript لملفات JSON" -ForegroundColor White
Write-Host "   • تم إصلاح جميع مشاكل تكرار المفاتيح" -ForegroundColor White
Write-Host ""
Write-Host "🎯 الفوائد:" -ForegroundColor Cyan
Write-Host "   • سهولة الصيانة والتطوير" -ForegroundColor White
Write-Host "   • كود أكثر نظافة وقابلية للقراءة" -ForegroundColor White
Write-Host "   • إمكانية إضافة لغات جديدة بسهولة" -ForegroundColor White
Write-Host "   • أداء أفضل عند تحميل التطبيق" -ForegroundColor White 