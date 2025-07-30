<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Worker;
use App\Models\Attendance;
use App\Services\BiometricService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PayrollController extends Controller
{
    protected $biometricService;

    public function __construct(BiometricService $biometricService)
    {
        $this->biometricService = $biometricService;
    }

    /**
     * Get all payroll records
     */
    public function index(Request $request)
    {
        try {
            $query = Payroll::with(['worker']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('payroll_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('payroll_date', '<=', $request->end_date);
            }

            // Filter by worker
            if ($request->has('worker_id')) {
                $query->where('worker_id', $request->worker_id);
            }

            $payrolls = $query->orderBy('payroll_date', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $payrolls->items(),
                'pagination' => [
                    'current_page' => $payrolls->currentPage(),
                    'last_page' => $payrolls->lastPage(),
                    'per_page' => $payrolls->perPage(),
                    'total' => $payrolls->total(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payrolls: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payrolls',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payroll statistics
     */
    public function stats(Request $request)
    {
        try {
            $query = Payroll::query();

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('payroll_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('payroll_date', '<=', $request->end_date);
            }

            $stats = [
                'total_payroll' => $query->sum('net_salary') ?? 0,
                'average_salary' => $query->avg('net_salary') ?? 0,
                'total_workers' => Worker::where('is_active', true)
                    ->where('payroll_status', 'active')
                    ->count(), // العمال الكليين من قاعدة البيانات المحلية
                'payroll_workers' => $query->distinct('worker_id')->count(), // العمال الذين لديهم رواتب
                'total_hours' => $query->sum('working_hours') ?? 0,
                'pending_count' => Payroll::pending()->count(),
                'paid_count' => Payroll::paid()->count(),
                'cancelled_count' => Payroll::cancelled()->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payroll stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payroll statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific payroll record
     */
    public function show($id)
    {
        try {
            $payroll = Payroll::with(['worker', 'worker.attendance'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $payroll
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payroll: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payroll not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Generate payroll for a worker
     */
    public function generatePayroll(Request $request)
    {
        try {
            $request->validate([
                'worker_id' => 'required|exists:workers,id',
                'payroll_date' => 'required|date',
                'hourly_rate' => 'nullable|numeric|min:0',
                'overtime_rate' => 'nullable|numeric|min:0',
                'bonus' => 'nullable|numeric|min:0',
                'deductions' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string'
            ]);

            $worker = Worker::findOrFail($request->worker_id);
            $payrollDate = Carbon::parse($request->payroll_date);

            // Check if payroll already exists for this worker and month
            $existingPayroll = Payroll::where('worker_id', $request->worker_id)
                ->whereYear('payroll_date', $payrollDate->year)
                ->whereMonth('payroll_date', $payrollDate->month)
                ->first();

            if ($existingPayroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll already exists for this worker and month'
                ], 400);
            }

            // Use worker's payroll settings or request values as fallback
            $hourlyRate = $worker->hourly_rate ?? $request->hourly_rate ?? 5.00;
            $overtimeRate = $worker->overtime_rate ?? $request->overtime_rate ?? 7.50;
            $standardHoursPerDay = $worker->standard_hours_per_day ?? 8;
            $enableOvertime = $worker->enable_overtime ?? true;
            $enableBonus = $worker->enable_bonus ?? true;
            $bonusPercentage = $worker->bonus_percentage ?? 0;

            // Calculate bonus based on worker's bonus percentage if enabled
            $calculatedBonus = $request->bonus ?? 0;
            if ($enableBonus && $bonusPercentage > 0 && ($worker->base_salary || $worker->salary)) {
                $baseSalary = $worker->base_salary ?? $worker->salary ?? 0;
                $calculatedBonus += ($baseSalary * $bonusPercentage / 100);
            }

            // Create new payroll
            $payroll = new Payroll();
            $payroll->worker_id = $request->worker_id;
            $payroll->payroll_number = Payroll::generatePayrollNumber();
            $payroll->payroll_date = $request->payroll_date;
            $payroll->hourly_rate = $hourlyRate;
            $payroll->overtime_rate = $overtimeRate;
            $payroll->bonus = round($calculatedBonus, 2);
            $payroll->deductions = $request->deductions ?? 0;
            $payroll->notes = $request->notes;
            $payroll->status = 'pending';

            // Calculate working hours from attendance
            $startDate = $payrollDate->copy()->startOfMonth();
            $endDate = $payrollDate->copy()->endOfMonth();

            $attendanceRecords = $worker->attendance()
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->get();

            $totalHours = 0;
            $overtimeHours = 0;

            foreach ($attendanceRecords as $record) {
                if ($record->check_in_time && $record->check_out_time) {
                    $checkIn = Carbon::parse($record->check_in_time);
                    $checkOut = Carbon::parse($record->check_out_time);
                    
                    // Subtract break time if exists
                    $breakTime = 0;
                    if ($record->break_start && $record->break_end) {
                        $breakStart = Carbon::parse($record->break_start);
                        $breakEnd = Carbon::parse($record->break_end);
                        $breakTime = $breakEnd->diffInMinutes($breakStart);
                    }
                    
                    $workMinutes = $checkOut->diffInMinutes($checkIn) - $breakTime;
                    $workHours = $workMinutes / 60;
                    
                    $totalHours += $workHours;
                    
                    // Calculate overtime based on worker's standard hours per day
                    if ($enableOvertime && $workHours > $standardHoursPerDay) {
                        $overtimeHours += $workHours - $standardHoursPerDay;
                    }
                }
            }

            $payroll->working_hours = round($totalHours, 2);
            $payroll->overtime_hours = round($overtimeHours, 2);
            
            // Calculate base salary (regular hours only)
            $regularHours = $totalHours - $overtimeHours;
            $payroll->base_salary = round($regularHours * $hourlyRate, 2);
            $payroll->overtime_pay = round($overtimeHours * $overtimeRate, 2);
            $payroll->net_salary = round(
                $payroll->base_salary + 
                $payroll->overtime_pay + 
                $payroll->bonus - 
                $payroll->deductions, 
                2
            );

            $payroll->save();

            return response()->json([
                'success' => true,
                'message' => 'Payroll generated successfully',
                'data' => $payroll->load('worker')
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating payroll: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate payroll for all workers
     */
    public function generateAllPayrolls(Request $request)
    {
        try {
            $request->validate([
                'payroll_date' => 'required|date',
                'hourly_rate' => 'required|numeric|min:0',
                'overtime_rate' => 'required|numeric|min:0',
                'bonus_percentage' => 'nullable|numeric|min:0|max:100',
                'deductions_percentage' => 'nullable|numeric|min:0|max:100'
            ]);

            $payrollDate = Carbon::parse($request->payroll_date);
            $workers = Worker::where('is_active', true)->get();
            $generatedCount = 0;
            $errors = [];

            foreach ($workers as $worker) {
                try {
                    // Check if payroll already exists
                    $existingPayroll = Payroll::where('worker_id', $worker->id)
                        ->whereYear('payroll_date', $payrollDate->year)
                        ->whereMonth('payroll_date', $payrollDate->month)
                        ->first();

                    if ($existingPayroll) {
                        $errors[] = "Payroll already exists for worker: {$worker->name}";
                        continue;
                    }

                    // Calculate bonus and deductions
                    $bonus = 0;
                    $deductions = 0;
                    
                    if ($request->bonus_percentage) {
                        $bonus = ($worker->salary ?? 0) * ($request->bonus_percentage / 100);
                    }
                    
                    if ($request->deductions_percentage) {
                        $deductions = ($worker->salary ?? 0) * ($request->deductions_percentage / 100);
                    }

                    // Create payroll
                    $payroll = new Payroll();
                    $payroll->worker_id = $worker->id;
                    $payroll->payroll_number = Payroll::generatePayrollNumber();
                    $payroll->payroll_date = $request->payroll_date;
                    $payroll->hourly_rate = $request->hourly_rate;
                    $payroll->overtime_rate = $request->overtime_rate;
                    $payroll->bonus = round($bonus, 2);
                    $payroll->deductions = round($deductions, 2);
                    $payroll->status = 'pending';

                    // Calculate working hours from attendance
                    $startDate = $payrollDate->copy()->startOfMonth();
                    $endDate = $payrollDate->copy()->endOfMonth();

                    $attendanceRecords = $worker->attendance()
                        ->whereBetween('attendance_date', [$startDate, $endDate])
                        ->get();

                    $totalHours = 0;
                    $overtimeHours = 0;

                    foreach ($attendanceRecords as $record) {
                        if ($record->check_in_time && $record->check_out_time) {
                            $checkIn = Carbon::parse($record->check_in_time);
                            $checkOut = Carbon::parse($record->check_out_time);
                            
                            $breakTime = 0;
                            if ($record->break_start && $record->break_end) {
                                $breakStart = Carbon::parse($record->break_start);
                                $breakEnd = Carbon::parse($record->break_end);
                                $breakTime = $breakEnd->diffInMinutes($breakStart);
                            }
                            
                            $workMinutes = $checkOut->diffInMinutes($checkIn) - $breakTime;
                            $workHours = $workMinutes / 60;
                            
                            $totalHours += $workHours;
                            
                            if ($workHours > 8) {
                                $overtimeHours += $workHours - 8;
                            }
                        }
                    }

                    $payroll->working_hours = round($totalHours, 2);
                    $payroll->overtime_hours = round($overtimeHours, 2);
                    $payroll->base_salary = round($totalHours * $request->hourly_rate, 2);
                    $payroll->overtime_pay = round($overtimeHours * $request->overtime_rate, 2);
                    $payroll->net_salary = round(
                        $payroll->base_salary + 
                        $payroll->overtime_pay + 
                        $payroll->bonus - 
                        $payroll->deductions, 
                        2
                    );

                    $payroll->save();
                    $generatedCount++;

                } catch (\Exception $e) {
                    $errors[] = "Error generating payroll for {$worker->name}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Generated {$generatedCount} payroll records",
                'data' => [
                    'generated_count' => $generatedCount,
                    'errors' => $errors
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating all payrolls: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payrolls',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payroll status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,paid,cancelled',
                'payment_date' => 'nullable|date'
            ]);

            $payroll = Payroll::findOrFail($id);
            $payroll->status = $request->status;
            
            if ($request->status === 'paid' && $request->payment_date) {
                $payroll->payment_date = $request->payment_date;
            }

            $payroll->save();

            return response()->json([
                'success' => true,
                'message' => 'Payroll status updated successfully',
                'data' => $payroll->load('worker')
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating payroll status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payroll status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete payroll record
     */
    public function destroy($id)
    {
        try {
            $payroll = Payroll::findOrFail($id);
            $payroll->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payroll deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting payroll: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get workers for payroll generation (from local database only)
     */
    public function getWorkers()
    {
        try {
            // Get workers from local database only (synced from biometric)
            $workers = Worker::where('is_active', true)
                ->where('payroll_status', 'active')
                ->select(
                    'id', 
                    'name', 
                    'role', 
                    'department', 
                    'salary',
                    'base_salary',
                    'hourly_rate',
                    'overtime_rate',
                    'standard_hours_per_day',
                    'enable_overtime',
                    'enable_bonus',
                    'bonus_percentage',
                    'biometric_id',
                    'employee_code'
                )
                ->get()
                ->map(function ($worker) {
                    return [
                        'id' => $worker->id,
                        'name' => $worker->name,
                        'role' => $worker->role,
                        'department' => $worker->department,
                        'salary' => $worker->salary,
                        'base_salary' => $worker->base_salary,
                        'hourly_rate' => $worker->hourly_rate ?? 5.00,
                        'overtime_rate' => $worker->overtime_rate ?? 7.50,
                        'standard_hours_per_day' => $worker->standard_hours_per_day ?? 8,
                        'enable_overtime' => $worker->enable_overtime ?? true,
                        'enable_bonus' => $worker->enable_bonus ?? true,
                        'bonus_percentage' => $worker->bonus_percentage ?? 0,
                        'biometric_id' => $worker->biometric_id,
                        'employee_code' => $worker->employee_code,
                        'source' => $worker->biometric_id ? 'biometric_synced' : 'local'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $workers,
                'total' => $workers->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching workers for payroll: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch workers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 