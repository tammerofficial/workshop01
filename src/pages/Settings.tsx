import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Bell, Globe, Shield, 
  Eye, Palette, RotateCcw,
  CheckCircle, Sun, Moon, Monitor, Languages, Type, 
  Layout, Zap, Sliders, Brush, Layers, Sparkles
} from 'lucide-react';
import { useTheme, AdvancedAppearanceSettings } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import WooCommerceIntegration from './admin/WooCommerceIntegration';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  label: string;
}

interface SliderControlProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, setValue, min, max, step, unit = '' }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm text-gray-500 dark:text-gray-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
};

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, setEnabled, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label 
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          {label}
        </label>
        {description && (
          <p 
            className="text-xs text-gray-500 dark:text-gray-400 mt-1"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 0.75)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)'
            }}
          >
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          enabled 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
        }`}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const ColorPicker: React.FC<ColorPickerProps> = ({ color, setColor, label }) => {
  const predefinedColors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#10b981',
    '#f97316', '#84cc16', '#6366f1', '#14b8a6'
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</h4>
      <div className="grid grid-cols-6 gap-2">
        {predefinedColors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
              color === c ? 'border-white ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-gray-400' : 'border-gray-200 dark:border-gray-600'
            }`}
            style={{ backgroundColor: c }}
            title={`Color ${c}`}
          />
        ))}
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-16 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
          title="Custom color picker"
        />
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom</span>
          <div className="text-xs text-gray-500 dark:text-gray-400">{color}</div>
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  // Helper to check if color is dark
  function isColorDark(hex: string) {
    if (!hex) return false;
    let c = hex.substring(1); // strip #
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb) & 0xff;
    // Perceived brightness
    return (r*0.299 + g*0.587 + b*0.114) < 150;
  }
  
  const { theme, setTheme, primaryColor, setPrimaryColor, advancedSettings, setAdvancedSettings } = useTheme();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('appearance');
  const [tempColor, setTempColor] = useState(primaryColor);
  
  // Toggle states for notifications and settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: false,
    inventoryAlerts: true,
    systemUpdates: false
  });
  
  const [generalSettings, setGeneralSettings] = useState({
    autoSave: true,
    darkModeAuto: false,
    compactMode: false,
    animationsEnabled: true
  });

  // Helper function to update advanced settings
  const updateAdvancedSettings = (updates: Partial<AdvancedAppearanceSettings>) => {
    const newSettings = {
      ...advancedSettings,
      ...updates,
      colors: { ...advancedSettings.colors, ...(updates.colors || {}) },
      typography: { ...advancedSettings.typography, ...(updates.typography || {}) },
      spacing: { ...advancedSettings.spacing, ...(updates.spacing || {}) },
      shadows: { ...advancedSettings.shadows, ...(updates.shadows || {}) },
      animations: { ...advancedSettings.animations, ...(updates.animations || {}) }
    };
    setAdvancedSettings(newSettings);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  const tabs: SettingsTab[] = [
    {
      id: 'appearance',
      label: 'settings.appearance.title',
      icon: <Palette size={20} />,
      description: 'settings.appearance.description',
    },
    {
      id: 'advanced-appearance',
      label: 'إعدادات المظهر المتقدمة',
      icon: <Sliders size={20} />,
      description: 'تحكم شامل في جميع عناصر المظهر',
    },
    {
      id: 'notifications',
      label: 'settings.notifications.title',
      icon: <Bell size={20} />,
      description: 'settings.notifications.description',
    },
    {
      id: 'general',
      label: 'settings.general.title',
      icon: <SettingsIcon size={20} />,
      description: 'settings.general.description',
    },
    {
      id: 'security',
      label: 'settings.security.title',
      icon: <Shield size={20} />,
      description: 'settings.security.description',
    },
    {
      id: 'woocommerce',
      label: 'settings.woocommerce.title',
      icon: <Globe size={20} />,
      description: 'settings.woocommerce.description',
    },
  ];

  const renderAdvancedAppearanceTab = () => (
    <div className="space-y-8">
      {/* Color System */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 
          className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'calc(var(--font-size) * 1.25)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          <Brush size={24} className={isRTL ? 'ml-3' : 'mr-3'} />
          إعدادات المظهر المتقدمة
        </h3>
        <p 
          className="text-gray-600 dark:text-gray-400 mb-6"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          تحكم شامل في جميع عناصر المظهر
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ColorPicker 
            label="اللون الأساسي"
            color={advancedSettings.colors.primary}
            setColor={(color) => updateAdvancedSettings({
              colors: { ...advancedSettings.colors, primary: color }
            })}
          />
          
          <ColorPicker 
            label="اللون الثانوي"
            color={advancedSettings.colors.secondary}
            setColor={(color) => updateAdvancedSettings({
              colors: { ...advancedSettings.colors, secondary: color }
            })}
          />
          
          <ColorPicker 
            label="لون التمييز"
            color={advancedSettings.colors.accent}
            setColor={(color) => updateAdvancedSettings({
              colors: { ...advancedSettings.colors, accent: color }
            })}
          />
          
          <ColorPicker 
            label="لون الخلفية"
            color={advancedSettings.colors.background}
            setColor={(color) => updateAdvancedSettings({
              colors: { ...advancedSettings.colors, background: color }
            })}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Type size={24} className={isRTL ? 'ml-3' : 'mr-3'} />
          إعدادات الخطوط
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عائلة الخط
              </label>
              <select 
                value={advancedSettings.typography.fontFamily}
                onChange={(e) => updateAdvancedSettings({ typography: { ...advancedSettings.typography, fontFamily: e.target.value } })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="SF Pro Display">SF Pro Display</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Cairo">Cairo (عربي)</option>
                <option value="Tajawal">Tajawal (عربي)</option>
              </select>
            </div>
            
            <SliderControl
              label="حجم الخط الأساسي"
              value={advancedSettings.typography.fontSize}
              setValue={(value) => updateAdvancedSettings({ typography: { ...advancedSettings.typography, fontSize: value } })}
              min={12}
              max={24}
              step={1}
              unit="px"
            />
          </div>
          
          <div className="space-y-4">
            <SliderControl
              label="وزن الخط"
              value={advancedSettings.typography.fontWeight}
              setValue={(value) => updateAdvancedSettings({ typography: { ...advancedSettings.typography, fontWeight: value } })}
              min={100}
              max={900}
              step={100}
            />
            
            <SliderControl
              label="ارتفاع السطر"
              value={advancedSettings.typography.lineHeight}
              setValue={(value) => updateAdvancedSettings({ typography: { ...advancedSettings.typography, lineHeight: value } })}
              min={1}
              max={2.5}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* Spacing & Layout */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Layout size={24} className={isRTL ? 'ml-3' : 'mr-3'} />
          المساحات والتخطيط
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SliderControl
              label="الحشو الداخلي"
              value={advancedSettings.spacing.padding}
              setValue={(value) => updateAdvancedSettings({ spacing: { ...advancedSettings.spacing, padding: value } })}
              min={4}
              max={32}
              step={2}
              unit="px"
            />
            
            <SliderControl
              label="الهامش الخارجي"
              value={advancedSettings.spacing.margin}
              setValue={(value) => updateAdvancedSettings({ spacing: { ...advancedSettings.spacing, margin: value } })}
              min={0}
              max={24}
              step={2}
              unit="px"
            />
          </div>
          
          <div className="space-y-4">
            <SliderControl
              label="استدارة الحواف"
              value={advancedSettings.spacing.borderRadius}
              setValue={(value) => updateAdvancedSettings({ spacing: { ...advancedSettings.spacing, borderRadius: value } })}
              min={0}
              max={24}
              step={2}
              unit="px"
            />
            
            <SliderControl
              label="المسافة بين العناصر"
              value={advancedSettings.spacing.gap}
              setValue={(value) => updateAdvancedSettings({ spacing: { ...advancedSettings.spacing, gap: value } })}
              min={4}
              max={32}
              step={2}
              unit="px"
            />
          </div>
        </div>
      </div>

      {/* Shadows & Effects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Layers size={24} className={isRTL ? 'ml-3' : 'mr-3'} />
          الظلال والتأثيرات
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SliderControl
            label="حجم الظل"
            value={advancedSettings.shadows.shadowSize}
            setValue={(value) => updateAdvancedSettings({ shadows: { ...advancedSettings.shadows, shadowSize: value } })}
            min={0}
            max={16}
            step={1}
            unit="px"
          />
          
          <SliderControl
            label="ضبابية الظل"
            value={advancedSettings.shadows.shadowBlur}
            setValue={(value) => updateAdvancedSettings({ shadows: { ...advancedSettings.shadows, shadowBlur: value } })}
            min={0}
            max={32}
            step={2}
            unit="px"
          />
          
          <SliderControl
            label="شفافية الظل"
            value={advancedSettings.shadows.shadowOpacity}
            setValue={(value) => updateAdvancedSettings({ shadows: { ...advancedSettings.shadows, shadowOpacity: value } })}
            min={0}
            max={1}
            step={0.05}
          />
        </div>
      </div>

      {/* Animations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Zap size={24} className={isRTL ? 'ml-3' : 'mr-3'} />
          الحركة والانيميشن
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SliderControl
            label="مدة الانتقال"
            value={advancedSettings.animations.duration}
            setValue={(value) => updateAdvancedSettings({ animations: { ...advancedSettings.animations, duration: value } })}
            min={50}
            max={1000}
            step={50}
            unit="ms"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نوع الانتقال
            </label>
            <select 
              value={advancedSettings.animations.easing}
              onChange={(e) => updateAdvancedSettings({ animations: { ...advancedSettings.animations, easing: e.target.value } })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ease">سهل</option>
              <option value="ease-in">سهل للداخل</option>
              <option value="ease-out">سهل للخارج</option>
              <option value="ease-in-out">سهل للداخل والخارج</option>
              <option value="linear">خطي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Eye size={24} className={isRTL ? 'ml-3' : 'mr-3'} />
          معاينة مباشرة
        </h3>
        
        <div 
          className="p-6 rounded-lg border transition-all"
          style={{
            backgroundColor: advancedSettings.colors.surface,
            borderColor: advancedSettings.colors.border,
            borderRadius: `${advancedSettings.spacing.borderRadius}px`,
            padding: `${advancedSettings.spacing.padding}px`,
            margin: `${advancedSettings.spacing.margin}px`,
            boxShadow: `0 ${advancedSettings.shadows.shadowSize}px ${advancedSettings.shadows.shadowBlur}px rgba(0, 0, 0, ${advancedSettings.shadows.shadowOpacity})`,
            transitionDuration: `${advancedSettings.animations.duration}ms`,
            transitionTimingFunction: advancedSettings.animations.easing,
            fontFamily: advancedSettings.typography.fontFamily,
            fontSize: `${advancedSettings.typography.fontSize}px`,
            fontWeight: advancedSettings.typography.fontWeight,
            lineHeight: advancedSettings.typography.lineHeight
          }}
        >
          <h4 
            className="font-bold mb-4"
            style={{ color: advancedSettings.colors.primary }}
          >
            عنوان تجريبي
          </h4>
          <p style={{ color: advancedSettings.colors.secondary }}>
            هذا نص تجريبي لمعاينة التغييرات التي تم تطبيقها على المظهر. يمكنك رؤية تأثير الألوان والخطوط والمساحات والظلال في الوقت الفعلي.
          </p>
          <button
            className="mt-4 px-6 py-2 rounded transition-all hover:opacity-90"
            style={{
              backgroundColor: advancedSettings.colors.primary,
              color: isColorDark(advancedSettings.colors.primary) ? '#ffffff' : '#000000',
              borderRadius: `${advancedSettings.spacing.borderRadius}px`,
              padding: `${advancedSettings.spacing.padding/2}px ${advancedSettings.spacing.padding}px`,
              transitionDuration: `${advancedSettings.animations.duration}ms`,
              transitionTimingFunction: advancedSettings.animations.easing
            }}
          >
            زر تجريبي
          </button>
        </div>
      </div>

      {/* Apply Changes */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              تطبيق التغييرات
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              اضغط لتطبيق جميع التخصيصات على النظام
            </p>
          </div>
          <button
            onClick={() => {
              setPrimaryColor(advancedSettings.colors.primary);
              // Apply other settings to CSS variables
              const root = document.documentElement;
              root.style.setProperty('--primary-color', advancedSettings.colors.primary);
              root.style.setProperty('--secondary-color', advancedSettings.colors.secondary);
              root.style.setProperty('--accent-color', advancedSettings.colors.accent);
            }}
            className="btn-primary text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
            style={{
              backgroundColor: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              borderRadius: 'var(--border-radius)',
              transition: 'all var(--transition-duration) var(--transition-easing)'
            }}
          >
            <Sparkles size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
            تطبيق الآن
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'calc(var(--font-size) * 1.125)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          <Eye size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
          Appearance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'light' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Sun size={24} className="text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('settings.appearance.theme.light')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.theme.lightDesc')}</div>
            </div>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'dark' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Moon size={24} className="text-blue-400" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('settings.appearance.theme.dark')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.theme.darkDesc')}</div>
            </div>
          </button>
          <button
            onClick={() => setTheme('auto')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'auto' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Monitor size={24} className="text-gray-500" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('settings.appearance.theme.auto')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.theme.autoDesc')}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Color Customization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Palette size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
          {t('settings.appearance.primaryColor.title')}
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.appearance.primaryColor.title')}
            </label>
            <ColorPicker color={tempColor} setColor={setTempColor} label={t('settings.appearance.primaryColor.title')} />
          </div>
          
          <button
            onClick={() => setPrimaryColor(tempColor)}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <CheckCircle size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
            {t('settings.actions.save')}
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Languages size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
          {t('settings.general.language.title')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              language === 'en' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100">🇺🇸 English</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.general.language.ltr')}</div>
          </button>

          <button
            onClick={() => setLanguage('ar')}
            className={`p-4 rounded-lg border-2 transition-all text-right ${
              language === 'ar' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100">🇸🇦 العربية</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.general.language.rtl')}</div>
          </button>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('settings.appearance.preview.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('settings.appearance.preview.description')}
        </p>
        
        <div className="space-y-4">
          {/* Sample Card */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('settings.appearance.preview.cardTitle')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t('settings.appearance.preview.cardDescription')}
            </p>
            
            <div className="flex space-x-3">
              <button 
                className="px-4 py-2 text-white rounded-md transition-colors hover:opacity-90 bg-primary"
              >
                {t('settings.appearance.preview.successButton')}
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                {t('settings.appearance.preview.secondaryButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'calc(var(--font-size) * 1.125)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          <Bell size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
          Notification Preferences
        </h3>
        <p 
          className="text-gray-600 dark:text-gray-400 mb-6"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          Configure how you receive notifications
        </p>
        
        <div className="space-y-4">
          <ToggleSwitch
            label="Email Notifications"
            enabled={notificationSettings.emailNotifications}
            setEnabled={(enabled) => setNotificationSettings(prev => ({ ...prev, emailNotifications: enabled }))}
            description="Receive notifications via email"
          />
          
          <ToggleSwitch
            label="Push Notifications"
            enabled={notificationSettings.pushNotifications}
            setEnabled={(enabled) => setNotificationSettings(prev => ({ ...prev, pushNotifications: enabled }))}
            description="Receive push notifications in your browser"
          />
          
          <ToggleSwitch
            label="Task Reminders"
            enabled={notificationSettings.taskReminders}
            setEnabled={(enabled) => setNotificationSettings(prev => ({ ...prev, taskReminders: enabled }))}
            description="Get reminded about upcoming tasks"
          />
          
          <ToggleSwitch
            label="Inventory Alerts"
            enabled={notificationSettings.inventoryAlerts}
            setEnabled={(enabled) => setNotificationSettings(prev => ({ ...prev, inventoryAlerts: enabled }))}
            description="Alert when inventory is low"
          />
          
          <ToggleSwitch
            label="System Updates"
            enabled={notificationSettings.systemUpdates}
            setEnabled={(enabled) => setNotificationSettings(prev => ({ ...prev, systemUpdates: enabled }))}
            description="Notifications about system updates and maintenance"
          />
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'calc(var(--font-size) * 1.125)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          <SettingsIcon size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
          General Settings
        </h3>
        <p 
          className="text-gray-600 dark:text-gray-400 mb-6"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          Configure application preferences
        </p>
        
        <div className="space-y-4">
          <ToggleSwitch
            label="Auto Save"
            enabled={generalSettings.autoSave}
            setEnabled={(enabled) => setGeneralSettings(prev => ({ ...prev, autoSave: enabled }))}
            description="Automatically save changes"
          />
          
          <ToggleSwitch
            label="Auto Dark Mode"
            enabled={generalSettings.darkModeAuto}
            setEnabled={(enabled) => setGeneralSettings(prev => ({ ...prev, darkModeAuto: enabled }))}
            description="Switch to dark mode based on system preference"
          />
          
          <ToggleSwitch
            label="Compact Mode"
            enabled={generalSettings.compactMode}
            setEnabled={(enabled) => setGeneralSettings(prev => ({ ...prev, compactMode: enabled }))}
            description="Use compact layout to show more content"
          />
          
          <ToggleSwitch
            label="Animations"
            enabled={generalSettings.animationsEnabled}
            setEnabled={(enabled) => setGeneralSettings(prev => ({ ...prev, animationsEnabled: enabled }))}
            description="Enable smooth animations and transitions"
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'calc(var(--font-size) * 1.125)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          <Shield size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
          Security & Privacy
        </h3>
        <p 
          className="text-gray-600 dark:text-gray-400"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)'
          }}
        >
          Manage your account security settings
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {t('settings.security.description')}
        </p>
      </div>
    </div>
  );

  const renderWooCommerceTab = () => (
    <WooCommerceIntegration />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'advanced-appearance':
        return renderAdvancedAppearanceTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'general':
        return renderGeneralTab();
      case 'security':
        return renderSecurityTab();
      case 'woocommerce':
        return renderWooCommerceTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.875)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)'
            }}
          >
            <SettingsIcon size={32} className={isRTL ? 'ml-3' : 'mr-3'} />
            Settings ⚙️
          </h1>
          <p 
            className="text-lg text-gray-600 dark:text-gray-400 mt-2"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.125)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)'
            }}
          >
            Customize the look and feel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-2"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} p-3 rounded-lg transition-all text-left ${isRTL ? 'text-right' : ''} relative group ${
                    activeTab === tab.id
                      ? `!bg-primary ${isColorDark(primaryColor) ? '!text-white' : '!text-black'} border-l-4 border-primary`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    ...(activeTab !== tab.id && {
                      '--primary-color-rgb': primaryColor.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')
                    })
                  } as React.CSSProperties}
                >
                  {/* Hover overlay with theme color */}
                  {activeTab !== tab.id && (
                    <div 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: `${primaryColor}15`
                      }}
                    />
                  )}
                  <div className="relative z-10 flex items-center space-x-3">
                    <span className={`${activeTab !== tab.id ? 'group-hover:text-primary' : ''} transition-colors`}>
                      {tab.icon}
                    </span>
                    <div>
                      <div 
                        className={`font-medium ${activeTab !== tab.id ? 'group-hover:text-primary' : ''} transition-colors`}
                        style={{
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--font-size)',
                          fontWeight: 'var(--font-weight)',
                          lineHeight: 'var(--line-height)'
                        }}
                      >
                        {t(tab.label)}
                      </div>
                      <div 
                        className="text-xs text-gray-500 dark:text-gray-400"
                        style={{
                          fontFamily: 'var(--font-family)',
                          fontSize: 'calc(var(--font-size) * 0.75)',
                          fontWeight: 'var(--font-weight)',
                          lineHeight: 'var(--line-height)'
                        }}
                      >
                        {t(tab.description)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeTab}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
        >
          <div className={`flex space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
            <button
              className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
              {t('settings.actions.save')}
            </button>
            <button
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
              {t('settings.actions.reset')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;






