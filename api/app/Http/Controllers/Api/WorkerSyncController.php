<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WorkerSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WorkerSyncController extends Controller
{
    protected $workerSyncService;

    public function __construct(WorkerSyncService $workerSyncService)
    {
        $this->workerSyncService = $workerSyncService;
    }

    /**
     * Sync workers from biometric API
     */
    public function syncWorkers()
    {
        try {
            $result = $this->workerSyncService->syncWorkers();

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => [
                    'synced' => $result['synced'],
                    'created' => $result['created'],
                    'updated' => $result['updated']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in worker sync controller: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error syncing workers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sync status
     */
    public function getSyncStatus()
    {
        try {
            $status = $this->workerSyncService->getSyncStatus();

            return response()->json([
                'success' => true,
                'data' => $status
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting sync status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error getting sync status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clean up inactive workers
     */
    public function cleanupInactiveWorkers()
    {
        try {
            $inactiveCount = $this->workerSyncService->cleanupInactiveWorkers();

            return response()->json([
                'success' => true,
                'message' => 'Cleanup completed successfully',
                'data' => [
                    'inactive_count' => $inactiveCount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in cleanup: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error during cleanup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Force sync specific worker
     */
    public function syncSpecificWorker(Request $request)
    {
        try {
            $request->validate([
                'biometric_id' => 'required|integer'
            ]);

            // Get specific worker from biometric API
            $biometricWorker = $this->workerSyncService->getBiometricWorker($request->biometric_id);
            
            if (!$biometricWorker) {
                return response()->json([
                    'success' => false,
                    'message' => 'Worker not found in biometric system'
                ], 404);
            }

            $result = $this->workerSyncService->syncWorker($biometricWorker);

            return response()->json([
                'success' => true,
                'message' => 'Worker synced successfully',
                'data' => [
                    'action' => $result['action'],
                    'worker' => $result['worker']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error syncing specific worker: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error syncing worker: ' . $e->getMessage()
            ], 500);
        }
    }
}
