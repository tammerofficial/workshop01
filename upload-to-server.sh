#!/bin/bash

# سكريبت رفع الملفات للخادم الجديد
echo "🚀 بدء رفع المشروع للخادم الجديد..."

# معلومات الاتصال
SERVER_HOST="95.179.244.27"
SERVER_USER="workshophudaalja"
SERVER_PASS="Ali@kuwait@90"
REMOTE_PATH="/www/wwwroot/test"
SSH_KEY="~/.ssh/workshop_key"

echo "📋 معلومات الرفع:"
echo "   🌐 الخادم: $SERVER_HOST"
echo "   👤 المستخدم: $SERVER_USER"
echo "   📁 المسار البعيد: $REMOTE_PATH"

# تحضير الملفات للرفع
echo "📦 تحضير الملفات..."

# إنشاء مجلد مؤقت للملفات المطلوبة فقط
rm -rf /tmp/workshop_upload
mkdir -p /tmp/workshop_upload

# نسخ الملفات الأساسية
echo "   📄 نسخ الملفات الأساسية..."
cp index.php /tmp/workshop_upload/
cp -r api/public/* /tmp/workshop_upload/ 2>/dev/null || echo "   ⚠️  بعض ملفات API غير موجودة"

# نسخ مجلد API (المطلوب للمشروع)
echo "   📁 نسخ مجلد API..."
mkdir -p /tmp/workshop_upload/api
cp -r api/* /tmp/workshop_upload/api/ 2>/dev/null

# إزالة الملفات غير المطلوبة
echo "   🧹 تنظيف الملفات..."
rm -rf /tmp/workshop_upload/api/vendor
rm -rf /tmp/workshop_upload/api/storage/logs/*
rm -rf /tmp/workshop_upload/api/bootstrap/cache/*
rm -f /tmp/workshop_upload/api/.env

# إنشاء ملف .env للإنتاج
echo "   ⚙️  إنشاء ملف .env للإنتاج..."
cat > /tmp/workshop_upload/api/.env << 'EOF'
APP_NAME="Workshop Management"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=http://95.179.244.27

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=sqlite
DB_DATABASE=/www/wwwroot/test/api/database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
EOF

# إنشاء قاعدة بيانات SQLite فارغة
echo "   💾 إنشاء قاعدة بيانات SQLite..."
mkdir -p /tmp/workshop_upload/api/database
touch /tmp/workshop_upload/api/database/database.sqlite

echo "📤 بدء رفع الملفات..."

# محاولة رفع الملفات باستخدام scp
if command -v sshpass >/dev/null 2>&1; then
    echo "   🔑 الرفع باستخدام كلمة المرور..."
    
    # إنشاء المجلد البعيد إذا لم يكن موجوداً
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "mkdir -p $REMOTE_PATH" 2>/dev/null
    
    # رفع الملفات
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r /tmp/workshop_upload/* "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "   ✅ تم رفع الملفات بنجاح!"
        
        # إعداد الصلاحيات
        echo "   🔧 إعداد الصلاحيات..."
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
            cd $REMOTE_PATH
            chmod -R 755 .
            chmod -R 777 api/storage 2>/dev/null || true
            chmod -R 777 api/bootstrap/cache 2>/dev/null || true
            chmod 666 api/database/database.sqlite 2>/dev/null || true
        " 2>/dev/null
        
        # تشغيل أوامر Laravel
        echo "   ⚡ إعداد Laravel..."
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
            cd $REMOTE_PATH/api
            php artisan key:generate --force 2>/dev/null || true
            php artisan migrate --force 2>/dev/null || true
            php artisan db:seed --force 2>/dev/null || true
            php artisan config:cache 2>/dev/null || true
            php artisan route:cache 2>/dev/null || true
        " 2>/dev/null
        
        echo ""
        echo "🎉 تم رفع المشروع بنجاح!"
        echo ""
        echo "🌐 الروابط المتاحة الآن:"
        echo "   - الصفحة الرئيسية: http://$SERVER_HOST/"
        echo "   - اختبار الخادم: http://$SERVER_HOST/test.php"
        echo "   - فحص صحة النظام: http://$SERVER_HOST/health.php"
        echo "   - API البسيط: http://$SERVER_HOST/simple-api.php"
        echo "   - API الأدوار: http://$SERVER_HOST/simple-api.php/roles"
        echo "   - API المستخدمين: http://$SERVER_HOST/simple-api.php/users"
        echo "   - لوحة التحكم: http://$SERVER_HOST/simple-api.php/dashboard"
        echo ""
        echo "🔗 إذا كان لديك domain مرتبط بهذا الخادم، استبدل IP بالدومين"
        
    else
        echo "   ❌ فشل في رفع الملفات"
        echo "   💡 تحقق من معلومات الاتصال والصلاحيات"
    fi
    
else
    echo "   ❌ sshpass غير مثبت"
    echo "   💡 قم بتثبيته: brew install sshpass"
    echo ""
    echo "   📝 أو استخدم هذا الأمر يدوياً:"
    echo "   scp -r /tmp/workshop_upload/* $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/"
fi

# تنظيف الملفات المؤقتة
echo ""
echo "🧹 تنظيف الملفات المؤقتة..."
rm -rf /tmp/workshop_upload

echo "✨ انتهت عملية الرفع!"