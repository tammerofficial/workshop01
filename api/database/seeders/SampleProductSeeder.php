<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductBillOfMaterial;
use App\Models\ProductStageRequirement;
use App\Models\ProductWorkerRequirement;
use App\Models\ProductionStage;
use App\Models\Worker;
use App\Models\Category;

class SampleProductSeeder extends Seeder
{
    public function run()
    {
        // إنشاء فئة المنتجات النهائية
        $productCategory = Category::updateOrCreate(
            ['name' => 'المنتجات النهائية'],
            ['description' => 'المنتجات المصنعة والجاهزة للبيع', 'is_active' => true]
        );

        // إنشاء المنتج النموذجي
        $product = Product::updateOrCreate(
            ['sku' => 'PROD-SUIT-001'],
            [
                'name' => 'بدلة رجالية كلاسيكية',
                'description' => 'بدلة رجالية عالية الجودة من القماش القطني',
                'sku' => 'PROD-SUIT-001',
                'product_type' => 'simple',
                'price' => 299.99,
                'purchase_price' => 0, // سيتم حسابه تلقائياً من BOM
                'stock_quantity' => 50,
                'production_hours' => 0, // سيتم حسابه تلقائياً من المراحل
                'manufacturing_time_days' => 0, // سيتم حسابه تلقائياً
                'category_id' => $productCategory->id,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => true,
                'is_active' => true
            ]
        );

        // إضافة Bill of Materials
        $materials = [
            ['sku' => 'MAT-COTTON-001', 'quantity' => 3.5],
            ['sku' => 'MAT-THREAD-001', 'quantity' => 2],
            ['sku' => 'MAT-BUTTON-001', 'quantity' => 8],
            ['sku' => 'MAT-ZIPPER-001', 'quantity' => 1]
        ];

        foreach ($materials as $materialData) {
            $material = Product::where('sku', $materialData['sku'])->first();
            if ($material) {
                ProductBillOfMaterial::updateOrCreate(
                    ['product_id' => $product->id, 'material_id' => $material->id],
                    [
                        'quantity_required' => $materialData['quantity'],
                        'unit' => 'متر',
                        'cost_per_unit' => $material->purchase_price,
                        'total_cost' => $material->purchase_price * $materialData['quantity'],
                        'is_optional' => false
                    ]
                );
            }
        }

        // إضافة متطلبات المراحل
        $stages = ProductionStage::orderBy('order_sequence')->get();
        foreach ($stages as $index => $stage) {
            $stageRequirement = ProductStageRequirement::updateOrCreate(
                ['product_id' => $product->id, 'production_stage_id' => $stage->id],
                [
                    'order_sequence' => $stage->order_sequence,
                    'estimated_hours' => $stage->estimated_hours,
                    'required_workers' => $index < 2 ? 2 : 1, // المراحل الأولى تحتاج عاملين
                    'skill_requirements' => [$stage->name],
                    'is_parallel' => false,
                    'is_critical' => $index === 1, // مرحلة الخياطة حرجة
                    'buffer_time_hours' => 1
                ]
            );

            // إضافة متطلبات العمال (إذا وُجد عمال)
            $availableWorkers = Worker::where('is_active', true)->limit(3)->get();
            foreach ($availableWorkers as $workerIndex => $worker) {
                ProductWorkerRequirement::updateOrCreate(
                    ['stage_requirement_id' => $stageRequirement->id, 'worker_id' => $worker->id],
                    [
                        'product_id' => $product->id,
                        'production_stage_id' => $stage->id,
                        'priority' => $workerIndex + 1,
                        'efficiency_rate' => 1.0 + ($workerIndex * 0.1), // كفاءة متدرجة
                        'required_skills' => [$stage->name],
                        'hourly_rate' => $worker->hourly_rate,
                        'max_concurrent_orders' => $workerIndex === 0 ? 3 : 2,
                        'is_primary' => $workerIndex === 0,
                        'can_supervise' => $workerIndex === 0
                    ]
                );
            }
        }

        // تحديث تكلفة وساعات المنتج
        $product->updatePurchasePriceFromBOM();
        $totalTime = $product->calculateTotalProductionTime();
        $product->update([
            'production_hours' => $totalTime,
            'manufacturing_time_days' => ceil($totalTime / 8)
        ]);

        echo "✅ تم إنشاء المنتج النموذجي بنجاح: {$product->name}\n";
        echo "✅ إجمالي ساعات الإنتاج: {$totalTime} ساعة\n";
        echo "✅ مدة التصنيع: " . ceil($totalTime / 8) . " يوم\n";
    }
}