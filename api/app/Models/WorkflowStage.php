<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'stage_order',
        'estimated_hours',
        'max_hours',
        'is_parallel',
        'required_role',
        'min_workers',
        'max_workers',
        'priority_score',
        'requires_quality_check',
        'requires_approval',
        'quality_criteria',
        'auto_start',
        'auto_complete',
        'completion_conditions',
        'send_notifications',
        'notification_delay_minutes',
        'notification_recipients',
        'required_tools',
        'required_materials',
        'work_station',
        'is_active',
        'is_maintenance_mode'
    ];

    protected $casts = [
        'estimated_hours' => 'decimal:2',
        'max_hours' => 'decimal:2',
        'is_parallel' => 'boolean',
        'requires_quality_check' => 'boolean',
        'requires_approval' => 'boolean',
        'quality_criteria' => 'array',
        'auto_start' => 'boolean',
        'auto_complete' => 'boolean',
        'completion_conditions' => 'array',
        'send_notifications' => 'boolean',
        'notification_recipients' => 'array',
        'required_tools' => 'array',
        'required_materials' => 'array',
        'is_active' => 'boolean',
        'is_maintenance_mode' => 'boolean'
    ];

    // 🔗 العلاقات
    public function workerAssignments(): HasMany
    {
        return $this->hasMany(WorkerStageAssignment::class, 'stage_id');
    }

    public function orderProgress(): HasMany
    {
        return $this->hasMany(OrderWorkflowProgress::class, 'stage_id');
    }

    public function transitionsFrom(): HasMany
    {
        return $this->hasMany(StageTransition::class, 'from_stage_id');
    }

    public function transitionsTo(): HasMany
    {
        return $this->hasMany(StageTransition::class, 'to_stage_id');
    }

    public function performanceMetrics(): HasMany
    {
        return $this->hasMany(WorkerPerformanceMetric::class, 'stage_id');
    }

    // 🎯 المجالات المحلية (Scopes)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInOrder($query)
    {
        return $query->orderBy('stage_order');
    }

    public function scopeForRole($query, $role)
    {
        return $query->where('required_role', $role);
    }

    // 🏆 دوال الأداء والتحليل
    public function getAverageCompletionTime()
    {
        return $this->orderProgress()
            ->where('status', 'completed')
            ->whereNotNull('actual_hours')
            ->avg('actual_hours');
    }

    public function getTodayPerformance()
    {
        return $this->performanceMetrics()
            ->whereDate('performance_date', today())
            ->get();
    }

    public function getTopPerformers($limit = 5)
    {
        return $this->performanceMetrics()
            ->with('worker')
            ->whereDate('performance_date', today())
            ->orderByDesc('total_score')
            ->limit($limit)
            ->get();
    }

    // 📊 إحصائيات المرحلة
    public function getStageStatistics()
    {
        $today = today();
        
        return [
            'tasks_in_progress' => $this->orderProgress()
                ->where('status', 'in_progress')
                ->count(),
            
            'tasks_completed_today' => $this->orderProgress()
                ->where('status', 'completed')
                ->whereDate('completed_at', $today)
                ->count(),
            
            'average_quality_score' => $this->performanceMetrics()
                ->whereDate('performance_date', $today)
                ->avg('quality_score_average'),
            
            'efficiency_percentage' => $this->performanceMetrics()
                ->whereDate('performance_date', $today)
                ->avg('speed_efficiency'),
            
            'workers_count' => $this->workerAssignments()
                ->where('is_active', true)
                ->count()
        ];
    }

    // 🔄 الانتقال للمرحلة التالية
    public function getNextStage()
    {
        return self::where('stage_order', '>', $this->stage_order)
            ->where('is_active', true)
            ->orderBy('stage_order')
            ->first();
    }

    // 📋 التحقق من شروط المرحلة
    public function canStartStage($order_id, $worker_id)
    {
        // التحقق من المرحلة السابقة
        $previousStage = self::where('stage_order', '<', $this->stage_order)
            ->where('is_active', true)
            ->orderByDesc('stage_order')
            ->first();

        if ($previousStage) {
            $previousComplete = OrderWorkflowProgress::where('order_id', $order_id)
                ->where('stage_id', $previousStage->id)
                ->where('status', 'completed')
                ->exists();

            if (!$previousComplete) {
                return false;
            }
        }

        // التحقق من توفر العامل
        $workerAssignment = WorkerStageAssignment::where('worker_id', $worker_id)
            ->where('stage_id', $this->id)
            ->where('is_active', true)
            ->first();

        return $workerAssignment && $workerAssignment->availability_status === 'available';
    }
}