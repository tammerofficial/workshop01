<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductMaterialRequirement extends Model
{
    protected $fillable = [
        'product_type',
        'product_size',
        'material_id',
        'required_quantity',
        'waste_percentage',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'required_quantity' => 'decimal:2',
        'waste_percentage' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    /**
     * العلاقة مع المواد
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
