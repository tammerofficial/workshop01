<?php

namespace App\Services;

use GuzzleHttp\Client as HttpClient;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WooCommerceProductService
{
    private $client;
    private $baseUrl;
    private $consumerKey;
    private $consumerSecret;

    public function __construct()
    {
        $this->baseUrl = 'https://hudaaljarallah.net';
        $this->consumerKey = 'ck_3a5c739c20336c33cbee2453cccf56a6441ef6fe';
        $this->consumerSecret = 'cs_b091ba4fb33a6e4b10612c536db882fe0fa8c6aa';

        $this->client = new HttpClient([
            'base_uri' => $this->baseUrl,
            'timeout' => 60,
            'verify' => false,
        ]);
    }

    /**
     * اختبار الاتصال بـ WooCommerce
     */
    public function testConnection()
    {
        try {
            $response = $this->client->get('/wp-json/wc/v3/system_status', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => ['_fields' => 'environment']
            ]);

            $data = json_decode($response->getBody(), true);
            
            return [
                'success' => true,
                'message' => 'اتصال ناجح بـ WooCommerce',
                'store_info' => [
                    'url' => $this->baseUrl,
                    'wp_version' => $data['environment']['wp_version'] ?? 'غير محدد',
                    'wc_version' => $data['environment']['wc_version'] ?? 'غير محدد'
                ]
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'فشل الاتصال: ' . $e->getMessage()
            ];
        }
    }

    /**
     * الحصول على عدد المنتجات الإجمالي
     */
    public function getTotalProductsCount()
    {
        try {
            $cacheKey = 'wc_total_products_count';
            
            return Cache::remember($cacheKey, 300, function () { // 5 دقائق cache
                $response = $this->client->get('/wp-json/wc/v3/products', [
                    'auth' => [$this->consumerKey, $this->consumerSecret],
                    'query' => ['page' => 1, 'per_page' => 1]
                ]);

                $headers = $response->getHeaders();
                
                // Try multiple header format variations
                if (isset($headers['X-WP-Total'])) {
                    return (int)$headers['X-WP-Total'][0];
                } elseif (isset($headers['x-wp-total'])) {
                    return (int)$headers['x-wp-total'][0];
                } elseif (isset($headers['X-Wp-Total'])) {
                    return (int)$headers['X-Wp-Total'][0];
                }
                
                // Fallback: count products manually
                $allResponse = $this->client->get('/wp-json/wc/v3/products', [
                    'auth' => [$this->consumerKey, $this->consumerSecret],
                    'query' => ['page' => 1, 'per_page' => 100]
                ]);
                
                $products = json_decode($allResponse->getBody(), true);
                return count($products);
            });
        } catch (\Exception $e) {
            Log::error('Error getting WooCommerce products count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * جلب المنتجات مع pagination
     */
    public function getProducts($page = 1, $perPage = 50, $filters = [])
    {
        try {
            $query = [
                'page' => $page,
                'per_page' => $perPage,
                'orderby' => 'id',
                'order' => 'asc'
            ];

            // إضافة filters
            if (isset($filters['status'])) {
                $query['status'] = $filters['status'];
            }
            if (isset($filters['category'])) {
                $query['category'] = $filters['category'];
            }
            if (isset($filters['search'])) {
                $query['search'] = $filters['search'];
            }

            $response = $this->client->get('/wp-json/wc/v3/products', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => $query
            ]);

            $products = json_decode($response->getBody(), true);
            $headers = $response->getHeaders();

            return [
                'products' => $products,
                'total' => isset($headers['X-WP-Total']) ? (int)$headers['X-WP-Total'][0] : count($products),
                'total_pages' => isset($headers['X-WP-TotalPages']) ? (int)$headers['X-WP-TotalPages'][0] : 1,
                'current_page' => $page,
                'per_page' => $perPage
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching WooCommerce products: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * سحب منتج واحد
     */
    public function getProduct($productId)
    {
        try {
            $response = $this->client->get("/wp-json/wc/v3/products/{$productId}", [
                'auth' => [$this->consumerKey, $this->consumerSecret]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error("Error fetching WooCommerce product {$productId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * سحب فئات المنتجات
     */
    public function getCategories($page = 1, $perPage = 100)
    {
        try {
            $response = $this->client->get('/wp-json/wc/v3/products/categories', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => [
                    'page' => $page,
                    'per_page' => $perPage,
                    'orderby' => 'name',
                    'order' => 'asc'
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('Error fetching WooCommerce categories: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * استيراد منتج واحد إلى قاعدة البيانات
     */
    public function importSingleProduct($productData, $updateExisting = false)
    {
        try {
            $sku = 'WC-' . $productData['id'];
            $existingProduct = Product::where('sku', $sku)->first();

            if ($existingProduct && !$updateExisting) {
                return [
                    'success' => false,
                    'message' => 'المنتج موجود مسبقاً',
                    'action' => 'skipped'
                ];
            }

            $productArray = [
                'name' => $productData['name'],
                'description' => $this->cleanDescription($productData['description'] ?? $productData['short_description'] ?? ''),
                'sku' => $sku,
                'product_type' => $this->mapProductType($productData['type']),
                'price' => floatval($productData['price'] ?? 0),
                'purchase_price' => floatval($productData['regular_price'] ?? $productData['price'] ?? 0),
                'stock_quantity' => intval($productData['stock_quantity'] ?? 0),
                'manage_stock' => $productData['manage_stock'] ?? false,
                'auto_calculate_purchase_price' => false,
                'production_hours' => 0,
                'manufacturing_time_days' => 0,
                'woocommerce_id' => $productData['id'],
                'woocommerce_data' => $productData,
                'image_url' => $productData['images'][0]['src'] ?? null,
                'is_active' => $productData['status'] === 'publish',
                'category_id' => $this->getOrCreateCategory($productData['categories'] ?? [])
            ];

            if ($existingProduct) {
                $existingProduct->update($productArray);
                return [
                    'success' => true,
                    'message' => 'تم تحديث المنتج بنجاح',
                    'action' => 'updated',
                    'product' => $existingProduct->fresh()
                ];
            } else {
                $product = Product::create($productArray);
                return [
                    'success' => true,
                    'message' => 'تم إنشاء المنتج بنجاح',
                    'action' => 'created',
                    'product' => $product
                ];
            }

        } catch (\Exception $e) {
            Log::error('Error importing product: ' . $e->getMessage(), ['product_data' => $productData]);
            return [
                'success' => false,
                'message' => 'خطأ في استيراد المنتج: ' . $e->getMessage(),
                'action' => 'error'
            ];
        }
    }

    /**
     * استيراد دفعة من المنتجات
     */
    public function importProductsBatch($page = 1, $batchSize = 50, $updateExisting = false)
    {
        try {
            $result = $this->getProducts($page, $batchSize);
            $products = $result['products'];
            
            $stats = [
                'total_fetched' => count($products),
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => 0
            ];

            foreach ($products as $productData) {
                $importResult = $this->importSingleProduct($productData, $updateExisting);
                $stats[$importResult['action']]++;
            }

            return [
                'success' => true,
                'stats' => $stats,
                'has_more' => $page < $result['total_pages'],
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $result['total_pages'],
                    'total_products' => $result['total']
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Error importing products batch: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'خطأ في استيراد دفعة المنتجات: ' . $e->getMessage()
            ];
        }
    }

    /**
     * مزامنة جميع المنتجات
     */
    public function syncAllProducts($batchSize = 50, $updateExisting = false)
    {
        try {
            $totalCount = $this->getTotalProductsCount();
            $totalPages = ceil($totalCount / $batchSize);
            
            $overallStats = [
                'total_products' => $totalCount,
                'total_fetched' => 0,
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => 0,
                'processed_pages' => 0
            ];

            for ($page = 1; $page <= $totalPages; $page++) {
                $batchResult = $this->importProductsBatch($page, $batchSize, $updateExisting);
                
                if ($batchResult['success']) {
                    $stats = $batchResult['stats'];
                    $overallStats['total_fetched'] += $stats['total_fetched'];
                    $overallStats['created'] += $stats['created'];
                    $overallStats['updated'] += $stats['updated'];
                    $overallStats['skipped'] += $stats['skipped'];
                    $overallStats['errors'] += $stats['errors'];
                }
                
                $overallStats['processed_pages'] = $page;

                // استراحة قصيرة بين الدفعات
                usleep(200000); // 0.2 ثانية
            }

            return [
                'success' => true,
                'message' => 'تمت مزامنة جميع المنتجات بنجاح',
                'stats' => $overallStats
            ];

        } catch (\Exception $e) {
            Log::error('Error syncing all products: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'خطأ في مزامنة المنتجات: ' . $e->getMessage()
            ];
        }
    }

    /**
     * تنظيف وصف المنتج
     */
    private function cleanDescription($description)
    {
        $clean = strip_tags($description);
        return substr($clean, 0, 1000);
    }

    /**
     * تحويل نوع المنتج من WooCommerce إلى نظامنا
     */
    private function mapProductType($wcType)
    {
        $typeMap = [
            'simple' => 'simple',
            'variable' => 'variable',
            'grouped' => 'simple',
            'external' => 'simple'
        ];

        return $typeMap[$wcType] ?? 'simple';
    }

    /**
     * الحصول على أو إنشاء فئة
     */
    private function getOrCreateCategory($categories)
    {
        if (empty($categories)) {
            return $this->getDefaultCategory()->id;
        }

        $categoryName = $categories[0]['name'] ?? 'غير محدد';
        
        $category = Category::firstOrCreate(
            ['name' => $categoryName],
            [
                'description' => 'فئة مستوردة من WooCommerce',
                'woocommerce_id' => $categories[0]['id'] ?? null,
                'is_active' => true
            ]
        );

        return $category->id;
    }

    /**
     * الحصول على الفئة الافتراضية
     */
    private function getDefaultCategory()
    {
        return Category::firstOrCreate(
            ['name' => 'منتجات WooCommerce'],
            [
                'description' => 'منتجات مستوردة من WooCommerce',
                'is_active' => true
            ]
        );
    }

    /**
     * الحصول على إحصائيات الاستيراد
     */
    public function getImportStats()
    {
        $totalWcProducts = $this->getTotalProductsCount();
        $importedProducts = Product::whereNotNull('woocommerce_id')->count();
        $lastImport = Product::whereNotNull('woocommerce_id')
            ->latest('updated_at')
            ->first();

        return [
            'total_wc_products' => $totalWcProducts,
            'imported_products' => $importedProducts,
            'not_imported' => $totalWcProducts - $importedProducts,
            'last_import_date' => $lastImport ? $lastImport->updated_at : null,
            'import_percentage' => $totalWcProducts > 0 ? round(($importedProducts / $totalWcProducts) * 100, 2) : 0
        ];
    }
}