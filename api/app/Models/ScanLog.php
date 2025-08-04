<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScanLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'scan_type',
        'scanned_data',
        'parsed_data',
        'entity_type',
        'entity_id',
        'worker_id',
        'user_id',
        'scan_purpose',
        'scan_successful',
        'action_taken',
        'update_data',
        'error_message',
        'device_type',
        'scanner_model',
        'ip_address',
        'user_agent',
        'location_data',
        'scanned_at'
    ];

    protected $casts = [
        'parsed_data' => 'array',
        'update_data' => 'array',
        'location_data' => 'array',
        'scan_successful' => 'boolean',
        'scanned_at' => 'datetime'
    ];

    /**
     * Relationship with Worker
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * Relationship with User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get related entity (polymorphic)
     */
    public function entity()
    {
        switch ($this->entity_type) {
            case 'product':
                return $this->belongsTo(Product::class, 'entity_id');
            case 'order':
                return $this->belongsTo(Order::class, 'entity_id');
            case 'material':
                return $this->belongsTo(Material::class, 'entity_id');
            case 'production_stage':
                return $this->belongsTo(OrderProductionTracking::class, 'entity_id');
            default:
                return null;
        }
    }

    /**
     * Scope for successful scans
     */
    public function scopeSuccessful($query)
    {
        return $query->where('scan_successful', true);
    }

    /**
     * Scope for failed scans
     */
    public function scopeFailed($query)
    {
        return $query->where('scan_successful', false);
    }

    /**
     * Scope for specific scan type
     */
    public function scopeByScanType($query, string $scanType)
    {
        return $query->where('scan_type', $scanType);
    }

    /**
     * Scope for specific worker
     */
    public function scopeByWorker($query, int $workerId)
    {
        return $query->where('worker_id', $workerId);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate = null)
    {
        $query->whereDate('scanned_at', '>=', $startDate);
        
        if ($endDate) {
            $query->whereDate('scanned_at', '<=', $endDate);
        }
        
        return $query;
    }

    /**
     * Create scan log entry
     */
    public static function logScan(array $data): self
    {
        return self::create([
            'scan_type' => $data['scan_type'],
            'scanned_data' => $data['scanned_data'],
            'parsed_data' => $data['parsed_data'] ?? null,
            'entity_type' => $data['entity_type'] ?? null,
            'entity_id' => $data['entity_id'] ?? null,
            'worker_id' => $data['worker_id'] ?? null,
            'user_id' => $data['user_id'] ?? auth()->id(),
            'scan_purpose' => $data['scan_purpose'] ?? 'information',
            'scan_successful' => $data['scan_successful'] ?? true,
            'action_taken' => $data['action_taken'] ?? null,
            'update_data' => $data['update_data'] ?? null,
            'error_message' => $data['error_message'] ?? null,
            'device_type' => $data['device_type'] ?? 'unknown',
            'scanner_model' => $data['scanner_model'] ?? null,
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'location_data' => $data['location_data'] ?? null,
            'scanned_at' => $data['scanned_at'] ?? now()
        ]);
    }

    /**
     * Get scan statistics
     */
    public static function getStatistics(array $filters = []): array
    {
        $query = self::query();
        
        // Apply filters
        if (isset($filters['start_date'])) {
            $query->whereDate('scanned_at', '>=', $filters['start_date']);
        }
        
        if (isset($filters['end_date'])) {
            $query->whereDate('scanned_at', '<=', $filters['end_date']);
        }
        
        if (isset($filters['worker_id'])) {
            $query->where('worker_id', $filters['worker_id']);
        }
        
        if (isset($filters['scan_type'])) {
            $query->where('scan_type', $filters['scan_type']);
        }

        $total = $query->count();
        $successful = $query->where('scan_successful', true)->count();
        $failed = $query->where('scan_successful', false)->count();
        
        // Scan type breakdown
        $scanTypes = self::selectRaw('scan_type, COUNT(*) as count')
            ->groupBy('scan_type')
            ->pluck('count', 'scan_type')
            ->toArray();
        
        // Purpose breakdown
        $purposes = self::selectRaw('scan_purpose, COUNT(*) as count')
            ->groupBy('scan_purpose')
            ->pluck('count', 'scan_purpose')
            ->toArray();
        
        // Hourly activity (last 24 hours)
        $hourlyActivity = self::selectRaw('HOUR(scanned_at) as hour, COUNT(*) as count')
            ->where('scanned_at', '>=', now()->subDay())
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
        
        return [
            'total_scans' => $total,
            'successful_scans' => $successful,
            'failed_scans' => $failed,
            'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 0,
            'scan_types' => $scanTypes,
            'scan_purposes' => $purposes,
            'hourly_activity' => $hourlyActivity,
            'most_active_workers' => self::getMostActiveWorkers(5),
            'most_scanned_entities' => self::getMostScannedEntities(5)
        ];
    }

    /**
     * Get most active workers
     */
    public static function getMostActiveWorkers(int $limit = 10): array
    {
        return self::join('workers', 'scan_logs.worker_id', '=', 'workers.id')
            ->selectRaw('workers.name, workers.id, COUNT(*) as scan_count')
            ->whereNotNull('worker_id')
            ->groupBy('workers.id', 'workers.name')
            ->orderByDesc('scan_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get most scanned entities
     */
    public static function getMostScannedEntities(int $limit = 10): array
    {
        return self::selectRaw('entity_type, entity_id, COUNT(*) as scan_count')
            ->whereNotNull('entity_type')
            ->whereNotNull('entity_id')
            ->groupBy('entity_type', 'entity_id')
            ->orderByDesc('scan_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}