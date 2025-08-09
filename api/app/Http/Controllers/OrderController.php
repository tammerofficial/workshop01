<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        try {
            $orders = \Schema::hasTable('orders') ? 
                Order::with(['client'])->orderBy('created_at', 'desc')->get() : 
                collect([]);
        } catch (\Exception $e) {
            $orders = collect([]);
        }
        
        return view('modules.orders.index', compact('orders'));
    }

    public function create()
    {
        return view('modules.orders.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required','integer'],
            'assigned_worker_id' => ['nullable','integer'],
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'delivery_date' => ['required','date'],
            'deposit_amount' => ['nullable','numeric'],
        ]);

        $order = new Order();
        $order->fill($data);
        $order->order_number = 'ORD-'.now()->format('Ymd-His');
        $order->status = 'confirmed';
        $order->save();

        return redirect()->route('ui.orders.show', $order)->with('success', __('Saved successfully'));
    }

    public function show(Order $order)
    {
        $order->load(['client','assignedWorker']);
        return view('modules.orders.show', compact('order'));
    }

    public function edit(Order $order)
    {
        return view('modules.orders.edit', compact('order'));
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'delivery_date' => ['required','date'],
        ]);
        $order->update($data);
        return redirect()->route('ui.orders.show', $order)->with('success', __('Updated successfully'));
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('ui.orders')->with('success', __('Deleted successfully'));
    }
}
