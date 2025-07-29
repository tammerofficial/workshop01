<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderProductionTracking extends Model
{
    use HasFactory;
    
    protected $table = 'order_production_tracking';

    protected $fillable = [
        'order_id',
        'production_stage_id',
        'worker_id',
        'status',
        'started_at',
        'completed_at',
        'estimated_minutes',
        'actual_hours',
        'notes'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function productionStage()
    {
        return $this->belongsTo(ProductionStage::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Calculate actual hours
    public function calculateActualHours()
    {
        if ($this->started_at && $this->completed_at) {
            $this->actual_hours = $this->started_at->diffInHours($this->completed_at);
        }
        return $this->actual_hours;
    }
} 