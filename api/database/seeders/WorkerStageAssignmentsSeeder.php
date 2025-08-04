<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Worker;
use App\Models\WorkflowStage;
use App\Models\WorkerStageAssignment;
use Illuminate\Support\Facades\DB;

class WorkerStageAssignmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // الحصول على جميع العمال والمراحل
        $workers = Worker::where('is_active', true)->get();
        $stages = WorkflowStage::where('is_active', true)->orderBy('stage_order')->get();

        if ($workers->isEmpty() || $stages->isEmpty()) {
            $this->command->warn('⚠️ لا توجد عمال أو مراحل متاحة');
            return;
        }

        // 🎯 تخصيص ذكي للعمال حسب المراحل
        $assignmentStrategies = [
            'cutting' => ['skill_levels' => ['expert', 'intermediate'], 'max_workers' => 4],
            'sewing' => ['skill_levels' => ['expert', 'intermediate', 'beginner'], 'max_workers' => 8],
            'embroidery' => ['skill_levels' => ['expert', 'intermediate'], 'max_workers' => 5],
            'quality_control' => ['skill_levels' => ['expert'], 'max_workers' => 3],
            'packaging' => ['skill_levels' => ['intermediate', 'beginner'], 'max_workers' => 4],
            'delivery' => ['skill_levels' => ['intermediate', 'beginner'], 'max_workers' => 2]
        ];

        foreach ($stages as $stage) {
            $strategy = $assignmentStrategies[$stage->name] ?? ['skill_levels' => ['intermediate'], 'max_workers' => 3];
            $workersForStage = $workers->shuffle()->take($strategy['max_workers']);
            
            foreach ($workersForStage as $index => $worker) {
                $skillLevel = $this->getRandomSkillLevel($strategy['skill_levels']);
                $isPrimary = $index === 0; // أول عامل يكون أساسي
                
                WorkerStageAssignment::create([
                    'worker_id' => $worker->id,
                    'stage_id' => $stage->id,
                    'skill_level' => $skillLevel,
                    'efficiency_rating' => $this->calculateEfficiencyRating($skillLevel),
                    'experience_months' => $this->getExperienceMonths($skillLevel),
                    'is_primary_assignment' => $isPrimary,
                    'can_train_others' => $skillLevel === 'expert',
                    'max_concurrent_tasks' => $this->getMaxConcurrentTasks($skillLevel),
                    'daily_work_hours' => 8.00,
                    'work_schedule' => $this->generateWorkSchedule(),
                    'assignment_start_date' => now()->subMonths(rand(1, 12)),
                    'priority_level' => $this->getPriorityLevel($skillLevel, $isPrimary),
                    'is_backup_worker' => !$isPrimary && rand(0, 100) < 30, // 30% احتمال كونه احتياطي
                    'availability_status' => $this->getRandomAvailabilityStatus(),
                    'certifications' => $this->generateCertifications($stage->name, $skillLevel),
                    'training_history' => $this->generateTrainingHistory($stage->name),
                    'next_training_due' => $this->getNextTrainingDate($skillLevel),
                    'is_active' => true
                ]);

                $this->command->info("✅ تم تخصيص العامل {$worker->name} للمرحلة {$stage->display_name} - مستوى: {$skillLevel}");
            }
        }

        $this->command->info("🎉 تم تخصيص {$workers->count()} عامل عبر {$stages->count()} مراحل بنجاح!");
    }

    /**
     * 🎯 الحصول على مستوى مهارة عشوائي
     */
    private function getRandomSkillLevel($allowedLevels)
    {
        return $allowedLevels[array_rand($allowedLevels)];
    }

    /**
     * 📊 حساب معامل الكفاءة حسب المستوى
     */
    private function calculateEfficiencyRating($skillLevel)
    {
        $ratings = [
            'beginner' => rand(60, 80) / 100,
            'intermediate' => rand(80, 120) / 100,
            'expert' => rand(120, 160) / 100,
            'master' => rand(150, 200) / 100
        ];

        return $ratings[$skillLevel] ?? 1.00;
    }

    /**
     * 📅 الحصول على أشهر الخبرة
     */
    private function getExperienceMonths($skillLevel)
    {
        $experience = [
            'beginner' => rand(1, 6),
            'intermediate' => rand(6, 24),
            'expert' => rand(24, 60),
            'master' => rand(60, 120)
        ];

        return $experience[$skillLevel] ?? 12;
    }

    /**
     * 🔄 الحد الأقصى للمهام المتزامنة
     */
    private function getMaxConcurrentTasks($skillLevel)
    {
        $tasks = [
            'beginner' => rand(1, 2),
            'intermediate' => rand(2, 4),
            'expert' => rand(3, 6),
            'master' => rand(4, 8)
        ];

        return $tasks[$skillLevel] ?? 3;
    }

    /**
     * 📋 توليد جدول العمل الأسبوعي
     */
    private function generateWorkSchedule()
    {
        $schedule = [];
        $days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
        
        foreach ($days as $day) {
            $schedule[$day] = [
                'start_time' => '08:00',
                'end_time' => '16:00',
                'break_times' => ['12:00-13:00'],
                'is_working_day' => true
            ];
        }

        $schedule['friday'] = [
            'start_time' => '08:00',
            'end_time' => '12:00',
            'break_times' => [],
            'is_working_day' => true
        ];

        $schedule['saturday'] = [
            'is_working_day' => false
        ];

        return $schedule;
    }

    /**
     * 🏆 مستوى الأولوية
     */
    private function getPriorityLevel($skillLevel, $isPrimary)
    {
        $base = [
            'beginner' => 30,
            'intermediate' => 50,
            'expert' => 70,
            'master' => 90
        ];

        $priority = $base[$skillLevel] ?? 50;
        return $isPrimary ? $priority + 20 : $priority;
    }

    /**
     * 🟢 حالة التوفر العشوائية
     */
    private function getRandomAvailabilityStatus()
    {
        $statuses = ['available', 'busy', 'on_break'];
        $weights = [70, 20, 10]; // النسب المئوية

        $random = rand(1, 100);
        if ($random <= $weights[0]) return $statuses[0];
        if ($random <= $weights[0] + $weights[1]) return $statuses[1];
        return $statuses[2];
    }

    /**
     * 🎓 توليد الشهادات والمؤهلات
     */
    private function generateCertifications($stageName, $skillLevel)
    {
        $certifications = [];
        
        $baseCertifications = [
            'cutting' => ['شهادة القص المتقدم', 'دورة استخدام أدوات القص'],
            'sewing' => ['شهادة الخياطة المهنية', 'دورة ماكينات الخياطة'],
            'embroidery' => ['شهادة التطريز اليدوي', 'دورة التطريز الآلي'],
            'quality_control' => ['شهادة مراقبة الجودة', 'دورة معايير الجودة العالمية'],
            'packaging' => ['دورة التغليف الحديث', 'شهادة سلامة المنتجات'],
            'delivery' => ['دورة خدمة العملاء', 'شهادة إدارة الشحن']
        ];

        $stageCerts = $baseCertifications[$stageName] ?? ['دورة أساسية'];
        
        if ($skillLevel === 'expert' || $skillLevel === 'master') {
            $certifications = $stageCerts;
            if ($skillLevel === 'master') {
                $certifications[] = 'شهادة تدريب المدربين';
                $certifications[] = 'شهادة الخبرة المتقدمة';
            }
        } elseif ($skillLevel === 'intermediate') {
            $certifications = [array_shift($stageCerts)]; // شهادة واحدة
        }

        return $certifications;
    }

    /**
     * 📚 توليد تاريخ التدريب
     */
    private function generateTrainingHistory($stageName)
    {
        return [
            [
                'training_name' => "دورة أساسيات {$stageName}",
                'completed_date' => now()->subMonths(rand(1, 6))->format('Y-m-d'),
                'duration_hours' => rand(8, 40),
                'score' => rand(75, 95)
            ],
            [
                'training_name' => 'دورة السلامة المهنية',
                'completed_date' => now()->subMonths(rand(6, 12))->format('Y-m-d'),
                'duration_hours' => 16,
                'score' => rand(80, 100)
            ]
        ];
    }

    /**
     * 📅 موعد التدريب القادم
     */
    private function getNextTrainingDate($skillLevel)
    {
        $months = [
            'beginner' => rand(1, 3),
            'intermediate' => rand(3, 6),
            'expert' => rand(6, 12),
            'master' => rand(12, 24)
        ];

        return now()->addMonths($months[$skillLevel] ?? 6)->format('Y-m-d');
    }
}