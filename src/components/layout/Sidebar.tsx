import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Calendar, 
  LineChart, Bell, Settings, Monitor, Workflow, Zap,
  FileText, DollarSign, Clock, Factory, TrendingUp, UserCheck, Building2, ShoppingCart, Puzzle, Shield, QrCode, Boxes,
  HardDrive, Activity, Fingerprint, Gift, Award, Eye, Calculator
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
  const { hasPermission, hasAnyRole } = usePermissions();
  
  // قسم عمليات الإنتاج - تدفق منطقي مع صلاحيات محددة ومتدرجة
  const productionItems = [
    // 1. تخطيط وإدارة سير العمل (صلاحية إدارة متقدمة)
    { 
      path: '/workflow-dashboard', 
      label: t('sidebar.workflow'), 
      icon: <Workflow size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['production.manage'],
      show: hasPermission('production.manage') || hasAnyRole(['super_admin', 'production_manager'])
    },
    // 2. تنفيذ العمل (واجهة العمال - صلاحية تنفيذ)
    { 
      path: '/worker-ipad', 
      label: t('sidebar.workerIpad'), 
      icon: <Users size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['production.execute'],
      show: hasPermission('production.execute') || hasAnyRole(['super_admin', 'production_worker', 'production_manager'])
    },
    // 3. تتبع ومراقبة الإنتاج (صلاحية مراقبة)
    { 
      path: '/production-tracking', 
      label: t('sidebar.productionTracking'), 
      icon: <Factory size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['production.track'],
      show: hasPermission('production.track') || hasAnyRole(['super_admin', 'production_manager', 'production_supervisor'])
    },
    // 4. أدوات مساعدة (الباركود - صلاحية أدوات)
    { 
      path: '/barcode-qr', 
      label: t('sidebar.barcodeQR'), 
      icon: <QrCode size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['production.tools'],
      show: hasPermission('production.tools') || hasAnyRole(['super_admin', 'production_manager', 'inventory_manager'])
    },
    // 5. نظام نقاط البيع (صلاحية تشغيل البوتيك)
    { 
      path: '/pos-system', 
      label: t('sidebar.pos'), 
      icon: <Calculator size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['pos.operate'],
      show: hasPermission('pos.operate') || hasAnyRole(['super_admin', 'boutique_cashier', 'boutique_sales_agent', 'boutique_supervisor', 'boutique_manager'])
    },
    // 6. المتجر الإلكتروني (صلاحية إدارة المتجر)
    { 
      path: '/ecommerce', 
      label: t('sidebar.ecommerce'), 
      icon: <ShoppingBag size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['ecommerce.manage'],
      show: hasPermission('ecommerce.manage') || hasAnyRole(['super_admin', 'boutique_manager', 'ecommerce_manager'])
    },
    // 7. لوحة إدارية شاملة (صلاحية إدارة عليا)
    { 
      path: '/manager-dashboard', 
      label: t('sidebar.managerDashboard'), 
      icon: <Monitor size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['production.admin'],
      show: hasPermission('production.admin') || hasAnyRole(['super_admin', 'production_manager', 'general_manager'])
    },
  ].filter(item => item.show);

  // قسم إدارة الورشة - منظم حسب تدفق العمل اليومي
  const workshopItems = [
    // 1. نقطة البداية
    { 
      path: '/', 
      label: t('sidebar.dashboard'), 
      icon: <LayoutDashboard size={20} />, 
      requiredPermissions: ['dashboard.view'],
      show: hasPermission('dashboard.view') || hasAnyRole(['super_admin'])
    },
    // 2. إدارة الطلبات (دمج العنصرين المكررين)
    { 
      path: '/orders-management', 
      label: t('sidebar.ordersManagement'), 
      icon: <ShoppingCart size={20} />, 
      badge: 5, // عدد الطلبات المعلقة
      requiredPermissions: ['orders.view'],
      show: hasPermission('orders.view') || hasAnyRole(['super_admin'])
    },
    // 3. المنتجات والكتالوج
    { 
      path: '/products', 
      label: t('sidebar.products'), 
      icon: <Package size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['products.view'],
      show: hasPermission('products.view') || hasAnyRole(['super_admin'])
    },
    // 4. إدارة العملاء
    { 
      path: '/clients', 
      label: t('sidebar.clients'), 
      icon: <UserCheck size={20} />,
      requiredPermissions: ['clients.view'],
      show: hasPermission('clients.view') || hasAnyRole(['super_admin'])
    },
    // 5. إدارة المخزون
    { 
      path: '/inventory', 
      label: t('sidebar.inventory'), 
      icon: <Boxes size={20} />, // أيقونة مختلفة عن Products
      requiredPermissions: ['inventory.view'],
      show: hasPermission('inventory.view') || hasAnyRole(['super_admin'])
    },
    // 6. إدارة الموارد البشرية
    { 
      path: '/workers', 
      label: t('sidebar.workers'), 
      icon: <Users size={20} />,
      requiredPermissions: ['workers.view'],
      show: hasPermission('workers.view') || hasAnyRole(['super_admin'])
    },
    // 7. التخطيط والجدولة
    { 
      path: '/calendar', 
      label: t('sidebar.calendar'), 
      icon: <Calendar size={20} />,
      requiredPermissions: ['calendar.view'],
      show: hasPermission('calendar.view') || hasAnyRole(['super_admin'])
    },
    // 8. مراقبة الإنتاج التقليدي
    { 
      path: '/suit-production', 
      label: t('sidebar.productionFlow'), 
      icon: <Factory size={20} />,
      requiredPermissions: ['production.view'],
      show: hasPermission('production.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/station-display', 
      label: t('sidebar.stations'), 
      icon: <Monitor size={20} />,
      requiredPermissions: ['production.view'],
      show: hasPermission('production.view') || hasAnyRole(['super_admin'])
    },
  ].filter(item => item.show);

  // قسم نظام تخطيط الموارد - منظم حسب دورة العمل المالي والإداري
  const erpItems = [
    // 1. المبيعات (نقطة البداية في الدورة المالية)
    { 
      path: '/sales', 
      label: t('sidebar.sales'), 
      icon: <DollarSign size={20} />, 
      badge: t('common.hot'),
      requiredPermissions: ['reports.view'],
      show: hasPermission('reports.view') || hasAnyRole(['super_admin'])
    },
    // 2. الفواتير (تابع للمبيعات)
    { 
      path: '/invoices', 
      label: t('sidebar.invoices'), 
      icon: <FileText size={20} />,
      requiredPermissions: ['invoices.view'],
      show: hasPermission('invoices.view') || hasAnyRole(['super_admin'])
    },
    // 3. التحليلات المالية والتقارير
    { 
      path: '/analytics', 
      label: t('sidebar.analytics'), 
      icon: <LineChart size={20} />,
      requiredPermissions: ['analytics.view'],
      show: hasPermission('analytics.view') || hasAnyRole(['super_admin'])
    },
    // 4. إدارة الموارد البشرية - الحضور
    { 
      path: '/attendance', 
      label: t('sidebar.attendance'), 
      icon: <Clock size={20} />,
      requiredPermissions: ['attendance.modify'],
      show: hasPermission('attendance.modify') || hasAnyRole(['super_admin'])
    },
    // 5. إدارة الموارد البشرية - المرتبات
    { 
      path: '/payroll', 
      label: t('sidebar.payroll'), 
      icon: <TrendingUp size={20} />,
      requiredPermissions: ['payroll.view'],
      show: hasPermission('payroll.view') || hasAnyRole(['super_admin'])
    },
    // 6. النظام الشامل للـ ERP
    { 
      path: '/erp', 
      label: t('sidebar.erpManagement'), 
      icon: <Building2 size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['system.admin'],
      show: hasPermission('system.admin') || hasAnyRole(['super_admin'])
    },
  ].filter(item => item.show);

  // قسم إدارة النظام - صلاحيات محددة حسب مستوى الأمان
  const systemItems = [
    { 
      path: '/advanced-features', 
      label: t('sidebar.advancedFeatures'), 
      icon: <Zap size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['system.features'],
      show: hasPermission('system.features') || hasAnyRole(['super_admin', 'system_admin'])
    },
    { 
      path: '/plugins', 
      label: t('sidebar.pluginManagement'), 
      icon: <Puzzle size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['system.plugins'],
      show: hasPermission('system.plugins') || hasAnyRole(['super_admin', 'system_admin'])
    },
    { 
      path: '/rbac-dashboard', 
      label: t('sidebar.rbacSecurity'), 
      icon: <Shield size={20} />, 
      badge: t('common.secure'),
      requiredPermissions: ['system.security'],
      show: hasPermission('system.security') || hasAnyRole(['super_admin', 'security_admin'])
    },
    // مميزات إضافية للسوبر ادمن
    { 
      path: '/reports', 
      label: t('sidebar.reports'), 
      icon: <FileText size={20} />, 
      badge: t('common.hot'),
      requiredPermissions: ['reports.manage'],
      show: hasPermission('reports.manage') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/backup-management', 
      label: t('sidebar.backupManagement'), 
      icon: <HardDrive size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['backup.manage'],
      show: hasPermission('backup.manage') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/system-logs', 
      label: t('sidebar.systemLogs'), 
      icon: <Activity size={20} />, 
      requiredPermissions: ['logs.view'],
      show: hasPermission('logs.view') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/user-management', 
      label: t('sidebar.userManagement'), 
      icon: <Users size={20} />, 
      requiredPermissions: ['users.manage'],
      show: hasPermission('users.manage') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/biometric-system', 
      label: t('sidebar.biometricSystem'), 
      icon: <Fingerprint size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['biometric.manage'],
      show: hasPermission('biometric.manage') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/loyalty-program', 
      label: t('sidebar.loyaltyProgram'), 
      icon: <Gift size={20} />, 
      requiredPermissions: ['loyalty.manage'],
      show: hasPermission('loyalty.manage') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/quality-control', 
      label: t('sidebar.qualityControl'), 
      icon: <Award size={20} />, 
      requiredPermissions: ['production.manage'],
      show: hasPermission('production.manage') || hasAnyRole(['super_admin'])
    },
    { 
      path: '/system-monitoring', 
      label: t('sidebar.systemMonitoring'), 
      icon: <Eye size={20} />, 
      badge: t('common.new'),
      requiredPermissions: ['system.manage'],
      show: hasPermission('system.manage') || hasAnyRole(['super_admin'])
    },
  ].filter(item => item.show);

  // قسم الإعدادات الشخصية - مرن لجميع المستخدمين
  const userItems = [
    { 
      path: '/notifications', 
      label: t('sidebar.notifications'), 
      icon: <Bell size={20} />, 
      badge: 3,
      requiredPermissions: [], // متاح للجميع
      show: true // Always show notifications
    },
    { 
      path: '/settings', 
      label: t('sidebar.settings'), 
      icon: <Settings size={20} />,
      requiredPermissions: ['user.settings'], // صلاحية أكثر تحديداً
      show: hasPermission('user.settings') || hasAnyRole(['super_admin']) || true // متاح للجميع أساساً
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
        {/* Production Operations Section */}
        {productionItems.length > 0 && (
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
                    style={{ backgroundColor: '#f59e0b' }}
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
                    {t('sidebar.production')}
                  </h3>
                  <span className="ml-2 text-lg">⚡</span>
                </div>
                <div 
                  className="h-px mx-3 mb-4"
                  style={{ backgroundColor: 'var(--border-color)' }}
                ></div>
              </div>
            )}
          <ul className="space-y-1">
            {productionItems.map((item) => (
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
                      String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
                          String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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

        {/* Workshop Management Section */}
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
                    {t('sidebar.workshop')}
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
                      String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
                          String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
                    {t('sidebar.erpSystem')}
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
                      String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
                          String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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

        {/* System Management Section */}
        {systemItems.length > 0 && (
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
                    style={{ backgroundColor: '#dc2626' }}
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
                    {t('sidebar.systemManagement')}
                  </h3>
                  <span className="ml-2 text-lg">🔧</span>
              </div>
              <div 
                className="h-px mx-3 mb-4"
                style={{ backgroundColor: 'var(--border-color)' }}
              ></div>
            </div>
          )}
          <ul className="space-y-1">
            {systemItems.map((item) => (
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
                      String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
                          String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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

        {/* User Settings Section */}
        {userItems.length > 0 && (
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
                    style={{ backgroundColor: '#6b7280' }}
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
                    {t('sidebar.userSettings')}
                  </h3>
                  <span className="ml-2 text-lg">👤</span>
                </div>
                <div 
                  className="h-px mx-3 mb-4"
                  style={{ backgroundColor: 'var(--border-color)' }}
                ></div>
              </div>
            )}
          <ul className="space-y-1">
            {userItems.map((item) => (
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
                      String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
                          String(item.badge) === 'NEW' ? 'bg-blue-500' : 'bg-red-500'
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
