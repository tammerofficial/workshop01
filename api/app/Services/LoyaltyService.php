<?php

namespace App\Services;

use App\Models\Client;
use App\Models\LoyaltyCustomer;
use App\Models\WorkshopOrder;
use App\Models\Sale;
use App\Models\LoyaltyTransaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    /**
     * معالجة طلب جديد وحساب النقاط
     */
    public function processOrderLoyalty(WorkshopOrder $order): ?array
    {
        try {
            DB::beginTransaction();

            $client = $order->client;
            if (!$client || !$client->loyalty_enabled) {
                return null;
            }

            // إنشاء حساب ولاء إذا لم يكن موجوداً
            $loyaltyCustomer = $client->loyaltyCustomer ?? $client->createLoyaltyAccount();

            if (!$loyaltyCustomer) {
                return null;
            }

            // حساب النقاط من الطلب
            $pointsEarned = $loyaltyCustomer->earnPoints(
                (float)$order->selling_price,
                "نقاط من طلب #{$order->order_number}",
                $order
            );

            // مزامنة النقاط مع Client
            $client->syncLoyaltyPoints();

            DB::commit();

            Log::info('Loyalty points processed for order', [
                'order_id' => $order->id,
                'client_id' => $client->id,
                'points_earned' => $pointsEarned,
                'total_points' => $loyaltyCustomer->total_points
            ]);

            return [
                'points_earned' => $pointsEarned,
                'total_points' => $loyaltyCustomer->total_points,
                'available_points' => $loyaltyCustomer->available_points,
                'tier' => $loyaltyCustomer->tier,
                'tier_name' => $loyaltyCustomer->getTierName(),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing loyalty points for order', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * معالجة مبيعة وحساب النقاط
     */
    public function processSaleLoyalty(Sale $sale): ?array
    {
        try {
            DB::beginTransaction();

            $client = $sale->client;
            if (!$client || !$client->loyalty_enabled) {
                return null;
            }

            $loyaltyCustomer = $client->loyaltyCustomer ?? $client->createLoyaltyAccount();

            if (!$loyaltyCustomer) {
                return null;
            }

            $pointsEarned = $loyaltyCustomer->earnPoints(
                (float)$sale->amount,
                "نقاط من مبيعة #{$sale->sale_number}",
                null,
                $sale
            );

            $client->syncLoyaltyPoints();

            DB::commit();

            Log::info('Loyalty points processed for sale', [
                'sale_id' => $sale->id,
                'client_id' => $client->id,
                'points_earned' => $pointsEarned
            ]);

            return [
                'points_earned' => $pointsEarned,
                'total_points' => $loyaltyCustomer->total_points,
                'available_points' => $loyaltyCustomer->available_points,
                'tier' => $loyaltyCustomer->tier,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing loyalty points for sale', [
                'sale_id' => $sale->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * استخدام النقاط في خصم
     */
    public function redeemPoints(int $clientId, int $points, string $description = null): array
    {
        try {
            DB::beginTransaction();

            $client = Client::findOrFail($clientId);
            $loyaltyCustomer = $client->loyaltyCustomer;

            if (!$loyaltyCustomer) {
                throw new \Exception('العميل لا يملك حساب ولاء');
            }

            if (!$loyaltyCustomer->redeemPoints($points, $description)) {
                throw new \Exception('نقاط غير كافية');
            }

            $client->syncLoyaltyPoints();

            DB::commit();

            return [
                'success' => true,
                'points_redeemed' => $points,
                'remaining_points' => $loyaltyCustomer->available_points,
                'message' => "تم استخدام {$points} نقطة بنجاح"
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * إضافة نقاط مكافأة
     */
    public function addBonusPoints(int $clientId, int $points, string $description): array
    {
        try {
            DB::beginTransaction();

            $client = Client::findOrFail($clientId);
            $loyaltyCustomer = $client->loyaltyCustomer ?? $client->createLoyaltyAccount();

            $loyaltyCustomer->earnBonusPoints($points, $description);
            $client->syncLoyaltyPoints();

            DB::commit();

            return [
                'success' => true,
                'points_added' => $points,
                'total_points' => $loyaltyCustomer->total_points,
                'message' => "تم إضافة {$points} نقطة مكافأة"
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * تحويل النقاط إلى قيمة نقدية
     */
    public function convertPointsToValue(int $points, string $currency = 'KWD'): float
    {
        // كل 100 نقطة = 1 دينار كويتي
        $conversionRate = config('loyalty.points_to_currency_rate', 100);
        return round($points / $conversionRate, 3);
    }

    /**
     * تحويل القيمة النقدية إلى نقاط
     */
    public function convertValueToPoints(float $amount): int
    {
        $pointsPerUnit = config('loyalty.points_per_kwd', 1);
        return (int) floor($amount * $pointsPerUnit);
    }

    /**
     * الحصول على ملخص الولاء للعميل
     */
    public function getCustomerLoyaltySummary(int $clientId): array
    {
        $client = Client::with('loyaltyCustomer.transactions')->findOrFail($clientId);
        $loyaltyCustomer = $client->loyaltyCustomer;

        if (!$loyaltyCustomer) {
            return [
                'has_loyalty' => false,
                'message' => 'العميل لا يملك حساب ولاء'
            ];
        }

        // إحصائيات المعاملات
        $transactions = $loyaltyCustomer->transactions()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $earnedPoints = $loyaltyCustomer->transactions()->earned()->sum('points');
        $redeemedPoints = abs($loyaltyCustomer->transactions()->redeemed()->sum('points'));
        $expiredPoints = abs($loyaltyCustomer->transactions()->expired()->sum('points'));

        return [
            'has_loyalty' => true,
            'customer_info' => $loyaltyCustomer->getCustomerInfo(),
            'statistics' => [
                'total_earned' => $earnedPoints,
                'total_redeemed' => $redeemedPoints,
                'total_expired' => $expiredPoints,
                'current_value' => $this->convertPointsToValue($loyaltyCustomer->available_points),
            ],
            'recent_transactions' => $transactions->map(function($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'type_label' => $transaction->getTypeLabel(),
                    'points' => $transaction->getFormattedPoints(),
                    'amount' => $transaction->getFormattedAmount(),
                    'description' => $transaction->description,
                    'date' => $transaction->created_at->format('Y-m-d H:i'),
                    'expires_at' => $transaction->expires_at?->format('Y-m-d'),
                ];
            })
        ];
    }

    /**
     * انتهاء صلاحية النقاط
     */
    public function expirePoints(): array
    {
        $results = [];
        $customers = LoyaltyCustomer::active()
            ->whereHas('transactions', function($q) {
                $q->where('type', 'earned')
                  ->where('expires_at', '<=', now());
            })
            ->get();

        foreach ($customers as $customer) {
            $expiredPoints = $customer->expirePoints();
            if ($expiredPoints > 0) {
                $results[] = [
                    'customer_id' => $customer->id,
                    'membership_number' => $customer->membership_number,
                    'expired_points' => $expiredPoints
                ];
                
                // مزامنة مع Client
                $customer->client->syncLoyaltyPoints();
            }
        }

        Log::info('Points expiration process completed', [
            'customers_affected' => count($results),
            'total_expired_points' => collect($results)->sum('expired_points')
        ]);

        return $results;
    }

    /**
     * إحصائيات نظام الولاء
     */
    public function getLoyaltyStatistics(): array
    {
        $totalCustomers = LoyaltyCustomer::active()->count();
        $totalPoints = LoyaltyCustomer::active()->sum('total_points');
        $availablePoints = LoyaltyCustomer::active()->sum('available_points');
        $totalSpent = LoyaltyCustomer::active()->sum('total_spent');

        $tierDistribution = LoyaltyCustomer::active()
            ->selectRaw('tier, COUNT(*) as count')
            ->groupBy('tier')
            ->pluck('count', 'tier')
            ->toArray();

        $recentTransactions = LoyaltyTransaction::with(['loyaltyCustomer', 'client'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return [
            'summary' => [
                'total_customers' => $totalCustomers,
                'total_points_issued' => $totalPoints,
                'available_points' => $availablePoints,
                'total_spent' => $totalSpent,
                'average_points_per_customer' => $totalCustomers > 0 ? round($totalPoints / $totalCustomers) : 0,
            ],
            'tier_distribution' => $tierDistribution,
            'recent_activity' => $recentTransactions->map(function($transaction) {
                return [
                    'customer_name' => $transaction->loyaltyCustomer->name,
                    'type' => $transaction->getTypeLabel(),
                    'points' => $transaction->getFormattedPoints(),
                    'description' => $transaction->description,
                    'date' => $transaction->created_at->format('Y-m-d H:i'),
                ];
            })
        ];
    }

    /**
     * تطبيق خصم بالنقاط على طلب
     */
    public function applyPointsDiscount(WorkshopOrder $order, int $points): array
    {
        try {
            DB::beginTransaction();

            $client = $order->client;
            $loyaltyCustomer = $client->loyaltyCustomer;

            if (!$loyaltyCustomer) {
                throw new \Exception('العميل لا يملك حساب ولاء');
            }

            $discountAmount = $this->convertPointsToValue($points);
            
            if ($discountAmount > $order->selling_price) {
                throw new \Exception('قيمة الخصم أكبر من قيمة الطلب');
            }

            if (!$loyaltyCustomer->redeemPoints($points, "خصم على طلب #{$order->order_number}")) {
                throw new \Exception('نقاط غير كافية');
            }

            // تحديث سعر الطلب
            $newPrice = $order->selling_price - $discountAmount;
            $order->update(['selling_price' => $newPrice]);

            $client->syncLoyaltyPoints();

            DB::commit();

            return [
                'success' => true,
                'points_used' => $points,
                'discount_amount' => $discountAmount,
                'new_order_price' => $newPrice,
                'remaining_points' => $loyaltyCustomer->available_points
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * إرسال تذكير بانتهاء صلاحية النقاط
     */
    public function sendExpiryReminders(int $days = 30): array
    {
        $customers = LoyaltyCustomer::active()
            ->withExpiredPoints($days)
            ->get();

        $reminders = [];
        foreach ($customers as $customer) {
            $expiringPoints = $customer->getExpiringPoints($days);
            if ($expiringPoints > 0) {
                $reminders[] = [
                    'customer_id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'expiring_points' => $expiringPoints,
                    'days_remaining' => $days
                ];
            }
        }

        // هنا يمكن إضافة إرسال الإشعارات أو الإيميلات

        return $reminders;
    }
}