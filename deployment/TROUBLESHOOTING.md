# دليل استكشاف الأخطاء وحلها 🔧

## 🚨 المشاكل الشائعة وحلولها

### 1. صفحة بيضاء أو أخطاء 404 للملفات

#### المشكلة:
```
Failed to load resource: the server responded with a status of 404
index-J5xquS_O.js:1
index-DZ376IDN.css:1
```

#### الحلول:

**أ) تحقق من المسارات:**
- تأكد أن ملفات `assets/` موجودة في نفس مجلد `index.html`
- تحقق من أن المسارات نسبية (تبدأ بـ `./` وليس `/`)

**ب) تحقق من ملف .htaccess:**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**ج) صلاحيات الملفات:**
```bash
chmod -R 755 public_html/
```

### 2. مشاكل API (500/404)

#### فحص Laravel:
```bash
# تحقق من سجلات الأخطاء
tail -f storage/logs/laravel.log

# تنظيف الكاش
php artisan cache:clear
php artisan config:clear

# إعادة إنشاء الكاش
php artisan config:cache
php artisan route:cache
```

#### فحص قاعدة البيانات:
```bash
# اختبار الاتصال
php artisan migrate:status

# تشغيل المايجريشن
php artisan migrate --force
```

### 3. مشاكل CORS

#### إذا ظهر خطأ CORS:
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS policy
```

#### الحل في Laravel (config/cors.php):
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'], // أو نطاقك المحدد
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

### 4. مشاكل البيئة (.env)

#### تحقق من ملف .env:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

#### إنشاء APP_KEY:
```bash
php artisan key:generate
```

### 5. مشاكل الصلاحيات

#### صلاحيات Laravel:
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
```

### 6. فحص سريع للنظام

#### استخدم ملف health-check.php:
```
https://yourdomain.com/api/health-check.php
```

يجب أن يظهر:
```json
{
    "status": "success",
    "message": "Laravel is ready!",
    "checks": {
        "php_version": "8.x",
        "laravel_readable": true,
        "env_file": true,
        "storage_writable": true,
        "cache_writable": true,
        "app_key_set": true,
        "database_connection": true
    }
}
```

## 🔍 أدوات التشخيص

### 1. فحص ملفات Frontend:
```bash
# تحقق من وجود الملفات
ls -la public_html/assets/
ls -la public_html/index.html
```

### 2. فحص Laravel:
```bash
# سجلات الأخطاء
tail -f storage/logs/laravel.log

# فحص التكوين
php artisan config:show
```

### 3. فحص قاعدة البيانات:
```bash
# اختبار الاتصال
php artisan tinker
>>> DB::connection()->getPdo();
```

## 📞 مساعدة إضافية

### معلومات مهمة للدعم الفني:
1. نوع الاستضافة وإصدار PHP
2. رسائل الخطأ الكاملة من Developer Tools
3. محتوى ملف `storage/logs/laravel.log`
4. صورة شاشة للخطأ

### تحقق من:
- [ ] ملفات assets موجودة
- [ ] ملف .htaccess موجود
- [ ] صلاحيات الملفات صحيحة
- [ ] ملف .env مُعد بشكل صحيح
- [ ] قاعدة البيانات تعمل
- [ ] Laravel cache مُحدث

---
**💡 نصيحة**: احتفظ بنسخة احتياطية قبل إجراء أي تغييرات!
