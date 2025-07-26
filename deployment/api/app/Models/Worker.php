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
        'salary',
        'hire_date',
        'is_active',
        'skills',
        'notes',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'is_active' => 'boolean',
        'salary' => 'decimal:2',
        'skills' => 'array',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'assigned_worker_id');
    }
}
