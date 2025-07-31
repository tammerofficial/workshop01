<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WooCommerceProductService
{
    private $baseUrl;
    private $consumerKey;
    private $consumerSecret;

    public function __construct()
    {
        $this->baseUrl = config('woocommerce.base_url');
        $this->consumerKey = config('woocommerce.consumer_key');
        $this->consumerSecret = config('woocommerce.consumer_secret');
    }

    /**
     * Sync all products from WooCommerce
     */
    public function syncAllProducts()
    {
        try {
            $page = 1;
            $perPage = 100;
            $totalSynced = 0;

            do {
                $response = $this->makeRequest('GET', 'products', [
                    'per_page' => $perPage,
                    'page' => $page,
                    'status' => 'any'
                ]);

                if ($response->successful()) {
                    $products = $response->json();
                    
                    foreach ($products as $wooProduct) {
                        $this->syncSingleProduct($wooProduct);
                        $totalSynced++;
                    }

                    $page++;
                } else {
                    Log::error('WooCommerce API Error: ' . $response->body());
                    break;
                }

            } while (count($products) == $perPage);

            return [
                'success' => true,
                'message' => "Successfully synced {$totalSynced} products from WooCommerce",
                'total_synced' => $totalSynced
            ];

        } catch (\Exception $e) {
            Log::error('WooCommerce Sync Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error syncing products: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Sync single product from WooCommerce
     */
    public function syncSingleProduct($wooProduct)
    {
        try {
            // Check if product already exists
            $existingProduct = Product::where('woocommerce_id', $wooProduct['id'])->first();

            // Determine product type based on WooCommerce data
            $productType = $this->determineProductType($wooProduct);

            // Get or create category
            $categoryId = null;
            if (!empty($wooProduct['categories'])) {
                $categoryId = $this->syncCategory($wooProduct['categories'][0]);
            }

            $productData = [
                'name' => $wooProduct['name'],
                'description' => strip_tags($wooProduct['description'] ?? $wooProduct['short_description'] ?? ''),
                'sku' => $wooProduct['sku'] ?: 'WC-' . $wooProduct['id'],
                'price' => floatval($wooProduct['price'] ?? $wooProduct['regular_price'] ?? 0),
                'purchase_price' => floatval($wooProduct['meta_data']['_purchase_price'] ?? 0),
                'stock_quantity' => intval($wooProduct['stock_quantity'] ?? 0),
                'manage_stock' => $wooProduct['manage_stock'] ?? false,
                'product_type' => $productType,
                'category_id' => $categoryId,
                'woocommerce_id' => $wooProduct['id'],
                'woocommerce_data' => $wooProduct,
                'image_url' => $wooProduct['images'][0]['src'] ?? null,
                'is_active' => $wooProduct['status'] === 'publish',
                'manufacturing_time_days' => intval($this->getMetaValue($wooProduct, '_manufacturing_time_days') ?? 0),
                'production_hours' => intval($this->getMetaValue($wooProduct, '_production_hours') ?? 0),
                'auto_calculate_purchase_price' => boolval($this->getMetaValue($wooProduct, '_auto_calculate_purchase_price') ?? false)
            ];

            if ($existingProduct) {
                $existingProduct->update($productData);
                $product = $existingProduct;
            } else {
                $product = Product::create($productData);
            }

            // Sync Bill of Materials if exists
            $this->syncProductBOM($product, $wooProduct);

            return $product;

        } catch (\Exception $e) {
            Log::error('Error syncing product ID ' . $wooProduct['id'] . ': ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sync category from WooCommerce
     */
    private function syncCategory($wooCategory)
    {
        try {
            $existingCategory = Category::where('woocommerce_id', $wooCategory['id'])->first();

            $categoryData = [
                'name' => $wooCategory['name'],
                'description' => $wooCategory['description'] ?? '',
                'woocommerce_id' => $wooCategory['id'],
                'is_active' => true
            ];

            if ($existingCategory) {
                $existingCategory->update($categoryData);
                return $existingCategory->id;
            } else {
                $category = Category::create($categoryData);
                return $category->id;
            }

        } catch (\Exception $e) {
            Log::error('Error syncing category: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Sync Product Bill of Materials from WooCommerce meta data
     */
    private function syncProductBOM($product, $wooProduct)
    {
        try {
            $bomData = $this->getMetaValue($wooProduct, '_bill_of_materials');
            
            if (!$bomData || !is_array($bomData)) {
                return;
            }

            // Clear existing BOM
            $product->billOfMaterials()->delete();

            foreach ($bomData as $bomItem) {
                // Find the material product
                $material = Product::where('woocommerce_id', $bomItem['material_wc_id'] ?? null)
                    ->orWhere('sku', $bomItem['material_sku'] ?? null)
                    ->first();

                if ($material) {
                    $product->billOfMaterials()->create([
                        'material_id' => $material->id,
                        'quantity_required' => floatval($bomItem['quantity_required'] ?? 1),
                        'unit' => $bomItem['unit'] ?? 'piece',
                        'cost_per_unit' => floatval($bomItem['cost_per_unit'] ?? $material->purchase_price ?? 0),
                        'is_optional' => boolval($bomItem['is_optional'] ?? false),
                        'notes' => $bomItem['notes'] ?? ''
                    ]);
                }
            }

            // Recalculate purchase price if auto calculation is enabled
            if ($product->auto_calculate_purchase_price) {
                $product->calculatePurchasePriceFromBOM();
                $product->save();
            }

        } catch (\Exception $e) {
            Log::error('Error syncing BOM for product ' . $product->id . ': ' . $e->getMessage());
        }
    }

    /**
     * Determine product type based on WooCommerce data
     */
    private function determineProductType($wooProduct)
    {
        // Check if it's marked as raw material
        if ($this->getMetaValue($wooProduct, '_product_type') === 'raw_material') {
            return 'raw_material';
        }

        // Check if it's marked as product part
        if ($this->getMetaValue($wooProduct, '_product_type') === 'product_part') {
            return 'product_part';
        }

        // Check by category
        foreach ($wooProduct['categories'] ?? [] as $category) {
            $categoryName = strtolower($category['name']);
            if (str_contains($categoryName, 'raw material') || str_contains($categoryName, 'خامات')) {
                return 'raw_material';
            }
            if (str_contains($categoryName, 'product part') || str_contains($categoryName, 'قطع')) {
                return 'product_part';
            }
        }

        // Default to simple product
        return $wooProduct['type'] ?? 'simple';
    }

    /**
     * Get meta value from WooCommerce product
     */
    private function getMetaValue($wooProduct, $metaKey)
    {
        foreach ($wooProduct['meta_data'] ?? [] as $meta) {
            if ($meta['key'] === $metaKey) {
                return $meta['value'];
            }
        }
        return null;
    }

    /**
     * Push product updates back to WooCommerce
     */
    public function pushProductToWooCommerce($product)
    {
        try {
            if (!$product->woocommerce_id) {
                return $this->createProductInWooCommerce($product);
            }

            $productData = [
                'name' => $product->name,
                'description' => $product->description,
                'sku' => $product->sku,
                'regular_price' => (string) $product->price,
                'stock_quantity' => $product->stock_quantity,
                'manage_stock' => $product->manage_stock,
                'status' => $product->is_active ? 'publish' : 'draft',
                'meta_data' => [
                    ['key' => '_purchase_price', 'value' => (string) $product->purchase_price],
                    ['key' => '_manufacturing_time_days', 'value' => (string) $product->manufacturing_time_days],
                    ['key' => '_production_hours', 'value' => (string) $product->production_hours],
                    ['key' => '_auto_calculate_purchase_price', 'value' => $product->auto_calculate_purchase_price ? 'yes' : 'no'],
                    ['key' => '_product_type', 'value' => $product->product_type],
                    ['key' => '_bill_of_materials', 'value' => $this->prepareBOMForWooCommerce($product)]
                ]
            ];

            $response = $this->makeRequest('PUT', "products/{$product->woocommerce_id}", $productData);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('Error pushing product to WooCommerce: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new product in WooCommerce
     */
    private function createProductInWooCommerce($product)
    {
        try {
            $productData = [
                'name' => $product->name,
                'description' => $product->description,
                'sku' => $product->sku,
                'type' => $product->product_type === 'simple' ? 'simple' : 'simple',
                'regular_price' => (string) $product->price,
                'stock_quantity' => $product->stock_quantity,
                'manage_stock' => $product->manage_stock,
                'status' => $product->is_active ? 'publish' : 'draft',
                'meta_data' => [
                    ['key' => '_purchase_price', 'value' => (string) $product->purchase_price],
                    ['key' => '_manufacturing_time_days', 'value' => (string) $product->manufacturing_time_days],
                    ['key' => '_production_hours', 'value' => (string) $product->production_hours],
                    ['key' => '_auto_calculate_purchase_price', 'value' => $product->auto_calculate_purchase_price ? 'yes' : 'no'],
                    ['key' => '_product_type', 'value' => $product->product_type],
                    ['key' => '_bill_of_materials', 'value' => $this->prepareBOMForWooCommerce($product)]
                ]
            ];

            $response = $this->makeRequest('POST', 'products', $productData);

            if ($response->successful()) {
                $wooProduct = $response->json();
                $product->update(['woocommerce_id' => $wooProduct['id']]);
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Error creating product in WooCommerce: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Prepare BOM data for WooCommerce
     */
    private function prepareBOMForWooCommerce($product)
    {
        $bomData = [];

        foreach ($product->billOfMaterials as $bom) {
            $bomData[] = [
                'material_wc_id' => $bom->material->woocommerce_id,
                'material_sku' => $bom->material->sku,
                'quantity_required' => $bom->quantity_required,
                'unit' => $bom->unit,
                'cost_per_unit' => $bom->cost_per_unit,
                'is_optional' => $bom->is_optional,
                'notes' => $bom->notes
            ];
        }

        return $bomData;
    }

    /**
     * Make HTTP request to WooCommerce API
     */
    private function makeRequest($method, $endpoint, $data = [])
    {
        $url = rtrim($this->baseUrl, '/') . "/wp-json/wc/v3/{$endpoint}";

        return Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->timeout(30)
            ->$method($url, $data);
    }

    /**
     * Test WooCommerce connection
     */
    public function testConnection()
    {
        try {
            $response = $this->makeRequest('GET', 'products', ['per_page' => 1]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'WooCommerce connection successful'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'WooCommerce connection failed: ' . $response->body()
                ];
            }

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'WooCommerce connection error: ' . $e->getMessage()
            ];
        }
    }
}
