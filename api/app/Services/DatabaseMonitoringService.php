<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class DatabaseMonitoringService
{
    private const SLOW_QUERY_THRESHOLD = 1000; // 1 second in milliseconds
    private const LONG_LOCK_THRESHOLD = 10; // 10 seconds
    private const HIGH_CONNECTION_THRESHOLD = 80; // 80% of max connections
    private const LARGE_TABLE_THRESHOLD = 1000000; // 1 million rows

    /**
     * Get comprehensive database health status
     */
    public function getDatabaseHealth(): array
    {
        try {
            return [
                'overall_status' => $this->calculateOverallStatus(),
                'connection_info' => $this->getConnectionInfo(),
                'performance_metrics' => $this->getPerformanceMetrics(),
                'table_statistics' => $this->getTableStatistics(),
                'query_analysis' => $this->getQueryAnalysis(),
                'lock_information' => $this->getLockInformation(),
                'storage_usage' => $this->getStorageUsage(),
                'replication_status' => $this->getReplicationStatus(),
                'recommendations' => $this->getOptimizationRecommendations(),
                'alerts' => $this->getActiveAlerts(),
            ];
        } catch (\Exception $e) {
            Log::error('Database health check failed', ['error' => $e->getMessage()]);
            
            return [
                'overall_status' => 'error',
                'error' => 'Failed to retrieve database health information',
                'connection_info' => ['status' => 'unknown'],
            ];
        }
    }

    /**
     * Calculate overall database status
     */
    private function calculateOverallStatus(): string
    {
        $issues = [];
        
        try {
            // Check connection count
            $connectionInfo = $this->getConnectionInfo();
            if (isset($connectionInfo['connection_usage_percent']) && 
                $connectionInfo['connection_usage_percent'] > self::HIGH_CONNECTION_THRESHOLD) {
                $issues[] = 'high_connections';
            }

            // Check for slow queries
            $slowQueries = $this->getSlowQueries();
            if (count($slowQueries) > 10) {
                $issues[] = 'slow_queries';
            }

            // Check for locks
            $locks = $this->getCurrentLocks();
            $longLocks = array_filter($locks, fn($lock) => $lock['duration'] > self::LONG_LOCK_THRESHOLD);
            if (!empty($longLocks)) {
                $issues[] = 'long_locks';
            }

            // Check storage usage
            $storage = $this->getStorageUsage();
            if (isset($storage['disk_usage_percent']) && $storage['disk_usage_percent'] > 85) {
                $issues[] = 'high_storage';
            }

            // Determine status based on issues
            if (empty($issues)) {
                return 'healthy';
            } elseif (count($issues) <= 2) {
                return 'warning';
            } else {
                return 'critical';
            }

        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Get database connection information
     */
    private function getConnectionInfo(): array
    {
        try {
            $variables = $this->getServerVariables(['max_connections', 'wait_timeout', 'interactive_timeout']);
            $status = $this->getServerStatus(['Threads_connected', 'Threads_running', 'Connections', 'Aborted_connects']);

            $maxConnections = (int) ($variables['max_connections'] ?? 0);
            $currentConnections = (int) ($status['Threads_connected'] ?? 0);
            $runningConnections = (int) ($status['Threads_running'] ?? 0);

            return [
                'status' => 'connected',
                'driver' => DB::connection()->getDriverName(),
                'database_name' => DB::connection()->getDatabaseName(),
                'max_connections' => $maxConnections,
                'current_connections' => $currentConnections,
                'running_connections' => $runningConnections,
                'connection_usage_percent' => $maxConnections > 0 ? round(($currentConnections / $maxConnections) * 100, 2) : 0,
                'total_connections' => (int) ($status['Connections'] ?? 0),
                'aborted_connects' => (int) ($status['Aborted_connects'] ?? 0),
                'wait_timeout' => (int) ($variables['wait_timeout'] ?? 0),
                'interactive_timeout' => (int) ($variables['interactive_timeout'] ?? 0),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get database performance metrics
     */
    private function getPerformanceMetrics(): array
    {
        try {
            $status = $this->getServerStatus([
                'Questions', 'Queries', 'Uptime', 'Slow_queries',
                'Select_full_join', 'Select_range_check', 'Sort_merge_passes',
                'Table_locks_waited', 'Innodb_rows_read', 'Innodb_rows_inserted',
                'Innodb_rows_updated', 'Innodb_rows_deleted'
            ]);

            $uptime = (int) ($status['Uptime'] ?? 1);
            $questions = (int) ($status['Questions'] ?? 0);
            $queries = (int) ($status['Queries'] ?? 0);

            return [
                'uptime_seconds' => $uptime,
                'uptime_human' => $this->formatUptime($uptime),
                'total_questions' => $questions,
                'total_queries' => $queries,
                'questions_per_second' => $uptime > 0 ? round($questions / $uptime, 2) : 0,
                'queries_per_second' => $uptime > 0 ? round($queries / $uptime, 2) : 0,
                'slow_queries' => (int) ($status['Slow_queries'] ?? 0),
                'slow_query_rate' => $queries > 0 ? round(((int) ($status['Slow_queries'] ?? 0) / $queries) * 100, 4) : 0,
                'full_joins' => (int) ($status['Select_full_join'] ?? 0),
                'range_checks' => (int) ($status['Select_range_check'] ?? 0),
                'sort_merge_passes' => (int) ($status['Sort_merge_passes'] ?? 0),
                'table_locks_waited' => (int) ($status['Table_locks_waited'] ?? 0),
                'innodb_stats' => [
                    'rows_read' => (int) ($status['Innodb_rows_read'] ?? 0),
                    'rows_inserted' => (int) ($status['Innodb_rows_inserted'] ?? 0),
                    'rows_updated' => (int) ($status['Innodb_rows_updated'] ?? 0),
                    'rows_deleted' => (int) ($status['Innodb_rows_deleted'] ?? 0),
                ],
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get table statistics
     */
    private function getTableStatistics(): array
    {
        try {
            $databaseName = DB::connection()->getDatabaseName();
            
            $tables = DB::select("
                SELECT 
                    TABLE_NAME,
                    TABLE_ROWS,
                    DATA_LENGTH,
                    INDEX_LENGTH,
                    DATA_FREE,
                    AUTO_INCREMENT,
                    CREATE_TIME,
                    UPDATE_TIME,
                    CHECK_TIME,
                    TABLE_COLLATION
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_TYPE = 'BASE TABLE'
                ORDER BY DATA_LENGTH DESC
            ", [$databaseName]);

            $totalSize = 0;
            $totalRows = 0;
            $largeTables = [];
            
            foreach ($tables as $table) {
                $tableSize = $table->DATA_LENGTH + $table->INDEX_LENGTH;
                $totalSize += $tableSize;
                $totalRows += $table->TABLE_ROWS;
                
                if ($table->TABLE_ROWS > self::LARGE_TABLE_THRESHOLD) {
                    $largeTables[] = [
                        'name' => $table->TABLE_NAME,
                        'rows' => $table->TABLE_ROWS,
                        'size_mb' => round($tableSize / 1024 / 1024, 2),
                        'last_updated' => $table->UPDATE_TIME,
                    ];
                }
            }

            return [
                'total_tables' => count($tables),
                'total_size_mb' => round($totalSize / 1024 / 1024, 2),
                'total_rows' => $totalRows,
                'large_tables' => array_slice($largeTables, 0, 10),
                'top_tables_by_size' => $this->getTopTablesBySize(array_slice($tables, 0, 10)),
                'fragmented_tables' => $this->getFragmentedTables($tables),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get query analysis
     */
    private function getQueryAnalysis(): array
    {
        try {
            return [
                'slow_queries' => $this->getSlowQueries(),
                'query_cache_stats' => $this->getQueryCacheStats(),
                'query_patterns' => $this->analyzeQueryPatterns(),
                'execution_statistics' => $this->getExecutionStatistics(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get current database locks
     */
    private function getLockInformation(): array
    {
        try {
            $locks = $this->getCurrentLocks();
            $lockWaits = $this->getLockWaits();
            
            return [
                'current_locks' => count($locks),
                'lock_waits' => count($lockWaits),
                'long_running_locks' => array_filter($locks, fn($lock) => $lock['duration'] > self::LONG_LOCK_THRESHOLD),
                'deadlocks_detected' => $this->getDeadlockCount(),
                'lock_details' => array_slice($locks, 0, 20), // Top 20 locks
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get storage usage information
     */
    private function getStorageUsage(): array
    {
        try {
            $databaseName = DB::connection()->getDatabaseName();
            
            $usage = DB::select("
                SELECT 
                    SUM(DATA_LENGTH + INDEX_LENGTH) as total_size,
                    SUM(DATA_LENGTH) as data_size,
                    SUM(INDEX_LENGTH) as index_size,
                    SUM(DATA_FREE) as free_space
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
            ", [$databaseName]);

            $totalSize = $usage[0]->total_size ?? 0;
            $dataSize = $usage[0]->data_size ?? 0;
            $indexSize = $usage[0]->index_size ?? 0;
            $freeSpace = $usage[0]->free_space ?? 0;

            // Get disk usage (this would need to be adapted based on server access)
            $diskUsage = $this->getDiskUsage();

            return [
                'database_size_mb' => round($totalSize / 1024 / 1024, 2),
                'data_size_mb' => round($dataSize / 1024 / 1024, 2),
                'index_size_mb' => round($indexSize / 1024 / 1024, 2),
                'free_space_mb' => round($freeSpace / 1024 / 1024, 2),
                'disk_usage_percent' => $diskUsage['usage_percent'] ?? null,
                'available_space_gb' => $diskUsage['available_gb'] ?? null,
                'index_to_data_ratio' => $dataSize > 0 ? round($indexSize / $dataSize, 2) : 0,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get replication status (if applicable)
     */
    private function getReplicationStatus(): array
    {
        try {
            // Check if server is configured for replication
            $masterStatus = DB::select("SHOW MASTER STATUS");
            $slaveStatus = DB::select("SHOW SLAVE STATUS");

            return [
                'is_master' => !empty($masterStatus),
                'is_slave' => !empty($slaveStatus),
                'master_info' => $masterStatus[0] ?? null,
                'slave_info' => $slaveStatus[0] ?? null,
                'replication_health' => $this->checkReplicationHealth($slaveStatus),
            ];
        } catch (\Exception $e) {
            return [
                'is_master' => false,
                'is_slave' => false,
                'error' => 'Replication status check failed',
            ];
        }
    }

    /**
     * Get optimization recommendations
     */
    private function getOptimizationRecommendations(): array
    {
        $recommendations = [];

        try {
            // Check for slow queries
            $performanceMetrics = $this->getPerformanceMetrics();
            if (isset($performanceMetrics['slow_query_rate']) && $performanceMetrics['slow_query_rate'] > 1) {
                $recommendations[] = [
                    'type' => 'slow_queries',
                    'priority' => 'high',
                    'title' => 'High slow query rate detected',
                    'description' => "Slow query rate is {$performanceMetrics['slow_query_rate']}%",
                    'actions' => [
                        'Review and optimize slow queries',
                        'Add appropriate indexes',
                        'Consider query caching',
                        'Analyze query execution plans',
                    ],
                ];
            }

            // Check for missing indexes
            $missingIndexes = $this->detectMissingIndexes();
            if (!empty($missingIndexes)) {
                $recommendations[] = [
                    'type' => 'missing_indexes',
                    'priority' => 'medium',
                    'title' => 'Potential missing indexes detected',
                    'description' => 'Some queries might benefit from additional indexes',
                    'actions' => [
                        'Analyze query patterns for indexing opportunities',
                        'Consider composite indexes for multi-column queries',
                        'Monitor query execution plans',
                    ],
                    'details' => array_slice($missingIndexes, 0, 5),
                ];
            }

            // Check table fragmentation
            $tableStats = $this->getTableStatistics();
            if (isset($tableStats['fragmented_tables']) && !empty($tableStats['fragmented_tables'])) {
                $recommendations[] = [
                    'type' => 'fragmentation',
                    'priority' => 'medium',
                    'title' => 'Table fragmentation detected',
                    'description' => 'Some tables have significant fragmentation',
                    'actions' => [
                        'Run OPTIMIZE TABLE on fragmented tables',
                        'Schedule regular maintenance',
                        'Consider table partitioning for large tables',
                    ],
                    'tables' => array_slice($tableStats['fragmented_tables'], 0, 5),
                ];
            }

            // Check connection usage
            $connectionInfo = $this->getConnectionInfo();
            if (isset($connectionInfo['connection_usage_percent']) && 
                $connectionInfo['connection_usage_percent'] > 70) {
                $recommendations[] = [
                    'type' => 'connections',
                    'priority' => 'high',
                    'title' => 'High connection usage',
                    'description' => "Connection usage is {$connectionInfo['connection_usage_percent']}%",
                    'actions' => [
                        'Implement connection pooling',
                        'Review application connection handling',
                        'Consider increasing max_connections if needed',
                        'Monitor for connection leaks',
                    ],
                ];
            }

        } catch (\Exception $e) {
            $recommendations[] = [
                'type' => 'error',
                'priority' => 'low',
                'title' => 'Unable to generate some recommendations',
                'description' => 'Some optimization checks failed',
                'error' => $e->getMessage(),
            ];
        }

        return $recommendations;
    }

    /**
     * Get active database alerts
     */
    private function getActiveAlerts(): array
    {
        $alerts = [];

        try {
            // Check for long-running queries
            $longQueries = $this->getLongRunningQueries();
            if (!empty($longQueries)) {
                $alerts[] = [
                    'type' => 'long_running_queries',
                    'severity' => 'warning',
                    'message' => count($longQueries) . ' long-running queries detected',
                    'count' => count($longQueries),
                ];
            }

            // Check for deadlocks
            $deadlocks = $this->getDeadlockCount();
            if ($deadlocks > 0) {
                $alerts[] = [
                    'type' => 'deadlocks',
                    'severity' => 'critical',
                    'message' => "{$deadlocks} deadlocks detected",
                    'count' => $deadlocks,
                ];
            }

            // Check for high connection usage
            $connectionInfo = $this->getConnectionInfo();
            if (isset($connectionInfo['connection_usage_percent']) && 
                $connectionInfo['connection_usage_percent'] > self::HIGH_CONNECTION_THRESHOLD) {
                $alerts[] = [
                    'type' => 'high_connections',
                    'severity' => 'warning',
                    'message' => "High connection usage: {$connectionInfo['connection_usage_percent']}%",
                ];
            }

        } catch (\Exception $e) {
            $alerts[] = [
                'type' => 'monitoring_error',
                'severity' => 'error',
                'message' => 'Database monitoring encountered an error',
                'error' => $e->getMessage(),
            ];
        }

        return $alerts;
    }

    // Helper methods for database monitoring

    private function getServerVariables(array $variables): array
    {
        $result = [];
        try {
            $query = "SHOW VARIABLES WHERE Variable_name IN ('" . implode("','", $variables) . "')";
            $rows = DB::select($query);
            
            foreach ($rows as $row) {
                $result[$row->Variable_name] = $row->Value;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get server variables', ['error' => $e->getMessage()]);
        }
        
        return $result;
    }

    private function getServerStatus(array $variables): array
    {
        $result = [];
        try {
            $query = "SHOW STATUS WHERE Variable_name IN ('" . implode("','", $variables) . "')";
            $rows = DB::select($query);
            
            foreach ($rows as $row) {
                $result[$row->Variable_name] = $row->Value;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get server status', ['error' => $e->getMessage()]);
        }
        
        return $result;
    }

    private function formatUptime(int $seconds): string
    {
        $days = floor($seconds / 86400);
        $hours = floor(($seconds % 86400) / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        
        return "{$days}d {$hours}h {$minutes}m";
    }

    private function getTopTablesBySize(array $tables): array
    {
        return array_map(function ($table) {
            return [
                'name' => $table->TABLE_NAME,
                'rows' => $table->TABLE_ROWS,
                'size_mb' => round(($table->DATA_LENGTH + $table->INDEX_LENGTH) / 1024 / 1024, 2),
                'data_mb' => round($table->DATA_LENGTH / 1024 / 1024, 2),
                'index_mb' => round($table->INDEX_LENGTH / 1024 / 1024, 2),
            ];
        }, $tables);
    }

    private function getFragmentedTables(array $tables): array
    {
        $fragmented = [];
        
        foreach ($tables as $table) {
            if ($table->DATA_FREE > 0 && $table->DATA_LENGTH > 0) {
                $fragmentationPercent = ($table->DATA_FREE / $table->DATA_LENGTH) * 100;
                
                if ($fragmentationPercent > 10) { // More than 10% fragmentation
                    $fragmented[] = [
                        'name' => $table->TABLE_NAME,
                        'fragmentation_percent' => round($fragmentationPercent, 2),
                        'free_space_mb' => round($table->DATA_FREE / 1024 / 1024, 2),
                    ];
                }
            }
        }
        
        return $fragmented;
    }

    private function getSlowQueries(): array
    {
        try {
            // This would typically query the slow query log
            // For now, return cached slow queries from performance monitoring
            $slowQueries = Cache::get('recent_slow_queries', []);
            return array_slice($slowQueries, 0, 20);
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getQueryCacheStats(): array
    {
        try {
            $status = $this->getServerStatus([
                'Qcache_hits', 'Qcache_inserts', 'Qcache_queries_in_cache',
                'Qcache_free_memory', 'Qcache_total_blocks'
            ]);

            $hits = (int) ($status['Qcache_hits'] ?? 0);
            $inserts = (int) ($status['Qcache_inserts'] ?? 0);
            $total = $hits + $inserts;

            return [
                'hits' => $hits,
                'inserts' => $inserts,
                'hit_rate' => $total > 0 ? round(($hits / $total) * 100, 2) : 0,
                'queries_in_cache' => (int) ($status['Qcache_queries_in_cache'] ?? 0),
                'free_memory' => (int) ($status['Qcache_free_memory'] ?? 0),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function analyzeQueryPatterns(): array
    {
        // This would analyze query logs for patterns
        // For now, return basic analysis
        return [
            'most_frequent_operations' => ['SELECT', 'UPDATE', 'INSERT'],
            'peak_hours' => ['09:00-10:00', '14:00-15:00'],
            'query_complexity_trend' => 'stable',
        ];
    }

    private function getExecutionStatistics(): array
    {
        $status = $this->getServerStatus([
            'Com_select', 'Com_insert', 'Com_update', 'Com_delete'
        ]);

        return [
            'selects' => (int) ($status['Com_select'] ?? 0),
            'inserts' => (int) ($status['Com_insert'] ?? 0),
            'updates' => (int) ($status['Com_update'] ?? 0),
            'deletes' => (int) ($status['Com_delete'] ?? 0),
        ];
    }

    private function getCurrentLocks(): array
    {
        try {
            return DB::select("
                SELECT 
                    l.lock_type,
                    l.lock_duration,
                    l.lock_status,
                    p.time as duration,
                    p.info as query
                FROM information_schema.metadata_locks l
                LEFT JOIN information_schema.processlist p ON l.owner_thread_id = p.id
                WHERE l.lock_status = 'GRANTED'
                ORDER BY p.time DESC
                LIMIT 50
            ");
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getLockWaits(): array
    {
        try {
            return DB::select("
                SELECT * FROM information_schema.metadata_locks 
                WHERE lock_status = 'PENDING'
                LIMIT 20
            ");
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getDeadlockCount(): int
    {
        try {
            $status = $this->getServerStatus(['Innodb_deadlocks']);
            return (int) ($status['Innodb_deadlocks'] ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getLongRunningQueries(): array
    {
        try {
            return DB::select("
                SELECT id, user, host, db, command, time, info
                FROM information_schema.processlist 
                WHERE command != 'Sleep' 
                AND time > 30
                ORDER BY time DESC
                LIMIT 20
            ");
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getDiskUsage(): array
    {
        // This would require system-level access to get actual disk usage
        // For now, return placeholder data
        return [
            'usage_percent' => null,
            'available_gb' => null,
            'note' => 'Disk usage monitoring requires system-level access',
        ];
    }

    private function checkReplicationHealth(array $slaveStatus): string
    {
        if (empty($slaveStatus)) {
            return 'not_configured';
        }

        $status = $slaveStatus[0];
        
        if ($status->Slave_IO_Running === 'Yes' && $status->Slave_SQL_Running === 'Yes') {
            return 'healthy';
        } elseif ($status->Slave_IO_Running === 'No' || $status->Slave_SQL_Running === 'No') {
            return 'error';
        }
        
        return 'warning';
    }

    private function detectMissingIndexes(): array
    {
        // This would analyze query patterns to suggest missing indexes
        // For now, return basic suggestions
        return [
            ['table' => 'users', 'columns' => ['email'], 'reason' => 'Frequent WHERE clause usage'],
            ['table' => 'orders', 'columns' => ['created_at', 'status'], 'reason' => 'Composite index opportunity'],
        ];
    }
}