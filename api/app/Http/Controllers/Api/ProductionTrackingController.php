<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderProductionTracking;
use App\Models\ProductionStage;
use App\Models\Material;
use App\Models\Worker;
use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductionTrackingController extends Controller
{
    /**
     * Get all orders with their production tracking details
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with([
            'client',
            'worker', 
            'category',
            'productionTracking.productionStage',
            'productionTracking.worker',
            'productionTracking.station',
            'materials'
        ]);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('client', function($clientQuery) use ($search) {
                      $clientQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Transform orders to include production tracking details
        $ordersWithTracking = $orders->map(function ($order) {
            return $this->transformOrderWithTracking($order);
        });

        return response()->json([
            'data' => $ordersWithTracking,
            'statistics' => $this->getOrdersStatistics($orders)
        ]);
    }

    /**
     * Get production tracking details for a specific order
     */
    public function show(Order $order): JsonResponse
    {
        $order->load([
            'client',
            'worker', 
            'category',
            'productionTracking.productionStage',
            'productionTracking.worker',
            'productionTracking.station',
            'materials',
            'materialTransactions.material'
        ]);

        $trackingDetails = $this->transformOrderWithTracking($order);
        
        return response()->json($trackingDetails);
    }

    /**
     * Update production stage status
     */
    public function updateStageStatus(Request $request, $trackingId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,paused',
            'actual_hours' => 'nullable|numeric|min:0',
            'quality_score' => 'nullable|integer|min:1|max:10',
            'notes' => 'nullable|string|max:1000',
            'worker_id' => 'nullable|exists:workers,id'
        ]);

        $tracking = OrderProductionTracking::findOrFail($trackingId);
        
        $updateData = [
            'status' => $request->status,
            'notes' => $request->notes,
            'actual_hours' => $request->actual_hours,
            'quality_score' => $request->quality_score
        ];

        if ($request->worker_id) {
            $updateData['worker_id'] = $request->worker_id;
        }

        // Set timestamps based on status
        if ($request->status === 'in_progress' && !$tracking->started_at) {
            $updateData['started_at'] = now();
        }

        if ($request->status === 'completed') {
            $updateData['completed_at'] = now();
            if (!$updateData['actual_hours'] && $tracking->started_at) {
                $updateData['actual_hours'] = $tracking->started_at->diffInHours(now());
            }
        }

        $tracking->update($updateData);

        // Update order overall status if needed
        $this->updateOrderOverallStatus($tracking->order);

        return response()->json([
            'message' => 'Production stage updated successfully',
            'tracking' => $tracking->load(['productionStage', 'worker', 'station'])
        ]);
    }

    /**
     * Initialize production stages for an order
     */
    public function initializeOrderStages(Order $order): JsonResponse
    {
        // Get all active production stages
        $stages = ProductionStage::active()->ordered()->get();
        
        // Create tracking records for each stage if they don't exist
        foreach ($stages as $stage) {
            OrderProductionTracking::firstOrCreate([
                'order_id' => $order->id,
                'production_stage_id' => $stage->id
            ], [
                'status' => 'pending',
                'worker_id' => null,
                'station_id' => null
            ]);
        }

        return response()->json([
            'message' => 'Production stages initialized successfully',
            'order' => $this->transformOrderWithTracking($order->load([
                'productionTracking.productionStage',
                'productionTracking.worker',
                'productionTracking.station'
            ]))
        ]);
    }

    /**
     * Get production statistics
     */
    public function getStatistics(): JsonResponse
    {
        $totalOrders = Order::count();
        $inProgressOrders = Order::where('status', 'in_progress')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $pendingOrders = Order::where('status', 'pending')->count();
        
        // Calculate average efficiency
        $avgEfficiency = OrderProductionTracking::whereNotNull('actual_hours')
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->join('production_stages', 'order_production_tracking.production_stage_id', '=', 'production_stages.id')
            ->selectRaw('AVG(CASE WHEN actual_hours > 0 THEN (production_stages.estimated_hours / actual_hours) * 100 ELSE 0 END) as avg_efficiency')
            ->value('avg_efficiency') ?? 0;

        // Get low stock materials count
        $lowStockMaterials = Material::whereRaw('quantity <= reorder_level')->count();

        return response()->json([
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'in_progress_orders' => $inProgressOrders,
            'completed_orders' => $completedOrders,
            'average_efficiency' => round($avgEfficiency, 1),
            'low_stock_materials' => $lowStockMaterials
        ]);
    }

    /**
     * Get alerts for production tracking
     */
    public function getAlerts(): JsonResponse
    {
        $alerts = [];

        // Low stock alerts
        $lowStockMaterials = Material::whereRaw('quantity <= reorder_level')
            ->select('id', 'name', 'quantity', 'reorder_level', 'unit')
            ->get();

        foreach ($lowStockMaterials as $material) {
            $alerts[] = [
                'id' => 'stock_' . $material->id,
                'type' => 'stock_low',
                'severity' => 'high',
                'title' => 'نقص في المخزون',
                'message' => "المادة \"{$material->name}\" منخفضة في المخزون ({$material->quantity} {$material->unit})",
                'material_id' => $material->id,
                'current_quantity' => $material->quantity,
                'reorder_level' => $material->reorder_level,
                'timestamp' => now()->toISOString()
            ];
        }

        // Production delay alerts
        $delayedOrders = Order::where('status', 'in_progress')
            ->where('due_date', '<', now())
            ->with('client')
            ->get();

        foreach ($delayedOrders as $order) {
            $alerts[] = [
                'id' => 'delay_' . $order->id,
                'type' => 'production_delay',
                'severity' => 'medium',
                'title' => 'تأخير في الإنتاج',
                'message' => "الطلبية \"{$order->title}\" متأخرة عن الموعد المحدد",
                'order_id' => $order->id,
                'client_name' => $order->client->name ?? 'غير محدد',
                'due_date' => $order->due_date,
                'timestamp' => now()->toISOString()
            ];
        }

        // Low quality alerts
        $lowQualityStages = OrderProductionTracking::where('quality_score', '<', 6)
            ->where('status', 'completed')
            ->with(['order.client', 'productionStage', 'worker'])
            ->get();

        foreach ($lowQualityStages as $stage) {
            $alerts[] = [
                'id' => 'quality_' . $stage->id,
                'type' => 'quality_low',
                'severity' => 'medium',
                'title' => 'جودة منخفضة',
                'message' => "مرحلة \"{$stage->productionStage->name}\" للطلبية \"{$stage->order->title}\" حصلت على تقييم منخفض ({$stage->quality_score}/10)",
                'order_id' => $stage->order_id,
                'stage_name' => $stage->productionStage->name,
                'quality_score' => $stage->quality_score,
                'worker_name' => $stage->worker->name ?? 'غير محدد',
                'timestamp' => $stage->updated_at->toISOString()
            ];
        }

        // Sort alerts by severity
        usort($alerts, function($a, $b) {
            $severityOrder = ['high' => 3, 'medium' => 2, 'low' => 1];
            return $severityOrder[$b['severity']] - $severityOrder[$a['severity']];
        });

        return response()->json($alerts);
    }

    /**
     * Get worker efficiency analysis
     */
    public function getWorkerAnalysis(): JsonResponse
    {
        $workerStats = DB::table('order_production_tracking')
            ->join('workers', 'order_production_tracking.worker_id', '=', 'workers.id')
            ->join('production_stages', 'order_production_tracking.production_stage_id', '=', 'production_stages.id')
            ->where('order_production_tracking.status', 'completed')
            ->whereNotNull('order_production_tracking.actual_hours')
            ->whereNotNull('order_production_tracking.quality_score')
            ->select([
                'workers.id as worker_id',
                'workers.name as worker_name',
                'production_stages.name as stage_name',
                DB::raw('COUNT(*) as completed_tasks'),
                DB::raw('AVG(CASE WHEN actual_hours > 0 AND production_stages.estimated_hours > 0 
                         THEN (production_stages.estimated_hours / actual_hours) * 100 
                         ELSE 0 END) as avg_efficiency'),
                DB::raw('AVG(quality_score) as avg_quality'),
                DB::raw('SUM(actual_hours) as total_hours_worked'),
                DB::raw('AVG(workers.hourly_rate) as avg_hourly_rate'),
                DB::raw('SUM(CASE WHEN order_production_tracking.completed_at <= (
                    SELECT due_date FROM orders WHERE orders.id = order_production_tracking.order_id
                ) THEN 1 ELSE 0 END) as on_time_count')
            ])
            ->groupBy('workers.id', 'workers.name', 'production_stages.name', 'workers.hourly_rate')
            ->get();

        $analysis = $workerStats->map(function($stat) {
            return [
                'worker_id' => $stat->worker_id,
                'worker_name' => $stat->worker_name,
                'stage_name' => $stat->stage_name,
                'completed_tasks' => $stat->completed_tasks,
                'avg_efficiency' => round($stat->avg_efficiency, 1),
                'avg_quality' => round($stat->avg_quality, 1),
                'total_hours_worked' => round($stat->total_hours_worked, 1),
                'on_time_delivery' => round(($stat->on_time_count / $stat->completed_tasks) * 100, 1),
                'cost_per_hour' => round($stat->avg_hourly_rate ?? 0, 2)
            ];
        });

        return response()->json($analysis);
    }

    /**
     * Transform order with tracking details
     */
    private function transformOrderWithTracking(Order $order): array
    {
        $stages = $order->productionTracking->map(function ($tracking) {
            return [
                'id' => $tracking->id,
                'name' => $tracking->productionStage->name ?? 'غير محدد',
                'status' => $tracking->status,
                'progress' => $this->calculateStageProgress($tracking),
                'estimated_hours' => $tracking->productionStage->estimated_hours ?? 0,
                'actual_hours' => $tracking->actual_hours ?? 0,
                'quality_score' => $tracking->quality_score,
                'notes' => $tracking->notes,
                'worker' => $tracking->worker ? [
                    'id' => $tracking->worker->id,
                    'name' => $tracking->worker->name,
                    'position' => $tracking->worker->position ?? 'عامل'
                ] : null,
                'station' => $tracking->station ? [
                    'id' => $tracking->station->id,
                    'name' => $tracking->station->name
                ] : null,
                'started_at' => $tracking->started_at?->toISOString(),
                'completed_at' => $tracking->completed_at?->toISOString(),
            ];
        });

        $overallProgress = $this->calculateOverallProgress($order->productionTracking);
        $totalEstimatedHours = $order->productionTracking->sum(fn($t) => $t->productionStage->estimated_hours ?? 0);
        $totalActualHours = $order->productionTracking->whereNotNull('actual_hours')->sum('actual_hours');
        $efficiency = $totalActualHours > 0 && $totalEstimatedHours > 0 
            ? round(($totalEstimatedHours / $totalActualHours) * 100, 1) 
            : 0;

        return [
            'id' => $order->id,
            'title' => $order->title,
            'description' => $order->description,
            'status' => $order->status,
            'priority' => $order->priority ?? 'medium',
            'overall_progress' => $overallProgress,
            'estimated_completion' => $order->due_date,
            'actual_start' => $order->start_date,
            'client' => $order->client ? [
                'id' => $order->client->id,
                'name' => $order->client->name
            ] : ['id' => 0, 'name' => 'عميل غير محدد'],
            'assignedWorker' => $order->worker ? [
                'id' => $order->worker->id,
                'name' => $order->worker->name,
                'position' => $order->worker->position ?? 'عامل'
            ] : null,
            'production_stages' => $stages,
            'total_estimated_hours' => $totalEstimatedHours,
            'total_actual_hours' => $totalActualHours,
            'efficiency_score' => $efficiency,
            'is_delayed' => $order->due_date && now()->gt($order->due_date) && $order->status !== 'completed',
            'delay_reason' => $order->is_delayed ? 'تأخير في الإنتاج' : null,
            'required_materials' => $order->materials->map(function($material) {
                return [
                    'id' => $material->id,
                    'name' => $material->name,
                    'quantity_needed' => $material->pivot->quantity_used ?? 0,
                    'unit' => $material->unit,
                    'cost_per_unit' => $material->cost_per_unit,
                    'total_cost' => ($material->pivot->quantity_used ?? 0) * $material->cost_per_unit,
                    'is_available' => $material->quantity >= ($material->pivot->quantity_used ?? 0)
                ];
            }),
            'material_cost' => $order->materials->sum(function($material) {
                return ($material->pivot->quantity_used ?? 0) * $material->cost_per_unit;
            }),
            'labor_cost' => $totalActualHours * 15, // افتراض 15 ريال/ساعة
            'created_at' => $order->created_at->toISOString(),
            'due_date' => $order->due_date
        ];
    }

    /**
     * Calculate stage progress percentage
     */
    private function calculateStageProgress($tracking): int
    {
        switch ($tracking->status) {
            case 'completed':
                return 100;
            case 'in_progress':
                if ($tracking->started_at && $tracking->productionStage->estimated_hours > 0) {
                    $hoursWorked = $tracking->started_at->diffInHours(now());
                    return min(95, round(($hoursWorked / $tracking->productionStage->estimated_hours) * 100));
                }
                return 50;
            case 'paused':
                return $tracking->actual_hours && $tracking->productionStage->estimated_hours > 0
                    ? min(95, round(($tracking->actual_hours / $tracking->productionStage->estimated_hours) * 100))
                    : 25;
            default:
                return 0;
        }
    }

    /**
     * Calculate overall order progress
     */
    private function calculateOverallProgress($trackings): int
    {
        if ($trackings->isEmpty()) return 0;
        
        $totalProgress = $trackings->sum(function($tracking) {
            return $this->calculateStageProgress($tracking);
        });
        
        return round($totalProgress / $trackings->count());
    }

    /**
     * Update order overall status based on stages
     */
    private function updateOrderOverallStatus(Order $order): void
    {
        $allStagesCompleted = $order->productionTracking()
            ->whereHas('productionStage', function($q) {
                $q->where('is_active', true);
            })
            ->where('status', '!=', 'completed')
            ->doesntExist();

        if ($allStagesCompleted) {
            $order->update([
                'status' => 'completed',
                'completed_date' => now()
            ]);
        } elseif ($order->productionTracking()->where('status', 'in_progress')->exists()) {
            $order->update(['status' => 'in_progress']);
        }
    }

    /**
     * Get statistics for orders collection
     */
    private function getOrdersStatistics($orders): array
    {
        $total = $orders->count();
        $inProgress = $orders->where('status', 'in_progress')->count();
        $completed = $orders->where('status', 'completed')->count();
        $pending = $orders->where('status', 'pending')->count();

        return [
            'total_orders' => $total,
            'pending_orders' => $pending,
            'in_progress_orders' => $inProgress,
            'completed_orders' => $completed
        ];
    }
}