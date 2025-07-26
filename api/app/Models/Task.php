<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'worker_id',
        'title',
        'description',
        'status',
        'priority',
        'start_time',
        'end_time',
        'estimated_duration',
        'actual_duration',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'estimated_duration' => 'integer',
        'actual_duration' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function getDurationAttribute()
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->diffInMinutes($this->end_time);
        }
        return null;
    }
}
