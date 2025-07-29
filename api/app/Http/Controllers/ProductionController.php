<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Material;
use App\Models\ProductionStage;
use App\Services\IntegratedProductionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductionController extends Controller
{
    protected $productionService;

    public function __construct(IntegratedProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    /**
     * بدء الإنتاج المتكامل
     */
    public function startProduction(Request $request, $orderId)
    {
        try {
            $request->validate([
                'product_type' => 'string',
                'size' => 'string',
                'complexity' => 'in:simple,medium,complex,very_complex',
                'specifications' => 'array'
            ]);

            $order = Order::findOrFail($orderId);
            
            $specifications = [
                'product_type' => $request->input('product_type', 'general'),
                'size' => $request->input('size', 'medium'),
                'complexity' => $request->input('complexity', 'medium'),
                'specifications' => $request->input('specifications', [])
            ];

            $result = $this->productionService->startIntegratedProduction($order, $specifications);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('خطأ في بدء الإنتاج: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في بدء الإنتاج: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الانتقال للمرحلة التالية
     */
    public function moveToNextStage(Request $request, $orderId, $stageId)
    {
        try {
            $request->validate([
                'actual_minutes' => 'required|integer|min:1',
                'quality_score' => 'nullable|numeric|min:0|max:100',
                'notes' => 'nullable|string|max:1000'
            ]);

            $order = Order::findOrFail($orderId);

            $completionData = [
                'actual_minutes' => $request->actual_minutes,
                'quality_score' => $request->quality_score,
                'notes' => $request->notes
            ];

            $result = $this->productionService->moveToNextStage($order, $stageId, $completionData);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('خطأ في الانتقال للمرحلة التالية: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في الانتقال للمرحلة التالية: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حساب متطلبات المواد
     */
    public function calculateMaterialRequirements(Request $request, $orderId)
    {
        try {
            $order = Order::findOrFail($orderId);
            
            $specifications = [
                'product_type' => $request->input('product_type', 'general'),
                'size' => $request->input('size', 'medium'),
                'complexity' => $request->input('complexity', 'medium')
            ];

            $requirements = $this->productionService->calculateMaterialRequirements($order, $specifications);

            return response()->json([
                'success' => true,
                'requirements' => $requirements
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في حساب متطلبات المواد: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض المواد المحجوزة للطلب
     */
    public function getReservedMaterials($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);
            $reservedMaterials = $this->productionService->checkReservedMaterials($order);

            return response()->json([
                'success' => true,
                'reserved_materials' => $reservedMaterials
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب المواد المحجوزة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حساب تقدير موعد الإكمال
     */
    public function getEstimatedCompletion($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);
            $estimatedCompletion = $this->productionService->calculateEstimatedCompletion($order);

            return response()->json([
                'success' => true,
                'estimated_completion' => $estimatedCompletion->format('Y-m-d H:i:s'),
                'days_remaining' => $estimatedCompletion->diffInDays(now())
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في حساب تقدير الإكمال: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * مراقبة المواد منخفضة المخزون
     */
    public function checkLowStockMaterials()
    {
        try {
            $lowStockMaterials = $this->productionService->monitorLowStockMaterials();

            return response()->json([
                'success' => true,
                'low_stock_materials' => $lowStockMaterials,
                'alert_count' => $lowStockMaterials->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في فحص المواد منخفضة المخزون: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب تقدم الطلب
     */
    public function getOrderProgress($orderId)
    {
        try {
            $order = Order::with([
                'productionTracking.productionStage',
                'materialReservations.material',
                'costBreakdown'
            ])->findOrFail($orderId);

            $totalStages = $order->productionTracking->count();
            $completedStages = $order->productionTracking->where('status', 'completed')->count();
            $currentStage = $order->productionTracking->where('status', 'in_progress')->first();

            $progressPercentage = $totalStages > 0 ? ($completedStages / $totalStages) * 100 : 0;

            return response()->json([
                'success' => true,
                'order' => $order,
                'progress' => [
                    'total_stages' => $totalStages,
                    'completed_stages' => $completedStages,
                    'current_stage' => $currentStage,
                    'progress_percentage' => round($progressPercentage, 2)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب تقدم الطلب: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب إحصائيات الإنتاج
     */
    public function getProductionStats()
    {
        try {
            $stats = [
                'active_orders' => Order::whereIn('status', ['in_production', 'pending'])->count(),
                'completed_today' => Order::where('status', 'completed')
                    ->whereDate('completed_date', today())->count(),
                'materials_count' => Material::where('is_active', true)->count(),
                'low_stock_alerts' => Material::whereRaw('(quantity - reserved_quantity) <= reorder_level')
                    ->where('is_active', true)->count()
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب إحصائيات الإنتاج: ' . $e->getMessage()
            ], 500);
        }
    }
}
