<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Worker;
use Illuminate\Support\Facades\Log;

class CleanupLocalWorkers extends Command
{
    protected $signature = 'workers:cleanup-local {--confirm : Skip confirmation prompt}';
    protected $description = 'Remove all local workers that are not from biometric API';

    public function handle()
    {
        $this->info('🧹 Starting cleanup of local-only workers...');
        
        // Get statistics before cleanup
        $totalWorkers = Worker::count();
        $biometricWorkers = Worker::whereNotNull('biometric_id')->count();
        $localOnlyWorkers = Worker::whereNull('biometric_id')->count();
        
        $this->info('📊 Current Statistics:');
        $this->line("   • Total workers: {$totalWorkers}");
        $this->line("   • Workers from biometric API: {$biometricWorkers}");
        $this->line("   • Local-only workers: {$localOnlyWorkers}");
        
        if ($localOnlyWorkers === 0) {
            $this->info('✅ No local-only workers found. Nothing to cleanup.');
            return 0;
        }
        
        // Confirmation prompt unless --confirm flag is used
        if (!$this->option('confirm')) {
            if (!$this->confirm("⚠️  This will delete {$localOnlyWorkers} local-only workers. Are you sure?")) {
                $this->info('❌ Cleanup cancelled.');
                return 1;
            }
        }
        
        try {
            // Delete local-only workers (those without biometric_id)
            $deletedCount = Worker::whereNull('biometric_id')->delete();
            
            $this->info("✅ Successfully deleted {$deletedCount} local-only workers");
            
            // Get statistics after cleanup
            $totalWorkersAfter = Worker::count();
            $biometricWorkersAfter = Worker::whereNotNull('biometric_id')->count();
            
            $this->info('📊 Statistics after cleanup:');
            $this->line("   • Total workers: {$totalWorkersAfter}");
            $this->line("   • Workers from biometric API: {$biometricWorkersAfter}");
            
            // Log the cleanup for monitoring
            Log::info('Local workers cleanup completed', [
                'deleted_count' => $deletedCount,
                'remaining_workers' => $totalWorkersAfter,
                'biometric_workers' => $biometricWorkersAfter
            ]);
            
            $this->info('✅ Cleanup completed successfully!');
            return 0;
            
        } catch (\Exception $e) {
            $this->error("❌ Cleanup failed: {$e->getMessage()}");
            Log::error('Local workers cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}