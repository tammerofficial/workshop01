<?php

namespace App\Services;

use App\Models\Worker;
use App\Models\WorkflowStage;
use App\Models\WorkerStageAssignment;
use App\Models\OrderWorkflowProgress;
use App\Models\WorkerPerformanceMetric;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SmartWorkerAssignmentService
{
    /**
     * 🧠 البحث عن أفضل عامل متاح بذكاء
     */
    public function findOptimalWorker($stage_id, $order_priority = 'normal', $required_completion_time = null)
    {
        // الحصول على العمال المتاحين للمرحلة
        $availableWorkers = $this->getAvailableWorkersForStage($stage_id);
        
        if ($availableWorkers->isEmpty()) {
            return null;
        }

        // تطبيق خوارزمية التخصيص الذكي
        $scoredWorkers = $this->scoreWorkers($availableWorkers, $stage_id, $order_priority, $required_completion_time);
        
        // إرجاع أفضل عامل
        return $scoredWorkers->first();
    }

    /**
     * 📊 تسجيل العمال وحساب نقاط الأولوية
     */
    private function scoreWorkers($workers, $stage_id, $order_priority, $required_completion_time)
    {
        return $workers->map(function ($assignment) use ($stage_id, $order_priority, $required_completion_time) {
            $worker = $assignment->worker;
            $score = 0;

            // 🎯 نقاط الكفاءة (40%)
            $score += $assignment->efficiency_rating * 40;

            // 📈 نقاط الأداء الحديث (30%)
            $recentPerformance = $this->getRecentPerformanceScore($worker->id, $stage_id);
            $score += $recentPerformance * 30;

            // ⚡ نقاط السرعة والتوفر (20%)
            $availabilityScore = $this->calculateAvailabilityScore($assignment);
            $score += $availabilityScore * 20;

            // 🏆 نقاط الخبرة والمهارة (10%)
            $experienceScore = $this->calculateExperienceScore($assignment);
            $score += $experienceScore * 10;

            // 🔥 مكافآت إضافية
            $bonusScore = $this->calculateBonusScore($assignment, $order_priority, $required_completion_time);
            $score += $bonusScore;

            // 🚫 خصومات
            $penalties = $this->calculatePenalties($assignment);
            $score -= $penalties;

            $assignment->calculated_score = round($score, 2);
            return $assignment;

        })->sortByDesc('calculated_score');
    }

    /**
     * 🟢 الحصول على العمال المتاحين
     */
    private function getAvailableWorkersForStage($stage_id)
    {
        return WorkerStageAssignment::where('stage_id', $stage_id)
            ->where('is_active', true)
            ->whereIn('availability_status', ['available', 'on_break'])
            ->with(['worker'])
            ->get()
            ->filter(function ($assignment) {
                // فلترة إضافية للتأكد من عدم تجاوز الحد الأقصى للمهام
                $currentTasks = OrderWorkflowProgress::where('assigned_worker_id', $assignment->worker_id)
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->count();
                
                return $currentTasks < $assignment->max_concurrent_tasks;
            });
    }

    /**
     * 📈 حساب نقاط الأداء الحديث
     */
    private function getRecentPerformanceScore($worker_id, $stage_id)
    {
        $cacheKey = "performance_score_{$worker_id}_{$stage_id}";
        
        return Cache::remember($cacheKey, 300, function () use ($worker_id, $stage_id) {
            $recentMetrics = WorkerPerformanceMetric::where('worker_id', $worker_id)
                ->where('stage_id', $stage_id)
                ->whereDate('performance_date', '>=', now()->subDays(7))
                ->get();

            if ($recentMetrics->isEmpty()) {
                return 70; // نقاط افتراضية للعمال الجدد
            }

            $avgQuality = $recentMetrics->avg('quality_score_average');
            $avgSpeed = $recentMetrics->avg('speed_efficiency');
            $avgCompletion = $recentMetrics->avg('completion_rate');

            return ($avgQuality * 10 * 0.4) + ($avgSpeed * 0.3) + ($avgCompletion * 0.3);
        });
    }

    /**
     * ⚡ حساب نقاط التوفر
     */
    private function calculateAvailabilityScore($assignment)
    {
        $score = 100;

        // خصم نقاط حسب الحالة
        switch ($assignment->availability_status) {
            case 'available':
                $score = 100;
                break;
            case 'on_break':
                $score = 80; // متاح قريباً
                break;
            case 'busy':
                $score = 30; // مشغول لكن يمكن تخصيص مهمة إضافية
                break;
            default:
                $score = 0;
        }

        // مكافأة للعمال الأساسيين
        if ($assignment->is_primary_assignment) {
            $score += 15;
        }

        // مكافأة لمن يمكنهم التدريب (إشراف)
        if ($assignment->can_train_others) {
            $score += 10;
        }

        return min($score, 100);
    }

    /**
     * 🎓 حساب نقاط الخبرة
     */
    private function calculateExperienceScore($assignment)
    {
        $score = 0;

        // نقاط المهارة
        $skillScores = [
            'beginner' => 50,
            'intermediate' => 70,
            'expert' => 90,
            'master' => 100
        ];
        $score += $skillScores[$assignment->skill_level] ?? 60;

        // نقاط الخبرة بالأشهر
        $experienceBonus = min($assignment->experience_months / 12 * 10, 20); // حد أقصى 20 نقطة
        $score += $experienceBonus;

        // مكافأة المهام المكتملة
        $completionBonus = min($assignment->completed_tasks_count / 100 * 15, 15); // حد أقصى 15 نقطة
        $score += $completionBonus;

        return min($score, 100);
    }

    /**
     * 🔥 حساب النقاط الإضافية
     */
    private function calculateBonusScore($assignment, $order_priority, $required_completion_time)
    {
        $bonus = 0;

        // مكافأة للطلبيات العاجلة
        if ($order_priority === 'urgent' && $assignment->efficiency_rating > 1.2) {
            $bonus += 25;
        } elseif ($order_priority === 'high' && $assignment->efficiency_rating > 1.0) {
            $bonus += 15;
        }

        // مكافأة الحضور المثالي
        if ($this->hasPerfectAttendanceThisWeek($assignment->worker_id)) {
            $bonus += 10;
        }

        // مكافأة عدم وجود أخطاء جودة
        if ($this->hasZeroDefectsThisWeek($assignment->worker_id, $assignment->stage_id)) {
            $bonus += 15;
        }

        // مكافأة إكمال المهام في الوقت المحدد
        if ($this->isConsistentlyOnTime($assignment->worker_id, $assignment->stage_id)) {
            $bonus += 12;
        }

        return $bonus;
    }

    /**
     * 🚫 حساب الخصومات
     */
    private function calculatePenalties($assignment)
    {
        $penalties = 0;

        // خصم للتأخير المتكرر
        if ($this->hasRecentDelays($assignment->worker_id)) {
            $penalties += 20;
        }

        // خصم لمشاكل الجودة
        if ($this->hasQualityIssues($assignment->worker_id, $assignment->stage_id)) {
            $penalties += 25;
        }

        // خصم لكثرة المهام الحالية
        $currentTasks = OrderWorkflowProgress::where('assigned_worker_id', $assignment->worker_id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->count();
        
        if ($currentTasks >= $assignment->max_concurrent_tasks * 0.8) {
            $penalties += 15; // مشغول نسبياً
        }

        return $penalties;
    }

    /**
     * 📊 توزيع العمال تلقائياً على المراحل
     */
    public function autoDistributeWorkers()
    {
        $stages = WorkflowStage::active()->get();
        $results = [];

        foreach ($stages as $stage) {
            // الحصول على الطلبيات المعلقة
            $pendingOrders = OrderWorkflowProgress::where('stage_id', $stage->id)
                ->where('status', 'pending')
                ->orderBy('priority')
                ->orderBy('due_date')
                ->limit(10) // معالجة 10 طلبيات في المرة الواحدة
                ->get();

            $assignedCount = 0;
            foreach ($pendingOrders as $orderProgress) {
                $optimalWorker = $this->findOptimalWorker(
                    $stage->id,
                    $orderProgress->priority,
                    $orderProgress->due_date
                );

                if ($optimalWorker) {
                    // تخصيص العامل
                    $orderProgress->update([
                        'assigned_worker_id' => $optimalWorker->worker_id,
                        'status' => 'assigned',
                        'assigned_at' => now()
                    ]);

                    // تحديث حالة العامل
                    WorkerStageAssignment::where('id', $optimalWorker->id)->update([
                        'availability_status' => 'busy',
                        'availability_updated_at' => now()
                    ]);

                    $assignedCount++;
                }
            }

            $results[] = [
                'stage' => $stage->display_name,
                'pending_orders' => $pendingOrders->count(),
                'assigned_orders' => $assignedCount
            ];
        }

        return $results;
    }

    /**
     * 🔄 إعادة توازن الأحمال
     */
    public function rebalanceWorkload()
    {
        $overloadedWorkers = $this->getOverloadedWorkers();
        $underutilizedWorkers = $this->getUnderutilizedWorkers();

        $rebalanced = 0;

        foreach ($overloadedWorkers as $overloaded) {
            // البحث عن عامل أقل تحميلاً في نفس المرحلة
            $alternative = $underutilizedWorkers->where('stage_id', $overloaded->stage_id)->first();
            
            if ($alternative) {
                // نقل مهمة واحدة
                $taskToMove = OrderWorkflowProgress::where('assigned_worker_id', $overloaded->worker_id)
                    ->where('status', 'assigned')
                    ->orderBy('due_date', 'desc') // الأقل أولوية
                    ->first();

                if ($taskToMove) {
                    $taskToMove->update([
                        'assigned_worker_id' => $alternative->worker_id,
                        'assigned_at' => now()
                    ]);
                    $rebalanced++;
                }
            }
        }

        return [
            'rebalanced_tasks' => $rebalanced,
            'overloaded_workers' => $overloadedWorkers->count(),
            'underutilized_workers' => $underutilizedWorkers->count()
        ];
    }

    /**
     * 📈 العمال المحملين بشكل زائد
     */
    private function getOverloadedWorkers()
    {
        return WorkerStageAssignment::with('worker')
            ->get()
            ->filter(function ($assignment) {
                $currentTasks = OrderWorkflowProgress::where('assigned_worker_id', $assignment->worker_id)
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->count();
                
                return $currentTasks >= $assignment->max_concurrent_tasks;
            });
    }

    /**
     * 📉 العمال المستغلين بشكل أقل
     */
    private function getUnderutilizedWorkers()
    {
        return WorkerStageAssignment::with('worker')
            ->where('availability_status', 'available')
            ->get()
            ->filter(function ($assignment) {
                $currentTasks = OrderWorkflowProgress::where('assigned_worker_id', $assignment->worker_id)
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->count();
                
                return $currentTasks < ($assignment->max_concurrent_tasks * 0.5);
            });
    }

    // 🔍 دوال مساعدة لفحص الأداء
    private function hasPerfectAttendanceThisWeek($worker_id)
    {
        // سيتم ربطها بنظام الحضور
        return rand(0, 100) < 70; // 70% احتمال حضور مثالي
    }

    private function hasZeroDefectsThisWeek($worker_id, $stage_id)
    {
        return WorkerPerformanceMetric::where('worker_id', $worker_id)
            ->where('stage_id', $stage_id)
            ->whereDate('performance_date', '>=', now()->subDays(7))
            ->avg('quality_failures') == 0;
    }

    private function isConsistentlyOnTime($worker_id, $stage_id)
    {
        return WorkerPerformanceMetric::where('worker_id', $worker_id)
            ->where('stage_id', $stage_id)
            ->whereDate('performance_date', '>=', now()->subDays(7))
            ->avg('speed_efficiency') >= 95;
    }

    private function hasRecentDelays($worker_id)
    {
        return OrderWorkflowProgress::where('assigned_worker_id', $worker_id)
            ->where('completed_at', '>', 'due_date')
            ->whereDate('completed_at', '>=', now()->subDays(7))
            ->exists();
    }

    private function hasQualityIssues($worker_id, $stage_id)
    {
        return WorkerPerformanceMetric::where('worker_id', $worker_id)
            ->where('stage_id', $stage_id)
            ->whereDate('performance_date', '>=', now()->subDays(7))
            ->where('quality_score_average', '<', 7)
            ->exists();
    }

    /**
     * 📊 تقرير تفصيلي للتخصيصات
     */
    public function getAssignmentReport()
    {
        return [
            'total_workers' => Worker::where('is_active', true)->count(),
            'total_assignments' => WorkerStageAssignment::where('is_active', true)->count(),
            'workers_by_availability' => WorkerStageAssignment::select('availability_status', DB::raw('count(*) as count'))
                ->where('is_active', true)
                ->groupBy('availability_status')
                ->pluck('count', 'availability_status'),
            'tasks_by_status' => OrderWorkflowProgress::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'average_efficiency' => WorkerStageAssignment::where('is_active', true)->avg('efficiency_rating'),
            'top_performers' => WorkerStageAssignment::with('worker')
                ->where('is_active', true)
                ->orderByDesc('efficiency_rating')
                ->limit(5)
                ->get()
        ];
    }
}