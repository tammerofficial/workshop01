<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductionStage;

class ProductionStageSeeder extends Seeder
{
    public function run()
    {
        $stages = [
            [
                'name' => 'التصميم',
                'description' => 'مرحلة تصميم المنتج وتحديد المواصفات',
                'order_sequence' => 1,
                'estimated_hours' => 3,
                'is_active' => true
            ],
            [
                'name' => 'القص',
                'description' => 'مرحلة قص المواد حسب التصميم',
                'order_sequence' => 2,
                'estimated_hours' => 4,
                'is_active' => true
            ],
            [
                'name' => 'الخياطة',
                'description' => 'مرحلة خياطة القطع',
                'order_sequence' => 3,
                'estimated_hours' => 12,
                'is_active' => true
            ],
            [
                'name' => 'التجربة والتعديل',
                'description' => 'مرحلة تجربة المنتج وإجراء التعديلات',
                'order_sequence' => 4,
                'estimated_hours' => 2,
                'is_active' => true
            ],
            [
                'name' => 'التشطيب النهائي',
                'description' => 'مرحلة التشطيب النهائي والتغليف',
                'order_sequence' => 5,
                'estimated_hours' => 3,
                'is_active' => true
            ]
        ];

        foreach ($stages as $stage) {
            ProductionStage::updateOrCreate(
                ['name' => $stage['name']],
                $stage
            );
        }
    }
}
