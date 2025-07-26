# دليل نشر المشروع على cPanel

## 1. إعداد قاعدة البيانات

### إنشاء قاعدة البيانات:
1. اذهب إلى cPanel → MySQL Databases
2. أنشئ قاعدة بيانات جديدة
3. أنشئ مستخدم قاعدة بيانات وأعطه جميع الصلاحيات

### تصدير قاعدة البيانات:
```bash
# من مجلد api
php artisan migrate --force
php artisan db:seed --force
```

## 2. رفع الملفات

### الـ Backend (Laravel API):
1. ارفع جميع ملفات مجلد `api` إلى مجلد `public_html/api`
2. تأكد من أن مجلد `storage` و `bootstrap/cache` قابلة للكتابة (755)

### الـ Frontend:
1. ارفع محتويات مجلد `dist` إلى `public_html` أو مجلد فرعي

## 3. إعداد البيئة

### إعداد ملف .env:
1. انسخ `.env.production` إلى `.env`
2. حدث إعدادات قاعدة البيانات:
```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

3. حدث URL التطبيق:
```env
APP_URL=https://yourdomain.com
```

4. أنشئ APP_KEY جديد:
```bash
php artisan key:generate
```

## 4. الصلاحيات المطلوبة

```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

## 5. إعداد الروابط المعاد كتابتها

تأكد من أن ملف `.htaccess` موجود في:
- `public_html/.htaccess` (للـ Frontend)
- `public_html/api/public/.htaccess` (للـ Backend)

## 6. اختبار التطبيق

### اختبار API:
```
https://yourdomain.com/api/health-check
```

### اختبار Frontend:
```
https://yourdomain.com
```

## 7. استكشاف الأخطاء

### تفعيل سجلات الأخطاء:
```env
LOG_LEVEL=debug
APP_DEBUG=false  # في الإنتاج
```

### فحص سجلات Laravel:
```
storage/logs/laravel.log
```

## 8. أمان الإنتاج

1. تأكد من `APP_DEBUG=false`
2. استخدم HTTPS
3. حدث إعدادات CORS حسب الحاجة
4. راجع صلاحيات الملفات

## 9. النسخ الاحتياطي

### نسخ احتياطي لقاعدة البيانات:
```bash
mysqldump -u username -p database_name > backup.sql
```

### نسخ احتياطي للملفات:
قم بعمل نسخة احتياطية من:
- ملف `.env`
- مجلد `storage`
- قاعدة البيانات

## 10. تحديثات المستقبل

### لتحديث الكود:
1. احذف `bootstrap/cache/*.php`
2. ارفع الملفات الجديدة
3. شغل:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
