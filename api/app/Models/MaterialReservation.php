<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialReservation extends Model
{
    protected $fillable = [
        'order_id',
        'material_id',
        'reserved_quantity',
        'reserved_at',
        'expires_at',
        'status',
        'notes'
    ];

    protected $casts = [
        'reserved_quantity' => 'decimal:2',
        'reserved_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * العلاقة مع الطلب
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * العلاقة مع المواد
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
