# 🚀 دليل النظام الشامل - نظام ERP ورشة الخياطة والتصنيع

## 📋 فهرس المحتويات
1. [دليل التشغيل السريع](#-دليل-التشغيل-السريع)
2. [متطلبات النظام](#-متطلبات-النظام)
3. [تعليمات التثبيت](#-تعليمات-التثبيت)
4. [دليل الاستخدام](#-دليل-الاستخدام)
5. [إدارة قاعدة البيانات](#-إدارة-قاعدة-البيانات)
6. [استكشاف الأخطاء](#-استكشاف-الأخطاء)
7. [التكاملات الخارجية](#-التكاملات-الخارجية)
8. [النسخ الاحتياطي](#-النسخ-الاحتياطي)
9. [الصيانة](#-الصيانة)
10. [التطوير المستقبلي](#-التطوير-المستقبلي)

---

# 🚀 دليل التشغيل السريع

## الخطوات الأساسية للتشغيل:

### 1. تشغيل الخادم (Backend)
```bash
cd api
php artisan serve
```

### 2. تشغيل الواجهة (Frontend)
```bash
npm run dev
```

### 3. الوصول للنظام
- **الواجهة الرئيسية**: http://localhost:5173
- **API Backend**: http://localhost:8000/api

### 4. بيانات الدخول الافتراضية
- **المدير العام**: admin@workshop.com / password123
- **مدير الإنتاج**: production@workshop.com / password123
- **المحاسب**: accountant@workshop.com / password123

---

# 💻 متطلبات النظام

## متطلبات الخادم:
- **PHP**: 8.1 أو أحدث
- **MySQL**: 8.0 أو أحدث
- **Node.js**: 18.0 أو أحدث
- **NPM**: 9.0 أو أحدث
- **Composer**: 2.0 أو أحدث

## متطلبات الذاكرة:
- **RAM**: 4GB كحد أدنى، 8GB مستحسن
- **Storage**: 2GB مساحة حرة
- **CPU**: معالج ثنائي النواة كحد أدنى

## المتطلبات الإضافية:
- **XAMPP/LAMP/WAMP**: لبيئة التطوير المحلية
- **Git**: لإدارة الإصدارات
- **Postman**: لاختبار APIs (اختياري)

---

# 📦 تعليمات التثبيت

## التثبيت الكامل من الصفر:

### 1. تحضير البيئة
```bash
# تحميل المشروع
git clone [repository-url]
cd workshop01

# تثبيت اعتماديات Backend
cd api
composer install

# تثبيت اعتماديات Frontend
cd ..
npm install
```

### 2. إعداد قاعدة البيانات
```bash
cd api

# نسخ ملف البيئة
cp .env.example .env

# تحرير إعدادات قاعدة البيانات في .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workshop_erp
DB_USERNAME=root
DB_PASSWORD=

# إنشاء مفتاح التطبيق
php artisan key:generate

# تشغيل الهجرات
php artisan migrate

# إدخال البيانات الأولية
php artisan db:seed
```

### 3. إعداد التكاملات الخارجية
```bash
# WooCommerce Settings في .env
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your_key
WOOCOMMERCE_CONSUMER_SECRET=your_secret

# إعدادات البصمة
BIOMETRIC_API_URL=http://your-biometric-device
BIOMETRIC_USERNAME=admin
BIOMETRIC_PASSWORD=admin123
```

### 4. التشغيل النهائي
```bash
# Backend
cd api
php artisan serve

# Frontend (في terminal منفصل)
cd ..
npm run dev
```

---

# 📘 دليل الاستخدام

## الواجهات الرئيسية:

### 1. لوحة التحكم (Dashboard)
- **المسار**: `/dashboard`
- **الوصف**: نظرة عامة شاملة على النظام
- **المحتوى**:
  - إحصائيات مالية فورية
  - حالة الطلبيات والإنتاج
  - مؤشرات الأداء الرئيسية
  - تنبيهات وإشعارات مهمة

### 2. إدارة المنتجات (Products)
- **المسار**: `/products`
- **الميزات الرئيسية**:
  - إضافة وتحرير المنتجات
  - إدارة Bill of Materials (BOM)
  - تحديد مراحل الإنتاج
  - ربط بـ WooCommerce
  - حساب التكاليف التلقائي

**كيفية إضافة منتج جديد:**
1. اذهب إلى Products
2. انقر "إضافة منتج جديد"
3. املأ البيانات الأساسية (اسم، وصف، سعر)
4. حدد نوع المنتج (بسيط/متغير/مواد خام)
5. أضف مواد البناء في BOM
6. حدد مراحل الإنتاج المطلوبة
7. احفظ المنتج

### 3. إدارة الطلبيات (Orders)
- **المسار**: `/orders`
- **الميزات**:
  - إنشاء طلبيات جديدة
  - تتبع حالة الطلبيات
  - ربط بالعملاء
  - حساب التكلفة الإجمالية
  - إنشاء فواتير تلقائية

**دورة حياة الطلبية:**
1. **جديد**: تم إنشاء الطلبية
2. **قيد التحضير**: جاري تحضير المواد
3. **في الإنتاج**: بدأت مراحل التصنيع
4. **مكتمل**: انتهى التصنيع
5. **مُسلم**: تم تسليم الطلبية للعميل

### 4. تدفق الإنتاج (Production Flow)
- **المسار**: `/production-flow`
- **الوصف**: إدارة تدفق الطلبيات عبر مراحل الإنتاج
- **الميزات المتقدمة**:
  - **Drag & Drop**: سحب الطلبيات بين المراحل
  - **تعيين الموارد**: اختيار العامل والمحطة
  - **تحديث فوري**: للحالات والنسب
  - **مرونة التسلسل**: إمكانية تخطي مراحل

**كيفية نقل طلبية بين المراحل:**
1. اذهب إلى Production Flow
2. اسحب بطاقة الطلبية من مرحلة لأخرى
3. اختر العامل المسؤول
4. اختر المحطة المطلوبة
5. أكد النقل
6. سيتم تحديث الحالة تلقائياً

### 5. تتبع الإنتاج التفصيلي (Production Tracking)
- **المسار**: `/production-tracking`
- **الوصف**: مراقبة تفصيلية لكل مرحلة في كل طلبية
- **البيانات المتاحة**:
  - ساعات العمل (مخططة مقابل فعلية)
  - تقييم الجودة لكل مرحلة
  - استهلاك المواد الفعلي
  - كفاءة العمال
  - تنبيهات المشاكل

### 6. إدارة العمال (Workers)
- **المسار**: `/workers`
- **إدارة شاملة**:
  - البيانات الشخصية والمهنية
  - المهارات والتخصصات
  - ساعات العمل والحضور
  - حساب الرواتب
  - تقييم الأداء

### 7. إدارة المخزون (Inventory)
- **المسار**: `/inventory`
- **تتبع ذكي**:
  - كميات المواد الحالية
  - حد الإنذار المبكر
  - تاريخ آخر تحديث
  - تكلفة المخزون
  - تقارير الاستهلاك

### 8. النظام المالي
#### 8.1 الفواتير (Invoices)
- **المسار**: `/invoices`
- **إدارة متكاملة**:
  - إنشاء فواتير تلقائية
  - تتبع المدفوعات
  - تقارير المبيعات
  - ربط بالطلبيات

#### 8.2 الرواتب (Payroll)
- **المسار**: `/payroll`
- **حساب تلقائي**:
  - الراتب الأساسي
  - الساعات الإضافية
  - المكافآت والخصومات
  - دعم عملتين (KWD/USD)

---

# 🗄️ إدارة قاعدة البيانات

## الجداول الرئيسية:

### 1. جداول المنتجات
- **products**: بيانات المنتجات الأساسية
- **categories**: فئات المنتجات
- **product_bill_of_materials**: مواد البناء للمنتجات
- **product_stage_requirements**: متطلبات مراحل الإنتاج
- **product_worker_requirements**: متطلبات العمال للمنتجات

### 2. جداول الطلبيات والإنتاج
- **orders**: الطلبيات الأساسية
- **order_items**: عناصر الطلبيات
- **order_production_tracking**: تتبع مراحل الإنتاج
- **production_stages**: مراحل الإنتاج المختلفة

### 3. جداول الموارد البشرية
- **workers**: بيانات العمال
- **attendance**: سجلات الحضور والغياب
- **payroll**: كشوف الرواتب
- **user_roles**: أدوار المستخدمين
- **permissions**: صلاحيات النظام

### 4. جداول المخزون
- **materials**: المواد الخام
- **material_transactions**: حركات المواد
- **material_reservations**: حجوزات المواد للطلبيات
- **stations**: محطات العمل

### 5. جداول النظام
- **notifications**: إشعارات النظام
- **cache**: بيانات التخزين المؤقت
- **client_loyalty**: نظام ولاء العملاء

## أوامر قاعدة البيانات المفيدة:

### النسخ الاحتياطي
```bash
# إنشاء نسخة احتياطية
mysqldump -u root -p workshop_erp > backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة من نسخة احتياطية
mysql -u root -p workshop_erp < backup_file.sql
```

### إعادة بناء قاعدة البيانات
```bash
cd api
php artisan migrate:fresh --seed
```

### تحديث البيانات
```bash
# تشغيل هجرة واحدة
php artisan migrate

# إضافة بيانات أولية
php artisan db:seed --class=SpecificSeeder
```

---

# 🔧 استكشاف الأخطاء

## المشاكل الشائعة وحلولها:

### 1. خطأ الاتصال بقاعدة البيانات
**الخطأ**: `SQLSTATE[HY000] [2002] Connection refused`

**الحل**:
```bash
# تأكد من تشغيل MySQL
sudo systemctl start mysql  # على Linux
# أو تشغيل XAMPP على Windows

# تحقق من إعدادات .env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workshop_erp
```

### 2. خطأ 404 في API
**الخطأ**: `404 Not Found` عند استدعاء API

**الحل**:
```bash
# تأكد من تشغيل Laravel server
cd api
php artisan serve

# تحقق من رابط API في frontend
# src/api/laravel.ts
baseURL: 'http://localhost:8000/api'
```

### 3. مشاكل Drag & Drop
**الخطأ**: لا يعمل السحب والإفلات

**الحل**:
```bash
# تأكد من تثبيت المكتبات
npm install @dnd-kit/core @dnd-kit/sortable

# تحقق من وجود البيانات
# تأكد من عمل API endpoints للعمال والمحطات
```

### 4. مشاكل WooCommerce
**الخطأ**: فشل في الاتصال بـ WooCommerce

**الحل**:
```bash
# تحقق من إعدادات .env
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxx

# تأكد من صحة الصلاحيات في WooCommerce
```

### 5. مشاكل الذاكرة
**الخطأ**: `Fatal error: Allowed memory size exhausted`

**الحل**:
```php
// في php.ini
memory_limit = 512M

// أو في .env
PHP_MEMORY_LIMIT=512M
```

### 6. مشاكل الصلاحيات
**الخطأ**: `403 Forbidden` عند الوصول لصفحة

**الحل**:
```bash
# تحقق من صلاحيات المستخدم
php artisan tinker
>>> User::find(1)->permissions
>>> User::find(1)->roles

# إضافة صلاحيات جديدة
php artisan db:seed --class=PermissionSeeder
```

## سجلات الأخطاء:

### Laravel Logs
```bash
# مراجعة سجلات Laravel
tail -f api/storage/logs/laravel.log

# مسح السجلات القديمة
> api/storage/logs/laravel.log
```

### Frontend Console
```javascript
// في متصفح المطور (F12)
// تفعيل تسجيل تفصيلي
localStorage.setItem('debug', 'true')
```

---

# 🔗 التكاملات الخارجية

## 1. تكامل WooCommerce

### إعداد WooCommerce:
1. **إنشاء API Keys**:
   - اذهب إلى WooCommerce > Settings > Advanced > REST API
   - انقر "Add Key"
   - اختر User: Administrator
   - اختر Permissions: Read/Write
   - انسخ Consumer Key و Consumer Secret

2. **إعداد النظام**:
```bash
# في ملف .env
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_secret_here
```

3. **استيراد المنتجات**:
```bash
# استيراد جميع المنتجات
php artisan import:woocommerce-products

# استيراد منتجات محددة
php artisan import:woocommerce-products --limit=100
```

### APIs المتاحة:
- `GET /api/products/woocommerce/test` - اختبار الاتصال
- `POST /api/products/woocommerce/import` - استيراد المنتجات
- `GET /api/products/woocommerce/preview` - معاينة المنتجات
- `POST /api/products/woocommerce/sync-all` - مزامنة شاملة

## 2. تكامل أنظمة البصمة

### الإعداد الأساسي:
```bash
# في ملف .env
BIOMETRIC_API_URL=http://192.168.1.100
BIOMETRIC_USERNAME=admin
BIOMETRIC_PASSWORD=admin123
BIOMETRIC_TIMEOUT=30
```

### APIs المتاحة:
- `GET /api/biometric/workers` - جلب بيانات العمال
- `GET /api/biometric/attendance` - جلب سجلات الحضور
- `POST /api/biometric/sync` - مزامنة البيانات
- `GET /api/biometric/device-status` - حالة الجهاز

### مزامنة تلقائية:
```bash
# تشغيل مزامنة كل ساعة
php artisan schedule:work

# مزامنة يدوية
php artisan biometric:sync
```

## 3. تكامل أنظمة Cache

### Redis Setup:
```bash
# في ملف .env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
```

### إدارة Cache:
```bash
# مسح جميع Cache
php artisan cache:clear

# مسح cache محدد
php artisan cache:forget 'key_name'

# عرض Cache statistics
php artisan cache:status
```

---

# 💾 النسخ الاحتياطي والاستعادة

## النسخ الاحتياطي التلقائي:

### إعداد النسخ الاحتياطي اليومي:
```bash
# إنشاء script للنسخ الاحتياطي
cd scripts
./create-backup.sh

# جدولة يومية في crontab
0 2 * * * /path/to/backup-script.sh
```

### أنواع النسخ الاحتياطية:

#### 1. نسخة قاعدة البيانات فقط:
```bash
mysqldump -u root -p workshop_erp > db_backup_$(date +%Y%m%d).sql
```

#### 2. نسخة كاملة (ملفات + قاعدة بيانات):
```bash
# ضغط المشروع كاملاً
tar -czf full_backup_$(date +%Y%m%d).tar.gz workshop01/

# مع استثناء ملفات غير ضرورية
tar --exclude='node_modules' --exclude='vendor' -czf backup.tar.gz workshop01/
```

#### 3. نسخة الملفات المرفوعة فقط:
```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz api/storage/app/uploads/
```

## الاستعادة:

### استعادة قاعدة البيانات:
```bash
# إسقاط قاعدة البيانات الحالية
mysql -u root -p -e "DROP DATABASE workshop_erp;"

# إنشاء قاعدة بيانات جديدة
mysql -u root -p -e "CREATE DATABASE workshop_erp;"

# استعادة من النسخة الاحتياطية
mysql -u root -p workshop_erp < db_backup_20250131.sql
```

### استعادة الملفات:
```bash
# فك ضغط النسخة الاحتياطية
tar -xzf full_backup_20250131.tar.gz

# نسخ الملفات المطلوبة
cp -r backup/api/storage/app/uploads/ api/storage/app/
```

## أتمتة النسخ الاحتياطي:

### PowerShell Script للويندوز:
```powershell
# backup-system.ps1
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "C:\Backups\workshop_$timestamp"

# إنشاء مجلد النسخة الاحتياطية
New-Item -ItemType Directory -Path $backupPath

# نسخ قاعدة البيانات
mysqldump -u root -p workshop_erp > "$backupPath\database.sql"

# نسخ الملفات المهمة
Copy-Item -Recurse "api\storage\app\uploads" "$backupPath\uploads"
Copy-Item ".env" "$backupPath\.env"

Write-Host "تم إنشاء النسخة الاحتياطية في: $backupPath"
```

### Bash Script للينكس:
```bash
#!/bin/bash
# backup-system.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/workshop_$TIMESTAMP"

# إنشاء مجلد النسخة الاحتياطية
mkdir -p $BACKUP_DIR

# نسخة قاعدة البيانات
mysqldump -u root -p workshop_erp > $BACKUP_DIR/database.sql

# نسخ الملفات المهمة
cp -r api/storage/app/uploads $BACKUP_DIR/
cp .env $BACKUP_DIR/

echo "تم إنشاء النسخة الاحتياطية في: $BACKUP_DIR"
```

---

# 🔧 الصيانة الدورية

## المهام اليومية:

### 1. فحص أداء النظام:
```bash
# فحص استخدام الذاكرة
free -h

# فحص مساحة القرص
df -h

# فحص العمليات النشطة
ps aux | grep php
ps aux | grep node
```

### 2. تنظيف الملفات المؤقتة:
```bash
# مسح cache Laravel
php artisan cache:clear
php artisan view:clear
php artisan config:clear

# مسح session files
rm -rf api/storage/framework/sessions/*

# مسح log files القديمة
find api/storage/logs -name "*.log" -mtime +30 -delete
```

### 3. فحص قاعدة البيانات:
```bash
# فحص سلامة الجداول
mysqlcheck -u root -p --check workshop_erp

# تحسين الجداول
mysqlcheck -u root -p --optimize workshop_erp

# إصلاح الجداول التالفة
mysqlcheck -u root -p --repair workshop_erp
```

## المهام الأسبوعية:

### 1. تحديث الاعتماديات:
```bash
# تحديث composer packages
cd api
composer update

# تحديث npm packages
cd ..
npm update
```

### 2. مراجعة الأمان:
```bash
# فحص الثغرات الأمنية
cd api
composer audit

# فحص npm vulnerabilities
cd ..
npm audit
npm audit fix
```

### 3. تحليل الأداء:
```bash
# مراجعة slow queries
mysql -u root -p -e "SHOW PROCESSLIST;"

# فحص استخدام الذاكرة لـ PHP
php -i | grep memory_limit

# مراقبة حجم قاعدة البيانات
mysql -u root -p -e "SELECT table_schema AS 'Database', 
ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
FROM information_schema.tables GROUP BY table_schema;"
```

## المهام الشهرية:

### 1. أرشفة البيانات القديمة:
```bash
# أرشفة سجلات الحضور القديمة (أكثر من سنة)
mysql -u root -p workshop_erp -e "
CREATE TABLE attendance_archive AS 
SELECT * FROM attendance WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM attendance WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);"
```

### 2. تحسين قاعدة البيانات:
```bash
# إعادة بناء الفهارس
mysql -u root -p workshop_erp -e "
ALTER TABLE orders ENGINE=InnoDB;
ALTER TABLE order_production_tracking ENGINE=InnoDB;
OPTIMIZE TABLE orders, order_production_tracking;"
```

### 3. مراجعة الأداء العام:
- مراجعة سرعة استجابة API
- فحص استخدام الموارد
- تحليل تقارير الأخطاء
- مراجعة ملاحظات المستخدمين

---

# 🚀 التطوير المستقبلي

## الميزات المقترحة للنسخة القادمة:

### 1. ميزات متقدمة للذكاء الاصطناعي:
- **تحليل تنبؤي للطلب**: توقع الطلبيات المستقبلية
- **تحسين تخصيص الموارد**: خوارزميات متقدمة
- **الكشف عن الأنماط**: في عيوب الإنتاج
- **توصيات ذكية**: لتحسين العمليات

### 2. واجهات جديدة:
- **تطبيق جوال**: للعمال والمشرفين
- **واجهة العملاء**: لتتبع طلبياتهم
- **Portal الموردين**: لإدارة التوريد
- **لوحة تحكم المدير التنفيذي**: مؤشرات عليا

### 3. تكاملات إضافية:
- **أنظمة المحاسبة**: QuickBooks, SAP
- **منصات التجارة الإلكترونية**: Shopify, Magento
- **أنظمة CRM**: Salesforce, HubSpot
- **أنظمة إدارة المستندات**: SharePoint

### 4. ميزات أمنية متقدمة:
- **مصادقة ثنائية**: 2FA
- **تشفير البيانات**: end-to-end encryption
- **سجل تدقيق شامل**: audit trail
- **نسخ احتياطي مشفرة**: encrypted backups

## خارطة الطريق للتطوير:

### المرحلة 1 (الشهر القادم):
- [ ] تطبيق جوال أساسي
- [ ] تحسينات الأداء
- [ ] ميزات AI إضافية
- [ ] تكامل محاسبي متقدم

### المرحلة 2 (خلال 3 أشهر):
- [ ] portal العملاء الكامل
- [ ] تكاملات خارجية إضافية
- [ ] ميزات تقارير متقدمة
- [ ] نظام إدارة المستندات

### المرحلة 3 (خلال 6 أشهر):
- [ ] منصة سحابية
- [ ] multi-tenant support
- [ ] API marketplace
- [ ] advanced analytics

## إرشادات التطوير:

### معايير الكود:
- اتباع PSR standards لـ PHP
- ESLint rules للـ JavaScript/TypeScript
- documentation شامل للكود
- unit tests لجميع الميزات الجديدة

### بنية التطوير:
```
workshop01/
├── api/                    # Laravel Backend
├── mobile/                 # React Native App
├── customer-portal/        # Customer Interface
├── docs/                   # Documentation
├── tests/                  # Automated Tests
└── deployment/             # Deployment Scripts
```

### عملية الإصدار:
1. **Development**: feature branches
2. **Testing**: staging environment
3. **Review**: code review process
4. **Release**: production deployment
5. **Monitoring**: performance tracking

---

# 📞 الدعم والمساعدة

## مصادر المساعدة:

### التوثيق التقني:
- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://react.dev
- **MySQL Documentation**: https://dev.mysql.com/doc

### المجتمع:
- **Laravel Community**: Laravel.io
- **React Community**: Reactiflux Discord
- **Stack Overflow**: للأسئلة التقنية

## الحصول على الدعم:

### للمشاكل التقنية:
1. راجع سجلات الأخطاء
2. ابحث في هذا الدليل
3. تحقق من GitHub Issues
4. اتصل بفريق التطوير

### لطلب ميزات جديدة:
1. اكتب وصفاً تفصيلياً للميزة
2. حدد الأولوية والأهمية
3. قدم أمثلة وحالات استخدام
4. أرسل طلب التطوير

---

*تاريخ إعداد الدليل: 31 يوليو 2025*  
*الإصدار: 1.0*  
*حالة النظام: مكتمل وجاهز للاستخدام ✅*