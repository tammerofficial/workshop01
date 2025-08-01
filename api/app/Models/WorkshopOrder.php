<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkshopOrder extends Model
{
    use HasFactory;

    protected $table = 'workshop_orders';

    protected $fillable = [
        'order_number',
        'source_type',
        'source_id',
        'client_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'estimated_cost',
        'final_cost',
        'selling_price',
        'currency',
        'status',
        'priority',
        'estimated_delivery_date',
        'actual_delivery_date',
        'delivery_address',
        'assigned_manager_id',
        'manager_notes',
        'production_notes',
        'customer_notes',
        'special_requirements',
        'progress_percentage',
        'accepted_at',
        'production_started_at',
        'completed_at',
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:3',
        'final_cost' => 'decimal:3',
        'selling_price' => 'decimal:3',
        'delivery_address' => 'array',
        'special_requirements' => 'array',
        'progress_percentage' => 'decimal:2',
        'estimated_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'accepted_at' => 'datetime',
        'production_started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships

    public function orderItems(): HasMany
    {
        return $this->hasMany(WorkshopOrderItem::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function assignedManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_manager_id');
    }

    public function sourceWooCommerceOrder(): HasOne
    {
        return $this->hasOne(WooCommerceOrder::class, 'workshop_order_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopePendingAcceptance($query)
    {
        return $query->where('status', 'pending_acceptance');
    }

    // Helper Methods
    public function generateOrderNumber(): string
    {
        return 'WS-' . now()->format('Ymd') . '-' . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    public function getTotalItemsAttribute()
    {
        return $this->orderItems()->sum('quantity');
    }

    public function canBeAccepted(): bool
    {
        return $this->status === 'pending_acceptance';
    }

    public function canStartProduction(): bool
    {
        return in_array($this->status, ['accepted', 'materials_reserved']);
    }
}