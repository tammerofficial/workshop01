<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'hourly_rate' => 'decimal:2',
        'base_salary' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'bonus' => 'decimal:2',
        'deductions' => 'decimal:2',
        'net_salary' => 'decimal:2'
    ];

    // Relationships
    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    // Generate payroll number
    public static function generatePayrollNumber()
    {
        $lastPayroll = self::latest()->first();
        $lastNumber = $lastPayroll ? intval(substr($lastPayroll->payroll_number, 4)) : 0;
        return 'PAY-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }

    // Calculate net salary
    public function calculateNetSalary()
    {
        $this->overtime_pay = $this->overtime_hours * $this->overtime_rate;
        $this->net_salary = $this->base_salary + $this->overtime_pay + $this->bonus - $this->deductions;
        return $this->net_salary;
    }
} 