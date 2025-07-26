import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orders',
    'nav.inventory': 'Inventory',
    'nav.workers': 'Workers',
    'nav.calendar': 'Calendar',
    'nav.production': 'Production Flow',
    'nav.stations': 'Stations',
    'nav.analytics': 'Analytics',
    'nav.advanced': 'Advanced Features',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    
    // Settings Page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your application preferences and configurations',
    'settings.notifications.title': 'Notification Preferences',
    'settings.notifications.subtitle': 'Configure how you receive notifications',
    'settings.notifications.email': 'Email Notifications',
    'settings.notifications.email.desc': 'Receive order and system updates via email',
    'settings.notifications.inapp': 'In-App Notifications',
    'settings.notifications.inapp.desc': 'Show notifications within the application',
    'settings.notifications.sms': 'SMS Notifications',
    'settings.notifications.sms.desc': 'Receive urgent updates via SMS',
    'settings.general.title': 'General Settings',
    'settings.general.subtitle': 'Configure application preferences',
    'settings.language': 'Language',
    'settings.timezone': 'Time Zone',
    'settings.theme': 'Theme',
    'settings.delivery.buffer': 'Delivery Buffer (Days)',
    'settings.delivery.buffer.desc': 'Additional days to add to estimated delivery dates',
    'settings.security.title': 'Security & Privacy',
    'settings.security.subtitle': 'Manage your account security settings',
    'settings.security.password': 'Password',
    'settings.security.password.desc': 'Last changed 30 days ago',
    'settings.security.password.change': 'Change Password',
    'settings.security.2fa': 'Two-Factor Authentication',
    'settings.security.2fa.desc': 'Add an extra layer of security to your account',
    'settings.security.2fa.enable': 'Enable 2FA',
    'settings.reset': 'Reset to Defaults',
    'settings.export': 'Export Settings',
    'settings.save': 'Save All Changes',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.search': 'Search orders, workers, inventory',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    
    // Theme options
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    
    // Languages
    'language.english': 'English',
    'language.arabic': 'Arabic',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.orders': 'الطلبات',
    'nav.inventory': 'المخزون',
    'nav.workers': 'العمال',
    'nav.calendar': 'التقويم',
    'nav.production': 'تدفق الإنتاج',
    'nav.stations': 'المحطات',
    'nav.analytics': 'التحليلات',
    'nav.advanced': 'الميزات المتقدمة',
    'nav.notifications': 'الإشعارات',
    'nav.settings': 'الإعدادات',
    
    // Settings Page
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'إدارة تفضيلات التطبيق والتكوينات',
    'settings.notifications.title': 'تفضيلات الإشعارات',
    'settings.notifications.subtitle': 'تكوين كيفية تلقي الإشعارات',
    'settings.notifications.email': 'إشعارات البريد الإلكتروني',
    'settings.notifications.email.desc': 'تلقي تحديثات الطلبات والنظام عبر البريد الإلكتروني',
    'settings.notifications.inapp': 'الإشعارات داخل التطبيق',
    'settings.notifications.inapp.desc': 'عرض الإشعارات داخل التطبيق',
    'settings.notifications.sms': 'إشعارات الرسائل النصية',
    'settings.notifications.sms.desc': 'تلقي التحديثات العاجلة عبر الرسائل النصية',
    'settings.general.title': 'الإعدادات العامة',
    'settings.general.subtitle': 'تكوين تفضيلات التطبيق',
    'settings.language': 'اللغة',
    'settings.timezone': 'المنطقة الزمنية',
    'settings.theme': 'المظهر',
    'settings.delivery.buffer': 'فترة التسليم الإضافية (أيام)',
    'settings.delivery.buffer.desc': 'أيام إضافية لإضافتها إلى تواريخ التسليم المقدرة',
    'settings.security.title': 'الأمان والخصوصية',
    'settings.security.subtitle': 'إدارة إعدادات أمان حسابك',
    'settings.security.password': 'كلمة المرور',
    'settings.security.password.desc': 'آخر تغيير منذ 30 يوماً',
    'settings.security.password.change': 'تغيير كلمة المرور',
    'settings.security.2fa': 'المصادقة الثنائية',
    'settings.security.2fa.desc': 'إضافة طبقة حماية إضافية لحسابك',
    'settings.security.2fa.enable': 'تفعيل المصادقة الثنائية',
    'settings.reset': 'إعادة تعيين للافتراضي',
    'settings.export': 'تصدير الإعدادات',
    'settings.save': 'حفظ جميع التغييرات',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.add': 'إضافة',
    'common.search': 'البحث في الطلبات والعمال والمخزون',
    'common.filter': 'تصفية',
    'common.loading': 'جاري التحميل...',
    'common.success': 'نجح',
    'common.error': 'خطأ',
    
    // Theme options
    'theme.light': 'فاتح',
    'theme.dark': 'داكن',
    
    // Languages
    'language.english': 'الإنجليزية',
    'language.arabic': 'العربية',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
      // Apply RTL direction for Arabic
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);
    
    // Apply RTL direction for Arabic
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isRTL
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};