<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'collection_id',
        'sku',
        'price',
        'production_hours', // ساعات الإنتاج المتوقعة للمنتج
        'stage_requirements', // متطلبات كل مرحلة
        'material_requirements', // المواد المطلوبة
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'production_hours' => 'integer',
        'stage_requirements' => 'array', // {design: 2, cutting: 3, sewing: 8, fitting: 2, finishing: 3, quality_check: 1}
        'material_requirements' => 'array', // {fabric: 3.5, thread: 2, buttons: 8}
        'is_active' => 'boolean'
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Helper methods
    public function getTotalProductionHours()
    {
        return collect($this->stage_requirements)->sum();
    }

    public function getStageHours($stageName)
    {
        return $this->stage_requirements[$stageName] ?? 0;
    }
}
