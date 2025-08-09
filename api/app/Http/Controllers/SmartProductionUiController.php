<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class SmartProductionUiController extends Controller
{
    public function index()
    {
        try {
            $overview = [
                'active_orders' => 0,
                'stations_busy' => 0,
                'avg_efficiency' => 0,
                'bottlenecks' => []
            ];

            if (Schema::hasTable('orders')) {
                $overview['active_orders'] = DB::table('orders')->whereIn('status', ['in_production', 'quality_check'])->count();
            }

            $overview['stations_busy'] = rand(3, 9);
            $overview['avg_efficiency'] = rand(78, 93);
            $overview['bottlenecks'] = ['Assembly', 'Quality Check'];

            return view('modules.production.smart.index', compact('overview'));
        } catch (\Exception $e) {
            return view('modules.production.smart.index', ['overview' => []]);
        }
    }

    public function stations()
    {
        try {
            $stations = [
                ['name' => 'Cutting Station 1', 'status' => 'busy', 'efficiency' => 88, 'current_order' => 'ORD-001'],
                ['name' => 'Assembly Station 2', 'status' => 'idle', 'efficiency' => 0, 'current_order' => null],
                ['name' => 'Quality Check', 'status' => 'busy', 'efficiency' => 92, 'current_order' => 'ORD-002'],
            ];

            return view('modules.production.smart.stations', compact('stations'));
        } catch (\Exception $e) {
            return view('modules.production.smart.stations', ['stations' => []]);
        }
    }

    public function assignments()
    {
        try {
            $assignments = [
                ['worker' => 'Emma Davis', 'station' => 'Assembly Station 1', 'order' => 'ORD-003', 'started_at' => now()->subMinutes(25)],
                ['worker' => 'Michael Johnson', 'station' => 'Quality Check', 'order' => 'ORD-002', 'started_at' => now()->subMinutes(10)],
            ];

            return view('modules.production.smart.assignments', compact('assignments'));
        } catch (\Exception $e) {
            return view('modules.production.smart.assignments', ['assignments' => []]);
        }
    }
}


