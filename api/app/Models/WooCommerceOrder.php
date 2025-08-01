<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WooCommerceOrder extends Model
{
    use HasFactory;

    protected $table = 'woocommerce_orders';

    protected $fillable = [
        'wc_order_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'total_amount',
        'tax_amount',
        'shipping_amount',
        'currency',
        'status',
        'payment_status',
        'payment_method',
        'billing_address',
        'shipping_address',
        'customer_notes',
        'order_notes',
        'is_cloned_to_workshop',
        'workshop_order_id',
        'order_date',
    ];

    protected $casts = [
        'total_amount' => 'decimal:3',
        'tax_amount' => 'decimal:3',
        'shipping_amount' => 'decimal:3',
        'billing_address' => 'array',
        'shipping_address' => 'array',
        'is_cloned_to_workshop' => 'boolean',
        'order_date' => 'datetime',
    ];

    // Relationships

    /**
     * Get the order items for this WooCommerce order
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(WooCommerceOrderItem::class, 'woocommerce_order_id');
    }

    /**
     * Get the cloned workshop order if exists
     */
    public function workshopOrder(): BelongsTo
    {
        return $this->belongsTo(WorkshopOrder::class, 'workshop_order_id');
    }

    // Scopes

    /**
     * Scope to get orders that are not cloned yet
     */
    public function scopeNotCloned($query)
    {
        return $query->where('is_cloned_to_workshop', false);
    }

    /**
     * Scope to get orders by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get recent orders
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('order_date', '>=', now()->subDays($days));
    }

    // Helper Methods

    /**
     * Get total items count
     */
    public function getTotalItemsAttribute()
    {
        return $this->orderItems()->sum('quantity');
    }

    /**
     * Check if order can be cloned to workshop
     */
    public function canBeCloned(): bool
    {
        return !$this->is_cloned_to_workshop && 
               in_array($this->status, ['processing', 'on-hold', 'completed']);
    }

    /**
     * Get formatted order number
     */
    public function getFormattedOrderNumberAttribute()
    {
        return $this->order_number ?: "WC-{$this->wc_order_id}";
    }

    /**
     * Get customer full address
     */
    public function getCustomerFullAddressAttribute()
    {
        $address = $this->billing_address ?: $this->shipping_address;
        
        if (!$address) return '';
        
        return collect($address)
            ->filter()
            ->values()
            ->implode(', ');
    }
}
