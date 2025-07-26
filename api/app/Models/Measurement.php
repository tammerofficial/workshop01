<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Measurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'order_id',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'arm_length',
        'leg_length',
        'neck',
        'notes',
    ];

    protected $casts = [
        'chest' => 'float',
        'waist' => 'float',
        'hip' => 'float',
        'shoulder' => 'float',
        'arm_length' => 'float',
        'leg_length' => 'float',
        'neck' => 'float',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
} 