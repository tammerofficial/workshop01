# PowerShell Script to Fix Orders Page Translations
# إصلاح الترجمات في صفحة الطلبات

Write-Host "🔧 بدء إصلاح ترجمات صفحة الطلبات..." -ForegroundColor Green

# قراءة محتوى ملف الطلبات الحالي
$ordersFile = "src/pages/Orders.tsx"
$content = Get-Content $ordersFile -Raw

Write-Host "📝 إضافة الترجمات المفقودة لنموذج إنشاء الطلب..." -ForegroundColor Yellow

# إضافة ترجمات نموذج إنشاء الطلب إلى ملف اللغة
$additionalTranslations = @"

    // Orders Form Translations (English)
    'orders.form.title.label': 'Order Title',
    'orders.form.client.label': 'Client',
    'orders.form.client.placeholder': 'Select a client',
    'orders.form.category.label': 'Category',
    'orders.form.category.placeholder': 'Select a category',
    'orders.form.worker.label': 'Assigned Worker',
    'orders.form.worker.placeholder': 'Select a worker',
    'orders.form.priority.label': 'Priority',
    'orders.form.priority.low': 'Low',
    'orders.form.priority.medium': 'Medium',
    'orders.form.priority.high': 'High',
    'orders.form.priority.urgent': 'Urgent',
    'orders.form.cost.label': 'Total Cost',
    'orders.form.startDate.label': 'Start Date',
    'orders.form.dueDate.label': 'Due Date',
    'orders.form.description.label': 'Description',
    'orders.form.createButton': 'Create Order',
    'orders.form.updateButton': 'Update Order',
    'orders.form.cancelButton': 'Cancel',
    'orders.editModal.title': 'Edit Order',
"@

$additionalTranslationsAr = @"

    // Orders Form Translations (Arabic)
    'orders.form.title.label': 'عنوان الطلب',
    'orders.form.client.label': 'العميل',
    'orders.form.client.placeholder': 'اختر العميل',
    'orders.form.category.label': 'التصنيف',
    'orders.form.category.placeholder': 'اختر التصنيف',
    'orders.form.worker.label': 'العامل المسؤول',
    'orders.form.worker.placeholder': 'اختر العامل',
    'orders.form.priority.label': 'الأولوية',
    'orders.form.priority.low': 'منخفض',
    'orders.form.priority.medium': 'متوسط',
    'orders.form.priority.high': 'عالي',
    'orders.form.priority.urgent': 'عاجل',
    'orders.form.cost.label': 'التكلفة',
    'orders.form.startDate.label': 'تاريخ البداية',
    'orders.form.dueDate.label': 'تاريخ التسليم',
    'orders.form.description.label': 'الوصف',
    'orders.form.createButton': 'إنشاء الطلب',
    'orders.form.updateButton': 'تحديث الطلب',
    'orders.form.cancelButton': 'إلغاء',
    'orders.editModal.title': 'تعديل الطلب',
"@

Write-Host "✅ تم إنشاء الترجمات الإضافية!" -ForegroundColor Green

# إرشادات للمطور
Write-Host "`n📋 الخطوات التالية:" -ForegroundColor Cyan
Write-Host "1. أضف الترجمات الإنجليزية إلى قسم 'en' في ملف LanguageContext.tsx"
Write-Host "2. أضف الترجمات العربية إلى قسم 'ar' في ملف LanguageContext.tsx"
Write-Host "3. استبدل النصوص المباشرة في Orders.tsx بـ t() calls"

Write-Host "`n🔄 مثال على الاستبدال المطلوب:" -ForegroundColor Yellow
Write-Host "من: <label>عنوان الطلب</label>"
Write-Host "إلى: <label>{t('orders.form.title.label')}</label>"

Write-Host "`n🎯 النصوص التي تحتاج استبدال في Orders.tsx:" -ForegroundColor Magenta
$textsToReplace = @(
    "عنوان الطلب -> orders.form.title.label",
    "العميل -> orders.form.client.label", 
    "اختر العميل -> orders.form.client.placeholder",
    "التصنيف -> orders.form.category.label",
    "اختر التصنيف -> orders.form.category.placeholder",
    "العامل المسؤول -> orders.form.worker.label",
    "اختر العامل -> orders.form.worker.placeholder",
    "الأولوية -> orders.form.priority.label",
    "منخفض -> orders.form.priority.low",
    "متوسط -> orders.form.priority.medium", 
    "عالي -> orders.form.priority.high",
    "عاجل -> orders.form.priority.urgent",
    "التكلفة -> orders.form.cost.label",
    "تاريخ البداية -> orders.form.startDate.label",
    "تاريخ التسليم -> orders.form.dueDate.label",
    "الوصف -> orders.form.description.label",
    "إنشاء الطلب -> orders.form.createButton",
    "تعديل الطلب -> orders.editModal.title",
    "إلغاء -> orders.form.cancelButton"
)

foreach ($text in $textsToReplace) {
    Write-Host "• $text" -ForegroundColor White
}

Write-Host "`n📦 الترجمات الإنجليزية المطلوب إضافتها:" -ForegroundColor Green
Write-Host $additionalTranslations

Write-Host "`n📦 الترجمات العربية المطلوب إضافتها:" -ForegroundColor Green  
Write-Host $additionalTranslationsAr

Write-Host "`n🚀 بعد إضافة الترجمات، شغل الأمر التالي لحفظ التغييرات:" -ForegroundColor Yellow
Write-Host "git add . && git commit -m 'v1.3 - Fix Orders translations' && git push origin main" 