<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with([
            'client', 
            'worker', 
            'category', 
            'tasks', 
            'materials',
            'productionTracking.productionStage'
        ])->get();
        
        // Transform orders to include dynamic status based on production stage
        $transformedOrders = $orders->map(function ($order) {
            return $this->transformOrderWithProductionStatus($order);
        });
        
        return response()->json($transformedOrders);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'assigned_worker_id' => 'nullable|exists:workers,id',
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'total_cost' => 'nullable|numeric|min:0',
            'specifications' => 'nullable|array',
        ]);

        $order = Order::create($request->all());
        return response()->json($order->load(['client', 'worker', 'category']), 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['client', 'worker', 'category', 'tasks', 'materials', 'measurements', 'invoices']));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'assigned_worker_id' => 'nullable|exists:workers,id',
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed,cancelled',
            'priority' => 'in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'completed_date' => 'nullable|date',
            'total_cost' => 'nullable|numeric|min:0',
            'specifications' => 'nullable|array',
        ]);

        $order->update($request->all());
        return response()->json($order->load(['client', 'worker', 'category']));
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function assignWorker(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id',
        ]);

        $order->update(['assigned_worker_id' => $request->worker_id]);
        return response()->json($order->load('worker'));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
        ]);

        $order->update([
            'status' => $request->status,
            'completed_date' => $request->status === 'completed' ? now() : null,
        ]);

        return response()->json($order);
    }

    public function getByClient($client_id): JsonResponse
    {
        $orders = Order::where('client_id', $client_id)
            ->with(['client', 'worker', 'materials'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }
    
    /**
     * Transform order with dynamic status based on production stage
     */
    private function transformOrderWithProductionStatus($order): array
    {
        $orderArray = $order->toArray();
        
        // Get current production stage
        $currentStage = $order->productionTracking()
            ->where('status', 'in_progress')
            ->with('productionStage')
            ->first();
        
        // Get completed stages count
        $completedStages = $order->productionTracking()
            ->where('status', 'completed')
            ->count();
            
        // Get total stages count
        $totalStages = $order->productionTracking()->count();
        
        // Determine dynamic status based on production state
        if ($order->status === 'completed') {
            $orderArray['dynamic_status'] = 'completed';
            $orderArray['dynamic_status_ar'] = 'مكتمل';
            $orderArray['current_stage_name'] = 'Completed';
            $orderArray['current_stage_name_ar'] = 'مكتمل';
        } elseif ($order->status === 'cancelled') {
            $orderArray['dynamic_status'] = 'cancelled';
            $orderArray['dynamic_status_ar'] = 'ملغي';
            $orderArray['current_stage_name'] = 'Cancelled';
            $orderArray['current_stage_name_ar'] = 'ملغي';
        } elseif ($currentStage && $currentStage->productionStage) {
            // Currently in a specific production stage
            $orderArray['dynamic_status'] = 'in_stage';
            $orderArray['dynamic_status_ar'] = 'في المرحلة';
            $orderArray['current_stage_name'] = $currentStage->productionStage->name;
            $orderArray['current_stage_name_ar'] = $currentStage->productionStage->name;
            $orderArray['current_stage_id'] = $currentStage->productionStage->id;
            $orderArray['stage_progress'] = $totalStages > 0 ? round(($completedStages / $totalStages) * 100) : 0;
        } elseif ($completedStages > 0 && $totalStages > 0) {
            // Between stages (last stage completed, next not started)
            $orderArray['dynamic_status'] = 'between_stages';
            $orderArray['dynamic_status_ar'] = 'بين المراحل';
            $orderArray['current_stage_name'] = 'Moving to next stage';
            $orderArray['current_stage_name_ar'] = 'الانتقال للمرحلة التالية';
            $orderArray['stage_progress'] = round(($completedStages / $totalStages) * 100);
        } elseif ($order->status === 'pending') {
            $orderArray['dynamic_status'] = 'pending';
            $orderArray['dynamic_status_ar'] = 'في الانتظار';
            $orderArray['current_stage_name'] = 'Waiting to start';
            $orderArray['current_stage_name_ar'] = 'في انتظار البدء';
            $orderArray['stage_progress'] = 0;
        } else {
            // Default fallback
            $orderArray['dynamic_status'] = $order->status;
            $orderArray['dynamic_status_ar'] = $this->translateStatus($order->status);
            $orderArray['current_stage_name'] = ucfirst($order->status);
            $orderArray['current_stage_name_ar'] = $this->translateStatus($order->status);
            $orderArray['stage_progress'] = 0;
        }
        
        // Add production tracking summary
        $orderArray['production_summary'] = [
            'total_stages' => $totalStages,
            'completed_stages' => $completedStages,
            'current_stage' => $currentStage ? [
                'id' => $currentStage->productionStage->id ?? null,
                'name' => $currentStage->productionStage->name ?? null,
                'status' => $currentStage->status ?? null
            ] : null
        ];
        
        return $orderArray;
    }
    
    /**
     * Translate basic status to Arabic
     */
    private function translateStatus(string $status): string
    {
        $translations = [
            'pending' => 'في الانتظار',
            'in_progress' => 'قيد التنفيذ',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي'
        ];
        
        return $translations[$status] ?? $status;
    }
} 