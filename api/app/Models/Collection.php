<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'season', // spring, summer, fall, winter
        'year',
        'is_active'
    ];

    protected $casts = [
        'year' => 'integer',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasManyThrough(Order::class, Product::class);
    }
}
