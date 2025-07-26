# ملفات النشر - نظام إدارة ورشة التفصيل

## 📁 محتويات المجلد

### `frontend/` - ملفات الواجهة الأمامية
- ارفع محتويات هذا المجلد إلى `public_html` (أو المجلد الرئيسي للموقع)
- يحتوي على:
  - `index.html` - الصفحة الرئيسية
  - `assets/` - ملفات CSS و JavaScript
  - `.htaccess` - إعدادات إعادة التوجيه

### `api/` - ملفات الـ Backend (Laravel)
- ارفع محتويات هذا المجلد إلى `public_html/api` أو مجلد منفصل
- **مهم**: ارفع محتويات `public/` إلى المجلد الرئيسي للـ API

## 🚀 خطوات النشر السريع

### 1. إعداد قاعدة البيانات
```sql
-- أنشئ قاعدة بيانات جديدة في cPanel
CREATE DATABASE workshop_db;
```

### 2. رفع الملفات
```
public_html/
├── index.html          (من frontend/)
├── assets/             (من frontend/)
├── .htaccess           (من frontend/)
└── api/
    ├── index.php       (من api/public/)
    ├── .htaccess       (من api/public/)
    └── [باقي ملفات Laravel]
```

### 3. إعداد البيئة
1. انسخ `.env.example` إلى `.env`
2. حدث إعدادات قاعدة البيانات في `.env`
3. شغل: `php artisan key:generate`
4. شغل: `php artisan migrate --force`

### 4. اختبار التطبيق
- الواجهة: `https://yourdomain.com`
- API: `https://yourdomain.com/api`

## 🔧 الإعدادات المطلوبة

### ملف `.env` (أساسي):
```env
APP_NAME="Tailoring Workshop Management"
APP_ENV=production
APP_KEY=[سيتم إنشاؤه تلقائياً]
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

### صلاحيات الملفات:
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

## 📞 الدعم الفني

في حالة وجود مشاكل:
1. تحقق من ملف `storage/logs/laravel.log`
2. تأكد من صلاحيات الملفات
3. راجع إعدادات قاعدة البيانات

---
**تاريخ الإنشاء**: 26 يوليو 2025
**الإصدار**: 1.0.0
