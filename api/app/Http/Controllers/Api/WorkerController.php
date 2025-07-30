<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WorkerController extends Controller
{
    public function index(): JsonResponse
    {
        $workers = Worker::with(['tasks', 'orders'])->get();
        return response()->json($workers);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:workers',
            'phone' => 'nullable|string',
            'role' => 'required|string',
            'department' => 'required|string',
            'salary' => 'nullable|numeric|min:0',
            'hire_date' => 'required|date',
            'skills' => 'nullable|array',
            // Payroll fields validation
            'base_salary' => 'nullable|numeric|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'standard_hours_per_day' => 'nullable|integer|min:1|max:24',
            'standard_hours_per_week' => 'nullable|integer|min:1|max:168',
            'standard_hours_per_month' => 'nullable|integer|min:1|max:744',
            'enable_overtime' => 'nullable|boolean',
            'enable_bonus' => 'nullable|boolean',
            'bonus_percentage' => 'nullable|numeric|min:0|max:100',
            'payroll_status' => 'nullable|in:active,inactive,suspended',
        ]);

        $data = $request->all();
        
        // Auto-calculate hourly rate if salary and hours are provided
        $this->calculateHourlyRates($data);
        
        $worker = Worker::create($data);
        return response()->json($worker, 201);
    }

    public function show(Worker $worker): JsonResponse
    {
        return response()->json($worker->load(['tasks', 'orders']));
    }

    public function update(Request $request, Worker $worker): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:workers,email,' . $worker->id,
            'phone' => 'nullable|string',
            'role' => 'required|string',
            'department' => 'required|string',
            'salary' => 'nullable|numeric|min:0',
            'hire_date' => 'required|date',
            'skills' => 'nullable|array',
            // Payroll fields validation
            'base_salary' => 'nullable|numeric|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'standard_hours_per_day' => 'nullable|integer|min:1|max:24',
            'standard_hours_per_week' => 'nullable|integer|min:1|max:168',
            'standard_hours_per_month' => 'nullable|integer|min:1|max:744',
            'enable_overtime' => 'nullable|boolean',
            'enable_bonus' => 'nullable|boolean',
            'bonus_percentage' => 'nullable|numeric|min:0|max:100',
            'payroll_status' => 'nullable|in:active,inactive,suspended',
        ]);

        $data = $request->all();
        
        // Auto-calculate hourly rate if salary and hours are provided
        $this->calculateHourlyRates($data);
        
        $worker->update($data);
        return response()->json($worker);
    }

    public function destroy(Worker $worker): JsonResponse
    {
        $worker->delete();
        return response()->json(['message' => 'Worker deleted successfully']);
    }

    public function activate(Worker $worker): JsonResponse
    {
        $worker->update(['is_active' => true]);
        return response()->json(['message' => 'Worker activated successfully']);
    }

    public function deactivate(Worker $worker): JsonResponse
    {
        $worker->update(['is_active' => false]);
        return response()->json(['message' => 'Worker deactivated successfully']);
    }

    /**
     * Auto-calculate hourly rate and overtime rate based on salary and monthly hours
     */
    private function calculateHourlyRates(array &$data): void
    {
        // Calculate hourly rate if salary and monthly hours are provided
        if (isset($data['salary']) && isset($data['standard_hours_per_month'])) {
            $salary = (float) $data['salary'];
            $monthlyHours = (float) $data['standard_hours_per_month'];
            
            if ($monthlyHours > 0) {
                $data['hourly_rate'] = round($salary / $monthlyHours, 2);
                
                // Calculate overtime rate (1.5x hourly rate)
                $data['overtime_rate'] = round($data['hourly_rate'] * 1.5, 2);
            }
        }
        // If only salary is provided but no monthly hours, use default 160 hours
        elseif (isset($data['salary']) && !isset($data['standard_hours_per_month'])) {
            $salary = (float) $data['salary'];
            $defaultMonthlyHours = 160; // Default monthly hours
            
            $data['hourly_rate'] = round($salary / $defaultMonthlyHours, 2);
            $data['overtime_rate'] = round($data['hourly_rate'] * 1.5, 2);
            $data['standard_hours_per_month'] = $defaultMonthlyHours;
        }
    }
} 