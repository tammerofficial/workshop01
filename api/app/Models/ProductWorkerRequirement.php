<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductWorkerRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'stage_requirement_id',
        'worker_id',
        'production_stage_id',
        'priority',
        'efficiency_rate',
        'required_skills',
        'certifications',
        'hourly_rate',
        'max_concurrent_orders',
        'is_primary',
        'can_supervise',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'required_skills' => 'array',
        'certifications' => 'array',
        'efficiency_rate' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'priority' => 'integer',
        'max_concurrent_orders' => 'integer',
        'is_primary' => 'boolean',
        'can_supervise' => 'boolean',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stageRequirement()
    {
        return $this->belongsTo(ProductStageRequirement::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function productionStage()
    {
        return $this->belongsTo(ProductionStage::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeSupervisors($query)
    {
        return $query->where('can_supervise', true);
    }

    public function scopeOrderedByPriority($query)
    {
        return $query->orderBy('priority');
    }

    public function scopeForStage($query, $stageId)
    {
        return $query->where('production_stage_id', $stageId);
    }

    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    // Helper methods
    public function hasRequiredSkill($skill)
    {
        if (!$this->required_skills) {
            return true; // إذا لم تكن هناك مهارات محددة، فالعامل مؤهل
        }

        return in_array($skill, $this->required_skills);
    }

    public function hasCertification($certification)
    {
        if (!$this->certifications) {
            return true; // إذا لم تكن هناك شهادات محددة، فالعامل مؤهل
        }

        return in_array($certification, $this->certifications);
    }

    public function getAdjustedHours($baseHours)
    {
        // حساب الساعات المعدلة بناءً على كفاءة العامل
        return $baseHours / $this->efficiency_rate;
    }

    public function calculateStageCost($baseHours)
    {
        $adjustedHours = $this->getAdjustedHours($baseHours);
        $hourlyRate = $this->hourly_rate ?? $this->worker->hourly_rate ?? 0;
        
        return $adjustedHours * $hourlyRate;
    }

    public function isAvailableForOrder($orderId = null)
    {
        // تحقق من توفر العامل لطلب جديد
        if (!$this->worker || !$this->is_active) {
            return false;
        }

        // عدد الطلبات الحالية التي يعمل عليها العامل  
        $currentOrders = \App\Models\OrderProductionTracking::where('worker_id', $this->worker_id)
            ->where('status', 'in_progress')
            ->distinct('order_id')
            ->count();

        return $currentOrders < $this->max_concurrent_orders;
    }

    public function getWorkload()
    {
        // حساب حمولة العمل الحالية للعامل
        $currentOrders = \App\Models\OrderProductionTracking::where('worker_id', $this->worker_id)
            ->where('status', 'in_progress')
            ->with(['order', 'productionStage'])
            ->get();

        $totalHours = 0;
        foreach ($currentOrders as $tracking) {
            $stageReq = ProductStageRequirement::where('product_id', $tracking->order->product_id)
                ->where('production_stage_id', $tracking->production_stage_id)
                ->first();
            
            if ($stageReq) {
                $totalHours += $this->getAdjustedHours($stageReq->estimated_hours);
            }
        }

        return [
            'current_orders' => $currentOrders->count(),
            'total_estimated_hours' => $totalHours,
            'availability_percentage' => (($this->max_concurrent_orders - $currentOrders->count()) / $this->max_concurrent_orders) * 100
        ];
    }

    // تحديد أفضل عامل لمرحلة معينة
    public static function getBestWorkerForStage($productId, $stageId, $excludeWorkerIds = [])
    {
        $query = static::where('product_id', $productId)
            ->where('production_stage_id', $stageId)
            ->where('is_active', true)
            ->with('worker')
            ->orderBy('priority')
            ->orderBy('efficiency_rate', 'desc');

        if (!empty($excludeWorkerIds)) {
            $query->whereNotIn('worker_id', $excludeWorkerIds);
        }

        $requirements = $query->get();

        foreach ($requirements as $requirement) {
            if ($requirement->isAvailableForOrder()) {
                return $requirement;
            }
        }

        return null; // لا يوجد عامل متاح
    }

    // تحديد العمال المتاحين لمرحلة معينة
    public static function getAvailableWorkersForStage($productId, $stageId)
    {
        return static::where('product_id', $productId)
            ->where('production_stage_id', $stageId)
            ->where('is_active', true)
            ->with('worker')
            ->get()
            ->filter(function($requirement) {
                return $requirement->isAvailableForOrder();
            })
            ->sortBy('priority')
            ->values();
    }
}