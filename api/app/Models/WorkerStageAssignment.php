<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkerStageAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'stage_id',
        'skill_level',
        'efficiency_rating',
        'experience_months',
        'is_primary_assignment',
        'can_train_others',
        'max_concurrent_tasks',
        'daily_work_hours',
        'work_schedule',
        'assignment_start_date',
        'assignment_end_date',
        'priority_level',
        'is_backup_worker',
        'backup_for_workers',
        'completed_tasks_count',
        'average_completion_time',
        'quality_score_average',
        'last_task_completed_at',
        'availability_status',
        'availability_updated_at',
        'availability_notes',
        'certifications',
        'training_history',
        'next_training_due',
        'is_active',
        'deactivation_reason'
    ];

    protected $casts = [
        'efficiency_rating' => 'decimal:2',
        'daily_work_hours' => 'decimal:2',
        'average_completion_time' => 'decimal:2',
        'quality_score_average' => 'decimal:2',
        'is_primary_assignment' => 'boolean',
        'can_train_others' => 'boolean',
        'is_backup_worker' => 'boolean',
        'is_active' => 'boolean',
        'work_schedule' => 'array',
        'backup_for_workers' => 'array',
        'certifications' => 'array',
        'training_history' => 'array',
        'assignment_start_date' => 'date',
        'assignment_end_date' => 'date',
        'next_training_due' => 'date',
        'last_task_completed_at' => 'datetime',
        'availability_updated_at' => 'datetime'
    ];

    // العلاقات
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(WorkflowStage::class, 'stage_id');
    }

    // المجالات المحلية
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('availability_status', 'available');
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary_assignment', true);
    }

    public function scopeForStage($query, $stageId)
    {
        return $query->where('stage_id', $stageId);
    }

    // دوال مساعدة
    public function getCurrentTasksCount()
    {
        return OrderWorkflowProgress::where('assigned_worker_id', $this->worker_id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->count();
    }

    public function canTakeNewTask()
    {
        return $this->getCurrentTasksCount() < $this->max_concurrent_tasks 
            && in_array($this->availability_status, ['available', 'on_break']);
    }

    public function getEfficiencyLevel()
    {
        if ($this->efficiency_rating >= 1.5) return 'ممتاز';
        if ($this->efficiency_rating >= 1.2) return 'جيد جداً';
        if ($this->efficiency_rating >= 1.0) return 'جيد';
        if ($this->efficiency_rating >= 0.8) return 'مقبول';
        return 'يحتاج تحسين';
    }

    public function getSkillLevelArabic()
    {
        $levels = [
            'beginner' => 'مبتدئ',
            'intermediate' => 'متوسط',
            'expert' => 'خبير',
            'master' => 'خبير متقدم'
        ];

        return $levels[$this->skill_level] ?? 'غير محدد';
    }

    public function getAvailabilityStatusArabic()
    {
        $statuses = [
            'available' => 'متاح',
            'busy' => 'مشغول',
            'on_break' => 'في استراحة',
            'training' => 'في تدريب',
            'sick_leave' => 'إجازة مرضية',
            'vacation' => 'إجازة',
            'overtime' => 'وقت إضافي',
            'unavailable' => 'غير متاح'
        ];

        return $statuses[$this->availability_status] ?? 'غير محدد';
    }
}