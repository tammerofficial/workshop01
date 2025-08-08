import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Fingerprint, Users, Clock, Shield, 
  Activity, AlertTriangle, CheckCircle, 
  Settings, Wifi, WifiOff, RefreshCw,
  UserCheck, UserX, Eye, Download,
  Calendar, BarChart3, Monitor
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface BiometricDevice {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  totalScans: number;
  todayScans: number;
  batteryLevel?: number;
}

interface BiometricRecord {
  id: string;
  workerId: string;
  workerName: string;
  deviceId: string;
  timestamp: string;
  type: 'check_in' | 'check_out' | 'break_start' | 'break_end';
  status: 'success' | 'failed' | 'duplicate';
  confidence: number;
}

const BiometricSystem: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'records' | 'settings'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const devices: BiometricDevice[] = [
    {
      id: 'device-001',
      name: 'Main Entrance Scanner',
      location: 'Main Entrance',
      status: 'online',
      lastSeen: '2025-01-15T10:30:00Z',
      totalScans: 1234,
      todayScans: 45,
      batteryLevel: 85
    },
    {
      id: 'device-002',
      name: 'Production Floor Scanner',
      location: 'Production Area',
      status: 'online',
      lastSeen: '2025-01-15T10:28:00Z',
      totalScans: 856,
      todayScans: 32,
      batteryLevel: 92
    },
    {
      id: 'device-003',
      name: 'Break Room Scanner',
      location: 'Break Room',
      status: 'maintenance',
      lastSeen: '2025-01-14T16:45:00Z',
      totalScans: 523,
      todayScans: 0,
      batteryLevel: 45
    },
    {
      id: 'device-004',
      name: 'Exit Scanner',
      location: 'Exit Gate',
      status: 'offline',
      lastSeen: '2025-01-14T18:20:00Z',
      totalScans: 967,
      todayScans: 0,
      batteryLevel: 15
    }
  ];

  const recentRecords: BiometricRecord[] = [
    {
      id: 'rec-001',
      workerId: 'W001',
      workerName: 'Ahmed Ali',
      deviceId: 'device-001',
      timestamp: '2025-01-15T10:30:00Z',
      type: 'check_in',
      status: 'success',
      confidence: 98.5
    },
    {
      id: 'rec-002',
      workerId: 'W002',
      workerName: 'Fatima Hassan',
      deviceId: 'device-002',
      timestamp: '2025-01-15T10:28:00Z',
      type: 'check_in',
      status: 'success',
      confidence: 96.2
    },
    {
      id: 'rec-003',
      workerId: 'W003',
      workerName: 'Mohammed Saleh',
      deviceId: 'device-001',
      timestamp: '2025-01-15T10:25:00Z',
      type: 'check_in',
      status: 'failed',
      confidence: 65.8
    },
    {
      id: 'rec-004',
      workerId: 'W001',
      workerName: 'Ahmed Ali',
      deviceId: 'device-001',
      timestamp: '2025-01-15T10:22:00Z',
      type: 'check_in',
      status: 'duplicate',
      confidence: 98.1
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'offline':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
      case 'duplicate':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'success':
        return <CheckCircle size={16} />;
      case 'offline':
      case 'failed':
        return <AlertTriangle size={16} />;
      case 'maintenance':
      case 'duplicate':
        return <Clock size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const stats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status === 'online').length,
    todayScans: devices.reduce((sum, d) => sum + d.todayScans, 0),
    successRate: 94.5
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
            <Fingerprint className="h-8 w-8 text-blue-600" />
            Biometric System
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Fingerprint authentication and attendance monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
            label: 'Total Devices', 
            value: stats.totalDevices.toString(), 
            icon: <Monitor size={24} />, 
            color: 'blue',
            change: '+2 this month'
          },
          { 
            label: 'Online Devices', 
            value: `${stats.onlineDevices}/${stats.totalDevices}`, 
            icon: <Wifi size={24} />, 
            color: 'green',
            change: '50% uptime'
          },
          { 
            label: 'Today Scans', 
            value: stats.todayScans.toString(), 
            icon: <Fingerprint size={24} />, 
            color: 'purple',
            change: '+15% vs yesterday'
          },
          { 
            label: 'Success Rate', 
            value: `${stats.successRate}%`, 
            icon: <CheckCircle size={24} />, 
            color: 'orange',
            change: '+2.5% improvement'
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
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
            { id: 'devices', label: 'Devices', icon: <Monitor size={16} /> },
            { id: 'records', label: 'Records', icon: <Activity size={16} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
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
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Device Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Device Status
                </h3>
                <div className="space-y-3">
                  {devices.slice(0, 3).map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(device.status)}`}>
                          {getStatusIcon(device.status)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {device.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {device.location}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                          {record.type.includes('check_in') ? <UserCheck size={16} /> : <UserX size={16} />}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {record.workerName}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {record.type.replace('_', ' ')} • {record.confidence}%
                          </p>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Biometric Devices
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Scans Today
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Battery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Fingerprint className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {device.name}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {device.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                          {getStatusIcon(device.status)}
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                        {device.todayScans}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                device.batteryLevel! > 60 ? 'bg-green-500' : 
                                device.batteryLevel! > 30 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${device.batteryLevel}%` }}
                            ></div>
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {device.batteryLevel}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(device.lastSeen).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}>
            <div className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Biometric Records
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={16} />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                  {recentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {record.workerName}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              ID: {record.workerId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {record.type.includes('check_in') ? <UserCheck size={16} className="text-green-600" /> : <UserX size={16} className="text-red-600" />}
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {record.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {record.confidence}%
                          </span>
                          <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                            <div 
                              className={`h-2 rounded-full ${
                                record.confidence > 90 ? 'bg-green-500' : 
                                record.confidence > 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${record.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  System Settings
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Auto-sync with attendance', value: true, description: 'Automatically sync biometric data with attendance records' },
                    { label: 'Require double verification', value: false, description: 'Require two successful scans for critical actions' },
                    { label: 'Alert on failed attempts', value: true, description: 'Send notifications when authentication fails' },
                    { label: 'Daily backup', value: true, description: 'Automatically backup biometric data daily' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {setting.label}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {setting.description}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={setting.value}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        onChange={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Minimum Confidence Level
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      defaultValue="85"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>50%</span>
                      <span>85%</span>
                      <span>99%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Session Timeout (minutes)
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}>
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Max Failed Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BiometricSystem;