import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Calendar, 
  LineChart, Bell, Settings, Monitor, Workflow, Zap,
  FileText, DollarSign, Clock, Factory, TrendingUp, UserCheck, Building2, ShoppingCart, Puzzle, Shield
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { isRTL, t } = useLanguage();
  const { isDark } = useTheme();
  const { hasPermission, hasAnyRole, canAccessAdmin } = usePermissions();
  
  const workshopItems = [
    { 
      path: '/', 
      label: t('sidebar.dashboard', 'لوحة التحكم'), 
      icon: <LayoutDashboard size={20} />, 
      requiredPermissions: ['dashboard.view'],
      show: hasPermission('dashboard.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/orders', 
      label: t('sidebar.orders', 'الطلبات'), 
      icon: <ShoppingBag size={20} />, 
      badge: 5,
      requiredPermissions: ['orders.view'],
      show: hasPermission('orders.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/orders-management', 
      label: t('sidebar.ordersManagement', 'إدارة الطلبات'), 
      icon: <ShoppingCart size={20} />, 
      badge: t('common.new', 'جديد'),
      requiredPermissions: ['orders.view'],
      show: hasPermission('orders.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/products', 
      label: t('sidebar.products', 'المنتجات'), 
      icon: <Package size={20} />, 
      badge: t('common.new', 'جديد'),
      requiredPermissions: ['products.view'],
      show: hasPermission('products.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/clients', 
      label: t('sidebar.clients', 'العملاء'), 
      icon: <UserCheck size={20} />,
      requiredPermissions: ['clients.view'],
      show: hasPermission('clients.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/inventory', 
      label: t('sidebar.inventory', 'المخزون'), 
      icon: <Package size={20} />,
      requiredPermissions: ['inventory.view'],
      show: hasPermission('inventory.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/workers', 
      label: t('sidebar.workers', 'العمال'), 
      icon: <Users size={20} />,
      requiredPermissions: ['workers.view'],
      show: hasPermission('workers.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/suit-production', 
      label: t('sidebar.productionFlow', 'سير الإنتاج'), 
      icon: <Workflow size={20} />,
      requiredPermissions: ['production.view'],
      show: hasPermission('production.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/station-display', 
      label: t('sidebar.stations', 'المحطات'), 
      icon: <Monitor size={20} />,
      requiredPermissions: ['production.view'],
      show: hasPermission('production.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/production-tracking', 
      label: t('sidebar.productionTracking', 'تتبع الإنتاج'), 
      icon: <Factory size={20} />, 
      badge: t('common.new', 'جديد'),
      requiredPermissions: ['production.view'],
      show: hasPermission('production.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/calendar', 
      label: t('sidebar.calendar', 'التقويم'), 
      icon: <Calendar size={20} />,
      requiredPermissions: ['calendar.view'],
      show: hasPermission('calendar.view') || hasAnyRole(['super_admin'])
    },
  ].filter(item => item.show);

  const erpItems = [
    { 
      path: '/invoices', 
      label: t('sidebar.invoices', 'الفواتير'), 
      icon: <FileText size={20} />,
      requiredPermissions: ['invoices.view'],
      show: hasPermission('invoices.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/sales', 
      label: t('sidebar.sales', 'المبيعات'), 
      icon: <DollarSign size={20} />, 
      badge: t('common.hot', 'ساخن'),
      requiredPermissions: ['reports.view'],
      show: hasPermission('reports.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/payroll', 
      label: t('sidebar.payroll', 'كشوف المرتبات'), 
      icon: <TrendingUp size={20} />,
      requiredPermissions: ['payroll.view'],
      show: hasPermission('payroll.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/attendance', 
      label: t('sidebar.attendance', 'الحضور'), 
      icon: <Clock size={20} />,
      requiredPermissions: ['attendance.modify'],
      show: hasPermission('attendance.modify') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/analytics', 
      label: t('sidebar.analytics', 'التحليلات'), 
      icon: <LineChart size={20} />,
      requiredPermissions: ['analytics.view'],
      show: hasPermission('analytics.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/erp', 
      label: t('sidebar.erpManagement', 'إدارة تخطيط الموارد'), 
      icon: <Building2 size={20} />, 
      badge: t('common.new', 'جديد'),
      requiredPermissions: ['system.admin'],
      show: hasPermission('system.admin') || hasAnyRole(['super_admin'])
    },
  ].filter(item => item.show);

  const otherItems = [
    { 
      path: '/advanced-features', 
      label: t('sidebar.advancedFeatures', 'الميزات المتقدمة'), 
      icon: <Zap size={20} />, 
      badge: t('common.new', 'جديد'),
      requiredPermissions: ['system.admin'],
      show: hasPermission('system.admin') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/plugins', 
      label: t('sidebar.pluginManagement', 'إدارة الإضافات'), 
      icon: <Puzzle size={20} />, 
      badge: t('common.new', 'جديد'),
      requiredPermissions: ['system.admin'],
      show: hasPermission('system.admin') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/rbac-dashboard', 
      label: t('sidebar.rbacSecurity', 'أمان التحكم بالأدوار'), 
      icon: <Shield size={20} />, 
      badge: t('common.secure', 'آمن'),
      requiredPermissions: ['system.logs'],
      show: hasPermission('system.logs') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/notifications', 
      label: t('sidebar.notifications', 'الإشعارات'), 
      icon: <Bell size={20} />, 
      badge: 3,
      requiredPermissions: [],
      show: true // Always show notifications
    },
    { 
      path: '/settings', 
      label: t('sidebar.settings', 'الإعدادات'), 
      icon: <Settings size={20} />,
      requiredPermissions: ['settings.view'],
      show: hasPermission('settings.view') || hasAnyRole(['super_admin'])
    },
  ].filter(item => item.show);

  // Logo URLs based on theme
  const lightLogo = "https://hudaaljarallah.net/wp-content/uploads/thegem-logos/logo_0b3a39076af98ecbd503dbaf22f4082f_2x.png";
  const darkLogo = "https://hudaaljarallah.net/wp-content/uploads/thegem-logos/logo_192acb51c2313c84b0d3cab0253ca739_2x.png";

  return (
    <motion.div
      className={classNames(
        `sidebar fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-full ${isRTL ? 'border-l' : 'border-r'} z-30 transition-all duration-300 ease-in-out shadow-sm flex flex-col`,
        { "w-64": isOpen, "w-20": !isOpen }
      )}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border-color)',
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size)',
        fontWeight: 'var(--font-weight)',
        lineHeight: 'var(--line-height)',
        transition: 'all var(--transition-duration) var(--transition-easing)'
      }}
      initial={{ x: isRTL ? 250 : -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo Section */}
      <div 
        className={`flex-shrink-0 flex items-center justify-center h-16 ${isRTL ? 'border-l' : 'border-r'} p-4 bg-theme-sidebar border-theme`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        {isOpen ? (
          <img 
            src={isDark ? darkLogo : lightLogo}
            alt="Logo" 
            className="h-10 object-contain transition-opacity duration-300"
          />
        ) : (
          <img 
            src={isDark ? darkLogo : lightLogo}
            alt="Logo" 
            className="h-8 object-contain transition-opacity duration-300"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 pb-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Workshop Section */}
        {workshopItems.length > 0 && (
          <div>
            {isOpen && (
              <div className="mb-6">
                <div 
                  className="flex items-center px-3 mb-3 py-2 rounded-lg bg-theme-sidebar"
                  style={{ 
                    color: 'var(--secondary-color)',
                    backgroundColor: 'var(--sidebar-bg)'
                  }}
                >
                  <div 
                    className="w-1 h-4 rounded-full mr-3"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  ></div>
                  <h3 
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: 'calc(var(--font-size) * 0.75)',
                      fontWeight: 'var(--font-weight)',
                      color: 'var(--secondary-color)'
                    }}
                  >
                    {t('sidebar.workshop', 'ورشة العمل')}
                  </h3>
                  <span className="ml-2 text-lg">🏭</span>
                </div>
                <div 
                  className="h-px mx-3 mb-4"
                  style={{ backgroundColor: 'var(--border-color)' }}
                ></div>
              </div>
            )}
          <ul className="space-y-1">
            {workshopItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    classNames(
                      "sidebar-item nav-item flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                      {
                        "active": isActive,
                        
                        "justify-center": !isOpen,
                        "justify-between": isOpen && item.badge,
                      }
                    )
                  }
                >
                  <div className={classNames("flex items-center", { "justify-center": !isOpen })}>
                    <span className={classNames(
                      "transition-transform duration-200 group-hover:scale-110",
                      !isOpen ? "text-center" : isRTL ? "ml-3" : "mr-3"
                    )}>
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span 
                        className="font-medium text-sm"
                        style={{
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--font-size)',
                          fontWeight: 'var(--font-weight)',
                          lineHeight: 'var(--line-height)'
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {/* Badge */}
                  {isOpen && item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full ${
                      item.badge === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div 
                      className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50`}
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'calc(var(--font-size) * 0.75)',
                        fontWeight: 'var(--font-weight)'
                      }}
                    >
                      {item.label}
                      {item.badge && (
                        <span className={`ml-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
                          item.badge === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          </div>
        )}

        {/* ERP Section */}
        {erpItems.length > 0 && (
          <div>
            {isOpen && (
              <div className="mb-6">
                <div 
                  className="flex items-center px-3 mb-3 py-2 rounded-lg bg-theme-sidebar"
                  style={{ 
                    color: 'var(--secondary-color)',
                    backgroundColor: 'var(--sidebar-bg)'
                  }}
                >
                  <div 
                    className="w-1 h-4 rounded-full mr-3"
                    style={{ backgroundColor: '#22c55e' }}
                  ></div>
                  <h3 
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: 'calc(var(--font-size) * 0.75)',
                      fontWeight: 'var(--font-weight)',
                      color: 'var(--secondary-color)'
                    }}
                  >
                    {t('sidebar.erpSystem', 'نظام تخطيط الموارد')}
                  </h3>
                  <span className="ml-2 text-lg">💼</span>
                </div>
                <div 
                  className="h-px mx-3 mb-4"
                  style={{ backgroundColor: 'var(--border-color)' }}
                ></div>
              </div>
            )}
          <ul className="space-y-1">
            {erpItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    classNames(
                      "sidebar-item nav-item flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                      {
                        "active": isActive,
                        
                        "justify-center": !isOpen,
                        "justify-between": isOpen && item.badge,
                      }
                    )
                  }
                >
                  <div className={classNames("flex items-center", { "justify-center": !isOpen })}>
                    <span className={classNames(
                      "transition-transform duration-200 group-hover:scale-110",
                      !isOpen ? "text-center" : isRTL ? "ml-3" : "mr-3"
                    )}>
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span 
                        className="font-medium text-sm"
                        style={{
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--font-size)',
                          fontWeight: 'var(--font-weight)',
                          lineHeight: 'var(--line-height)'
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {/* Badge */}
                  {isOpen && item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full ${
                      item.badge === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div 
                      className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50`}
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'calc(var(--font-size) * 0.75)',
                        fontWeight: 'var(--font-weight)'
                      }}
                    >
                      {item.label}
                      {item.badge && (
                        <span className={`ml-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
                          item.badge === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          </div>
        )}

        {/* Other Section */}
        {otherItems.length > 0 && (
          <div>
            {isOpen && (
              <div className="mb-6">
                <div 
                  className="flex items-center px-3 mb-3 py-2 rounded-lg bg-theme-sidebar"
                  style={{ 
                    color: 'var(--secondary-color)',
                    backgroundColor: 'var(--sidebar-bg)'
                  }}
                >
                  <div 
                    className="w-1 h-4 rounded-full mr-3"
                    style={{ backgroundColor: '#a855f7' }}
                  ></div>
                  <h3 
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: 'calc(var(--font-size) * 0.75)',
                      fontWeight: 'var(--font-weight)',
                      color: 'var(--secondary-color)'
                    }}
                  >
                    {t('sidebar.other', 'أخرى')}
                  </h3>
                  <span className="ml-2 text-lg">⚙️</span>
              </div>
              <div 
                className="h-px mx-3 mb-4"
                style={{ backgroundColor: 'var(--border-color)' }}
              ></div>
            </div>
          )}
          <ul className="space-y-1">
            {otherItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    classNames(
                      "sidebar-item nav-item flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                      {
                        "active": isActive,
                        
                        "justify-center": !isOpen,
                        "justify-between": isOpen && item.badge,
                      }
                    )
                  }
                >
                  <div className={classNames("flex items-center", { "justify-center": !isOpen })}>
                    <span className={classNames(
                      "transition-transform duration-200 group-hover:scale-110",
                      !isOpen ? "text-center" : isRTL ? "ml-3" : "mr-3"
                    )}>
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span 
                        className="font-medium text-sm"
                        style={{
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--font-size)',
                          fontWeight: 'var(--font-weight)',
                          lineHeight: 'var(--line-height)'
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {/* Badge */}
                  {isOpen && item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full ${
                      item.badge === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div 
                      className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50`}
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'calc(var(--font-size) * 0.75)',
                        fontWeight: 'var(--font-weight)'
                      }}
                    >
                      {item.label}
                      {item.badge && (
                        <span className={`ml-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
                          item.badge === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          </div>
        )}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
