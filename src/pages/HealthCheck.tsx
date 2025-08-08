import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Shield, 
  Database, 
  HardDrive,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Wifi,
  Mail,
  Settings,
  Lock,
  Zap,
  Globe
} from 'lucide-react';
import { errorMonitoringApi } from '../api/laravel';

interface HealthCheck {
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  details: Record<string, any>;
  warnings: string[];
  timestamp: string;
}

interface HealthCheckData {
  overall_status: string;
  timestamp: string;
  execution_time_ms: number;
  checks: Record<string, HealthCheck>;
  critical_failures: string[];
  warnings: string[];
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

const HealthCheck: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      const response = await errorMonitoringApi.getHealthCheck();
      
      if (response.data.success) {
        setHealthData(response.data.data);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load health check data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    
    // Auto refresh every 60 seconds
    const interval = setInterval(loadHealthData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'skipped': return <Clock className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'border-green-500 bg-green-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'failed': return 'border-red-500 bg-red-50';
      case 'skipped': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryIcon = (checkName: string) => {
    switch (checkName) {
      case 'database_connectivity': return <Database className="h-6 w-6" />;
      case 'cache_system': return <Zap className="h-6 w-6" />;
      case 'filesystem': return <HardDrive className="h-6 w-6" />;
      case 'queue_system': return <Activity className="h-6 w-6" />;
      case 'application_config': return <Settings className="h-6 w-6" />;
      case 'external_apis': return <Globe className="h-6 w-6" />;
      case 'email_service': return <Mail className="h-6 w-6" />;
      case 'security_settings': return <Lock className="h-6 w-6" />;
      case 'ssl_certificate': return <Shield className="h-6 w-6" />;
      case 'resource_usage': return <Server className="h-6 w-6" />;
      case 'response_times': return <Clock className="h-6 w-6" />;
      case 'application_specific': return <Settings className="h-6 w-6" />;
      default: return <Server className="h-6 w-6" />;
    }
  };

  const formatCheckName = (checkName: string) => {
    const names: Record<string, string> = {
      'database_connectivity': 'Database Connectivity',
      'cache_system': 'Cache System',
      'filesystem': 'Filesystem',
      'queue_system': 'Queue System',
      'application_config': 'Application Configuration',
      'external_apis': 'External APIs',
      'email_service': 'Email Service',
      'security_settings': 'Security Settings',
      'ssl_certificate': 'SSL Certificate',
      'resource_usage': 'Resource Usage',
      'response_times': 'Response Times',
      'application_specific': 'Application Specific'
    };
    
    return names[checkName] || checkName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDetailValue = (key: string, value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (key.includes('time') || key.includes('Time')) {
      return `${value} ms`;
    }
    if (key.includes('size') || key.includes('Size') || key.includes('usage') || key.includes('Usage')) {
      if (typeof value === 'number' && value > 1024) {
        return `${(value / 1024 / 1024).toFixed(2)} MB`;
      }
    }
    return String(value);
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
              <Shield className="h-8 w-8 text-blue-600" />
              System Health Check
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive backend system health verification and diagnostics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last Check: {lastUpdate.toLocaleTimeString('en-US')}
            </div>
            <button
              onClick={loadHealthData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Run Check
            </button>
          </div>
        </div>

        {healthData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 ${
                healthData.overall_status === 'healthy' ? 'border-green-500' : 
                healthData.overall_status === 'warning' ? 'border-yellow-500' : 'border-red-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Overall Status</p>
                    <p className={`text-2xl font-bold ${
                      healthData.overall_status === 'healthy' ? 'text-green-600' : 
                      healthData.overall_status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {healthData.overall_status.toUpperCase()}
                    </p>
                  </div>
                  {getStatusIcon(healthData.overall_status)}
                </div>
              </div>

              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Checks</p>
                    <p className="text-2xl font-bold text-blue-600">{healthData.summary.total_checks}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Execution Time</p>
                    <p className="text-2xl font-bold text-purple-600">{healthData.execution_time_ms.toFixed(2)}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600">{healthData.summary.warnings}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Health Check Results */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Health Check Details</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(healthData.checks).map(([checkName, check]) => (
                  <div
                    key={checkName}
                    className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 ${getStatusColor(check.status)}`}
                  >
                    {/* Check Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          check.status === 'passed' ? 'bg-green-100 text-green-600' :
                          check.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          check.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getCategoryIcon(checkName)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{formatCheckName(checkName)}</h3>
                          <p className="text-sm text-gray-500">{check.message}</p>
                        </div>
                      </div>
                      {getStatusIcon(check.status)}
                    </div>

                    {/* Check Details */}
                    {check.details && Object.keys(check.details).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Details:</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {Object.entries(check.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-start text-sm">
                              <span className="font-medium text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-gray-800 text-right max-w-xs break-words">
                                {formatDetailValue(key, value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {check.warnings && check.warnings.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-yellow-700 mb-2">Warnings:</h4>
                        <div className="bg-yellow-50 rounded-lg p-3">
                          {check.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Checked at: {new Date(check.timestamp).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Warnings */}
            {healthData.warnings && healthData.warnings.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">System Warnings</h2>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-yellow-500`}>
                  <div className="space-y-3">
                    {healthData.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-yellow-800">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Critical Failures */}
            {healthData.critical_failures && healthData.critical_failures.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Critical Failures</h2>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-red-500`}>
                  <div className="space-y-3">
                    {healthData.critical_failures.map((failure, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-red-800">{failure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* No Data State */}
        {!healthData && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Health Check Data Available
            </h3>
            <p className="text-gray-600">
              Unable to load health check data. Please try running a check.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCheck;