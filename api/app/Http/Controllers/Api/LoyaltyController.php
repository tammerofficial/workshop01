<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LoyaltyService;
use App\Models\Client;
use App\Models\LoyaltyCustomer;
use App\Models\WorkshopOrder;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LoyaltyController extends Controller
{
    protected LoyaltyService $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * عرض إحصائيات نظام الولاء العامة
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->loyaltyService->getLoyaltyStatistics();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استرداد الإحصائيات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض ملخص ولاء العميل
     */
    public function customerSummary(int $clientId): JsonResponse
    {
        try {
            $summary = $this->loyaltyService->getCustomerLoyaltySummary($clientId);
            
            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استرداد بيانات العميل',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء حساب ولاء لعميل
     */
    public function createAccount(Request $request, int $clientId): JsonResponse
    {
        try {
            $client = Client::findOrFail($clientId);
            
            if ($client->hasLoyaltyAccount()) {
                return response()->json([
                    'success' => false,
                    'message' => 'العميل يملك حساب ولاء مسبقاً'
                ], 400);
            }

            $loyaltyCustomer = $client->createLoyaltyAccount();
            
            // إضافة نقاط ترحيب
            $welcomePoints = config('loyalty.earning_rules.signup.points', 50);
            if ($welcomePoints > 0) {
                $loyaltyCustomer->earnBonusPoints(
                    $welcomePoints,
                    config('loyalty.messages.welcome', 'نقاط ترحيب')
                );
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'loyalty_customer' => $loyaltyCustomer->getCustomerInfo(),
                    'welcome_points' => $welcomePoints
                ],
                'message' => 'تم إنشاء حساب الولاء بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء حساب الولاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إضافة نقاط مكافأة لعميل
     */
    public function addBonusPoints(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'points' => 'required|integer|min:1|max:10000',
            'description' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->loyaltyService->addBonusPoints(
                $request->client_id,
                $request->points,
                $request->description
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إضافة النقاط',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * استخدام النقاط
     */
    public function redeemPoints(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'points' => 'required|integer|min:1',
            'description' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->loyaltyService->redeemPoints(
                $request->client_id,
                $request->points,
                $request->description ?? 'استخدام نقاط'
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استخدام النقاط',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تطبيق خصم بالنقاط على طلب
     */
    public function applyOrderDiscount(Request $request, int $orderId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:' . config('loyalty.redemption_rules.minimum_points', 100)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = WorkshopOrder::findOrFail($orderId);
            $result = $this->loyaltyService->applyPointsDiscount($order, $request->points);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تطبيق الخصم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * معالجة نقاط طلب معين
     */
    public function processOrderPoints(int $orderId): JsonResponse
    {
        try {
            $order = WorkshopOrder::findOrFail($orderId);
            $result = $this->loyaltyService->processOrderLoyalty($order);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'data' => $result,
                    'message' => 'تم معالجة نقاط الطلب بنجاح'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'العميل غير مشترك في برنامج الولاء أو الطلب غير مؤهل'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في معالجة نقاط الطلب',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * معالجة نقاط مبيعة معينة
     */
    public function processSalePoints(int $saleId): JsonResponse
    {
        try {
            $sale = Sale::findOrFail($saleId);
            $result = $this->loyaltyService->processSaleLoyalty($sale);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'data' => $result,
                    'message' => 'تم معالجة نقاط المبيعة بنجاح'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'العميل غير مشترك في برنامج الولاء أو المبيعة غير مؤهلة'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في معالجة نقاط المبيعة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض قائمة العملاء في برنامج الولاء
     */
    public function customers(Request $request): JsonResponse
    {
        try {
            $query = LoyaltyCustomer::with('client')
                ->active()
                ->orderBy('total_points', 'desc');

            // فلترة حسب المستوى
            if ($request->has('tier') && $request->tier) {
                $query->where('tier', $request->tier);
            }

            // بحث
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('membership_number', 'like', "%{$search}%");
                });
            }

            $customers = $query->paginate($request->per_page ?? 20);

            return response()->json([
                'success' => true,
                'data' => [
                    'customers' => $customers->items(),
                    'pagination' => [
                        'current_page' => $customers->currentPage(),
                        'last_page' => $customers->lastPage(),
                        'per_page' => $customers->perPage(),
                        'total' => $customers->total(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استرداد قائمة العملاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض تفاصيل عميل ولاء معين
     */
    public function customerDetails(int $customerId): JsonResponse
    {
        try {
            $customer = LoyaltyCustomer::with(['client', 'transactions' => function($q) {
                $q->orderBy('created_at', 'desc')->limit(50);
            }])->findOrFail($customerId);

            return response()->json([
                'success' => true,
                'data' => [
                    'customer_info' => $customer->getCustomerInfo(),
                    'transactions' => $customer->transactions->map(function($transaction) {
                        return [
                            'id' => $transaction->id,
                            'type' => $transaction->type,
                            'type_label' => $transaction->getTypeLabel(),
                            'points' => $transaction->getFormattedPoints(),
                            'amount' => $transaction->getFormattedAmount(),
                            'description' => $transaction->description,
                            'date' => $transaction->created_at->format('Y-m-d H:i'),
                            'expires_at' => $transaction->expires_at?->format('Y-m-d'),
                            'reference_number' => $transaction->reference_number,
                        ];
                    })
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استرداد تفاصيل العميل',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحويل النقاط إلى قيمة نقدية
     */
    public function convertPoints(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $value = $this->loyaltyService->convertPointsToValue($request->points);
            $points = $this->loyaltyService->convertValueToPoints($value);

            return response()->json([
                'success' => true,
                'data' => [
                    'points' => $request->points,
                    'value' => $value,
                    'currency' => config('loyalty.default_currency'),
                    'conversion_rate' => config('loyalty.redemption_rules.conversion_rate'),
                    'reverse_points' => $points
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحويل النقاط',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * انتهاء صلاحية النقاط (يدوي)
     */
    public function expirePoints(): JsonResponse
    {
        try {
            $results = $this->loyaltyService->expirePoints();
            
            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => 'تم معالجة انتهاء صلاحية النقاط',
                'summary' => [
                    'customers_affected' => count($results),
                    'total_expired_points' => collect($results)->sum('expired_points')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في معالجة انتهاء الصلاحية',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إرسال تذكير بانتهاء صلاحية النقاط
     */
    public function sendExpiryReminders(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        
        try {
            $reminders = $this->loyaltyService->sendExpiryReminders($days);
            
            return response()->json([
                'success' => true,
                'data' => $reminders,
                'message' => 'تم إرسال التذكيرات',
                'count' => count($reminders)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إرسال التذكيرات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إعدادات نظام الولاء
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'tiers' => config('loyalty.tiers'),
                'earning_rules' => config('loyalty.earning_rules'),
                'redemption_rules' => config('loyalty.redemption_rules'),
                'points_per_kwd' => config('loyalty.points_per_kwd'),
                'expiry_months' => config('loyalty.points_expiry_months'),
            ]
        ]);
    }
}