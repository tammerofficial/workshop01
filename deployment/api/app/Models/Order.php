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
}
