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

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { isRTL } = useLanguage();
  const { isDark } = useTheme();
  
  const workshopItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingBag size={20} />, badge: 5 },
    { path: '/orders-management', label: 'Orders Management', icon: <ShoppingCart size={20} />, badge: 'NEW' },
    { path: '/products', label: 'Products', icon: <Package size={20} />, badge: 'NEW' },
    { path: '/clients', label: 'Clients', icon: <UserCheck size={20} /> },
    { path: '/inventory', label: 'Inventory', icon: <Package size={20} /> },
    { path: '/workers', label: 'Workers', icon: <Users size={20} /> },
    { path: '/suit-production', label: 'Production Flow', icon: <Workflow size={20} /> },
    { path: '/station-display', label: 'Stations', icon: <Monitor size={20} /> },
    { path: '/production-tracking', label: 'Production Tracking', icon: <Factory size={20} />, badge: 'NEW' },
    { path: '/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
  ];

  const erpItems = [
    { path: '/invoices', label: 'Invoices', icon: <FileText size={20} /> },
    { path: '/sales', label: 'Sales', icon: <DollarSign size={20} />, badge: 'HOT' },
    { path: '/payroll', label: 'Payroll', icon: <TrendingUp size={20} /> },
    { path: '/attendance', label: 'Attendance', icon: <Clock size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <LineChart size={20} /> },
    { path: '/erp', label: 'ERP Management', icon: <Building2 size={20} />, badge: 'NEW' },
  ];

  const otherItems = [
    { path: '/advanced-features', label: 'Advanced Features', icon: <Zap size={20} />, badge: 'NEW' },
    { path: '/plugins', label: 'Plugin Management', icon: <Puzzle size={20} />, badge: 'NEW' },
    { path: '/rbac-dashboard', label: 'RBAC Security', icon: <Shield size={20} />, badge: 'SECURE' },
    { path: '/notifications', label: 'Notifications', icon: <Bell size={20} />, badge: 3 },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

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
        backgroundColor: 'var(--surface-color)',
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
        className={`flex-shrink-0 flex items-center justify-center h-16 ${isRTL ? 'border-l' : 'border-r'} p-4`}
        style={{
          backgroundColor: 'var(--background-color)',
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
        <div>
          {isOpen && (
            <div className="mb-6">
              <div 
                className="flex items-center px-3 mb-3"
                style={{ color: 'var(--secondary-color)' }}
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
                  Workshop
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

        {/* ERP Section */}
        <div>
          {isOpen && (
            <div className="mb-6">
              <div 
                className="flex items-center px-3 mb-3"
                style={{ color: 'var(--secondary-color)' }}
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
                  ERP System
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

        {/* Other Section */}
        <div>
          {isOpen && (
            <div className="mb-6">
              <div 
                className="flex items-center px-3 mb-3"
                style={{ color: 'var(--secondary-color)' }}
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
                  Other
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
      </nav>
    </motion.div>
  );
};

export default Sidebar;
