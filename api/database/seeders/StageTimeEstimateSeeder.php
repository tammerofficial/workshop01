<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductionStage;
use App\Models\StageTimeEstimate;

class StageTimeEstimateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stages = ProductionStage::all();
        
        if ($stages->isEmpty()) {
            $this->command->warn('لا توجد مراحل إنتاج. يرجى إنشاء المراحل أولاً');
            return;
        }

        $productTypes = ['furniture', 'cabinet', 'door', 'window', 'general'];
        $complexityLevels = ['simple', 'medium', 'complex', 'very_complex'];

        // تقديرات الأوقات بالدقائق لكل مرحلة
        $stageTimeEstimates = [
            'التصميم' => [
                'simple' => 60,    // ساعة واحدة
                'medium' => 120,   // ساعتان
                'complex' => 240,  // 4 ساعات
                'very_complex' => 480 // 8 ساعات
            ],
            'التحضير' => [
                'simple' => 30,
                'medium' => 60,
                'complex' => 120,
                'very_complex' => 180
            ],
            'القطع' => [
                'simple' => 45,
                'medium' => 90,
                'complex' => 180,
                'very_complex' => 360
            ],
            'التشكيل' => [
                'simple' => 60,
                'medium' => 120,
                'complex' => 240,
                'very_complex' => 480
            ],
            'التجميع' => [
                'simple' => 90,
                'medium' => 180,
                'complex' => 360,
                'very_complex' => 720
            ],
            'التشطيب' => [
                'simple' => 120,
                'medium' => 240,
                'complex' => 480,
                'very_complex' => 960
            ],
            'الجودة' => [
                'simple' => 15,
                'medium' => 30,
                'complex' => 60,
                'very_complex' => 120
            ],
            'التعبئة' => [
                'simple' => 15,
                'medium' => 30,
                'complex' => 60,
                'very_complex' => 90
            ]
        ];

        foreach ($stages as $stage) {
            foreach ($productTypes as $productType) {
                foreach ($complexityLevels as $complexity) {
                    // البحث عن تقدير الوقت للمرحلة
                    $estimatedMinutes = $this->getEstimatedTime($stage->name, $complexity, $stageTimeEstimates);
                    
                    // إضافة تباين حسب نوع المنتج
                    $productMultiplier = $this->getProductTypeMultiplier($productType);
                    $finalEstimate = round($estimatedMinutes * $productMultiplier);

                    StageTimeEstimate::create([
                        'production_stage_id' => $stage->id,
                        'product_type' => $productType,
                        'complexity_level' => $complexity,
                        'estimated_minutes' => $finalEstimate,
                        'minimum_minutes' => round($finalEstimate * 0.7),
                        'maximum_minutes' => round($finalEstimate * 1.5),
                        'description' => "تقدير {$productType} - {$complexity} للمرحلة {$stage->name}"
                    ]);
                }
            }
        }

        $this->command->info('تم إنشاء تقديرات أوقات المراحل بنجاح');
    }

    private function getEstimatedTime($stageName, $complexity, $estimates)
    {
        // البحث عن تقدير الوقت بناءً على اسم المرحلة
        foreach ($estimates as $stageKey => $complexityTimes) {
            if (str_contains($stageName, $stageKey) || str_contains($stageKey, $stageName)) {
                return $complexityTimes[$complexity] ?? $complexityTimes['medium'];
            }
        }

        // قيم افتراضية إذا لم توجد
        $defaultTimes = [
            'simple' => 60,
            'medium' => 120,
            'complex' => 240,
            'very_complex' => 480
        ];

        return $defaultTimes[$complexity];
    }

    private function getProductTypeMultiplier($productType)
    {
        $multipliers = [
            'furniture' => 1.2,  // الأثاث يحتاج وقت أكثر
            'cabinet' => 1.1,    // الخزائن معقدة قليلاً
            'door' => 0.8,       // الأبواب أبسط
            'window' => 0.9,     // النوافذ متوسطة
            'general' => 1.0     // المنتجات العامة
        ];

        return $multipliers[$productType] ?? 1.0;
    }

    private function getRequiredSkillLevel($stageName, $complexity)
    {
        $skillLevels = [
            'simple' => 'مبتدئ',
            'medium' => 'متوسط',
            'complex' => 'متقدم',
            'very_complex' => 'خبير'
        ];

        // بعض المراحل تحتاج مهارة عالية بغض النظر عن التعقيد
        $highSkillStages = ['التصميم', 'الجودة', 'التشطيب'];
        
        foreach ($highSkillStages as $highSkillStage) {
            if (str_contains($stageName, $highSkillStage)) {
                return $complexity === 'simple' ? 'متوسط' : $skillLevels[$complexity];
            }
        }

        return $skillLevels[$complexity];
    }
}
