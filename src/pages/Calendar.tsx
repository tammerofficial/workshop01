import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { taskService, orderService } from '../api/laravel';
import { useLanguage } from '../contexts/LanguageContext';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  worker?: {
    name: string;
  };
  order?: {
    title: string;
    client?: {
      name: string;
    };
  };
}

interface Order {
  id: number;
  title: string;
  due_date: string;
  status: string;
  client?: {
    name: string;
  };
  worker?: {
    name: string;
  };
}

const Calendar: React.FC = () => {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filter, setFilter] = useState<'all' | 'tasks' | 'orders'>('all');

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, ordersResponse] = await Promise.all([
        taskService.getAll(),
        orderService.getAll()
      ]);
      
      setTasks(tasksResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => 
      task.due_date === dateStr && (filter === 'all' || filter === 'tasks')
    );
    
    const dayOrders = orders.filter(order => 
      order.due_date === dateStr && (filter === 'all' || filter === 'orders')
    );

    return { tasks: dayTasks, orders: dayOrders };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderMonthView = () => {
    const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const events = getEventsForDate(date);
      
      days.push(
        <div
          key={i}
          className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 ${
            date.getMonth() === selectedDate.getMonth() ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
          } ${date.toDateString() === new Date().toDateString() ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
        >
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {date.getDate()}
          </div>
          <div className="space-y-1">
            {events.tasks.map(task => (
              <div
                key={`task-${task.id}`}
                className="text-xs p-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 truncate"
                title={task.title}
              >
                {t('calendar.taskPrefix')} {task.title}
              </div>
            ))}
            {events.orders.map(order => (
              <div
                key={`order-${order.id}`}
                className="text-xs p-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 truncate"
                title={order.title}
              >
                {t('calendar.orderPrefix')} {order.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {dayNames.map(day => (
          <div key={day} className="bg-gray-100 dark:bg-gray-900 p-3 text-center font-medium text-gray-700 dark:text-gray-300">
            {t(`calendar.dayNames.${day}`)}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const events = getEventsForDate(date);
      
      days.push(
        <div key={i} className="flex-1 min-h-[400px] border-r border-gray-200 dark:border-gray-700 last:border-r-0">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' })}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {date.getDate()}
            </div>
          </div>
          <div className="p-2 space-y-2">
            {events.tasks.map(task => (
              <div
                key={`task-${task.id}`}
                className="p-2 bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-lg"
              >
                <div className="text-sm font-medium text-purple-900 dark:text-purple-200">{t('calendar.taskPrefix')} {task.title}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">{task.worker?.name}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(task.status)}`}>
                  {t(`calendar.status.${task.status.replace('_', '')}`)}
                </div>
              </div>
            ))}
            {events.orders.map(order => (
              <div
                key={`order-${order.id}`}
                className="p-2 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="text-sm font-medium text-blue-900 dark:text-blue-200">{t('calendar.orderPrefix')} {order.title}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">{order.client?.name}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(order.status)}`}>
                  {t(`calendar.status.${order.status.replace('_', '')}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex">
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(selectedDate);
    const allEvents = [
      ...events.tasks.map(task => ({ ...task, type: 'task' as const })),
      ...events.orders.map(order => ({ ...order, type: 'order' as const }))
    ].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    return (
      <div className="space-y-4">
        {allEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>{t('calendar.noEvents')}</p>
          </div>
        ) : (
          allEvents.map(event => (
            <div
              key={`${event.type}-${event.id}`}
              className={`p-4 rounded-lg border ${
                event.type === 'task' 
                  ? 'bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800' 
                  : 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-lg">
                      {event.type === 'task' ? t('calendar.taskPrefix') : t('calendar.orderPrefix')}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                      {t(`calendar.status.${event.status.replace('_', '')}`)}
                    </span>
                    {event.type === 'task' && 'priority' in event && (
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(event.priority)}`}>
                        {t(`calendar.priority.${event.priority}`)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {event.type === 'task' && event.worker && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{event.worker.name}</span>
                      </div>
                    )}
                    {event.type === 'order' && event.client && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{event.client.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.due_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('calendar.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('calendar.header.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('calendar.header.subtitle')}</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
              >
                ←
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </h2>
              
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
              >
                →
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['month', 'week', 'day'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      view === v 
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t(`calendar.view.${v}`)}
                  </button>
                ))}
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['all', 'tasks', 'orders'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === f 
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t(`calendar.filter.${f}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-0 sm:p-6">
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('calendar.legend.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/50 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('calendar.legend.tasks')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/50 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('calendar.legend.orders')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('calendar.legend.completed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/50 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('calendar.legend.pending')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;