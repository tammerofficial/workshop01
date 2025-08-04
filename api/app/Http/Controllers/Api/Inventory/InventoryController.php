<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryMovement;
use App\Models\StockAlert;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['stockAlerts' => function($q) {
            $q->where('is_resolved', false);
        }]);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'low':
                    $query->lowStock();
                    break;
                case 'out':
                    $query->where('stock_quantity', '<=', 0);
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
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhere('barcode', 'LIKE', "%{$search}%");
            });
        }

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Inventory retrieved successfully'
        ]);
    }

    public function show($id): JsonResponse
    {
        $product = Product::with([
            'inventoryMovements' => function($q) {
                $q->with('user:id,name')->latest()->limit(20);
            },
            'stockAlerts' => function($q) {
                $q->latest();
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product details retrieved successfully'
        ]);
    }

    public function updateStock(Request $request, $id): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $product = Product::findOrFail($id);

        // Check if trying to reduce stock below 0
        if ($request->type === 'out' && $product->stock_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock. Available: ' . $product->stock_quantity
            ], 400);
        }

        $product->updateStock(
            $request->quantity,
            $request->type,
            'manual_adjustment',
            null,
            null,
            $request->reason,
            auth()->id()
        );

        return response()->json([
            'success' => true,
            'data' => $product->fresh(),
            'message' => 'Stock updated successfully'
        ]);
    }

    public function stockMovements($id): JsonResponse
    {
        $movements = InventoryMovement::where('product_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $movements,
            'message' => 'Stock movements retrieved successfully'
        ]);
    }

    public function stockAlerts(): JsonResponse
    {
        $alerts = StockAlert::with(['product:id,name,name_ar,sku,stock_quantity'])
            ->unresolved()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'message' => 'Stock alerts retrieved successfully'
        ]);
    }

    public function resolveAlert(Request $request, $id): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string'
        ]);

        $alert = StockAlert::findOrFail($id);
        $alert->resolve(auth()->id(), $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Alert resolved successfully'
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_products' => Product::active()->count(),
            'low_stock_count' => Product::active()->lowStock()->count(),
            'out_of_stock_count' => Product::active()->where('stock_quantity', '<=', 0)->count(),
            'total_stock_value' => Product::active()->sum(\DB::raw('stock_quantity * cost_price')),
            'recent_movements' => InventoryMovement::with(['product:id,name,sku', 'user:id,name'])
                ->latest()
                ->limit(10)
                ->get(),
            'unresolved_alerts' => StockAlert::with('product:id,name,sku')
                ->unresolved()
                ->latest()
                ->limit(10)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Inventory dashboard data retrieved successfully'
        ]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.product_id' => 'required|exists:products,id',
            'updates.*.type' => 'required|in:in,out,adjustment',
            'updates.*.quantity' => 'required|integer|min:1',
            'updates.*.reason' => 'nullable|string'
        ]);

        $results = [];
        $errors = [];

        foreach ($request->updates as $update) {
            try {
                $product = Product::findOrFail($update['product_id']);
                
                if ($update['type'] === 'out' && $product->stock_quantity < $update['quantity']) {
                    $errors[] = [
                        'product_id' => $update['product_id'],
                        'error' => 'Insufficient stock'
                    ];
                    continue;
                }

                $product->updateStock(
                    $update['quantity'],
                    $update['type'],
                    'bulk_update',
                    null,
                    null,
                    $update['reason'] ?? null,
                    auth()->id()
                );

                $results[] = [
                    'product_id' => $update['product_id'],
                    'success' => true
                ];
            } catch (\Exception $e) {
                $errors[] = [
                    'product_id' => $update['product_id'],
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => empty($errors),
            'data' => [
                'successful_updates' => $results,
                'errors' => $errors
            ],
            'message' => empty($errors) ? 'All updates successful' : 'Some updates failed'
        ]);
    }
}