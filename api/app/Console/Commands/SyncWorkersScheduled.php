<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BiometricAutoRegistrationService;
use App\Models\Worker;
use Illuminate\Support\Facades\Log;

class SyncWorkersScheduled extends Command
{
    protected $signature = 'workers:sync-scheduled {--force : Force sync even if biometric API is unavailable}';
    protected $description = 'Scheduled synchronization of all workers from biometric API to local database';

    public function handle()
    {
        $this->info('🔄 Starting scheduled worker synchronization...');
        
        try {
            $autoRegistrationService = new BiometricAutoRegistrationService();
            
            // Step 1: Auto-register/update all workers from biometric API
            $this->info('📥 Syncing workers from biometric API...');
            $result = $autoRegistrationService->registerAllBiometricEmployees();
            
            if ($result['success']) {
                $this->info("✅ Successfully synced {$result['total_processed']} workers:");
                $this->line("   • Registered: {$result['registered']} new workers");
                $this->line("   • Updated: {$result['updated']} existing workers");
                
                if (!empty($result['errors'])) {
                    $this->warn("⚠️  Some workers had issues:");
                    foreach (array_slice($result['errors'], 0, 5) as $error) {
                        $this->line("   • {$error}");
                    }
                    if (count($result['errors']) > 5) {
                        $this->line("   • ... and " . (count($result['errors']) - 5) . " more errors");
                    }
                }
            } else {
                $this->error("❌ Sync failed: {$result['message']}");
                return 1;
            }
            
            // Step 2: Update statistics
            $totalWorkers = Worker::count();
            $connectedWorkers = Worker::whereNotNull('user_id')->count();
            $activeWorkers = Worker::where('is_active', true)->count();
            
            $this->info('📊 Current Statistics:');
            $this->line("   • Total workers: {$totalWorkers}");
            $this->line("   • Connected to users: {$connectedWorkers}");
            $this->line("   • Active workers: {$activeWorkers}");
            
            // Log the sync for monitoring
            Log::info('Scheduled worker sync completed', [
                'total_workers' => $totalWorkers,
                'connected_workers' => $connectedWorkers,
                'active_workers' => $activeWorkers,
                'registered' => $result['registered'],
                'updated' => $result['updated'],
                'errors_count' => count($result['errors'] ?? [])
            ]);
            
            $this->info('✅ Scheduled worker synchronization completed successfully!');
            return 0;
            
        } catch (\Exception $e) {
            $this->error("❌ Sync failed with error: {$e->getMessage()}");
            Log::error('Scheduled worker sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}