<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'name',
        'name_ar',
        'description',
        'description_ar',
        'category_id',
        'type',
        'brand',
        'model',
        'color',
        'size',
        'material',
        'pattern',
        'quantity',
        'reserved_quantity',
        'minimum_quantity',
        'maximum_quantity',
        'unit',
        'unit_weight',
        'weight_unit',
        'purchase_price',
        'selling_price',
        'wholesale_price',
        'currency',
        'cost_per_unit',
        'supplier_name',
        'supplier_code',
        'supplier_item_code',
        'last_purchase_date',
        'last_purchase_price',
        'warehouse_location',
        'shelf_location',
        'bin_location',
        'barcode',
        'qr_code',
        'status',
        'is_active',
        'is_trackable',
        'allow_negative_stock',
        'expiry_date',
        'last_counted_date',
        'last_movement_date',
        'quality_grade',
        'width',
        'length',
        'thickness',
        'origin_country',
        'certification',
        'images',
        'documents',
        'tags',
        'metadata',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'reserved_quantity' => 'decimal:3',
        'minimum_quantity' => 'decimal:3',
        'maximum_quantity' => 'decimal:3',
        'unit_weight' => 'decimal:3',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'last_purchase_price' => 'decimal:2',
        'width' => 'decimal:2',
        'length' => 'decimal:2',
        'thickness' => 'decimal:3',
        'is_active' => 'boolean',
        'is_trackable' => 'boolean',
        'allow_negative_stock' => 'boolean',
        'last_purchase_date' => 'date',
        'expiry_date' => 'date',
        'last_counted_date' => 'date',
        'last_movement_date' => 'date',
        'images' => 'array',
        'documents' => 'array',
        'tags' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the category that owns the inventory item.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Scope to get only active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get items by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get items in stock.
     */
    public function scopeInStock($query)
    {
        return $query->where('status', 'in_stock')
                    ->where('quantity', '>', 0);
    }

    /**
     * Scope to get low stock items.
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'minimum_quantity')
                    ->where('quantity', '>', 0);
    }

    /**
     * Scope to get out of stock items.
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', '<=', 0);
    }

    /**
     * Get available quantity (total - reserved).
     */
    public function getAvailableQuantityAttribute()
    {
        return $this->quantity - $this->reserved_quantity;
    }

    /**
     * Get localized name.
     */
    public function getLocalizedNameAttribute()
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name;
    }

    /**
     * Get localized description.
     */
    public function getLocalizedDescriptionAttribute()
    {
        return app()->getLocale() === 'ar' && $this->description_ar ? $this->description_ar : $this->description;
    }

    /**
     * Get stock status.
     */
    public function getStockStatusAttribute()
    {
        if ($this->quantity <= 0) return 'out_of_stock';
        if ($this->quantity <= $this->minimum_quantity) return 'low_stock';
        return 'in_stock';
    }

    /**
     * Get stock level percentage.
     */
    public function getStockLevelPercentageAttribute()
    {
        if ($this->maximum_quantity <= 0) return 0;
        return ($this->quantity / $this->maximum_quantity) * 100;
    }

    /**
     * Check if item needs reordering.
     */
    public function needsReorder()
    {
        return $this->quantity <= $this->minimum_quantity;
    }

    /**
     * Check if quantity is available for reservation.
     */
    public function canReserve($quantity)
    {
        return $this->available_quantity >= $quantity;
    }

    /**
     * Reserve quantity for an order.
     */
    public function reserve($quantity)
    {
        if (!$this->canReserve($quantity)) {
            throw new \Exception('Insufficient quantity available for reservation');
        }
        
        $this->increment('reserved_quantity', $quantity);
        return true;
    }

    /**
     * Release reserved quantity.
     */
    public function releaseReservation($quantity)
    {
        $this->decrement('reserved_quantity', min($quantity, $this->reserved_quantity));
        return true;
    }

    /**
     * Consume inventory (reduce actual quantity).
     */
    public function consume($quantity)
    {
        if (!$this->allow_negative_stock && $this->quantity < $quantity) {
            throw new \Exception('Insufficient stock available');
        }
        
        $this->decrement('quantity', $quantity);
        $this->update(['last_movement_date' => now()]);
        
        // Update status based on new quantity
        $this->updateStatus();
        
        return true;
    }

    /**
     * Add inventory (increase quantity).
     */
    public function addStock($quantity, $cost = null)
    {
        $this->increment('quantity', $quantity);
        
        if ($cost) {
            $this->update(['last_purchase_price' => $cost]);
        }
        
        $this->update(['last_movement_date' => now()]);
        $this->updateStatus();
        
        return true;
    }

    /**
     * Update status based on current quantity.
     */
    protected function updateStatus()
    {
        if ($this->quantity <= 0) {
            $status = 'out_of_stock';
        } elseif ($this->quantity <= $this->minimum_quantity) {
            $status = 'low_stock';
        } else {
            $status = 'in_stock';
        }
        
        $this->update(['status' => $status]);
    }
}