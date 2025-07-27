<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Worker;
use App\Models\Product;
use App\Models\ProductionStage;
use App\Models\OrderProductionTracking;
use App\Models\MaterialTransaction;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SmartProductionService
{
    /**
     * بدء الإنتاج الذكي للطلب
     */
    public function startSmartProduction(Order $order)
    {
        DB::beginTransaction();
        
        try {
            // 1. حساب ساعات العمل المتوقعة من المنتج
            if ($order->product) {
                $order->calculateEstimatedHours();
            }
            
            // 2. تحديد المرحلة الأولى وتعيين العامل المناسب
            $order->update([
                'production_stage' => 'design',
                'status' => 'in_progress'
            ]);
            
            $designWorker = $order->assignWorkerByStage('design');
            
            // 3. إنشاء تتبع الإنتاج لكل المراحل
            $this->createProductionTracking($order);
            
            // 4. خصم المواد من المخزون إذا كانت محددة
            if ($order->product && $order->product->material_requirements) {
                $this->deductMaterials($order);
            }
            
            DB::commit();
            
            return [
                'order' => $order->load(['product', 'currentWorker', 'productionTracking']),
                'assigned_worker' => $designWorker,
                'message' => 'تم بدء الإنتاج بنجاح'
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
    
    /**
     * انتقال للمرحلة التالية
     */
    public function moveToNextStage(Order $order, $completedHours = null)
    {
        DB::beginTransaction();
        
        try {
            $currentStage = $order->production_stage;
            
            // 1. تسجيل الساعات المكتملة للمرحلة الحالية
            if ($completedHours) {
                $this->recordStageCompletion($order, $currentStage, $completedHours);
            }
            
            // 2. الانتقال للمرحلة التالية
            $moved = $order->moveToNextStage();
            
            if ($moved) {
                // 3. التعامل مع المراحل الخاصة
                $this->handleSpecialStages($order);
                
                DB::commit();
                
                return [
                    'order' => $order->load(['currentWorker']),
                    'previous_stage' => $currentStage,
                    'current_stage' => $order->production_stage,
                    'assigned_worker' => $order->currentWorker,
                    'message' => "تم الانتقال من مرحلة {$currentStage} إلى {$order->production_stage}"
                ];
            }
            
            return false;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
    
    /**
     * إنشاء تتبع الإنتاج لكل المراحل
     */
    private function createProductionTracking(Order $order)
    {
        $stages = ProductionStage::active()->ordered()->get();
        
        foreach ($stages as $stage) {
            OrderProductionTracking::create([
                'order_id' => $order->id,
                'production_stage_id' => $stage->id,
                'status' => 'pending',
                'estimated_hours' => $order->product ? $order->product->getStageHours($stage->name) : $stage->estimated_hours
            ]);
        }
    }
    
    /**
     * خصم المواد من المخزون
     */
    private function deductMaterials(Order $order)
    {
        $requirements = $order->product->material_requirements;
        
        foreach ($requirements as $materialName => $quantity) {
            // البحث عن المادة في المخزون
            $material = \App\Models\Material::where('name', 'like', "%{$materialName}%")
                ->where('quantity', '>=', $quantity)
                ->first();
                
            if ($material) {
                // خصم الكمية
                $material->decrement('quantity', $quantity);
                
                // تسجيل المعاملة
                MaterialTransaction::create([
                    'material_id' => $material->id,
                    'order_id' => $order->id,
                    'transaction_type' => 'out',
                    'quantity' => $quantity,
                    'unit_cost' => $material->unit_cost,
                    'total_cost' => $quantity * $material->unit_cost,
                    'notes' => "استخدام في إنتاج الطلب #{$order->id}"
                ]);
            }
        }
    }
    
    /**
     * تسجيل إنهاء المرحلة
     */
    private function recordStageCompletion(Order $order, $stage, $hours)
    {
        $tracking = OrderProductionTracking::where('order_id', $order->id)
            ->whereHas('productionStage', function($query) use ($stage) {
                $query->where('name', $stage);
            })
            ->first();
            
        if ($tracking) {
            $tracking->update([
                'status' => 'completed',
                'actual_hours' => $hours,
                'completed_at' => now()
            ]);
        }
    }
    
    /**
     * التعامل مع المراحل الخاصة
     */
    private function handleSpecialStages(Order $order)
    {
        switch ($order->production_stage) {
            case 'quality_check':
                $order->update(['quality_status' => 'pending']);
                break;
                
            case 'ready_for_delivery':
                $order->update([
                    'delivery_status' => 'ready',
                    'quality_status' => 'approved'
                ]);
                break;
                
            case 'completed':
                $order->update([
                    'status' => 'completed',
                    'completed_date' => now(),
                    'delivery_status' => 'delivered'
                ]);
                
                // إنشاء فاتورة البيع تلقائياً
                $this->createSaleRecord($order);
                break;
        }
    }
    
    /**
     * إنشاء سجل البيع
     */
    private function createSaleRecord(Order $order)
    {
        \App\Models\Sale::create([
            'order_id' => $order->id,
            'client_id' => $order->client_id,
            'worker_id' => $order->assigned_worker_id,
            'sale_number' => 'SALE-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
            'amount' => $order->total_cost,
            'payment_method' => 'cash',
            'status' => 'completed',
            'sale_date' => now()
        ]);
    }
    
    /**
     * الحصول على إحصائيات الإنتاج
     */
    public function getProductionStats()
    {
        $stages = ['pending', 'design', 'cutting', 'sewing', 'fitting', 'finishing', 'quality_check', 'ready_for_delivery', 'completed'];
        $stats = [];
        
        foreach ($stages as $stage) {
            $orders = Order::where('production_stage', $stage)->get();
            $workers = Worker::where('is_active', true)
                ->where(function($query) use ($stage) {
                    $query->where('specialty', $stage)
                          ->orWhereJsonContains('production_stages', $stage);
                })
                ->count();
                
            $stats[$stage] = [
                'orders' => $orders->count(),
                'tasks' => $orders->sum(function($order) {
                    return $order->productionTracking()->where('status', 'pending')->count();
                }),
                'workers' => $workers,
                'total_hours' => $orders->sum('estimated_hours'),
                'completed_hours' => $orders->sum('actual_hours')
            ];
        }
        
        return $stats;
    }
    
    /**
     * تقرير أداء العمال
     */
    public function getWorkerPerformance($workerId = null, $period = 'week')
    {
        $query = Worker::with(['productionTracking', 'attendance']);
        
        if ($workerId) {
            $query->where('id', $workerId);
        }
        
        $workers = $query->get();
        
        return $workers->map(function($worker) use ($period) {
            $dateRange = $this->getDateRange($period);
            
            $completedTasks = $worker->productionTracking()
                ->where('status', 'completed')
                ->whereBetween('completed_at', $dateRange)
                ->count();
                
            $totalHours = $worker->productionTracking()
                ->where('status', 'completed')
                ->whereBetween('completed_at', $dateRange)
                ->sum('actual_hours');
                
            $attendanceDays = $worker->attendance()
                ->whereBetween('attendance_date', $dateRange)
                ->where('status', 'present')
                ->count();
            
            return [
                'worker' => $worker,
                'completed_tasks' => $completedTasks,
                'total_hours' => $totalHours,
                'attendance_days' => $attendanceDays,
                'efficiency' => $completedTasks > 0 ? $totalHours / $completedTasks : 0
            ];
        });
    }
    
    private function getDateRange($period)
    {
        switch ($period) {
            case 'week':
                return [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()];
            case 'month':
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
            case 'year':
                return [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()];
            default:
                return [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()];
        }
    }
}
