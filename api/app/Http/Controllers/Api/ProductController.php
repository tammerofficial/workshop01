<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBillOfMaterial;
use App\Models\ProductStageRequirement;
use App\Models\ProductWorkerRequirement;
use App\Models\ProductionStage;
use App\Models\Worker;
use App\Models\Category;
use App\Models\Collection;
use App\Services\WooCommerceProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'collection', 'billOfMaterials.material']);

        // Filter by product type
        if ($request->has('type')) {
            $query->where('product_type', $request->type);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'low':
                    $query->where('stock_quantity', '<=', 10);
                    break;
                case 'out':
                    $query->where('stock_quantity', 0);
                    break;
                case 'in_stock':
                    $query->where('stock_quantity', '>', 0);
                    break;
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // WooCommerce filter
        if ($request->has('woocommerce_only') && $request->boolean('woocommerce_only')) {
            $query->whereNotNull('woocommerce_id');
        }

        // Exclude WooCommerce products
        if ($request->has('exclude_woocommerce') && $request->boolean('exclude_woocommerce')) {
            $query->whereNull('woocommerce_id');
        }

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products',
            'product_type' => 'required|in:simple,variable,raw_material,product_part',
            'price' => 'required|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'stock_quantity' => 'nullable|integer|min:0',
            'manufacturing_time_days' => 'nullable|integer|min:0',
            'production_hours' => 'nullable|integer|min:0',
            'stage_requirements' => 'nullable|array',
            'manage_stock' => 'boolean',
            'auto_calculate_purchase_price' => 'boolean',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $product = Product::create($request->all());

            // Handle Bill of Materials if provided
            if ($request->has('bill_of_materials')) {
                $this->syncBillOfMaterials($product, $request->bill_of_materials);
            }

            // Recalculate purchase price if auto calculation is enabled
            if ($product->auto_calculate_purchase_price) {
                $product->calculatePurchasePriceFromBOM();
                $product->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product->load(['category', 'collection', 'billOfMaterials.material'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error creating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product
     */
    public function show($id): JsonResponse
    {
        $product = Product::with([
            'category', 
            'collection', 
            'billOfMaterials.material',
            'usedInProducts.product',
            'orders'
        ])->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'product_type' => 'required|in:simple,variable,raw_material,product_part',
            'price' => 'required|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'stock_quantity' => 'nullable|integer|min:0',
            'manufacturing_time_days' => 'nullable|integer|min:0',
            'production_hours' => 'nullable|integer|min:0',
            'stage_requirements' => 'nullable|array',
            'manage_stock' => 'boolean',
            'auto_calculate_purchase_price' => 'boolean',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $product->update($request->all());

            // Handle Bill of Materials if provided
            if ($request->has('bill_of_materials')) {
                $this->syncBillOfMaterials($product, $request->bill_of_materials);
            }

            // Recalculate purchase price if auto calculation is enabled
            if ($product->auto_calculate_purchase_price) {
                $product->calculatePurchasePriceFromBOM();
                $product->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product->load(['category', 'collection', 'billOfMaterials.material'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified product
     */
    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        // Check if product is used in any orders
        if ($product->orders()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete product that has associated orders'
            ], 422);
        }

        // Check if product is used in any Bill of Materials
        if ($product->usedInProducts()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete product that is used in other products Bill of Materials'
            ], 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get manufacturing requirements for a product
     */
    public function getManufacturingRequirements($id, Request $request): JsonResponse
    {
        $product = Product::with(['billOfMaterials.material'])->findOrFail($id);
        $quantity = $request->get('quantity', 1);

        $requirements = [];
        $shortages = [];
        $canManufacture = true;

        foreach ($product->billOfMaterials as $bom) {
            $requiredQuantity = $bom->quantity_required * $quantity;
            $availableQuantity = $bom->material->stock_quantity ?? 0;
            $shortage = max(0, $requiredQuantity - $availableQuantity);

            if ($shortage > 0) {
                $canManufacture = false;
                $shortages[] = [
                    'material' => $bom->material,
                    'required' => $requiredQuantity,
                    'available' => $availableQuantity,
                    'shortage' => $shortage
                ];
            }

            $requirements[] = [
                'material' => $bom->material,
                'quantity_required' => $requiredQuantity,
                'available_quantity' => $availableQuantity,
                'is_sufficient' => $shortage == 0,
                'shortage' => $shortage
            ];
        }

        return response()->json([
            'product' => $product,
            'quantity_to_manufacture' => $quantity,
            'can_manufacture' => $canManufacture,
            'requirements' => $requirements,
            'shortages' => $shortages,
            'estimated_manufacturing_time' => $product->manufacturing_time_days * $quantity
        ]);
    }

    /**
     * Reserve materials for manufacturing
     */
    public function reserveMaterials($id, Request $request): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'order_id' => 'required|exists:orders,id'
        ]);

        $product = Product::with(['billOfMaterials.material'])->findOrFail($id);
        $quantity = $request->quantity;
        $orderId = $request->order_id;

        DB::beginTransaction();
        try {
            $reservations = [];

            foreach ($product->billOfMaterials as $bom) {
                $requiredQuantity = $bom->quantity_required * $quantity;
                $availableQuantity = $bom->material->stock_quantity ?? 0;

                if ($availableQuantity < $requiredQuantity) {
                    throw new \Exception("Insufficient stock for material: {$bom->material->name}");
                }

                // Update stock quantity
                $bom->material->decrement('stock_quantity', $requiredQuantity);

                // Create material transaction record
                $bom->material->materialTransactions()->create([
                    'order_id' => $orderId,
                    'transaction_type' => 'reserved',
                    'quantity' => $requiredQuantity,
                    'unit_cost' => $bom->cost_per_unit,
                    'total_cost' => $bom->cost_per_unit * $requiredQuantity,
                    'reference_number' => "RESERVE-{$orderId}-{$product->id}",
                    'notes' => "Reserved for manufacturing product: {$product->name}"
                ]);

                $reservations[] = [
                    'material' => $bom->material->name,
                    'quantity_reserved' => $requiredQuantity,
                    'remaining_stock' => $bom->material->fresh()->stock_quantity
                ];
            }

            DB::commit();

            return response()->json([
                'message' => 'Materials reserved successfully',
                'reservations' => $reservations
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error reserving materials',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync Bill of Materials for a product
     */
    private function syncBillOfMaterials(Product $product, array $billOfMaterials)
    {
        // Remove existing BOM entries
        $product->billOfMaterials()->delete();

        // Add new BOM entries
        foreach ($billOfMaterials as $bom) {
            $product->billOfMaterials()->create([
                'material_id' => $bom['material_id'],
                'quantity_required' => $bom['quantity_required'],
                'unit' => $bom['unit'] ?? 'piece',
                'cost_per_unit' => $bom['cost_per_unit'] ?? 0,
                'is_optional' => $bom['is_optional'] ?? false,
                'notes' => $bom['notes'] ?? ''
            ]);
        }
    }

    /**
     * Get all raw materials and product parts for BOM
     */
    public function getMaterialsForBOM(): JsonResponse
    {
        $materials = Product::whereIn('product_type', ['raw_material', 'product_part'])
            ->where('is_active', true)
            ->select('id', 'name', 'sku', 'product_type', 'price', 'purchase_price', 'stock_quantity')
            ->orderBy('name')
            ->get();

        return response()->json($materials);
    }

    /**
     * Get production stages and requirements for a product
     */
    public function getProductionRequirements($id): JsonResponse
    {
        $product = Product::with([
            'stageRequirements.productionStage',
            'stageRequirements.workerRequirements.worker',
            'billOfMaterials.material'
        ])->findOrFail($id);

        $productionData = [
            'product' => $product,
            'total_production_time' => $product->calculateTotalProductionTime(),
            'worker_requirements' => $product->getTotalWorkerRequirements(),
            'production_cost' => $product->calculateProductionCost(),
            'production_readiness' => $product->checkProductionReadiness()
        ];

        return response()->json($productionData);
    }

    /**
     * Update production stages for a product
     */
    public function updateProductionStages($id, Request $request): JsonResponse
    {
        $request->validate([
            'stages' => 'required|array',
            'stages.*.production_stage_id' => 'required|exists:production_stages,id',
            'stages.*.order_sequence' => 'required|integer|min:1',
            'stages.*.estimated_hours' => 'required|integer|min:0',
            'stages.*.required_workers' => 'required|integer|min:1',
            'stages.*.skill_requirements' => 'nullable|array',
            'stages.*.equipment_requirements' => 'nullable|array',
            'stages.*.is_parallel' => 'boolean',
            'stages.*.parallel_stages' => 'nullable|array',
            'stages.*.is_critical' => 'boolean',
            'stages.*.buffer_time_hours' => 'nullable|integer|min:0',
            'stages.*.notes' => 'nullable|string'
        ]);

        $product = Product::findOrFail($id);

        DB::beginTransaction();
        try {
            // حذف المراحل الموجودة
            $product->stageRequirements()->delete();
            
            // إضافة المراحل الجديدة
            foreach ($request->stages as $stageData) {
                $product->stageRequirements()->create([
                    'production_stage_id' => $stageData['production_stage_id'],
                    'order_sequence' => $stageData['order_sequence'],
                    'estimated_hours' => $stageData['estimated_hours'],
                    'required_workers' => $stageData['required_workers'],
                    'skill_requirements' => $stageData['skill_requirements'] ?? null,
                    'equipment_requirements' => $stageData['equipment_requirements'] ?? null,
                    'is_parallel' => $stageData['is_parallel'] ?? false,
                    'parallel_stages' => $stageData['parallel_stages'] ?? null,
                    'is_critical' => $stageData['is_critical'] ?? false,
                    'buffer_time_hours' => $stageData['buffer_time_hours'] ?? 0,
                    'notes' => $stageData['notes'] ?? null
                ]);
            }

            // تحديث مدة التصنيع في المنتج
            $totalTime = $product->calculateTotalProductionTime();
            $product->update([
                'production_hours' => $totalTime,
                'manufacturing_time_days' => ceil($totalTime / 8) // افتراض 8 ساعات عمل يومياً
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Production stages updated successfully',
                'product' => $product->load(['stageRequirements.productionStage'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating production stages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update worker requirements for a product stage
     */
    public function updateWorkerRequirements($id, Request $request): JsonResponse
    {
        $request->validate([
            'worker_requirements' => 'required|array',
            'worker_requirements.*.stage_requirement_id' => 'required|exists:product_stage_requirements,id',
            'worker_requirements.*.worker_id' => 'required|exists:workers,id',
            'worker_requirements.*.priority' => 'required|integer|min:1',
            'worker_requirements.*.efficiency_rate' => 'required|numeric|min:0.1|max:5.0',
            'worker_requirements.*.required_skills' => 'nullable|array',
            'worker_requirements.*.certifications' => 'nullable|array',
            'worker_requirements.*.hourly_rate' => 'nullable|numeric|min:0',
            'worker_requirements.*.max_concurrent_orders' => 'nullable|integer|min:1',
            'worker_requirements.*.is_primary' => 'boolean',
            'worker_requirements.*.can_supervise' => 'boolean'
        ]);

        $product = Product::findOrFail($id);

        DB::beginTransaction();
        try {
            // حذف متطلبات العمال الموجودة
            $product->workerRequirements()->delete();
            
            // إضافة متطلبات العمال الجديدة
            foreach ($request->worker_requirements as $workerData) {
                $stageRequirement = ProductStageRequirement::findOrFail($workerData['stage_requirement_id']);
                
                $product->workerRequirements()->create([
                    'stage_requirement_id' => $workerData['stage_requirement_id'],
                    'worker_id' => $workerData['worker_id'],
                    'production_stage_id' => $stageRequirement->production_stage_id,
                    'priority' => $workerData['priority'],
                    'efficiency_rate' => $workerData['efficiency_rate'],
                    'required_skills' => $workerData['required_skills'] ?? null,
                    'certifications' => $workerData['certifications'] ?? null,
                    'hourly_rate' => $workerData['hourly_rate'] ?? null,
                    'max_concurrent_orders' => $workerData['max_concurrent_orders'] ?? 1,
                    'is_primary' => $workerData['is_primary'] ?? false,
                    'can_supervise' => $workerData['can_supervise'] ?? false
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Worker requirements updated successfully',
                'product' => $product->load(['workerRequirements.worker', 'workerRequirements.stageRequirement.productionStage'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating worker requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available production stages
     */
    public function getProductionStages(): JsonResponse
    {
        $stages = ProductionStage::active()->ordered()->get();
        return response()->json($stages);
    }

    /**
     * Get available workers for production
     */
    public function getAvailableWorkers(): JsonResponse
    {
        $workers = Worker::where('is_active', true)
            ->select('id', 'name', 'employee_code', 'department', 'position', 'hourly_rate', 'skills')
            ->orderBy('name')
            ->get();
        
        return response()->json($workers);
    }

    /**
     * Check production readiness for multiple products
     */
    public function checkProductionReadiness(Request $request): JsonResponse
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1'
        ]);

        $results = [];
        
        foreach ($request->products as $productData) {
            $product = Product::findOrFail($productData['product_id']);
            $quantity = $productData['quantity'];
            
            $results[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $quantity,
                'readiness' => $product->checkProductionReadiness($quantity)
            ];
        }

        return response()->json($results);
    }

    /**
     * Auto-assign workers for a product
     */
    public function autoAssignWorkers($id, Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id'
        ]);

        $product = Product::with(['stageRequirements.productionStage'])->findOrFail($id);
        $orderId = $request->order_id;

        try {
            $assignments = $product->autoAssignWorkers($orderId);
            
            if (empty($assignments)) {
                return response()->json([
                    'message' => 'No workers available for assignment',
                    'assignments' => []
                ], 422);
            }

            return response()->json([
                'message' => 'Workers assigned successfully',
                'assignments' => $assignments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error assigning workers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complete product setup data
     */
    public function getCompleteProductData($id): JsonResponse
    {
        $product = Product::with([
            'category',
            'collection', 
            'billOfMaterials.material',
            'stageRequirements.productionStage',
            'stageRequirements.workerRequirements.worker'
        ])->findOrFail($id);

        $completeData = [
            'product' => $product,
            'bill_of_materials' => $product->billOfMaterials,
            'stage_requirements' => $product->stageRequirements,
            'worker_requirements' => $product->workerRequirements,
            'production_summary' => [
                'total_production_time' => $product->calculateTotalProductionTime(),
                'total_worker_requirements' => $product->getTotalWorkerRequirements(),
                'production_cost' => $product->calculateProductionCost(),
                'production_readiness' => $product->checkProductionReadiness()
            ],
            'available_stages' => ProductionStage::active()->ordered()->get(),
            'available_workers' => Worker::where('is_active', true)->get(),
            'available_materials' => Product::whereIn('product_type', ['raw_material', 'product_part'])
                ->where('is_active', true)
                ->get()
        ];

        return response()->json($completeData);
    }

    // =======================
    // WooCommerce Integration
    // =======================

    /**
     * Test WooCommerce connection
     */
    public function testWooCommerceConnection(): JsonResponse
    {
        try {
            $service = new WooCommerceProductService();
            $result = $service->testConnection();
            
            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الاتصال: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get WooCommerce import statistics
     */
    public function getWooCommerceStats(): JsonResponse
    {
        try {
            $service = new WooCommerceProductService();
            $stats = $service->getImportStats();
            
            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الإحصائيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import products from WooCommerce (batch)
     */
    public function importWooCommerceProducts(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'batch_size' => 'nullable|integer|min:1|max:100',
            'update_existing' => 'nullable|boolean'
        ]);

        try {
            $service = new WooCommerceProductService();
            
            $page = $request->get('page', 1);
            $batchSize = $request->get('batch_size', 50);
            $updateExisting = $request->get('update_existing', false);

            $result = $service->importProductsBatch($page, $batchSize, $updateExisting);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استيراد المنتجات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync all products from WooCommerce
     */
    public function syncAllWooCommerceProducts(Request $request): JsonResponse
    {
        $request->validate([
            'batch_size' => 'nullable|integer|min:1|max:100',
            'update_existing' => 'nullable|boolean'
        ]);

        try {
            // تشغيل العملية في الخلفية باستخدام Artisan command
            $batchSize = $request->get('batch_size', 50);
            $updateExisting = $request->get('update_existing', false);
            $startPage = $request->get('start_page', 1);
            $limit = $request->get('limit', 0);

            $command = 'woocommerce:import-products';
            $params = [
                '--start-page' => $startPage,
                '--batch-size' => $batchSize,
            ];

            if ($limit > 0) {
                $params['--limit'] = $limit;
            }

            if ($updateExisting) {
                $params['--update-existing'] = true;
            }

            // تشغيل الأمر
            Artisan::call($command, $params);
            $output = Artisan::output();

            return response()->json([
                'success' => true,
                'message' => 'بدأت عملية سحب جميع المنتجات',
                'details' => 'تتم العملية في الخلفية، يمكنك مراقبة التقدم من خلال logs',
                'command_output' => $output
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في بدء عملية السحب: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get WooCommerce products preview (without importing)
     */
    public function getWooCommerceProductsPreview(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        try {
            $service = new WooCommerceProductService();
            
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);

            $result = $service->getProducts($page, $perPage);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب معاينة المنتجات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import specific WooCommerce product by ID
     */
    public function importSpecificWooCommerceProduct(Request $request): JsonResponse
    {
        $request->validate([
            'woocommerce_id' => 'required|integer',
            'update_existing' => 'nullable|boolean'
        ]);

        try {
            $service = new WooCommerceProductService();
            
            $wcProductId = $request->get('woocommerce_id');
            $updateExisting = $request->get('update_existing', false);

            // جلب المنتج من WooCommerce
            $productData = $service->getProduct($wcProductId);
            
            // استيراده
            $result = $service->importSingleProduct($productData, $updateExisting);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استيراد المنتج المحدد: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Run WooCommerce import command with real-time progress
     */
    public function runWooCommerceImportCommand(Request $request): JsonResponse
    {
        $request->validate([
            'start_page' => 'nullable|integer|min:1',
            'batch_size' => 'nullable|integer|min:1|max:100',
            'limit' => 'nullable|integer|min:0',
            'update_existing' => 'nullable|boolean',
            'dry_run' => 'nullable|boolean'
        ]);

        try {
            $params = [];
            
            if ($request->has('start_page')) {
                $params['--start-page'] = $request->get('start_page');
            }
            if ($request->has('batch_size')) {
                $params['--batch-size'] = $request->get('batch_size');
            }
            if ($request->has('limit') && $request->get('limit') > 0) {
                $params['--limit'] = $request->get('limit');
            }
            if ($request->get('update_existing')) {
                $params['--update-existing'] = true;
            }
            if ($request->get('dry_run')) {
                $params['--dry-run'] = true;
            }

            // تشغيل الأمر مع إرجاع النتيجة
            $exitCode = Artisan::call('woocommerce:import-products', $params);
            $output = Artisan::output();

            return response()->json([
                'success' => $exitCode === 0,
                'message' => $exitCode === 0 ? 'تمت العملية بنجاح' : 'حدث خطأ أثناء التنفيذ',
                'exit_code' => $exitCode,
                'output' => $output,
                'command' => 'woocommerce:import-products',
                'params' => $params
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تنفيذ الأمر: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get import progress/logs
     */
    public function getImportProgress(): JsonResponse
    {
        try {
            $logsPath = storage_path('logs');
            $importLogs = glob($logsPath . '/woocommerce_import_*.json');
            
            // الحصول على آخر ملف log
            if (!empty($importLogs)) {
                $latestLog = max($importLogs);
                $logData = json_decode(file_get_contents($latestLog), true);
                
                return response()->json([
                    'success' => true,
                    'latest_import' => $logData,
                    'log_file' => basename($latestLog)
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'لا توجد عمليات استيراد سابقة',
                'latest_import' => null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب سجل التقدم: ' . $e->getMessage()
            ], 500);
        }
    }
}
