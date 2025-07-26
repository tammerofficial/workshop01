import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Package, User, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';

const Notifications: React.FC = () => {
  const { departmentInfo } = useDepartment();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Clock size={20} className="text-secondary" />;
      case 'inventory':
        return <Package size={20} className="text-warning" />;
      case 'worker':
        return <User size={20} className="text-accent" />;
      case 'system':
        return <AlertTriangle size={20} className="text-danger" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DepartmentAwareComponent>
      {({ notifications, loading }) => {
        const filteredNotifications = notifications.filter(notification => 
          filter === 'all' || (filter === 'unread' && !notification.isRead)
        );

        return (
          <div>
            <PageHeader 
              title={`${departmentInfo.name} Notifications`}
              subtitle={`Stay updated with ${departmentInfo.description.toLowerCase()} activities`}
            />
            
            <motion.div 
              className="bg-white shadow-sm rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      filter === 'all'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      filter === 'unread'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Unread
                  </button>
                </div>
                
                <button className="text-sm text-secondary hover:text-secondary-700">
                  Mark all as read
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        
                        {notification.relatedId && (
                          <div className="mt-2">
                            <a
                              href={`#${notification.relatedId}`}
                              className="inline-flex items-center text-sm text-secondary hover:text-secondary-700"
                            >
                              View details
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {!notification.isRead && (
                        <div className="ml-4">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100"
                            title="Mark as read"
                          >
                            <Check size={16} className="text-secondary" />
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
                    <Bell size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">No notifications for {departmentInfo.name}</p>
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