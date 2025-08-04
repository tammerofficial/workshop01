<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'name_ar', 'description', 'description_ar', 'sku', 'barcode',
        'price', 'sale_price', 'cost_price', 'stock_quantity', 'min_stock_level',
        'max_stock_level', 'unit', 'category', 'brand', 'images', 'colors',
        'sizes', 'specifications', 'features', 'care_instructions', 'is_active',
        'is_featured', 'is_customizable', 'track_stock', 'status', 'weight', 'custom_options'
    ];

    protected $casts = [
        'images' => 'array',
        'colors' => 'array', 
        'sizes' => 'array',
        'specifications' => 'array',
        'features' => 'array',
        'care_instructions' => 'array',
        'custom_options' => 'array',
        'price' => 'decimal:3',
        'sale_price' => 'decimal:3',
        'cost_price' => 'decimal:3',
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_customizable' => 'boolean',
        'track_stock' => 'boolean'
    ];

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function stockAlerts(): HasMany
    {
        return $this->hasMany(StockAlert::class);
    }

    public function locationInventory(): HasMany
    {
        return $this->hasMany(LocationInventory::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'min_stock_level');
    }

    public function updateStock($quantity, $type = 'adjustment', $reference_type = null, $reference_id = null, $user_id = null)
    {
        $previous_quantity = $this->stock_quantity;
        
        if ($type === 'in') {
            $this->stock_quantity += $quantity;
        } elseif ($type === 'out') {
            $this->stock_quantity -= $quantity;
                } else {
            $this->stock_quantity = $quantity;
        }

        $this->save();

        // Record movement
        $this->inventoryMovements()->create([
            'type' => $type,
            'quantity' => $type === 'out' ? -abs($quantity) : abs($quantity),
            'previous_quantity' => $previous_quantity,
            'new_quantity' => $this->stock_quantity,
            'reference_type' => $reference_type,
            'reference_id' => $reference_id,
            'user_id' => $user_id
        ]);

        return $this;
    }
}