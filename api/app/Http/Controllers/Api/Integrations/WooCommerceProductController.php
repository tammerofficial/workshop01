<?php

namespace App\Http\Controllers\Api\Integrations;

use App\Http\Controllers\Controller;
use App\Services\WooCommerceProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WooCommerceProductController extends Controller
{
    protected $wooCommerceService;

    public function __construct(WooCommerceProductService $wooCommerceService)
    {
        $this->wooCommerceService = $wooCommerceService;
    }

    /**
     * Test WooCommerce connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->wooCommerceService->testConnection();
        return response()->json($result);
    }

    /**
     * Sync all products from WooCommerce
     */
    public function syncProducts(): JsonResponse
    {
        $result = $this->wooCommerceService->syncAllProducts();
        return response()->json($result);
    }

    /**
     * Push product to WooCommerce
     */
    public function pushProduct(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);
        $success = $this->wooCommerceService->pushProductToWooCommerce($product);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Product pushed to WooCommerce successfully'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to push product to WooCommerce'
            ], 500);
        }
    }
}
