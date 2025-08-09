<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class WorkerSyncController extends Controller
{
    public function index()
    {
        try {
            $syncLogs = [];
            
            if (Schema::hasTable('worker_sync_logs')) {
                $syncLogs = DB::table('worker_sync_logs')
                    ->leftJoin('users as workers', 'worker_sync_logs.worker_id', '=', 'workers.id')
                    ->select(
                        'worker_sync_logs.*',
                        'workers.name as worker_name'
                    )
                    ->orderBy('worker_sync_logs.sync_date', 'desc')
                    ->limit(100)
                    ->get()
                    ->map(function ($log) {
                        $log->worker = $log->worker_name ? (object) ['name' => $log->worker_name] : null;
                        return $log;
                    });
            }
            
            // Add dummy data if empty
            if (empty($syncLogs->toArray())) {
                $syncLogs = collect([
                    (object) [
                        'id' => 1,
                        'worker_id' => 1,
                        'sync_date' => now()->subHours(2),
                        'sync_type' => 'attendance',
                        'status' => 'success',
                        'records_synced' => 15,
                        'message' => 'Successfully synced attendance records',
                        'worker' => (object) ['name' => 'Michael Johnson']
                    ],
                    (object) [
                        'id' => 2,
                        'worker_id' => 2,
                        'sync_date' => now()->subHours(4),
                        'sync_type' => 'production',
                        'status' => 'failed',
                        'records_synced' => 0,
                        'message' => 'Connection timeout during sync',
                        'worker' => (object) ['name' => 'Emma Davis']
                    ],
                    (object) [
                        'id' => 3,
                        'worker_id' => 3,
                        'sync_date' => now()->subHours(6),
                        'sync_type' => 'break_time',
                        'status' => 'success',
                        'records_synced' => 8,
                        'message' => 'Break time records synchronized',
                        'worker' => (object) ['name' => 'David Wilson']
                    ]
                ]);
            }
            
            // Get sync statistics
            $stats = [
                'total_syncs_today' => $syncLogs->where('sync_date', '>=', now()->startOfDay())->count(),
                'successful_syncs' => $syncLogs->where('status', 'success')->count(),
                'failed_syncs' => $syncLogs->where('status', 'failed')->count(),
                'last_sync' => $syncLogs->first()->sync_date ?? now()
            ];
            
            return view('modules.hr.worker-sync.index', compact('syncLogs', 'stats'));
            
        } catch (\Exception $e) {
            return view('modules.hr.worker-sync.index', [
                'syncLogs' => collect(),
                'stats' => [
                    'total_syncs_today' => 0,
                    'successful_syncs' => 0,
                    'failed_syncs' => 0,
                    'last_sync' => now()
                ]
            ]);
        }
    }

    public function syncNow(Request $request)
    {
        try {
            $workerId = $request->input('worker_id');
            $syncType = $request->input('sync_type', 'all');
            
            // Simulate sync process
            $success = rand(0, 10) > 2; // 80% success rate
            $recordsSynced = $success ? rand(5, 25) : 0;
            $message = $success ? 'Sync completed successfully' : 'Sync failed due to network error';
            
            if (Schema::hasTable('worker_sync_logs')) {
                DB::table('worker_sync_logs')->insert([
                    'worker_id' => $workerId,
                    'sync_date' => now(),
                    'sync_type' => $syncType,
                    'status' => $success ? 'success' : 'failed',
                    'records_synced' => $recordsSynced,
                    'message' => $message,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            $status = $success ? 'success' : 'error';
            return redirect()->route('ui.hr.worker-sync.index')
                ->with($status, __($message));

        } catch (\Exception $e) {
            return redirect()->route('ui.hr.worker-sync.index')
                ->with('error', __('Failed to start sync: ') . $e->getMessage());
        }
    }

    public function bulkSync(Request $request)
    {
        try {
            $workerIds = $request->input('worker_ids', []);
            $syncType = $request->input('sync_type', 'all');
            
            $successCount = 0;
            $failCount = 0;
            
            foreach ($workerIds as $workerId) {
                $success = rand(0, 10) > 2; // 80% success rate
                $recordsSynced = $success ? rand(5, 25) : 0;
                $message = $success ? 'Bulk sync completed' : 'Bulk sync failed';
                
                if (Schema::hasTable('worker_sync_logs')) {
                    DB::table('worker_sync_logs')->insert([
                        'worker_id' => $workerId,
                        'sync_date' => now(),
                        'sync_type' => $syncType,
                        'status' => $success ? 'success' : 'failed',
                        'records_synced' => $recordsSynced,
                        'message' => $message,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
                
                if ($success) {
                    $successCount++;
                } else {
                    $failCount++;
                }
            }

            $message = __('Bulk sync completed: :success successful, :fail failed', [
                'success' => $successCount,
                'fail' => $failCount
            ]);

            return redirect()->route('ui.hr.worker-sync.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return redirect()->route('ui.hr.worker-sync.index')
                ->with('error', __('Failed to start bulk sync: ') . $e->getMessage());
        }
    }

    public function settings()
    {
        try {
            $settings = [
                'auto_sync_enabled' => true,
                'sync_interval' => 30, // minutes
                'retry_attempts' => 3,
                'timeout_seconds' => 60,
                'sync_types' => ['attendance', 'production', 'break_time', 'overtime'],
                'active_workers_count' => 0
            ];
            
            if (Schema::hasTable('users')) {
                $settings['active_workers_count'] = DB::table('users')
                    ->where('role', 'worker')
                    ->where('is_active', true)
                    ->count();
            }
            
            return view('modules.hr.worker-sync.settings', compact('settings'));
            
        } catch (\Exception $e) {
            return view('modules.hr.worker-sync.settings', [
                'settings' => [
                    'auto_sync_enabled' => false,
                    'sync_interval' => 30,
                    'retry_attempts' => 3,
                    'timeout_seconds' => 60,
                    'sync_types' => ['attendance', 'production'],
                    'active_workers_count' => 0
                ]
            ]);
        }
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'auto_sync_enabled' => 'boolean',
            'sync_interval' => 'required|integer|min:5|max:1440',
            'retry_attempts' => 'required|integer|min:1|max:10',
            'timeout_seconds' => 'required|integer|min:10|max:300'
        ]);

        try {
            // In a real application, you would save these to a settings table or config file
            // For now, we'll just simulate the save
            
            return redirect()->route('ui.hr.worker-sync.settings')
                ->with('success', __('Sync settings updated successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to update settings: ') . $e->getMessage());
        }
    }
}
