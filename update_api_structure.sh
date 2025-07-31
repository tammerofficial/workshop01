#!/bin/bash

# ===========================================
# 🔄 API Structure Update Script
# ===========================================
# هذا السكريبت يقوم بتحديث جميع namespaces و imports و routes
# بعد إعادة تنظيم هيكل API Controllers

echo "🚀 بدء تحديث هيكل API Controllers..."

# تعريف المسارات
API_PATH="api/app/Http/Controllers/Api"
ROUTES_PATH="api/routes"

# ===========================================
# 1️⃣ تحديث Namespaces في Controllers
# ===========================================

echo "📁 تحديث Namespaces في المجلدات..."

# Authentication Controllers
echo "  🔐 Authentication..."
find "$API_PATH/Authentication" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\Authentication;/g' {} \;

# Business Controllers  
echo "  🏢 Business..."
find "$API_PATH/Business" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\Business;/g' {} \;

# Core Controllers
echo "  ⚙️ Core..."
find "$API_PATH/Core" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\Core;/g' {} \;

# HumanResources Controllers
echo "  👥 HumanResources..."
find "$API_PATH/HumanResources" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\HumanResources;/g' {} \;

# Integrations Controllers
echo "  🔗 Integrations..."
find "$API_PATH/Integrations" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\Integrations;/g' {} \;

# Inventory Controllers
echo "  📦 Inventory..."
find "$API_PATH/Inventory" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\Inventory;/g' {} \;

# Production Controllers
echo "  🏭 Production..."
find "$API_PATH/Production" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\Production;/g' {} \;

# System Controllers
echo "  🖥️ System..."
find "$API_PATH/System" -name "*.php" -exec sed -i '' 's/namespace App\\Http\\Controllers\\Api;/namespace App\\Http\\Controllers\\Api\\System;/g' {} \;

# ===========================================
# 2️⃣ تحديث Routes في api.php
# ===========================================

echo "🛣️ تحديث Routes في api.php..."

# إنشاء نسخة احتياطية من routes
cp "$ROUTES_PATH/api.php" "$ROUTES_PATH/api.php.backup"

# تحديث imports في ملف routes
sed -i '' 's/use App\\Http\\Controllers\\Api\\AuthController;/use App\\Http\\Controllers\\Api\\Authentication\\AuthController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\RoleController;/use App\\Http\\Controllers\\Api\\Authentication\\RoleController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\PermissionController;/use App\\Http\\Controllers\\Api\\Authentication\\PermissionController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\ClientController;/use App\\Http\\Controllers\\Api\\Business\\ClientController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\ClientLoyaltyController;/use App\\Http\\Controllers\\Api\\Business\\ClientLoyaltyController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\CategoryController;/use App\\Http\\Controllers\\Api\\Business\\CategoryController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\InvoiceController;/use App\\Http\\Controllers\\Api\\Business\\InvoiceController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\OrderController;/use App\\Http\\Controllers\\Api\\Business\\OrderController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\MeasurementController;/use App\\Http\\Controllers\\Api\\Business\\MeasurementController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\NotificationController;/use App\\Http\\Controllers\\Api\\Core\\NotificationController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\TaskController;/use App\\Http\\Controllers\\Api\\Core\\TaskController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\StationController;/use App\\Http\\Controllers\\Api\\Core\\StationController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\WorkerController;/use App\\Http\\Controllers\\Api\\HumanResources\\WorkerController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\WorkerSyncController;/use App\\Http\\Controllers\\Api\\HumanResources\\WorkerSyncController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\PayrollController;/use App\\Http\\Controllers\\Api\\HumanResources\\PayrollController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\BiometricController;/use App\\Http\\Controllers\\Api\\HumanResources\\BiometricController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\WooCommerceController;/use App\\Http\\Controllers\\Api\\Integrations\\WooCommerceController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\WooCommerceProductController;/use App\\Http\\Controllers\\Api\\Integrations\\WooCommerceProductController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\MaterialController;/use App\\Http\\Controllers\\Api\\Inventory\\MaterialController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\ProductController;/use App\\Http\\Controllers\\Api\\Inventory\\ProductController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\ProductionController;/use App\\Http\\Controllers\\Api\\Production\\ProductionController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\ProductionFlowController;/use App\\Http\\Controllers\\Api\\Production\\ProductionFlowController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\ProductionTrackingController;/use App\\Http\\Controllers\\Api\\Production\\ProductionTrackingController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\SmartProductionController;/use App\\Http\\Controllers\\Api\\Production\\SmartProductionController;/g' "$ROUTES_PATH/api.php"

sed -i '' 's/use App\\Http\\Controllers\\Api\\ERPController;/use App\\Http\\Controllers\\Api\\System\\ERPController;/g' "$ROUTES_PATH/api.php"
sed -i '' 's/use App\\Http\\Controllers\\Api\\AdvancedFeaturesController;/use App\\Http\\Controllers\\Api\\System\\AdvancedFeaturesController;/g' "$ROUTES_PATH/api.php"

# ===========================================
# 3️⃣ تحديث Routes في web.php (إذا وجد)
# ===========================================

if [ -f "$ROUTES_PATH/web.php" ]; then
    echo "🌐 تحديث Routes في web.php..."
    cp "$ROUTES_PATH/web.php" "$ROUTES_PATH/web.php.backup"
    
    # نفس التحديثات لملف web.php
    sed -i '' 's/use App\\Http\\Controllers\\Api\\/use App\\Http\\Controllers\\Api\\Authentication\\/g' "$ROUTES_PATH/web.php"
    # ... يمكن إضافة المزيد حسب الحاجة
fi

# ===========================================
# 4️⃣ تحديث Imports في Controllers أنفسهم
# ===========================================

echo "🔗 تحديث Imports بين Controllers..."

# البحث عن أي imports لـ Controllers وتحديثها
find "$API_PATH" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\AuthController;/use App\\Http\\Controllers\\Api\\Authentication\\AuthController;/g' {} \;
find "$API_PATH" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\NotificationController;/use App\\Http\\Controllers\\Api\\Core\\NotificationController;/g' {} \;
find "$API_PATH" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\WorkerController;/use App\\Http\\Controllers\\Api\\HumanResources\\WorkerController;/g' {} \;
find "$API_PATH" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\ProductController;/use App\\Http\\Controllers\\Api\\Inventory\\ProductController;/g' {} \;
find "$API_PATH" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\OrderController;/use App\\Http\\Controllers\\Api\\Business\\OrderController;/g' {} \;

# ===========================================
# 5️⃣ تحديث أي ملفات أخرى تستخدم Controllers
# ===========================================

echo "📄 تحديث ملفات أخرى..."

# تحديث في ملفات Services إذا وجدت
if [ -d "api/app/Services" ]; then
    find "api/app/Services" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\/use App\\Http\\Controllers\\Api\\Authentication\\/g' {} \;
fi

# تحديث في ملفات Tests إذا وجدت
if [ -d "api/tests" ]; then
    find "api/tests" -name "*.php" -exec sed -i '' 's/use App\\Http\\Controllers\\Api\\/use App\\Http\\Controllers\\Api\\Authentication\\/g' {} \;
fi

# ===========================================
# 6️⃣ تنظيف Cache و إعادة تحميل
# ===========================================

echo "🧹 تنظيف Cache..."

cd api

# تنظيف cache إذا كان Laravel يعمل
if [ -f "artisan" ]; then
    php artisan config:clear
    php artisan route:clear
    php artisan cache:clear
    php artisan view:clear
    
    echo "📝 إعادة إنشاء Cache..."
    php artisan config:cache
    php artisan route:cache
fi

cd ..

# ===========================================
# 7️⃣ إنشاء ملف فهرس للتوجيه
# ===========================================

echo "📋 إنشاء ملف فهرس Controllers..."

cat > "$API_PATH/ControllerIndex.php" << 'EOF'
<?php

/**
 * 🗂️ API Controllers Index
 * =========================
 * 
 * هذا الملف يحتوي على فهرس بجميع Controllers وأماكنها الجديدة
 * لسهولة التطوير والمراجعة
 */

// 🔐 Authentication Controllers
/*
use App\Http\Controllers\Api\Authentication\AuthController;
use App\Http\Controllers\Api\Authentication\RoleController;
use App\Http\Controllers\Api\Authentication\PermissionController;
*/

// 🏢 Business Controllers
/*
use App\Http\Controllers\Api\Business\ClientController;
use App\Http\Controllers\Api\Business\ClientLoyaltyController;
use App\Http\Controllers\Api\Business\CategoryController;
use App\Http\Controllers\Api\Business\InvoiceController;
use App\Http\Controllers\Api\Business\OrderController;
use App\Http\Controllers\Api\Business\MeasurementController;
*/

// ⚙️ Core Controllers
/*
use App\Http\Controllers\Api\Core\NotificationController;
use App\Http\Controllers\Api\Core\TaskController;
use App\Http\Controllers\Api\Core\StationController;
*/

// 👥 HumanResources Controllers
/*
use App\Http\Controllers\Api\HumanResources\WorkerController;
use App\Http\Controllers\Api\HumanResources\WorkerSyncController;
use App\Http\Controllers\Api\HumanResources\PayrollController;
use App\Http\Controllers\Api\HumanResources\BiometricController;
*/

// 🔗 Integrations Controllers
/*
use App\Http\Controllers\Api\Integrations\WooCommerceController;
use App\Http\Controllers\Api\Integrations\WooCommerceProductController;
*/

// 📦 Inventory Controllers
/*
use App\Http\Controllers\Api\Inventory\MaterialController;
use App\Http\Controllers\Api\Inventory\ProductController;
*/

// 🏭 Production Controllers
/*
use App\Http\Controllers\Api\Production\ProductionController;
use App\Http\Controllers\Api\Production\ProductionFlowController;
use App\Http\Controllers\Api\Production\ProductionTrackingController;
use App\Http\Controllers\Api\Production\SmartProductionController;
*/

// 🖥️ System Controllers
/*
use App\Http\Controllers\Api\System\ERPController;
use App\Http\Controllers\Api\System\AdvancedFeaturesController;
*/

EOF

# ===========================================
# 8️⃣ تحديث composer autoload
# ===========================================

echo "🎼 تحديث Composer Autoload..."

cd api
if [ -f "composer.json" ]; then
    composer dump-autoload
fi
cd ..

# ===========================================
# ✅ إنهاء
# ===========================================

echo ""
echo "✅ تم تحديث هيكل API Controllers بنجاح!"
echo ""
echo "📋 ملخص التحديثات:"
echo "  🔄 تم تحديث Namespaces في جميع Controllers"
echo "  🛣️ تم تحديث Routes في api.php"
echo "  🔗 تم تحديث Imports بين الملفات"
echo "  🧹 تم تنظيف Cache"
echo "  📝 تم إنشاء ملف فهرس Controllers"
echo "  🎼 تم تحديث Composer Autoload"
echo ""
echo "⚠️ ملاحظات مهمة:"
echo "  📁 تم إنشاء نسخ احتياطية من ملفات Routes"
echo "  🧪 يُنصح بتشغيل الاختبارات للتأكد من عمل كل شيء"
echo "  🔍 راجع ملف README_API_STRUCTURE.md للتفاصيل"
echo ""
echo "🎉 هيكل API جاهز للاستخدام!"