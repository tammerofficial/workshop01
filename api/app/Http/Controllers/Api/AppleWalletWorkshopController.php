<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyCustomer;
use App\Services\AppleWalletIntegrationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AppleWalletWorkshopController extends Controller
{
    protected AppleWalletIntegrationService $walletService;

    public function __construct(AppleWalletIntegrationService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * إنشاء بطاقة Apple Wallet لعميل الولاء
     */
    public function createPass(int $loyaltyCustomerId): JsonResponse
    {
        try {
            $loyaltyCustomer = LoyaltyCustomer::with('client')->findOrFail($loyaltyCustomerId);
            
            $result = $this->walletService->createWalletPass($loyaltyCustomer);
            
            return response()->json([
                'success' => $result['success'],
                'data' => $result['success'] ? [
                    'pass_url' => $result['pass_url'],
                    'serial_number' => $result['serial_number'],
                    'qr_code' => $result['qr_code'] ?? null,
                ] : null,
                'message' => $result['success'] ? 'تم إنشاء بطاقة Apple Wallet بنجاح' : $result['message']
            ], $result['success'] ? 200 : 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء بطاقة Apple Wallet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث بطاقة Apple Wallet
     */
    public function updatePass(int $loyaltyCustomerId): JsonResponse
    {
        try {
            $loyaltyCustomer = LoyaltyCustomer::with('client')->findOrFail($loyaltyCustomerId);
            
            $result = $this->walletService->updateWalletPass($loyaltyCustomer);
            
            return response()->json([
                'success' => $result['success'],
                'message' => $result['message']
            ], $result['success'] ? 200 : 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحديث بطاقة Apple Wallet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إرسال إشعار push للبطاقة
     */
    public function sendPushNotification(Request $request, int $loyaltyCustomerId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $loyaltyCustomer = LoyaltyCustomer::findOrFail($loyaltyCustomerId);
            
            $result = $this->walletService->sendPushNotification(
                $loyaltyCustomer,
                $request->message
            );
            
            return response()->json([
                'success' => $result['success'],
                'message' => $result['message']
            ], $result['success'] ? 200 : 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إرسال الإشعار',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف بطاقة Apple Wallet
     */
    public function deletePass(int $loyaltyCustomerId): JsonResponse
    {
        try {
            $loyaltyCustomer = LoyaltyCustomer::findOrFail($loyaltyCustomerId);
            
            $result = $this->walletService->deleteWalletPass($loyaltyCustomer);
            
            return response()->json([
                'success' => $result['success'],
                'message' => $result['message']
            ], $result['success'] ? 200 : 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في حذف بطاقة Apple Wallet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * رفع شعار الورشة لنظام الولاء
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:png,jpg,jpeg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'ملف غير صالح',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $logoPath = $request->file('logo')->store('workshop-logos', 'public');
            
            $result = $this->walletService->uploadWorkshopLogo($logoPath);
            
            return response()->json([
                'success' => $result['success'],
                'data' => $result['success'] ? [
                    'logo_id' => $result['logo_id'],
                    'logo_path' => $logoPath
                ] : null,
                'message' => $result['message']
            ], $result['success'] ? 200 : 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في رفع الشعار',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * مزامنة عميل مع نظام الولاء الخارجي
     */
    public function syncCustomer(int $loyaltyCustomerId): JsonResponse
    {
        try {
            $loyaltyCustomer = LoyaltyCustomer::with('client')->findOrFail($loyaltyCustomerId);
            
            $result = $this->walletService->syncCustomerWithExternalSystem($loyaltyCustomer);
            
            return response()->json([
                'success' => $result['success'],
                'data' => $result['success'] ? [
                    'external_customer_id' => $result['external_customer_id'] ?? null
                ] : null,
                'message' => $result['message']
            ], $result['success'] ? 200 : 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في مزامنة العميل',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * اختبار الاتصال مع نظام الولاء
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->walletService->testConnection();
            
            return response()->json([
                'success' => $result['success'],
                'data' => $result['success'] ? $result['system_info'] : null,
                'message' => $result['message']
            ], $result['success'] ? 200 : 503);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في اختبار الاتصال',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض حالة بطاقة Apple Wallet للعميل
     */
    public function getPassStatus(int $loyaltyCustomerId): JsonResponse
    {
        try {
            $loyaltyCustomer = LoyaltyCustomer::findOrFail($loyaltyCustomerId);
            
            $hasPass = !empty($loyaltyCustomer->wallet_pass_serial);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'has_pass' => $hasPass,
                    'serial_number' => $loyaltyCustomer->wallet_pass_serial,
                    'last_updated' => $loyaltyCustomer->wallet_last_updated_at?->format('Y-m-d H:i:s'),
                    'wallet_enabled' => $loyaltyCustomer->wallet_enabled,
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استرداد حالة البطاقة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تفعيل/إلغاء تفعيل Apple Wallet للعميل
     */
    public function toggleWalletEnabled(int $loyaltyCustomerId): JsonResponse
    {
        try {
            $loyaltyCustomer = LoyaltyCustomer::findOrFail($loyaltyCustomerId);
            
            $newStatus = !$loyaltyCustomer->wallet_enabled;
            $loyaltyCustomer->update(['wallet_enabled' => $newStatus]);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'wallet_enabled' => $newStatus
                ],
                'message' => $newStatus ? 'تم تفعيل Apple Wallet' : 'تم إلغاء تفعيل Apple Wallet'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحديث حالة Apple Wallet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء بطاقات Apple Wallet لجميع عملاء الولاء
     */
    public function createAllPasses(): JsonResponse
    {
        try {
            $loyaltyCustomers = LoyaltyCustomer::with('client')
                ->where('wallet_enabled', true)
                ->whereNull('wallet_pass_serial')
                ->get();

            $results = [
                'success_count' => 0,
                'error_count' => 0,
                'details' => []
            ];

            foreach ($loyaltyCustomers as $customer) {
                $result = $this->walletService->createWalletPass($customer);
                
                if ($result['success']) {
                    $results['success_count']++;
                } else {
                    $results['error_count']++;
                    $results['details'][] = [
                        'customer_id' => $customer->id,
                        'name' => $customer->name,
                        'error' => $result['message']
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => "تم إنشاء {$results['success_count']} بطاقة بنجاح، فشل في {$results['error_count']} بطاقة"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء البطاقات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث جميع بطاقات Apple Wallet
     */
    public function updateAllPasses(): JsonResponse
    {
        try {
            $loyaltyCustomers = LoyaltyCustomer::with('client')
                ->where('wallet_enabled', true)
                ->whereNotNull('wallet_pass_serial')
                ->get();

            $results = [
                'success_count' => 0,
                'error_count' => 0,
                'details' => []
            ];

            foreach ($loyaltyCustomers as $customer) {
                $result = $this->walletService->updateWalletPass($customer);
                
                if ($result['success']) {
                    $results['success_count']++;
                } else {
                    $results['error_count']++;
                    $results['details'][] = [
                        'customer_id' => $customer->id,
                        'name' => $customer->name,
                        'error' => $result['message']
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => "تم تحديث {$results['success_count']} بطاقة بنجاح، فشل في {$results['error_count']} بطاقة"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحديث البطاقات',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}