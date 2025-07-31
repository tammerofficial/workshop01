# 🔧 TammerBuilder - مجموعة أدوات PowerShell

## 📝 وصف المجلد
هذا المجلد يحتوي على جميع سكريبتات PowerShell المستخدمة في تطوير وإدارة نظام ERP ورشة الخياطة والتصنيع.

## 📁 محتويات المجلد (24 ملف)

### 🚀 سكريبتات التثبيت والإعداد
- **`ps_complete_product_enhancement_system.ps1`** - إعداد نظام المنتجات الكامل
- **`setup_production_system.ps1`** - إعداد نظام الإنتاج
- **`ps_biometric_integration_complete.ps1`** - تكامل أنظمة البصمة
- **`complete_translations.ps1`** - إعداد الترجمات الكاملة
- **`deploy.ps1`** - نشر المشروع

### 🔄 سكريبتات التكامل
- **`ps_orders_woocommerce_integration.ps1`** - تكامل الطلبيات مع WooCommerce
- **`ps_production_integration.ps1`** - تكامل أنظمة الإنتاج
- **`ps_integration_summary.ps1`** - ملخص التكاملات
- **`ps_calendar_integration.ps1`** - تكامل التقويم

### 📊 سكريبتات إدارة البيانات
- **`run_factories.ps1`** - تشغيل مصانع البيانات
- **`ps_orders_summary.ps1`** - ملخص الطلبيات
- **`ps_clients_order_details.ps1`** - تفاصيل طلبيات العملاء
- **`ps_clients_stats_fix.ps1`** - إصلاح إحصائيات العملاء

### 🔧 سكريبتات الإصلاح والتحسين
- **`fix-orders-translations.ps1`** - إصلاح ترجمات الطلبيات
- **`ps_fix_modal_visibility.ps1`** - إصلاح ظهور النوافذ المنبثقة
- **`ps_fix_order_details_modal.ps1`** - إصلاح نافذة تفاصيل الطلبية
- **`test_employee_update.ps1`** - اختبار تحديث بيانات الموظفين

### 📈 سكريبتات تتبع الإنتاج
- **`ps_production_tracking_enhancement.ps1`** - تحسين تتبع الإنتاج
- **`ps_production_tracking_and_currency.ps1`** - تتبع الإنتاج والعملات

### 🔐 سكريبتات الأمان والصلاحيات
- **`ps_roles_permissions_system.ps1`** - نظام الأدوار والصلاحيات

### 💾 سكريبتات النسخ الاحتياطي
- **`auto-backup-system.ps1`** - نظام النسخ الاحتياطي التلقائي
- **`restore-backup.ps1`** - استعادة النسخ الاحتياطية

### 🧪 سكريبتات الاختبار
- **`test_woocommerce.ps1`** - اختبار تكامل WooCommerce
- **`test-system-health.ps1`** - فحص صحة النظام

## 🚀 طريقة الاستخدام

### تشغيل سكريبت واحد:
```powershell
cd tammerbuilder
.\script-name.ps1
```

### تشغيل الإعداد الكامل:
```powershell
# للإعداد الأولي الكامل
.\ps_complete_product_enhancement_system.ps1

# للترجمات
.\complete_translations.ps1

# للنسخ الاحتياطي
.\auto-backup-system.ps1
```

## ⚠️ متطلبات التشغيل
- **PowerShell 5.1+** أو **PowerShell Core 7.0+**
- **صلاحيات التنفيذ**: قد تحتاج لتفعيل تنفيذ السكريبتات
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📋 ترتيب التشغيل المقترح

### للتثبيت الأولي:
1. `setup_production_system.ps1`
2. `ps_complete_product_enhancement_system.ps1`
3. `complete_translations.ps1`
4. `ps_biometric_integration_complete.ps1`
5. `ps_orders_woocommerce_integration.ps1`

### للصيانة اليومية:
1. `auto-backup-system.ps1`
2. `test-system-health.ps1`
3. `test_woocommerce.ps1`

## 🛠️ تخصيص السكريبتات
معظم السكريبتات تحتوي على متغيرات قابلة للتخصيص في بداية الملف:
- مسارات قواعد البيانات
- إعدادات API
- مسارات الملفات
- إعدادات الأمان

## 📞 الدعم
لأي مشاكل أو استفسارات حول السكريبتات، راجع:
- ملف `SYSTEM_GUIDE.md` في المجلد الجذر
- ملف `PROJECT_DOCUMENTATION.md` للتوثيق الشامل

---

*تاريخ آخر تحديث: 1 أغسطس 2025*  
*عدد السكريبتات: 24 سكريبت*  
*الحالة: جاهز للاستخدام ✅*