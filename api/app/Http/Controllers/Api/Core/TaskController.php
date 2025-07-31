<?php

namespace App\Http\Controllers\Api\Core;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function index(): JsonResponse
    {
        $tasks = Task::with(['order', 'worker'])->get();
        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'worker_id' => 'nullable|exists:workers,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'in:low,medium,high,urgent',
            'estimated_duration' => 'nullable|integer|min:1',
        ]);

        $task = Task::create($request->all());
        return response()->json($task->load(['order', 'worker']), 201);
    }

    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['order', 'worker']));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'worker_id' => 'nullable|exists:workers,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed,cancelled',
            'priority' => 'in:low,medium,high,urgent',
            'estimated_duration' => 'nullable|integer|min:1',
            'actual_duration' => 'nullable|integer|min:1',
        ]);

        $task->update($request->all());
        return response()->json($task->load(['order', 'worker']));
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function startTask(Task $task): JsonResponse
    {
        $task->update([
            'status' => 'in_progress',
            'start_time' => now(),
        ]);

        return response()->json($task);
    }

    public function completeTask(Task $task): JsonResponse
    {
        $task->update([
            'status' => 'completed',
            'end_time' => now(),
        ]);

        return response()->json($task);
    }
} 