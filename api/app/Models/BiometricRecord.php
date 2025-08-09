<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BiometricRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'attendance_date',
        'check_in_time',
        'check_out_time',
        'break_start_time',
        'break_end_time',
        'lunch_start_time',
        'lunch_end_time',
        'total_hours',
        'regular_hours',
        'overtime_hours',
        'break_hours',
        'lunch_hours',
        'net_working_hours',
        'attendance_status',
        'late_minutes',
        'early_leave_minutes',
        'is_holiday',
        'is_weekend',
        'device_id',
        'device_location',
        'biometric_type',
        'scan_quality',
        'check_in_attempts',
        'check_out_attempts',
        'is_verified',
        'match_score',
        'verification_method',
        'verified_by',
        'verified_at',
        'check_in_latitude',
        'check_in_longitude',
        'check_out_latitude',
        'check_out_longitude',
        'check_in_address',
        'check_out_address',
        'is_remote_checkin',
        'scheduled_check_in',
        'scheduled_check_out',
        'shift_name',
        'shift_type',
        'has_exception',
        'exception_type',
        'exception_reason',
        'exception_status',
        'exception_approved_by',
        'exception_approved_at',
        'temperature',
        'health_check_passed',
        'health_questionnaire',
        'mask_detection',
        'tasks_assigned',
        'tasks_completed',
        'productivity_score',
        'work_notes',
        'check_in_photo',
        'check_out_photo',
        'additional_photos',
        'system_source',
        'ip_address',
        'user_agent',
        'raw_data',
        'is_processed',
        'requires_review',
        'included_in_payroll',
        'payroll_id',
        'hours_for_pay',
        'overtime_for_pay',
        'supervisor_notes',
        'worker_notes',
        'hr_notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
        'break_start_time' => 'datetime:H:i',
        'break_end_time' => 'datetime:H:i',
        'lunch_start_time' => 'datetime:H:i',
        'lunch_end_time' => 'datetime:H:i',
        'scheduled_check_in' => 'datetime:H:i',
        'scheduled_check_out' => 'datetime:H:i',
        'verified_at' => 'datetime',
        'exception_approved_at' => 'datetime',
        'total_hours' => 'decimal:2',
        'regular_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'break_hours' => 'decimal:2',
        'lunch_hours' => 'decimal:2',
        'net_working_hours' => 'decimal:2',
        'match_score' => 'decimal:2',
        'check_in_latitude' => 'decimal:8',
        'check_in_longitude' => 'decimal:8',
        'check_out_latitude' => 'decimal:8',
        'check_out_longitude' => 'decimal:8',
        'temperature' => 'decimal:1',
        'productivity_score' => 'decimal:2',
        'hours_for_pay' => 'decimal:2',
        'overtime_for_pay' => 'decimal:2',
        'is_holiday' => 'boolean',
        'is_weekend' => 'boolean',
        'is_verified' => 'boolean',
        'is_remote_checkin' => 'boolean',
        'has_exception' => 'boolean',
        'health_check_passed' => 'boolean',
        'is_processed' => 'boolean',
        'requires_review' => 'boolean',
        'included_in_payroll' => 'boolean',
        'health_questionnaire' => 'array',
        'tasks_assigned' => 'array',
        'tasks_completed' => 'array',
        'additional_photos' => 'array',
        'raw_data' => 'array',
    ];

    /**
     * Get the worker that owns the biometric record.
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * Get the user who verified the record.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the user who approved the exception.
     */
    public function exceptionApprovedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exception_approved_by');
    }

    /**
     * Get the payroll that includes this record.
     */
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }
}