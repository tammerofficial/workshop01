<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ClientLoyaltyController extends Controller
{
    /**
     * Get client loyalty dashboard
     */
    public function getLoyaltyDashboard(): JsonResponse
    {
        $clients = Client::with(['orders' => function($query) {
            $query->where('status', 'completed');
        }])->get();

        $loyaltyData = $clients->map(function($client) {
            return $this->calculateClientLoyalty($client);
        })->sortByDesc('loyalty_score');

        return response()->json([
            'top_clients' => $loyaltyData->take(10),
            'loyalty_stats' => $this->getLoyaltyStats($loyaltyData),
            'tier_distribution' => $this->getTierDistribution($loyaltyData)
        ]);
    }

    /**
     * Get individual client loyalty details
     */
    public function getClientLoyalty(Client $client): JsonResponse
    {
        $loyaltyData = $this->calculateClientLoyalty($client);
        $orderHistory = $this->getClientOrderHistory($client);
        $recommendations = $this->generateClientRecommendations($client);

        return response()->json([
            'client' => $client,
            'loyalty_data' => $loyaltyData,
            'order_history' => $orderHistory,
            'recommendations' => $recommendations,
            'available_rewards' => $this->getAvailableRewards($loyaltyData['points'])
        ]);
    }

    /**
     * Award loyalty points
     */
    public function awardPoints(Request $request, Client $client): JsonResponse
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'order_id' => 'nullable|exists:orders,id'
        ]);

        $currentPoints = $client->loyalty_points ?? 0;
        $newPoints = $currentPoints + $request->points;

        $client->update([
            'loyalty_points' => $newPoints,
            'last_purchase_date' => now()
        ]);

        // Log the point transaction
        DB::table('loyalty_transactions')->insert([
            'client_id' => $client->id,
            'order_id' => $request->order_id,
            'points' => $request->points,
            'type' => 'earned',
            'reason' => $request->reason,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Points awarded successfully',
            'previous_points' => $currentPoints,
            'awarded_points' => $request->points,
            'new_total' => $newPoints,
            'new_tier' => $this->calculateTier($newPoints)
        ]);
    }

    /**
     * Redeem loyalty points
     */
    public function redeemPoints(Request $request, Client $client): JsonResponse
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'reward_type' => 'required|string',
            'description' => 'required|string'
        ]);

        $currentPoints = $client->loyalty_points ?? 0;

        if ($currentPoints < $request->points) {
            return response()->json([
                'error' => 'Insufficient points',
                'current_points' => $currentPoints,
                'required_points' => $request->points
            ], 422);
        }

        $newPoints = $currentPoints - $request->points;

        $client->update([
            'loyalty_points' => $newPoints
        ]);

        // Log the redemption
        DB::table('loyalty_transactions')->insert([
            'client_id' => $client->id,
            'points' => -$request->points,
            'type' => 'redeemed',
            'reason' => $request->description,
            'reward_type' => $request->reward_type,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Points redeemed successfully',
            'redeemed_points' => $request->points,
            'remaining_points' => $newPoints,
            'reward' => $request->reward_type
        ]);
    }

    /**
     * Get loyalty program statistics
     */
    public function getLoyaltyStats(): JsonResponse
    {
        $stats = [
            'total_clients' => Client::count(),
            'active_clients' => Client::whereNotNull('loyalty_points')->count(),
            'total_points_distributed' => Client::sum('loyalty_points'),
            'average_points_per_client' => Client::avg('loyalty_points'),
            'tier_distribution' => $this->getTierDistribution(),
            'monthly_activity' => $this->getMonthlyLoyaltyActivity(),
            'top_earners' => $this->getTopPointEarners(),
            'redemption_trends' => $this->getRedemptionTrends()
        ];

        return response()->json($stats);
    }

    /**
     * Calculate client loyalty metrics
     */
    private function calculateClientLoyalty(Client $client): array
    {
        $orders = $client->orders()->where('status', 'completed')->get();
        $totalSpent = $orders->sum('total_amount');
        $orderCount = $orders->count();
        $avgOrderValue = $orderCount > 0 ? $totalSpent / $orderCount : 0;
        
        // Calculate recency (days since last order)
        $lastOrderDate = $orders->max('created_at');
        $daysSinceLastOrder = $lastOrderDate ? 
            now()->diffInDays($lastOrderDate) : 999;

        // Calculate frequency (orders per month)
        $firstOrderDate = $orders->min('created_at');
        $monthsSinceFirst = $firstOrderDate ? 
            max(1, now()->diffInMonths($firstOrderDate)) : 1;
        $frequency = $orderCount / $monthsSinceFirst;

        // Calculate loyalty score (0-100)
        $recencyScore = max(0, 100 - ($daysSinceLastOrder * 2));
        $frequencyScore = min(100, $frequency * 20);
        $monetaryScore = min(100, $totalSpent / 100);
        
        $loyaltyScore = ($recencyScore * 0.3) + ($frequencyScore * 0.3) + ($monetaryScore * 0.4);

        // Calculate loyalty points (if not set)
        $loyaltyPoints = $client->loyalty_points ?? floor($totalSpent / 10);
        
        return [
            'client_id' => $client->id,
            'client_name' => $client->name,
            'total_spent' => $totalSpent,
            'order_count' => $orderCount,
            'avg_order_value' => round($avgOrderValue, 2),
            'last_order_date' => $lastOrderDate,
            'days_since_last_order' => $daysSinceLastOrder,
            'frequency_per_month' => round($frequency, 2),
            'loyalty_score' => round($loyaltyScore, 2),
            'points' => $loyaltyPoints,
            'tier' => $this->calculateTier($loyaltyPoints),
            'next_tier_points' => $this->getNextTierPoints($loyaltyPoints),
            'recency_score' => round($recencyScore, 1),
            'frequency_score' => round($frequencyScore, 1),
            'monetary_score' => round($monetaryScore, 1)
        ];
    }

    /**
     * Calculate client tier based on points
     */
    private function calculateTier(int $points): array
    {
        if ($points >= 5000) {
            return ['name' => 'Platinum', 'name_ar' => 'بلاتينيوم', 'color' => 'platinum', 'benefits' => ['20% discount', 'Priority support', 'Free shipping']];
        } elseif ($points >= 2000) {
            return ['name' => 'Gold', 'name_ar' => 'ذهبي', 'color' => 'gold', 'benefits' => ['15% discount', 'Priority queue', 'Free alterations']];
        } elseif ($points >= 500) {
            return ['name' => 'Silver', 'name_ar' => 'فضي', 'color' => 'silver', 'benefits' => ['10% discount', 'Member events']];
        } else {
            return ['name' => 'Bronze', 'name_ar' => 'برونزي', 'color' => 'bronze', 'benefits' => ['5% discount', 'Birthday bonus']];
        }
    }

    /**
     * Get points needed for next tier
     */
    private function getNextTierPoints(int $currentPoints): ?int
    {
        if ($currentPoints < 500) return 500 - $currentPoints;
        if ($currentPoints < 2000) return 2000 - $currentPoints;
        if ($currentPoints < 5000) return 5000 - $currentPoints;
        return null; // Already at highest tier
    }

    /**
     * Get client order history with loyalty context
     */
    private function getClientOrderHistory(Client $client): array
    {
        return $client->orders()
            ->with(['worker', 'category'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function($order) {
                $pointsEarned = floor($order->total_amount / 10);
                return [
                    'id' => $order->id,
                    'title' => $order->title,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'points_earned' => $pointsEarned,
                    'worker' => $order->worker?->name,
                    'category' => $order->category?->name
                ];
            })
            ->toArray();
    }

    /**
     * Generate personalized recommendations
     */
    private function generateClientRecommendations(Client $client): array
    {
        $orders = $client->orders()->where('status', 'completed')->get();
        $recommendations = [];

        // Analyze purchase patterns
        $categories = $orders->pluck('category.name')->filter()->unique();
        $avgOrderValue = $orders->avg('total_amount');
        $lastOrderDate = $orders->max('created_at');

        // Recommendation based on category preferences
        if ($categories->isNotEmpty()) {
            $favoriteCategory = $categories->first();
            $recommendations[] = [
                'type' => 'category_recommendation',
                'title' => "New {$favoriteCategory} Collection",
                'title_ar' => "مجموعة {$favoriteCategory} الجديدة",
                'description' => "Check out our latest {$favoriteCategory} designs",
                'priority' => 'high'
            ];
        }

        // Recommendation based on spending
        if ($avgOrderValue > 500) {
            $recommendations[] = [
                'type' => 'premium_offer',
                'title' => 'Premium Service Upgrade',
                'title_ar' => 'ترقية الخدمة المميزة',
                'description' => 'Enjoy priority handling and premium materials',
                'priority' => 'medium'
            ];
        }

        // Re-engagement if inactive
        if ($lastOrderDate && now()->diffInDays($lastOrderDate) > 90) {
            $recommendations[] = [
                'type' => 'reengagement',
                'title' => 'Welcome Back Offer',
                'title_ar' => 'عرض الترحيب بالعودة',
                'description' => 'We miss you! Here\'s a special discount to welcome you back',
                'priority' => 'high'
            ];
        }

        // Loyalty tier upgrade suggestion
        $currentPoints = $client->loyalty_points ?? 0;
        $nextTierPoints = $this->getNextTierPoints($currentPoints);
        if ($nextTierPoints && $nextTierPoints <= 100) {
            $recommendations[] = [
                'type' => 'tier_upgrade',
                'title' => 'Tier Upgrade Opportunity',
                'title_ar' => 'فرصة ترقية المستوى',
                'description' => "Only {$nextTierPoints} points away from the next tier!",
                'priority' => 'medium'
            ];
        }

        return $recommendations;
    }

    /**
     * Get available rewards for current points
     */
    private function getAvailableRewards(int $points): array
    {
        $rewards = [
            ['name' => '5% Discount', 'name_ar' => 'خصم 5%', 'points' => 100, 'type' => 'discount'],
            ['name' => '10% Discount', 'name_ar' => 'خصم 10%', 'points' => 200, 'type' => 'discount'],
            ['name' => 'Free Alteration', 'name_ar' => 'تعديل مجاني', 'points' => 300, 'type' => 'service'],
            ['name' => '15% Discount', 'name_ar' => 'خصم 15%', 'points' => 500, 'type' => 'discount'],
            ['name' => 'Premium Material Upgrade', 'name_ar' => 'ترقية مواد مميزة', 'points' => 750, 'type' => 'upgrade'],
            ['name' => '20% Discount', 'name_ar' => 'خصم 20%', 'points' => 1000, 'type' => 'discount'],
            ['name' => 'Free Custom Design', 'name_ar' => 'تصميم مخصص مجاني', 'points' => 1500, 'type' => 'service'],
            ['name' => 'VIP Experience Package', 'name_ar' => 'باقة تجربة VIP', 'points' => 2000, 'type' => 'experience']
        ];

        return array_filter($rewards, function($reward) use ($points) {
            return $reward['points'] <= $points;
        });
    }

    /**
     * Get tier distribution statistics
     */
    private function getTierDistribution($loyaltyData = null): array
    {
        if (!$loyaltyData) {
            $clients = Client::whereNotNull('loyalty_points')->get();
            $loyaltyData = $clients->map(function($client) {
                return $this->calculateClientLoyalty($client);
            });
        }

        $tiers = $loyaltyData->groupBy('tier.name');

        return [
            'Bronze' => $tiers->get('Bronze', collect())->count(),
            'Silver' => $tiers->get('Silver', collect())->count(),
            'Gold' => $tiers->get('Gold', collect())->count(),
            'Platinum' => $tiers->get('Platinum', collect())->count()
        ];
    }

    /**
     * Get monthly loyalty activity
     */
    private function getMonthlyLoyaltyActivity(): array
    {
        $months = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();
            
            $pointsEarned = DB::table('loyalty_transactions')
                ->where('type', 'earned')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('points');
                
            $pointsRedeemed = DB::table('loyalty_transactions')
                ->where('type', 'redeemed')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('points');

            $months[] = [
                'month' => $month->format('Y-m'),
                'points_earned' => abs($pointsEarned),
                'points_redeemed' => abs($pointsRedeemed),
                'net_points' => $pointsEarned + $pointsRedeemed, // redeemed are negative
                'active_clients' => Client::whereHas('orders', function($query) use ($startOfMonth, $endOfMonth) {
                    $query->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
                })->count()
            ];
        }

        return $months;
    }

    /**
     * Get top point earners
     */
    private function getTopPointEarners(): array
    {
        return Client::orderBy('loyalty_points', 'desc')
            ->take(10)
            ->get(['id', 'name', 'email', 'loyalty_points'])
            ->map(function($client) {
                $tier = $this->calculateTier($client->loyalty_points ?? 0);
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'points' => $client->loyalty_points ?? 0,
                    'tier' => $tier['name']
                ];
            })
            ->toArray();
    }

    /**
     * Get redemption trends
     */
    private function getRedemptionTrends(): array
    {
        return DB::table('loyalty_transactions')
            ->select('reward_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(ABS(points)) as total_points'))
            ->where('type', 'redeemed')
            ->whereNotNull('reward_type')
            ->groupBy('reward_type')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();
    }
}