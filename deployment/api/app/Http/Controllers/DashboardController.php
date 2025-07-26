<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Worker;
use App\Models\Material;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getStats()
    {
        $stats = [
            'workers_count' => Worker::where('is_active', true)->count(),
            'orders_count' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'in_progress_orders' => Order::where('status', 'in_progress')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'clients_count' => Client::count(),
            'materials_count' => Material::count(),
            'low_stock_materials' => Material::whereRaw('quantity <= reorder_level')->count(),
            'unpaid_invoices' => Invoice::where('status', '!=', 'paid')->count(),
            'total_revenue' => Invoice::where('status', 'paid')->sum('total_amount')
        ];

        return response()->json($stats);
    }

    public function getRecentOrders()
    {
        $orders = Order::with(['client', 'worker', 'category'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($orders);
    }

    public function getRecentTasks()
    {
        $tasks = Task::with(['worker', 'order'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($tasks);
    }
} 