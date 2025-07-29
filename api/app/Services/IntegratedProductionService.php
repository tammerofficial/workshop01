<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Material;
use App\Models\MaterialReservation;
use App\Models\ProductMaterialRequirement;
use App\Models\OrderProductionTracking;
use App\Models\ProductionStage;
use App\Models\StageTimeEstimate;
use App\Models\QualityCheckResult;
use App\Models\WorkerPerformanceLog;
use App\Models\Notification;
use App\Models\SystemAlert;
use App\Models\OrderCostBreakdown;
use App\Models\MaterialTransaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IntegratedProductionService
{
    /**
     * بدء عملية الإنتاج المتكاملة
     */
    public function startIntegratedProduction(Order $order, array $specifications = [])
    {
        // التحقق مما إذا كان الإنتاج قد بدأ بالفعل
        if ($order->productionTracking()->exists()) {
            return [
                'success' => false,
                'message' => 'الإنتاج قد بدأ بالفعل لهذا الطلب.',
                'order' => $order->load(['materialReservations', 'productionTracking', 'costBreakdown']),
                'estimated_completion' => $this->calculateEstimatedCompletion($order)
            ];
        }

        DB::beginTransaction();
        
        try {
            // 1. حساب متطلبات المواد
            $materialRequirements = $this->calculateMaterialRequirements($order, $specifications);
            
            // 2. حجز المواد المطلوبة
            $this->reserveMaterials($order, $materialRequirements);
            
            // 3. إنشاء مراحل الإنتاج مع تقدير الأوقات
            $this->createProductionStages($order, $specifications);
            
            // 4. تعيين أول عامل متاح
            $this->assignInitialWorker($order);
            
            // 5. إنشاء قوائم فحص الجودة
            $this->createQualityChecklists($order);
            
            // 6. إرسال إشعارات
            $this->sendProductionStartNotifications($order);
            
            // 7. تسجيل بداية التكاليف
            $this->initializeCostTracking($order);
            
            DB::commit();
            
            return [
                'success' => true,
                'message' => 'تم بدء الإنتاج المتكامل بنجاح',
                'order' => $order->load(['materialReservations', 'productionTracking', 'costBreakdown']),
                'material_reservations' => $materialRequirements,
                'estimated_completion' => $this->calculateEstimatedCompletion($order)
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
    
    /**
     * حساب متطلبات المواد للطلب
     */
    public function calculateMaterialRequirements(Order $order, array $specifications = [])
    {
        $productType = $specifications['product_type'] ?? 'general';
        $size = $specifications['size'] ?? 'medium';
        $complexity = $specifications['complexity'] ?? 'medium';
        
        // جلب متطلبات المواد من قاعدة البيانات
        $requirements = ProductMaterialRequirement::where('product_type', $productType)
            ->where('product_size', $size)
            ->with('material')
            ->get();
        
        $materialRequirements = [];
        
        foreach ($requirements as $requirement) {
            // حساب الكمية مع نسبة الفاقد
            $baseQuantity = $requirement->required_quantity;
            $wastePercentage = $requirement->waste_percentage;
            $finalQuantity = $baseQuantity * (1 + ($wastePercentage / 100));
            
            // تعديل حسب التعقيد
            $complexityMultiplier = $this->getComplexityMultiplier($complexity);
            $finalQuantity *= $complexityMultiplier;
            
            $materialRequirements[] = [
                'material_id' => $requirement->material_id,
                'material' => $requirement->material,
                'required_quantity' => $finalQuantity,
                'cost_per_unit' => $requirement->material->cost_per_unit,
                'total_cost' => $finalQuantity * $requirement->material->cost_per_unit,
                'availability' => $this->checkMaterialAvailability($requirement->material_id, $finalQuantity)
            ];
        }
        
        return $materialRequirements;
    }
    
    /**
     * حجز المواد للطلب
     */
    public function reserveMaterials(Order $order, array $materialRequirements)
    {
        foreach ($materialRequirements as $requirement) {
            $material = Material::find($requirement['material_id']);
            
            // فحص التوفر
            if ($material->quantity < $requirement['required_quantity']) {
                throw new \Exception("المادة {$material->name} غير متوفرة بالكمية المطلوبة");
            }
            
            // إنشاء الحجز
            MaterialReservation::create([
                'order_id' => $order->id,
                'material_id' => $material->id,
                'reserved_quantity' => $requirement['required_quantity'],
                'reserved_at' => now(),
                'expires_at' => now()->addDays(7), // انتهاء الحجز بعد أسبوع
                'status' => 'active'
            ]);
            
            // تحديث الكمية المحجوزة
            $material->increment('reserved_quantity', $requirement['required_quantity']);
            
            // تسجيل معاملة المخزون
            MaterialTransaction::create([
                'material_id' => $material->id,
                'transaction_type' => 'out', // الحجز يعتبر إخراج
                'quantity' => $requirement['required_quantity'],
                'unit_cost' => $material->cost_per_unit,
                'total_cost' => $requirement['required_quantity'] * $material->cost_per_unit,
                'order_id' => $order->id,
                'notes' => "حجز للطلب رقم {$order->id}"
            ]);
        }
    }
    
    /**
     * إنشاء مراحل الإنتاج مع تقدير الأوقات
     */
    public function createProductionStages(Order $order, array $specifications = [])
    {
        $productType = $specifications['product_type'] ?? 'general';
        $complexity = $specifications['complexity'] ?? 'medium';
        
        $stages = ProductionStage::where('is_active', true)
            ->orderBy('order_sequence')
            ->get();
        
        foreach ($stages as $stage) {
            // جلب تقدير الوقت للمرحلة
            $timeEstimate = StageTimeEstimate::where('product_type', $productType)
                ->where('complexity_level', $complexity)
                ->where('production_stage_id', $stage->id)
                ->first();
            
            $estimatedMinutes = $timeEstimate ? $timeEstimate->estimated_minutes : $stage->estimated_hours * 60;
            
            OrderProductionTracking::create([
                'order_id' => $order->id,
                'production_stage_id' => $stage->id,
                'status' => 'pending',
                'estimated_minutes' => $estimatedMinutes
            ]);
        }
    }
    
    /**
     * الانتقال للمرحلة التالية
     */
    public function moveToNextStage(Order $order, $currentStageId, array $completionData = [])
    {
        DB::beginTransaction();
        
        try {
            // إكمال المرحلة الحالية
            $currentTracking = OrderProductionTracking::where('order_id', $order->id)
                ->where('production_stage_id', $currentStageId)
                ->first();
            
            if ($currentTracking) {
                $actualMinutes = $completionData['actual_minutes'] ?? 0;
                $qualityScore = $completionData['quality_score'] ?? null;
                
                $currentTracking->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'actual_hours' => $actualMinutes,
                    'notes' => $completionData['notes'] ?? null
                ]);
                
                // تسجيل أداء العامل
                if ($currentTracking->worker_id && $actualMinutes > 0) {
                    $this->recordWorkerPerformance(
                        $currentTracking->worker_id,
                        $order->id,
                        $currentStageId,
                        $currentTracking->estimated_minutes ?? 0,
                        $actualMinutes,
                        $qualityScore
                    );
                }
            }
            
            // العثور على المرحلة التالية
            $nextStage = $this->getNextStage($order, $currentStageId);
            
            if ($nextStage) {
                // بدء المرحلة التالية
                $nextTracking = OrderProductionTracking::where('order_id', $order->id)
                    ->where('production_stage_id', $nextStage->id)
                    ->first();
                
                if ($nextTracking) {
                    $nextTracking->update([
                        'status' => 'in_progress',
                        'started_at' => now(),
                        'worker_id' => $this->assignBestWorkerForStage($nextStage->id)
                    ]);
                    
                    // إرسال إشعار
                    $this->sendStageProgressNotification($order, $nextStage);
                }
            } else {
                // إكمال الطلب
                $this->completeOrder($order);
            }
            
            DB::commit();
            
            return [
                'success' => true,
                'current_stage' => $currentTracking,
                'next_stage' => $nextTracking ?? null,
                'order_completed' => !$nextStage
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
    
    /**
     * تسجيل أداء العامل
     */
    private function recordWorkerPerformance($workerId, $orderId, $stageId, $estimatedMinutes, $actualMinutes, $qualityScore = null)
    {
        $efficiencyScore = $estimatedMinutes > 0 ? ($estimatedMinutes / $actualMinutes) * 100 : 0;
        
        WorkerPerformanceLog::create([
            'worker_id' => $workerId,
            'order_id' => $orderId,
            'production_stage_id' => $stageId,
            'estimated_minutes' => $estimatedMinutes,
            'actual_minutes' => $actualMinutes,
            'efficiency_score' => $efficiencyScore,
            'quality_score' => $qualityScore,
            'completed_at' => now()
        ]);
    }
    
    /**
     * إرسال إشعارات تقدم المراحل
     */
    private function sendStageProgressNotification(Order $order, ProductionStage $stage)
    {
        Notification::create([
            'type' => 'stage_started',
            'title' => 'بدء مرحلة جديدة',
            'message' => "تم بدء مرحلة {$stage->name} للطلب رقم {$order->id}",
            'order_id' => $order->id,
            'data' => json_encode([
                'stage_name' => $stage->name,
                'order_title' => $order->title
            ])
        ]);
    }
    
    /**
     * حساب تقدير موعد الإكمال
     */
    public function calculateEstimatedCompletion(Order $order)
    {
        $totalEstimatedMinutes = OrderProductionTracking::where('order_id', $order->id)
            ->sum('estimated_minutes');
        
        // تحويل إلى ساعات عمل (8 ساعات يومياً)
        $workingHoursPerDay = 8 * 60; // دقيقة
        $estimatedDays = ceil($totalEstimatedMinutes / $workingHoursPerDay);
        
        return now()->addWeekdays($estimatedDays);
    }
    
    /**
     * فحص حالة المواد المحجوزة
     */
    public function checkReservedMaterials(Order $order)
    {
        return MaterialReservation::where('order_id', $order->id)
            ->where('status', 'active')
            ->with('material')
            ->get();
    }
    
    /**
     * إنشاء تنبيه نظام
     */
    public function createSystemAlert($type, $title, $description, $severity = 'info', $relatedData = null)
    {
        return SystemAlert::create([
            'alert_type' => $type,
            'title' => $title,
            'description' => $description,
            'severity' => $severity,
            'status' => 'active',
            'triggered_at' => now(),
            'related_data' => $relatedData ? json_encode($relatedData) : null
        ]);
    }
    
    /**
     * مراقبة المواد منخفضة المخزون
     */
    public function monitorLowStockMaterials()
    {
        $lowStockMaterials = Material::whereRaw('(quantity - reserved_quantity) <= reorder_level')
            ->where('is_active', true)
            ->get();
        
        foreach ($lowStockMaterials as $material) {
            $this->createSystemAlert(
                'material_low_stock',
                'نقص في المخزون',
                "المادة {$material->name} تحتاج إعادة طلب",
                'warning',
                ['material_id' => $material->id, 'current_quantity' => $material->quantity]
            );
        }
        
        return $lowStockMaterials;
    }
    
    // مساعدة Functions
    private function getComplexityMultiplier($complexity)
    {
        return match($complexity) {
            'simple' => 0.8,
            'medium' => 1.0,
            'complex' => 1.3,
            'very_complex' => 1.6,
            default => 1.0
        };
    }
    
    private function checkMaterialAvailability($materialId, $requiredQuantity)
    {
        $material = Material::find($materialId);
        $availableQuantity = $material->quantity - $material->reserved_quantity;
        
        return [
            'available' => $availableQuantity >= $requiredQuantity,
            'current_stock' => $material->quantity,
            'reserved' => $material->reserved_quantity,
            'available_quantity' => $availableQuantity,
            'shortage' => max(0, $requiredQuantity - $availableQuantity)
        ];
    }
    
    private function getNextStage(Order $order, $currentStageId)
    {
        $currentStage = ProductionStage::find($currentStageId);
        
        return ProductionStage::where('order_sequence', '>', $currentStage->order_sequence)
            ->where('is_active', true)
            ->orderBy('order_sequence')
            ->first();
    }
    
    private function assignBestWorkerForStage($stageId)
    {
        // منطق تعيين أفضل عامل للمرحلة
        // يمكن تطويره ليشمل تحليل الأداء والتوفر
        return null; // للتطوير المستقبلي
    }
    
    private function assignInitialWorker(Order $order)
    {
        // تعيين عامل للمرحلة الأولى
        $firstStage = OrderProductionTracking::where('order_id', $order->id)
            ->orderBy('id')
            ->first();
        
        if ($firstStage) {
            $firstStage->update([
                'status' => 'in_progress',
                'started_at' => now()
            ]);
        }
    }
    
    private function createQualityChecklists(Order $order)
    {
        // إنشاء قوائم فحص الجودة - للتطوير المستقبلي
    }
    
    private function sendProductionStartNotifications(Order $order)
    {
        Notification::create([
            'type' => 'production_started',
            'title' => 'بدء الإنتاج',
            'message' => "تم بدء إنتاج الطلب رقم {$order->id}",
            'order_id' => $order->id
        ]);
    }
    
    private function initializeCostTracking(Order $order)
    {
        // تسجيل تكلفة المواد
        $reservations = MaterialReservation::where('order_id', $order->id)
            ->with('material')
            ->get();
        
        foreach ($reservations as $reservation) {
            OrderCostBreakdown::create([
                'order_id' => $order->id,
                'cost_type' => 'material',
                'description' => "مادة: {$reservation->material->name}",
                'amount' => $reservation->reserved_quantity * $reservation->material->cost_per_unit,
                'recorded_at' => now()
            ]);
        }
    }
    
    private function completeOrder(Order $order)
    {
        $order->update([
            'status' => 'completed',
            'completed_date' => now()
        ]);
        
        // تحرير المواد المحجوزة
        $this->releaseReservedMaterials($order);
        
        // إرسال إشعار إكمال
        Notification::create([
            'type' => 'order_completed',
            'title' => 'اكتمال الطلب',
            'message' => "تم إكمال الطلب رقم {$order->id} بنجاح",
            'order_id' => $order->id
        ]);
    }
    
    private function releaseReservedMaterials(Order $order)
    {
        $reservations = MaterialReservation::where('order_id', $order->id)
            ->where('status', 'active')
            ->get();
        
        foreach ($reservations as $reservation) {
            $reservation->update(['status' => 'used']);
            
            $material = $reservation->material;
            $material->decrement('reserved_quantity', $reservation->reserved_quantity);
            $material->decrement('quantity', $reservation->reserved_quantity);
        }
    }
}
