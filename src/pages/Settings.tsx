import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Bell, Mail, Smartphone, Globe, Shield, 
  Eye, Palette, Clock, Lock, Download, RotateCcw,
  CheckCircle, AlertCircle, Info, Package
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import WooCommerceIntegration from './admin/WooCommerceIntegration';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const Settings: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('notifications');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC+4');
  const [deliveryBuffer, setDeliveryBuffer] = useState(2);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const tabs: SettingsTab[] = [
    {
      id: 'notifications',
      label: t('settings.notifications.title'),
      icon: <Bell size={20} />,
      description: t('settings.notifications.description')
    },
    {
      id: 'general',
      label: t('settings.general.title'),
      icon: <SettingsIcon size={20} />,
      description: t('settings.general.description')
    },
    {
      id: 'security',
      label: t('settings.security.title'),
      icon: <Shield size={20} />,
      description: t('settings.security.description')
    },
    {
      id: 'appearance',
      label: t('settings.appearance.title'),
      icon: <Palette size={20} />,
      description: t('settings.appearance.description')
    },
    {
      id: 'woocommerce',
      label: t('woocommerce.title'),
      icon: <Package size={20} />,
      description: t('woocommerce.subtitle')
    }
  ];

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.notifications.email.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.notifications.email.description')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.notifications.email.orderUpdates')}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('settings.notifications.email.orderUpdatesDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            </label>
          </div>
        </div>
      </div>

      {/* App Notifications */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Bell className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.notifications.app.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.notifications.app.description')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.notifications.app.inApp')}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('settings.notifications.app.inAppDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appNotifications}
                onChange={(e) => setAppNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                appNotifications ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
            </label>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Smartphone className="text-purple-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.notifications.sms.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.notifications.sms.description')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.notifications.sms.urgent')}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('settings.notifications.sms.urgentDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                smsNotifications ? 'bg-purple-600' : 'bg-gray-300'
              }`}></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-8">
      {/* Language Settings */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.general.language.title')}
            </h3>
          </div>
        </div>
        <div className="space-y-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Timezone Settings */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.general.timezone.title')}
            </h3>
          </div>
        </div>
        <div className="space-y-4">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          >
            <option value="UTC+4">UAE (UTC+4)</option>
            <option value="UTC+3">KSA (UTC+3)</option>
            <option value="UTC+0">GMT (UTC+0)</option>
          </select>
        </div>
      </div>

      {/* Delivery Buffer */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="text-orange-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.general.deliveryBuffer.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.general.deliveryBuffer.description')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="0"
              max="30"
              value={deliveryBuffer}
              onChange={(e) => setDeliveryBuffer(parseInt(e.target.value))}
              className={`w-20 px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('settings.general.deliveryBuffer.days')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      {/* Password */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Lock className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.security.password.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.security.password.lastChanged')}: 30 {t('settings.security.password.days')}
            </p>
          </div>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          {t('settings.security.password.change')}
        </button>
      </div>

      {/* Two Factor Authentication */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="text-purple-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.security.twoFactor.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.security.twoFactor.description')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.security.twoFactor.enable')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={(e) => setTwoFactorAuth(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              twoFactorAuth ? 'bg-purple-600' : 'bg-gray-300'
            }`}></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Palette className="text-indigo-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.appearance.theme.title')}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: t('settings.appearance.theme.light'), icon: '☀️' },
            { value: 'dark', label: t('settings.appearance.theme.dark'), icon: '🌙' },
            { value: 'auto', label: t('settings.appearance.theme.auto'), icon: '🔄' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : isDark
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className={`text-sm font-medium ${
                theme === option.value
                  ? 'text-blue-600'
                  : isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Preview */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Eye className="text-yellow-600" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.appearance.preview.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.appearance.preview.description')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('settings.appearance.preview.cardTitle')}
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('settings.appearance.preview.cardDescription')}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
              {t('settings.appearance.preview.successButton')}
            </button>
            <button className={`px-4 py-2 rounded-lg text-sm border ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'
            }`}>
              {t('settings.appearance.preview.secondaryButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWooCommerceTab = () => (
    <WooCommerceIntegration />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationsTab();
      case 'general':
        return renderGeneralTab();
      case 'security':
        return renderSecurityTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'woocommerce':
        return renderWooCommerceTab();
      default:
        return renderNotificationsTab();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('settings.title')} ⚙️
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('settings.description')}
          </p>
        </div>
      </motion.div>

      <div className="flex space-x-6">
        {/* Sidebar Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4`}
        >
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs ${
                    activeTab === tab.id ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>{t('settings.actions.save')}</span>
            </button>
            <button className={`px-6 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
              isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
              <RotateCcw size={16} />
              <span>{t('settings.actions.reset')}</span>
            </button>
          </div>
          <button className={`px-6 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
            isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
            <Download size={16} />
            <span>{t('settings.actions.export')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;