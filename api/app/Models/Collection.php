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
        'color',
        'image_url',
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

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBySeason($query, $season)
    {
        return $query->where('season', $season);
    }

    public function scopeByYear($query, $year)
    {
        return $query->where('year', $year);
    }

    // Helper methods
    public function getProductsCount()
    {
        return $this->products()->count();
    }

    public function getActiveProductsCount()
    {
        return $this->products()->where('is_active', true)->count();
    }
}
