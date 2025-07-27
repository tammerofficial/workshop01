<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Worker;
use App\Models\Product;
use App\Models\Collection;
use App\Services\SmartProductionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SmartProductionController extends Controller
{
    protected $productionService;

    public function __construct(SmartProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    /**
     * بدء الإنتاج الذكي
     */
    public function startProduction(Request $request, Order $order): JsonResponse
    {
        try {
            $result = $this->productionService->startSmartProduction($order);
            
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في بدء الإنتاج: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الانتقال للمرحلة التالية
     */
    public function moveToNextStage(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'completed_hours' => 'nullable|integer|min:1'
        ]);

        try {
            $result = $this->productionService->moveToNextStage(
                $order, 
                $request->completed_hours
            );
            
            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => $result
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن الانتقال للمرحلة التالية'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الانتقال للمرحلة التالية: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تعيين عامل للطلب حسب المرحلة
     */
    public function assignWorkerByStage(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'stage' => 'required|string|in:design,cutting,sewing,fitting,finishing,quality_check',
            'worker_id' => 'nullable|exists:workers,id'
        ]);

        try {
            if ($request->worker_id) {
                // تعيين عامل محدد
                $worker = Worker::findOrFail($request->worker_id);
                $order->update(['current_worker_id' => $worker->id]);
            } else {
                // تعيين تلقائي حسب التخصص
                $worker = $order->assignWorkerByStage($request->stage);
                
                if (!$worker) {
                    return response()->json([
                        'success' => false,
                        'message' => 'لا يوجد عامل متاح لهذه المرحلة'
                    ], 404);
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "تم تعيين العامل {$worker->name} للمرحلة {$request->stage}",
                'data' => [
                    'order' => $order->load(['currentWorker']),
                    'worker' => $worker
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تعيين العامل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إحصائيات الإنتاج
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = $this->productionService->getProductionStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الإحصائيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تقرير أداء العمال
     */
    public function getWorkerPerformance(Request $request): JsonResponse
    {
        $request->validate([
            'worker_id' => 'nullable|exists:workers,id',
            'period' => 'nullable|string|in:week,month,year'
        ]);

        try {
            $performance = $this->productionService->getWorkerPerformance(
                $request->worker_id,
                $request->period ?? 'week'
            );
            
            return response()->json([
                'success' => true,
                'data' => $performance
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب تقرير الأداء: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * قائمة العمال حسب التخصص
     */
    public function getWorkersBySpecialty($specialty): JsonResponse
    {
        try {
            $workers = Worker::where('is_active', true)
                ->where(function($query) use ($specialty) {
                    $query->where('specialty', $specialty)
                          ->orWhereJsonContains('production_stages', $specialty);
                })
                ->with(['productionTracking' => function($query) {
                    $query->where('status', 'in_progress');
                }])
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $workers
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب قائمة العمال: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث حالة الجودة
     */
    public function updateQualityStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'quality_status' => 'required|string|in:approved,rejected',
            'quality_notes' => 'nullable|string'
        ]);

        try {
            $order->update([
                'quality_status' => $request->quality_status,
                'notes' => $order->notes . "\n" . "فحص الجودة: " . $request->quality_notes
            ]);

            if ($request->quality_status === 'approved') {
                // الانتقال للمرحلة التالية تلقائياً
                $this->productionService->moveToNextStage($order);
            } else {
                // العودة لمرحلة سابقة للإصلاح
                $order->update(['production_stage' => 'finishing']);
            }
            
            return response()->json([
                'success' => true,
                'message' => $request->quality_status === 'approved' ? 'تم اعتماد الجودة' : 'تم رفض الجودة، العودة للتشطيب',
                'data' => $order->fresh()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحديث حالة الجودة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب الطلبات حسب المرحلة
     */
    public function getOrdersByStage($stage): JsonResponse
    {
        try {
            $orders = Order::where('production_stage', $stage)
                ->with([
                    'client', 
                    'currentWorker', 
                    'product', 
                    'collection',
                    'productionTracking.productionStage'
                ])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الطلبات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب منتجات مع ساعات الإنتاج
     */
    public function getProductsWithHours(): JsonResponse
    {
        try {
            $products = Product::with(['category', 'collection'])
                ->where('is_active', true)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $products
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب المنتجات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب الكولكشنات
     */
    public function getCollections(): JsonResponse
    {
        try {
            $collections = Collection::with(['products'])
                ->where('is_active', true)
                ->orderBy('year', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $collections
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الكولكشنات: ' . $e->getMessage()
            ], 500);
        }
    }
}
