import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Search, Calendar, Clock, User, 
  AlertTriangle, CheckCircle, Download, Filter,
  RefreshCw, Eye
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

const SecurityLogs: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock security logs
  const [logs] = useState<SecurityLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Admin User',
      action: 'Login',
      ip: '192.168.1.1',
      status: 'success',
      details: 'Successful login from Dubai, UAE'
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:45:00Z',
      user: 'Sarah Manager',
      action: 'Password Change',
      ip: '192.168.1.2',
      status: 'success',
      details: 'Password changed successfully'
    },
    {
      id: '3',
      timestamp: '2024-01-14T16:20:00Z',
      user: 'Unknown',
      action: 'Login Attempt',
      ip: '203.0.113.1',
      status: 'error',
      details: 'Failed login attempt - incorrect password (3rd attempt)'
    },
    {
      id: '4',
      timestamp: '2024-01-14T14:15:00Z',
      user: 'Ahmed Ali',
      action: 'Permission Change',
      ip: '192.168.1.3',
      status: 'warning',
      details: 'Role changed from Worker to Manager by Admin User'
    },
    {
      id: '5',
      timestamp: '2024-01-13T11:30:00Z',
      user: 'System',
      action: 'Backup',
      ip: 'localhost',
      status: 'success',
      details: 'Automatic system backup completed'
    },
    {
      id: '6',
      timestamp: '2024-01-12T09:15:00Z',
      user: 'Fatima Hassan',
      action: 'Account Locked',
      ip: '192.168.1.4',
      status: 'warning',
      details: 'Account temporarily locked due to multiple failed login attempts'
    }
  ]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    const logDate = new Date(log.timestamp);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    
    const matchesDate = logDate >= startDate && logDate <= endDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} className="mr-1" />;
      case 'warning': return <AlertTriangle size={14} className="mr-1" />;
      case 'error': return <AlertTriangle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const refreshLogs = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Security logs refreshed');
    }, 1000);
  };

  const exportLogs = () => {
    toast.success('Security logs exported');
  };

  const viewLogDetails = (log: SecurityLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader 
        title="Security Logs"
        subtitle="Monitor system security events and user activities"
        action={
          <div className="flex space-x-3">
            <button
              onClick={refreshLogs}
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportLogs}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download size={16} className="mr-2" />
              Export Logs
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <motion.div 
          className={`rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs by user, action, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logs Table */}
        <motion.div 
          className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`transition-colors duration-300 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Timestamp
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    User
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Action
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    IP Address
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                isDark ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className={`transition-colors duration-200 ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <Clock size={12} className="inline mr-1" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <User size={14} className="mr-2 text-gray-400" />
                        {log.user}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {log.action}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewLogDetails(log)}
                        className={`inline-flex items-center px-2 py-1 border rounded-md text-xs transition-colors duration-200 ${
                          isDark 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Eye size={12} className="mr-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                No logs found
              </h3>
              <p className={`mb-4 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Try adjusting your search criteria or date range
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateRange({
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  });
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Filter size={16} className="mr-2" />
                Reset Filters
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Security Log Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-1 rounded-full transition-colors duration-200 ${
                  isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={`rounded-lg border p-4 mb-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Log ID
                  </p>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedLog.id}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Timestamp
                  </p>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    User
                  </p>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedLog.user}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    IP Address
                  </p>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedLog.ip}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Action
                  </p>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedLog.action}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Status
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                    {getStatusIcon(selectedLog.status)}
                    {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Details
                </p>
                <p className={`transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedLog.details}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SecurityLogs;