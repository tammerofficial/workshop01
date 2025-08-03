# 🔧 استكشاف أخطاء SSH وإصلاحها

## 📋 المشكلة الحالية
- ❌ **فشل في الاتصال SSH** مع الخادم `95.179.244.27`
- ❌ **Permission denied** عند محاولة تسجيل الدخول
- ❌ **معلومات الاتصال قد تكون غير صحيحة**

## 🔍 معلومات الاتصال المستخدمة
```
Host: 95.179.244.27
Username: workshophudaalja
Password: Ali@kuwait@90
Remote Path: /www/wwwroot/test
```

## 🎯 الحلول المطلوبة

### 1. **التحقق من معلومات الاتصال**
يرجى التأكد من:
- ✅ **اسم المستخدم صحيح:** `workshophudaalja`
- ✅ **كلمة المرور صحيحة:** `Ali@kuwait@90`
- ✅ **عنوان IP صحيح:** `95.179.244.27`
- ✅ **SSH مفعل على الخادم**

### 2. **إضافة SSH Key إلى الخادم**
قم بإضافة هذا المفتاح إلى `~/.ssh/authorized_keys` على الخادم:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDWA6Bb8WTWsHgV6Lstnn7N7IwOXGQoyOs9FHuzoN4ZHwSpNyOBVI2ZGiYorVaEnX7dr0gUFeyWXeMd/vXnYV+8K+b9xuCrizWyfZ386g2lnDxkJUmRUy7wHTCzJh+5fKEbhrQVvVKe8lV3joaVPBjyEOTwU3AH0N1AsC+kHFswIf7xt3gTK1qshXx/0dR9m3+yInSKVwWh8byo6ogR4cPucMYTm4iWxHDDt5ZbySCyokJDZxQTzc4zA3A1QVJzCadm8bsXGnLFLILDtqrO711O2H2yRI8erTuJudtBIiDBY984c8eABaVCVjbXzEzEPtCLPfSwOA5UL/y/LttFvEUP workshop@hudaalja
```

### 3. **طرق الرفع البديلة**

#### أ) **رفع عبر لوحة التحكم (cPanel/DirectAdmin)**
1. ادخل إلى لوحة التحكم للاستضافة
2. اذهب إلى "File Manager" 
3. اذهب إلى مجلد `/www/wwwroot/test/`
4. ارفع الملفات يدوياً

#### ب) **رفع عبر FTP**
```bash
# استخدم FTP client مثل FileZilla
Host: 95.179.244.27
Username: workshophudaalja  
Password: Ali@kuwait@90
Port: 21 (أو 2121)
Remote Directory: /www/wwwroot/test/
```

#### ج) **رفع عبر SFTP**
```bash
sftp workshophudaalja@95.179.244.27
# بعد الاتصال:
cd /www/wwwroot/test/
put -r workshop_files/*
```

## 📁 الملفات المطلوب رفعها

### الملفات الأساسية:
1. **`index.php`** - الصفحة الرئيسية
2. **`api/public/test.php`** - اختبار الخادم
3. **`api/public/health.php`** - فحص صحة النظام
4. **`api/public/simple-api.php`** - API مبسط
5. **`api/public/.htaccess`** - إعادة توجيه URLs

### مجلد API الكامل:
- **`api/`** - مجلد Laravel الكامل
- **`.env`** - ملف الإعدادات (سينشأ تلقائياً)

## 🌐 الروابط المتوقعة بعد الرفع

```
✅ http://95.179.244.27/ (الصفحة الرئيسية)
✅ http://95.179.244.27/test.php (اختبار الخادم)
✅ http://95.179.244.27/health.php (فحص النظام)
✅ http://95.179.244.27/simple-api.php (API رئيسي)
✅ http://95.179.244.27/simple-api.php/roles (أدوار)
✅ http://95.179.244.27/simple-api.php/users (مستخدمين)
✅ http://95.179.244.27/simple-api.php/dashboard (لوحة تحكم)
```

## 🔧 أوامر التشخيص

### 1. اختبار الاتصال:
```bash
ping 95.179.244.27
telnet 95.179.244.27 22
```

### 2. اختبار SSH:
```bash
ssh -v workshophudaalja@95.179.244.27
```

### 3. اختبار مع معلومات مختلفة:
```bash
# جرب أسماء مستخدمين مختلفة
ssh root@95.179.244.27
ssh admin@95.179.244.27
ssh cpanel@95.179.244.27
```

## 🆘 إذا استمرت المشكلة

1. **اتصل بمزود الاستضافة** للتأكد من:
   - معلومات SSH الصحيحة
   - تفعيل SSH على الخادم
   - المسار الصحيح للملفات

2. **استخدم لوحة التحكم** لرفع الملفات مؤقتاً

3. **تحقق من Firewall** والحماية على الخادم

---

## 📞 الخطوات التالية

1. ✅ **تأكد من معلومات SSH**
2. ✅ **جرب الرفع عبر لوحة التحكم**  
3. ✅ **اختبر الروابط بعد الرفع**
4. ✅ **اضبط ملف sync_config.jsonc**