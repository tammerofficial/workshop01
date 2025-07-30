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
    public function getBiometricWorkers(Request $request)
    {
        try {
            $pageSize = $request->input('page_size', 50);
            $employeeResponse = $this->biometricService->getEmployees($pageSize);
            
            if (empty($employeeResponse) || empty($employeeResponse['data'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No employees found in biometric system'
                ], 404);
            }

            // Transform biometric employees to our worker format
            $workers = [];
            foreach ($employeeResponse['data'] as $employee) {
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
            
            return response()->json([
                'data' => $workers,
                'next' => $employeeResponse['next'],
                'previous' => $employeeResponse['previous'],
                'count' => $employeeResponse['count'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting biometric workers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance directly from biometric system
     */
    public function getBiometricAttendance(Request $request)
    {
        try {
            // Get attendance transactions from biometric system
            $transactions = $this->biometricService->getAttendanceTransactions();
            
            if (empty($transactions)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No attendance records found'
                ]);
            }

            // Get filters from request
            $startDate = $request->get('start_date', now()->subDays(30)->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->format('Y-m-d'));
            $workerId = $request->get('worker_id');

            // Transform transactions to attendance format
            $attendanceData = [];
            foreach ($transactions as $transaction) {
                $punchTime = \Carbon\Carbon::parse($transaction['punch_time']);
                
                // Apply date filter
                if ($punchTime->format('Y-m-d') < $startDate || $punchTime->format('Y-m-d') > $endDate) {
                    continue;
                }

                // Apply worker filter
                if ($workerId && $transaction['emp_id'] != $workerId) {
                    continue;
                }

                $attendanceData[] = [
                    'id' => $transaction['id'],
                    'worker_id' => $transaction['emp_id'],
                    'worker_name' => $transaction['emp_name'] ?? 'Unknown',
                    'employee_code' => $transaction['emp_code'] ?? null,
                    'punch_time' => $punchTime->format('Y-m-d H:i:s'),
                    'punch_state' => $transaction['punch_state'], // 0=Check In, 1=Check Out, etc.
                    'punch_state_display' => $this->getPunchStateDisplay($transaction['punch_state']),
                    'verification_type' => $transaction['verification_type'] ?? null,
                    'terminal_alias' => $transaction['terminal_alias'] ?? null,
                    'date' => $punchTime->format('Y-m-d'),
                    'time' => $punchTime->format('H:i:s'),
                    'day_of_week' => $punchTime->format('l'),
                    'is_late' => $punchTime->format('H:i') > '08:00' && $transaction['punch_state'] == 0,
                    'biometric_data' => $transaction
                ];
            }

            // Sort by punch time (most recent first)
            usort($attendanceData, function($a, $b) {
                return strtotime($b['punch_time']) - strtotime($a['punch_time']);
            });

            // Calculate statistics
            $stats = $this->calculateAttendanceStats($attendanceData);

            return response()->json([
                'success' => true,
                'data' => $attendanceData,
                'stats' => $stats,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'worker_id' => $workerId
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting biometric attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get punch state display text
     */
    private function getPunchStateDisplay($punchState)
    {
        $states = [
            0 => 'Check In',
            1 => 'Check Out',
            2 => 'Break Start',
            3 => 'Break End',
            4 => 'Overtime Start',
            5 => 'Overtime End'
        ];
        
        return $states[$punchState] ?? 'Unknown';
    }

    /**
     * Calculate attendance statistics
     */
    private function calculateAttendanceStats($attendanceData)
    {
        $totalRecords = count($attendanceData);
        $uniqueWorkers = count(array_unique(array_column($attendanceData, 'worker_id')));
        $uniqueDates = count(array_unique(array_column($attendanceData, 'date')));
        
        // Group by worker and date to calculate working hours
        $dailyHours = [];
        $grouped = [];
        
        foreach ($attendanceData as $record) {
            $key = $record['worker_id'] . '_' . $record['date'];
            if (!isset($grouped[$key])) {
                $grouped[$key] = [];
            }
            $grouped[$key][] = $record;
        }

        $totalHours = 0;
        foreach ($grouped as $dayRecords) {
            $checkIn = null;
            $checkOut = null;
            
            foreach ($dayRecords as $record) {
                if ($record['punch_state'] == 0) { // Check In
                    $checkIn = $record['punch_time'];
                }
                if ($record['punch_state'] == 1) { // Check Out
                    $checkOut = $record['punch_time'];
                }
            }
            
            if ($checkIn && $checkOut) {
                $hours = (strtotime($checkOut) - strtotime($checkIn)) / 3600;
                $totalHours += $hours;
                $dailyHours[] = $hours;
            }
        }

        $avgHoursPerDay = count($dailyHours) > 0 ? array_sum($dailyHours) / count($dailyHours) : 0;

        return [
            'total_records' => $totalRecords,
            'total_workers' => $uniqueWorkers,
            'total_days' => $uniqueDates,
            'total_hours' => round($totalHours, 2),
            'avg_hours_per_day' => round($avgHoursPerDay, 2),
            'check_ins' => count(array_filter($attendanceData, fn($r) => $r['punch_state'] == 0)),
            'check_outs' => count(array_filter($attendanceData, fn($r) => $r['punch_state'] == 1)),
            'late_arrivals' => count(array_filter($attendanceData, fn($r) => $r['is_late']))
        ];
    }

    /**
     * Get areas from biometric system
     */
    public function getAreas()
    {
        try {
            $areas = $this->biometricService->getAreas();
            
            return response()->json([
                'success' => true,
                'data' => $areas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting areas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get departments from biometric system
     */
    public function getDepartments()
    {
        try {
            $departments = $this->biometricService->getDepartments();
            
            return response()->json([
                'success' => true,
                'data' => $departments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting departments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get positions from biometric system
     */
    public function getPositions()
    {
        try {
            $positions = $this->biometricService->getPositions();
            
            return response()->json([
                'success' => true,
                'data' => $positions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting positions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create employee in biometric system
     */
    public function createEmployee(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'emp_code' => 'required|string|max:50',
                'first_name' => 'required|string|max:100',
                'last_name' => 'nullable|string|max:100',
                'department' => 'required|integer',
                'area' => 'required|array',
                'area.*' => 'integer',
                'email' => 'nullable|email|max:100',
                'mobile' => 'nullable|string|max:20',
                'hire_date' => 'nullable|date',
                'position' => 'nullable|integer'
            ]);

            // Prepare data for biometric system
            $employeeData = [
                'emp_code' => $request->emp_code,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'department' => $request->department,
                'area' => $request->area,
                'email' => $request->email,
                'mobile' => $request->mobile,
                'hire_date' => $request->hire_date ?: now()->format('Y-m-d'),
                'position' => $request->position
            ];

            $response = $this->biometricService->createEmployee($employeeData);
            
            return response()->json([
                'success' => true,
                'data' => $response,
                'message' => 'Employee created successfully in biometric system'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update employee in biometric system
     */
    public function updateEmployee(Request $request, $id)
    {
        try {
            // Validate request
            $request->validate([
                'emp_code' => 'sometimes|required|string|max:50',
                'first_name' => 'sometimes|required|string|max:100',
                'last_name' => 'nullable|string|max:100',
                'department' => 'sometimes|required|integer',
                'area' => 'sometimes|required|array',
                'area.*' => 'integer',
                'email' => 'nullable|email|max:100',
                'mobile' => 'nullable|string|max:20',
                'hire_date' => 'nullable|date',
                'position' => 'nullable|integer'
            ]);

            // Prepare data for biometric system
            $employeeData = $request->only([
                'emp_code', 'first_name', 'last_name', 'department', 
                'area', 'email', 'mobile', 'hire_date', 'position'
            ]);

            $response = $this->biometricService->updateEmployee($id, $employeeData);
            
            return response()->json([
                'success' => true,
                'data' => $response,
                'message' => 'Employee updated successfully in biometric system'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete employee from biometric system
     */
    public function deleteEmployee($id)
    {
        try {
            $result = $this->biometricService->deleteEmployee($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully from biometric system'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single employee from biometric system
     */
    public function getEmployee($id)
    {
        try {
            $employee = $this->biometricService->getEmployee($id);
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting employee: ' . $e->getMessage()
            ], 500);
        }
    }
}