<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Category;
use GuzzleHttp\Client as HttpClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ImportWooCommerceProducts extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'woocommerce:import-products 
                            {--start-page=1 : بدء من صفحة محددة}
                            {--batch-size=50 : عدد المنتجات في كل batch}
                            {--limit=0 : حد أقصى للمنتجات (0 = بلا حدود)}
                            {--update-existing : تحديث المنتجات الموجودة}
                            {--dry-run : تشغيل تجريبي بدون حفظ}';

    /**
     * The console command description.
     */
    protected $description = 'سحب جميع المنتجات من WooCommerce وحفظها في جدول Products';

    private $client;
    private $baseUrl = 'https://hudaaljarallah.net';
    private $consumerKey = 'ck_3a5c739c20336c33cbee2453cccf56a6441ef6fe';
    private $consumerSecret = 'cs_b091ba4fb33a6e4b10612c536db882fe0fa8c6aa';
    
    private $stats = [
        'total_fetched' => 0,
        'new_created' => 0,
        'updated' => 0,
        'skipped' => 0,
        'errors' => 0
    ];

    public function __construct()
    {
        parent::__construct();
        
        $this->client = new HttpClient([
            'base_uri' => $this->baseUrl,
            'timeout' => 60,
            'verify' => false,
        ]);
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 بدء سحب المنتجات من WooCommerce...');
        $this->info('🌐 الموقع: ' . $this->baseUrl);
        
        $startPage = $this->option('start-page');
        $batchSize = $this->option('batch-size');
        $limit = $this->option('limit');
        $updateExisting = $this->option('update-existing');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('⚠️  تشغيل تجريبي - لن يتم حفظ أي بيانات');
        }

        $this->info("📄 إعدادات السحب:");
        $this->info("   - بدء من الصفحة: {$startPage}");
        $this->info("   - حجم الدفعة: {$batchSize}");
        $this->info("   - الحد الأقصى: " . ($limit > 0 ? $limit : 'بلا حدود'));
        $this->info("   - تحديث الموجود: " . ($updateExisting ? 'نعم' : 'لا'));

        // إنشاء فئة افتراضية للمنتجات المستوردة
        if (!$dryRun) {
            $this->createDefaultCategory();
        }

        $page = $startPage;
        $totalProcessed = 0;

        // الحصول على العدد الإجمالي أولاً
        $this->info('📊 جاري حساب العدد الإجمالي للمنتجات...');
        $totalProducts = $this->getTotalProductsCount();
        $this->info("📦 إجمالي المنتجات في WooCommerce: {$totalProducts}");

        if ($limit > 0 && $limit < $totalProducts) {
            $totalProducts = $limit;
            $this->info("🎯 سيتم سحب {$limit} منتج فقط");
        }

        $progressBar = $this->output->createProgressBar($totalProducts);
        $progressBar->setFormat('verbose');
        $progressBar->start();

        do {
            try {
                $this->info("\n📄 معالجة الصفحة {$page}...");
                
                $products = $this->fetchProducts($page, $batchSize);
                
                if (empty($products)) {
                    $this->info("✅ انتهت المنتجات في الصفحة {$page}");
                    break;
                }

                $this->stats['total_fetched'] += count($products);

                foreach ($products as $product) {
                    if ($limit > 0 && $totalProcessed >= $limit) {
                        break 2; // اخرج من كلا الحلقات
                    }

                    $result = $this->processProduct($product, $updateExisting, $dryRun);
                    $this->stats[$result]++;
                    
                    $progressBar->advance();
                    $totalProcessed++;

                    // عرض تقدم مفصل كل 10 منتجات
                    if ($totalProcessed % 10 == 0) {
                        $this->displayProgress();
                    }
                }

                $page++;
                
                // استراحة قصيرة لتجنب إرهاق الخادم
                usleep(100000); // 0.1 ثانية

            } catch (\Exception $e) {
                $this->error("❌ خطأ في الصفحة {$page}: " . $e->getMessage());
                Log::error("WooCommerce Import Error - Page {$page}: " . $e->getMessage());
                $this->stats['errors']++;
                
                if ($this->confirm('هل تريد المتابعة أم إيقاف العملية؟', true)) {
                    $page++;
                    continue;
                } else {
                    break;
                }
            }

        } while (count($products) >= $batchSize && ($limit == 0 || $totalProcessed < $limit));

        $progressBar->finish();
        $this->displayFinalReport();

        return 0;
    }

    private function fetchProducts($page, $perPage)
    {
        $response = $this->client->get('/wp-json/wc/v3/products', [
            'auth' => [$this->consumerKey, $this->consumerSecret],
            'query' => [
                'page' => $page,
                'per_page' => $perPage,
                'status' => 'any',
                'orderby' => 'id',
                'order' => 'asc'
            ]
        ]);

        return json_decode($response->getBody(), true);
    }

    private function getTotalProductsCount()
    {
        try {
            $response = $this->client->get('/wp-json/wc/v3/products', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => [
                    'page' => 1,
                    'per_page' => 1
                ]
            ]);

            $headers = $response->getHeaders();
            return isset($headers['X-WP-Total']) ? (int)$headers['X-WP-Total'][0] : 0;
        } catch (\Exception $e) {
            $this->warn('⚠️  لا يمكن حساب العدد الإجمالي، سيتم المتابعة بدون عداد دقيق');
            return 1000; // قيمة افتراضية
        }
    }

    private function processProduct($productData, $updateExisting, $dryRun)
    {
        try {
            $sku = 'WC-' . $productData['id'];
            $existingProduct = Product::where('sku', $sku)->first();

            if ($existingProduct && !$updateExisting) {
                return 'skipped';
            }

            if ($dryRun) {
                return $existingProduct ? 'updated' : 'new_created';
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
                'production_hours' => 0, // سيتم تحديده لاحقاً
                'manufacturing_time_days' => 0, // سيتم تحديده لاحقاً
                'woocommerce_id' => $productData['id'],
                'woocommerce_data' => $productData,
                'image_url' => $productData['images'][0]['src'] ?? null,
                'is_active' => $productData['status'] === 'publish',
                'category_id' => $this->getOrCreateCategory($productData['categories'] ?? [])
            ];

            if ($existingProduct) {
                $existingProduct->update($productArray);
                return 'updated';
            } else {
                Product::create($productArray);
                return 'new_created';
            }

        } catch (\Exception $e) {
            $this->error("❌ خطأ في معالجة المنتج ID {$productData['id']}: " . $e->getMessage());
            Log::error("Product processing error: " . $e->getMessage(), ['product_id' => $productData['id']]);
            return 'errors';
        }
    }

    private function cleanDescription($description)
    {
        // إزالة HTML tags وتنظيف النص
        $clean = strip_tags($description);
        return substr($clean, 0, 1000); // تحديد الطول
    }

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

    private function createDefaultCategory()
    {
        Category::firstOrCreate(
            ['name' => 'منتجات WooCommerce'],
            [
                'description' => 'منتجات مستوردة من WooCommerce',
                'is_active' => true
            ]
        );
    }

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

    private function displayProgress()
    {
        $this->info("\n📊 الإحصائيات الحالية:");
        $this->info("   📦 تم جلبها: {$this->stats['total_fetched']}");
        $this->info("   ✨ جديدة: {$this->stats['new_created']}");
        $this->info("   🔄 محدثة: {$this->stats['updated']}");
        $this->info("   ⏭️  متجاهلة: {$this->stats['skipped']}");
        $this->info("   ❌ أخطاء: {$this->stats['errors']}");
    }

    private function displayFinalReport()
    {
        $this->info("\n");
        $this->info("🎉 انتهت عملية سحب المنتجات!");
        $this->info(str_repeat("=", 50));
        $this->info("📊 التقرير النهائي:");
        $this->info("   📦 إجمالي المنتجات المجلبة: {$this->stats['total_fetched']}");
        $this->info("   ✨ منتجات جديدة تم إنشاؤها: {$this->stats['new_created']}");
        $this->info("   🔄 منتجات تم تحديثها: {$this->stats['updated']}");
        $this->info("   ⏭️  منتجات تم تجاهلها: {$this->stats['skipped']}");
        $this->info("   ❌ أخطاء: {$this->stats['errors']}");
        $this->info(str_repeat("=", 50));

        $totalSuccess = $this->stats['new_created'] + $this->stats['updated'];
        $this->info("✅ إجمالي المنتجات المعالجة بنجاح: {$totalSuccess}");

        if ($this->stats['errors'] > 0) {
            $this->warn("⚠️  تحقق من ملف logs/laravel.log للتفاصيل حول الأخطاء");
        }

        // حفظ التقرير في ملف
        $this->saveReport();
    }

    private function saveReport()
    {
        $report = [
            'timestamp' => now()->toISOString(),
            'stats' => $this->stats,
            'options' => [
                'start_page' => $this->option('start-page'),
                'batch_size' => $this->option('batch-size'),
                'limit' => $this->option('limit'),
                'update_existing' => $this->option('update-existing'),
                'dry_run' => $this->option('dry-run')
            ]
        ];

        $reportPath = storage_path('logs/woocommerce_import_' . date('Y-m-d_H-i-s') . '.json');
        file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        $this->info("📄 تم حفظ التقرير المفصل في: {$reportPath}");
    }
}