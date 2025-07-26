<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ProductionStage;
use App\Models\OrderProductionTracking;
use App\Models\MaterialTransaction;
use App\Models\Sale;
use App\Models\Attendance;
use Carbon\Carbon;

class ProductionTrackingService
{
    /**
     * Start production tracking for an order
     */
    public function startProduction(Order $order, $workerId = null)
    {
        $stages = ProductionStage::active()->ordered()->get();
        
        foreach ($stages as $stage) {
            OrderProductionTracking::create([
                'order_id' => $order->id,
                'production_stage_id' => $stage->id,
                'worker_id' => $workerId,
                'status' => 'pending'
            ]);
        }

        // Update order status
        $order->update(['status' => 'in_progress']);
        
        return $order->productionTracking;
    }

    /**
     * Start a specific production stage
     */
    public function startStage($trackingId, $workerId = null, $stationId = null)
    {
        $tracking = OrderProductionTracking::findOrFail($trackingId);
        
        $tracking->update([
            'status' => 'in_progress',
            'worker_id' => $workerId,
            'station_id' => $stationId,
            'started_at' => now()
        ]);

        // Update station status if assigned
        if ($stationId) {
            $tracking->station->update(['status' => 'busy']);
        }

        return $tracking;
    }

    /**
     * Complete a production stage
     */
    public function completeStage($trackingId)
    {
        $tracking = OrderProductionTracking::findOrFail($trackingId);
        
        $tracking->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);

        // Calculate actual hours
        $tracking->calculateActualHours();
        $tracking->save();

        // Free up station
        if ($tracking->station_id) {
            $tracking->station->update(['status' => 'available']);
        }

        // Check if all stages are completed
        $this->checkOrderCompletion($tracking->order);

        return $tracking;
    }

    /**
     * Check if order is completed
     */
    private function checkOrderCompletion(Order $order)
    {
        $pendingStages = $order->productionTracking()
            ->where('status', '!=', 'completed')
            ->count();

        if ($pendingStages === 0) {
            $order->update([
                'status' => 'completed',
                'completed_date' => now()
            ]);
        }
    }

    /**
     * Record material usage
     */
    public function recordMaterialUsage(Order $order, $materialId, $quantity, $workerId = null)
    {
        $material = \App\Models\Material::findOrFail($materialId);
        
        // Create transaction
        $transaction = MaterialTransaction::create([
            'material_id' => $materialId,
            'order_id' => $order->id,
            'worker_id' => $workerId,
            'transaction_type' => 'out',
            'quantity' => $quantity,
            'unit_cost' => $material->cost_per_unit,
            'total_cost' => $quantity * $material->cost_per_unit,
            'reference_number' => $order->title,
            'notes' => 'Material used for order production'
        ]);

        // Update material quantity
        $material->updateQuantity($quantity, 'out');

        return $transaction;
    }

    /**
     * Record sale
     */
    public function recordSale(Order $order, $amount, $paymentMethod = 'cash', $workerId = null)
    {
        return Sale::create([
            'order_id' => $order->id,
            'client_id' => $order->client_id,
            'worker_id' => $workerId,
            'sale_number' => Sale::generateSaleNumber(),
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'status' => 'completed',
            'sale_date' => now()->toDateString(),
            'sale_time' => now()->toTimeString(),
            'notes' => 'Sale completed for order: ' . $order->title
        ]);
    }

    /**
     * Record worker attendance
     */
    public function recordAttendance($workerId, $checkInTime = null, $checkOutTime = null, $deviceId = null)
    {
        $today = now()->toDateString();
        
        $attendance = Attendance::updateOrCreate(
            [
                'worker_id' => $workerId,
                'attendance_date' => $today
            ],
            [
                'check_in_time' => $checkInTime ?? now()->toTimeString(),
                'check_out_time' => $checkOutTime,
                'device_id' => $deviceId,
                'status' => 'present'
            ]
        );

        if ($checkOutTime) {
            $attendance->calculateTotalHours();
            $attendance->save();
        }

        return $attendance;
    }

    /**
     * Get production progress for an order
     */
    public function getOrderProgress(Order $order)
    {
        return $order->productionTracking()
            ->with(['productionStage', 'worker', 'station'])
            ->orderBy('production_stage_id')
            ->get()
            ->map(function ($tracking) {
                return [
                    'stage' => $tracking->productionStage->name,
                    'status' => $tracking->status,
                    'worker' => $tracking->worker ? $tracking->worker->name : null,
                    'station' => $tracking->station ? $tracking->station->name : null,
                    'started_at' => $tracking->started_at,
                    'completed_at' => $tracking->completed_at,
                    'actual_hours' => $tracking->actual_hours,
                    'estimated_hours' => $tracking->productionStage->estimated_hours
                ];
            });
    }
} 