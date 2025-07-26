import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, VolumeX, Settings, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettings {
  soundEnabled: boolean;
  ttsEnabled: boolean;
  newOrderAlerts: boolean;
  delayedOrderAlerts: boolean;
  lowStockAlerts: boolean;
  workerAssignmentAlerts: boolean;
}

interface SystemNotification {
  id: string;
  type: 'new_order' | 'delayed_order' | 'low_stock' | 'worker_assignment';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    ttsEnabled: false,
    newOrderAlerts: true,
    delayedOrderAlerts: true,
    lowStockAlerts: true,
    workerAssignmentAlerts: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 5 seconds
        generateRandomNotification();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const generateRandomNotification = () => {
    const types: SystemNotification['type'][] = ['new_order', 'delayed_order', 'low_stock', 'worker_assignment'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const notificationTemplates = {
      new_order: {
        title: 'New Order Received',
        message: `Order #ORD-${Math.floor(Math.random() * 9999)} from Ahmed Al-Farsi has been received.`,
        priority: 'medium' as const,
        data: { orderId: `ORD-${Math.floor(Math.random() * 9999)}`, customerName: 'Ahmed Al-Farsi' }
      },
      delayed_order: {
        title: 'Order Delayed',
        message: `Order #ORD-${Math.floor(Math.random() * 9999)} is behind schedule and needs attention.`,
        priority: 'high' as const,
        data: { orderId: `ORD-${Math.floor(Math.random() * 9999)}` }
      },
      low_stock: {
        title: 'Low Stock Alert',
        message: 'Premium Wool Fabric is running low. Current stock: 15 meters.',
        priority: 'medium' as const,
        data: { itemName: 'Premium Wool Fabric', currentStock: 15 }
      },
      worker_assignment: {
        title: 'Worker Assignment',
        message: 'Ali Hassan has been assigned to Order #ORD-1234.',
        priority: 'low' as const,
        data: { workerName: 'Ali Hassan', orderId: 'ORD-1234' }
      }
    };

    const template = notificationTemplates[type];
    const newNotification: SystemNotification = {
      id: Date.now().toString(),
      type,
      title: template.title,
      message: template.message,
      timestamp: new Date(),
      read: false,
      priority: template.priority,
      data: template.data
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications

    // Show toast notification
    if (settings[`${type.replace('_', '')}Alerts` as keyof NotificationSettings]) {
      toast(template.message, {
        icon: template.priority === 'high' ? '🚨' : template.priority === 'medium' ? '⚠️' : 'ℹ️',
        duration: 4000
      });
    }

    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Text-to-speech if enabled
    if (settings.ttsEnabled && template.data?.workerName) {
      speakNotification(`${template.title}. ${template.data.workerName}.`);
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const speakNotification = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-danger bg-danger-50 border-danger-200';
      case 'medium': return 'text-warning bg-warning-50 border-warning-200';
      case 'low': return 'text-success bg-success-50 border-success-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Notification Controls */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell size={24} className="text-secondary mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notification Center
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={`p-2 rounded-full ${settings.soundEnabled ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}
              title={settings.soundEnabled ? 'Disable Sound' : 'Enable Sound'}
            >
              {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 bg-gray-200"
              title="Notification Settings"
            >
              <Settings size={20} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-sm bg-secondary text-white rounded bg-secondary-700"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sound Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings('soundEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Text-to-Speech</span>
                  <input
                    type="checkbox"
                    checked={settings.ttsEnabled}
                    onChange={(e) => updateSettings('ttsEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">New Order Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.newOrderAlerts}
                    onChange={(e) => updateSettings('newOrderAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Delayed Order Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.delayedOrderAlerts}
                    onChange={(e) => updateSettings('delayedOrderAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Low Stock Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlerts}
                    onChange={(e) => updateSettings('lowStockAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Worker Assignment Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.workerAssignmentAlerts}
                    onChange={(e) => updateSettings('workerAssignmentAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Notifications List */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 text-secondary"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 text-danger"
                        title="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSystem;