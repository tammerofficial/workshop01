<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class ErrorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'error_id',
        'type',
        'message',
        'file',
        'line',
        'code',
        'url',
        'method',
        'ip',
        'user_id',
        'severity',
        'context',
        'stack_trace',
        'resolved',
        'resolution_notes',
        'resolved_at',
    ];

    protected $casts = [
        'context' => 'array',
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'resolved' => false,
        'severity' => 'medium',
    ];

    /**
     * Get the user that caused this error
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for unresolved errors
     */
    public function scopeUnresolved($query)
    {
        return $query->where('resolved', false);
    }

    /**
     * Scope for resolved errors
     */
    public function scopeResolved($query)
    {
        return $query->where('resolved', true);
    }

    /**
     * Scope for critical errors
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /**
     * Scope for errors by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope for errors in date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for today's errors
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', Carbon::today());
    }

    /**
     * Scope for recent errors
     */
    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>=', Carbon::now()->subHours($hours));
    }

    /**
     * Get formatted error type (without namespace)
     */
    protected function shortType(): Attribute
    {
        return Attribute::make(
            get: fn () => class_basename($this->type)
        );
    }

    /**
     * Get human-readable time since error occurred
     */
    protected function timeAgo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at->diffForHumans()
        );
    }

    /**
     * Get severity color for UI
     */
    protected function severityColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match($this->severity) {
                'critical' => '#DC2626',
                'high' => '#EA580C',
                'medium' => '#D97706',
                'low' => '#059669',
                default => '#6B7280',
            }
        );
    }

    /**
     * Get severity icon
     */
    protected function severityIcon(): Attribute
    {
        return Attribute::make(
            get: fn () => match($this->severity) {
                'critical' => '🚨',
                'high' => '🔴',
                'medium' => '⚠️',
                'low' => '🔵',
                default => '❓',
            }
        );
    }

    /**
     * Check if error is recent (within last hour)
     */
    protected function isRecent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at->isAfter(Carbon::now()->subHour())
        );
    }

    /**
     * Get error location (file:line)
     */
    protected function location(): Attribute
    {
        return Attribute::make(
            get: fn () => basename($this->file) . ':' . $this->line
        );
    }

    /**
     * Get truncated message for display
     */
    protected function shortMessage(): Attribute
    {
        return Attribute::make(
            get: fn () => \Str::limit($this->message, 100)
        );
    }

    /**
     * Mark error as resolved
     */
    public function markAsResolved(string $notes = null): bool
    {
        return $this->update([
            'resolved' => true,
            'resolved_at' => now(),
            'resolution_notes' => $notes,
        ]);
    }

    /**
     * Mark error as unresolved
     */
    public function markAsUnresolved(): bool
    {
        return $this->update([
            'resolved' => false,
            'resolved_at' => null,
            'resolution_notes' => null,
        ]);
    }

    /**
     * Get similar errors (same type and file)
     */
    public function getSimilarErrors($limit = 10)
    {
        return static::where('type', $this->type)
            ->where('file', $this->file)
            ->where('id', '!=', $this->id)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get error statistics for a date range
     */
    public static function getStatistics($startDate = null, $endDate = null): array
    {
        $query = static::query();
        
        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $errors = $query->get();

        return [
            'total' => $errors->count(),
            'by_severity' => $errors->countBy('severity'),
            'by_type' => $errors->countBy(fn($error) => class_basename($error->type)),
            'resolved_count' => $errors->where('resolved', true)->count(),
            'unresolved_count' => $errors->where('resolved', false)->count(),
            'resolution_rate' => $errors->count() > 0 
                ? round($errors->where('resolved', true)->count() / $errors->count() * 100, 1) 
                : 100,
            'critical_errors' => $errors->where('severity', 'critical')->count(),
            'recent_errors' => $errors->where('created_at', '>=', Carbon::now()->subHours(24))->count(),
        ];
    }

    /**
     * Get trending error types
     */
    public static function getTrendingErrors($days = 7, $limit = 10): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        return static::where('created_at', '>=', $startDate)
            ->selectRaw('type, COUNT(*) as count, MAX(created_at) as latest_occurrence')
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->map(function ($error) {
                return [
                    'type' => class_basename($error->type),
                    'full_type' => $error->type,
                    'count' => $error->count,
                    'latest_occurrence' => $error->latest_occurrence,
                ];
            })
            ->toArray();
    }

    /**
     * Clean up old resolved errors
     */
    public static function cleanupOldErrors($days = 30): int
    {
        $cutoffDate = Carbon::now()->subDays($days);
        
        return static::where('resolved', true)
            ->where('created_at', '<', $cutoffDate)
            ->delete();
    }
}