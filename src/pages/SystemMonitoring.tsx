import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  Memory, 
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { errorMonitoringApi } from '../api/laravel';

interface SystemMetrics {
  cpu_usage: number | string;
  memory_usage: number | string;
  disk_usage: number | string;
  network_io: {
    bytes_in: number;
    bytes_out: number;
  };
  uptime: number;
  load_average: number[];
}

interface HealthStatus {
  database: 'healthy' | 'warning' | 'critical';
  cache: 'healthy' | 'warning' | 'critical';
  queue: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
}

const SystemMonitoring: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Get system overview and health check
      const [overviewResponse, healthResponse] = await Promise.all([
        errorMonitoringApi.getSystemOverview().catch(() => null),
        errorMonitoringApi.getHealthCheck().catch(() => null)
      ]);

      // Process system overview data
      if (overviewResponse?.data?.success) {
        const data = overviewResponse.data.data;
        
        if (data.system_metrics) {
          setMetrics({
            cpu_usage: data.system_metrics.cpu_usage || 'N/A',
            memory_usage: data.system_metrics.memory_usage || 'N/A',
            disk_usage: data.system_metrics.disk_usage || 'N/A',
            network_io: {
              bytes_in: 0,
              bytes_out: 0
            },
            uptime: 0,
            load_average: [data.system_metrics.load_average || 0]
          });
        }
      }

      // Process health check data for more detailed health status
      if (healthResponse?.data?.success) {
        const checks = healthResponse.data.data.checks || {};
        
        setHealth({
          database: checks.database_connectivity?.status === 'passed' ? 'healthy' : 'warning',
          cache: checks.cache_system?.status === 'passed' ? 'healthy' : 'warning',
          queue: checks.queue_system?.status === 'passed' ? 'healthy' : 'warning',
          storage: checks.filesystem?.status === 'passed' ? 'healthy' : 'warning'
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatPercentage = (value: number | string): string => {
    if (typeof value === 'string') {
      if (value === 'N/A' || !value) return 'Not Available';
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 'Not Available' : `${parsed.toFixed(1)}%`;
    }
    if (typeof value === 'number' && !isNaN(value)) {
      return `${value.toFixed(1)}%`;
    }
    return 'Not Available';
  };

  const getNumericValue = (value: number | string): number => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className={`mb-4 md:mb-0 ${isRTL ? 'md:mr-auto' : 'md:ml-auto'}`}>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              System Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time system and server performance monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last Update: {lastUpdate.toLocaleTimeString('en-US')}
            </div>
            <button
              onClick={loadSystemData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Health Status Cards */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(health).map(([service, status]) => (
              <div
                key={service}
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 ${
                  status === 'healthy' ? 'border-green-500' : 
                  status === 'warning' ? 'border-yellow-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      {service === 'database' ? 'Database' :
                       service === 'cache' ? 'Cache System' :
                       service === 'queue' ? 'Queue System' : 'Storage'}
                    </p>
                    <p className={`text-lg font-semibold ${getStatusColor(status)}`}>
                      {status === 'healthy' ? 'Healthy' :
                       status === 'warning' ? 'Warning' : 'Critical'}
                    </p>
                  </div>
                  <div className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CPU & Memory */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Cpu className="h-6 w-6 text-blue-600" />
                CPU & Memory
              </h3>
              
              <div className="space-y-6">
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-500">{formatPercentage(metrics.cpu_usage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getNumericValue(metrics.cpu_usage) > 80 ? 'bg-red-500' :
                        getNumericValue(metrics.cpu_usage) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getNumericValue(metrics.cpu_usage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-500">{formatPercentage(metrics.memory_usage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getNumericValue(metrics.memory_usage) > 80 ? 'bg-red-500' :
                        getNumericValue(metrics.memory_usage) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getNumericValue(metrics.memory_usage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Load Average */}
                <div>
                  <span className="text-sm font-medium">Load Average: </span>
                  <span className="text-sm text-gray-500">
                    {metrics.load_average && Array.isArray(metrics.load_average) 
                      ? metrics.load_average.map(load => load.toFixed(2)).join(', ')
                      : 'Not Available'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Storage & Network */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <HardDrive className="h-6 w-6 text-green-600" />
                Storage & Network
              </h3>
              
              <div className="space-y-6">
                {/* Disk Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-gray-500">{formatPercentage(metrics.disk_usage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getNumericValue(metrics.disk_usage) > 80 ? 'bg-red-500' :
                        getNumericValue(metrics.disk_usage) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getNumericValue(metrics.disk_usage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Network I/O */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network In</span>
                    <span className="text-sm text-gray-500">
                      {metrics.network_io?.bytes_in ? formatBytes(metrics.network_io.bytes_in) : 'Not Available'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network Out</span>
                    <span className="text-sm text-gray-500">
                      {metrics.network_io?.bytes_out ? formatBytes(metrics.network_io.bytes_out) : 'Not Available'}
                    </span>
                  </div>
                </div>

                {/* Uptime */}
                <div>
                  <span className="text-sm font-medium">Uptime: </span>
                  <span className="text-sm text-gray-500">
                    {metrics.uptime && typeof metrics.uptime === 'number' ? formatUptime(metrics.uptime) : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!metrics && !health && (
          <div className="text-center py-12">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600">
              Unable to load system monitoring data. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitoring;