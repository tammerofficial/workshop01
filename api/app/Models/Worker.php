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
        'hire_date',
        'is_active',
        'skills',
        'notes',
        'hourly_rate', // معدل الساعة
        'production_stages', // المراحل التي يتقنها
    ];

    protected $casts = [
        'hire_date' => 'date',
        'is_active' => 'boolean',
        'salary' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'skills' => 'array',
        'production_stages' => 'array',
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
}
