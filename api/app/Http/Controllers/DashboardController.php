<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Worker;
use App\Models\Material;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Task;
use App\Models\Product;
use App\Models\Station;
use App\Models\Attendance;
use App\Models\Sale;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        $stats = [
            // Core counts
            'workers_count' => Worker::where('is_active', true)->count(),
            'orders_count' => Order::count(),
            'products_count' => Product::where('is_active', true)->count(),
            'clients_count' => Client::count(),
            'materials_count' => Material::where('is_active', true)->count(),
            
            // Order status breakdown
            'pending_orders' => Order::where('status', 'pending')->count(),
            'in_progress_orders' => Order::where('status', 'in_progress')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            
            // Inventory & stock
            'low_stock_materials' => Material::whereRaw('quantity <= reorder_level')->count(),
            'total_stock_value' => Material::selectRaw('SUM(quantity * cost_per_unit) as total')->value('total') ?? 0,
            
            // Financial data
            'unpaid_invoices' => Invoice::where('status', '!=', 'paid')->count(),
            'total_revenue' => Invoice::where('status', 'paid')->sum('total_amount'),
            'pending_revenue' => Invoice::where('status', 'pending')->sum('total_amount'),
            'monthly_revenue' => Invoice::where('status', 'paid')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('total_amount'),
            
            // Production metrics
            'active_stations' => Station::where('status', 'active')->count(),
            'total_stations' => Station::count(),
            'orders_this_month' => Order::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
            'completed_this_month' => Order::where('status', 'completed')
                ->whereMonth('completed_date', Carbon::now()->month)
                ->whereYear('completed_date', Carbon::now()->year)
                ->count(),
            
            // Worker metrics
            'active_workers_today' => Attendance::whereDate('attendance_date', Carbon::today())
                ->distinct('worker_id')
                ->count(),
            'total_working_hours_today' => Attendance::whereDate('attendance_date', Carbon::today())
                ->sum('total_hours'),
            
            // Performance indicators
            'average_completion_time' => Order::where('status', 'completed')
                ->whereNotNull('completed_date')
                ->selectRaw('AVG(DATEDIFF(completed_date, start_date)) as avg_days')
                ->value('avg_days') ?? 0,
            'on_time_completion_rate' => $this->calculateOnTimeCompletionRate(),
            
            // Recent activity
            'tasks_pending' => Task::where('status', 'pending')->count(),
            'tasks_in_progress' => Task::where('status', 'in_progress')->count(),
            'tasks_completed_today' => Task::where('status', 'completed')
                ->whereDate('updated_at', Carbon::today())
                ->count(),
        ];

        return response()->json($stats);
    }

    public function getRecentOrders()
    {
        $orders = Order::with(['client', 'worker', 'category', 'product'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'title' => $order->title,
                    'status' => $order->status,
                    'priority' => $order->priority,
                    'progress' => $order->progress ?? 0,
                    'due_date' => $order->due_date,
                    'client' => [
                        'id' => $order->client->id ?? null,
                        'name' => $order->client->name ?? 'Unknown Client',
                    ],
                    'worker' => [
                        'id' => $order->worker->id ?? null,
                        'name' => $order->worker->name ?? 'Unassigned',
                    ],
                    'category' => [
                        'id' => $order->category->id ?? null,
                        'name' => $order->category->name ?? 'No Category',
                    ],
                    'product' => [
                        'id' => $order->product->id ?? null,
                        'name' => $order->product->name ?? 'No Product',
                    ],
                    'created_at' => $order->created_at,
                    'total_cost' => $order->total_cost,
                ];
            });

        return response()->json($orders);
    }

    public function getRecentTasks()
    {
        $tasks = Task::with(['worker', 'order'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($tasks);
    }

    public function getWorkerPerformance()
    {
        $workers = Worker::where('is_active', true)
            ->withCount(['orders', 'tasks'])
            ->with(['attendance' => function ($query) {
                $query->whereDate('attendance_date', Carbon::today());
            }])
            ->get()
            ->map(function ($worker) {
                $completedOrders = $worker->orders()->where('status', 'completed')->count();
                $totalOrders = $worker->orders()->count();
                $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;

                return [
                    'id' => $worker->id,
                    'name' => $worker->name,
                    'specialty' => $worker->specialty,
                    'department' => $worker->department,
                    'total_orders' => $totalOrders,
                    'completed_orders' => $completedOrders,
                    'completion_rate' => round($completionRate, 2),
                    'is_present_today' => $worker->attendance->isNotEmpty(),
                    'hours_today' => $worker->attendance->sum('total_hours'),
                ];
            });

        return response()->json($workers);
    }

    public function getProductionMetrics()
    {
        $metrics = [
            'daily_production' => Order::where('status', 'completed')
                ->whereDate('completed_date', Carbon::today())
                ->count(),
            'weekly_production' => Order::where('status', 'completed')
                ->whereBetween('completed_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])
                ->count(),
            'monthly_production' => Order::where('status', 'completed')
                ->whereMonth('completed_date', Carbon::now()->month)
                ->whereYear('completed_date', Carbon::now()->year)
                ->count(),
            'capacity_utilization' => $this->calculateCapacityUtilization(),
            'bottleneck_stations' => $this->getBottleneckStations(),
        ];

        return response()->json($metrics);
    }

    public function getInventoryAlerts()
    {
        $alerts = [
            'low_stock_items' => Material::whereRaw('quantity <= reorder_level')
                ->with('category')
                ->get(),
            'out_of_stock_items' => Material::where('quantity', '<=', 0)
                ->with('category')
                ->get(),
            'overstock_items' => Material::whereRaw('quantity > reorder_level * 5')
                ->with('category')
                ->get(),
        ];

        return response()->json($alerts);
    }

    private function calculateOnTimeCompletionRate()
    {
        $totalCompleted = Order::where('status', 'completed')->whereNotNull('due_date')->count();
        
        if ($totalCompleted === 0) {
            return 0;
        }

        $onTimeCompleted = Order::where('status', 'completed')
            ->whereNotNull('due_date')
            ->whereRaw('completed_date <= due_date')
            ->count();

        return round(($onTimeCompleted / $totalCompleted) * 100, 2);
    }

    private function calculateCapacityUtilization()
    {
        $totalWorkers = Worker::where('is_active', true)->count();
        $totalCapacity = $totalWorkers * 8; // 8 hours per day

        $actualHours = Attendance::whereDate('attendance_date', Carbon::today())
            ->sum('total_hours');

        if ($totalCapacity === 0) {
            return 0;
        }

        return round(($actualHours / $totalCapacity) * 100, 2);
    }

    private function getBottleneckStations()
    {
        return Station::withCount(['orders' => function ($query) {
                $query->where('status', 'in_progress');
            }])
            ->having('orders_count', '>', 0)
            ->orderBy('orders_count', 'desc')
            ->limit(5)
            ->get();
    }

    public function getProductionFlowSummary()
    {
        // Get production stages with order counts
        $productionStages = [
            [
                'id' => 'pending',
                'name' => 'Pending',
                'name_ar' => 'في الانتظار',
                'order_count' => Order::where('status', 'pending')->count(),
                'task_count' => 0,
                'worker_count' => 0,
                'color' => 'gray',
                'orders' => []
            ],
            [
                'id' => 'design',
                'name' => 'Design',
                'name_ar' => 'التصميم',
                'order_count' => Order::where('production_stage', 'design')->count(),
                'task_count' => Task::where('production_stage', 'design')->where('status', '!=', 'completed')->count(),
                'worker_count' => Worker::where('specialty', 'design')->where('is_active', true)->count(),
                'color' => 'blue',
                'orders' => []
            ],
            [
                'id' => 'cutting',
                'name' => 'Cutting',
                'name_ar' => 'القص',
                'order_count' => Order::where('production_stage', 'cutting')->count(),
                'task_count' => Task::where('production_stage', 'cutting')->where('status', '!=', 'completed')->count(),
                'worker_count' => Worker::where('specialty', 'cutting')->where('is_active', true)->count(),
                'color' => 'yellow',
                'orders' => []
            ],
            [
                'id' => 'sewing',
                'name' => 'Sewing',
                'name_ar' => 'الخياطة',
                'order_count' => Order::where('production_stage', 'sewing')->count(),
                'task_count' => Task::where('production_stage', 'sewing')->where('status', '!=', 'completed')->count(),
                'worker_count' => Worker::where('specialty', 'sewing')->where('is_active', true)->count(),
                'color' => 'green',
                'orders' => []
            ],
            [
                'id' => 'fitting',
                'name' => 'Fitting',
                'name_ar' => 'التفصيل',
                'order_count' => Order::where('production_stage', 'fitting')->count(),
                'task_count' => Task::where('production_stage', 'fitting')->where('status', '!=', 'completed')->count(),
                'worker_count' => Worker::where('specialty', 'fitting')->where('is_active', true)->count(),
                'color' => 'purple',
                'orders' => []
            ],
            [
                'id' => 'finishing',
                'name' => 'Finishing',
                'name_ar' => 'اللمسة الأخيرة',
                'order_count' => Order::where('production_stage', 'finishing')->count(),
                'task_count' => Task::where('production_stage', 'finishing')->where('status', '!=', 'completed')->count(),
                'worker_count' => Worker::where('specialty', 'finishing')->where('is_active', true)->count(),
                'color' => 'orange',
                'orders' => []
            ],
            [
                'id' => 'completed',
                'name' => 'Completed',
                'name_ar' => 'مكتمل',
                'order_count' => Order::where('status', 'completed')->count(),
                'task_count' => 0,
                'worker_count' => 0,
                'color' => 'emerald',
                'orders' => []
            ]
        ];

        return response()->json($productionStages);
    }
}