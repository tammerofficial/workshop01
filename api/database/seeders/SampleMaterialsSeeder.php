<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class SampleMaterialsSeeder extends Seeder
{
    public function run()
    {
        // إنشاء فئة المواد الخام
        $rawMaterialCategory = Category::updateOrCreate(
            ['name' => 'المواد الخام'],
            ['description' => 'المواد الخام المستخدمة في الإنتاج', 'is_active' => true]
        );

        $materials = [
            [
                'name' => 'قماش قطني عالي الجودة',
                'description' => 'قماش قطني 100% مناسب للقمصان والبناطيل',
                'sku' => 'MAT-COTTON-001',
                'product_type' => 'raw_material',
                'price' => 15.00,
                'purchase_price' => 12.00,
                'stock_quantity' => 500,
                'category_id' => $rawMaterialCategory->id,
                'is_active' => true
            ],
            [
                'name' => 'خيوط بوليستر',
                'description' => 'خيوط بوليستر مقاومة ومتينة',
                'sku' => 'MAT-THREAD-001',
                'product_type' => 'raw_material',
                'price' => 3.50,
                'purchase_price' => 2.80,
                'stock_quantity' => 200,
                'category_id' => $rawMaterialCategory->id,
                'is_active' => true
            ],
            [
                'name' => 'أزرار معدنية',
                'description' => 'أزرار معدنية عالية الجودة',
                'sku' => 'MAT-BUTTON-001',
                'product_type' => 'product_part',
                'price' => 0.50,
                'purchase_price' => 0.30,
                'stock_quantity' => 1000,
                'category_id' => $rawMaterialCategory->id,
                'is_active' => true
            ],
            [
                'name' => 'سحاب معدني',
                'description' => 'سحاب معدني قوي ومتين',
                'sku' => 'MAT-ZIPPER-001',
                'product_type' => 'product_part',
                'price' => 2.00,
                'purchase_price' => 1.50,
                'stock_quantity' => 300,
                'category_id' => $rawMaterialCategory->id,
                'is_active' => true
            ]
        ];

        foreach ($materials as $material) {
            Product::updateOrCreate(
                ['sku' => $material['sku']],
                $material
            );
        }

        echo "✅ تم إنشاء " . count($materials) . " مواد خام\n";
    }
}