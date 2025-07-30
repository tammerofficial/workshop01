<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\BiometricService;
use App\Models\Worker;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BiometricController extends Controller
{
    protected $biometricService;

    public function __construct(BiometricService $biometricService)
    {
        $this->biometricService = $biometricService;
    }

    /**
     * Sync workers with biometric system
     */
    public function syncWorkers()
    {
        try {
            $employees = $this->biometricService->getEmployees();
            
            if (empty($employees)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No employees found in biometric system'
                ], 404);
            }
            
            $syncedCount = 0;
            $errors = [];
            
            DB::beginTransaction();
            
            foreach ($employees as $employee) {
                try {
                    // Check if worker already exists by biometric_id
                    $worker = Worker::where('biometric_id', $employee['id'])->first();
                    
                    // If not found by biometric_id, try by employee_code
                    if (!$worker && isset($employee['emp_code'])) {
                        $worker = Worker::where('employee_code', $employee['emp_code'])->first();
                    }
                    
                    // If still not found, try by email
                    if (!$worker && isset($employee['email']) && !empty($employee['email'])) {
                        $worker = Worker::where('email', $employee['email'])->first();
                    }
                    
                    // If still not found, try by name (less reliable)
                    if (!$worker) {
                        $fullName = $employee['first_name'] . ' ' . $employee['last_name'];
                        $worker = Worker::where('name', 'like', '%' . $fullName . '%')->first();
                    }
                    
                    $workerData = $this->biometricService->mapEmployeeToWorker($employee);
                    
                    if ($worker) {
                        // Update existing worker
                        $worker->update([
                            'biometric_id' => $employee['id'],
                            'employee_code' => $employee['emp_code'] ?? null,
                            'biometric_data' => $employee
                        ]);
                    } else {
                        // Create new worker using mapped data
                        Worker::create($workerData);
                    }
                    
                    $syncedCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee' => $employee['id'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ];
                    Log::error('Error syncing worker: ' . $e->getMessage(), [
                        'employee' => $employee
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Synced $syncedCount workers successfully",
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in syncWorkers: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error syncing workers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync attendance data from biometric system
     */
    public function syncAttendance(Request $request)
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->subDays(7)->format('Y-m-d'));
            $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
            $workerId = $request->input('worker_id');
            
            $transactions = [];
            
            if ($workerId) {
                $worker = Worker::find($workerId);
                
                if (!$worker || !$worker->biometric_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Worker not found or not linked to biometric system'
                    ], 404);
                }
                
                $transactions = $this->biometricService->getEmployeeAttendance(
                    $worker->employee_code ?? $worker->biometric_id,
                    $startDate,
                    $endDate
                );
            } else {
                $transactions = $this->biometricService->getAttendanceTransactions($startDate, $endDate);
            }
            
            if (empty($transactions)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No attendance records found for the specified period'
                ], 404);
            }
            
            $syncedCount = 0;
            $errors = [];
            
            DB::beginTransaction();
            
            foreach ($transactions as $transaction) {
                try {
                    // Find worker by employee_code or biometric_id
                    $worker = null;
                    if (isset($transaction['emp_code'])) {
                        $worker = Worker::where('employee_code', $transaction['emp_code'])->first();
                    }
                    
                    if (!$worker && isset($transaction['employee_id'])) {
                        $worker = Worker::where('biometric_id', $transaction['employee_id'])->first();
                    }
                    
                    if (!$worker) {
                        $errors[] = [
                            'transaction' => $transaction['id'] ?? 'unknown',
                            'error' => 'Worker not found'
                        ];
                        continue;
                    }
                    
                    // Check if transaction already exists
                    $existingAttendance = Attendance::where('biometric_transaction_id', $transaction['id'])->first();
                    
                    if ($existingAttendance) {
                        // Update existing record
                        $existingAttendance->update([
                            'biometric_data' => $transaction,
                            'punch_state' => $transaction['punch_state'] ?? null,
                            'verification_type' => $transaction['verification_type'] ?? null,
                            'terminal_alias' => $transaction['terminal_alias'] ?? null,
                        ]);
                    } else {
                        // Create new attendance record
                        $punchTime = Carbon::parse($transaction['punch_time']);
                        $punchState = $transaction['punch_state'] ?? '';
                        
                        $attendanceData = [
                            'worker_id' => $worker->id,
                            'attendance_date' => $punchTime->format('Y-m-d'),
                            'device_id' => $transaction['terminal_id'] ?? null,
                            'biometric_transaction_id' => $transaction['id'],
                            'biometric_data' => $transaction,
                            'punch_state' => $transaction['punch_state'] ?? null,
                            'verification_type' => $transaction['verification_type'] ?? null,
                            'terminal_alias' => $transaction['terminal_alias'] ?? null,
                        ];
                        
                        // Determine if check-in or check-out based on punch state
                        if (strtolower($punchState) === 'in' || $punchState === '0') {
                            $attendanceData['check_in_time'] = $punchTime;
                            $attendanceData['status'] = 'present';
                        } elseif (strtolower($punchState) === 'out' || $punchState === '1') {
                            // Find if there's a check-in record for this day
                            $existingRecord = Attendance::where('worker_id', $worker->id)
                                ->where('attendance_date', $punchTime->format('Y-m-d'))
                                ->whereNotNull('check_in_time')
                                ->whereNull('check_out_time')
                                ->first();
                            
                            if ($existingRecord) {
                                $existingRecord->update([
                                    'check_out_time' => $punchTime,
                                    'biometric_data' => array_merge($existingRecord->biometric_data ?? [], ['check_out' => $transaction])
                                ]);
                                $existingRecord->calculateTotalHours();
                                $existingRecord->save();
                                $syncedCount++;
                                continue;
                            } else {
                                $attendanceData['check_out_time'] = $punchTime;
                                $attendanceData['status'] = 'incomplete';
                            }
                        }
                        
                        Attendance::create($attendanceData);
                    }
                    
                    $syncedCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'transaction' => $transaction['id'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ];
                    Log::error('Error syncing attendance: ' . $e->getMessage(), [
                        'transaction' => $transaction
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Synced $syncedCount attendance records successfully",
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in syncAttendance: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error syncing attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance report
     */
    public function getAttendanceReport(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        $workerId = $request->input('worker_id');
        $groupBy = $request->input('group_by', 'day'); // day, worker, department
        
        $query = Attendance::with('worker')
            ->whereBetween('attendance_date', [$startDate, $endDate]);
            
        if ($workerId) {
            $query->where('worker_id', $workerId);
        }
        
        // Apply grouping
        if ($groupBy === 'day') {
            $report = $query->get()->groupBy('attendance_date');
        } elseif ($groupBy === 'worker') {
            $report = $query->get()->groupBy('worker_id');
        } elseif ($groupBy === 'department') {
            $report = $query->get()->groupBy(function($item) {
                return $item->worker->department ?? 'Unknown';
            });
        } else {
            $report = $query->get();
        }
        
        // Calculate statistics
        $stats = [
            'total_records' => $query->count(),
            'total_workers' => $query->distinct('worker_id')->count('worker_id'),
            'avg_hours_per_day' => $query->avg('total_hours'),
            'total_hours' => $query->sum('total_hours'),
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'report' => $report,
                'stats' => $stats,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'worker_id' => $workerId,
                    'group_by' => $groupBy
                ]
            ]
        ]);
    }

    /**
     * Get worker attendance details
     */
    public function getWorkerAttendance($id, Request $request)
    {
        $worker = Worker::find($id);
        
        if (!$worker) {
            return response()->json([
                'success' => false,
                'message' => 'Worker not found'
            ], 404);
        }
        
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        
        $attendance = Attendance::where('worker_id', $id)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->orderBy('attendance_date', 'desc')
            ->get();
        
        // Calculate statistics
        $stats = [
            'total_days' => $attendance->unique('attendance_date')->count(),
            'present_days' => $attendance->where('status', 'present')->unique('attendance_date')->count(),
            'absent_days' => Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1 - 
                            $attendance->unique('attendance_date')->count(),
            'late_days' => $attendance->where('status', 'late')->unique('attendance_date')->count(),
            'early_departure_days' => $attendance->where('status', 'early_departure')->unique('attendance_date')->count(),
            'total_hours' => $attendance->sum('total_hours'),
            'avg_hours_per_day' => $attendance->avg('total_hours'),
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'worker' => $worker,
                'attendance' => $attendance,
                'stats' => $stats,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]
        ]);
    }

    /**
     * Get biometric token information
     */
    public function getTokenInfo()
    {
        try {
            $tokenInfo = $this->biometricService->getTokenInfo();
            
            return response()->json([
                'success' => true,
                'data' => $tokenInfo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting token info: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get workers directly from biometric system
     */
    public function getBiometricWorkers()
    {
        try {
            $employees = $this->biometricService->getEmployees();
            
            if (empty($employees)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No employees found in biometric system'
                ], 404);
            }

            // Transform biometric employees to our worker format
            $workers = [];
            foreach ($employees as $employee) {
                $workerData = $this->biometricService->mapEmployeeToWorker($employee);
                
                // Add additional biometric specific data
                $workerData['id'] = $employee['id']; // Use biometric ID as primary key
                $workerData['created_at'] = $employee['update_time'] ?? now();
                $workerData['updated_at'] = $employee['update_time'] ?? now();
                $workerData['biometric_enabled'] = true;
                $workerData['fingerprint'] = $employee['fingerprint'] ?? null;
                $workerData['face'] = $employee['face'] ?? null;
                $workerData['palm'] = $employee['palm'] ?? null;
                $workerData['vl_face'] = $employee['vl_face'] ?? null;
                $workerData['tasks'] = []; // Empty for now
                $workerData['orders'] = []; // Empty for now
                
                $workers[] = $workerData;
            }
            
            return response()->json($workers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting biometric workers: ' . $e->getMessage()
            ], 500);
        }
    }
}