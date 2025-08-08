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
import { usePermissions } from '../../hooks/usePermissions';

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
  const { canAccessAdmin, hasPermission, hasAnyRole } = usePermissions();
  
  const unreadNotifications = mockNotifications.filter(n => !n.isRead).length;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header className={`h-16 border-b flex items-center justify-between px-6 z-20 sticky top-0 transition-colors duration-300`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)'
      }}>
      <div className="flex items-center space-x-6">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl focus:outline-none transition-all duration-200`}
          style={{
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
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
            className={`block w-80 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200`}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            placeholder={t('common.search') + '...'}
          />
        </div>

        {/* Cache Status */}
        <div className="hidden md:block">
          <CacheStatus />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl focus:outline-none transition-all duration-200`}
          style={{
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl focus:outline-none relative transition-all duration-200`}
            style={{
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
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
              className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 overflow-hidden z-50 rounded-xl shadow-lg`}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            >
                              <div className={`p-4`}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}>
                  <h3 className={`text-sm font-semibold`}
                    style={{
                      color: 'var(--text-primary)'
                    }}>
                    {t('nav.notifications')}
                  </h3>
                </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b transition duration-150 ease-in-out`}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: !notification.isRead ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    <p className={`text-sm font-medium`}
                      style={{
                        color: 'var(--text-primary)'
                      }}>
                      {notification.title}
                    </p>
                    <p className={`text-xs mt-1`}
                      style={{
                        color: 'var(--text-secondary)'
                      }}>
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`p-3 text-center`}
                style={{
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)'
                }}>
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
            className={`flex items-center text-sm focus:outline-none rounded-xl px-3 py-2 transition-all duration-200`}
            style={{
              backgroundColor: 'var(--bg-tertiary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mr-3">
              <User size={16} />
            </div>
            <span className={`hidden md:block font-medium`}
              style={{
                color: 'var(--text-primary)'
              }}>
              {user?.name || 'Admin User'}
            </span>
            <ChevronDown size={16} className={`ml-2`} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 overflow-hidden z-50 rounded-xl shadow-lg`}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className={`px-4 py-3 border-b transition-colors duration-300`}
                style={{
                  borderBottom: '1px solid var(--border-color)'
                }}>
                <p className={`text-sm font-medium transition-colors duration-300`}
                  style={{
                    color: 'var(--text-primary)'
                  }}>
                  {user?.name || 'Admin User'}
                </p>
                <p className={`text-xs transition-colors duration-300`}
                  style={{
                    color: 'var(--text-secondary)'
                  }}>
                  {user?.email || 'admin@hudaaljarallah.com'}
                </p>
              </div>
              
              <div className="py-1">
                <Link 
                  to="/admin/profile" 
                  className={`flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                  style={{
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserCircle size={16} className="mr-3" />
                  {t('header.profile', 'الملف الشخصي')}
                </Link>
                
                {/* Admin Menu Items - Only show if user has admin access */}
                {canAccessAdmin && (
                  <>
                    {hasPermission('users.view') && (
                      <Link 
                        to="/admin/users" 
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                        style={{
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Users size={16} className="mr-3" />
                        {t('header.userManagement', 'إدارة المستخدمين')}
                      </Link>
                    )}
                    
                    {hasPermission('roles.manage') && (
                      <Link 
                        to="/admin/permissions" 
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                        style={{
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={16} className="mr-3" />
                        {t('header.rolesPermissions', 'الأدوار والصلاحيات')}
                      </Link>
                    )}
                    
                    {hasPermission('system.logs') && (
                      <Link 
                        to="/admin/security-logs" 
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                        style={{
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FileText size={16} className="mr-3" />
                        {t('header.securityLogs', 'سجلات الأمان')}
                      </Link>
                    )}
                    
                    {hasPermission('settings.manage') && (
                      <Link 
                        to="/admin/system-settings" 
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                        style={{
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} className="mr-3" />
                        {t('header.systemSettings', 'إعدادات النظام')}
                      </Link>
                    )}
                    
                    {hasPermission('system.backup') && (
                      <Link 
                        to="/admin/backup" 
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                        style={{
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Database size={16} className="mr-3" />
                        {t('header.backupRestore', 'نسخ احتياطي واستعادة')}
                      </Link>
                    )}
                  </>
                )}
              </div>
              
              <div className={`border-t transition-colors duration-300`}
                style={{
                  borderTop: '1px solid var(--border-color)'
                }}>
                <button 
                  onClick={handleLogout}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-150`}
                  style={{
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={16} className="mr-3" />
                  {t('header.logout', 'تسجيل خروج')}
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