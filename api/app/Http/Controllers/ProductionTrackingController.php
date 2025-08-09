<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ProductionTrackingController extends Controller
{
    public function index()
    {
        try {
            $trackingData = [];
            
            if (Schema::hasTable('orders')) {
                $trackingData = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->leftJoin('users as workers', 'orders.assigned_worker_id', '=', 'workers.id')
                    ->select(
                        'orders.*',
                        'clients.name as client_name',
                        'workers.name as worker_name'
                    )
                    ->whereIn('orders.status', ['pending', 'in_production', 'quality_check'])
                    ->orderBy('orders.created_at', 'desc')
                    ->get()
                    ->map(function ($order) {
                        $order->client = (object) ['name' => $order->client_name];
                        $order->worker = $order->worker_name ? (object) ['name' => $order->worker_name] : null;
                        $order->progress = $this->calculateProgress($order->status);
                        return $order;
                    });
            }
            
            // Add dummy data if empty
            if (empty($trackingData->toArray())) {
                $trackingData = collect([
                    (object) [
                        'id' => 1,
                        'title' => 'Custom Wedding Dress',
                        'status' => 'in_production',
                        'progress' => 65,
                        'created_at' => now()->subDays(2),
                        'estimated_completion_date' => now()->addDays(3),
                        'client' => (object) ['name' => 'Sarah Wilson'],
                        'worker' => (object) ['name' => 'Emma Davis'],
                        'current_stage' => 'Assembly'
                    ],
                    (object) [
                        'id' => 2,
                        'title' => 'Business Suit Set',
                        'status' => 'quality_check',
                        'progress' => 90,
                        'created_at' => now()->subDays(5),
                        'estimated_completion_date' => now()->addDays(1),
                        'client' => (object) ['name' => 'John Smith'],
                        'worker' => (object) ['name' => 'Michael Johnson'],
                        'current_stage' => 'Final Check'
                    ],
                    (object) [
                        'id' => 3,
                        'title' => 'Evening Gown',
                        'status' => 'pending',
                        'progress' => 15,
                        'created_at' => now()->subDays(1),
                        'estimated_completion_date' => now()->addDays(7),
                        'client' => (object) ['name' => 'Maria Garcia'],
                        'worker' => (object) ['name' => 'Lisa Chen'],
                        'current_stage' => 'Pattern Creation'
                    ]
                ]);
            }
            
            return view('modules.production.tracking.index', compact('trackingData'));
            
        } catch (\Exception $e) {
            return view('modules.production.tracking.index', ['trackingData' => collect()]);
        }
    }

    public function show($id)
    {
        try {
            $order = null;
            
            if (Schema::hasTable('orders')) {
                $order = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->leftJoin('users as workers', 'orders.assigned_worker_id', '=', 'workers.id')
                    ->select(
                        'orders.*',
                        'clients.name as client_name',
                        'clients.email as client_email',
                        'workers.name as worker_name'
                    )
                    ->where('orders.id', $id)
                    ->first();
                    
                if ($order) {
                    $order->client = (object) [
                        'name' => $order->client_name,
                        'email' => $order->client_email
                    ];
                    $order->worker = $order->worker_name ? (object) ['name' => $order->worker_name] : null;
                    $order->progress = $this->calculateProgress($order->status);
                }
            }
            
            // Dummy data if not found
            if (!$order) {
                $order = (object) [
                    'id' => $id,
                    'title' => 'Custom Wedding Dress',
                    'status' => 'in_production',
                    'progress' => 65,
                    'created_at' => now()->subDays(2),
                    'estimated_completion_date' => now()->addDays(3),
                    'client' => (object) ['name' => 'Sarah Wilson', 'email' => 'sarah@example.com'],
                    'worker' => (object) ['name' => 'Emma Davis'],
                    'current_stage' => 'Assembly'
                ];
            }

            // Production stages
            $stages = [
                ['name' => 'Pattern Creation', 'status' => 'completed', 'date' => '2024-01-15', 'duration' => '2h'],
                ['name' => 'Fabric Cutting', 'status' => 'completed', 'date' => '2024-01-16', 'duration' => '1.5h'],
                ['name' => 'Initial Assembly', 'status' => 'in_progress', 'date' => null, 'duration' => '4h'],
                ['name' => 'Quality Check', 'status' => 'pending', 'date' => null, 'duration' => '30m'],
                ['name' => 'Final Assembly', 'status' => 'pending', 'date' => null, 'duration' => '3h'],
                ['name' => 'Final Inspection', 'status' => 'pending', 'date' => null, 'duration' => '30m']
            ];
            
            return view('modules.production.tracking.show', compact('order', 'stages'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.production.tracking.index')
                ->with('error', __('Order not found'));
        }
    }

    private function calculateProgress($status)
    {
        switch ($status) {
            case 'pending':
                return 10;
            case 'in_production':
                return rand(30, 80);
            case 'quality_check':
                return 90;
            case 'completed':
                return 100;
            default:
                return 0;
        }
    }
}
