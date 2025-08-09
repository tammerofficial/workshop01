<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Worker;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index()
    {
        try {
            $ordersCount = \Schema::hasTable('orders') ? Order::count() : 0;
            $workersCount = \Schema::hasTable('workers') ? Worker::count() : 0;
            $inventoryCount = \Schema::hasTable('inventory_items') ? InventoryItem::count() : 0;
        } catch (\Exception $e) {
            $ordersCount = 0;
            $workersCount = 0;
            $inventoryCount = 0;
        }
        
        return view('modules.reports.index', compact('ordersCount', 'workersCount', 'inventoryCount'));
    }
}
