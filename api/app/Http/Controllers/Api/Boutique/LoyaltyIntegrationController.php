<?php

namespace App\Http\Controllers\Api\Boutique;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\LoyaltyCustomer;
use App\Models\Client;
use App\Models\BoutiqueSale;
use App\Models\Boutique;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class LoyaltyIntegrationController extends Controller
{
    /**
     * البحث عن عميل الولاء بالرقم أو البريد أو الهاتف
     */
    public function searchCustomer(Request $request): JsonResponse
    {
        // التحقق من الصلاحيات
        if (!auth()->user()->hasPermission('loyalty.boutique_integration')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لنظام الولاء'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'search_term' => 'required|string|min:3',
            'boutique_id' => 'required|exists:boutiques,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $searchTerm = $request->search_term;
            $boutiqueId = $request->boutique_id;
            
            // التحقق من إمكانية الوصول للبوتيك
            $boutique = Boutique::find($boutiqueId);
            if (!$boutique->canBeAccessedBy(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بالوصول لهذا البوتيك'
                ], 403);
            }

            // البحث في عملاء الولاء
            $loyaltyCustomers = LoyaltyCustomer::where('is_active', true)
                ->where(function ($query) use ($searchTerm) {
                    $query->where('membership_number', 'like', "%{$searchTerm}%")
                          ->orWhere('email', 'like', "%{$searchTerm}%")
                          ->orWhere('phone', 'like', "%{$searchTerm}%")
                          ->orWhere('name', 'like', "%{$searchTerm}%");
                })
                ->with(['client'])
                ->take(10)
                ->get();

            $results = $loyaltyCustomers->map(function ($customer) use ($boutique) {
                return [
                    'loyalty_customer_id' => $customer->id,
                    'client_id' => $customer->client_id,
                    'membership_number' => $customer->membership_number,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'tier' => $customer->tier,
                    'available_points' => $customer->available_points,
                    'total_points' => $customer->total_points,
                    'tier_multiplier' => $customer->tier_multiplier,
                    'wallet_enabled' => $customer->wallet_enabled,
                    'can_earn_points' => $boutique->loyalty_enabled,
                    'points_per_kwd' => $boutique->default_points_per_kwd,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $results,
                'count' => $results->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Loyalty customer search error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء البحث عن العميل'
            ], 500);
        }
    }

    /**
     * حساب النقاط للبيع قبل إتمامه
     */
    public function calculatePoints(Request $request): JsonResponse
    {
        // التحقق من الصلاحيات
        if (!auth()->user()->hasPermission('loyalty.boutique_integration')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لنظام الولاء'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'loyalty_customer_id' => 'required|exists:loyalty_customers,id',
            'boutique_id' => 'required|exists:boutiques,id',
            'total_amount' => 'required|numeric|min:0',
            'points_to_use' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customer = LoyaltyCustomer::find($request->loyalty_customer_id);
            $boutique = Boutique::find($request->boutique_id);
            $totalAmount = $request->total_amount;
            $pointsToUse = $request->points_to_use ?? 0;

            // التحقق من إمكانية الوصول للبوتيك
            if (!$boutique->canBeAccessedBy(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بالوصول لهذا البوتيك'
                ], 403);
            }

            // حساب النقاط المكتسبة
            $basePoints = $totalAmount * $boutique->default_points_per_kwd;
            $earnedPoints = (int) round($basePoints * $customer->tier_multiplier);

            // حساب خصم النقاط المستخدمة
            $maxUsablePoints = min($pointsToUse, $customer->available_points);
            $discountAmount = $maxUsablePoints / 100; // 100 نقطة = 1 دينار
            $discountAmount = min($discountAmount, $totalAmount);

            // المبلغ النهائي بعد خصم النقاط
            $finalAmount = max(0, $totalAmount - $discountAmount);

            return response()->json([
                'success' => true,
                'data' => [
                    'customer' => [
                        'name' => $customer->name,
                        'tier' => $customer->tier,
                        'available_points' => $customer->available_points,
                        'tier_multiplier' => $customer->tier_multiplier,
                    ],
                    'calculation' => [
                        'original_amount' => $totalAmount,
                        'points_to_use' => $maxUsablePoints,
                        'discount_amount' => $discountAmount,
                        'final_amount' => $finalAmount,
                        'points_to_earn' => $earnedPoints,
                        'points_after_transaction' => $customer->available_points - $maxUsablePoints + $earnedPoints,
                    ],
                    'validation' => [
                        'can_use_points' => $customer->available_points > 0,
                        'max_usable_points' => min($customer->available_points, $totalAmount * 100),
                        'conversion_rate' => '100 نقطة = 1 دينار',
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Calculate loyalty points error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حساب النقاط'
            ], 500);
        }
    }
}