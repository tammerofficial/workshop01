<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Collection;
use App\Models\Category;

class ProductsAndCollectionsSeeder extends Seeder
{
    public function run(): void
    {
        // إنشاء الكولكشنات
        $collections = [
            [
                'name' => 'Haute Couture 2025',
                'description' => 'مجموعة الخياطة الراقية لعام 2025',
                'season' => 'spring',
                'year' => 2025,
                'is_active' => true
            ],
            [
                'name' => 'Business Suits 2025',
                'description' => 'بدل الأعمال الأنيقة',
                'season' => 'winter',
                'year' => 2025,
                'is_active' => true
            ],
            [
                'name' => 'Wedding Collection',
                'description' => 'مجموعة الزفاف الفاخرة',
                'season' => 'summer',
                'year' => 2025,
                'is_active' => true
            ]
        ];

        foreach ($collections as $collectionData) {
            Collection::create($collectionData);
        }

        // الحصول على الفئات
        $categories = Category::all();
        $collections = Collection::all();

        // إنشاء المنتجات مع ساعات العمل المحددة
        $products = [
            [
                'name' => 'Classic Business Suit',
                'description' => 'بدلة أعمال كلاسيكية أنيقة',
                'category_id' => $categories->first()->id,
                'collection_id' => $collections->where('name', 'Business Suits 2025')->first()->id,
                'sku' => 'CBS-001',
                'price' => 150.00,
                'stage_requirements' => [
                    'design' => 2,      // ساعتان للتصميم
                    'cutting' => 3,     // 3 ساعات للقص
                    'sewing' => 8,      // 8 ساعات للخياطة
                    'fitting' => 2,     // ساعتان للتجربة
                    'finishing' => 3,   // 3 ساعات للتشطيب
                    'quality_check' => 1 // ساعة واحدة لفحص الجودة
                ],
                'material_requirements' => [
                    'fabric' => 3.5,    // 3.5 متر قماش
                    'thread' => 2,      // 2 بكرة خيط
                    'buttons' => 8,     // 8 أزرار
                    'lining' => 1       // 1 متر بطانة
                ],
                'is_active' => true
            ],
            [
                'name' => 'Luxury Wedding Suit',
                'description' => 'بدلة زفاف فاخرة مع تطريز يدوي',
                'category_id' => $categories->first()->id,
                'collection_id' => $collections->where('name', 'Wedding Collection')->first()->id,
                'sku' => 'LWS-001',
                'price' => 350.00,
                'stage_requirements' => [
                    'design' => 4,      // 4 ساعات للتصميم المعقد
                    'cutting' => 5,     // 5 ساعات للقص الدقيق
                    'sewing' => 15,     // 15 ساعة للخياطة والتطريز
                    'fitting' => 4,     // 4 ساعات للتجربة المتعددة
                    'finishing' => 6,   // 6 ساعات للتشطيب الفاخر
                    'quality_check' => 2 // ساعتان لفحص الجودة الدقيق
                ],
                'material_requirements' => [
                    'silk_fabric' => 4.0,
                    'gold_thread' => 1,
                    'pearl_buttons' => 12,
                    'silk_lining' => 2
                ],
                'is_active' => true
            ],
            [
                'name' => 'Casual Blazer',
                'description' => 'جاكيت كاجوال أنيق',
                'category_id' => $categories->first()->id,
                'collection_id' => $collections->where('name', 'Haute Couture 2025')->first()->id,
                'sku' => 'CB-001',
                'price' => 80.00,
                'stage_requirements' => [
                    'design' => 1,
                    'cutting' => 2,
                    'sewing' => 5,
                    'fitting' => 1,
                    'finishing' => 2,
                    'quality_check' => 1
                ],
                'material_requirements' => [
                    'cotton_fabric' => 2.5,
                    'thread' => 1,
                    'buttons' => 4
                ],
                'is_active' => true
            ],
            [
                'name' => 'Traditional Thobe',
                'description' => 'ثوب تقليدي راقي',
                'category_id' => $categories->first()->id,
                'collection_id' => $collections->where('name', 'Haute Couture 2025')->first()->id,
                'sku' => 'TT-001',
                'price' => 120.00,
                'stage_requirements' => [
                    'design' => 2,
                    'cutting' => 3,
                    'sewing' => 6,
                    'fitting' => 2,
                    'finishing' => 4,
                    'quality_check' => 1
                ],
                'material_requirements' => [
                    'traditional_fabric' => 4.0,
                    'special_thread' => 2,
                    'decorative_trim' => 3
                ],
                'is_active' => true
            ],
            [
                'name' => 'Evening Gown (Custom)',
                'description' => 'فستان سهرة مخصص بتطريز معقد',
                'category_id' => $categories->first()->id,
                'collection_id' => $collections->where('name', 'Wedding Collection')->first()->id,
                'sku' => 'EG-001',
                'price' => 500.00,
                'stage_requirements' => [
                    'design' => 6,      // تصميم معقد
                    'cutting' => 8,     // قص دقيق متعدد القطع
                    'sewing' => 25,     // خياطة وتطريز مكثف
                    'fitting' => 6,     // تجارب متعددة
                    'finishing' => 10,  // تشطيب فاخر
                    'quality_check' => 3 // فحص جودة شامل
                ],
                'material_requirements' => [
                    'silk_fabric' => 6.0,
                    'beads' => 500,
                    'gold_thread' => 3,
                    'crystals' => 100,
                    'silk_lining' => 3
                ],
                'is_active' => true
            ]
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}
