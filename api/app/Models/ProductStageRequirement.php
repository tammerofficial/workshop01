<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductStageRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'production_stage_id',
        'order_sequence',
        'estimated_hours',
        'required_workers',
        'skill_requirements',
        'equipment_requirements',
        'is_parallel',
        'parallel_stages',
        'is_critical',
        'buffer_time_hours',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'skill_requirements' => 'array',
        'equipment_requirements' => 'array',
        'parallel_stages' => 'array',
        'is_parallel' => 'boolean',
        'is_critical' => 'boolean',
        'is_active' => 'boolean',
        'estimated_hours' => 'integer',
        'required_workers' => 'integer',
        'order_sequence' => 'integer',
        'buffer_time_hours' => 'integer'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productionStage()
    {
        return $this->belongsTo(ProductionStage::class);
    }

    public function workerRequirements()
    {
        return $this->hasMany(ProductWorkerRequirement::class, 'stage_requirement_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_sequence');
    }

    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    public function scopeParallel($query)
    {
        return $query->where('is_parallel', true);
    }

    // Helper methods
    public function getTotalEstimatedTime()
    {
        return $this->estimated_hours + $this->buffer_time_hours;
    }

    public function canRunInParallelWith($stageId)
    {
        if (!$this->is_parallel || !$this->parallel_stages) {
            return false;
        }

        return in_array($stageId, $this->parallel_stages);
    }

    public function hasSkillRequirement($skill)
    {
        if (!$this->skill_requirements) {
            return false;
        }

        return in_array($skill, $this->skill_requirements);
    }

    public function hasEquipmentRequirement($equipment)
    {
        if (!$this->equipment_requirements) {
            return false;
        }

        return in_array($equipment, $this->equipment_requirements);
    }

    // Calculate cost for this stage
    public function calculateStageCost($hourlyRate = null)
    {
        $hours = $this->getTotalEstimatedTime();
        $workers = $this->required_workers;
        
        // إذا لم يتم تمرير سعر الساعة، استخدم متوسط سعر العمال المؤهلين
        if (!$hourlyRate) {
            $hourlyRate = $this->getAverageWorkerHourlyRate();
        }
        
        return $hours * $workers * $hourlyRate;
    }

    private function getAverageWorkerHourlyRate()
    {
        // متوسط سعر الساعة للعمال المؤهلين لهذه المرحلة
        $qualifiedWorkers = $this->workerRequirements()
            ->with('worker')
            ->get()
            ->pluck('worker')
            ->filter();

        if ($qualifiedWorkers->isEmpty()) {
            return 0; // سعر افتراضي
        }

        return $qualifiedWorkers->avg('hourly_rate') ?? 0;
    }

    // Check if stage can be started (dependencies met)
    public function canStartStage($completedStages = [])
    {
        // إذا كانت هذه المرحلة الأولى، يمكن البدء فيها
        if ($this->order_sequence == 1) {
            return true;
        }

        // تحقق من إكمال المراحل السابقة
        $previousStages = $this->product->stageRequirements()
            ->where('order_sequence', '<', $this->order_sequence)
            ->where('is_active', true)
            ->get();

        foreach ($previousStages as $stage) {
            // إذا كانت المرحلة غير متوازية ولم تكتمل، لا يمكن البدء
            if (!$stage->is_parallel && !in_array($stage->id, $completedStages)) {
                return false;
            }
        }

        return true;
    }
}