<?php

namespace App\Http\Controllers\Api\Management;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrderWorkflowProgress;
use App\Models\WorkerPerformanceMetric;
use App\Models\DailyPerformanceSummary;
use App\Models\WorkerStageAssignment;
use App\Models\WorkflowStage;
use App\Models\Worker;
use App\Models\Order;
use App\Services\WorkflowEngine;
use App\Services\SmartWorkerAssignmentService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ManagerDashboardController extends Controller
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
     * 📊 لوحة التحكم الرئيسية للمدير
     */
    public function index(Request $request)
    {
        $date = $request->input('date', today());
        
        return response()->json([
            'success' => true,
            'dashboard' => [
                'overview' => $this->getOverviewStats($date),
                'production_flow' => $this->getProductionFlowStats($date),
                'worker_performance' => $this->getWorkerPerformanceStats($date),
                'alerts' => $this->getSystemAlerts(),
                'real_time_metrics' => $this->getRealTimeMetrics()
            ]
        ]);
    }

    /**
     * 📈 إحصائيات عامة
     */
    private function getOverviewStats($date)
    {
        $today = Carbon::parse($date);
        
        $todayStats = [
            'orders_started' => OrderWorkflowProgress::whereDate('started_at', $today)->count(),
            'orders_completed' => OrderWorkflowProgress::whereDate('completed_at', $today)
                ->where('status', 'completed')->count(),
            'stages_completed' => OrderWorkflowProgress::whereDate('completed_at', $today)->count(),
            'active_workers' => WorkerStageAssignment::whereIn('availability_status', ['available', 'busy'])->count(),
            'avg_efficiency' => WorkerPerformanceMetric::whereDate('performance_date', $today)
                ->avg('speed_efficiency') ?? 0,
            'avg_quality' => WorkerPerformanceMetric::whereDate('performance_date', $today)
                ->avg('quality_score_average') ?? 0
        ];

        return $todayStats;
    }

    /**
     * 🏭 إحصائيات تدفق الإنتاج
     */
    private function getProductionFlowStats($date)
    {
        $stages = WorkflowStage::active()->inOrder()->get();
        $stageStats = [];

        foreach ($stages as $stage) {
            $pending = OrderWorkflowProgress::where('stage_id', $stage->id)
                ->where('status', 'pending')->count();
            
            $inProgress = OrderWorkflowProgress::where('stage_id', $stage->id)
                ->where('status', 'in_progress')->count();
            
            $completedToday = OrderWorkflowProgress::where('stage_id', $stage->id)
                ->where('status', 'completed')
                ->whereDate('completed_at', $date)->count();

            $stageStats[] = [
                'stage_id' => $stage->id,
                'stage_name' => $stage->display_name,
                'pending_tasks' => $pending,
                'in_progress_tasks' => $inProgress,
                'completed_today' => $completedToday,
                'workers_assigned' => WorkerStageAssignment::where('stage_id', $stage->id)
                    ->where('is_active', true)->count()
            ];
        }

        return ['stages' => $stageStats];
    }

    /**
     * 👥 إحصائيات أداء العمال
     */
    private function getWorkerPerformanceStats($date)
    {
        $topPerformers = WorkerPerformanceMetric::whereDate('performance_date', $date)
            ->with('worker')
            ->selectRaw('worker_id, SUM(total_score) as daily_score, AVG(speed_efficiency) as avg_efficiency')
            ->groupBy('worker_id')
            ->orderByDesc('daily_score')
            ->limit(10)
            ->get()
            ->map(function ($metric) {
                return [
                    'worker_id' => $metric->worker_id,
                    'worker_name' => $metric->worker->name ?? 'غير محدد',
                    'daily_score' => round($metric->daily_score, 0),
                    'efficiency' => round($metric->avg_efficiency, 1)
                ];
            });

        return [
            'top_performers' => $topPerformers,
            'total_active_workers' => Worker::where('is_active', true)->count()
        ];
    }

    /**
     * 🚨 تنبيهات النظام
     */
    private function getSystemAlerts()
    {
        $alerts = [];

        $overdueTasks = OrderWorkflowProgress::where('due_date', '<', now())
            ->whereIn('status', ['assigned', 'in_progress'])->count();

        if ($overdueTasks > 0) {
            $alerts[] = [
                'type' => 'overdue',
                'severity' => 'urgent',
                'title' => 'مهام متأخرة',
                'message' => "{$overdueTasks} مهمة تجاوزت موعد الإنجاز"
            ];
        }

        return $alerts;
    }

    /**
     * ⚡ مقاييس فورية
     */
    private function getRealTimeMetrics()
    {
        return [
            'current_active_tasks' => OrderWorkflowProgress::whereIn('status', ['assigned', 'in_progress'])->count(),
            'workers_online' => WorkerStageAssignment::whereIn('availability_status', ['available', 'busy'])->count(),
            'orders_in_queue' => OrderWorkflowProgress::where('status', 'pending')->count(),
            'urgent_orders' => OrderWorkflowProgress::where('priority', 'urgent')
                ->whereIn('status', ['pending', 'assigned', 'in_progress'])->count()
        ];
    }

    /**
     * 🎯 تنفيذ إجراءات إدارية
     */
    public function executeAction(Request $request)
    {
        $action = $request->input('action');
        $params = $request->input('params', []);

        switch ($action) {
            case 'rebalance_workload':
                $result = $this->assignmentService->rebalanceWorkload();
                return response()->json([
                    'success' => true,
                    'message' => "تم إعادة توزيع {$result['rebalanced_tasks']} مهمة"
                ]);
            
            default:
                return response()->json(['success' => false, 'message' => 'إجراء غير معروف']);
        }
    }
}