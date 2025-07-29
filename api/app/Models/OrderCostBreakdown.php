<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCostBreakdown extends Model
{
    protected $table = 'order_cost_breakdown';

    protected $fillable = [
        'order_id',
        'cost_type',
        'description',
        'amount',
        'recorded_at'
    ];
}
