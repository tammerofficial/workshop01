<?php

namespace App\Services;

use App\Models\WorkflowStage;
use App\Models\WorkerStageAssignment;
use App\Models\OrderWorkflowProgress;
use App\Models\StageTransition;
use App\Models\WorkerPerformanceMetric;
use App\Models\Order;
use App\Models\Worker;
use App\Models\User;
use App\Services\RealTimeNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WorkflowEngine
{
    protected $notificationService;

    public function __construct(RealTimeNotificationService $notificationService = null)
    {
        $this->notificationService = $notificationService ?? new RealTimeNotificationService();
    }

    /**
     * 🚀 بدء طلبية جديدة في النظام
     */
    public function startOrderWorkflow($order_id, $initiated_by_user_id)
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($order_id);
            
            // الحصول على المرحلة الأولى
            $firstStage = WorkflowStage::active()
                ->inOrder()
                ->first();

            if (!$firstStage) {
                throw new \Exception('لا توجد مراحل نشطة في النظام');
            }

            // إنشاء سجل تقدم للمرحلة الأولى
            $progress = OrderWorkflowProgress::create([
                'order_id' => $order_id,
                'stage_id' => $firstStage->id,
                'status' => 'pending',
                'estimated_hours' => $firstStage->estimated_hours,
                'due_date' => now()->addHours($firstStage->estimated_hours),
                'priority' => $this->calculateOrderPriority($order)
            ]);

            // البحث عن أفضل عامل متاح
            $assignedWorker = $this->findBestAvailableWorker($firstStage->id);

            if ($assignedWorker) {
                $this->assignWorkerToStage($progress->id, $assignedWorker->id, $initiated_by_user_id);
            }

            // تسجيل بداية التدفق
            StageTransition::create([
                'order_id' => $order_id,
                'from_stage_id' => null,
                'to_stage_id' => $firstStage->id,
                'from_worker_id' => null,
                'to_worker_id' => $assignedWorker?->id,
                'authorized_by_user_id' => $initiated_by_user_id,
                'transition_type' => 'start',
                'transition_reason' => 'بداية تدفق الطلبية',
                'transition_time' => now()
            ]);

            DB::commit();

            // إرسال إشعار للعامل
            if ($assignedWorker && $firstStage->send_notifications) {
                $this->notificationService->notifyTaskAssigned($assignedWorker->id, $progress->id, [
                    'order_id' => $order_id,
                    'stage' => $firstStage->display_name,
                    'priority' => $progress->priority
                ]);
            }

            Log::info("بدء تدفق الطلبية #{$order_id} في المرحلة {$firstStage->name}");

            return [
                'success' => true,
                'message' => 'تم بدء تدفق الطلبية بنجاح',
                'progress_id' => $progress->id,
                'assigned_worker' => $assignedWorker?->name,
                'stage' => $firstStage->display_name
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("خطأ في بدء تدفق الطلبية: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'فشل في بدء تدفق الطلبية: ' . $e->getMessage()
            ];
        }
    }

    /**
     * 🎯 تخصيص عامل لمرحلة
     */
    public function assignWorkerToStage($progress_id, $worker_id, $authorized_by_user_id)
    {
        $progress = OrderWorkflowProgress::findOrFail($progress_id);
        
        // التحقق من توفر العامل
        $assignment = WorkerStageAssignment::where('worker_id', $worker_id)
            ->where('stage_id', $progress->stage_id)
            ->where('is_active', true)
            ->first();

        if (!$assignment || $assignment->availability_status !== 'available') {
            throw new \Exception('العامل غير متاح حالياً');
        }

        // تحديث حالة التقدم
        $progress->update([
            'assigned_worker_id' => $worker_id,
            'status' => 'assigned',
            'assigned_at' => now()
        ]);

        // تحديث حالة العامل
        $assignment->update([
            'availability_status' => 'busy',
            'availability_updated_at' => now()
        ]);

        return $progress;
    }

    /**
     * ▶️ بدء العمل في مرحلة (iPad Action)
     */
    public function startStageWork($order_id, $worker_id, $stage_id)
    {
        try {
            DB::beginTransaction();

            // البحث عن سجل التقدم
            $progress = OrderWorkflowProgress::where('order_id', $order_id)
                ->where('stage_id', $stage_id)
                ->where('assigned_worker_id', $worker_id)
                ->firstOrFail();

            // التحقق من الحالة
            if ($progress->status !== 'assigned') {
                throw new \Exception('لا يمكن بدء العمل في هذه المرحلة');
            }

            // تحديث حالة التقدم
            $progress->update([
                'status' => 'in_progress',
                'started_at' => now()
            ]);

            // تسجيل بداية العمل في نظام الأداء
            $this->recordPerformanceStart($worker_id, $stage_id, $order_id);

            DB::commit();

            Log::info("بدء العمل - العامل #{$worker_id} في المرحلة #{$stage_id} للطلبية #{$order_id}");

            return [
                'success' => true,
                'message' => 'تم بدء العمل بنجاح',
                'started_at' => $progress->started_at,
                'estimated_completion' => $progress->due_date
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("خطأ في بدء العمل: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'فشل في بدء العمل: ' . $e->getMessage()
            ];
        }
    }

    /**
     * ⏹️ إنهاء العمل في مرحلة (iPad Action)
     */
    public function completeStageWork($order_id, $worker_id, $stage_id, $quality_score = null, $notes = null)
    {
        try {
            DB::beginTransaction();

            // البحث عن سجل التقدم
            $progress = OrderWorkflowProgress::where('order_id', $order_id)
                ->where('stage_id', $stage_id)
                ->where('assigned_worker_id', $worker_id)
                ->firstOrFail();

            if ($progress->status !== 'in_progress') {
                throw new \Exception('لا يمكن إنهاء العمل في هذه المرحلة');
            }

            // حساب الوقت الفعلي
            $actualHours = now()->diffInMinutes($progress->started_at) / 60;
            $efficiency = ($progress->estimated_hours / $actualHours) * 100;

            // تحديث حالة التقدم
            $progress->update([
                'status' => 'completed',
                'completed_at' => now(),
                'actual_hours' => $actualHours,
                'efficiency_percentage' => $efficiency,
                'quality_score' => $quality_score ?? 8,
                'work_notes' => $notes,
                'quality_approved' => true
            ]);

            // تسجيل الأداء
            $this->recordPerformanceCompletion($worker_id, $stage_id, $order_id, $actualHours, $efficiency, $quality_score);

            // تحرير العامل
            WorkerStageAssignment::where('worker_id', $worker_id)
                ->where('stage_id', $stage_id)
                ->update([
                    'availability_status' => 'available',
                    'availability_updated_at' => now(),
                    'completed_tasks_count' => DB::raw('completed_tasks_count + 1'),
                    'last_task_completed_at' => now()
                ]);

            // الانتقال للمرحلة التالية تلقائياً
            $nextStageResult = $this->moveToNextStage($order_id, $stage_id, $worker_id);

            DB::commit();

            Log::info("إكمال العمل - العامل #{$worker_id} في المرحلة #{$stage_id} للطلبية #{$order_id}");

            return [
                'success' => true,
                'message' => 'تم إكمال العمل بنجاح',
                'actual_hours' => $actualHours,
                'efficiency' => round($efficiency, 2),
                'next_stage' => $nextStageResult
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("خطأ في إكمال العمل: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'فشل في إكمال العمل: ' . $e->getMessage()
            ];
        }
    }

    /**
     * ⏭️ الانتقال للمرحلة التالية
     */
    private function moveToNextStage($order_id, $current_stage_id, $current_worker_id)
    {
        $currentStage = WorkflowStage::findOrFail($current_stage_id);
        $nextStage = $currentStage->getNextStage();

        if (!$nextStage) {
            // الطلبية مكتملة
            Order::where('id', $order_id)->update([
                'status' => 'completed',
                'completed_at' => now()
            ]);

            return [
                'is_final_stage' => true,
                'message' => 'تم إكمال الطلبية بالكامل'
            ];
        }

        // إنشاء مرحلة جديدة
        $newProgress = OrderWorkflowProgress::create([
            'order_id' => $order_id,
            'stage_id' => $nextStage->id,
            'status' => 'pending',
            'estimated_hours' => $nextStage->estimated_hours,
            'due_date' => now()->addHours($nextStage->estimated_hours)
        ]);

        // البحث عن أفضل عامل للمرحلة التالية
        $nextWorker = $this->findBestAvailableWorker($nextStage->id);

        if ($nextWorker) {
            $this->assignWorkerToStage($newProgress->id, $nextWorker->id, $current_worker_id);

            // إشعار العامل الجديد
            if ($nextStage->send_notifications) {
                $this->sendWorkerNotification($nextWorker->id, 'تم تخصيص طلبية جديدة لك', Order::find($order_id));
            }
        }

        // تسجيل الانتقال
        StageTransition::create([
            'order_id' => $order_id,
            'from_stage_id' => $current_stage_id,
            'to_stage_id' => $nextStage->id,
            'from_worker_id' => $current_worker_id,
            'to_worker_id' => $nextWorker?->id,
            'authorized_by_user_id' => $current_worker_id,
            'transition_type' => 'normal',
            'transition_reason' => 'انتقال تلقائي للمرحلة التالية',
            'transition_time' => now()
        ]);

        return [
            'is_final_stage' => false,
            'next_stage' => $nextStage->display_name,
            'assigned_to' => $nextWorker?->name ?? 'لم يتم التخصيص بعد',
            'estimated_hours' => $nextStage->estimated_hours
        ];
    }

    /**
     * 🔍 البحث عن أفضل عامل متاح
     */
    private function findBestAvailableWorker($stage_id)
    {
        return WorkerStageAssignment::where('stage_id', $stage_id)
            ->where('is_active', true)
            ->where('availability_status', 'available')
            ->with('worker')
            ->orderByDesc('efficiency_rating')
            ->orderByDesc('experience_months')
            ->orderBy('completed_tasks_count')
            ->first()?->worker;
    }

    /**
     * 📊 تسجيل بداية الأداء
     */
    private function recordPerformanceStart($worker_id, $stage_id, $order_id)
    {
        $today = today();
        
        WorkerPerformanceMetric::updateOrCreate(
            [
                'worker_id' => $worker_id,
                'stage_id' => $stage_id,
                'performance_date' => $today
            ],
            [
                'tasks_assigned' => DB::raw('tasks_assigned + 1')
            ]
        );
    }

    /**
     * 🏆 تسجيل إكمال الأداء
     */
    private function recordPerformanceCompletion($worker_id, $stage_id, $order_id, $actual_hours, $efficiency, $quality_score)
    {
        $today = today();
        
        $metric = WorkerPerformanceMetric::where('worker_id', $worker_id)
            ->where('stage_id', $stage_id)
            ->where('performance_date', $today)
            ->first();

        if ($metric) {
            $newCompletedCount = $metric->tasks_completed + 1;
            $newAvgTime = (($metric->average_task_time * $metric->tasks_completed) + ($actual_hours * 60)) / $newCompletedCount;
            $newQualityAvg = (($metric->quality_score_average * $metric->tasks_completed) + ($quality_score ?? 8)) / $newCompletedCount;
            
            $metric->update([
                'tasks_completed' => $newCompletedCount,
                'completion_rate' => ($newCompletedCount / $metric->tasks_assigned) * 100,
                'average_task_time' => $newAvgTime,
                'quality_score_average' => $newQualityAvg,
                'speed_efficiency' => $efficiency,
                'productivity_score' => $this->calculateProductivityScore($efficiency, $newQualityAvg),
                'total_score' => $this->calculateTotalScore($metric, $efficiency, $newQualityAvg)
            ]);
        }
    }

    /**
     * 📱 إرسال إشعار للعامل
     */
    private function sendWorkerNotification($worker_id, $message, $order)
    {
        // سيتم ربطها بنظام الإشعارات في Phase 5
        Log::info("إشعار للعامل #{$worker_id}: {$message} - الطلبية #{$order->id}");
    }

    /**
     * 🎯 حساب درجة الإنتاجية
     */
    private function calculateProductivityScore($efficiency, $quality)
    {
        return ($efficiency * 0.6) + ($quality * 10 * 0.4);
    }

    /**
     * 🏆 حساب النقاط الإجمالية
     */
    private function calculateTotalScore($metric, $efficiency, $quality)
    {
        $baseScore = ($efficiency * 0.4) + ($quality * 10 * 0.4) + ($metric->completion_rate * 0.2);
        
        // مكافآت إضافية
        $bonus = 0;
        if ($efficiency > 120) $bonus += 10; // سرعة فائقة
        if ($quality >= 9) $bonus += 15; // جودة ممتازة
        if ($metric->completion_rate >= 95) $bonus += 5; // إكمال عالي
        
        return $baseScore + $bonus;
    }

    /**
     * 📈 حساب أولوية الطلبية
     */
    private function calculateOrderPriority($order)
    {
        // سيتم تطويرها بناءً على عوامل مختلفة
        return 'normal';
    }

    /**
     * 📊 الحصول على إحصائيات الأداء اليومية
     */
    public function getDailyPerformanceStats($date = null)
    {
        $date = $date ?? today();
        
        return [
            'orders_in_progress' => OrderWorkflowProgress::whereDate('started_at', $date)
                ->where('status', 'in_progress')
                ->count(),
            
            'orders_completed' => OrderWorkflowProgress::whereDate('completed_at', $date)
                ->where('status', 'completed')
                ->count(),
            
            'average_efficiency' => WorkerPerformanceMetric::whereDate('performance_date', $date)
                ->avg('speed_efficiency'),
            
            'top_performers' => WorkerPerformanceMetric::whereDate('performance_date', $date)
                ->with('worker')
                ->orderByDesc('total_score')
                ->limit(5)
                ->get()
        ];
    }
}