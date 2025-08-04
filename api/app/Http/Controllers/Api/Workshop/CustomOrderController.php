<?php

namespace App\Http\Controllers\Api\Workshop;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\ProductionProgress;
use App\Models\ProductionStage;
use App\Models\QualityCheck;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CustomOrder::with(['customer:id,name,email,phone', 'assignedTo:id,name']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by assigned worker
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                  ->orWhereHas('customer', function($customerQuery) use ($search) {
                      $customerQuery->where('name', 'LIKE', "%{$search}%")
                                   ->orWhere('email', 'LIKE', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders,
            'message' => 'Custom orders retrieved successfully'
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'product_type' => 'required|string',
            'measurements' => 'required|array',
            'design_specifications' => 'required|array',
            'fabric_type' => 'nullable|string',
            'fabric_color' => 'nullable|string',
            'custom_features' => 'nullable|array',
            'special_instructions' => 'nullable|string',
            'reference_images' => 'nullable|array',
            'estimated_completion_date' => 'nullable|date',
            'priority' => 'nullable|in:low,normal,high,urgent'
        ]);

        $orderNumber = 'CO-' . date('Y') . '-' . str_pad(CustomOrder::count() + 1, 6, '0', STR_PAD_LEFT);

        $customOrder = CustomOrder::create([
            'order_number' => $orderNumber,
            'customer_id' => $request->customer_id,
            'product_id' => $request->product_id,
            'product_type' => $request->product_type,
            'fabric_type' => $request->fabric_type,
            'fabric_color' => $request->fabric_color,
            'measurements' => $request->measurements,
            'design_specifications' => $request->design_specifications,
            'custom_features' => $request->custom_features,
            'special_instructions' => $request->special_instructions,
            'reference_images' => $request->reference_images,
            'estimated_completion_date' => $request->estimated_completion_date,
            'priority' => $request->priority ?? 'normal',
            'status' => 'pending_quote',
            'created_by' => auth()->id()
        ]);

        // Create production stages for this order
        $stages = ProductionStage::where('is_active', true)
                                ->orderBy('order_sequence')
                                ->get();

        foreach ($stages as $stage) {
            ProductionProgress::create([
                'custom_order_id' => $customOrder->id,
                'production_stage_id' => $stage->id,
                'status' => 'pending'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $customOrder->load(['customer', 'productionProgress.productionStage']),
            'message' => 'Custom order created successfully'
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $customOrder = CustomOrder::with([
            'customer:id,name,email,phone',
            'assignedTo:id,name',
            'createdBy:id,name',
            'productionProgress.productionStage',
            'productionProgress.assignedTo:id,name',
            'qualityChecks.checkedBy:id,name',
            'materialUsage.product:id,name,sku',
            'customerCommunications.handledBy:id,name'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customOrder,
            'message' => 'Custom order details retrieved successfully'
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $customOrder = CustomOrder::findOrFail($id);

        $request->validate([
            'status' => 'nullable|in:pending_quote,quoted,confirmed,in_production,quality_check,completed,delivered,cancelled',
            'quoted_price' => 'nullable|numeric|min:0',
            'final_price' => 'nullable|numeric|min:0',
            'estimated_completion_date' => 'nullable|date',
            'promised_delivery_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'notes' => 'nullable|string'
        ]);

        $customOrder->update($request->only([
            'status', 'quoted_price', 'final_price', 'estimated_completion_date',
            'promised_delivery_date', 'assigned_to', 'priority', 'notes'
        ]));

        return response()->json([
            'success' => true,
            'data' => $customOrder->fresh(['customer', 'assignedTo']),
            'message' => 'Custom order updated successfully'
        ]);
    }

    public function updateProductionStage(Request $request, $id): JsonResponse
    {
        $request->validate([
            'stage_id' => 'required|exists:production_stages,id',
            'status' => 'required|in:pending,in_progress,completed,on_hold,skipped',
            'notes' => 'nullable|string',
            'progress_images' => 'nullable|array'
        ]);

        $customOrder = CustomOrder::findOrFail($id);
        
        $progress = ProductionProgress::where('custom_order_id', $id)
                                    ->where('production_stage_id', $request->stage_id)
                                    ->firstOrFail();

        $updateData = [
            'status' => $request->status,
            'notes' => $request->notes,
            'progress_images' => $request->progress_images
        ];

        if ($request->status === 'in_progress' && !$progress->started_at) {
            $updateData['started_at'] = now();
            $updateData['assigned_to'] = auth()->id();
        }

        if ($request->status === 'completed' && !$progress->completed_at) {
            $updateData['completed_at'] = now();
            if ($progress->started_at) {
                $updateData['actual_duration_minutes'] = now()->diffInMinutes($progress->started_at);
            }
        }

        $progress->update($updateData);

        // Check if all stages are completed to update order status
        $allStagesCompleted = ProductionProgress::where('custom_order_id', $id)
                                              ->where('status', '!=', 'completed')
                                              ->where('status', '!=', 'skipped')
                                              ->count() === 0;

        if ($allStagesCompleted && $customOrder->status === 'in_production') {
            $customOrder->update(['status' => 'quality_check']);
        }

        return response()->json([
            'success' => true,
            'data' => $progress->fresh(['productionStage', 'assignedTo']),
            'message' => 'Production stage updated successfully'
        ]);
    }

    public function addQualityCheck(Request $request, $id): JsonResponse
    {
        $request->validate([
            'check_points' => 'required|array',
            'overall_status' => 'required|in:passed,failed,needs_rework',
            'issues_found' => 'nullable|string',
            'corrective_actions' => 'nullable|string',
            'quality_images' => 'nullable|array'
        ]);

        $customOrder = CustomOrder::findOrFail($id);

        $qualityCheck = QualityCheck::create([
            'custom_order_id' => $id,
            'checked_by' => auth()->id(),
            'check_points' => $request->check_points,
            'overall_status' => $request->overall_status,
            'issues_found' => $request->issues_found,
            'corrective_actions' => $request->corrective_actions,
            'quality_images' => $request->quality_images,
            'checked_at' => now()
        ]);

        // Update order status based on quality check
        if ($request->overall_status === 'passed') {
            $customOrder->update(['status' => 'completed']);
        } elseif ($request->overall_status === 'needs_rework') {
            $customOrder->update(['status' => 'in_production']);
        }

        return response()->json([
            'success' => true,
            'data' => $qualityCheck->load('checkedBy:id,name'),
            'message' => 'Quality check added successfully'
        ]);
    }

    public function getProductionDashboard(): JsonResponse
    {
        $stats = [
            'total_orders' => CustomOrder::count(),
            'pending_quote' => CustomOrder::where('status', 'pending_quote')->count(),
            'in_production' => CustomOrder::where('status', 'in_production')->count(),
            'quality_check' => CustomOrder::where('status', 'quality_check')->count(),
            'completed_today' => CustomOrder::where('status', 'completed')
                                           ->whereDate('updated_at', today())
                                           ->count(),
            'overdue_orders' => CustomOrder::where('promised_delivery_date', '<', now())
                                          ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
                                          ->count(),
            'urgent_orders' => CustomOrder::where('priority', 'urgent')
                                         ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
                                         ->with(['customer:id,name', 'assignedTo:id,name'])
                                         ->get(),
            'recent_orders' => CustomOrder::with(['customer:id,name', 'assignedTo:id,name'])
                                         ->latest()
                                         ->limit(10)
                                         ->get(),
            'worker_workload' => CustomOrder::selectRaw('assigned_to, COUNT(*) as order_count')
                                           ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
                                           ->whereNotNull('assigned_to')
                                           ->with('assignedTo:id,name')
                                           ->groupBy('assigned_to')
                                           ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Production dashboard data retrieved successfully'
        ]);
    }

    public function assignWorker(Request $request, $id): JsonResponse
    {
        $request->validate([
            'worker_id' => 'required|exists:users,id'
        ]);

        $customOrder = CustomOrder::findOrFail($id);
        $customOrder->update(['assigned_to' => $request->worker_id]);

        return response()->json([
            'success' => true,
            'data' => $customOrder->fresh(['assignedTo:id,name']),
            'message' => 'Worker assigned successfully'
        ]);
    }

    public function getWorkflowStages(): JsonResponse
    {
        $stages = ProductionStage::where('is_active', true)
                                ->orderBy('order_sequence')
                                ->get();

        return response()->json([
            'success' => true,
            'data' => $stages,
            'message' => 'Production stages retrieved successfully'
        ]);
    }
}