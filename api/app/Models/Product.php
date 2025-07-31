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
        'purchase_price', // سعر الشراء/التكلفة
        'production_hours', // ساعات الإنتاج المتوقعة للمنتج
        'stage_requirements', // متطلبات كل مرحلة
        'material_requirements', // المواد المطلوبة - deprecated in favor of BOM
        'product_type', // simple, variable, raw_material, product_part
        'stock_quantity',
        'manage_stock',
        'auto_calculate_purchase_price', // حساب تلقائي لسعر الشراء من BOM
        'manufacturing_time_days', // مدة التصنيع بالأيام
        'woocommerce_id',
        'woocommerce_data', // بيانات إضافية من WooCommerce
        'image_url',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'production_hours' => 'integer',
        'manufacturing_time_days' => 'integer',
        'stock_quantity' => 'integer',
        'stage_requirements' => 'array',
        'material_requirements' => 'array',
        'woocommerce_data' => 'array',
        'manage_stock' => 'boolean',
        'auto_calculate_purchase_price' => 'boolean',
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

    // Bill of Materials - Materials required for this product
    public function billOfMaterials()
    {
        return $this->hasMany(ProductBillOfMaterial::class);
    }

    // Materials where this product is used (if this is a raw material/part)
    public function usedInProducts()
    {
        return $this->hasMany(ProductBillOfMaterial::class, 'material_id');
    }

    // Material transactions for this product
    public function materialTransactions()
    {
        return $this->hasMany(MaterialTransaction::class, 'material_id');
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

    // Calculate purchase price from Bill of Materials
    public function calculatePurchasePriceFromBOM()
    {
        if (!$this->auto_calculate_purchase_price) {
            return $this->purchase_price;
        }

        $totalCost = 0;
        foreach ($this->billOfMaterials as $bomItem) {
            $material = $bomItem->material;
            if ($material) {
                $materialCost = $material->purchase_price ?? $material->price ?? 0;
                $totalCost += $materialCost * $bomItem->quantity_required;
            }
        }

        return $totalCost;
    }

    // Update purchase price from BOM
    public function updatePurchasePriceFromBOM()
    {
        if ($this->auto_calculate_purchase_price) {
            $this->purchase_price = $this->calculatePurchasePriceFromBOM();
            $this->save();
        }
    }

    // Check if materials are available for production
    public function checkMaterialAvailability($quantityToProduce = 1)
    {
        $shortages = [];
        
        foreach ($this->billOfMaterials as $bomItem) {
            $material = $bomItem->material;
            if ($material) {
                $requiredQuantity = $bomItem->quantity_required * $quantityToProduce;
                $availableQuantity = $material->stock_quantity ?? 0;
                
                if ($availableQuantity < $requiredQuantity) {
                    $shortages[] = [
                        'material' => $material,
                        'required' => $requiredQuantity,
                        'available' => $availableQuantity,
                        'shortage' => $requiredQuantity - $availableQuantity
                    ];
                }
            }
        }
        
        return $shortages;
    }

    // Reserve materials for production
    public function reserveMaterialsForProduction($orderId, $quantity = 1)
    {
        $reservations = [];
        
        foreach ($this->billOfMaterials as $bomItem) {
            $material = $bomItem->material;
            if ($material) {
                $requiredQuantity = $bomItem->quantity_required * $quantity;
                
                // Create material transaction for reservation
                $transaction = MaterialTransaction::create([
                    'material_id' => $material->id,
                    'order_id' => $orderId,
                    'product_id' => $this->id,
                    'transaction_type' => 'reserved',
                    'quantity' => $requiredQuantity,
                    'unit_cost' => $material->purchase_price ?? $material->price ?? 0,
                    'total_cost' => ($material->purchase_price ?? $material->price ?? 0) * $requiredQuantity,
                    'reference_number' => 'RESERVE-' . $orderId . '-' . $this->id,
                    'notes' => "Reserved for Order #{$orderId} - Product: {$this->name}"
                ]);
                
                // Update material stock (reserved quantity)
                $material->decrement('stock_quantity', $requiredQuantity);
                
                $reservations[] = $transaction;
            }
        }
        
        return $reservations;
    }

    // Product types
    public function isRawMaterial()
    {
        return $this->product_type === 'raw_material';
    }

    public function isProductPart()
    {
        return $this->product_type === 'product_part';
    }

    public function isFinishedProduct()
    {
        return in_array($this->product_type, ['simple', 'variable']);
    }

    // Sync with WooCommerce
    public function syncWithWooCommerce($wooCommerceData)
    {
        $this->update([
            'name' => $wooCommerceData['name'] ?? $this->name,
            'description' => $wooCommerceData['description'] ?? $this->description,
            'price' => $wooCommerceData['regular_price'] ?? $this->price,
            'sku' => $wooCommerceData['sku'] ?? $this->sku,
            'stock_quantity' => $wooCommerceData['stock_quantity'] ?? $this->stock_quantity,
            'manage_stock' => $wooCommerceData['manage_stock'] ?? $this->manage_stock,
            'woocommerce_data' => $wooCommerceData,
            'image_url' => $wooCommerceData['images'][0]['src'] ?? $this->image_url
        ]);
    }
}
