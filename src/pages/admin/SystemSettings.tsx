import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Database, Cloud, Server, Save, 
  RefreshCw, AlertTriangle, HardDrive, Cpu,
  Zap, Globe, Clock, BarChart, Mail
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface SystemSettingsData {
  database: {
    connectionString: string;
    maxConnections: number;
    backupEnabled: boolean;
    backupFrequency: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    rateLimiting: boolean;
    maxRequestsPerMinute: number;
  };
  email: {
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    senderEmail: string;
  };
  general: {
    systemName: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: string;
  };
}

const SystemSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'database' | 'api' | 'email' | 'general'>('general');
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettingsData>({
    database: {
      connectionString: 'postgres://username:password@localhost:5432/tailoring_db',
      maxConnections: 100,
      backupEnabled: true,
      backupFrequency: 'daily',
    },
    api: {
      baseUrl: 'https://api.hudaaljarallah.com',
      timeout: 30,
      rateLimiting: true,
      maxRequestsPerMinute: 60,
    },
    email: {
      smtpServer: 'smtp.hudaaljarallah.com',
      smtpPort: 587,
      smtpUsername: 'notifications@hudaaljarallah.com',
      smtpPassword: '••••••••••••',
      senderEmail: 'no-reply@hudaaljarallah.com',
    },
    general: {
      systemName: 'Tailoring Workshop Management',
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
    }
  });

  const handleInputChange = (
    section: keyof SystemSettingsData,
    field: string,
    value: string | number | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('System settings saved successfully');
    }, 1000);
  };

  const handleTestConnection = (type: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${type} connection test successful`);
    }, 1500);
  };

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Connection String
        </label>
        <input
          type="text"
          value={settings.database.connectionString}
          onChange={(e) => handleInputChange('database', 'connectionString', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <p className={`mt-1 text-sm transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Format: postgres://username:password@host:port/database_name
        </p>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Max Connections
        </label>
        <input
          type="number"
          value={settings.database.maxConnections}
          onChange={(e) => handleInputChange('database', 'maxConnections', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
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
            Enable scheduled database backups
          </p>
        </div>
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            settings.database.backupEnabled ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
          }`}
          onClick={() => handleInputChange('database', 'backupEnabled', !settings.database.backupEnabled)}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.database.backupEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      {settings.database.backupEnabled && (
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Backup Frequency
          </label>
          <select
            value={settings.database.backupFrequency}
            onChange={(e) => handleInputChange('database', 'backupFrequency', e.target.value)}
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
      )}
      
      <div className="pt-4">
        <button
          onClick={() => handleTestConnection('Database')}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
            isDark 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Test Connection
        </button>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          API Base URL
        </label>
        <input
          type="text"
          value={settings.api.baseUrl}
          onChange={(e) => handleInputChange('api', 'baseUrl', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Request Timeout (seconds)
        </label>
        <input
          type="number"
          value={settings.api.timeout}
          onChange={(e) => handleInputChange('api', 'timeout', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Rate Limiting
          </label>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Limit API requests per client
          </p>
        </div>
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            settings.api.rateLimiting ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
          }`}
          onClick={() => handleInputChange('api', 'rateLimiting', !settings.api.rateLimiting)}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.api.rateLimiting ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      {settings.api.rateLimiting && (
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Max Requests Per Minute
          </label>
          <input
            type="number"
            value={settings.api.maxRequestsPerMinute}
            onChange={(e) => handleInputChange('api', 'maxRequestsPerMinute', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      )}
      
      <div className="pt-4">
        <button
          onClick={() => handleTestConnection('API')}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
            isDark 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Test API Endpoint
        </button>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          SMTP Server
        </label>
        <input
          type="text"
          value={settings.email.smtpServer}
          onChange={(e) => handleInputChange('email', 'smtpServer', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          SMTP Port
        </label>
        <input
          type="number"
          value={settings.email.smtpPort}
          onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          SMTP Username
        </label>
        <input
          type="text"
          value={settings.email.smtpUsername}
          onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          SMTP Password
        </label>
        <input
          type="password"
          value={settings.email.smtpPassword}
          onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Sender Email
        </label>
        <input
          type="email"
          value={settings.email.senderEmail}
          onChange={(e) => handleInputChange('email', 'senderEmail', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <p className={`mt-1 text-sm transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          This email will be used as the sender for all system emails
        </p>
      </div>
      
      <div className="pt-4">
        <button
          onClick={() => handleTestConnection('Email')}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
            isDark 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Test Email Configuration
        </button>
      </div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          System Name
        </label>
        <input
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Maintenance Mode
          </label>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            When enabled, only administrators can access the system
          </p>
        </div>
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            settings.general.maintenanceMode ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
          }`}
          onClick={() => handleInputChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.general.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Debug Mode
          </label>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Enable detailed error messages and logging
          </p>
        </div>
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            settings.general.debugMode ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
          }`}
          onClick={() => handleInputChange('general', 'debugMode', !settings.general.debugMode)}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.general.debugMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Log Level
        </label>
        <select
          value={settings.general.logLevel}
          onChange={(e) => handleInputChange('general', 'logLevel', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
          <option value="trace">Trace</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader 
        title="System Settings"
        subtitle="Configure core system settings and integrations"
        action={
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
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* System Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-lg shadow-sm p-4 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-3 transition-colors duration-300 ${
                isDark ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Server size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <div>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Server Status
                </p>
                <p className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Online
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg shadow-sm p-4 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-3 transition-colors duration-300 ${
                isDark ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <HardDrive size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
              </div>
              <div>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Storage
                </p>
                <p className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  45.2 GB / 100 GB
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg shadow-sm p-4 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-3 transition-colors duration-300 ${
                isDark ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <Cpu size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
              </div>
              <div>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  CPU Usage
                </p>
                <p className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  23%
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg shadow-sm p-4 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-3 transition-colors duration-300 ${
                isDark ? 'bg-yellow-900' : 'bg-yellow-100'
              }`}>
                <Zap size={20} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
              </div>
              <div>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Memory
                </p>
                <p className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  2.1 GB / 8 GB
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className={`p-4 border-b transition-colors duration-300 ${
                isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <h3 className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Configuration
                </h3>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                    activeTab === 'general'
                      ? isDark 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Settings size={16} className="mr-2" />
                    <span>General</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('database')}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                    activeTab === 'database'
                      ? isDark 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Database size={16} className="mr-2" />
                    <span>Database</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('api')}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                    activeTab === 'api'
                      ? isDark 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Cloud size={16} className="mr-2" />
                    <span>API</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('email')}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                    activeTab === 'email'
                      ? isDark 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Mail size={16} className="mr-2" />
                    <span>Email</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* System Info */}
            <div className={`mt-6 rounded-lg shadow-sm p-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <h3 className={`font-medium mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                System Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Version
                  </span>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    v2.5.0
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Last Updated
                  </span>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Jan 15, 2024
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Environment
                  </span>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Production
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Node.js
                  </span>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    v18.16.0
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Settings Content */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            key={activeTab}
          >
            <div className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className={`p-4 border-b transition-colors duration-300 ${
                isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <h3 className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {activeTab === 'general' && 'General Settings'}
                  {activeTab === 'database' && 'Database Configuration'}
                  {activeTab === 'api' && 'API Settings'}
                  {activeTab === 'email' && 'Email Configuration'}
                </h3>
              </div>
              
              <div className="p-6">
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'database' && renderDatabaseSettings()}
                {activeTab === 'api' && renderApiSettings()}
                {activeTab === 'email' && renderEmailSettings()}
              </div>
            </div>
            
            {/* Warning for sensitive settings */}
            {(activeTab === 'database' || activeTab === 'email') && (
              <motion.div 
                className={`mt-6 rounded-lg shadow-sm p-4 transition-colors duration-300 ${
                  isDark ? 'bg-red-900 border border-red-800' : 'bg-red-50 border border-red-100'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-start">
                  <AlertTriangle size={24} className="text-red-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className={`text-md font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-red-800'
                    }`}>
                      Warning: Sensitive Configuration
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-red-100' : 'text-red-700'
                    }`}>
                      Changes to these settings may affect system stability and security. 
                      Make sure you understand the implications before saving changes.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;