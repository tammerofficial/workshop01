<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBillOfMaterial;
use App\Models\Category;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

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
}
