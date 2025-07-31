<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Worker;
use App\Models\Material;
use App\Models\Sale;
use App\Models\Attendance;
use App\Services\ProductionTrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductionController extends Controller
{
    protected $productionService;

    public function __construct(ProductionTrackingService $productionService)
    {
        $this->productionService = $productionService;
    }

    /**
     * Start production for an order
     */
    public function startProduction(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'worker_id' => 'nullable|exists:workers,id'
        ]);

        $tracking = $this->productionService->startProduction($order, $request->worker_id);

        return response()->json([
            'message' => 'Production started successfully',
            'order' => $order->load(['client', 'worker', 'category']),
            'tracking' => $tracking
        ]);
    }

    /**
     * Start a specific production stage
     */
    public function startStage(Request $request, $trackingId): JsonResponse
    {
        $request->validate([
            'worker_id' => 'nullable|exists:workers,id',
            'station_id' => 'nullable|exists:stations,id'
        ]);

        $tracking = $this->productionService->startStage(
            $trackingId, 
            $request->worker_id, 
            $request->station_id
        );

        return response()->json([
            'message' => 'Stage started successfully',
            'tracking' => $tracking->load(['productionStage', 'worker', 'station'])
        ]);
    }

    /**
     * Complete a production stage
     */
    public function completeStage($trackingId): JsonResponse
    {
        $tracking = $this->productionService->completeStage($trackingId);

        return response()->json([
            'message' => 'Stage completed successfully',
            'tracking' => $tracking->load(['productionStage', 'worker', 'station'])
        ]);
    }

    /**
     * Record material usage
     */
    public function recordMaterialUsage(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'material_id' => 'required|exists:materials,id',
            'quantity' => 'required|numeric|min:0.01',
            'worker_id' => 'nullable|exists:workers,id'
        ]);

        $transaction = $this->productionService->recordMaterialUsage(
            $order,
            $request->material_id,
            $request->quantity,
            $request->worker_id
        );

        return response()->json([
            'message' => 'Material usage recorded successfully',
            'transaction' => $transaction->load(['material', 'worker'])
        ]);
    }

    /**
     * Record sale
     */
    public function recordSale(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,bank_transfer,check',
            'worker_id' => 'nullable|exists:workers,id'
        ]);

        $sale = $this->productionService->recordSale(
            $order,
            $request->amount,
            $request->payment_method,
            $request->worker_id
        );

        return response()->json([
            'message' => 'Sale recorded successfully',
            'sale' => $sale->load(['client', 'worker'])
        ]);
    }

    /**
     * Record worker attendance
     */
    public function recordAttendance(Request $request): JsonResponse
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i',
            'device_id' => 'nullable|string'
        ]);

        $attendance = $this->productionService->recordAttendance(
            $request->worker_id,
            $request->check_in_time,
            $request->check_out_time,
            $request->device_id
        );

        return response()->json([
            'message' => 'Attendance recorded successfully',
            'attendance' => $attendance->load('worker')
        ]);
    }

    /**
     * Get production progress for an order
     */
    public function getOrderProgress(Order $order): JsonResponse
    {
        $progress = $this->productionService->getOrderProgress($order);

        return response()->json([
            'order' => $order->load(['client', 'worker', 'category']),
            'progress' => $progress
        ]);
    }

    /**
     * Get production dashboard data
     */
    public function getDashboard(): JsonResponse
    {
        $data = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'in_progress_orders' => Order::where('status', 'in_progress')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'active_workers' => Worker::where('is_active', true)->count(),
            'available_stations' => \App\Models\Station::where('status', 'available')->count(),
            'low_stock_materials' => Material::where('quantity', '<=', \DB::raw('reorder_level'))->count(),
            'today_sales' => Sale::whereDate('sale_date', today())->sum('amount'),
            'today_attendance' => Attendance::whereDate('attendance_date', today())->count()
        ];

        return response()->json($data);
    }
} 