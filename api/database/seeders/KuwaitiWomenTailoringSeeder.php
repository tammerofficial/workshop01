<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class KuwaitiWomenTailoringSeeder extends Seeder
{
    /**
     * Run the database seeds for Kuwaiti Women Tailoring Workshop
     */
    public function run(): void
    {
        $this->seedKuwaitiWomenClients();
        $this->seedFemaleWorkers();
        $this->seedWomenClothingMaterials();
        $this->seedWomenClothingOrders();
        $this->seedWomenProductionTasks();
        $this->seedBoutiqueProducts();
        $this->seedLoyaltyProgram();
    }

    /**
     * Seed Kuwaiti women clients
     */
    private function seedKuwaitiWomenClients(): void
    {
        $kuwaitiWomenClients = [
            [
                'name' => 'فاطمة الرشيد',
                'email' => 'fatima.alrashid@gmail.com',
                'phone' => '+96599887766',
                'address' => 'حولي، شارع تونس، البيت رقم 15',
                'preferences' => json_encode(['العبايات الفاخرة', 'الفساتين العصرية', 'الثياب الكويتية التراثية']),
                'body_measurements' => json_encode([
                    'bust' => '90cm',
                    'waist' => '75cm', 
                    'hips' => '95cm',
                    'shoulder_width' => '38cm',
                    'sleeve_length' => '58cm',
                    'dress_length' => '140cm'
                ])
            ],
            [
                'name' => 'نورا العنزي',
                'email' => 'nora.alanezi@outlook.com',
                'phone' => '+96566554433',
                'address' => 'السالمية، شارع الخليج العربي، مجمع النخيل',
                'preferences' => json_encode(['فساتين الزفاف', 'العبايات المطرزة', 'الدراعات الكويتية']),
                'body_measurements' => json_encode([
                    'bust' => '85cm',
                    'waist' => '70cm',
                    'hips' => '90cm',
                    'shoulder_width' => '36cm',
                    'sleeve_length' => '56cm',
                    'dress_length' => '135cm'
                ])
            ],
            [
                'name' => 'مريم الصباح',
                'email' => 'mariam.alsabah@icloud.com',
                'phone' => '+96555443322',
                'address' => 'الجهراء، منطقة القيروان، قطعة 3، شارع 105',
                'preferences' => json_encode(['الجلابيات الصيفية', 'الفساتين الشتوية', 'الكنادر الكويتية']),
                'body_measurements' => json_encode([
                    'bust' => '88cm',
                    'waist' => '72cm',
                    'hips' => '92cm',
                    'shoulder_width' => '37cm',
                    'sleeve_length' => '57cm',
                    'dress_length' => '138cm'
                ])
            ],
            [
                'name' => 'عائشة المطيري',
                'email' => 'aisha.almutairi@gmail.com',
                'phone' => '+96599776655',
                'address' => 'الفروانية، شارع الرقة، منطقة جليب الشيوخ',
                'preferences' => json_encode(['العبايات الشتوية', 'فساتين المناسبات', 'الثوب الكويتي']),
                'body_measurements' => json_encode([
                    'bust' => '92cm',
                    'waist' => '78cm',
                    'hips' => '98cm',
                    'shoulder_width' => '39cm',
                    'sleeve_length' => '59cm',
                    'dress_length' => '142cm'
                ])
            ],
            [
                'name' => 'هدى الخالد',
                'email' => 'huda.alkhalid@yahoo.com',
                'phone' => '+96566889900',
                'address' => 'الأحمدي، منطقة الفحيحيل، مجمع البدر',
                'preferences' => json_encode(['فساتين السهرة', 'العبايات المفتوحة', 'الجلابيات المطرزة']),
                'body_measurements' => json_encode([
                    'bust' => '86cm',
                    'waist' => '68cm',
                    'hips' => '88cm',
                    'shoulder_width' => '35cm',
                    'sleeve_length' => '55cm',
                    'dress_length' => '132cm'
                ])
            ],
            [
                'name' => 'ليلى الدوسري',
                'email' => 'layla.aldosari@gmail.com',
                'phone' => '+96555667788',
                'address' => 'مبارك الكبير، منطقة صباح السالم، قطعة 5',
                'preferences' => json_encode(['الدشاديش الكويتية', 'العبايات الملونة', 'فساتين الأطفال']),
                'body_measurements' => json_encode([
                    'bust' => '89cm',
                    'waist' => '74cm',
                    'hips' => '94cm',
                    'shoulder_width' => '37cm',
                    'sleeve_length' => '57cm',
                    'dress_length' => '139cm'
                ])
            ],
            [
                'name' => 'زينب العجمي',
                'email' => 'zainab.alajmi@hotmail.com',
                'phone' => '+96599445566',
                'address' => 'العاصمة، منطقة الشامية، شارع المتنبي',
                'preferences' => json_encode(['العبايات الحديثة', 'الفساتين القصيرة', 'البلايز النسائية']),
                'body_measurements' => json_encode([
                    'bust' => '91cm',
                    'waist' => '76cm',
                    'hips' => '96cm',
                    'shoulder_width' => '38cm',
                    'sleeve_length' => '58cm',
                    'dress_length' => '140cm'
                ])
            ],
            [
                'name' => 'رقية السعد',
                'email' => 'ruqaya.alsaad@gmail.com',
                'phone' => '+96566778899',
                'address' => 'حولي، منطقة بيان، مجمع الياسمين',
                'preferences' => json_encode(['الثوب النشل', 'العبايات المخملية', 'فساتين الخطوبة']),
                'body_measurements' => json_encode([
                    'bust' => '87cm',
                    'waist' => '71cm',
                    'hips' => '91cm',
                    'shoulder_width' => '36cm',
                    'sleeve_length' => '56cm',
                    'dress_length' => '136cm'
                ])
            ]
        ];

        foreach ($kuwaitiWomenClients as $client) {
            DB::table('clients')->insert([
                'name' => $client['name'],
                'email' => $client['email'],
                'phone' => $client['phone'],
                'address' => $client['address'],
                'preferences' => $client['preferences'],
                'body_measurements' => $client['body_measurements'],
                'source' => 'local',
                'status' => 'active',
                'total_orders' => rand(1, 15),
                'total_spent' => rand(500, 5000),
                'created_at' => Carbon::now()->subDays(rand(1, 365)),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Seed female workers for tailoring workshop
     */
    private function seedFemaleWorkers(): void
    {
        $femaleWorkers = [
            [
                'name' => 'أم سارة الحسيني',
                'email' => 'um.sara@workshop.com',
                'phone' => '+96599112233',
                'employee_code' => 'TW001',
                'department' => 'خياطة رئيسية',
                'position' => 'خياطة ماهرة',
                'speciality' => 'العبايات والفساتين',
                'experience_years' => 15
            ],
            [
                'name' => 'فاطمة العبدالله',
                'email' => 'fatima.abdullah@workshop.com',
                'phone' => '+96566334455',
                'employee_code' => 'TW002',
                'department' => 'التطريز والزخرفة',
                'position' => 'مطرزة محترفة',
                'speciality' => 'التطريز اليدوي والآلي',
                'experience_years' => 12
            ],
            [
                'name' => 'خديجة المهنا',
                'email' => 'khadija.almuhanna@workshop.com',
                'phone' => '+96555667788',
                'employee_code' => 'TW003',
                'department' => 'القص والتفصيل',
                'position' => 'قصاصة خبيرة',
                'speciality' => 'قص الأقمشة الفاخرة',
                'experience_years' => 18
            ],
            [
                'name' => 'منيرة الفضلي',
                'email' => 'munira.alfadli@workshop.com',
                'phone' => '+96599887766',
                'employee_code' => 'TW004',
                'department' => 'التشطيب والإنهاء',
                'position' => 'مختصة تشطيب',
                'speciality' => 'اللمسات الأخيرة والكي',
                'experience_years' => 10
            ],
            [
                'name' => 'سارة الكندري',
                'email' => 'sara.alkandari@workshop.com',
                'phone' => '+96566445566',
                'employee_code' => 'TW005',
                'department' => 'الثياب التراثية',
                'position' => 'خياطة تراثية',
                'speciality' => 'الثوب الكويتي والدراعة',
                'experience_years' => 20
            ],
            [
                'name' => 'نادية الرشيد',
                'email' => 'nadia.alrashid@workshop.com',
                'phone' => '+96555778899',
                'employee_code' => 'TW006',
                'department' => 'فساتين الزفاف',
                'position' => 'خياطة زفاف',
                'speciality' => 'فساتين الأعراس والمناسبات',
                'experience_years' => 14
            ]
        ];

        foreach ($femaleWorkers as $worker) {
            DB::table('workers')->insert([
                'name' => $worker['name'],
                'email' => $worker['email'],
                'phone' => $worker['phone'],
                'employee_code' => $worker['employee_code'],
                'department' => $worker['department'],
                'position' => $worker['position'],
                'speciality' => $worker['speciality'],
                'experience_years' => $worker['experience_years'],
                'hourly_rate' => rand(8, 15),
                'efficiency_rating' => rand(85, 98),
                'quality_score' => rand(88, 99),
                'status' => 'active',
                'hire_date' => Carbon::now()->subMonths(rand(6, 60)),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Seed materials for women's clothing
     */
    private function seedWomenClothingMaterials(): void
    {
        $womenMaterials = [
            [
                'name' => 'قماش كريب أسود فاخر',
                'category' => 'أقمشة العبايات',
                'sku' => 'CREPE-BLK-001',
                'unit' => 'متر',
                'quantity' => 150,
                'cost_per_unit' => 25.000,
                'supplier' => 'شركة الأقمشة الكويتية',
                'description' => 'قماش كريب عالي الجودة للعبايات الفاخرة'
            ],
            [
                'name' => 'حرير طبيعي ملون',
                'category' => 'أقمشة الفساتين',
                'sku' => 'SILK-COL-002',
                'unit' => 'متر',
                'quantity' => 80,
                'cost_per_unit' => 45.000,
                'supplier' => 'مؤسسة الحرير الخليجي',
                'description' => 'حرير طبيعي بألوان متنوعة للفساتين'
            ],
            [
                'name' => 'قطن مخلوط للثياب',
                'category' => 'أقمشة يومية',
                'sku' => 'COT-MIX-003',
                'unit' => 'متر',
                'quantity' => 200,
                'cost_per_unit' => 12.500,
                'supplier' => 'معرض الأقمشة العصرية',
                'description' => 'قطن مخلوط مريح للثياب اليومية'
            ],
            [
                'name' => 'خيوط تطريز ذهبية',
                'category' => 'خيوط التطريز',
                'sku' => 'EMB-GOLD-004',
                'unit' => 'بكرة',
                'quantity' => 50,
                'cost_per_unit' => 8.750,
                'supplier' => 'محل التطريز الملكي',
                'description' => 'خيوط ذهبية للتطريز الفاخر'
            ],
            [
                'name' => 'خرز وترتر للزينة',
                'category' => 'إكسسوارات',
                'sku' => 'BEADS-001',
                'unit' => 'علبة',
                'quantity' => 30,
                'cost_per_unit' => 15.000,
                'supplier' => 'بيت الإكسسوارات',
                'description' => 'خرز وترتر متنوع لتزيين الثياب'
            ],
            [
                'name' => 'سحابات عالية الجودة',
                'category' => 'إكسسوارات',
                'sku' => 'ZIP-HQ-005',
                'unit' => 'قطعة',
                'quantity' => 100,
                'cost_per_unit' => 2.250,
                'supplier' => 'مكتبة الخياطة المتقدمة',
                'description' => 'سحابات قوية ومتينة'
            ],
            [
                'name' => 'أزرار نحاسية تراثية',
                'category' => 'إكسسوارات',
                'sku' => 'BTN-BRASS-006',
                'unit' => 'دزينة',
                'quantity' => 25,
                'cost_per_unit' => 6.500,
                'supplier' => 'محل التراث الكويتي',
                'description' => 'أزرار نحاسية بتصاميم تراثية'
            ],
            [
                'name' => 'دانتيل فرنسي فاخر',
                'category' => 'أقمشة الزينة',
                'sku' => 'LACE-FR-007',
                'unit' => 'متر',
                'quantity' => 40,
                'cost_per_unit' => 35.000,
                'supplier' => 'معرض الدانتيل الأوروبي',
                'description' => 'دانتيل فرنسي للفساتين الفاخرة'
            ]
        ];

        foreach ($womenMaterials as $material) {
            DB::table('inventory')->insert([
                'name' => $material['name'],
                'category' => $material['category'],
                'sku' => $material['sku'],
                'unit' => $material['unit'],
                'quantity' => $material['quantity'],
                'cost_per_unit' => $material['cost_per_unit'],
                'total_value' => $material['quantity'] * $material['cost_per_unit'],
                'supplier' => $material['supplier'],
                'reorder_level' => rand(10, 30),
                'location' => 'مخزن الخامات الرئيسي',
                'description' => $material['description'],
                'status' => $material['quantity'] > 20 ? 'available' : 'low_stock',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Seed women's clothing orders
     */
    private function seedWomenClothingOrders(): void
    {
        $womenOrders = [
            [
                'order_number' => 'ORD-2024-001',
                'client_name' => 'فاطمة الرشيد',
                'item_type' => 'عباية فاخرة',
                'description' => 'عباية كريب أسود مع تطريز ذهبي على الأكمام والحواف',
                'fabric' => 'كريب أسود فاخر',
                'color' => 'أسود مع ذهبي',
                'size' => 'مقاس خاص',
                'price' => 350.000,
                'delivery_date' => Carbon::now()->addDays(14),
                'special_requests' => 'تطريز اسم العميلة بالذهب داخلياً'
            ],
            [
                'order_number' => 'ORD-2024-002',
                'client_name' => 'نورا العنزي',
                'item_type' => 'فستان زفاف',
                'description' => 'فستان زفاف حرير أبيض مع دانتيل فرنسي وخرز',
                'fabric' => 'حرير طبيعي أبيض',
                'color' => 'أبيض ناصع',
                'size' => 'متوسط',
                'price' => 1250.000,
                'delivery_date' => Carbon::now()->addDays(45),
                'special_requests' => 'ذيل طويل 3 متر مع طبقات من التول'
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
                'delivery_date' => Carbon::now()->addDays(10),
                'special_requests' => 'تطريز تراثي بالألوان الذهبية والفضية'
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
                'delivery_date' => Carbon::now()->addDays(21),
                'special_requests' => 'أكمام طويلة وتصميم محتشم'
            ],
            [
                'order_number' => 'ORD-2024-005',
                'client_name' => 'هدى الخالد',
                'item_type' => 'عباية مفتوحة',
                'description' => 'عباية مفتوحة كيمونو ستايل مع حزام',
                'fabric' => 'كريب جورجيت',
                'color' => 'رمادي دخاني',
                'size' => 'صغير',
                'price' => 275.000,
                'delivery_date' => Carbon::now()->addDays(12),
                'special_requests' => 'جيوب خفية وأزرار مخفية'
            ],
            [
                'order_number' => 'ORD-2024-006',
                'client_name' => 'ليلى الدوسري',
                'item_type' => 'جلابية صيفية',
                'description' => 'جلابية قطنية خفيفة مع تطريز بسيط',
                'fabric' => 'قطن خالص',
                'color' => 'أبيض مع أزرق فاتح',
                'size' => 'متوسط',
                'price' => 95.000,
                'delivery_date' => Carbon::now()->addDays(7),
                'special_requests' => 'قصة واسعة ومريحة للصيف'
            ]
        ];

        foreach ($womenOrders as $order) {
            DB::table('orders')->insert([
                'order_number' => $order['order_number'],
                'client_name' => $order['client_name'],
                'item_type' => $order['item_type'],
                'description' => $order['description'],
                'fabric' => $order['fabric'],
                'color' => $order['color'],
                'size' => $order['size'],
                'quantity' => 1,
                'price' => $order['price'],
                'total_amount' => $order['price'],
                'currency' => 'KWD',
                'status' => collect(['pending', 'in_progress', 'cutting', 'sewing'])->random(),
                'priority' => collect(['low', 'medium', 'high'])->random(),
                'delivery_date' => $order['delivery_date'],
                'special_requests' => $order['special_requests'],
                'progress_percentage' => rand(10, 75),
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Seed production tasks for women's tailoring
     */
    private function seedWomenProductionTasks(): void
    {
        $productionStages = [
            'أخذ القياسات',
            'رسم الباترون',
            'قص القماش',
            'الخياطة الأساسية',
            'التطريز والزخرفة',
            'التشطيب النهائي',
            'الكي والتعبئة'
        ];

        for ($i = 1; $i <= 20; $i++) {
            DB::table('production_tasks')->insert([
                'task_name' => $productionStages[array_rand($productionStages)],
                'order_id' => rand(1, 6),
                'assigned_worker' => 'TW00' . rand(1, 6),
                'stage' => collect(['design', 'cutting', 'sewing', 'embroidery', 'finishing'])->random(),
                'estimated_hours' => rand(2, 12),
                'actual_hours' => rand(1, 10),
                'status' => collect(['pending', 'in_progress', 'completed', 'quality_check'])->random(),
                'quality_score' => rand(85, 99),
                'notes' => 'مهمة إنتاج للملابس النسائية الكويتية',
                'start_date' => Carbon::now()->subDays(rand(1, 15)),
                'completion_date' => rand(0, 1) ? Carbon::now()->subDays(rand(0, 5)) : null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Seed boutique products
     */
    private function seedBoutiqueProducts(): void
    {
        $boutiqueProducts = [
            [
                'name' => 'عباية كاجوال يومية',
                'category' => 'عبايات',
                'price' => 85.000,
                'description' => 'عباية يومية مريحة وأنيقة',
                'in_stock' => true,
                'quantity' => 15
            ],
            [
                'name' => 'فستان سهرة قصير',
                'category' => 'فساتين',
                'price' => 120.000,
                'description' => 'فستان أنيق للمناسبات',
                'in_stock' => true,
                'quantity' => 8
            ],
            [
                'name' => 'جلابية منزلية',
                'category' => 'ملابس منزلية',
                'price' => 45.000,
                'description' => 'جلابية قطنية للبيت',
                'in_stock' => true,
                'quantity' => 25
            ],
            [
                'name' => 'طرحة حرير طبيعي',
                'category' => 'إكسسوارات',
                'price' => 25.000,
                'description' => 'طرحة حرير بألوان متنوعة',
                'in_stock' => true,
                'quantity' => 30
            ],
            [
                'name' => 'حقيبة يد نسائية',
                'category' => 'حقائب',
                'price' => 65.000,
                'description' => 'حقيبة أنيقة للاستخدام اليومي',
                'in_stock' => true,
                'quantity' => 12
            ]
        ];

        foreach ($boutiqueProducts as $product) {
            DB::table('boutique_products')->insert([
                'name' => $product['name'],
                'category' => $product['category'],
                'price' => $product['price'],
                'description' => $product['description'],
                'in_stock' => $product['in_stock'],
                'quantity' => $product['quantity'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Seed loyalty program data
     */
    private function seedLoyaltyProgram(): void
    {
        $loyaltyCustomers = [
            ['name' => 'فاطمة الرشيد', 'phone' => '+96599887766', 'points' => 450],
            ['name' => 'نورا العنزي', 'phone' => '+96566554433', 'points' => 320],
            ['name' => 'مريم الصباح', 'phone' => '+96555443322', 'points' => 180],
            ['name' => 'عائشة المطيري', 'phone' => '+96599776655', 'points' => 280],
            ['name' => 'هدى الخالد', 'phone' => '+96566889900', 'points' => 150]
        ];

        foreach ($loyaltyCustomers as $customer) {
            DB::table('loyalty_customers')->insert([
                'name' => $customer['name'],
                'phone' => $customer['phone'],
                'total_points' => $customer['points'],
                'available_points' => $customer['points'],
                'total_spent' => $customer['points'] * 2.5, // assuming 1 KWD = ~2.5 points
                'tier' => $customer['points'] > 300 ? 'gold' : ($customer['points'] > 200 ? 'silver' : 'bronze'),
                'membership_number' => 'MEM-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'joined_at' => Carbon::now()->subDays(rand(30, 365)),
                'is_active' => true,
                'created_at' => Carbon::now()->subDays(rand(30, 365)),
                'updated_at' => Carbon::now()
            ]);
        }
    }
}