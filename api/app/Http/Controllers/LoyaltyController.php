<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class LoyaltyController extends Controller
{
    public function index()
    {
        try {
            $customers = [];
            
            if (Schema::hasTable('loyalty_customers')) {
                $customers = DB::table('loyalty_customers')
                    ->leftJoin('users', 'loyalty_customers.user_id', '=', 'users.id')
                    ->select(
                        'loyalty_customers.*',
                        'users.name as customer_name',
                        'users.email as customer_email'
                    )
                    ->orderBy('loyalty_customers.total_points', 'desc')
                    ->get()
                    ->map(function ($customer) {
                        $customer->customer = (object) [
                            'name' => $customer->customer_name,
                            'email' => $customer->customer_email
                        ];
                        $customer->tier = $this->calculateTier($customer->total_points);
                        return $customer;
                    });
            }
            
            // Add dummy data if empty
            if (empty($customers->toArray())) {
                $customers = collect([
                    (object) [
                        'id' => 1,
                        'customer_id' => 1,
                        'total_points' => 2450,
                        'available_points' => 1200,
                        'lifetime_earned' => 3650,
                        'tier' => 'Gold',
                        'joined_at' => now()->subMonths(8),
                        'customer' => (object) ['name' => 'Sarah Wilson', 'email' => 'sarah@example.com']
                    ],
                    (object) [
                        'id' => 2,
                        'customer_id' => 2,
                        'total_points' => 1850,
                        'available_points' => 950,
                        'lifetime_earned' => 2100,
                        'tier' => 'Silver',
                        'joined_at' => now()->subMonths(5),
                        'customer' => (object) ['name' => 'John Smith', 'email' => 'john@example.com']
                    ],
                    (object) [
                        'id' => 3,
                        'customer_id' => 3,
                        'total_points' => 750,
                        'available_points' => 750,
                        'lifetime_earned' => 950,
                        'tier' => 'Bronze',
                        'joined_at' => now()->subMonths(2),
                        'customer' => (object) ['name' => 'Maria Garcia', 'email' => 'maria@example.com']
                    ]
                ]);
            }
            
            $stats = $this->getLoyaltyStats();
            
            return view('modules.loyalty.index', compact('customers', 'stats'));
            
        } catch (\Exception $e) {
            return view('modules.loyalty.index', [
                'customers' => collect(),
                'stats' => []
            ]);
        }
    }

    public function show($id)
    {
        try {
            $customer = $this->getCustomerDetails($id);
            $transactions = $this->getPointTransactions($id);
            $rewards = $this->getAvailableRewards($customer->tier ?? 'Bronze');
            
            return view('modules.loyalty.show', compact('customer', 'transactions', 'rewards'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.loyalty.index')
                ->with('error', __('Customer not found'));
        }
    }

    public function rewards()
    {
        try {
            $rewards = $this->getAllRewards();
            $categories = $this->getRewardCategories();
            
            return view('modules.loyalty.rewards', compact('rewards', 'categories'));
            
        } catch (\Exception $e) {
            return view('modules.loyalty.rewards', [
                'rewards' => collect(),
                'categories' => collect()
            ]);
        }
    }

    public function transactions()
    {
        try {
            $transactions = $this->getAllTransactions();
            
            return view('modules.loyalty.transactions', compact('transactions'));
            
        } catch (\Exception $e) {
            return view('modules.loyalty.transactions', ['transactions' => collect()]);
        }
    }

    public function addPoints(Request $request, $id)
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'reason' => 'required|string|max:255'
        ]);

        try {
            if (Schema::hasTable('loyalty_transactions')) {
                DB::table('loyalty_transactions')->insert([
                    'customer_id' => $id,
                    'points' => $request->points,
                    'type' => 'earned',
                    'reason' => $request->reason,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Update customer total points
                if (Schema::hasTable('loyalty_customers')) {
                    DB::table('loyalty_customers')
                        ->where('id', $id)
                        ->increment('total_points', $request->points);
                        
                    DB::table('loyalty_customers')
                        ->where('id', $id)
                        ->increment('available_points', $request->points);
                }
            }

            return redirect()->route('ui.loyalty.show', $id)
                ->with('success', __('Points added successfully'));

        } catch (\Exception $e) {
            return back()->with('error', __('Failed to add points'));
        }
    }

    public function redeemPoints(Request $request, $id)
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'reward_id' => 'required|integer'
        ]);

        try {
            if (Schema::hasTable('loyalty_transactions')) {
                DB::table('loyalty_transactions')->insert([
                    'customer_id' => $id,
                    'points' => -$request->points,
                    'type' => 'redeemed',
                    'reason' => 'Reward redemption',
                    'reward_id' => $request->reward_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Update customer available points
                if (Schema::hasTable('loyalty_customers')) {
                    DB::table('loyalty_customers')
                        ->where('id', $id)
                        ->decrement('available_points', $request->points);
                }
            }

            return redirect()->route('ui.loyalty.show', $id)
                ->with('success', __('Points redeemed successfully'));

        } catch (\Exception $e) {
            return back()->with('error', __('Failed to redeem points'));
        }
    }

    private function calculateTier($points)
    {
        if ($points >= 2000) return 'Gold';
        if ($points >= 1000) return 'Silver';
        return 'Bronze';
    }

    private function getLoyaltyStats()
    {
        return [
            'total_customers' => 156,
            'active_customers' => 89,
            'total_points_issued' => 45280,
            'total_points_redeemed' => 12450,
            'average_points_per_customer' => 290,
            'tier_distribution' => [
                'Gold' => 12,
                'Silver' => 34,
                'Bronze' => 110
            ]
        ];
    }

    private function getCustomerDetails($id)
    {
        return (object) [
            'id' => $id,
            'customer_id' => 1,
            'total_points' => 2450,
            'available_points' => 1200,
            'lifetime_earned' => 3650,
            'lifetime_redeemed' => 2450,
            'tier' => 'Gold',
            'next_tier_points' => 550,
            'joined_at' => now()->subMonths(8),
            'last_activity' => now()->subDays(3),
            'customer' => (object) [
                'name' => 'Sarah Wilson',
                'email' => 'sarah@example.com',
                'phone' => '+1 (555) 123-4567'
            ]
        ];
    }

    private function getPointTransactions($customerId)
    {
        return [
            [
                'id' => 1,
                'points' => 150,
                'type' => 'earned',
                'reason' => 'Order completion bonus',
                'created_at' => now()->subDays(2)
            ],
            [
                'id' => 2,
                'points' => -500,
                'type' => 'redeemed',
                'reason' => '10% discount voucher',
                'created_at' => now()->subDays(5)
            ],
            [
                'id' => 3,
                'points' => 200,
                'type' => 'earned',
                'reason' => 'Referral bonus',
                'created_at' => now()->subDays(8)
            ],
            [
                'id' => 4,
                'points' => 100,
                'type' => 'earned',
                'reason' => 'Birthday bonus',
                'created_at' => now()->subDays(15)
            ]
        ];
    }

    private function getAvailableRewards($tier)
    {
        $allRewards = [
            [
                'id' => 1,
                'name' => '5% Discount Voucher',
                'points_required' => 200,
                'tier_required' => 'Bronze',
                'category' => 'Discounts',
                'description' => 'Get 5% off your next order'
            ],
            [
                'id' => 2,
                'name' => '10% Discount Voucher',
                'points_required' => 500,
                'tier_required' => 'Silver',
                'category' => 'Discounts',
                'description' => 'Get 10% off your next order'
            ],
            [
                'id' => 3,
                'name' => 'Free Alterations',
                'points_required' => 800,
                'tier_required' => 'Silver',
                'category' => 'Services',
                'description' => 'Free alterations on your next purchase'
            ],
            [
                'id' => 4,
                'name' => '20% Discount Voucher',
                'points_required' => 1000,
                'tier_required' => 'Gold',
                'category' => 'Discounts',
                'description' => 'Get 20% off your next order'
            ],
            [
                'id' => 5,
                'name' => 'Priority Service',
                'points_required' => 1500,
                'tier_required' => 'Gold',
                'category' => 'Services',
                'description' => 'Skip the queue with priority service'
            ]
        ];

        $tierLevels = ['Bronze' => 1, 'Silver' => 2, 'Gold' => 3];
        $customerTierLevel = $tierLevels[$tier] ?? 1;

        return array_filter($allRewards, function($reward) use ($tierLevels, $customerTierLevel) {
            $rewardTierLevel = $tierLevels[$reward['tier_required']] ?? 1;
            return $rewardTierLevel <= $customerTierLevel;
        });
    }

    private function getAllRewards()
    {
        return collect([
            [
                'id' => 1,
                'name' => '5% Discount Voucher',
                'points_required' => 200,
                'tier_required' => 'Bronze',
                'category' => 'Discounts',
                'redemptions_count' => 45,
                'is_active' => true
            ],
            [
                'id' => 2,
                'name' => '10% Discount Voucher',
                'points_required' => 500,
                'tier_required' => 'Silver',
                'category' => 'Discounts',
                'redemptions_count' => 28,
                'is_active' => true
            ],
            [
                'id' => 3,
                'name' => 'Free Alterations',
                'points_required' => 800,
                'tier_required' => 'Silver',
                'category' => 'Services',
                'redemptions_count' => 15,
                'is_active' => true
            ],
            [
                'id' => 4,
                'name' => '20% Discount Voucher',
                'points_required' => 1000,
                'tier_required' => 'Gold',
                'category' => 'Discounts',
                'redemptions_count' => 12,
                'is_active' => true
            ]
        ]);
    }

    private function getRewardCategories()
    {
        return collect([
            (object) ['id' => 1, 'name' => 'Discounts'],
            (object) ['id' => 2, 'name' => 'Services'],
            (object) ['id' => 3, 'name' => 'Products'],
            (object) ['id' => 4, 'name' => 'Experiences']
        ]);
    }

    private function getAllTransactions()
    {
        return collect([
            [
                'id' => 1,
                'customer_name' => 'Sarah Wilson',
                'points' => 150,
                'type' => 'earned',
                'reason' => 'Order completion bonus',
                'created_at' => now()->subDays(2)
            ],
            [
                'id' => 2,
                'customer_name' => 'John Smith',
                'points' => -500,
                'type' => 'redeemed',
                'reason' => '10% discount voucher',
                'created_at' => now()->subDays(3)
            ],
            [
                'id' => 3,
                'customer_name' => 'Maria Garcia',
                'points' => 200,
                'type' => 'earned',
                'reason' => 'Referral bonus',
                'created_at' => now()->subDays(5)
            ],
            [
                'id' => 4,
                'customer_name' => 'Sarah Wilson',
                'points' => -800,
                'type' => 'redeemed',
                'reason' => 'Free alterations',
                'created_at' => now()->subDays(8)
            ]
        ]);
    }
}
