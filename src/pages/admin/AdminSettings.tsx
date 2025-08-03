import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  User,
  Users,
  Shield,
  FileText,
  Database,
  Download,
  Upload,
  Monitor,
  Palette,
  Bell,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface SettingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  path?: string;
  action?: () => void;
  badge?: string;
  isExternal?: boolean;
}

const AdminSettings: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('account');

  // Mock user data - in real app this would come from context/API
  const currentUser = {
    name: 'admin',
    email: 'admin@workshop.com',
    role: 'System Administrator',
    avatar: null
  };

  const settingCategories: SettingCategory[] = [
    {
      id: 'account',
      title: 'إعدادات الحساب',
      description: 'إدارة ملفك الشخصي وإعدادات الحساب',
      icon: <User className="w-6 h-6" />,
      color: 'blue',
      items: [
        {
          id: 'profile',
          title: t('admin.myProfile'),
          description: 'تعديل المعلومات الشخصية وكلمة المرور',
          path: '/admin/profile'
        },
        {
          id: 'preferences',
          title: 'التفضيلات',
          description: 'إعدادات اللغة والمظهر والإشعارات',
          path: '/admin/preferences'
        }
      ]
    },
    {
      id: 'users',
      title: 'إدارة المستخدمين',
      description: 'إدارة المستخدمين والأدوار والصلاحيات',
      icon: <Users className="w-6 h-6" />,
      color: 'green',
      items: [
        {
          id: 'user-management',
          title: t('admin.userManagement'),
          description: 'إضافة وتعديل وحذف المستخدمين',
          path: '/admin/users',
          badge: 'مهم'
        },
        {
          id: 'roles-permissions',
          title: t('admin.rolesPermissions'),
          description: 'إدارة الأدوار والصلاحيات',
          path: '/admin/roles',
          badge: 'مهم'
        }
      ]
    },
    {
      id: 'security',
      title: 'الأمان والمراقبة',
      description: 'مراقبة النظام وسجلات الأمان',
      icon: <Shield className="w-6 h-6" />,
      color: 'red',
      items: [
        {
          id: 'security-logs',
          title: t('admin.securityLogs'),
          description: 'عرض سجلات الأمان وتسجيل الدخول',
          path: '/rbac-dashboard',
          badge: 'أمان'
        },
        {
          id: 'audit-logs',
          title: 'سجلات المراجعة',
          description: 'تتبع جميع العمليات في النظام',
          path: '/admin/audit-logs'
        },
        {
          id: 'access-control',
          title: 'التحكم في الوصول',
          description: 'إعدادات الوصول والجلسات',
          path: '/admin/access-control'
        }
      ]
    },
    {
      id: 'system',
      title: 'إعدادات النظام',
      description: 'إعدادات عامة للنظام والتكوين',
      icon: <Settings className="w-6 h-6" />,
      color: 'purple',
      items: [
        {
          id: 'system-settings',
          title: t('admin.systemSettings'),
          description: 'إعدادات عامة للنظام',
          path: '/admin/system'
        },
        {
          id: 'integrations',
          title: 'التكاملات',
          description: 'إعدادات التكامل مع الأنظمة الخارجية',
          path: '/admin/integrations'
        },
        {
          id: 'api-settings',
          title: 'إعدادات API',
          description: 'إدارة مفاتيح API والوصول',
          path: '/admin/api'
        }
      ]
    },
    {
      id: 'backup',
      title: 'النسخ الاحتياطي',
      description: 'إدارة النسخ الاحتياطي والاستعادة',
      icon: <Database className="w-6 h-6" />,
      color: 'orange',
      items: [
        {
          id: 'backup-restore',
          title: t('admin.backupRestore'),
          description: 'إنشاء واستعادة النسخ الاحتياطية',
          path: '/admin/backup'
        },
        {
          id: 'auto-backup',
          title: 'النسخ التلقائي',
          description: 'إعدادات النسخ الاحتياطي التلقائي',
          path: '/admin/auto-backup'
        },
        {
          id: 'export-data',
          title: 'تصدير البيانات',
          description: 'تصدير بيانات النظام',
          action: () => console.log('Export data')
        }
      ]
    },
    {
      id: 'appearance',
      title: 'المظهر والعرض',
      description: 'تخصيص واجهة النظام',
      icon: <Palette className="w-6 h-6" />,
      color: 'pink',
      items: [
        {
          id: 'theme-settings',
          title: 'إعدادات المظهر',
          description: 'تغيير المظهر والألوان',
          path: '/admin/theme'
        },
        {
          id: 'layout-settings',
          title: 'إعدادات التخطيط',
          description: 'تخصيص تخطيط الصفحات',
          path: '/admin/layout'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      description: 'إعدادات الإشعارات والتنبيهات',
      icon: <Bell className="w-6 h-6" />,
      color: 'yellow',
      items: [
        {
          id: 'notification-settings',
          title: 'إعدادات الإشعارات',
          description: 'تخصيص أنواع الإشعارات',
          path: '/admin/notifications'
        },
        {
          id: 'email-settings',
          title: 'إعدادات البريد',
          description: 'تكوين خادم البريد الإلكتروني',
          path: '/admin/email'
        }
      ]
    }
  ];

  const handleItemClick = (item: SettingItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      pink: 'bg-pink-100 text-pink-600 border-pink-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            {t('admin.settings')}
          </h1>
          <p className="text-gray-600 mt-1">إدارة جميع إعدادات النظام والحساب</p>
        </div>
      </div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div className="mr-4">
            <h2 className="text-xl font-semibold">{currentUser.name}</h2>
            <p className="text-blue-100">{currentUser.email}</p>
            <p className="text-sm text-blue-200">{currentUser.role}</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
              className="w-full p-6 text-right hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(category.color)}`}>
                    {category.icon}
                  </div>
                  <div className="mr-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedCategory === category.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              </div>
            </button>

            {/* Category Items */}
            {expandedCategory === category.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200"
              >
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full p-4 text-right hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          {item.badge && (
                            <span className={`mr-2 px-2 py-1 text-xs rounded-full ${
                              item.badge === 'مهم' ? 'bg-red-100 text-red-800' :
                              item.badge === 'أمان' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">إدارة المستخدمين</p>
          </button>
          <button
            onClick={() => navigate('/admin/roles')}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">الأدوار والصلاحيات</p>
          </button>
          <button
            onClick={() => navigate('/rbac-dashboard')}
            className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center"
          >
            <Monitor className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-red-900">مراقبة الأمان</p>
          </button>
          <button
            onClick={() => navigate('/admin/backup')}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
          >
            <Database className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-900">النسخ الاحتياطي</p>
          </button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة النظام</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">قاعدة البيانات</p>
              <p className="text-xs text-gray-500">متصلة وتعمل بشكل طبيعي</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">الخادم</p>
              <p className="text-xs text-gray-500">يعمل بشكل مثالي</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">النسخ الاحتياطي</p>
              <p className="text-xs text-gray-500">آخر نسخة: اليوم</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;