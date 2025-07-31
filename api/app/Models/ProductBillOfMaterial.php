<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductBillOfMaterial extends Model
{
    use HasFactory;

    protected $table = 'product_bill_of_materials';

    protected $fillable = [
        'product_id',
        'material_id', // يشير إلى Product بنوع raw_material أو product_part
        'quantity_required',
        'unit',
        'cost_per_unit',
        'total_cost',
        'is_optional',
        'notes'
    ];

    protected $casts = [
        'quantity_required' => 'decimal:4',
        'cost_per_unit' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'is_optional' => 'boolean'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function material()
    {
        return $this->belongsTo(Product::class, 'material_id');
    }

    // Calculate total cost automatically
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->cost_per_unit && $model->quantity_required) {
                $model->total_cost = $model->cost_per_unit * $model->quantity_required;
            }
        });
    }

    // Helper methods
    public function updateCostFromMaterial()
    {
        if ($this->material) {
            $this->cost_per_unit = $this->material->purchase_price ?? $this->material->price ?? 0;
            $this->total_cost = $this->cost_per_unit * $this->quantity_required;
            $this->save();
        }
    }

    public function checkAvailability($quantityToProduce = 1)
    {
        if (!$this->material) {
            return false;
        }

        $requiredQuantity = $this->quantity_required * $quantityToProduce;
        $availableQuantity = $this->material->stock_quantity ?? 0;

        return $availableQuantity >= $requiredQuantity;
    }

    public function getShortage($quantityToProduce = 1)
    {
        if (!$this->material) {
            return $this->quantity_required * $quantityToProduce;
        }

        $requiredQuantity = $this->quantity_required * $quantityToProduce;
        $availableQuantity = $this->material->stock_quantity ?? 0;

        return max(0, $requiredQuantity - $availableQuantity);
    }
}
