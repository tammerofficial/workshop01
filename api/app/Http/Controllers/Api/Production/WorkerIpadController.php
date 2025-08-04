<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\WorkflowEngine;
use App\Services\SmartWorkerAssignmentService;
use App\Models\Worker;
use App\Models\WorkerStageAssignment;
use App\Models\OrderWorkflowProgress;
use App\Models\WorkflowStage;
use App\Models\Order;
use App\Models\WorkerPerformanceMetric;
use Carbon\Carbon;

class WorkerIpadController extends Controller
{
    protected $workflowEngine;
    protected $assignmentService;

    public function __construct(
        WorkflowEngine $workflowEngine,
        SmartWorkerAssignmentService $assignmentService
    ) {
        $this->workflowEngine = $workflowEngine;
        $this->assignmentService = $assignmentService;
    }

    /**
     * 📱 لوحة تحكم العامل الرئيسية (iPad)
     */
    public function workerDashboard(Request $request)
    {
        try {
            $workerId = $request->input('worker_id');
            $worker = Worker::with(['user'])->findOrFail($workerId);

            // المهام الحالية للعامل
            $currentTasks = OrderWorkflowProgress::where('assigned_worker_id', $workerId)
                ->whereIn('status', ['assigned', 'in_progress'])
                ->with(['order', 'stage'])
                ->orderBy('priority')
                ->orderBy('due_date')
                ->get();

            // المهام المكتملة اليوم
            $completedToday = OrderWorkflowProgress::where('assigned_worker_id', $workerId)
                ->where('status', 'completed')
                ->whereDate('completed_at', today())
                ->count();

            // إحصائيات الأداء اليومية
            $todayPerformance = WorkerPerformanceMetric::where('worker_id', $workerId)
                ->whereDate('performance_date', today())
                ->get();

            $avgEfficiency = $todayPerformance->avg('speed_efficiency') ?? 0;
            $avgQuality = $todayPerformance->avg('quality_score_average') ?? 0;
            $totalScore = $todayPerformance->sum('total_score') ?? 0;

            // التخصيصات النشطة للعامل
            $stageAssignments = WorkerStageAssignment::where('worker_id', $workerId)
                ->where('is_active', true)
                ->with('stage')
                ->get();

            return response()->json([
                'success' => true,
                'worker' => [
                    'id' => $worker->id,
                    'name' => $worker->name,
                    'emp_code' => $worker->employee_code,
                    'avatar' => '/assets/default-avatar.png',
                    'department' => $worker->department,
                    'shift' => $this->getCurrentShift()
                ],
                'tasks' => [
                    'current' => $currentTasks->map(function ($task) {
                        return [
                            'id' => $task->id,
                            'order_id' => $task->order_id,
                            'stage' => $task->stage->display_name,
                            'status' => $task->status,
                            'priority' => $task->priority,
                            'due_date' => $task->due_date,
                            'estimated_hours' => $task->estimated_hours,
                            'progress_percentage' => $this->calculateTaskProgress($task),
                            'can_start' => $task->status === 'assigned',
                            'can_complete' => $task->status === 'in_progress'
                        ];
                    }),
                    'completed_today' => $completedToday
                ],
                'performance' => [
                    'efficiency' => round($avgEfficiency, 1),
                    'quality' => round($avgQuality, 1),
                    'total_score' => round($totalScore, 0),
                    'rank_today' => $this->getTodayRank($workerId),
                    'streak_days' => $this->getPerformanceStreak($workerId)
                ],
                'stages' => $stageAssignments->map(function ($assignment) {
                    return [
                        'stage_name' => $assignment->stage->display_name,
                        'skill_level' => $assignment->getSkillLevelArabic(),
                        'efficiency_rating' => $assignment->efficiency_rating,
                        'is_primary' => $assignment->is_primary_assignment,
                        'current_tasks' => $assignment->getCurrentTasksCount(),
                        'max_tasks' => $assignment->max_concurrent_tasks
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحميل لوحة التحكم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ▶️ بدء مهمة (iPad Action)
     */
    public function startTask(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:order_workflow_progress,id',
            'worker_id' => 'required|exists:workers,id'
        ]);

        try {
            $task = OrderWorkflowProgress::findOrFail($request->task_id);
            
            if ($task->assigned_worker_id != $request->worker_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مخول لبدء هذه المهمة'
                ], 403);
            }

            $result = $this->workflowEngine->startStageWork(
                $task->order_id,
                $request->worker_id,
                $task->stage_id
            );

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في بدء المهمة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ⏹️ إنهاء مهمة (iPad Action)
     */
    public function completeTask(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:order_workflow_progress,id',
            'worker_id' => 'required|exists:workers,id',
            'quality_score' => 'sometimes|integer|min:1|max:10',
            'notes' => 'sometimes|string|max:500'
        ]);

        try {
            $task = OrderWorkflowProgress::findOrFail($request->task_id);
            
            if ($task->assigned_worker_id != $request->worker_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مخول لإنهاء هذه المهمة'
                ], 403);
            }

            $result = $this->workflowEngine->completeStageWork(
                $task->order_id,
                $request->worker_id,
                $task->stage_id,
                $request->quality_score,
                $request->notes
            );

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنهاء المهمة: ' . $e->getMessage()
            ], 500);
        }
    }

    // دوال مساعدة
    private function calculateTaskProgress($task)
    {
        if ($task->status === 'completed') return 100;
        if ($task->status === 'in_progress' && $task->started_at) {
            $elapsed = now()->diffInMinutes($task->started_at) / 60;
            $progress = ($elapsed / $task->estimated_hours) * 100;
            return min($progress, 95);
        }
        return 0;
    }

    private function getCurrentShift()
    {
        $hour = now()->hour;
        if ($hour >= 8 && $hour < 16) return 'الوردية الأولى';
        if ($hour >= 16 && $hour < 24) return 'الوردية الثانية';
        return 'وردية ليلية';
    }

    private function getTodayRank($workerId)
    {
        $todayScores = WorkerPerformanceMetric::whereDate('performance_date', today())
            ->selectRaw('worker_id, SUM(total_score) as daily_total')
            ->groupBy('worker_id')
            ->orderByDesc('daily_total')
            ->pluck('worker_id');

        $rank = $todayScores->search($workerId);
        return $rank !== false ? $rank + 1 : 0;
    }

    private function getPerformanceStreak($workerId)
    {
        $streak = 0;
        $date = today();
        
        for ($i = 0; $i < 30; $i++) {
            $dayMetric = WorkerPerformanceMetric::where('worker_id', $workerId)
                ->whereDate('performance_date', $date)
                ->avg('quality_score_average');
            
            if ($dayMetric >= 8) {
                $streak++;
                $date = $date->subDay();
            } else {
                break;
            }
        }
        
        return $streak;
    }
}