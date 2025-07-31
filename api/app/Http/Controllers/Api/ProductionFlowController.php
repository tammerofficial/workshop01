<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductionStage;
use App\Models\Task;
use App\Models\Worker;
use App\Models\Station;
use App\Models\OrderProductionTracking;
use App\Services\InventoryService;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductionFlowController extends Controller
{
    protected $inventoryService;
    protected $notificationController;

    public function __construct(InventoryService $inventoryService, NotificationController $notificationController)
    {
        $this->inventoryService = $inventoryService;
        $this->notificationController = $notificationController;
    }
    /**
     * Get production flow overview with stages and orders
     */
    public function getFlow(Request $request): JsonResponse
    {
        // Get all production stages
        $stages = ProductionStage::active()->ordered()->get();
        
        // Get orders grouped by current production stage
        $flowData = [];
        $totalOrders = 0;
        $totalTasks = 0;
        $totalWorkers = Worker::where('is_active', true)->count();
        
        // Add "All Stages" summary
        $allOrders = Order::with(['client', 'worker', 'category'])->get();
        $allTasks = Task::count();
        
        $flowData[] = [
            'id' => 'all',
            'name' => 'All Stages',
            'name_ar' => 'جميع المراحل',
            'order_count' => $allOrders->count(),
            'task_count' => $allTasks,
            'worker_count' => $totalWorkers,
            'orders' => $allOrders->map(function($order) {
                return $this->transformOrderForFlow($order);
            }),
            'color' => 'blue'
        ];
        
        // Group orders by their current stage
        $ordersByStage = [];
        
        // Get all orders with their current production stage
        $allOrdersWithStages = Order::with(['client', 'worker', 'category', 'productionTracking.productionStage'])
            ->where('status', '!=', 'completed')
            ->get();
        
        // Group orders by current stage
        foreach ($allOrdersWithStages as $order) {
            $currentStage = $order->productionTracking()
                ->where('status', 'in_progress')
                ->with('productionStage')
                ->first();
            
            if ($currentStage && $currentStage->productionStage) {
                $stageId = $currentStage->productionStage->id;
                if (!isset($ordersByStage[$stageId])) {
                    $ordersByStage[$stageId] = [];
                }
                $ordersByStage[$stageId][] = $order;
            }
        }
        
        // Add each production stage
        foreach ($stages as $stage) {
            $ordersInStage = $ordersByStage[$stage->id] ?? [];
            
            // Get tasks for this stage
            $tasksInStage = Task::where('production_stage_id', $stage->id)
                               ->where('status', '!=', 'completed')
                               ->count();
            
            $flowData[] = [
                'id' => $stage->id,
                'name' => $stage->name,
                'name_ar' => $stage->name,
                'order_count' => count($ordersInStage),
                'task_count' => $tasksInStage,
                'worker_count' => $totalWorkers,
                'orders' => collect($ordersInStage)->map(function($order) {
                    return $this->transformOrderForFlow($order);
                }),
                'color' => $this->getStageColor($stage->order_sequence)
            ];
            
            $totalOrders += count($ordersInStage);
            $totalTasks += $tasksInStage;
        }
        
        // Add pending orders (not started yet)
        $pendingOrders = Order::where('status', 'pending')
                             ->with(['client', 'worker', 'category'])
                             ->get();
        
        $flowData[] = [
            'id' => 'pending',
            'name' => 'Pending',
            'name_ar' => 'في الانتظار',
            'order_count' => $pendingOrders->count(),
            'task_count' => 0,
            'worker_count' => $totalWorkers,
            'orders' => $pendingOrders->map(function($order) {
                return $this->transformOrderForFlow($order);
            }),
            'color' => 'gray'
        ];
        
        // Add completed orders
        $completedOrders = Order::where('status', 'completed')
                                ->with(['client', 'worker', 'category'])
                                ->get();
        
        $flowData[] = [
            'id' => 'completed',
            'name' => 'Completed',
            'name_ar' => 'مكتملة',
            'order_count' => $completedOrders->count(),
            'task_count' => 0,
            'worker_count' => $totalWorkers,
            'orders' => $completedOrders->map(function($order) {
                return $this->transformOrderForFlow($order);
            }),
            'color' => 'green'
        ];
        
        return response()->json([
            'stages' => $flowData,
            'summary' => [
                'total_orders' => Order::count(),
                'total_tasks' => Task::count(),
                'total_workers' => $totalWorkers,
                'active_orders' => Order::whereIn('status', ['pending', 'in_progress'])->count(),
                'completed_orders' => Order::where('status', 'completed')->count()
            ]
        ]);
    }
    
    /**
     * Move order to next stage
     */
    public function moveToNextStage(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'current_stage_id' => 'required|exists:production_stages,id',
            'worker_id' => 'nullable|exists:workers,id'
        ]);
        
        // Complete current stage
        OrderProductionTracking::where('order_id', $order->id)
            ->where('production_stage_id', $request->current_stage_id)
            ->update([
                'status' => 'completed',
                'completed_at' => now()
            ]);
        
        // Find next stage
        $currentStage = ProductionStage::find($request->current_stage_id);
        $nextStage = ProductionStage::where('order_sequence', '>', $currentStage->order_sequence)
                                   ->orderBy('order_sequence')
                                   ->first();
        
        if ($nextStage) {
            // Start next stage
            OrderProductionTracking::updateOrCreate([
                'order_id' => $order->id,
                'production_stage_id' => $nextStage->id
            ], [
                'status' => 'in_progress',
                'worker_id' => $request->worker_id,
                'started_at' => now()
            ]);
            
            $order->update(['status' => 'in_progress']);
        } else {
            // Order completed
            $order->update([
                'status' => 'completed',
                'completed_date' => now()
            ]);
        }
        
        return response()->json([
            'message' => 'Order moved to next stage successfully',
            'order' => $order->load(['client', 'worker', 'productionTracking.productionStage'])
        ]);
    }
    
    /**
     * Move order to specific stage (for drag & drop)
     */
    public function moveToStage(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'target_stage_id' => 'required|exists:production_stages,id',
            'worker_id' => 'nullable|exists:workers,id',
            'station_id' => 'nullable|exists:stations,id',
        ]);
        
        $targetStage = ProductionStage::find($request->target_stage_id);
        
        // Unassign worker/station from current stage
        $this->unassignWorkerFromCurrentStage($order);
        
        // Start target stage
        OrderProductionTracking::updateOrCreate([
            'order_id' => $order->id,
            'production_stage_id' => $targetStage->id
        ], [
            'status' => 'in_progress',
            'worker_id' => $request->worker_id,
            'station_id' => $request->station_id,
            'started_at' => now()
        ]);
        
        // Assign worker to new stage
        $this->assignWorkerToStage($request->worker_id, $request->station_id, $order->id);
        
        // Send worker assignment notification
        if ($request->worker_id) {
            $worker = Worker::find($request->worker_id);
            if ($worker) {
                $this->notificationController->sendWorkerAssignmentNotification($worker, $order, $targetStage);
            }
        }
        
        // Update order status
        $order->update(['status' => 'in_progress']);
        
        // Update order progress based on new stage
        $this->updateOrderProgress($order, $targetStage);
        
        // Reserve materials for the new stage
        try {
            $reservationResults = $this->inventoryService->reserveMaterialsForStage($order, $targetStage);
            
            if (!empty($reservationResults['failed'])) {
                Log::warning('Some materials could not be reserved', [
                    'order_id' => $order->id,
                    'stage_id' => $targetStage->id,
                    'failed_materials' => $reservationResults['failed']
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to reserve materials', [
                'order_id' => $order->id,
                'stage_id' => $targetStage->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'error' => 'Failed to reserve materials for this stage',
                'message' => $e->getMessage()
            ], 422);
        }
        
        return response()->json([
            'message' => 'Order moved to target stage successfully',
            'order' => $order->load(['client', 'worker', 'productionTracking.productionStage']),
            'target_stage' => $targetStage,
            'material_reservations' => $reservationResults ?? null
        ]);
    }
    
    /**
     * Unassign worker from current stage
     */
    private function unassignWorkerFromCurrentStage(Order $order): void
    {
        $currentStage = OrderProductionTracking::where('order_id', $order->id)
            ->where('status', 'in_progress')
            ->first();
        
        if ($currentStage) {
            if ($currentStage->worker_id) {
                $worker = Worker::find($currentStage->worker_id);
                if ($worker) {
                    $worker->update(['status' => 'available', 'current_task_id' => null]);
                }
            }
            if ($currentStage->station_id) {
                $station = Station::find($currentStage->station_id);
                if ($station) {
                    $station->update(['status' => 'available', 'current_order_id' => null]);
                }
            }
            
            // Mark current stage as completed
            $currentStage->update([
                'status' => 'completed',
                'completed_at' => now()
            ]);
            
            // Send stage completion notification
            if ($currentStage->productionStage) {
                $this->notificationController->sendStageCompletionNotification(
                    $order, 
                    $currentStage->productionStage, 
                    $currentStage->worker
                );
            }
        }
    }

    /**
     * Assign worker to a new stage
     */
    private function assignWorkerToStage(?int $workerId, ?int $stationId, int $orderId): void
    {
        if ($workerId) {
            $worker = Worker::find($workerId);
            if ($worker) {
                $worker->update(['status' => 'busy', 'current_task_id' => $orderId]);
            }
        }
        
        if ($stationId) {
            $station = Station::find($stationId);
            if ($station) {
                $station->update(['status' => 'in_use', 'current_order_id' => $orderId]);
            }
        }
    }
    
    /**
     * Update order progress based on current stage
     */
    private function updateOrderProgress(Order $order, ProductionStage $currentStage): void
    {
        $totalStages = ProductionStage::where('is_active', true)->count();
        if ($totalStages === 0) return;
        
        // Calculate progress based on current stage sequence
        $progress = ($currentStage->order_sequence / $totalStages) * 100;
        
        // You might want a more sophisticated logic here, for example:
        // - Based on completed stages vs total stages associated with the order's product
        // - Based on estimated time for completed stages vs total time
        
        $order->update(['progress' => round($progress)]);
    }
    
    /**
     * Start production for an order
     */
    public function startProduction(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'worker_id' => 'nullable|exists:workers,id'
        ]);
        
        // Initialize all production stages for this order if not exists
        $stages = ProductionStage::active()->ordered()->get();
        foreach ($stages as $stage) {
            OrderProductionTracking::firstOrCreate([
                'order_id' => $order->id,
                'production_stage_id' => $stage->id
            ], [
                'status' => 'pending',
                'worker_id' => null
            ]);
        }
        
        // Start first stage
        $firstStage = $stages->first();
        if ($firstStage) {
            OrderProductionTracking::where('order_id', $order->id)
                ->where('production_stage_id', $firstStage->id)
                ->update([
                    'status' => 'in_progress',
                    'worker_id' => $request->worker_id,
                    'started_at' => now()
                ]);
        }
        
        $order->update(['status' => 'in_progress']);
        
        return response()->json([
            'message' => 'Production started successfully',
            'order' => $order->load(['client', 'worker', 'productionTracking.productionStage'])
        ]);
    }
    
    /**
     * Get orders by stage
     */
    public function getOrdersByStage(Request $request, $stageId): JsonResponse
    {
        if ($stageId === 'all') {
            $orders = Order::with(['client', 'worker', 'category'])->get();
        } elseif ($stageId === 'pending') {
            $orders = Order::where('status', 'pending')
                          ->with(['client', 'worker', 'category'])
                          ->get();
        } elseif ($stageId === 'completed') {
            $orders = Order::where('status', 'completed')
                          ->with(['client', 'worker', 'category'])
                          ->get();
        } else {
            $orders = Order::whereHas('productionTracking', function($query) use ($stageId) {
                $query->where('production_stage_id', $stageId)
                      ->where('status', 'in_progress');
            })->with(['client', 'worker', 'category'])->get();
        }
        
        return response()->json([
            'orders' => $orders->map(function($order) {
                return $this->transformOrderForFlow($order);
            })
        ]);
    }
    
    /**
     * Get production statistics
     */
    public function getStatistics(): JsonResponse
    {
        return response()->json([
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'in_progress_orders' => Order::where('status', 'in_progress')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'total_tasks' => Task::count(),
            'pending_tasks' => Task::where('status', 'pending')->count(),
            'in_progress_tasks' => Task::where('status', 'in_progress')->count(),
            'completed_tasks' => Task::where('status', 'completed')->count(),
            'total_workers' => Worker::where('is_active', true)->count(),
            'busy_workers' => Worker::where('is_active', true)
                                   ->whereHas('productionTracking', function($query) {
                                       $query->where('status', 'in_progress');
                                   })->count()
        ]);
    }
    
    /**
     * Transform order for flow display
     */
    private function transformOrderForFlow(Order $order): array
    {
        return [
            'id' => $order->id,
            'title' => $order->title,
            'description' => $order->description,
            'status' => $order->status,
            'priority' => $order->priority ?? 'medium',
            'client' => [
                'id' => $order->client->id ?? 0,
                'name' => $order->client->name ?? 'عميل غير محدد'
            ],
            'worker' => $order->worker ? [
                'id' => $order->worker->id,
                'name' => $order->worker->name,
                'position' => $order->worker->position ?? 'عامل'
            ] : null,
            'category' => $order->category ? [
                'id' => $order->category->id,
                'name' => $order->category->name
            ] : null,
            'due_date' => $order->due_date,
            'created_at' => $order->created_at->toISOString(),
            'progress' => $this->calculateOrderProgress($order),
            'current_stage' => $this->getCurrentStage($order)
        ];
    }
    
    /**
     * Calculate order progress percentage
     */
    private function calculateOrderProgress(Order $order): int
    {
        $completedStages = OrderProductionTracking::where('order_id', $order->id)
            ->where('status', 'completed')
            ->count();
        
        $totalStages = ProductionStage::active()->count();
        
        if ($totalStages === 0) return 0;
        
        return round(($completedStages / $totalStages) * 100);
    }
    
    /**
     * Get current stage of order
     */
    private function getCurrentStage(Order $order): ?array
    {
        $currentTracking = OrderProductionTracking::where('order_id', $order->id)
            ->where('status', 'in_progress')
            ->with('productionStage')
            ->first();
        
        if (!$currentTracking || !$currentTracking->productionStage) {
            return null;
        }
        
        return [
            'id' => $currentTracking->productionStage->id,
            'name' => $currentTracking->productionStage->name,
            'order_sequence' => $currentTracking->productionStage->order_sequence
        ];
    }
    
    /**
     * Calculate stage cost including materials and labor
     */
    private function calculateStageCost(Order $order, ProductionStage $stage, ?Worker $worker, float $hoursWorked = 0): float
    {
        $materialCost = $this->calculateMaterialCost($order, $stage);
        $laborCost = $worker && $hoursWorked > 0 ? 
            ($worker->hourly_rate_kwd ?? $worker->hourly_rate ?? 0) * $hoursWorked : 0;
        
        $totalCost = $materialCost + $laborCost;
        
        // Update order's total cost
        $order->increment('total_cost', $totalCost);
        
        // Log cost calculation
        Log::info('Stage cost calculated', [
            'order_id' => $order->id,
            'stage_id' => $stage->id,
            'material_cost' => $materialCost,
            'labor_cost' => $laborCost,
            'total_stage_cost' => $totalCost,
            'worker_id' => $worker?->id,
            'hours_worked' => $hoursWorked
        ]);
        
        return $totalCost;
    }
    
    /**
     * Calculate material cost for a stage
     */
    private function calculateMaterialCost(Order $order, ProductionStage $stage): float
    {
        $materialCost = 0;
        
        // Get material reservations for this order and stage
        $reservations = \App\Models\MaterialReservation::with('material')
            ->where('order_id', $order->id)
            ->where('production_stage_id', $stage->id)
            ->get();
        
        foreach ($reservations as $reservation) {
            $usedQuantity = $reservation->quantity_used ?? $reservation->quantity_reserved;
            $unitCost = $reservation->material->cost_per_unit ?? 0;
            $materialCost += $usedQuantity * $unitCost;
        }
        
        return $materialCost;
    }
    
    /**
     * Update order's total cost automatically
     */
    private function updateOrderTotalCost(Order $order): void
    {
        // Calculate total cost from all completed stages
        $totalCost = 0;
        
        $completedStages = OrderProductionTracking::where('order_id', $order->id)
            ->where('status', 'completed')
            ->with(['productionStage', 'worker'])
            ->get();
        
        foreach ($completedStages as $tracking) {
            if ($tracking->productionStage && $tracking->worker) {
                $hoursWorked = $tracking->hours_worked ?? 
                    ($tracking->completed_at && $tracking->started_at ? 
                        $tracking->completed_at->diffInHours($tracking->started_at) : 0);
                
                $stageCost = $this->calculateStageCost(
                    $order, 
                    $tracking->productionStage, 
                    $tracking->worker, 
                    $hoursWorked
                );
                $totalCost += $stageCost;
            }
        }
        
        $order->update(['total_cost' => $totalCost]);
    }
    
    /**
     * Generate cost report for an order
     */
    public function generateCostReport(Order $order): JsonResponse
    {
        $costBreakdown = [
            'order_id' => $order->id,
            'order_title' => $order->title,
            'stages' => [],
            'totals' => [
                'material_cost' => 0,
                'labor_cost' => 0,
                'total_cost' => 0
            ]
        ];
        
        $stages = OrderProductionTracking::where('order_id', $order->id)
            ->with(['productionStage', 'worker'])
            ->get();
        
        foreach ($stages as $tracking) {
            $materialCost = $this->calculateMaterialCost($order, $tracking->productionStage);
            
            $hoursWorked = $tracking->hours_worked ?? 
                ($tracking->completed_at && $tracking->started_at ? 
                    $tracking->completed_at->diffInHours($tracking->started_at) : 0);
            
            $laborCost = $tracking->worker && $hoursWorked > 0 ? 
                ($tracking->worker->hourly_rate_kwd ?? $tracking->worker->hourly_rate ?? 0) * $hoursWorked : 0;
            
            $stageCost = $materialCost + $laborCost;
            
            $costBreakdown['stages'][] = [
                'stage_name' => $tracking->productionStage->name,
                'worker_name' => $tracking->worker?->name ?? 'غير محدد',
                'hours_worked' => $hoursWorked,
                'material_cost' => $materialCost,
                'labor_cost' => $laborCost,
                'total_stage_cost' => $stageCost,
                'status' => $tracking->status
            ];
            
            $costBreakdown['totals']['material_cost'] += $materialCost;
            $costBreakdown['totals']['labor_cost'] += $laborCost;
            $costBreakdown['totals']['total_cost'] += $stageCost;
        }
        
        return response()->json($costBreakdown);
    }

    /**
     * Get stage color based on sequence
     */
    private function getStageColor(int $sequence): string
    {
        $colors = ['blue', 'purple', 'orange', 'yellow', 'green'];
        return $colors[($sequence - 1) % count($colors)] ?? 'gray';
    }
}