<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductionStage;

class ProductionStagesSeeder extends Seeder
{
    public function run()
    {
        $stages = [
            ['name' => 'القص والتجهيز', 'description' => 'قص الأقمشة وتجهيز المواد', 'order_sequence' => 1, 'estimated_hours' => 2],
            ['name' => 'الخياطة الأساسية', 'description' => 'خياطة القطع الأساسية', 'order_sequence' => 2, 'estimated_hours' => 8],
            ['name' => 'التجميع والتركيب', 'description' => 'تجميع أجزاء المنتج', 'order_sequence' => 3, 'estimated_hours' => 4],
            ['name' => 'التفصيل والقياس', 'description' => 'تفصيل المنتج حسب المقاسات', 'order_sequence' => 4, 'estimated_hours' => 3],
            ['name' => 'اللمسات الأخيرة', 'description' => 'إضافة التفاصيل والملحقات', 'order_sequence' => 5, 'estimated_hours' => 2],
            ['name' => 'المراجعة والجودة', 'description' => 'فحص الجودة والمراجعة النهائية', 'order_sequence' => 6, 'estimated_hours' => 1],
            ['name' => 'التعبئة والتغليف', 'description' => 'تعبئة المنتج النهائي', 'order_sequence' => 7, 'estimated_hours' => 1]
        ];

        foreach ($stages as $stage) {
            ProductionStage::updateOrCreate(
                ['name' => $stage['name']],
                $stage
            );
        }

        echo "✅ تم إنشاء " . count($stages) . " مراحل إنتاج\n";
    }
}