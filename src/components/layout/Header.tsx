import React, { useState } from 'react';
import { Bell, Menu, Search, User, ChevronDown, Sun, Moon, Settings, LogOut, UserCircle, Shield, Database, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { mockNotifications } from '../../data/mockData';
import DepartmentToggle from './DepartmentToggle';
import CacheStatus from '../cache/CacheStatus';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t, isRTL } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  
  const unreadNotifications = mockNotifications.filter(n => !n.isRead).length;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header className={`h-16 border-b flex items-center justify-between px-6 z-20 sticky top-0 transition-colors duration-300 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-6">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl focus:outline-none transition-all duration-200 ${
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Menu size={20} />
        </button>
        
        {/* Department Toggle Buttons */}
        <DepartmentToggle />
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-80 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
            placeholder={t('common.search') + '...'}
          />
        </div>

        {/* Cache Status */}
        <CacheStatus className="hidden md:block" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl focus:outline-none transition-all duration-200 ${
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl focus:outline-none relative transition-all duration-200 ${
              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 overflow-hidden z-50 rounded-xl shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className={`p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('nav.notifications')}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b transition duration-150 ease-in-out ${
                      !notification.isRead 
                        ? (isDark ? 'bg-blue-900/20 border-gray-700' : 'bg-blue-50 border-gray-50') 
                        : (isDark ? 'border-gray-700' : 'border-gray-50')
                    }`}
                  >
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`p-3 text-center ${
                isDark ? 'border-t border-gray-700 bg-gray-800' : 'border-t border-gray-100 bg-gray-50'
              }`}>
                <Link to="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  {t('nav.notifications')}
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center text-sm focus:outline-none rounded-xl px-3 py-2 transition-all duration-200 ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mr-3">
              <User size={16} />
            </div>
            <span className={`hidden md:block font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
              {user?.name || 'Admin User'}
            </span>
            <ChevronDown size={16} className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 overflow-hidden z-50 rounded-xl shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className={`px-4 py-3 border-b transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.name || 'Admin User'}
                </p>
                <p className={`text-xs transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.email || 'admin@hudaaljarallah.com'}
                </p>
              </div>
              
              <div className="py-1">
                <Link 
                  to="/admin/profile" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserCircle size={16} className="mr-3" />
                  My Profile
                </Link>
                
                <Link 
                  to="/admin/users" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Users size={16} className="mr-3" />
                  User Management
                </Link>
                
                <Link 
                  to="/admin/permissions" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Shield size={16} className="mr-3" />
                  Roles & Permissions
                </Link>
                
                <Link 
                  to="/admin/security-logs" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <FileText size={16} className="mr-3" />
                  Security Logs
                </Link>
                
                <Link 
                  to="/admin/system-settings" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={16} className="mr-3" />
                  System Settings
                </Link>
                
                <Link 
                  to="/admin/backup" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Database size={16} className="mr-3" />
                  Backup & Restore
                </Link>
              </div>
              
              <div className={`border-t transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <button 
                  onClick={handleLogout}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;