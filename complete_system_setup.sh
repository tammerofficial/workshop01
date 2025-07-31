#!/bin/bash

echo "🚀 بدء إكمال النظام - جميع المكونات المتبقية"
echo "=================================================="

# تشغيل المايجريشن الجديدة
echo "📦 تشغيل المايجريشن..."
php artisan migrate --force

# تشغيل السيدرز
echo "🌱 تشغيل السيدرز..."
php artisan db:seed --force

# تنظيف الكاش
echo "🧹 تنظيف الكاش..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# تحديث أوتولودر
echo "🔄 تحديث Composer..."
composer dump-autoload

# تشغيل السيرفر في الخلفية إذا لم يكن يعمل
echo "🖥️ تشغيل السيرفر..."
if ! pgrep -f "php artisan serve" > /dev/null; then
    nohup php artisan serve --host=0.0.0.0 --port=8000 > /dev/null 2>&1 &
    echo "السيرفر يعمل على المنفذ 8000"
else
    echo "السيرفر يعمل مسبقاً"
fi

echo "✅ تم الانتهاء من الإعداد الأساسي!"
echo "=================================================="