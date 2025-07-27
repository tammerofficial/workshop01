import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Package, User, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import { useLanguage } from '../contexts/LanguageContext';

const Notifications: React.FC = () => {
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const getNotificationIcon = (type: string) => {
    const iconStyle = { color: 'var(--primary-color)' };
    const secondaryStyle = { color: 'var(--secondary-color)' };
    const accentStyle = { color: 'var(--accent-color)' };
    
    switch (type) {
      case 'order':
        return <Clock size={20} style={iconStyle} />;
      case 'inventory':
        return <Package size={20} style={accentStyle} />;
      case 'worker':
        return <User size={20} style={{ color: '#22c55e' }} />;
      case 'system':
        return <AlertTriangle size={20} style={{ color: '#ef4444' }} />;
      default:
        return <Bell size={20} style={secondaryStyle} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DepartmentAwareComponent>
      {({ notifications }) => {
        const filteredNotifications = notifications.filter(notification => 
          filter === 'all' || (filter === 'unread' && !notification.isRead)
        );

        return (
          <div className="dark:bg-gray-900 min-h-screen">
            <PageHeader 
              title={`${departmentInfo.name} Notifications`}
              subtitle={`Manage notifications and alerts for ${departmentInfo.description.toLowerCase()}`}
            />
            
            <motion.div 
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filter === 'all'
                        ? 'active'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    style={filter === 'all' ? {
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      borderRadius: 'var(--border-radius)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--font-size)',
                      fontWeight: 'var(--font-weight)'
                    } : {
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--font-size)',
                      fontWeight: 'var(--font-weight)'
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filter === 'unread'
                        ? 'active'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    style={filter === 'unread' ? {
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      borderRadius: 'var(--border-radius)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--font-size)',
                      fontWeight: 'var(--font-weight)'
                    } : {
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--font-size)',
                      fontWeight: 'var(--font-weight)'
                    }}
                  >
                    Unread
                  </button>
                </div>
                
                <button 
                  className="text-sm hover:underline transition-colors"
                  style={{ 
                    color: 'var(--primary-color)',
                    transition: 'color var(--transition-duration) var(--transition-easing)'
                  }}
                >
                  {t('notifications.markAllAsRead')}
                </button>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                        <div className="flex items-center justify-between">
                          <p 
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            style={{
                              fontFamily: 'var(--font-family)',
                              fontSize: 'var(--font-size)',
                              fontWeight: 'var(--font-weight)',
                              lineHeight: 'var(--line-height)',
                              color: 'var(--text-color)'
                            }}
                          >
                            {notification.title}
                          </p>
                          <span 
                            className="text-sm text-gray-500 dark:text-gray-400"
                            style={{
                              fontFamily: 'var(--font-family)',
                              fontSize: 'calc(var(--font-size) * 0.875)',
                              color: 'var(--secondary-color)'
                            }}
                          >
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p 
                          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                          style={{
                            fontFamily: 'var(--font-family)',
                            fontSize: 'calc(var(--font-size) * 0.875)',
                            lineHeight: 'var(--line-height)',
                            color: 'var(--secondary-color)'
                          }}
                        >
                          {notification.message}
                        </p>
                        
                        {notification.relatedId && (
                          <div className="mt-2">
                            <a
                              href={`#${notification.relatedId}`}
                              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              {t('notifications.viewDetails')}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {!notification.isRead && (
                        <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            title={t('notifications.markAsRead')}
                          >
                            <Check size={16} className="text-green-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {filteredNotifications.length === 0 && (
                <div className="py-20 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${departmentInfo.color} bg-opacity-10 mb-4`}>
                    <Bell size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('notifications.noNotifications')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t('notifications.noNotificationsFor', { departmentName: departmentInfo.name })}</p>
                </div>
              )}
            </motion.div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default Notifications;