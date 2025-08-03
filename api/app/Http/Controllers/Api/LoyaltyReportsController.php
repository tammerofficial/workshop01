<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyCustomer;
use App\Models\LoyaltyTransaction;
use App\Models\WorkshopOrder;
use App\Models\Sale;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoyaltyReportsController extends Controller
{
    /**
     * تقرير شامل للمبيعات والولاء
     */
    public function salesLoyaltyReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));
            $clientId = $request->get('client_id');
            $tier = $request->get('tier');

            // إحصائيات عامة
            $summary = $this->getSalesLoyaltySummary($startDate, $endDate, $clientId, $tier);
            
            // أفضل العملاء
            $topCustomers = $this->getTopLoyaltyCustomers($startDate, $endDate, 10);
            
            // اتجاهات النقاط
            $pointsTrends = $this->getPointsTrends($startDate, $endDate);
            
            // تحليل المستويات
            $tierAnalysis = $this->getTierAnalysis($startDate, $endDate);
            
            // نشاط المبيعات والنقاط
            $salesActivity = $this->getSalesLoyaltyActivity($startDate, $endDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ],
                    'summary' => $summary,
                    'top_customers' => $topCustomers,
                    'points_trends' => $pointsTrends,
                    'tier_analysis' => $tierAnalysis,
                    'sales_activity' => $salesActivity
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في إنشاء التقرير',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تقرير أداء العملاء
     */
    public function customerPerformanceReport(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'month'); // month, quarter, year
            $tier = $request->get('tier');
            
            $customers = LoyaltyCustomer::with(['client', 'transactions'])
                ->when($tier, function($q) use ($tier) {
                    return $q->where('tier', $tier);
                })
                ->get()
                ->map(function($customer) use ($period) {
                    $startDate = $this->getPeriodStartDate($period);
                    
                    $recentTransactions = $customer->transactions()
                        ->where('created_at', '>=', $startDate)
                        ->get();
                    
                    $recentOrders = WorkshopOrder::where('client_id', $customer->client_id)
                        ->where('created_at', '>=', $startDate)
                        ->get();
                    
                    return [
                        'customer_info' => $customer->getCustomerInfo(),
                        'period_performance' => [
                            'points_earned' => $recentTransactions->where('type', 'earned')->sum('points'),
                            'points_redeemed' => abs($recentTransactions->where('type', 'redeemed')->sum('points')),
                            'orders_count' => $recentOrders->count(),
                            'total_spent' => $recentOrders->sum('selling_price'),
                            'avg_order_value' => $recentOrders->avg('selling_price'),
                        ],
                        'loyalty_score' => $this->calculateLoyaltyScore($customer, $recentTransactions, $recentOrders)
                    ];
                })
                ->sortByDesc('loyalty_score')
                ->take(50);

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'customers' => $customers->values()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تقرير أداء العملاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تقرير ROI لنظام الولاء
     */
    public function loyaltyROIReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->startOfYear()->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->format('Y-m-d'));

            // تكلفة النظام (النقاط المسترجعة)
            $pointsRedeemed = LoyaltyTransaction::where('type', 'redeemed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('points');
            
            $redemptionCost = abs($pointsRedeemed) / config('loyalty.redemption_rules.conversion_rate', 100);

            // الإيرادات من عملاء الولاء
            $loyaltyCustomerIds = LoyaltyCustomer::pluck('client_id');
            
            $loyaltyRevenue = WorkshopOrder::whereIn('client_id', $loyaltyCustomerIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('selling_price');

            // الإيرادات من العملاء العاديين
            $regularRevenue = WorkshopOrder::whereNotIn('client_id', $loyaltyCustomerIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('selling_price');

            // حساب ROI
            $totalRevenue = $loyaltyRevenue + $regularRevenue;
            $revenueIncrease = $loyaltyRevenue > 0 ? (($loyaltyRevenue - $regularRevenue) / max($regularRevenue, 1)) * 100 : 0;
            $roi = $redemptionCost > 0 ? (($loyaltyRevenue - $redemptionCost) / $redemptionCost) * 100 : 0;

            // إحصائيات تفصيلية
            $loyaltyCustomersCount = LoyaltyCustomer::count();
            $totalCustomersCount = Client::count();
            $loyaltyPenetration = $totalCustomersCount > 0 ? ($loyaltyCustomersCount / $totalCustomersCount) * 100 : 0;

            // متوسط القيمة لكل عميل
            $avgLoyaltyCustomerValue = $loyaltyCustomersCount > 0 ? $loyaltyRevenue / $loyaltyCustomersCount : 0;
            $avgRegularCustomerValue = ($totalCustomersCount - $loyaltyCustomersCount) > 0 
                ? $regularRevenue / ($totalCustomersCount - $loyaltyCustomersCount) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ],
                    'financial_metrics' => [
                        'loyalty_revenue' => round($loyaltyRevenue, 3),
                        'regular_revenue' => round($regularRevenue, 3),
                        'total_revenue' => round($totalRevenue, 3),
                        'redemption_cost' => round($redemptionCost, 3),
                        'net_benefit' => round($loyaltyRevenue - $redemptionCost, 3),
                        'roi_percentage' => round($roi, 2),
                        'revenue_increase_percentage' => round($revenueIncrease, 2)
                    ],
                    'customer_metrics' => [
                        'total_customers' => $totalCustomersCount,
                        'loyalty_customers' => $loyaltyCustomersCount,
                        'loyalty_penetration_percentage' => round($loyaltyPenetration, 2),
                        'avg_loyalty_customer_value' => round($avgLoyaltyCustomerValue, 3),
                        'avg_regular_customer_value' => round($avgRegularCustomerValue, 3),
                        'customer_value_lift' => $avgRegularCustomerValue > 0 
                            ? round((($avgLoyaltyCustomerValue - $avgRegularCustomerValue) / $avgRegularCustomerValue) * 100, 2) 
                            : 0
                    ],
                    'points_metrics' => [
                        'total_points_redeemed' => abs($pointsRedeemed),
                        'redemption_rate' => $loyaltyRevenue > 0 ? round(($redemptionCost / $loyaltyRevenue) * 100, 2) : 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تقرير ROI',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تقرير تفصيلي للمعاملات
     */
    public function transactionDetailsReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));
            $type = $request->get('type'); // earned, redeemed, expired, bonus
            $clientId = $request->get('client_id');

            $query = LoyaltyTransaction::with(['loyaltyCustomer', 'client', 'workshopOrder', 'sale'])
                ->whereBetween('created_at', [$startDate, $endDate]);

            if ($type) {
                $query->where('type', $type);
            }

            if ($clientId) {
                $query->where('client_id', $clientId);
            }

            $transactions = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 50));

            $summary = [
                'total_transactions' => $transactions->total(),
                'total_points' => $query->sum('points'),
                'types_breakdown' => DB::table('loyalty_transactions')
                    ->selectRaw('type, COUNT(*) as count, SUM(points) as total_points')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->when($clientId, function($q) use ($clientId) {
                        return $q->where('client_id', $clientId);
                    })
                    ->groupBy('type')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ],
                    'summary' => $summary,
                    'transactions' => $transactions->items(),
                    'pagination' => [
                        'current_page' => $transactions->currentPage(),
                        'last_page' => $transactions->lastPage(),
                        'per_page' => $transactions->perPage(),
                        'total' => $transactions->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تقرير المعاملات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تصدير التقارير
     */
    public function exportReport(Request $request): JsonResponse
    {
        try {
            $reportType = $request->get('report_type', 'sales_loyalty');
            $format = $request->get('format', 'excel'); // excel, csv, pdf

            switch ($reportType) {
                case 'sales_loyalty':
                    $data = $this->salesLoyaltyReport($request)->getData()->data;
                    break;
                case 'customer_performance':
                    $data = $this->customerPerformanceReport($request)->getData()->data;
                    break;
                case 'roi':
                    $data = $this->loyaltyROIReport($request)->getData()->data;
                    break;
                case 'transactions':
                    $data = $this->transactionDetailsReport($request)->getData()->data;
                    break;
                default:
                    throw new \Exception('نوع التقرير غير مدعوم');
            }

            // هنا يمكن إضافة منطق التصدير الفعلي
            // لكن سنعيد البيانات في الوقت الحالي
            return response()->json([
                'success' => true,
                'data' => $data,
                'download_url' => null, // يمكن إضافة رابط التحميل لاحقاً
                'message' => 'تم إنشاء التقرير بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تصدير التقرير',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper Methods

    protected function getSalesLoyaltySummary(string $startDate, string $endDate, ?int $clientId, ?string $tier): array
    {
        $query = LoyaltyCustomer::with('client');
        
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        
        if ($tier) {
            $query->where('tier', $tier);
        }

        $customers = $query->get();
        $customerIds = $customers->pluck('client_id');

        $orders = WorkshopOrder::whereIn('client_id', $customerIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $transactions = LoyaltyTransaction::whereIn('client_id', $customerIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        return [
            'customers_count' => $customers->count(),
            'orders_count' => $orders->count(),
            'total_revenue' => $orders->sum('selling_price'),
            'avg_order_value' => $orders->avg('selling_price'),
            'points_earned' => $transactions->where('type', 'earned')->sum('points'),
            'points_redeemed' => abs($transactions->where('type', 'redeemed')->sum('points')),
            'active_customers' => $customers->where('last_purchase_at', '>=', now()->subDays(30))->count()
        ];
    }

    protected function getTopLoyaltyCustomers(string $startDate, string $endDate, int $limit): array
    {
        return LoyaltyCustomer::with('client')
            ->select('loyalty_customers.*')
            ->join('clients', 'loyalty_customers.client_id', '=', 'clients.id')
            ->leftJoin('workshop_orders', function($join) use ($startDate, $endDate) {
                $join->on('clients.id', '=', 'workshop_orders.client_id')
                     ->whereBetween('workshop_orders.created_at', [$startDate, $endDate]);
            })
            ->selectRaw('SUM(workshop_orders.selling_price) as period_revenue')
            ->groupBy('loyalty_customers.id')
            ->orderByDesc('period_revenue')
            ->limit($limit)
            ->get()
            ->map(function($customer) {
                return array_merge(
                    $customer->getCustomerInfo(),
                    ['period_revenue' => $customer->period_revenue ?: 0]
                );
            })
            ->toArray();
    }

    protected function getPointsTrends(string $startDate, string $endDate): array
    {
        $trends = LoyaltyTransaction::selectRaw('
                DATE(created_at) as date,
                type,
                SUM(points) as total_points,
                COUNT(*) as transactions_count
            ')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get()
            ->groupBy('date');

        return $trends->map(function($dayTransactions) {
            $result = [
                'earned' => 0,
                'redeemed' => 0,
                'expired' => 0,
                'transactions_count' => 0
            ];
            
            foreach ($dayTransactions as $transaction) {
                $result[$transaction->type] = $transaction->total_points;
                $result['transactions_count'] += $transaction->transactions_count;
            }
            
            return $result;
        })->toArray();
    }

    protected function getTierAnalysis(string $startDate, string $endDate): array
    {
        return LoyaltyCustomer::selectRaw('
                tier,
                COUNT(*) as customers_count,
                AVG(total_points) as avg_points,
                AVG(total_spent) as avg_spent,
                SUM(total_spent) as total_revenue
            ')
            ->groupBy('tier')
            ->get()
            ->toArray();
    }

    protected function getSalesLoyaltyActivity(string $startDate, string $endDate): array
    {
        $dailyActivity = DB::table('workshop_orders')
            ->join('clients', 'workshop_orders.client_id', '=', 'clients.id')
            ->join('loyalty_customers', 'clients.id', '=', 'loyalty_customers.client_id')
            ->selectRaw('
                DATE(workshop_orders.created_at) as date,
                COUNT(workshop_orders.id) as orders_count,
                SUM(workshop_orders.selling_price) as revenue,
                COUNT(DISTINCT loyalty_customers.id) as active_customers
            ')
            ->whereBetween('workshop_orders.created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return $dailyActivity;
    }

    protected function getPeriodStartDate(string $period): Carbon
    {
        switch ($period) {
            case 'week':
                return now()->startOfWeek();
            case 'month':
                return now()->startOfMonth();
            case 'quarter':
                return now()->startOfQuarter();
            case 'year':
                return now()->startOfYear();
            default:
                return now()->startOfMonth();
        }
    }

    protected function calculateLoyaltyScore(LoyaltyCustomer $customer, $recentTransactions, $recentOrders): float
    {
        $pointsEarned = $recentTransactions->where('type', 'earned')->sum('points');
        $pointsRedeemed = abs($recentTransactions->where('type', 'redeemed')->sum('points'));
        $ordersCount = $recentOrders->count();
        $totalSpent = $recentOrders->sum('selling_price');
        
        // حساب نقاط الولاء (متوسط مرجح)
        $score = 0;
        $score += ($pointsEarned * 0.3); // 30% للنقاط المكتسبة
        $score += ($ordersCount * 100 * 0.25); // 25% لعدد الطلبات
        $score += ($totalSpent * 0.2); // 20% للمبلغ المنفق
        $score += (($pointsEarned - $pointsRedeemed) * 0.15); // 15% للنقاط المتبقية
        $score += ($customer->total_points * 0.1); // 10% للنقاط الإجمالية

        return round($score, 2);
    }
}