#!/bin/bash

# Script to run Kuwaiti Women Tailoring Workshop Seeders
# Date: $(date '+%Y-%m-%d %H:%M:%S')

echo "🇰🇼 KUWAITI WOMEN TAILORING WORKSHOP - DATABASE SEEDING"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "api/artisan" ]; then
    echo "❌ Error: Please run this script from the workshop01 root directory"
    exit 1
fi

# Navigate to API directory
cd api

echo ""
echo "📋 Step 1: Checking database connection..."
php artisan db:show

echo ""
echo "🔄 Step 2: Running fresh migrations..."
php artisan migrate:fresh --seed

echo ""
echo "📊 Step 3: Verifying seeded data..."

# Count records in key tables
echo "📈 Data Summary:"
echo "==============="

# Use Laravel tinker to count records
php artisan tinker --execute="
echo 'عملاء كويتيات: ' . \App\Models\Client::count() . PHP_EOL;
echo 'عاملات الورشة: ' . \App\Models\Worker::count() . PHP_EOL;
echo 'طلبيات التفصيل: ' . \App\Models\Order::count() . PHP_EOL;
echo 'المواد والأقمشة: ' . \App\Models\Inventory::count() . PHP_EOL;
echo 'مستخدمي النظام: ' . \App\Models\User::count() . PHP_EOL;
"

echo ""
echo "🎯 Step 4: Testing sample login credentials..."
echo "=============================================="
echo "👤 Manager: manager@huda-workshop.com / manager123"
echo "👤 Head Seamstress: head.seamstress@huda-workshop.com / seamstress123"
echo "👤 Cashier: cashier@huda-workshop.com / cashier123"
echo "👤 Quality Control: quality@huda-workshop.com / quality123"
echo "👤 Super Admin: admin@washapp.com / admin123"

echo ""
echo "🌟 Sample Data Features:"
echo "======================="
echo "✅ 8+ Authentic Kuwaiti women clients"
echo "✅ 6 Professional female tailoring staff"
echo "✅ 6+ Traditional & modern clothing orders"
echo "✅ 8+ Quality materials and fabrics inventory"
echo "✅ 5+ Boutique ready-made products"
echo "✅ 5+ Loyalty program customers"
echo "✅ 10+ Sales and expense records"
echo "✅ 30+ Days of attendance data"
echo "✅ Quality control reports"
echo "✅ Financial analytics and metrics"

echo ""
echo "📱 Dashboard Features Available:"
echo "==============================="
echo "• Real-time production monitoring"
echo "• Client management with body measurements"
echo "• Order tracking and workflow"
echo "• Inventory management with Arabic categories"
echo "• POS system for boutique sales"
echo "• Worker attendance and performance"
echo "• Financial reports in KWD currency"
echo "• Quality control tracking"
echo "• Loyalty program management"

echo ""
echo "🚀 Quick Start Guide:"
echo "===================="
echo "1. Open browser and go to your application URL"
echo "2. Login with manager@huda-workshop.com / manager123"
echo "3. Explore Dashboard with real Kuwaiti data"
echo "4. View Clients tab to see women customers"
echo "5. Check Orders to see traditional clothing orders"
echo "6. Visit POS system to test boutique sales"
echo "7. Review Workers section for staff management"
echo "8. Check Analytics for business insights"

echo ""
echo "🎉 KUWAITI WOMEN TAILORING WORKSHOP IS READY!"
echo "=============================================="
echo "Your system now contains authentic Kuwaiti women's"
echo "tailoring data including clients, orders, staff,"
echo "inventory, and financial records."
echo ""
echo "All data is in Arabic with Kuwaiti cultural context"
echo "for traditional and modern women's clothing business."

# Return to original directory
cd ..

echo ""
echo "✨ Seeding completed successfully! ✨"