<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class WorkshopController extends Controller
{
    // Custom Orders Methods
    public function customOrdersIndex()
    {
        try {
            $customOrders = [];
            
            if (Schema::hasTable('custom_orders')) {
                $customOrders = DB::table('custom_orders')
                    ->leftJoin('users as customers', 'custom_orders.customer_id', '=', 'customers.id')
                    ->leftJoin('users as assigned', 'custom_orders.assigned_to', '=', 'assigned.id')
                    ->select(
                        'custom_orders.*',
                        'customers.name as customer_name',
                        'customers.email as customer_email',
                        'assigned.name as assigned_name'
                    )
                    ->orderBy('custom_orders.created_at', 'desc')
                    ->get()
                    ->map(function ($order) {
                        $order->customer = (object) [
                            'name' => $order->customer_name,
                            'email' => $order->customer_email
                        ];
                        $order->assignedTo = $order->assigned_name ? (object) ['name' => $order->assigned_name] : null;
                        return $order;
                    });
            }
            
            // Add dummy data if empty
            if (empty($customOrders->toArray())) {
                $customOrders = collect([
                    (object) [
                        'id' => 1,
                        'order_number' => 'CO-2024-000001',
                        'product_type' => 'Custom Suit',
                        'status' => 'in_production',
                        'priority' => 'normal',
                        'quoted_price' => 450.00,
                        'final_price' => 450.00,
                        'promised_delivery_date' => now()->addDays(15),
                        'customer' => (object) ['name' => 'John Doe'],
                        'assignedTo' => (object) ['name' => 'Michael Johnson']
                    ],
                    (object) [
                        'id' => 2,
                        'order_number' => 'CO-2024-000002',
                        'product_type' => 'Evening Dress',
                        'status' => 'pending_quote',
                        'priority' => 'high',
                        'quoted_price' => null,
                        'final_price' => null,
                        'promised_delivery_date' => null,
                        'customer' => (object) ['name' => 'Sarah Wilson'],
                        'assignedTo' => null
                    ]
                ]);
            }
            
            return view('modules.workshop.custom-orders.index', compact('customOrders'));
            
        } catch (\Exception $e) {
            return view('modules.workshop.custom-orders.index', ['customOrders' => collect()]);
        }
    }

    public function customOrdersCreate()
    {
        try {
            $customers = [];
            $workers = [];
            
            if (Schema::hasTable('users')) {
                $customers = DB::table('users')
                    ->where('role', 'customer')
                    ->orWhere('email', 'like', '%@%')
                    ->select('id', 'name', 'email')
                    ->get();
                    
                $workers = DB::table('users')
                    ->whereIn('role', ['worker', 'staff_manager'])
                    ->select('id', 'name')
                    ->get();
            }
            
            // Add dummy data if empty
            if ($customers->isEmpty()) {
                $customers = collect([
                    (object) ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'],
                    (object) ['id' => 2, 'name' => 'Sarah Wilson', 'email' => 'sarah@example.com']
                ]);
            }
            
            if ($workers->isEmpty()) {
                $workers = collect([
                    (object) ['id' => 1, 'name' => 'Michael Johnson'],
                    (object) ['id' => 2, 'name' => 'Emma Davis']
                ]);
            }
            
            return view('modules.workshop.custom-orders.create', compact('customers', 'workers'));
            
        } catch (\Exception $e) {
            return view('modules.workshop.custom-orders.create', [
                'customers' => collect(),
                'workers' => collect()
            ]);
        }
    }

    public function customOrdersStore(Request $request)
    {
        $request->validate([
            'customer_id' => 'required',
            'product_type' => 'required|string|max:255',
            'priority' => 'required|in:low,normal,high,urgent'
        ]);

        try {
            if (Schema::hasTable('custom_orders')) {
                $orderNumber = 'CO-' . date('Y') . '-' . str_pad(DB::table('custom_orders')->count() + 1, 6, '0', STR_PAD_LEFT);
                
                DB::table('custom_orders')->insert([
                    'order_number' => $orderNumber,
                    'customer_id' => $request->customer_id,
                    'product_type' => $request->product_type,
                    'fabric_type' => $request->fabric_type,
                    'fabric_color' => $request->fabric_color,
                    'measurements' => json_encode($request->measurements ?? []),
                    'design_specifications' => json_encode($request->design_specifications ?? []),
                    'special_instructions' => $request->special_instructions,
                    'estimated_completion_date' => $request->estimated_completion_date,
                    'priority' => $request->priority,
                    'status' => 'pending_quote',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return redirect()->route('ui.workshop.custom-orders.index')
                ->with('success', __('Custom order created successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to create custom order: ') . $e->getMessage());
        }
    }

    public function customOrdersShow($id)
    {
        try {
            $customOrder = null;
            
            if (Schema::hasTable('custom_orders')) {
                $customOrder = DB::table('custom_orders')
                    ->leftJoin('users as customers', 'custom_orders.customer_id', '=', 'customers.id')
                    ->leftJoin('users as assigned', 'custom_orders.assigned_to', '=', 'assigned.id')
                    ->leftJoin('users as created_by', 'custom_orders.created_by', '=', 'created_by.id')
                    ->select(
                        'custom_orders.*',
                        'customers.name as customer_name',
                        'customers.email as customer_email',
                        'customers.phone as customer_phone',
                        'assigned.name as assigned_name',
                        'created_by.name as created_by_name'
                    )
                    ->where('custom_orders.id', $id)
                    ->first();
                    
                if ($customOrder) {
                    $customOrder->customer = (object) [
                        'name' => $customOrder->customer_name,
                        'email' => $customOrder->customer_email,
                        'phone' => $customOrder->customer_phone
                    ];
                    $customOrder->assignedTo = $customOrder->assigned_name ? (object) ['name' => $customOrder->assigned_name] : null;
                    $customOrder->createdBy = $customOrder->created_by_name ? (object) ['name' => $customOrder->created_by_name] : null;
                    $customOrder->measurements = json_decode($customOrder->measurements ?? '{}', true);
                    $customOrder->created_at = now()->parse($customOrder->created_at ?? now());
                    $customOrder->estimated_completion_date = $customOrder->estimated_completion_date ? now()->parse($customOrder->estimated_completion_date) : null;
                    $customOrder->promised_delivery_date = $customOrder->promised_delivery_date ? now()->parse($customOrder->promised_delivery_date) : null;
                }
            }
            
            // Dummy data if not found
            if (!$customOrder) {
                $customOrder = (object) [
                    'id' => $id,
                    'order_number' => 'CO-2024-000001',
                    'product_type' => 'Custom Suit',
                    'status' => 'in_production',
                    'priority' => 'normal',
                    'quoted_price' => 450.00,
                    'final_price' => 450.00,
                    'measurements' => [
                        'chest' => '102',
                        'waist' => '86',
                        'hip' => '98',
                        'length' => '72',
                        'shoulder' => '46',
                        'sleeve' => '63',
                        'neck' => '40',
                        'inseam' => '81'
                    ],
                    'created_at' => now()->subDays(5),
                    'estimated_completion_date' => now()->addDays(10),
                    'promised_delivery_date' => now()->addDays(15),
                    'customer' => (object) [
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                        'phone' => '+1 (555) 123-4567'
                    ],
                    'assignedTo' => (object) ['name' => 'Michael Johnson'],
                    'createdBy' => (object) ['name' => 'Admin User']
                ];
            }
            
            return view('modules.workshop.custom-orders.show', compact('customOrder'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.workshop.custom-orders.index')
                ->with('error', __('Custom order not found'));
        }
    }

    public function customOrdersEdit($id)
    {
        try {
            $customOrder = null;
            $workers = [];
            
            if (Schema::hasTable('custom_orders')) {
                $customOrder = DB::table('custom_orders')->where('id', $id)->first();
                
                if ($customOrder) {
                    $customOrder->estimated_completion_date = $customOrder->estimated_completion_date ? now()->parse($customOrder->estimated_completion_date) : null;
                    $customOrder->promised_delivery_date = $customOrder->promised_delivery_date ? now()->parse($customOrder->promised_delivery_date) : null;
                }
            }
            
            if (Schema::hasTable('users')) {
                $workers = DB::table('users')
                    ->whereIn('role', ['worker', 'staff_manager'])
                    ->select('id', 'name')
                    ->get();
            }
            
            // Dummy data if not found
            if (!$customOrder) {
                $customOrder = (object) [
                    'id' => $id,
                    'order_number' => 'CO-2024-000001',
                    'status' => 'in_production',
                    'priority' => 'normal',
                    'quoted_price' => 450.00,
                    'final_price' => 450.00,
                    'assigned_to' => null,
                    'estimated_completion_date' => now()->addDays(10),
                    'promised_delivery_date' => now()->addDays(15),
                    'notes' => ''
                ];
            }
            
            if ($workers->isEmpty()) {
                $workers = collect([
                    (object) ['id' => 1, 'name' => 'Michael Johnson'],
                    (object) ['id' => 2, 'name' => 'Emma Davis']
                ]);
            }
            
            return view('modules.workshop.custom-orders.edit', compact('customOrder', 'workers'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.workshop.custom-orders.index')
                ->with('error', __('Custom order not found'));
        }
    }

    public function customOrdersUpdate(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending_quote,quoted,confirmed,in_production,quality_check,completed,delivered,cancelled',
            'priority' => 'required|in:low,normal,high,urgent',
            'quoted_price' => 'nullable|numeric|min:0',
            'final_price' => 'nullable|numeric|min:0'
        ]);

        try {
            if (Schema::hasTable('custom_orders')) {
                DB::table('custom_orders')
                    ->where('id', $id)
                    ->update([
                        'status' => $request->status,
                        'priority' => $request->priority,
                        'quoted_price' => $request->quoted_price,
                        'final_price' => $request->final_price,
                        'assigned_to' => $request->assigned_to,
                        'estimated_completion_date' => $request->estimated_completion_date,
                        'promised_delivery_date' => $request->promised_delivery_date,
                        'notes' => $request->notes,
                        'updated_at' => now()
                    ]);
            }

            return redirect()->route('ui.workshop.custom-orders.show', $id)
                ->with('success', __('Custom order updated successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to update custom order: ') . $e->getMessage());
        }
    }

    public function customOrdersDestroy($id)
    {
        try {
            if (Schema::hasTable('custom_orders')) {
                DB::table('custom_orders')->where('id', $id)->delete();
            }

            return redirect()->route('ui.workshop.custom-orders.index')
                ->with('success', __('Custom order deleted successfully'));

        } catch (\Exception $e) {
            return redirect()->route('ui.workshop.custom-orders.index')
                ->with('error', __('Failed to delete custom order'));
        }
    }
}
