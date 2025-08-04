<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\CustomOrder;
use App\Models\BoutiqueSale;
use App\Models\PosTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function getSalesOverview(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:today,week,month,quarter,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        [$startDate, $endDate] = $this->getDateRange($request);

        $posTransactions = PosTransaction::whereBetween('created_at', [$startDate, $endDate])
                                       ->where('status', 'completed');
        
        $boutiqueOrders = BoutiqueSale::whereBetween('created_at', [$startDate, $endDate])
                                    ->where('status', 'completed');
        
        $customOrders = CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                                  ->whereIn('status', ['completed', 'delivered']);

        $stats = [
            'total_revenue' => $posTransactions->sum('total_amount') + 
                              $boutiqueOrders->sum('total_amount') + 
                              $customOrders->sum('final_price'),
            'pos_revenue' => $posTransactions->sum('total_amount'),
            'boutique_revenue' => $boutiqueOrders->sum('total_amount'),
            'custom_orders_revenue' => $customOrders->sum('final_price'),
            'pos_transactions_count' => $posTransactions->count(),
            'boutique_orders_count' => $boutiqueOrders->count(),
            'custom_orders_count' => $customOrders->count(),
            'total_transactions' => $posTransactions->count() + $boutiqueOrders->count() + $customOrders->count(),
            'average_order_value' => 0
        ];

        if ($stats['total_transactions'] > 0) {
            $stats['average_order_value'] = $stats['total_revenue'] / $stats['total_transactions'];
        }

        // Daily breakdown for charts
        $dailyStats = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            $dayStart = $currentDate->copy()->startOfDay();
            $dayEnd = $currentDate->copy()->endOfDay();
            
            $dayPosRevenue = PosTransaction::whereBetween('created_at', [$dayStart, $dayEnd])
                                         ->where('status', 'completed')
                                         ->sum('total_amount');
            
            $dayBoutiqueRevenue = BoutiqueSale::whereBetween('created_at', [$dayStart, $dayEnd])
                                            ->where('status', 'completed')
                                            ->sum('total_amount');
            
            $dayCustomRevenue = CustomOrder::whereBetween('created_at', [$dayStart, $dayEnd])
                                         ->whereIn('status', ['completed', 'delivered'])
                                         ->sum('final_price');
            
            $dailyStats[] = [
                'date' => $currentDate->format('Y-m-d'),
                'pos_revenue' => $dayPosRevenue,
                'boutique_revenue' => $dayBoutiqueRevenue,
                'custom_revenue' => $dayCustomRevenue,
                'total_revenue' => $dayPosRevenue + $dayBoutiqueRevenue + $dayCustomRevenue
            ];
            
            $currentDate->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $stats,
                'daily_breakdown' => $dailyStats,
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d')
                ]
            ],
            'message' => 'Sales overview retrieved successfully'
        ]);
    }

    public function getProductAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:today,week,month,quarter,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        [$startDate, $endDate] = $this->getDateRange($request);
        $limit = $request->get('limit', 10);

        // Top selling products (by quantity)
        $topSellingByQuantity = DB::table('pos_transaction_items')
            ->join('pos_transactions', 'pos_transaction_items.pos_transaction_id', '=', 'pos_transactions.id')
            ->join('products', 'pos_transaction_items.product_id', '=', 'products.id')
            ->whereBetween('pos_transactions.created_at', [$startDate, $endDate])
            ->where('pos_transactions.status', 'completed')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                DB::raw('SUM(pos_transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(pos_transaction_items.quantity * pos_transaction_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('total_quantity', 'desc')
            ->limit($limit)
            ->get();

        // Top selling products (by revenue)
        $topSellingByRevenue = DB::table('pos_transaction_items')
            ->join('pos_transactions', 'pos_transaction_items.pos_transaction_id', '=', 'pos_transactions.id')
            ->join('products', 'pos_transaction_items.product_id', '=', 'products.id')
            ->whereBetween('pos_transactions.created_at', [$startDate, $endDate])
            ->where('pos_transactions.status', 'completed')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                DB::raw('SUM(pos_transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(pos_transaction_items.quantity * pos_transaction_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();

        // Products by category performance
        $categoryPerformance = DB::table('pos_transaction_items')
            ->join('pos_transactions', 'pos_transaction_items.pos_transaction_id', '=', 'pos_transactions.id')
            ->join('products', 'pos_transaction_items.product_id', '=', 'products.id')
            ->whereBetween('pos_transactions.created_at', [$startDate, $endDate])
            ->where('pos_transactions.status', 'completed')
            ->select(
                'products.category',
                DB::raw('SUM(pos_transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(pos_transaction_items.quantity * pos_transaction_items.price) as total_revenue'),
                DB::raw('COUNT(DISTINCT pos_transaction_items.product_id) as product_count')
            )
            ->groupBy('products.category')
            ->orderBy('total_revenue', 'desc')
            ->get();

        // Low stock products
        $lowStockProducts = Product::where('track_stock', true)
                                 ->whereColumn('stock_quantity', '<=', 'min_stock_level')
                                 ->select('id', 'name', 'sku', 'stock_quantity', 'min_stock_level', 'category')
                                 ->orderBy('stock_quantity', 'asc')
                                 ->limit($limit)
                                 ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_selling_by_quantity' => $topSellingByQuantity,
                'top_selling_by_revenue' => $topSellingByRevenue,
                'category_performance' => $categoryPerformance,
                'low_stock_products' => $lowStockProducts,
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d')
                ]
            ],
            'message' => 'Product analytics retrieved successfully'
        ]);
    }

    public function getCustomerAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:today,week,month,quarter,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        [$startDate, $endDate] = $this->getDateRange($request);
        $limit = $request->get('limit', 10);

        // Top customers by revenue
        $topCustomersByRevenue = DB::table('users')
            ->leftJoin('pos_transactions', function($join) use ($startDate, $endDate) {
                $join->on('users.id', '=', 'pos_transactions.customer_id')
                     ->whereBetween('pos_transactions.created_at', [$startDate, $endDate])
                     ->where('pos_transactions.status', 'completed');
            })
            ->leftJoin('boutique_sales', function($join) use ($startDate, $endDate) {
                $join->on('users.id', '=', 'boutique_sales.customer_id')
                     ->whereBetween('boutique_sales.created_at', [$startDate, $endDate])
                     ->where('boutique_sales.status', 'completed');
            })
            ->leftJoin('custom_orders', function($join) use ($startDate, $endDate) {
                $join->on('users.id', '=', 'custom_orders.customer_id')
                     ->whereBetween('custom_orders.created_at', [$startDate, $endDate])
                     ->whereIn('custom_orders.status', ['completed', 'delivered']);
            })
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COALESCE(SUM(pos_transactions.total_amount), 0) + COALESCE(SUM(boutique_sales.total_amount), 0) + COALESCE(SUM(custom_orders.final_price), 0) as total_spent'),
                DB::raw('COUNT(DISTINCT pos_transactions.id) + COUNT(DISTINCT boutique_sales.id) + COUNT(DISTINCT custom_orders.id) as total_orders')
            )
            ->whereHas('roles', function($query) {
                $query->where('name', 'LIKE', '%customer%');
            })
            ->groupBy('users.id', 'users.name', 'users.email')
            ->having('total_spent', '>', 0)
            ->orderBy('total_spent', 'desc')
            ->limit($limit)
            ->get();

        // New customers this period
        $newCustomers = User::whereHas('roles', function($query) {
                             $query->where('name', 'LIKE', '%customer%');
                         })
                         ->whereBetween('created_at', [$startDate, $endDate])
                         ->count();

        // Customer retention (customers who made repeat purchases)
        $repeatCustomers = DB::table('users')
            ->join('pos_transactions', 'users.id', '=', 'pos_transactions.customer_id')
            ->whereBetween('pos_transactions.created_at', [$startDate, $endDate])
            ->where('pos_transactions.status', 'completed')
            ->select('users.id')
            ->groupBy('users.id')
            ->havingRaw('COUNT(pos_transactions.id) > 1')
            ->count();

        // Customer lifetime value segments
        $customerSegments = DB::table('users')
            ->leftJoin('pos_transactions', 'users.id', '=', 'pos_transactions.customer_id')
            ->leftJoin('boutique_sales', 'users.id', '=', 'boutique_sales.customer_id')
            ->leftJoin('custom_orders', 'users.id', '=', 'custom_orders.customer_id')
            ->whereHas('roles', function($query) {
                $query->where('name', 'LIKE', '%customer%');
            })
            ->select(
                DB::raw('CASE 
                    WHEN COALESCE(SUM(pos_transactions.total_amount), 0) + COALESCE(SUM(boutique_sales.total_amount), 0) + COALESCE(SUM(custom_orders.final_price), 0) >= 500 THEN "VIP"
                    WHEN COALESCE(SUM(pos_transactions.total_amount), 0) + COALESCE(SUM(boutique_sales.total_amount), 0) + COALESCE(SUM(custom_orders.final_price), 0) >= 200 THEN "Gold"
                    WHEN COALESCE(SUM(pos_transactions.total_amount), 0) + COALESCE(SUM(boutique_sales.total_amount), 0) + COALESCE(SUM(custom_orders.final_price), 0) >= 50 THEN "Silver"
                    ELSE "Bronze"
                END as segment'),
                DB::raw('COUNT(DISTINCT users.id) as customer_count')
            )
            ->groupBy('segment')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_customers_by_revenue' => $topCustomersByRevenue,
                'new_customers' => $newCustomers,
                'repeat_customers' => $repeatCustomers,
                'customer_segments' => $customerSegments,
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d')
                ]
            ],
            'message' => 'Customer analytics retrieved successfully'
        ]);
    }

    public function getInventoryAnalytics(Request $request): JsonResponse
    {
        // Current stock levels
        $stockStats = [
            'total_products' => Product::active()->count(),
            'low_stock_count' => Product::active()->lowStock()->count(),
            'out_of_stock_count' => Product::active()->where('stock_quantity', '<=', 0)->count(),
            'total_stock_value' => Product::active()->sum(DB::raw('stock_quantity * cost_price'))
        ];

        // Stock movement trends (last 30 days)
        $stockMovements = DB::table('inventory_movements')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in'),
                DB::raw('SUM(CASE WHEN type = "out" THEN ABS(quantity) ELSE 0 END) as stock_out')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top moving products (by stock turnover)
        $topMovingProducts = DB::table('inventory_movements')
            ->join('products', 'inventory_movements.product_id', '=', 'products.id')
            ->where('inventory_movements.created_at', '>=', now()->subDays(30))
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.stock_quantity',
                DB::raw('SUM(ABS(inventory_movements.quantity)) as total_movement')
            )
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.stock_quantity')
            ->orderBy('total_movement', 'desc')
            ->limit(10)
            ->get();

        // Dead stock (products with no movement in last 90 days)
        $deadStock = Product::whereNotExists(function($query) {
                          $query->select(DB::raw(1))
                                ->from('inventory_movements')
                                ->whereColumn('inventory_movements.product_id', 'products.id')
                                ->where('inventory_movements.created_at', '>=', now()->subDays(90));
                      })
                      ->where('stock_quantity', '>', 0)
                      ->select('id', 'name', 'sku', 'stock_quantity', 'cost_price')
                      ->orderBy('stock_quantity', 'desc')
                      ->limit(10)
                      ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stock_stats' => $stockStats,
                'stock_movements' => $stockMovements,
                'top_moving_products' => $topMovingProducts,
                'dead_stock' => $deadStock
            ],
            'message' => 'Inventory analytics retrieved successfully'
        ]);
    }

    public function getWorkshopAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:today,week,month,quarter,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        [$startDate, $endDate] = $this->getDateRange($request);

        // Custom orders statistics
        $customOrderStats = [
            'total_orders' => CustomOrder::whereBetween('created_at', [$startDate, $endDate])->count(),
            'completed_orders' => CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                                           ->whereIn('status', ['completed', 'delivered'])
                                           ->count(),
            'in_production' => CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                                        ->where('status', 'in_production')
                                        ->count(),
            'overdue_orders' => CustomOrder::where('promised_delivery_date', '<', now())
                                         ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
                                         ->count(),
            'total_revenue' => CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                                        ->whereIn('status', ['completed', 'delivered'])
                                        ->sum('final_price')
        ];

        // Worker productivity
        $workerProductivity = DB::table('custom_orders')
            ->join('users', 'custom_orders.assigned_to', '=', 'users.id')
            ->whereBetween('custom_orders.created_at', [$startDate, $endDate])
            ->whereNotNull('custom_orders.assigned_to')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(custom_orders.id) as total_orders'),
                DB::raw('SUM(CASE WHEN custom_orders.status IN ("completed", "delivered") THEN 1 ELSE 0 END) as completed_orders'),
                DB::raw('AVG(CASE WHEN custom_orders.status IN ("completed", "delivered") THEN custom_orders.final_price ELSE NULL END) as avg_order_value')
            )
            ->groupBy('users.id', 'users.name')
            ->orderBy('completed_orders', 'desc')
            ->get();

        // Production stage analysis
        $productionStageAnalysis = DB::table('production_progress')
            ->join('production_stages', 'production_progress.production_stage_id', '=', 'production_stages.id')
            ->join('custom_orders', 'production_progress.custom_order_id', '=', 'custom_orders.id')
            ->whereBetween('custom_orders.created_at', [$startDate, $endDate])
            ->select(
                'production_stages.name',
                'production_stages.name_ar',
                DB::raw('COUNT(production_progress.id) as total_processes'),
                DB::raw('SUM(CASE WHEN production_progress.status = "completed" THEN 1 ELSE 0 END) as completed_processes'),
                DB::raw('AVG(production_progress.actual_duration_minutes) as avg_duration_minutes')
            )
            ->groupBy('production_stages.id', 'production_stages.name', 'production_stages.name_ar')
            ->orderBy('production_stages.order_sequence')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'custom_order_stats' => $customOrderStats,
                'worker_productivity' => $workerProductivity,
                'production_stage_analysis' => $productionStageAnalysis,
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d')
                ]
            ],
            'message' => 'Workshop analytics retrieved successfully'
        ]);
    }

    private function getDateRange(Request $request): array
    {
        if ($request->has('start_date') && $request->has('end_date')) {
            return [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ];
        }

        switch ($request->get('period', 'month')) {
            case 'today':
                return [now()->startOfDay(), now()->endOfDay()];
            case 'week':
                return [now()->startOfWeek(), now()->endOfWeek()];
            case 'quarter':
                return [now()->startOfQuarter(), now()->endOfQuarter()];
            case 'year':
                return [now()->startOfYear(), now()->endOfYear()];
            default: // month
                return [now()->startOfMonth(), now()->endOfMonth()];
        }
    }
}