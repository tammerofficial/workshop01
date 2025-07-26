<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'production_stage_id',
        'assigned_worker_id',
        'status',
        'equipment',
        'notes'
    ];

    protected $casts = [
        'equipment' => 'array'
    ];

    // Relationships
    public function productionStage()
    {
        return $this->belongsTo(ProductionStage::class);
    }

    public function assignedWorker()
    {
        return $this->belongsTo(Worker::class, 'assigned_worker_id');
    }

    public function orderTracking()
    {
        return $this->hasMany(OrderProductionTracking::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeBusy($query)
    {
        return $query->where('status', 'busy');
    }
} 