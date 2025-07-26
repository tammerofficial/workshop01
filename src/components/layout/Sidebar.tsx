import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Calendar, 
  LineChart, Bell, Settings, Monitor, Workflow, Activity, Zap,
  FileText, DollarSign, Clock, Factory, TrendingUp, UserCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();
  
  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/orders', label: t('nav.orders'), icon: <ShoppingBag size={20} />, badge: 5 },
    { path: '/inventory', label: t('nav.inventory'), icon: <Package size={20} /> },
    { path: '/workers', label: t('nav.workers'), icon: <Users size={20} /> },
    { path: '/calendar', label: t('nav.calendar'), icon: <Calendar size={20} /> },
    { path: '/suit-production', label: t('nav.production'), icon: <Workflow size={20} /> },
    { path: '/station-display', label: t('nav.stations'), icon: <Monitor size={20} /> },
    { path: '/invoices', label: 'Invoices', icon: <FileText size={20} /> },
    { path: '/sales', label: 'Sales', icon: <DollarSign size={20} />, badge: 'HOT' },
    { path: '/payroll', label: 'Payroll', icon: <TrendingUp size={20} /> },
    { path: '/attendance', label: 'Attendance', icon: <Clock size={20} /> },
    { path: '/production-tracking', label: 'Production Tracking', icon: <Factory size={20} />, badge: 'NEW' },
    { path: '/analytics', label: t('nav.analytics'), icon: <LineChart size={20} /> },
    { path: '/advanced-features', label: t('nav.advanced'), icon: <Zap size={20} />, badge: 'NEW' },
    { path: '/notifications', label: t('nav.notifications'), icon: <Bell size={20} />, badge: 3 },
    { path: '/settings', label: t('nav.settings'), icon: <Settings size={20} /> },
  ];

  // Logo URLs based on theme
  const lightLogo = "https://hudaaljarallah.net/wp-content/uploads/thegem-logos/logo_0b3a39076af98ecbd503dbaf22f4082f_2x.png";
  const darkLogo = "https://hudaaljarallah.net/wp-content/uploads/thegem-logos/logo_192acb51c2313c84b0d3cab0253ca739_2x.png";

  return (
    <motion.div
      className={classNames(
        `fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-full ${isRTL ? 'border-l' : 'border-r'} z-30 transition-all duration-300 ease-in-out shadow-sm ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`,
        { "w-64": isOpen, "w-20": !isOpen }
      )}
      initial={{ x: isRTL ? 250 : -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo Section */}
      <div className={`flex items-center justify-center h-16 ${isRTL ? 'border-l' : 'border-r'} p-4 ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
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
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  classNames(
                    "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                    {
                      "bg-black text-white shadow-sm": isActive,
                      [isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"]: !isActive,
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
                    <span className="font-medium text-sm">{item.label}</span>
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
                  <div className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50`}>
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
      </nav>
      
      {/* Footer */}
      {isOpen && (
        <div className={`absolute bottom-4 left-4 right-4 ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-xl p-4 ${
          isDark ? 'border border-gray-700' : 'border border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg ${
              isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            } flex items-center justify-center`}>
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                System Status
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                All systems operational
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;