<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WorkflowEngine;
use App\Services\SmartWorkerAssignmentService;
use App\Models\OrderWorkflowProgress;
use App\Models\Order;
use App\Models\WorkerStageAssignment;
use App\Models\DailyPerformanceSummary;
use Carbon\Carbon;

class AutoWorkflowManager extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workflow:auto-manage {--mode=full : full|assignments|performance|summary}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'إدارة تلقائية شاملة لنظام التدفق والعمال';

    protected $workflowEngine;
    protected $assignmentService;

    public function __construct(
        WorkflowEngine $workflowEngine,
        SmartWorkerAssignmentService $assignmentService
    ) {
        parent::__construct();
        $this->workflowEngine = $workflowEngine;
        $this->assignmentService = $assignmentService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mode = $this->option('mode');
        
        $this->info("🚀 بدء الإدارة التلقائية لنظام التدفق - الوضع: {$mode}");
        $this->newLine();

        switch ($mode) {
            case 'assignments':
                $this->handleAutoAssignments();
                break;
            case 'performance':
                $this->handlePerformanceAnalysis();
                break;
            case 'summary':
                $this->handleDailySummary();
                break;
            case 'full':
            default:
                $this->handleFullManagement();
                break;
        }

        $this->info("✅ اكتملت الإدارة التلقائية بنجاح!");
        return Command::SUCCESS;
    }

    /**
     * 🎯 إدارة شاملة
     */
    private function handleFullManagement()
    {
        $this->info("📋 المرحلة 1: التخصيصات التلقائية...");
        $this->handleAutoAssignments();
        
        $this->info("📊 المرحلة 2: تحليل الأداء...");
        $this->handlePerformanceAnalysis();
        
        $this->info("📈 المرحلة 3: إعادة توازن الأحمال...");
        $this->handleWorkloadRebalancing();
        
        $this->info("📝 المرحلة 4: الملخص اليومي...");
        $this->handleDailySummary();
        
        $this->info("🔄 المرحلة 5: تحسينات النظام...");
        $this->handleSystemOptimizations();
    }

    /**
     * 🎯 التخصيصات التلقائية
     */
    private function handleAutoAssignments()
    {
        $this->runWithProgressBar(
            ['التحقق من الطلبيات المعلقة', 'تحليل توفر العمال', 'تطبيق التخصيصات الذكية'],
            function ($step) {
                switch ($step) {
                    case 'التحقق من الطلبيات المعلقة':
                        $pendingCount = OrderWorkflowProgress::where('status', 'pending')->count();
                        $this->info("📦 وجد {$pendingCount} طلبية معلقة");
                        break;
                        
                    case 'تحليل توفر العمال':
                        $availableWorkers = WorkerStageAssignment::where('availability_status', 'available')->count();
                        $this->info("👥 {$availableWorkers} عامل متاح");
                        break;
                        
                    case 'تطبيق التخصيصات الذكية':
                        $results = $this->assignmentService->autoDistributeWorkers();
                        foreach ($results as $result) {
                            $this->line("  📌 {$result['stage']}: تم تخصيص {$result['assigned_orders']} من أصل {$result['pending_orders']} طلبية");
                        }
                        break;
                }
            }
        );
    }

    /**
     * 📊 تحليل الأداء
     */
    private function handlePerformanceAnalysis()
    {
        $this->runWithProgressBar(
            ['تحليل الأداء اليومي', 'تحديد أفضل العمال', 'اكتشاف نقاط التحسين'],
            function ($step) {
                switch ($step) {
                    case 'تحليل الأداء اليومي':
                        $stats = $this->workflowEngine->getDailyPerformanceStats();
                        $this->info("📈 {$stats['orders_completed']} طلبية مكتملة اليوم");
                        $this->info("⚡ متوسط الكفاءة: " . round($stats['average_efficiency'], 1) . "%");
                        break;
                        
                    case 'تحديد أفضل العمال':
                        $stats = $this->workflowEngine->getDailyPerformanceStats();
                        if ($stats['top_performers']->isNotEmpty()) {
                            $this->info("🏆 أفضل عامل اليوم: " . $stats['top_performers']->first()->worker->name);
                        }
                        break;
                        
                    case 'اكتشاف نقاط التحسين':
                        $this->identifyImprovementAreas();
                        break;
                }
            }
        );
    }

    /**
     * ⚖️ إعادة توازن الأحمال
     */
    private function handleWorkloadRebalancing()
    {
        $rebalanceResults = $this->assignmentService->rebalanceWorkload();
        
        if ($rebalanceResults['rebalanced_tasks'] > 0) {
            $this->info("⚖️ تم إعادة توزيع {$rebalanceResults['rebalanced_tasks']} مهمة");
            $this->line("  📊 عمال محملين: {$rebalanceResults['overloaded_workers']}");
            $this->line("  📉 عمال أقل استغلالاً: {$rebalanceResults['underutilized_workers']}");
        } else {
            $this->info("✅ الأحمال متوازنة حالياً");
        }
    }

    /**
     * 📝 الملخص اليومي
     */
    private function handleDailySummary()
    {
        $today = today();
        
        // حساب الإحصائيات
        $ordersStarted = OrderWorkflowProgress::whereDate('started_at', $today)->count();
        $ordersCompleted = OrderWorkflowProgress::whereDate('completed_at', $today)->count();
        $stagesCompleted = OrderWorkflowProgress::where('status', 'completed')
            ->whereDate('completed_at', $today)->count();
        
        $activeWorkers = WorkerStageAssignment::where('is_active', true)
            ->whereHas('worker', function($q) {
                $q->whereHas('attendances', function($att) {
                    $att->whereDate('date', today())
                        ->where('status', 'present');
                });
            })->count();

        // إنشاء أو تحديث الملخص اليومي
        DailyPerformanceSummary::updateOrCreate(
            [
                'summary_date' => $today,
                'shift_type' => 'full_day'
            ],
            [
                'total_orders_started' => $ordersStarted,
                'total_orders_completed' => $ordersCompleted,
                'total_stages_completed' => $stagesCompleted,
                'total_workers_active' => $activeWorkers,
                'overall_efficiency' => $this->calculateOverallEfficiency(),
                'productivity_index' => $this->calculateProductivityIndex(),
                'quality_index' => $this->calculateQualityIndex(),
                'is_finalized' => false
            ]
        );

        $this->info("📝 تم تحديث الملخص اليومي:");
        $this->line("  📦 طلبيات بدأت: {$ordersStarted}");
        $this->line("  ✅ طلبيات مكتملة: {$ordersCompleted}");
        $this->line("  🔄 مراحل مكتملة: {$stagesCompleted}");
        $this->line("  👥 عمال نشطين: {$activeWorkers}");
    }

    /**
     * 🔧 تحسينات النظام
     */
    private function handleSystemOptimizations()
    {
        $optimizations = [];

        // تنظيف المهام المتوقفة طويلاً
        $stuckTasks = OrderWorkflowProgress::where('status', 'paused')
            ->where('paused_at', '<', now()->subHours(4))
            ->get();

        foreach ($stuckTasks as $task) {
            $task->update([
                'status' => 'assigned',
                'status_reason' => 'إعادة تفعيل تلقائي بعد توقف طويل'
            ]);
            $optimizations[] = "إعادة تفعيل مهمة متوقفة: #{$task->id}";
        }

        // تحديث حالة العمال المتاحين
        WorkerStageAssignment::where('availability_status', 'on_break')
            ->where('availability_updated_at', '<', now()->subMinutes(30))
            ->update([
                'availability_status' => 'available',
                'availability_updated_at' => now()
            ]);

        if (count($optimizations) > 0) {
            $this->info("🔧 تحسينات مطبقة:");
            foreach ($optimizations as $optimization) {
                $this->line("  ✓ {$optimization}");
            }
        } else {
            $this->info("✅ النظام محسن حالياً");
        }
    }

    /**
     * 🔍 تحديد نقاط التحسين
     */
    private function identifyImprovementAreas()
    {
        $issues = [];

        // فحص الاختناقات
        $bottlenecks = $this->findBottlenecks();
        if (!empty($bottlenecks)) {
            $issues[] = "اختناقات في المراحل: " . implode(', ', $bottlenecks);
        }

        // فحص تأخير المهام
        $delayedTasks = OrderWorkflowProgress::where('due_date', '<', now())
            ->whereIn('status', ['assigned', 'in_progress'])
            ->count();
        
        if ($delayedTasks > 0) {
            $issues[] = "{$delayedTasks} مهمة متأخرة عن موعدها";
        }

        // فحص العمال غير المستغلين
        $underutilized = WorkerStageAssignment::where('availability_status', 'available')
            ->whereDoesntHave('worker.orderProgress', function($q) {
                $q->whereIn('status', ['assigned', 'in_progress']);
            })->count();

        if ($underutilized > 0) {
            $issues[] = "{$underutilized} عامل متاح لكن غير مخصص";
        }

        if (!empty($issues)) {
            $this->warn("⚠️ نقاط تحتاج تحسين:");
            foreach ($issues as $issue) {
                $this->line("  🔸 {$issue}");
            }
        } else {
            $this->info("✅ لا توجد مشاكل ظاهرة");
        }
    }

    /**
     * 🚧 البحث عن الاختناقات
     */
    private function findBottlenecks()
    {
        $bottlenecks = [];
        
        // تحليل المراحل مع تراكم المهام
        $stageStats = OrderWorkflowProgress::selectRaw('stage_id, status, COUNT(*) as count')
            ->groupBy('stage_id', 'status')
            ->with('stage')
            ->get()
            ->groupBy('stage_id');

        foreach ($stageStats as $stageId => $stats) {
            $pending = $stats->where('status', 'pending')->sum('count');
            $inProgress = $stats->where('status', 'in_progress')->sum('count');
            $total = $pending + $inProgress;

            if ($total > 5) { // عتبة التحديد
                $stage = $stats->first()->stage;
                $bottlenecks[] = $stage->display_name . " ({$total} مهمة)";
            }
        }

        return $bottlenecks;
    }

    /**
     * 📊 حساب الكفاءة العامة
     */
    private function calculateOverallEfficiency()
    {
        $completedToday = OrderWorkflowProgress::whereDate('completed_at', today())
            ->avg('efficiency_percentage');
        
        return round($completedToday ?? 100, 2);
    }

    /**
     * 📈 حساب مؤشر الإنتاجية
     */
    private function calculateProductivityIndex()
    {
        $targetDaily = 50; // هدف يومي افتراضي
        $actualCompleted = OrderWorkflowProgress::whereDate('completed_at', today())->count();
        
        return round(($actualCompleted / $targetDaily) * 100, 2);
    }

    /**
     * 🏆 حساب مؤشر الجودة
     */
    private function calculateQualityIndex()
    {
        $avgQuality = OrderWorkflowProgress::whereDate('completed_at', today())
            ->avg('quality_score');
        
        return round(($avgQuality ?? 8) * 10, 2);
    }

    /**
     * 📊 شريط التقدم مع خطوات
     */
    private function runWithProgressBar(array $steps, callable $callback)
    {
        $progressBar = $this->output->createProgressBar(count($steps));
        $progressBar->start();

        foreach ($steps as $step) {
            $callback($step);
            $progressBar->advance();
            usleep(500000); // نصف ثانية للمحاكاة
        }

        $progressBar->finish();
        $this->newLine();
    }
}