<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'department',
        'specialty', // تخصص العامل (design, cutting, sewing, fitting, finishing, quality_check)
        'salary',
        'base_salary', // الراتب الأساسي
        'hourly_rate', // معدل الساعة
        'overtime_rate', // معدل الإضافي
        'standard_hours_per_day', // ساعات العمل اليومية
        'standard_hours_per_week', // ساعات العمل الأسبوعية
        'standard_hours_per_month', // ساعات العمل الشهرية
        'enable_overtime', // تفعيل الإضافي
        'enable_bonus', // تفعيل البونص
        'bonus_percentage', // نسبة البونص
        'hire_date',
        'is_active',
        'skills',
        'notes',
        'production_stages', // المراحل التي يتقنها
        'biometric_id', // رقم الموظف في نظام البصمة
        'biometric_data', // بيانات إضافية من نظام البصمة
        'employee_code', // رمز الموظف في نظام البصمة
        'payroll_status', // حالة الراتب (active, inactive, suspended)
        'last_payroll_date', // آخر تاريخ راتب
    ];

    protected $casts = [
        'hire_date' => 'date',
        'last_payroll_date' => 'date',
        'is_active' => 'boolean',
        'salary' => 'decimal:2',
        'base_salary' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'bonus_percentage' => 'decimal:2',
        'enable_overtime' => 'boolean',
        'enable_bonus' => 'boolean',
        'skills' => 'array',
        'production_stages' => 'array',
        'biometric_data' => 'array',
    ];

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
