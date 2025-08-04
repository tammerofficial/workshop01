<?php

namespace App\Http\Controllers\Api\Boutique;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Product;
use App\Models\Boutique;
use App\Models\BoutiqueSale;
use App\Models\PosTransaction;
use App\Models\LoyaltyCustomer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PosController extends Controller
{
    /**
     * البحث عن المنتجات للبيع
     */
    public function searchProducts(Request $request): JsonResponse
    {
        if (!auth()->user()->hasPermission('pos.operate')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتشغيل نقاط البيع'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'search_term' => 'required|string|min:2',
            'boutique_id' => 'required|exists:boutiques,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $searchTerm = $request->search_term;
            
            $products = Product::where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->where(function ($query) use ($searchTerm) {
                    $query->where('name', 'like', "%{$searchTerm}%")
                          ->orWhere('sku', 'like', "%{$searchTerm}%");
                })
                ->with(['category'])
                ->take(20)
                ->get();

            $results = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'stock_quantity' => $product->stock_quantity,
                    'category' => $product->category?->name,
                    'manage_stock' => $product->manage_stock,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Product search error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء البحث'
            ], 500);
        }
    }

    /**
     * إنشاء بيع جديد
     */
    public function createSale(Request $request): JsonResponse
    {
        if (!auth()->user()->hasPermission('pos.operate')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتشغيل نقاط البيع'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'boutique_id' => 'required|exists:boutiques,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,knet,apple_pay,mixed',
            'loyalty_customer_id' => 'nullable|exists:loyalty_customers,id',
            'points_to_use' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $boutique = Boutique::find($request->boutique_id);
            
            // التحقق من إمكانية الوصول للبوتيك
            if (!$boutique->canBeAccessedBy(auth()->user())) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بالوصول لهذا البوتيك'
                ], 403);
            }

            // حساب المجاميع
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            // إنشاء البيع
            $sale = BoutiqueSale::create([
                'boutique_id' => $request->boutique_id,
                'cashier_id' => auth()->id(),
                'loyalty_customer_id' => $request->loyalty_customer_id,
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
                'payment_method' => $request->payment_method,
                'is_loyalty_transaction' => !is_null($request->loyalty_customer_id),
                'status' => 'completed',
            ]);

            // إنشاء معاملات المنتجات
            foreach ($request->items as $item) {
                PosTransaction::create([
                    'boutique_sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'processed_by' => auth()->id(),
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $item['quantity'] * $item['unit_price'],
                    'final_amount' => $item['quantity'] * $item['unit_price'],
                    'transaction_type' => 'sale',
                ]);
            }

            // تطبيق نظام الولاء إذا كان موجود
            if ($sale->loyalty_customer_id && $request->points_to_use) {
                $sale->applyLoyaltyDiscount($request->points_to_use);
                $sale->save();
            }

            if ($sale->is_loyalty_transaction) {
                $sale->processLoyalty();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء البيع بنجاح',
                'data' => [
                    'sale_id' => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'total_amount' => $sale->total_amount,
                    'loyalty_points_earned' => $sale->loyalty_points_earned,
                    'loyalty_points_used' => $sale->loyalty_points_used,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create sale error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء البيع'
            ], 500);
        }
    }

    /**
     * عرض مبيعات البوتيك
     */
    public function getSales(Request $request): JsonResponse
    {
        if (!auth()->user()->hasPermission('sales.view')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بعرض المبيعات'
            ], 403);
        }

        try {
            $query = BoutiqueSale::accessibleByUser(auth()->user())
                ->with(['boutique', 'cashier', 'loyaltyCustomer'])
                ->orderBy('created_at', 'desc');

            if ($request->boutique_id) {
                $query->where('boutique_id', $request->boutique_id);
            }

            if ($request->date_from) {
                $query->whereDate('sale_date', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('sale_date', '<=', $request->date_to);
            }

            $sales = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $sales
            ]);

        } catch (\Exception $e) {
            Log::error('Get sales error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المبيعات'
            ], 500);
        }
    }
}