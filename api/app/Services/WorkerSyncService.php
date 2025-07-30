<?php

namespace App\Services;

use App\Models\Worker;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WorkerSyncService
{
    protected $biometricService;

    public function __construct(BiometricService $biometricService)
    {
        $this->biometricService = $biometricService;
    }

    /**
     * Sync workers from biometric API to local database
     */
    public function syncWorkers()
    {
        try {
            Log::info('Starting worker sync from biometric API...');
            
            // Get workers from biometric API
            $biometricResponse = $this->biometricService->getEmployees(100);
            
            if (!$biometricResponse || !isset($biometricResponse['data'])) {
                Log::warning('No biometric data received');
                return [
                    'success' => false,
                    'message' => 'No biometric data received',
                    'synced' => 0,
                    'updated' => 0,
                    'created' => 0
                ];
            }

            $biometricWorkers = $biometricResponse['data'];
            $synced = 0;
            $updated = 0;
            $created = 0;

            foreach ($biometricWorkers as $biometricWorker) {
                try {
                    $result = $this->syncWorker($biometricWorker);
                    
                    if ($result['action'] === 'created') {
                        $created++;
                    } elseif ($result['action'] === 'updated') {
                        $updated++;
                    }
                    
                    $synced++;
                } catch (\Exception $e) {
                    Log::error('Error syncing worker: ' . $e->getMessage(), [
                        'worker' => $biometricWorker['id'] ?? 'unknown'
                    ]);
                }
            }

            Log::info('Worker sync completed', [
                'total_synced' => $synced,
                'created' => $created,
                'updated' => $updated
            ]);

            return [
                'success' => true,
                'message' => 'Worker sync completed successfully',
                'synced' => $synced,
                'created' => $created,
                'updated' => $updated
            ];

        } catch (\Exception $e) {
            Log::error('Error in worker sync: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error syncing workers: ' . $e->getMessage(),
                'synced' => 0,
                'updated' => 0,
                'created' => 0
            ];
        }
    }

    /**
     * Sync a single worker from biometric data
     */
    public function syncWorker($biometricWorker)
    {
        $biometricId = $biometricWorker['id'] ?? null;
        $employeeCode = $biometricWorker['emp_code'] ?? null;

        if (!$biometricId) {
            throw new \Exception('Biometric ID is required');
        }

        // Try to find existing worker by biometric_id or employee_code
        $worker = Worker::where('biometric_id', $biometricId)
            ->orWhere('employee_code', $employeeCode)
            ->first();

        $workerData = $this->prepareWorkerData($biometricWorker);

        if ($worker) {
            // Update existing worker
            $worker->update($workerData);
            Log::info('Updated worker', ['id' => $worker->id, 'name' => $worker->name]);
            
            return [
                'action' => 'updated',
                'worker' => $worker
            ];
        } else {
            // Create new worker
            $worker = Worker::create($workerData);
            Log::info('Created new worker', ['id' => $worker->id, 'name' => $worker->name]);
            
            return [
                'action' => 'created',
                'worker' => $worker
            ];
        }
    }

    /**
     * Prepare worker data from biometric API response
     */
    protected function prepareWorkerData($biometricWorker)
    {
        // Handle name
        $name = $biometricWorker['full_name'] ?? 
                trim(($biometricWorker['first_name'] ?? '') . ' ' . ($biometricWorker['last_name'] ?? ''));

        // Handle role/position
        $role = 'Worker';
        if (isset($biometricWorker['role']) && is_string($biometricWorker['role'])) {
            $role = $biometricWorker['role'];
        } elseif (isset($biometricWorker['role']) && is_array($biometricWorker['role']) && isset($biometricWorker['role']['position_name'])) {
            $role = $biometricWorker['role']['position_name'];
        } elseif (isset($biometricWorker['position']) && is_array($biometricWorker['position']) && isset($biometricWorker['position']['position_name'])) {
            $role = $biometricWorker['position']['position_name'];
        }

        // Handle department
        $department = 'Unknown';
        if (isset($biometricWorker['department']) && is_string($biometricWorker['department'])) {
            $department = $biometricWorker['department'];
        } elseif (isset($biometricWorker['department']) && is_array($biometricWorker['department']) && isset($biometricWorker['department']['dept_name'])) {
            $department = $biometricWorker['department']['dept_name'];
        }

        // Handle hire date
        $hireDate = null;
        if (isset($biometricWorker['hire_date'])) {
            try {
                $hireDate = Carbon::parse($biometricWorker['hire_date'])->toDateString();
            } catch (\Exception $e) {
                $hireDate = Carbon::now()->toDateString();
            }
        }

        return [
            'name' => $name,
            'email' => $biometricWorker['email'] ?? null,
            'phone' => $biometricWorker['mobile'] ?? $biometricWorker['contact_tel'] ?? null,
            'role' => $role,
            'department' => $department,
            'hire_date' => $hireDate ?? Carbon::now()->toDateString(),
            'is_active' => true,
            'biometric_id' => $biometricWorker['id'],
            'employee_code' => $biometricWorker['emp_code'] ?? null,
            'biometric_data' => $biometricWorker,
            'payroll_status' => 'active',
            
            // Default payroll values (can be updated manually)
            'base_salary' => null,
            'hourly_rate' => 5.00, // Default hourly rate
            'overtime_rate' => 7.50, // Default overtime rate (1.5x hourly rate)
            'standard_hours_per_day' => 8,
            'standard_hours_per_week' => 40,
            'standard_hours_per_month' => 160,
            'enable_overtime' => true,
            'enable_bonus' => true,
            'bonus_percentage' => 0,
        ];
    }

    /**
     * Get sync status
     */
    public function getSyncStatus()
    {
        $totalWorkers = Worker::count();
        $biometricWorkers = Worker::whereNotNull('biometric_id')->count();
        $localWorkers = Worker::whereNull('biometric_id')->count();
        $activeWorkers = Worker::where('is_active', true)->count();

        return [
            'total_workers' => $totalWorkers,
            'biometric_workers' => $biometricWorkers,
            'local_workers' => $localWorkers,
            'active_workers' => $activeWorkers,
            'last_sync' => $this->getLastSyncTime()
        ];
    }

    /**
     * Get last sync time
     */
    protected function getLastSyncTime()
    {
        // You can store this in cache or database
        return cache('last_worker_sync_time');
    }

    /**
     * Set last sync time
     */
    protected function setLastSyncTime()
    {
        cache(['last_worker_sync_time' => Carbon::now()], 60 * 24 * 7); // 7 days
    }

    /**
     * Get specific worker from biometric API
     */
    public function getBiometricWorker($biometricId)
    {
        try {
            $response = $this->biometricService->getEmployee($biometricId);
            return $response['data'] ?? null;
        } catch (\Exception $e) {
            Log::error('Error getting biometric worker: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Clean up inactive workers
     */
    public function cleanupInactiveWorkers()
    {
        // Mark workers as inactive if they haven't been updated recently
        $cutoffDate = Carbon::now()->subMonths(3);
        
        $inactiveCount = Worker::where('updated_at', '<', $cutoffDate)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        Log::info('Marked workers as inactive', ['count' => $inactiveCount]);
        
        return $inactiveCount;
    }
} 