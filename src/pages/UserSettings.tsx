import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, Shield, Bell, 
  Eye, EyeOff, Lock, Mail, 
  Phone, Globe, Palette, Moon,
  Sun, Monitor, Save, Camera,
  Key, Smartphone, Calendar, Clock,
  Package, Factory, FileText
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const UserSettings: React.FC = () => {
  const { isDark, setTheme } = useTheme();
  const { t, isRTL, setLanguage, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'Ahmed Ali',
    email: 'ahmed@example.com',
    phone: '+965 9999 9999',
    position: 'Production Manager',
    department: 'Manufacturing',
    avatar: null as File | null
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    sessionTimeout: 30,
    loginNotifications: true
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    systemAlerts: true,
    productionUpdates: false,
    weeklyReports: true,
    maintenanceAlerts: true
  });

  const [preferencesData, setPreferencesData] = useState({
    language: language,
    theme: isDark ? 'dark' : 'light',
    timezone: 'Asia/Kuwait',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'KWD',
    dashboardLayout: 'default'
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    // Show success message
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileData({ ...profileData, avatar: file });
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setPreferencesData({ ...preferencesData, theme: newTheme });
    if (newTheme === 'dark') {
      setTheme('dark');
    } else if (newTheme === 'light') {
      setTheme('light');
    } else {
      setTheme('auto');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setPreferencesData({ ...preferencesData, language: newLanguage });
    setLanguage(newLanguage as 'en' | 'ar');
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
            <Settings className="h-8 w-8 text-blue-600" />
            User Settings
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Manage your account preferences and security settings
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b" style={{ borderColor: 'var(--border-color)' }}
      >
        <nav className="flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={16} /> },
            { id: 'security', label: 'Security', icon: <Shield size={16} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
            { id: 'preferences', label: 'Preferences', icon: <Settings size={16} /> }
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
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button 
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Click to change your profile picture
                  </p>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Position
                      </label>
                      <input
                        type="text"
                        value={profileData.position}
                        onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Department
                      </label>
                      <select
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Quality Control">Quality Control</option>
                        <option value="Sales">Sales</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Section */}
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Change Password
              </h3>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
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

            {/* Security Settings */}
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Security Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-blue-600" size={20} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityData.twoFactorEnabled}
                    onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <Bell className="text-green-600" size={20} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Login Notifications
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Get notified when someone logs into your account
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityData.loginNotifications}
                    onChange={(e) => setSecurityData({ ...securityData, loginNotifications: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-orange-600" size={20} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Session Timeout
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Automatically log out after period of inactivity
                      </p>
                    </div>
                  </div>
                  <select
                    value={securityData.sessionTimeout}
                    onChange={(e) => setSecurityData({ ...securityData, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email', icon: <Mail size={20} /> },
                { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications', icon: <Bell size={20} /> },
                { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about order status changes', icon: <Package size={20} /> },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications and alerts', icon: <Shield size={20} /> },
                { key: 'productionUpdates', label: 'Production Updates', description: 'Updates about production progress', icon: <Factory size={20} /> },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly performance reports', icon: <FileText size={20} /> },
                { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'System maintenance and downtime notifications', icon: <Settings size={20} /> }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {setting.icon}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {setting.label}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationData[setting.key as keyof typeof notificationData] as boolean}
                    onChange={(e) => setNotificationData({ 
                      ...notificationData, 
                      [setting.key]: e.target.checked 
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Appearance Settings */}
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Appearance
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: <Sun size={20} /> },
                      { value: 'dark', label: 'Dark', icon: <Moon size={20} /> },
                      { value: 'auto', label: 'Auto', icon: <Monitor size={20} /> }
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => handleThemeChange(theme.value)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          preferencesData.theme === theme.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: preferencesData.theme === theme.value ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)',
                          borderColor: preferencesData.theme === theme.value ? '#3b82f6' : 'var(--border-color)'
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {theme.icon}
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {theme.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Language
                  </label>
                  <select
                    value={preferencesData.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Localization Settings */}
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Localization
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Timezone
                  </label>
                  <select
                    value={preferencesData.timezone}
                    onChange={(e) => setPreferencesData({ ...preferencesData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="Asia/Kuwait">Kuwait (GMT+3)</option>
                    <option value="Asia/Riyadh">Riyadh (GMT+3)</option>
                    <option value="Asia/Dubai">Dubai (GMT+4)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Date Format
                  </label>
                  <select
                    value={preferencesData.dateFormat}
                    onChange={(e) => setPreferencesData({ ...preferencesData, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Time Format
                  </label>
                  <select
                    value={preferencesData.timeFormat}
                    onChange={(e) => setPreferencesData({ ...preferencesData, timeFormat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="24h">24 Hour</option>
                    <option value="12h">12 Hour (AM/PM)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Currency
                  </label>
                  <select
                    value={preferencesData.currency}
                    onChange={(e) => setPreferencesData({ ...preferencesData, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="KWD">KWD - Kuwaiti Dinar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserSettings;