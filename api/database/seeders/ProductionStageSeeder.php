<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductionStage;

class ProductionStageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stageData = [
            [
                'name' => 'التصميم والتخطيط',
                'description' => 'تصميم المنتج ووضع الخطة الأولية',
                'order_sequence' => 1,
                'estimated_hours' => 2,
                'is_active' => true
            ],
            [
                'name' => 'تحضير المواد',
                'description' => 'جمع وتحضير جميع المواد المطلوبة',
                'order_sequence' => 2,
                'estimated_hours' => 1,
                'is_active' => true
            ],
            [
                'name' => 'القطع والتشكيل',
                'description' => 'قطع المواد وتشكيلها حسب التصميم',
                'order_sequence' => 3,
                'estimated_hours' => 3,
                'is_active' => true
            ],
            [
                'name' => 'التجميع الأولي',
                'description' => 'تجميع القطع الأساسية',
                'order_sequence' => 4,
                'estimated_hours' => 4,
                'is_active' => true
            ],
            [
                'name' => 'التشطيب والدهان',
                'description' => 'تطبيق التشطيب النهائي والدهان',
                'order_sequence' => 5,
                'estimated_hours' => 3,
                'is_active' => true
            ],
            [
                'name' => 'فحص الجودة',
                'description' => 'فحص شامل للجودة والمطابقة للمواصفات',
                'order_sequence' => 6,
                'estimated_hours' => 1,
                'is_active' => true
            ],
            [
                'name' => 'التعبئة والتغليف',
                'description' => 'تعبئة المنتج النهائي للتسليم',
                'order_sequence' => 7,
                'estimated_hours' => 1,
                'is_active' => true
            ]
        ];

        foreach ($stageData as $stage) {
            ProductionStage::create($stage);
        }

        $this->command->info('تم إنشاء ' . count($stageData) . ' مرحلة إنتاج بنجاح');
    }
}
