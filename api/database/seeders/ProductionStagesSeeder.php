<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductionStage;

class ProductionStagesSeeder extends Seeder
{
    public function run(): void
    {
        $stages = [
            [
                'name' => 'Design & Planning',
                'description' => 'تصميم وتخطيط المنتج',
                'order_sequence' => 1,
                'estimated_hours' => 2,
                'is_active' => true
            ],
            [
                'name' => 'Cutting',
                'description' => 'قص القماش',
                'order_sequence' => 2,
                'estimated_hours' => 3,
                'is_active' => true
            ],
            [
                'name' => 'Sewing',
                'description' => 'الخياطة',
                'order_sequence' => 3,
                'estimated_hours' => 8,
                'is_active' => true
            ],
            [
                'name' => 'Fitting',
                'description' => 'القياس والتجربة',
                'order_sequence' => 4,
                'estimated_hours' => 2,
                'is_active' => true
            ],
            [
                'name' => 'Finishing',
                'description' => 'التشطيب النهائي',
                'order_sequence' => 5,
                'estimated_hours' => 3,
                'is_active' => true
            ],
            [
                'name' => 'Quality Check',
                'description' => 'فحص الجودة',
                'order_sequence' => 6,
                'estimated_hours' => 1,
                'is_active' => true
            ]
        ];

        foreach ($stages as $stage) {
            ProductionStage::create($stage);
        }
    }
} 