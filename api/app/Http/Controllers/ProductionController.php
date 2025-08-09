<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{
    public function index()
    {
        try {
            $productionOrders = [];
            
            if (Schema::hasTable('orders')) {
                $productionOrders = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->leftJoin('users as workers', 'orders.assigned_worker_id', '=', 'workers.id')
                    ->select(
                        'orders.*',
                        'clients.name as client_name',
                        'workers.name as worker_name'
                    )
                    ->whereIn('orders.status', ['in_production', 'quality_check'])
                    ->orderBy('orders.priority', 'desc')
                    ->orderBy('orders.created_at', 'desc')
                    ->get()
                    ->map(function ($order) {
                        $order->client = (object) ['name' => $order->client_name];
                        $order->worker = $order->worker_name ? (object) ['name' => $order->worker_name] : null;
                        return $order;
                    });
            }
            
            // Add dummy data if empty
            if (empty($productionOrders->toArray())) {
                $productionOrders = collect([
                    (object) [
                        'id' => 1,
                        'title' => 'Custom Wedding Dress',
                        'status' => 'in_production',
                        'priority' => 'high',
                        'progress' => 65,
                        'estimated_completion' => now()->addDays(3),
                        'client' => (object) ['name' => 'Sarah Wilson'],
                        'worker' => (object) ['name' => 'Emma Davis'],
                        'stage' => 'Assembly'
                    ],
                    (object) [
                        'id' => 2,
                        'title' => 'Business Suit Set',
                        'status' => 'quality_check',
                        'priority' => 'normal',
                        'progress' => 90,
                        'estimated_completion' => now()->addDays(1),
                        'client' => (object) ['name' => 'John Smith'],
                        'worker' => (object) ['name' => 'Michael Johnson'],
                        'stage' => 'Final Check'
                    ]
                ]);
            }
            
            return view('modules.production.index', compact('productionOrders'));
            
        } catch (\Exception $e) {
            return view('modules.production.index', ['productionOrders' => collect()]);
        }
    }

    public function workflow()
    {
        try {
            $stages = [
                ['id' => 1, 'name' => 'Pattern Creation', 'duration' => '2 hours', 'status' => 'active'],
                ['id' => 2, 'name' => 'Fabric Cutting', 'duration' => '1.5 hours', 'status' => 'pending'],
                ['id' => 3, 'name' => 'Initial Assembly', 'duration' => '4 hours', 'status' => 'pending'],
                ['id' => 4, 'name' => 'Quality Check', 'duration' => '30 minutes', 'status' => 'pending'],
                ['id' => 5, 'name' => 'Final Assembly', 'duration' => '3 hours', 'status' => 'pending'],
                ['id' => 6, 'name' => 'Final Inspection', 'duration' => '30 minutes', 'status' => 'pending']
            ];
            
            return view('modules.production.workflow', compact('stages'));
            
        } catch (\Exception $e) {
            return view('modules.production.workflow', ['stages' => []]);
        }
    }

    public function tracking()
    {
        try {
            $trackingData = [];
            
            if (Schema::hasTable('orders')) {
                $trackingData = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->select(
                        'orders.id',
                        'orders.title',
                        'orders.status',
                        'orders.created_at',
                        'orders.estimated_completion_date',
                        'clients.name as client_name'
                    )
                    ->whereIn('orders.status', ['pending', 'in_production', 'quality_check'])
                    ->orderBy('orders.created_at', 'desc')
                    ->get()
                    ->map(function ($order) {
                        $order->client = (object) ['name' => $order->client_name];
                        $order->progress = rand(10, 95);
                        return $order;
                    });
            }
            
            // Add dummy data if empty
            if (empty($trackingData->toArray())) {
                $trackingData = collect([
                    (object) [
                        'id' => 1,
                        'title' => 'Order #1234',
                        'status' => 'in_production',
                        'progress' => 65,
                        'created_at' => now()->subDays(2),
                        'estimated_completion_date' => now()->addDays(3),
                        'client' => (object) ['name' => 'Sarah Wilson']
                    ],
                    (object) [
                        'id' => 2,
                        'title' => 'Order #1235',
                        'status' => 'quality_check',
                        'progress' => 90,
                        'created_at' => now()->subDays(5),
                        'estimated_completion_date' => now()->addDays(1),
                        'client' => (object) ['name' => 'John Smith']
                    ]
                ]);
            }
            
            return view('modules.production.tracking', compact('trackingData'));
            
        } catch (\Exception $e) {
            return view('modules.production.tracking', ['trackingData' => collect()]);
        }
    }

    public function barcode()
    {
        try {
            $items = [];
            
            if (Schema::hasTable('orders')) {
                $items = DB::table('orders')
                    ->select('id', 'title', 'status', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(20)
                    ->get()
                    ->map(function ($item) {
                        $item->barcode = 'ORD' . str_pad($item->id, 8, '0', STR_PAD_LEFT);
                        return $item;
                    });
            }
            
            // Add dummy data if empty
            if (empty($items->toArray())) {
                $items = collect([
                    (object) [
                        'id' => 1,
                        'title' => 'Custom Wedding Dress',
                        'status' => 'in_production',
                        'barcode' => 'ORD00000001',
                        'created_at' => now()->subDays(2)
                    ],
                    (object) [
                        'id' => 2,
                        'title' => 'Business Suit Set',
                        'status' => 'quality_check',
                        'barcode' => 'ORD00000002',
                        'created_at' => now()->subDays(5)
                    ]
                ]);
            }
            
            return view('modules.production.barcode', compact('items'));
            
        } catch (\Exception $e) {
            return view('modules.production.barcode', ['items' => collect()]);
        }
    }
}
