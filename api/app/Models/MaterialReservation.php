<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'material_id',
        'production_stage_id',
        'quantity_reserved',
        'quantity_used',
        'reservation_date',
        'usage_date',
        'status', // reserved, used, released
        'notes'
    ];

    protected $casts = [
        'reservation_date' => 'datetime',
        'usage_date' => 'datetime',
        'quantity_reserved' => 'decimal:3',
        'quantity_used' => 'decimal:3',
    ];

    /**
     * Get the order that owns the reservation.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the material that is reserved.
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    /**
     * Get the production stage for this reservation.
     */
    public function productionStage(): BelongsTo
    {
        return $this->belongsTo(ProductionStage::class);
    }

    /**
     * Get remaining reserved quantity.
     */
    public function getRemainingQuantityAttribute(): float
    {
        return $this->quantity_reserved - ($this->quantity_used ?? 0);
    }

    /**
     * Check if reservation is fully used.
     */
    public function isFullyUsed(): bool
    {
        return $this->quantity_used >= $this->quantity_reserved;
    }

    /**
     * Release unused reservation.
     */
    public function release(): void
    {
        $this->update([
            'status' => 'released',
            'quantity_used' => $this->quantity_used ?? 0
        ]);

        // Return unused quantity to material stock
        if ($this->remaining_quantity > 0) {
            $this->material->increment('quantity', $this->remaining_quantity);
        }
    }
}
