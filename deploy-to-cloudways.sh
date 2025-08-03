#!/bin/bash

# نص تحديث الـ Cloud Server
echo "🚀 بدء عملية تحديث الـ Cloud Server..."

# معلومات الخادم
SERVER_HOST="108.61.99.171"
SERVER_USER="sdfasdgh534"
SERVER_PASS="sdfasdgh534UI#UH"
REMOTE_PATH="/home/sdfasdgh534/public_html"

echo "📡 الاتصال بالخادم: $SERVER_HOST"

# إنشاء ملف مؤقت للأوامر
cat > /tmp/deploy_commands.txt << 'EOF'
# الانتقال إلى مجلد المشروع
cd /home/sdfasdgh534/public_html

# تحديث الملفات من Git (إذا كان متاح)
echo "📦 تحديث الكود..."
git pull origin main 2>/dev/null || echo "Git غير متاح، سيتم التحديث يدوياً"

# الانتقال إلى مجلد API
cd api

# تحديث Composer dependencies
echo "📚 تحديث المكتبات..."
composer install --no-dev --optimize-autoloader

# تشغيل المجريشن
echo "🔧 تشغيل قاعدة البيانات..."
php artisan migrate --force

# تحسين الأداء
echo "⚡ تحسين الأداء..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# إعداد الصلاحيات
echo "🔐 إعداد الصلاحيات..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# إنشاء رابط symbolic للتخزين
php artisan storage:link

echo "✅ تم تحديث الخادم بنجاح!"
echo "🌐 الروابط المتاحة:"
echo "   - Dashboard: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/dashboard/stats"
echo "   - Users: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/users"
echo "   - Roles: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/simple-roles"
echo "   - RBAC Dashboard: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/rbac/dashboard"
EOF

echo "📝 الأوامر المطلوب تنفيذها على الخادم:"
cat /tmp/deploy_commands.txt

echo ""
echo "⚠️  لتنفيذ هذه الأوامر على الخادم، استخدم:"
echo "sshpass -p 'sdfasdgh534UI#UH' ssh sdfasdgh534@108.61.99.171 'bash -s' < /tmp/deploy_commands.txt"

echo ""
echo "📋 الروابط النهائية بعد التحديث:"
echo "🌐 Frontend: https://phplaravel-1446204-5746469.cloudwaysapps.com/"
echo "🔌 API Base: https://phplaravel-1446204-5746469.cloudwaysapps.com/api"
echo "📊 Dashboard: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/dashboard/stats"
echo "👥 Users API: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/users"
echo "🔐 Roles API: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/simple-roles"
echo "🛡️  RBAC Dashboard: https://phplaravel-1446204-5746469.cloudwaysapps.com/api/rbac/dashboard"

# تنظيف
rm -f /tmp/deploy_commands.txt

echo ""
echo "✨ انتهت عملية إعداد التحديث. يرجى تنفيذ الأوامر على الخادم."