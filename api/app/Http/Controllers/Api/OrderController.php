<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['client', 'worker', 'category', 'tasks', 'materials'])->get();
        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'assigned_worker_id' => 'nullable|exists:workers,id',
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'total_cost' => 'nullable|numeric|min:0',
            'specifications' => 'nullable|array',
        ]);

        $order = Order::create($request->all());
        return response()->json($order->load(['client', 'worker', 'category']), 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['client', 'worker', 'category', 'tasks', 'materials', 'measurements', 'invoices']));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'assigned_worker_id' => 'nullable|exists:workers,id',
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed,cancelled',
            'priority' => 'in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'completed_date' => 'nullable|date',
            'total_cost' => 'nullable|numeric|min:0',
            'specifications' => 'nullable|array',
        ]);

        $order->update($request->all());
        return response()->json($order->load(['client', 'worker', 'category']));
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function assignWorker(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id',
        ]);

        $order->update(['assigned_worker_id' => $request->worker_id]);
        return response()->json($order->load('worker'));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
        ]);

        $order->update([
            'status' => $request->status,
            'completed_date' => $request->status === 'completed' ? now() : null,
        ]);

        return response()->json($order);
    }

    public function getByClient($client_id): JsonResponse
    {
        $orders = Order::where('client_id', $client_id)
            ->with(['client', 'worker', 'materials'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }
} 