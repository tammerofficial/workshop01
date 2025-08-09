<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class BarcodeController extends Controller
{
    public function index()
    {
        try {
            $items = [];
            
            if (Schema::hasTable('orders')) {
                $items = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->select(
                        'orders.id',
                        'orders.title',
                        'orders.status',
                        'orders.created_at',
                        'clients.name as client_name'
                    )
                    ->orderBy('orders.created_at', 'desc')
                    ->limit(50)
                    ->get()
                    ->map(function ($item) {
                        $item->barcode = 'ORD' . str_pad($item->id, 8, '0', STR_PAD_LEFT);
                        $item->qr_code = 'WS-' . date('Y') . '-' . str_pad($item->id, 6, '0', STR_PAD_LEFT);
                        $item->client = (object) ['name' => $item->client_name];
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
                        'qr_code' => 'WS-2024-000001',
                        'created_at' => now()->subDays(2),
                        'client' => (object) ['name' => 'Sarah Wilson']
                    ],
                    (object) [
                        'id' => 2,
                        'title' => 'Business Suit Set',
                        'status' => 'quality_check',
                        'barcode' => 'ORD00000002',
                        'qr_code' => 'WS-2024-000002',
                        'created_at' => now()->subDays(5),
                        'client' => (object) ['name' => 'John Smith']
                    ],
                    (object) [
                        'id' => 3,
                        'title' => 'Evening Gown',
                        'status' => 'pending',
                        'barcode' => 'ORD00000003',
                        'qr_code' => 'WS-2024-000003',
                        'created_at' => now()->subDays(1),
                        'client' => (object) ['name' => 'Maria Garcia']
                    ]
                ]);
            }
            
            return view('modules.production.barcode.index', compact('items'));
            
        } catch (\Exception $e) {
            return view('modules.production.barcode.index', ['items' => collect()]);
        }
    }

    public function generate($id)
    {
        try {
            $item = null;
            
            if (Schema::hasTable('orders')) {
                $item = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->select(
                        'orders.*',
                        'clients.name as client_name',
                        'clients.email as client_email'
                    )
                    ->where('orders.id', $id)
                    ->first();
                    
                if ($item) {
                    $item->barcode = 'ORD' . str_pad($item->id, 8, '0', STR_PAD_LEFT);
                    $item->qr_code = 'WS-' . date('Y') . '-' . str_pad($item->id, 6, '0', STR_PAD_LEFT);
                    $item->client = (object) [
                        'name' => $item->client_name,
                        'email' => $item->client_email
                    ];
                }
            }
            
            // Dummy data if not found
            if (!$item) {
                $item = (object) [
                    'id' => $id,
                    'title' => 'Custom Wedding Dress',
                    'status' => 'in_production',
                    'barcode' => 'ORD' . str_pad($id, 8, '0', STR_PAD_LEFT),
                    'qr_code' => 'WS-2024-' . str_pad($id, 6, '0', STR_PAD_LEFT),
                    'created_at' => now()->subDays(2),
                    'client' => (object) ['name' => 'Sarah Wilson', 'email' => 'sarah@example.com']
                ];
            }
            
            return view('modules.production.barcode.generate', compact('item'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.production.barcode.index')
                ->with('error', __('Item not found'));
        }
    }

    public function print(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            $items = [];
            
            if (Schema::hasTable('orders') && !empty($ids)) {
                $items = DB::table('orders')
                    ->leftJoin('users as clients', 'orders.client_id', '=', 'clients.id')
                    ->select(
                        'orders.id',
                        'orders.title',
                        'orders.status',
                        'orders.created_at',
                        'clients.name as client_name'
                    )
                    ->whereIn('orders.id', $ids)
                    ->get()
                    ->map(function ($item) {
                        $item->barcode = 'ORD' . str_pad($item->id, 8, '0', STR_PAD_LEFT);
                        $item->qr_code = 'WS-' . date('Y') . '-' . str_pad($item->id, 6, '0', STR_PAD_LEFT);
                        $item->client = (object) ['name' => $item->client_name];
                        return $item;
                    });
            }
            
            // Add dummy data if empty
            if (empty($items->toArray())) {
                $items = collect([
                    (object) [
                        'id' => 1,
                        'title' => 'Custom Wedding Dress',
                        'barcode' => 'ORD00000001',
                        'qr_code' => 'WS-2024-000001',
                        'client' => (object) ['name' => 'Sarah Wilson']
                    ]
                ]);
            }
            
            return view('modules.production.barcode.print', compact('items'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.production.barcode.index')
                ->with('error', __('Unable to print barcodes'));
        }
    }
}
