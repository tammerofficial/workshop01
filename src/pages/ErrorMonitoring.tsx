import React, { useState, useEffect } from 'react';
import { errorMonitoringApi } from '../api/laravel';
import { ErrorService } from '../services/ErrorService';

interface ErrorLog {
  id: number;
  error_id: string;
  type: string;
  message: string;
  file: string;
  line: number;
  url: string;
  method: string;
  ip: string;
  user_id?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
}

interface DashboardData {
  overview: {
    total_today: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
    recent_errors: ErrorLog[];
  };
  trends: Array<{ date: string; count: number }>;
  top_errors: Array<{ type: string; count: number }>;
  recent_activity: ErrorLog[];
  system_health: {
    total_errors_24h: number;
    critical_errors_24h: number;
    resolved_percentage: number;
    health_status: 'healthy' | 'attention' | 'warning' | 'critical' | 'unknown';
  };
}

const ErrorMonitoring: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    resolved: '',
    date_from: '',
    date_to: '',
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboard();
    loadErrorLogs();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadErrorLogs();
  }, [filters]);

  const loadDashboard = async () => {
    try {
      const response = await errorMonitoringApi.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      ErrorService.showError('Failed to load dashboard data');
    }
  };

  const loadErrorLogs = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      );
      const response = await errorMonitoringApi.getErrorLogs(params);
      setErrorLogs(response.data.data.data);
    } catch (error) {
      ErrorService.showError('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  const resolveError = async (errorId: string, notes?: string) => {
    try {
      await errorMonitoringApi.resolveError(errorId, notes);
      ErrorService.showSuccess('Error marked as resolved');
      loadErrorLogs();
      loadDashboard();
    } catch (error) {
      ErrorService.showError('Failed to resolve error');
    }
  };

  const clearOldLogs = async () => {
    if (!confirm('Are you sure you want to clear old error logs?')) return;
    
    try {
      await errorMonitoringApi.clearOldLogs(30);
      ErrorService.showSuccess('Old error logs cleared');
      loadErrorLogs();
      loadDashboard();
    } catch (error) {
      ErrorService.showError('Failed to clear old logs');
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'attention': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Monitoring Dashboard</h1>
        <p className="text-gray-600">Centralized error tracking and monitoring system</p>
      </div>

      {/* System Health Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gray-100">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Errors (24h)</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.system_health.total_errors_24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Errors</p>
                <p className="text-2xl font-bold text-red-600">{dashboardData.system_health.critical_errors_24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData.system_health.resolved_percentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${getHealthStatusColor(dashboardData.system_health.health_status)}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-lg font-bold capitalize">{dashboardData.system_health.health_status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <input
            type="text"
            placeholder="Error Type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />

          <select
            value={filters.resolved}
            onChange={(e) => setFilters({ ...filters, resolved: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="true">Resolved</option>
            <option value="false">Unresolved</option>
          </select>

          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />

          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setFilters({ severity: '', type: '', resolved: '', date_from: '', date_to: '' })}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <button
            onClick={clearOldLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Old Logs
          </button>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Error Logs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errorLogs.map((error) => (
                <tr key={error.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {error.type.split('\\').pop()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {error.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {error.url}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(error.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      error.resolved ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                    }`}>
                      {error.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedError(error)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      View
                    </button>
                    {!error.resolved && (
                      <button
                        onClick={() => resolveError(error.error_id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Error Details</h3>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Error ID:</label>
                  <p className="text-gray-600">{selectedError.error_id}</p>
                </div>
                <div>
                  <label className="font-semibold">Type:</label>
                  <p className="text-gray-600">{selectedError.type}</p>
                </div>
                <div>
                  <label className="font-semibold">Severity:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedError.severity)}`}>
                    {selectedError.severity}
                  </span>
                </div>
                <div>
                  <label className="font-semibold">Method:</label>
                  <p className="text-gray-600">{selectedError.method}</p>
                </div>
              </div>
              
              <div>
                <label className="font-semibold">Message:</label>
                <p className="text-gray-600 mt-1">{selectedError.message}</p>
              </div>
              
              <div>
                <label className="font-semibold">URL:</label>
                <p className="text-gray-600 mt-1 break-all">{selectedError.url}</p>
              </div>
              
              <div>
                <label className="font-semibold">File & Line:</label>
                <p className="text-gray-600 mt-1">{selectedError.file}:{selectedError.line}</p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {!selectedError.resolved && (
                  <button
                    onClick={() => {
                      resolveError(selectedError.error_id);
                      setSelectedError(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorMonitoring;