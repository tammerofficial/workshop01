<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'client_id',
        'worker_id',
        'sale_number',
        'amount',
        'payment_method',
        'status',
        'sale_date',
        'sale_time',
        'notes'
    ];

    protected $casts = [
        'sale_date' => 'date',
        'sale_time' => 'datetime:H:i',
        'amount' => 'decimal:2'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    // Generate sale number
    public static function generateSaleNumber()
    {
        $lastSale = self::latest()->first();
        $lastNumber = $lastSale ? intval(substr($lastSale->sale_number, 5)) : 0;
        return 'SALE-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
} 