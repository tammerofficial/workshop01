<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'order_id',
        'worker_id',
        'transaction_type',
        'quantity',
        'unit_cost',
        'total_cost',
        'reference_number',
        'notes'
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2'
    ];

    // Relationships
    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    // Scopes
    public function scopeIn($query)
    {
        return $query->where('transaction_type', 'in');
    }

    public function scopeOut($query)
    {
        return $query->where('transaction_type', 'out');
    }

    // Calculate total cost
    public function calculateTotalCost()
    {
        $this->total_cost = $this->quantity * $this->unit_cost;
        return $this->total_cost;
    }
} 