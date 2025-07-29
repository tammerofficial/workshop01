<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'user_id',
        'order_id',
        'priority',
        'read_at'
    ];
}
