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

    // Production stage requirements for this product
    public function stageRequirements()
    {
        return $this->hasMany(ProductStageRequirement::class);
    }

    // Worker requirements for this product
    public function workerRequirements()
    {
        return $this->hasMany(ProductWorkerRequirement::class);
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

    // Calculate total production time from stage requirements
    public function calculateTotalProductionTime()
    {
        $stages = $this->stageRequirements()->active()->ordered()->get();
        $totalHours = 0;
        $parallelGroups = [];

        foreach ($stages as $stage) {
            if ($stage->is_parallel && $stage->parallel_stages) {
                // معالجة المراحل المتوازية
                $groupKey = implode('-', sort($stage->parallel_stages));
                if (!isset($parallelGroups[$groupKey])) {
                    $parallelGroups[$groupKey] = $stage->getTotalEstimatedTime();
                } else {
                    $parallelGroups[$groupKey] = max($parallelGroups[$groupKey], $stage->getTotalEstimatedTime());
                }
            } else {
                // مراحل متسلسلة
                $totalHours += $stage->getTotalEstimatedTime();
            }
        }

        // إضافة أطول مرحلة من كل مجموعة متوازية
        $totalHours += array_sum($parallelGroups);

        return $totalHours;
    }

    // Get total worker requirements
    public function getTotalWorkerRequirements()
    {
        $stages = $this->stageRequirements()->active()->with('workerRequirements.worker')->get();
        $workerSummary = [];

        foreach ($stages as $stage) {
            foreach ($stage->workerRequirements as $workerReq) {
                $workerId = $workerReq->worker_id;
                $workerName = $workerReq->worker->name ?? 'Unknown';
                
                if (!isset($workerSummary[$workerId])) {
                    $workerSummary[$workerId] = [
                        'worker_id' => $workerId,
                        'worker_name' => $workerName,
                        'total_hours' => 0,
                        'stages' => [],
                        'is_critical' => false
                    ];
                }

                $workerSummary[$workerId]['total_hours'] += $workerReq->getAdjustedHours($stage->estimated_hours);
                $workerSummary[$workerId]['stages'][] = [
                    'stage_name' => $stage->productionStage->name ?? 'Unknown',
                    'hours' => $workerReq->getAdjustedHours($stage->estimated_hours),
                    'is_primary' => $workerReq->is_primary,
                    'can_supervise' => $workerReq->can_supervise
                ];

                if ($stage->is_critical) {
                    $workerSummary[$workerId]['is_critical'] = true;
                }
            }
        }

        return array_values($workerSummary);
    }

    // Calculate total production cost
    public function calculateProductionCost()
    {
        $materialCost = $this->calculatePurchasePriceFromBOM();
        $laborCost = 0;

        $stages = $this->stageRequirements()->active()->with('workerRequirements.worker')->get();
        
        foreach ($stages as $stage) {
            $stageCost = $stage->calculateStageCost();
            $laborCost += $stageCost;
        }

        return [
            'material_cost' => $materialCost,
            'labor_cost' => $laborCost,
            'total_cost' => $materialCost + $laborCost,
            'suggested_price' => ($materialCost + $laborCost) * 1.3 // 30% markup
        ];
    }

    // Check production readiness
    public function checkProductionReadiness($quantity = 1)
    {
        $issues = [];

        // تحقق من توفر المواد
        $materialShortages = $this->checkMaterialAvailability($quantity);
        if (!empty($materialShortages)) {
            $issues['materials'] = $materialShortages;
        }

        // تحقق من توفر العمال
        $workerAvailability = $this->checkWorkerAvailability();
        if (!empty($workerAvailability['unavailable'])) {
            $issues['workers'] = $workerAvailability['unavailable'];
        }

        // تحقق من اكتمال تعريف المراحل
        $stageCount = $this->stageRequirements()->active()->count();
        if ($stageCount == 0) {
            $issues['stages'] = 'No production stages defined for this product';
        }

        return [
            'ready' => empty($issues),
            'issues' => $issues,
            'estimated_completion_hours' => $this->calculateTotalProductionTime()
        ];
    }

    // Check worker availability for all stages
    public function checkWorkerAvailability()
    {
        $available = [];
        $unavailable = [];

        $stages = $this->stageRequirements()->active()->get();
        
        foreach ($stages as $stage) {
            $availableWorkers = ProductWorkerRequirement::getAvailableWorkersForStage($this->id, $stage->production_stage_id);
            $requiredCount = $stage->required_workers;
            
            if ($availableWorkers->count() >= $requiredCount) {
                $available[$stage->productionStage->name] = $availableWorkers->take($requiredCount);
            } else {
                $unavailable[$stage->productionStage->name] = [
                    'required' => $requiredCount,
                    'available' => $availableWorkers->count(),
                    'shortage' => $requiredCount - $availableWorkers->count()
                ];
            }
        }

        return [
            'available' => $available,
            'unavailable' => $unavailable
        ];
    }

    // Auto-assign workers for production
    public function autoAssignWorkers($orderId)
    {
        $assignments = [];
        $stages = $this->stageRequirements()->active()->ordered()->get();

        foreach ($stages as $stage) {
            $requiredWorkers = $stage->required_workers;
            $availableWorkers = ProductWorkerRequirement::getAvailableWorkersForStage($this->id, $stage->production_stage_id);

            for ($i = 0; $i < $requiredWorkers && $i < $availableWorkers->count(); $i++) {
                $workerReq = $availableWorkers[$i];
                
                $assignments[] = [
                    'order_id' => $orderId,
                    'production_stage_id' => $stage->production_stage_id,
                    'worker_id' => $workerReq->worker_id,
                    'estimated_hours' => $workerReq->getAdjustedHours($stage->estimated_hours),
                    'hourly_rate' => $workerReq->hourly_rate ?? $workerReq->worker->hourly_rate ?? 0,
                    'is_primary' => $workerReq->is_primary
                ];
            }
        }

        return $assignments;
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
