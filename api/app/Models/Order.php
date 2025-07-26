<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'assigned_worker_id',
        'category_id',
        'title',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
        'completed_date',
        'total_cost',
        'notes',
        'specifications',
        'woocommerce_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'completed_date' => 'date',
        'total_cost' => 'decimal:2',
        'specifications' => 'array',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class, 'assigned_worker_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'order_materials')
                    ->withPivot('quantity_used', 'cost')
                    ->withTimestamps();
    }

    public function measurements()
    {
        return $this->hasMany(Measurement::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function productionTracking()
    {
        return $this->hasMany(OrderProductionTracking::class);
    }

    public function materialTransactions()
    {
        return $this->hasMany(MaterialTransaction::class);
    }

    // Generate order number
    public static function generateOrderNumber()
    {
        $lastOrder = self::latest()->first();
        $lastNumber = $lastOrder ? intval(substr($lastOrder->title, 4)) : 0;
        return 'ODR-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
