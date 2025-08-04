<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        // Basic Information
        'name',
        'email',
        'phone',
        'role',
        'department',
        'specialty', // تخصص العامل (design, cutting, sewing, fitting, finishing, quality_check)
        'hire_date',
        'is_active',
        'skills',
        'notes',
        'user_id', // ربط مع جدول المستخدمين
        
        // Personal Information from Biometric
        'first_name',
        'last_name',
        'middle_name',
        'birth_date',
        'gender',
        'nationality',
        'id_number',
        'passport_number',
        'visa_number',
        'visa_expiry',
        
        // Contact Information
        'address',
        'city',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        
        // Employment Details
        'position_code',
        'position_name',
        'department_code',
        'area_code',
        'area_name',
        'shift_type',
        'work_start_time',
        'work_end_time',
        'work_days_per_week',
        'employment_type',
        'contract_type',
        'contract_start_date',
        'contract_end_date',
        
        // Salary and Financial Information
        'salary',
        'salary_kwd',
        'base_salary',
        'basic_salary',
        'allowances',
        'hourly_rate',
        'hourly_rate_kwd',
        'overtime_rate',
        'overtime_hourly_rate',
        'bonus_rate',
        'bonus_percentage',
        'salary_currency',
        'bank_name',
        'bank_account_number',
        'iban',
        'standard_hours_per_day',
        'standard_hours_per_week',
        'standard_hours_per_month',
        'enable_overtime',
        'enable_bonus',
        'payroll_status',
        'last_payroll_date',
        
        // Performance and Skills
        'technical_skills',
        'certifications',
        'training_history',
        'performance_rating',
        'performance_history',
        'productivity_score',
        'completed_projects',
        'quality_score',
        'attendance_score',
        
        // Attendance and Time Tracking
        'regular_check_in_time',
        'regular_check_out_time',
        'total_working_days',
        'total_absent_days',
        'total_late_days',
        'total_overtime_hours',
        'total_overtime_amount',
        'vacation_days_used',
        'vacation_days_remaining',
        'sick_days_used',
        'attendance_percentage',
        
        // Production Tracking
        'production_stages',
        'production_stages_mastered',
        'current_assignments',
        'total_orders_completed',
        'average_completion_time',
        'efficiency_rating',
        'quality_rejections',
        'defect_rate',
        'stage_performance',
        
        // Biometric Data
        'biometric_id',
        'biometric_data',
        'employee_code',
        'fingerprint_templates',
        'face_templates',
        'palm_templates',
        'fingerprint_enrolled',
        'face_enrolled',
        'palm_enrolled',
        'biometric_device_id',
        'last_biometric_sync',
        
        // Payroll Information
        'payroll_history',
        'ytd_gross_pay',
        'ytd_net_pay',
        'ytd_overtime',
        'ytd_bonuses',
        'ytd_deductions',
        'tax_information',
        
        // Health and Safety
        'medical_information',
        'safety_training',
        'safety_incidents',
        'last_medical_checkup',
        'work_restrictions',
        
        // Status and Flags
        'is_probation',
        'probation_end_date',
        'is_terminated',
        'termination_date',
        'termination_reason',
        'is_rehireable',
        'requires_training',
        'required_training_modules',
        
        // Communication and Notifications
        'preferred_language',
        'notification_preferences',
        'email_notifications',
        'sms_notifications',
        
        // Metadata
        'last_api_sync',
        'api_sync_errors',
        'sync_attempts',
        'last_login_attempt',
        'failed_login_attempts',
        'audit_trail'
    ];

    protected $casts = [
        // Dates
        'hire_date' => 'date',
        'birth_date' => 'date',
        'visa_expiry' => 'date',
        'contract_start_date' => 'date',
        'contract_end_date' => 'date',
        'probation_end_date' => 'date',
        'termination_date' => 'date',
        'last_medical_checkup' => 'date',
        'last_payroll_date' => 'date',
        
        // Times
        'work_start_time' => 'datetime:H:i',
        'work_end_time' => 'datetime:H:i',
        'regular_check_in_time' => 'datetime:H:i',
        'regular_check_out_time' => 'datetime:H:i',
        
        // Timestamps
        'last_biometric_sync' => 'datetime',
        'last_api_sync' => 'datetime',
        'last_login_attempt' => 'datetime',
        
        // Booleans
        'is_active' => 'boolean',
        'enable_overtime' => 'boolean',
        'enable_bonus' => 'boolean',
        'fingerprint_enrolled' => 'boolean',
        'face_enrolled' => 'boolean',
        'palm_enrolled' => 'boolean',
        'is_probation' => 'boolean',
        'is_terminated' => 'boolean',
        'is_rehireable' => 'boolean',
        'requires_training' => 'boolean',
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        
        // Decimals and Numbers
        'salary' => 'decimal:2',
        'salary_kwd' => 'decimal:3',
        'base_salary' => 'decimal:2',
        'basic_salary' => 'decimal:2',
        'allowances' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'hourly_rate_kwd' => 'decimal:3',
        'overtime_rate' => 'decimal:2',
        'overtime_hourly_rate' => 'decimal:2',
        'bonus_rate' => 'decimal:2',
        'bonus_percentage' => 'decimal:2',
        'performance_rating' => 'decimal:2',
        'quality_score' => 'decimal:2',
        'average_completion_time' => 'decimal:2',
        'efficiency_rating' => 'decimal:2',
        'defect_rate' => 'decimal:2',
        'total_overtime_amount' => 'decimal:2',
        'attendance_percentage' => 'decimal:2',
        'ytd_gross_pay' => 'decimal:2',
        'ytd_net_pay' => 'decimal:2',
        'ytd_overtime' => 'decimal:2',
        'ytd_bonuses' => 'decimal:2',
        'ytd_deductions' => 'decimal:2',
        
        // Integers
        'work_days_per_week' => 'integer',
        'productivity_score' => 'integer',
        'attendance_score' => 'integer',
        'total_working_days' => 'integer',
        'total_absent_days' => 'integer',
        'total_late_days' => 'integer',
        'total_overtime_hours' => 'integer',
        'vacation_days_used' => 'integer',
        'vacation_days_remaining' => 'integer',
        'sick_days_used' => 'integer',
        'total_orders_completed' => 'integer',
        'quality_rejections' => 'integer',
        'safety_incidents' => 'integer',
        'sync_attempts' => 'integer',
        'failed_login_attempts' => 'integer',
        
        // JSON Arrays
        'skills' => 'array',
        'production_stages' => 'array',
        'biometric_data' => 'array',
        'technical_skills' => 'array',
        'certifications' => 'array',
        'training_history' => 'array',
        'performance_history' => 'array',
        'completed_projects' => 'array',
        'production_stages_mastered' => 'array',
        'current_assignments' => 'array',
        'stage_performance' => 'array',
        'fingerprint_templates' => 'array',
        'face_templates' => 'array',
        'palm_templates' => 'array',
        'payroll_history' => 'array',
        'tax_information' => 'array',
        'medical_information' => 'array',
        'safety_training' => 'array',
        'work_restrictions' => 'array',
        'required_training_modules' => 'array',
        'notification_preferences' => 'array',
        'api_sync_errors' => 'array',
        'audit_trail' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'assigned_worker_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function payroll()
    {
        return $this->hasMany(Payroll::class);
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    public function stations()
    {
        return $this->hasMany(Station::class, 'assigned_worker_id');
    }

    public function productionTracking()
    {
        return $this->hasMany(OrderProductionTracking::class);
    }

    public function materialTransactions()
    {
        return $this->hasMany(MaterialTransaction::class);
    }

    /**
     * Calculate total working hours for a specific period
     */
    public function calculateWorkingHours($startDate = null, $endDate = null)
    {
        $query = $this->attendance();
        
        if ($startDate) {
            $query->where('attendance_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('attendance_date', '<=', $endDate);
        }
        
        return $query->sum('total_hours');
    }

    /**
     * Calculate overtime hours for a specific period
     */
    public function calculateOvertimeHours($startDate = null, $endDate = null)
    {
        $query = $this->attendance();
        
        if ($startDate) {
            $query->where('attendance_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('attendance_date', '<=', $endDate);
        }
        
        return $query->where('total_hours', '>', $this->standard_hours_per_day)->sum('total_hours') - $this->standard_hours_per_day;
    }

    /**
     * Get the latest payroll for this worker
     */
    public function getLatestPayroll()
    {
        return $this->payroll()->latest('payroll_date')->first();
    }

    /**
     * Check if worker has payroll for specific month
     */
    public function hasPayrollForMonth($year, $month)
    {
        return $this->payroll()
            ->whereYear('payroll_date', $year)
            ->whereMonth('payroll_date', $month)
            ->exists();
    }

    /**
     * Scope for active workers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('payroll_status', 'active');
    }

    /**
     * Scope for workers eligible for payroll
     */
    public function scopeEligibleForPayroll($query)
    {
        return $query->where('is_active', true)
                    ->where('payroll_status', 'active')
                    ->whereNotNull('hourly_rate');
    }
}
