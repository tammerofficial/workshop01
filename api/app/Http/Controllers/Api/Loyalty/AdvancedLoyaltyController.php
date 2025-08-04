<?php

namespace App\Http\Controllers\Api\Loyalty;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTier;
use App\Models\LoyaltyRedemption;
use App\Models\LoyaltyCampaign;
use App\Models\DigitalLoyaltyCard;
use App\Models\CustomerLoyaltyTier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdvancedLoyaltyController extends Controller
{
    public function getCustomerLoyaltyProfile($customerId): JsonResponse
    {
        $customer = User::with(['roles'])->findOrFail($customerId);
        
        // Get loyalty stats
        $totalPoints = LoyaltyPoint::where('customer_id', $customerId)
                                 ->where('is_expired', false)
                                 ->sum('points');
        
        $totalEarned = LoyaltyPoint::where('customer_id', $customerId)
                                 ->where('type', 'earned')
                                 ->sum('points');
        
        $totalRedeemed = LoyaltyPoint::where('customer_id', $customerId)
                                   ->where('type', 'redeemed')
                                   ->sum('points');
        
        // Get current tier
        $currentTier = CustomerLoyaltyTier::where('customer_id', $customerId)
                                        ->where('is_current', true)
                                        ->with('loyaltyTier')
                                        ->first();
        
        // Calculate total lifetime spending
        $totalSpending = $this->calculateCustomerTotalSpending($customerId);
        
        // Get next tier
        $nextTier = null;
        if ($currentTier) {
            $nextTier = LoyaltyTier::where('min_spending_amount', '>', $currentTier->loyaltyTier->min_spending_amount)
                                  ->where('is_active', true)
                                  ->orderBy('min_spending_amount', 'asc')
                                  ->first();
        }
        
        // Recent activity
        $recentActivity = LoyaltyPoint::where('customer_id', $customerId)
                                    ->with(['loyaltyRedemption'])
                                    ->orderBy('created_at', 'desc')
                                    ->limit(10)
                                    ->get();
        
        // Available campaigns
        $availableCampaigns = LoyaltyCampaign::where('is_active', true)
                                           ->where('start_date', '<=', now())
                                           ->where('end_date', '>=', now())
                                           ->get();
        
        // Digital loyalty cards
        $digitalCards = DigitalLoyaltyCard::where('customer_id', $customerId)
                                        ->where('is_active', true)
                                        ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone
                ],
                'loyalty_stats' => [
                    'total_points' => $totalPoints,
                    'total_earned' => $totalEarned,
                    'total_redeemed' => abs($totalRedeemed),
                    'total_spending' => $totalSpending,
                    'points_value' => $this->calculatePointsValue($totalPoints)
                ],
                'current_tier' => $currentTier ? [
                    'id' => $currentTier->loyaltyTier->id,
                    'name' => $currentTier->loyaltyTier->name,
                    'name_ar' => $currentTier->loyaltyTier->name_ar,
                    'level' => $currentTier->loyaltyTier->level,
                    'benefits' => $currentTier->loyaltyTier->benefits,
                    'points_multiplier' => $currentTier->loyaltyTier->points_multiplier,
                    'badge_color' => $currentTier->loyaltyTier->badge_color,
                    'tier_achieved_date' => $currentTier->tier_achieved_date
                ] : null,
                'next_tier' => $nextTier ? [
                    'name' => $nextTier->name,
                    'name_ar' => $nextTier->name_ar,
                    'min_spending_amount' => $nextTier->min_spending_amount,
                    'spending_needed' => max(0, $nextTier->min_spending_amount - $totalSpending)
                ] : null,
                'recent_activity' => $recentActivity,
                'available_campaigns' => $availableCampaigns,
                'digital_cards' => $digitalCards
            ],
            'message' => 'Customer loyalty profile retrieved successfully'
        ]);
    }

    public function earnPoints(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'points' => 'required|integer|min:1',
            'source_type' => 'required|in:purchase,referral,bonus,custom_order,campaign,manual',
            'source_id' => 'nullable|integer',
            'description' => 'required|string',
            'multiplier' => 'nullable|numeric|min:1',
            'expiry_days' => 'nullable|integer|min:1'
        ]);

        $customer = User::findOrFail($request->customer_id);
        $multiplier = $request->multiplier ?? 1.0;
        
        // Check for current tier multiplier
        $currentTier = CustomerLoyaltyTier::where('customer_id', $request->customer_id)
                                        ->where('is_current', true)
                                        ->with('loyaltyTier')
                                        ->first();
        
        if ($currentTier) {
            $multiplier *= $currentTier->loyaltyTier->points_multiplier;
        }
        
        $finalPoints = $request->points * $multiplier;
        $expiryDate = $request->expiry_days ? 
            now()->addDays($request->expiry_days) : 
            now()->addYear();

        $loyaltyPoint = LoyaltyPoint::create([
            'customer_id' => $request->customer_id,
            'points' => $finalPoints,
            'type' => 'earned',
            'description' => $request->description,
            'source_type' => $request->source_type,
            'source_id' => $request->source_id,
            'multiplier' => $multiplier,
            'expiry_date' => $expiryDate
        ]);

        // Update tier if needed
        $this->updateCustomerTier($request->customer_id);
        
        // Update digital cards
        $this->updateDigitalCards($request->customer_id);

        return response()->json([
            'success' => true,
            'data' => [
                'loyalty_point' => $loyaltyPoint,
                'total_points' => $this->getCustomerTotalPoints($request->customer_id),
                'points_value' => $this->calculatePointsValue($finalPoints)
            ],
            'message' => 'Points earned successfully'
        ], 201);
    }

    public function redeemPoints(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'points' => 'required|integer|min:1',
            'redemption_type' => 'required|in:discount,cashback,product,service,custom',
            'description' => 'required|string',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer'
        ]);

        $customer = User::findOrFail($request->customer_id);
        $availablePoints = $this->getCustomerTotalPoints($request->customer_id);

        if ($availablePoints < $request->points) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient loyalty points',
                'data' => [
                    'available_points' => $availablePoints,
                    'requested_points' => $request->points
                ]
            ], 400);
        }

        $valueRedeemed = $this->calculatePointsValue($request->points);

        // Create redemption record
        $redemption = LoyaltyRedemption::create([
            'customer_id' => $request->customer_id,
            'redemption_type' => $request->redemption_type,
            'points_used' => $request->points,
            'value_redeemed' => $valueRedeemed,
            'reference_type' => $request->reference_type,
            'reference_id' => $request->reference_id,
            'description' => $request->description,
            'status' => 'approved', // Auto-approve for now
            'processed_by' => auth()->id(),
            'processed_at' => now()
        ]);

        // Deduct points using FIFO (First In, First Out)
        $this->deductPointsFIFO($request->customer_id, $request->points, $redemption->id);

        // Update digital cards
        $this->updateDigitalCards($request->customer_id);

        return response()->json([
            'success' => true,
            'data' => [
                'redemption' => $redemption,
                'value_redeemed' => $valueRedeemed,
                'remaining_points' => $this->getCustomerTotalPoints($request->customer_id)
            ],
            'message' => 'Points redeemed successfully'
        ], 201);
    }

    public function getLoyaltyTiers(): JsonResponse
    {
        $tiers = LoyaltyTier::where('is_active', true)
                          ->orderBy('level')
                          ->get();

        return response()->json([
            'success' => true,
            'data' => $tiers,
            'message' => 'Loyalty tiers retrieved successfully'
        ]);
    }

    public function createLoyaltyCampaign(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'type' => 'required|in:bonus_points,double_points,cashback,free_shipping,early_access',
            'conditions' => 'required|array',
            'rewards' => 'required|array',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses_per_customer' => 'nullable|integer|min:1',
            'total_uses_limit' => 'nullable|integer|min:1',
            'promo_code' => 'nullable|string|unique:loyalty_campaigns'
        ]);

        $campaign = LoyaltyCampaign::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $campaign,
            'message' => 'Loyalty campaign created successfully'
        ], 201);
    }

    public function generateDigitalLoyaltyCard(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'card_type' => 'required|in:apple_wallet,google_pay'
        ]);

        $customer = User::findOrFail($request->customer_id);
        
        // Check if card already exists
        $existingCard = DigitalLoyaltyCard::where('customer_id', $request->customer_id)
                                        ->where('card_type', $request->card_type)
                                        ->where('is_active', true)
                                        ->first();

        if ($existingCard) {
            return response()->json([
                'success' => false,
                'message' => 'Digital loyalty card already exists for this customer'
            ], 400);
        }

        $cardData = $this->generateCardData($customer, $request->card_type);
        
        $digitalCard = DigitalLoyaltyCard::create([
            'customer_id' => $request->customer_id,
            'card_type' => $request->card_type,
            'card_identifier' => $cardData['identifier'],
            'pass_type_identifier' => $cardData['pass_type_identifier'] ?? null,
            'serial_number' => $cardData['serial_number'],
            'card_data' => $cardData['data'],
            'is_active' => true,
            'issued_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'data' => $digitalCard,
            'download_url' => $cardData['download_url'] ?? null,
            'message' => 'Digital loyalty card generated successfully'
        ], 201);
    }

    public function getLoyaltyAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();

        $analytics = [
            'overview' => [
                'total_customers' => User::whereHas('roles', function($q) {
                    $q->where('name', 'LIKE', '%customer%');
                })->count(),
                'active_loyalty_customers' => LoyaltyPoint::distinct('customer_id')->count(),
                'total_points_in_circulation' => LoyaltyPoint::where('is_expired', false)->sum('points'),
                'total_value_in_circulation' => $this->calculatePointsValue(
                    LoyaltyPoint::where('is_expired', false)->sum('points')
                )
            ],
            'period_stats' => [
                'points_earned' => LoyaltyPoint::where('type', 'earned')
                                              ->whereBetween('created_at', [$startDate, $endDate])
                                              ->sum('points'),
                'points_redeemed' => abs(LoyaltyPoint::where('type', 'redeemed')
                                                   ->whereBetween('created_at', [$startDate, $endDate])
                                                   ->sum('points')),
                'value_redeemed' => LoyaltyRedemption::whereBetween('created_at', [$startDate, $endDate])
                                                   ->sum('value_redeemed'),
                'new_customers_joined' => User::whereHas('roles', function($q) {
                                               $q->where('name', 'LIKE', '%customer%');
                                           })
                                           ->whereBetween('created_at', [$startDate, $endDate])
                                           ->count()
            ],
            'tier_distribution' => CustomerLoyaltyTier::where('is_current', true)
                                                    ->with('loyaltyTier:id,name,name_ar,level')
                                                    ->get()
                                                    ->groupBy('loyaltyTier.name')
                                                    ->map(function($group) {
                                                        return $group->count();
                                                    }),
            'redemption_types' => LoyaltyRedemption::whereBetween('created_at', [$startDate, $endDate])
                                                  ->groupBy('redemption_type')
                                                  ->selectRaw('redemption_type, COUNT(*) as count, SUM(value_redeemed) as total_value')
                                                  ->get(),
            'top_earners' => LoyaltyPoint::where('type', 'earned')
                                       ->whereBetween('created_at', [$startDate, $endDate])
                                       ->with('customer:id,name,email')
                                       ->groupBy('customer_id')
                                       ->selectRaw('customer_id, SUM(points) as total_earned')
                                       ->orderBy('total_earned', 'desc')
                                       ->limit(10)
                                       ->get(),
            'campaign_performance' => LoyaltyCampaign::where('is_active', true)
                                                    ->with(['loyaltyCampaignUsage' => function($q) use ($startDate, $endDate) {
                                                        $q->whereBetween('created_at', [$startDate, $endDate]);
                                                    }])
                                                    ->get()
                                                    ->map(function($campaign) {
                                                        return [
                                                            'id' => $campaign->id,
                                                            'name' => $campaign->name,
                                                            'usage_count' => $campaign->loyaltyCampaignUsage->count(),
                                                            'points_distributed' => $campaign->loyaltyCampaignUsage->sum('points_earned')
                                                        ];
                                                    })
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ],
            'message' => 'Loyalty analytics retrieved successfully'
        ]);
    }

    private function calculateCustomerTotalSpending($customerId): float
    {
        // Calculate from POS transactions
        $posSpending = DB::table('pos_transactions')
                       ->where('customer_id', $customerId)
                       ->where('status', 'completed')
                       ->sum('total_amount');

        // Calculate from boutique sales
        $boutiqueSpending = DB::table('boutique_sales')
                          ->where('customer_id', $customerId)
                          ->where('status', 'completed')
                          ->sum('total_amount');

        // Calculate from custom orders
        $customOrderSpending = DB::table('custom_orders')
                             ->where('customer_id', $customerId)
                             ->whereIn('status', ['completed', 'delivered'])
                             ->sum('final_price');

        return $posSpending + $boutiqueSpending + $customOrderSpending;
    }

    private function updateCustomerTier($customerId): void
    {
        $totalSpending = $this->calculateCustomerTotalSpending($customerId);
        
        $newTier = LoyaltyTier::where('min_spending_amount', '<=', $totalSpending)
                            ->where('is_active', true)
                            ->orderBy('min_spending_amount', 'desc')
                            ->first();

        if ($newTier) {
            $currentTier = CustomerLoyaltyTier::where('customer_id', $customerId)
                                            ->where('is_current', true)
                                            ->first();

            if (!$currentTier || $currentTier->loyalty_tier_id !== $newTier->id) {
                // Deactivate current tier
                if ($currentTier) {
                    $currentTier->update(['is_current' => false]);
                }

                // Assign new tier
                CustomerLoyaltyTier::create([
                    'customer_id' => $customerId,
                    'loyalty_tier_id' => $newTier->id,
                    'total_spending' => $totalSpending,
                    'current_year_spending' => $totalSpending, // Can be refined later
                    'tier_achieved_date' => now(),
                    'is_current' => true
                ]);
            }
        }
    }

    private function getCustomerTotalPoints($customerId): int
    {
        return LoyaltyPoint::where('customer_id', $customerId)
                         ->where('is_expired', false)
                         ->sum('points');
    }

    private function calculatePointsValue($points): float
    {
        // Default conversion rate: 1000 points = 1 KWD
        return $points * 0.001;
    }

    private function deductPointsFIFO($customerId, $pointsToDeduct, $redemptionId): void
    {
        $pointsRemaining = $pointsToDeduct;
        
        $availablePoints = LoyaltyPoint::where('customer_id', $customerId)
                                     ->where('type', 'earned')
                                     ->where('is_expired', false)
                                     ->where('points', '>', 0)
                                     ->orderBy('created_at')
                                     ->get();

        foreach ($availablePoints as $pointRecord) {
            if ($pointsRemaining <= 0) break;

            $deductFromThis = min($pointRecord->points, $pointsRemaining);
            
            // Create deduction record
            LoyaltyPoint::create([
                'customer_id' => $customerId,
                'points' => -$deductFromThis,
                'type' => 'redeemed',
                'description' => "Points redeemed - Redemption #{$redemptionId}",
                'source_type' => 'redemption',
                'source_id' => $redemptionId
            ]);

            $pointsRemaining -= $deductFromThis;
        }
    }

    private function generateCardData($customer, $cardType): array
    {
        $serialNumber = 'LC-' . $customer->id . '-' . time();
        
        $cardData = [
            'serial_number' => $serialNumber,
            'identifier' => uniqid($cardType . '_'),
            'data' => [
                'customer_name' => $customer->name,
                'customer_id' => $customer->id,
                'issue_date' => now()->format('Y-m-d'),
                'card_design' => [
                    'background_color' => '#1a365d',
                    'foreground_color' => '#ffffff',
                    'logo_url' => config('app.url') . '/images/logo.png'
                ]
            ]
        ];

        if ($cardType === 'apple_wallet') {
            $cardData['pass_type_identifier'] = 'pass.com.workshop.loyaltycard';
            $cardData['download_url'] = route('loyalty.apple-wallet-pass', ['serial' => $serialNumber]);
        }

        return $cardData;
    }

    private function updateDigitalCards($customerId): void
    {
        $digitalCards = DigitalLoyaltyCard::where('customer_id', $customerId)
                                        ->where('is_active', true)
                                        ->get();

        foreach ($digitalCards as $card) {
            // Create update notification for the card
            $updateData = [
                'points_balance' => $this->getCustomerTotalPoints($customerId),
                'last_activity' => now()->format('Y-m-d H:i:s')
            ];

            DB::table('digital_card_updates')->insert([
                'digital_loyalty_card_id' => $card->id,
                'update_type' => 'points_update',
                'update_data' => json_encode($updateData),
                'is_sent' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}