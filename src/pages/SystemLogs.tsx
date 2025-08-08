import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Search, Filter, Download, 
  RefreshCw, AlertTriangle, Info, 
  CheckCircle, XCircle, Clock, Eye,
  Calendar, Server, Database, User,
  FileText, Shield, Zap, Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical' | 'debug';
  category: string;
  message: string;
  source: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

const SystemLogs: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'errors' | 'security' | 'performance'>('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const logEntries: LogEntry[] = [
    {
      id: 'log-001',
      timestamp: '2025-01-15T10:30:15Z',
      level: 'info',
      category: 'Authentication',
      message: 'User logged in successfully',
      source: 'AuthController',
      userId: 'user-001',
      userName: 'Ahmed Ali',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 'log-002',
      timestamp: '2025-01-15T10:28:42Z',
      level: 'warning',
      category: 'Database',
      message: 'Slow query detected: SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 30 DAY',
      source: 'DatabaseMonitor',
      details: { executionTime: '2.3s', affectedRows: 15643 }
    },
    {
      id: 'log-003',
      timestamp: '2025-01-15T10:25:33Z',
      level: 'error',
      category: 'API',
      message: 'Failed to process payment gateway response',
      source: 'PaymentService',
      details: { 
        gateway: 'stripe',
        errorCode: 'card_declined',
        orderId: 'ORD-2025-001'
      }
    },
    {
      id: 'log-004',
      timestamp: '2025-01-15T10:22:18Z',
      level: 'critical',
      category: 'Security',
      message: 'Multiple failed login attempts detected',
      source: 'SecurityMonitor',
      ipAddress: '192.168.1.205',
      details: { 
        attempts: 5,
        timeWindow: '5 minutes',
        targetUser: 'admin@company.com'
      }
    },
    {
      id: 'log-005',
      timestamp: '2025-01-15T10:20:55Z',
      level: 'info',
      category: 'System',
      message: 'Backup process completed successfully',
      source: 'BackupService',
      details: { 
        backupSize: '2.5GB',
        duration: '15 minutes',
        location: '/backups/daily/2025-01-15.sql'
      }
    },
    {
      id: 'log-006',
      timestamp: '2025-01-15T10:18:12Z',
      level: 'debug',
      category: 'Performance',
      message: 'Cache hit ratio: 94.2%',
      source: 'CacheMonitor',
      details: { 
        hits: 9420,
        misses: 580,
        totalRequests: 10000
      }
    },
    {
      id: 'log-007',
      timestamp: '2025-01-15T10:15:07Z',
      level: 'warning',
      category: 'Storage',
      message: 'Disk space usage above 80%',
      source: 'SystemMonitor',
      details: { 
        usedSpace: '42.3GB',
        totalSpace: '50GB',
        percentage: 84.6
      }
    },
    {
      id: 'log-008',
      timestamp: '2025-01-15T10:12:33Z',
      level: 'error',
      category: 'Email',
      message: 'Failed to send notification email',
      source: 'EmailService',
      details: { 
        recipient: 'customer@example.com',
        subject: 'Order Confirmation',
        error: 'SMTP connection timeout'
      }
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'critical':
        return 'text-purple-600 bg-purple-100';
      case 'debug':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      case 'critical':
        return <Shield size={16} />;
      case 'debug':
        return <Settings size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'authentication':
        return <User size={16} />;
      case 'database':
        return <Database size={16} />;
      case 'api':
        return <Server size={16} />;
      case 'security':
        return <Shield size={16} />;
      case 'system':
        return <Activity size={16} />;
      case 'performance':
        return <Zap size={16} />;
      case 'storage':
        return <FileText size={16} />;
      case 'email':
        return <CheckCircle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const refreshLogs = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const filteredLogs = logEntries.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'errors' && ['error', 'critical'].includes(log.level)) ||
      (activeTab === 'security' && log.category.toLowerCase() === 'security') ||
      (activeTab === 'performance' && ['performance', 'database'].includes(log.category.toLowerCase()));
    
    return matchesLevel && matchesSearch && matchesTab;
  });

  const stats = {
    totalLogs: logEntries.length,
    errorLogs: logEntries.filter(log => ['error', 'critical'].includes(log.level)).length,
    warningLogs: logEntries.filter(log => log.level === 'warning').length,
    infoLogs: logEntries.filter(log => log.level === 'info').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"
            style={{ color: 'var(--text-primary)' }}>
            <Activity className="h-8 w-8 text-blue-600" />
            System Logs
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Monitor system activities, errors, and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={refreshLogs}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={20} />
            Export Logs
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { 
            label: 'Total Logs', 
            value: stats.totalLogs.toString(), 
            icon: <FileText size={24} />, 
            color: 'blue',
            change: '+45 today'
          },
          { 
            label: 'Error Logs', 
            value: stats.errorLogs.toString(), 
            icon: <XCircle size={24} />, 
            color: 'red',
            change: '+2 last hour'
          },
          { 
            label: 'Warning Logs', 
            value: stats.warningLogs.toString(), 
            icon: <AlertTriangle size={24} />, 
            color: 'yellow',
            change: '+5 today'
          },
          { 
            label: 'Info Logs', 
            value: stats.infoLogs.toString(), 
            icon: <Info size={24} />, 
            color: 'green',
            change: '+38 today'
          }
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b" style={{ borderColor: 'var(--border-color)' }}
      >
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All Logs', count: stats.totalLogs },
            { id: 'errors', label: 'Errors', count: stats.errorLogs },
            { id: 'security', label: 'Security', count: logEntries.filter(l => l.category.toLowerCase() === 'security').length },
            { id: 'performance', label: 'Performance', count: logEntries.filter(l => ['performance', 'database'].includes(l.category.toLowerCase())).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ 
                color: activeTab === tab.id ? '#3b82f6' : 'var(--text-secondary)' 
              }}
            >
              {tab.label}
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
          <option value="debug">Debug</option>
        </select>
        
        <input
          type="date"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        />
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {log.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {log.message}
                    </div>
                    {log.details && (
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {Object.entries(log.details).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {log.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.userName ? (
                      <div className="text-sm">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {log.userName}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {log.ipAddress}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              No logs found
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SystemLogs;