import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Download, Calendar, Clock, RefreshCw, 
  Upload, AlertTriangle, CheckCircle, HardDrive, 
  Archive, Trash2, Play, Pause, Settings
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Backup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
}

interface BackupSettings {
  autoBackup: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupTime: string;
  includedData: string[];
}

const Backup: React.FC = () => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'settings'>('backups');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  
  const [backups] = useState<Backup[]>([
    {
      id: '1',
      name: 'backup-20240115-103000.sql',
      size: '42.5 MB',
      createdAt: '2024-01-15T10:30:00Z',
      type: 'auto',
      status: 'completed'
    },
    {
      id: '2',
      name: 'backup-20240114-103000.sql',
      size: '41.8 MB',
      createdAt: '2024-01-14T10:30:00Z',
      type: 'auto',
      status: 'completed'
    },
    {
      id: '3',
      name: 'backup-20240113-103000.sql',
      size: '41.2 MB',
      createdAt: '2024-01-13T10:30:00Z',
      type: 'auto',
      status: 'completed'
    },
    {
      id: '4',
      name: 'backup-20240112-153045.sql',
      size: '40.9 MB',
      createdAt: '2024-01-12T15:30:45Z',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '5',
      name: 'backup-20240111-103000.sql',
      size: '40.5 MB',
      createdAt: '2024-01-11T10:30:00Z',
      type: 'auto',
      status: 'completed'
    },
    {
      id: '6',
      name: 'backup-20240110-103000.sql',
      size: '39.8 MB',
      createdAt: '2024-01-10T10:30:00Z',
      type: 'auto',
      status: 'failed'
    }
  ]);

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackup: true,
    frequency: 'daily',
    retention: 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    backupTime: '03:00',
    includedData: ['database', 'files', 'configurations']
  });

  const handleCreateBackup = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Backup created successfully');
    }, 2000);
  };

  const handleRestoreBackup = () => {
    if (!selectedBackup) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowRestoreModal(false);
      toast.success(`System restored from backup: ${selectedBackup.name}`);
    }, 3000);
  };

  const handleDeleteBackup = (backup: Backup) => {
    if (window.confirm(`Are you sure you want to delete backup: ${backup.name}?`)) {
      toast.success(`Backup ${backup.name} deleted successfully`);
    }
  };

  const handleDownloadBackup = (backup: Backup) => {
    toast.success(`Downloading backup: ${backup.name}`);
  };

  const handleSettingChange = (field: keyof BackupSettings, value: any) => {
    setBackupSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Backup settings saved successfully');
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="mr-1" />;
      case 'in_progress': return <RefreshCw size={14} className="mr-1 animate-spin" />;
      case 'failed': return <AlertTriangle size={14} className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader 
        title="Backup & Restore"
        subtitle="Manage system backups and restoration"
        action={
          activeTab === 'backups' ? (
            <button
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database size={16} className="mr-2" />
                  Create Backup
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Settings
                </>
              )}
            </button>
          )
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <motion.div 
          className={`rounded-lg shadow-sm mb-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex">
            <button
              onClick={() => setActiveTab('backups')}
              className={`flex-1 py-3 px-4 text-center transition-colors duration-200 ${
                activeTab === 'backups'
                  ? isDark 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'border-b-2 border-blue-500 text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Archive size={16} className="mr-2" />
                <span>Backups</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 px-4 text-center transition-colors duration-200 ${
                activeTab === 'settings'
                  ? isDark 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'border-b-2 border-blue-500 text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Settings size={16} className="mr-2" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Backup List */}
        {activeTab === 'backups' && (
          <motion.div 
            className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
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
                      Backup Name
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Date & Time
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Size
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Type
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
                  {backups.map((backup) => (
                    <tr key={backup.id} className={`transition-colors duration-200 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center">
                          <Database size={16} className="mr-2 text-gray-400" />
                          {backup.name}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {new Date(backup.createdAt).toLocaleDateString()}
                          <Clock size={14} className="ml-3 mr-1 text-gray-400" />
                          {new Date(backup.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center">
                          <HardDrive size={14} className="mr-2 text-gray-400" />
                          {backup.size}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          backup.type === 'auto' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {backup.type === 'auto' ? 'Automatic' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                          {getStatusIcon(backup.status)}
                          {backup.status === 'completed' ? 'Completed' : 
                           backup.status === 'in_progress' ? 'In Progress' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDownloadBackup(backup)}
                            className={`p-1 rounded transition-colors duration-200 ${
                              isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBackup(backup);
                              setShowRestoreModal(true);
                            }}
                            className={`p-1 rounded transition-colors duration-200 ${
                              isDark ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' : 'text-blue-500 hover:text-blue-700 hover:bg-gray-100'
                            }`}
                            title="Restore"
                            disabled={backup.status !== 'completed'}
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup)}
                            className={`p-1 rounded transition-colors duration-200 ${
                              isDark ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' : 'text-red-500 hover:text-red-700 hover:bg-gray-100'
                            }`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Backup Settings */}
        {activeTab === 'settings' && (
          <motion.div 
            className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Automatic Backups
                    </label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Enable scheduled automatic backups
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      backupSettings.autoBackup ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                    onClick={() => handleSettingChange('autoBackup', !backupSettings.autoBackup)}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backupSettings.autoBackup ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {backupSettings.autoBackup && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Backup Frequency
                      </label>
                      <select
                        value={backupSettings.frequency}
                        onChange={(e) => handleSettingChange('frequency', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Backup Time
                      </label>
                      <input
                        type="time"
                        value={backupSettings.backupTime}
                        onChange={(e) => handleSettingChange('backupTime', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        For daily, weekly, and monthly backups
                      </p>
                    </div>
                  </>
                )}
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Backup Retention (days)
                  </label>
                  <input
                    type="number"
                    value={backupSettings.retention}
                    onChange={(e) => handleSettingChange('retention', parseInt(e.target.value))}
                    min="1"
                    max="365"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className={`mt-1 text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Backups older than this will be automatically deleted
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Compression
                    </label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Compress backups to save storage space
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      backupSettings.compressionEnabled ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                    onClick={() => handleSettingChange('compressionEnabled', !backupSettings.compressionEnabled)}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backupSettings.compressionEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Encryption
                    </label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Encrypt backups for enhanced security
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      backupSettings.encryptionEnabled ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                    onClick={() => handleSettingChange('encryptionEnabled', !backupSettings.encryptionEnabled)}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backupSettings.encryptionEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Included Data
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="include-database"
                        checked={backupSettings.includedData.includes('database')}
                        onChange={(e) => {
                          const newIncludedData = e.target.checked
                            ? [...backupSettings.includedData, 'database']
                            : backupSettings.includedData.filter(item => item !== 'database');
                          handleSettingChange('includedData', newIncludedData);
                        }}
                        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark ? 'bg-gray-700 border-gray-600' : ''
                        }`}
                      />
                      <label htmlFor="include-database" className={`ml-2 text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Database
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="include-files"
                        checked={backupSettings.includedData.includes('files')}
                        onChange={(e) => {
                          const newIncludedData = e.target.checked
                            ? [...backupSettings.includedData, 'files']
                            : backupSettings.includedData.filter(item => item !== 'files');
                          handleSettingChange('includedData', newIncludedData);
                        }}
                        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark ? 'bg-gray-700 border-gray-600' : ''
                        }`}
                      />
                      <label htmlFor="include-files" className={`ml-2 text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Uploaded Files
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="include-configurations"
                        checked={backupSettings.includedData.includes('configurations')}
                        onChange={(e) => {
                          const newIncludedData = e.target.checked
                            ? [...backupSettings.includedData, 'configurations']
                            : backupSettings.includedData.filter(item => item !== 'configurations');
                          handleSettingChange('includedData', newIncludedData);
                        }}
                        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark ? 'bg-gray-700 border-gray-600' : ''
                        }`}
                      />
                      <label htmlFor="include-configurations" className={`ml-2 text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        System Configurations
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center mb-6">
              <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
              <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Confirm System Restore
              </h2>
              <p className={`transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                You are about to restore the system from backup:
              </p>
              <p className={`font-medium mt-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedBackup.name}
              </p>
              <p className={`mt-4 text-sm transition-colors duration-300 ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>
                <strong>Warning:</strong> This will replace all current data with the data from this backup. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowRestoreModal(false)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="mr-2 inline animate-spin" />
                    Restoring...
                  </>
                ) : (
                  'Restore System'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Backup;