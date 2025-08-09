<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class WorkerIpadUiController extends Controller
{
    public function index()
    {
        try {
            $orders = collect();
            if (Schema::hasTable('orders')) {
                $orders = DB::table('orders')
                    ->select('id', 'title', 'status', 'created_at', 'estimated_completion_date')
                    ->whereIn('status', ['pending', 'in_production'])
                    ->orderBy('created_at', 'desc')
                    ->limit(25)
                    ->get();
            }
            if ($orders->isEmpty()) {
                $orders = collect([
                    (object)['id'=>1,'title'=>'Order #1234','status'=>'in_production','created_at'=>now()->subHours(2),'estimated_completion_date'=>now()->addDays(2)],
                    (object)['id'=>2,'title'=>'Order #1235','status'=>'pending','created_at'=>now()->subHours(5),'estimated_completion_date'=>now()->addDays(3)],
                ]);
            }
            return view('modules.production.worker-ipad.index', compact('orders'));
        } catch (\Exception $e) {
            return view('modules.production.worker-ipad.index', ['orders'=>collect()]);
        }
    }

    public function show($order)
    {
        try {
            $orderData = null;
            if (Schema::hasTable('orders')) {
                $orderData = DB::table('orders')->where('id', $order)->first();
            }
            if (!$orderData) {
                $orderData = (object)['id'=>$order,'title'=>'Order #'.$order,'status'=>'in_production','created_at'=>now()->subHours(3),'estimated_completion_date'=>now()->addDays(2)];
            }
            $stages = [
                ['name'=>'Cutting', 'status'=>'completed'],
                ['name'=>'Assembly', 'status'=>'in_progress'],
                ['name'=>'Quality Check', 'status'=>'pending'],
            ];
            return view('modules.production.worker-ipad.show', compact('orderData','stages'));
        } catch (\Exception $e) {
            return redirect()->route('ui.production.worker-ipad.index')->with('error', __('Order not found'));
        }
    }
}


