<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WooCommerceOrderItem extends Model
{
    use HasFactory;

    protected $table = 'woocommerce_order_items';

    protected $fillable = [
        'woocommerce_order_id',
        'wc_order_item_id',
        'wc_product_id',
        'product_id',
        'product_name',
        'product_sku',
        'unit_price',
        'quantity',
        'line_total',
        'line_tax',
        'product_meta',
        'product_attributes',
        'item_notes',
        'is_cloned_to_workshop',
        'workshop_order_item_id',
    ];

    protected $casts = [
        'unit_price' => 'decimal:3',
        'line_total' => 'decimal:3',
        'line_tax' => 'decimal:3',
        'product_meta' => 'array',
        'product_attributes' => 'array',
        'is_cloned_to_workshop' => 'boolean',
    ];

    // Relationships

    /**
     * Get the WooCommerce order this item belongs to
     */
    public function wooCommerceOrder(): BelongsTo
    {
        return $this->belongsTo(WooCommerceOrder::class, 'woocommerce_order_id');
    }

    /**
     * Get the linked local product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the cloned workshop order item
     */
    public function workshopOrderItem(): BelongsTo
    {
        return $this->belongsTo(WorkshopOrderItem::class, 'workshop_order_item_id');
    }

    // Scopes

    /**
     * Scope to get items that are not cloned yet
     */
    public function scopeNotCloned($query)
    {
        return $query->where('is_cloned_to_workshop', false);
    }

    // Helper Methods

    /**
     * Get product variations as formatted string
     */
    public function getVariationsStringAttribute()
    {
        if (!$this->product_attributes) return '';
        
        return collect($this->product_attributes)
            ->map(fn($value, $key) => "{$key}: {$value}")
            ->implode(', ');
    }

    /**
     * Check if this item has a linked local product
     */
    public function hasLinkedProduct(): bool
    {
        return !is_null($this->product_id);
    }

    /**
     * Get total with tax
     */
    public function getTotalWithTaxAttribute()
    {
        return $this->line_total + $this->line_tax;
    }
}
