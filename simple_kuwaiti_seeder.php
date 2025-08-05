<?php

// Simple PHP script to seed Kuwaiti women tailoring data
require_once 'api/vendor/autoload.php';

$app = require_once 'api/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "🇰🇼 KUWAITI WOMEN TAILORING WORKSHOP - DIRECT SEEDING\n";
echo "====================================================\n\n";

try {
    // Clear existing data safely
    echo "🧹 Clearing existing data...\n";
    $tables = ['clients', 'workers', 'orders', 'inventory'];
    foreach ($tables as $table) {
        if (DB::getSchemaBuilder()->hasTable($table)) {
            DB::table($table)->delete();
            echo "✅ Cleared {$table} table\n";
        }
    }

    // Seed Kuwaiti women clients
    echo "\n👥 Seeding Kuwaiti women clients...\n";
    $clients = [
        [
            'name' => 'فاطمة الرشيد',
            'email' => 'fatima.alrashid@gmail.com',
            'phone' => '+96599887766',
            'address' => 'حولي، شارع تونس، البيت رقم 15',
            'preferences' => json_encode(['العبايات الفاخرة', 'الفساتين العصرية']),
            'total_orders' => 5,
            'total_spent' => 850.000,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'نورا العنزي',
            'email' => 'nora.alanezi@outlook.com',
            'phone' => '+96566554433',
            'address' => 'السالمية، شارع الخليج العربي',
            'preferences' => json_encode(['فساتين الزفاف', 'العبايات المطرزة']),
            'total_orders' => 3,
            'total_spent' => 1250.000,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'مريم الصباح',
            'email' => 'mariam.alsabah@icloud.com',
            'phone' => '+96555443322',
            'address' => 'الجهراء، منطقة القيروان',
            'preferences' => json_encode(['الجلابيات الصيفية', 'الكنادر الكويتية']),
            'total_orders' => 4,
            'total_spent' => 680.000,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'عائشة المطيري',
            'email' => 'aisha.almutairi@gmail.com',
            'phone' => '+96599776655',
            'address' => 'الفروانية، شارع الرقة',
            'preferences' => json_encode(['العبايات الشتوية', 'فساتين المناسبات']),
            'total_orders' => 6,
            'total_spent' => 920.000,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'هدى الخالد',
            'email' => 'huda.alkhalid@yahoo.com',
            'phone' => '+96566889900',
            'address' => 'الأحمدي، منطقة الفحيحيل',
            'preferences' => json_encode(['فساتين السهرة', 'العبايات المفتوحة']),
            'total_orders' => 2,
            'total_spent' => 450.000,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]
    ];

    foreach ($clients as $client) {
        DB::table('clients')->insert($client);
    }
    echo "✅ Added " . count($clients) . " Kuwaiti women clients\n";

    // Seed female workers
    echo "\n👩‍🔧 Seeding female workshop workers...\n";
    $workers = [
        [
            'name' => 'أم سارة الحسيني',
            'email' => 'um.sara@workshop.com',
            'phone' => '+96599112233',
            'employee_code' => 'TW001',
            'department' => 'خياطة رئيسية',
            'position' => 'خياطة ماهرة',
            'experience_years' => 15,
            'hourly_rate' => 12.000,
            'efficiency_rating' => 95,
            'quality_score' => 98,
            'status' => 'active',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'فاطمة العبدالله',
            'email' => 'fatima.abdullah@workshop.com',
            'phone' => '+96566334455',
            'employee_code' => 'TW002',
            'department' => 'التطريز والزخرفة',
            'position' => 'مطرزة محترفة',
            'experience_years' => 12,
            'hourly_rate' => 10.000,
            'efficiency_rating' => 92,
            'quality_score' => 96,
            'status' => 'active',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'خديجة المهنا',
            'email' => 'khadija.almuhanna@workshop.com',
            'phone' => '+96555667788',
            'employee_code' => 'TW003',
            'department' => 'القص والتفصيل',
            'position' => 'قصاصة خبيرة',
            'experience_years' => 18,
            'hourly_rate' => 14.000,
            'efficiency_rating' => 90,
            'quality_score' => 94,
            'status' => 'active',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'منيرة الفضلي',
            'email' => 'munira.alfadli@workshop.com',
            'phone' => '+96599887766',
            'employee_code' => 'TW004',
            'department' => 'التشطيب والإنهاء',
            'position' => 'مختصة تشطيب',
            'experience_years' => 10,
            'hourly_rate' => 9.000,
            'efficiency_rating' => 88,
            'quality_score' => 92,
            'status' => 'active',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]
    ];

    foreach ($workers as $worker) {
        DB::table('workers')->insert($worker);
    }
    echo "✅ Added " . count($workers) . " female workshop workers\n";

    // Seed women's clothing orders
    echo "\n👗 Seeding women's clothing orders...\n";
    $orders = [
        [
            'order_number' => 'ORD-2024-001',
            'client_name' => 'فاطمة الرشيد',
            'item_type' => 'عباية فاخرة',
            'description' => 'عباية كريب أسود مع تطريز ذهبي على الأكمام',
            'fabric' => 'كريب أسود فاخر',
            'color' => 'أسود مع ذهبي',
            'size' => 'مقاس خاص',
            'price' => 350.000,
            'total_amount' => 350.000,
            'currency' => 'KWD',
            'status' => 'in_progress',
            'priority' => 'high',
            'delivery_date' => Carbon::now()->addDays(14),
            'progress_percentage' => 60,
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now()
        ],
        [
            'order_number' => 'ORD-2024-002',
            'client_name' => 'نورا العنزي',
            'item_type' => 'فستان زفاف',
            'description' => 'فستان زفاف حرير أبيض مع دانتيل فرنسي',
            'fabric' => 'حرير طبيعي أبيض',
            'color' => 'أبيض ناصع',
            'size' => 'متوسط',
            'price' => 1250.000,
            'total_amount' => 1250.000,
            'currency' => 'KWD',
            'status' => 'pending',
            'priority' => 'high',
            'delivery_date' => Carbon::now()->addDays(45),
            'progress_percentage' => 25,
            'created_at' => Carbon::now()->subDays(10),
            'updated_at' => Carbon::now()
        ],
        [
            'order_number' => 'ORD-2024-003',
            'client_name' => 'مريم الصباح',
            'item_type' => 'دراعة كويتية',
            'description' => 'دراعة تراثية كويتية بتطريز يدوي ملون',
            'fabric' => 'قطن مخلوط عالي الجودة',
            'color' => 'أزرق ملكي',
            'size' => 'كبير',
            'price' => 180.000,
            'total_amount' => 180.000,
            'currency' => 'KWD',
            'status' => 'completed',
            'priority' => 'medium',
            'delivery_date' => Carbon::now()->addDays(10),
            'progress_percentage' => 100,
            'created_at' => Carbon::now()->subDays(20),
            'updated_at' => Carbon::now()
        ],
        [
            'order_number' => 'ORD-2024-004',
            'client_name' => 'عائشة المطيري',
            'item_type' => 'طقم فساتين',
            'description' => 'طقم من 3 فساتين مناسبات بألوان متدرجة',
            'fabric' => 'كريب وحرير مخلوط',
            'color' => 'وردي، بنفسجي، أزرق',
            'size' => 'متوسط إلى كبير',
            'price' => 650.000,
            'total_amount' => 650.000,
            'currency' => 'KWD',
            'status' => 'in_progress',
            'priority' => 'medium',
            'delivery_date' => Carbon::now()->addDays(21),
            'progress_percentage' => 40,
            'created_at' => Carbon::now()->subDays(8),
            'updated_at' => Carbon::now()
        ]
    ];

    foreach ($orders as $order) {
        DB::table('orders')->insert($order);
    }
    echo "✅ Added " . count($orders) . " women's clothing orders\n";

    // Seed materials inventory
    echo "\n🧵 Seeding materials and fabrics inventory...\n";
    $materials = [
        [
            'name' => 'قماش كريب أسود فاخر',
            'category' => 'أقمشة العبايات',
            'sku' => 'CREPE-BLK-001',
            'unit' => 'متر',
            'quantity' => 150,
            'cost_per_unit' => 25.000,
            'total_value' => 3750.000,
            'supplier' => 'شركة الأقمشة الكويتية',
            'reorder_level' => 20,
            'location' => 'مخزن الخامات الرئيسي',
            'description' => 'قماش كريب عالي الجودة للعبايات الفاخرة',
            'status' => 'available',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'حرير طبيعي ملون',
            'category' => 'أقمشة الفساتين',
            'sku' => 'SILK-COL-002',
            'unit' => 'متر',
            'quantity' => 80,
            'cost_per_unit' => 45.000,
            'total_value' => 3600.000,
            'supplier' => 'مؤسسة الحرير الخليجي',
            'reorder_level' => 15,
            'location' => 'مخزن الخامات الرئيسي',
            'description' => 'حرير طبيعي بألوان متنوعة للفساتين',
            'status' => 'available',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'خيوط تطريز ذهبية',
            'category' => 'خيوط التطريز',
            'sku' => 'EMB-GOLD-004',
            'unit' => 'بكرة',
            'quantity' => 50,
            'cost_per_unit' => 8.750,
            'total_value' => 437.500,
            'supplier' => 'محل التطريز الملكي',
            'reorder_level' => 10,
            'location' => 'مخزن الخامات الرئيسي',
            'description' => 'خيوط ذهبية للتطريز الفاخر',
            'status' => 'available',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ],
        [
            'name' => 'دانتيل فرنسي فاخر',
            'category' => 'أقمشة الزينة',
            'sku' => 'LACE-FR-007',
            'unit' => 'متر',
            'quantity' => 40,
            'cost_per_unit' => 35.000,
            'total_value' => 1400.000,
            'supplier' => 'معرض الدانتيل الأوروبي',
            'reorder_level' => 8,
            'location' => 'مخزن الخامات الرئيسي',
            'description' => 'دانتيل فرنسي للفساتين الفاخرة',
            'status' => 'available',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]
    ];

    foreach ($materials as $material) {
        DB::table('inventory')->insert($material);
    }
    echo "✅ Added " . count($materials) . " materials and fabrics\n";

    echo "\n📊 Final counts:\n";
    echo "===============\n";
    echo "👥 Clients: " . DB::table('clients')->count() . "\n";
    echo "👩‍🔧 Workers: " . DB::table('workers')->count() . "\n";
    echo "👗 Orders: " . DB::table('orders')->count() . "\n";
    echo "🧵 Materials: " . DB::table('inventory')->count() . "\n";

    echo "\n🎉 KUWAITI WOMEN TAILORING WORKSHOP DATA SEEDED SUCCESSFULLY!\n";
    echo "============================================================\n";
    echo "🇰🇼 Your workshop now has authentic Kuwaiti women's tailoring data!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}