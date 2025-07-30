<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Payroll extends Model
{
    use HasFactory;

    protected $table = 'payroll';

    protected $fillable = [
        'worker_id',
        'payroll_number',
        'payroll_date',
        'working_hours',
        'hourly_rate',
        'base_salary',
        'overtime_hours',
        'overtime_rate',
        'overtime_pay',
        'bonus',
        'deductions',
        'net_salary',
        'status',
        'payment_date',
        'notes'
    ];

    protected $casts = [
        'payroll_date' => 'date',
        'payment_date' => 'date',
        'working_hours' => 'integer',
        'hourly_rate' => 'decimal:2',
        'base_salary' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'bonus' => 'decimal:2',
        'deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
    ];

    /**
     * Get the worker that owns the payroll
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * Get attendance records for this payroll period
     */
    public function attendanceRecords()
    {
        $startDate = Carbon::parse($this->payroll_date)->startOfMonth();
        $endDate = Carbon::parse($this->payroll_date)->endOfMonth();
        
        return $this->worker->attendance()
            ->whereBetween('attendance_date', [$startDate, $endDate]);
    }

    /**
     * Calculate working hours from attendance records
     */
    public function calculateWorkingHours(): int
    {
        $attendanceRecords = $this->attendanceRecords()->get();
        $totalHours = 0;

        foreach ($attendanceRecords as $record) {
            if ($record->check_in_time && $record->check_out_time) {
                $checkIn = Carbon::parse($record->check_in_time);
                $checkOut = Carbon::parse($record->check_out_time);
                
                // Subtract break time if exists
                $breakTime = 0;
                if ($record->break_start && $record->break_end) {
                    $breakStart = Carbon::parse($record->break_start);
                    $breakEnd = Carbon::parse($record->break_end);
                    $breakTime = $breakEnd->diffInMinutes($breakStart);
                }
                
                $workMinutes = $checkOut->diffInMinutes($checkIn) - $breakTime;
                $totalHours += $workMinutes / 60;
            }
        }

        return round($totalHours, 2);
    }

    /**
     * Calculate overtime hours (hours over 8 per day)
     */
    public function calculateOvertimeHours(): float
    {
        $attendanceRecords = $this->attendanceRecords()->get();
        $overtimeHours = 0;

        foreach ($attendanceRecords as $record) {
            if ($record->check_in_time && $record->check_out_time) {
                $checkIn = Carbon::parse($record->check_in_time);
                $checkOut = Carbon::parse($record->check_out_time);
                
                // Subtract break time if exists
                $breakTime = 0;
                if ($record->break_start && $record->break_end) {
                    $breakStart = Carbon::parse($record->break_start);
                    $breakEnd = Carbon::parse($record->break_end);
                    $breakTime = $breakEnd->diffInMinutes($breakStart);
                }
                
                $workMinutes = $checkOut->diffInMinutes($checkIn) - $breakTime;
                $workHours = $workMinutes / 60;
                
                // Overtime is hours over 8 per day
                if ($workHours > 8) {
                    $overtimeHours += $workHours - 8;
                }
            }
        }

        return round($overtimeHours, 2);
    }

    /**
     * Calculate base salary based on working hours and hourly rate
     */
    public function calculateBaseSalary(): float
    {
        return round($this->working_hours * $this->hourly_rate, 2);
    }

    /**
     * Calculate overtime pay
     */
    public function calculateOvertimePay(): float
    {
        return round($this->overtime_hours * $this->overtime_rate, 2);
    }

    /**
     * Calculate net salary
     */
    public function calculateNetSalary(): float
    {
        return round(
            $this->base_salary + 
            $this->overtime_pay + 
            $this->bonus - 
            $this->deductions, 
            2
        );
    }

    /**
     * Generate payroll number
     */
    public static function generatePayrollNumber(): string
    {
        $lastPayroll = self::orderBy('id', 'desc')->first();
        $nextNumber = $lastPayroll ? intval(substr($lastPayroll->payroll_number, 4)) + 1 : 1;
        return 'PAY-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope for pending payrolls
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for paid payrolls
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope for cancelled payrolls
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
} 