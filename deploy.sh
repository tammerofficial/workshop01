#!/bin/bash

echo "🚀 تجهيز المشروع للنشر على cPanel..."

# تنظيف الكاش
echo "1️⃣ تنظيف الكاش..."
cd api
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# تحسين للإنتاج
echo "2️⃣ تحسين Laravel للإنتاج..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# بناء الـ Frontend
echo "3️⃣ بناء الـ Frontend..."
cd ..
npm run build

# إنشاء مجلد النشر
echo "4️⃣ إنشاء مجلد النشر..."
mkdir -p deployment/frontend
mkdir -p deployment/api

# نسخ ملفات الـ Frontend
echo "5️⃣ نسخ ملفات الـ Frontend..."
cp -r dist/* deployment/frontend/

# نسخ ملفات الـ API
echo "6️⃣ نسخ ملفات الـ API..."
cp -r api/* deployment/api/
# حذف ملفات التطوير
rm -rf deployment/api/node_modules
rm -rf deployment/api/.git
rm deployment/api/.env

# نسخ ملف البيئة للإنتاج
cp api/.env.production deployment/api/.env.example

echo "✅ تم تجهيز المشروع للنشر!"
echo "📁 الملفات جاهزة في مجلد deployment/"
echo "📖 راجع DEPLOYMENT_GUIDE.md للتعليمات التفصيلية"
