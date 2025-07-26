<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'order_sequence',
        'estimated_hours',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // Relationships
    public function stations()
    {
        return $this->hasMany(Station::class);
    }

    public function orderTracking()
    {
        return $this->hasMany(OrderProductionTracking::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_sequence');
    }
} 