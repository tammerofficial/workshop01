<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'sku',
        'quantity',
        'unit',
        'cost_per_unit',
        'supplier',
        'reorder_level',
        'location',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'cost_per_unit' => 'decimal:2',
        'reorder_level' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_materials')
                    ->withPivot('quantity_used', 'cost')
                    ->withTimestamps();
    }

    public function isLowStock()
    {
        return $this->quantity <= $this->reorder_level;
    }
}
