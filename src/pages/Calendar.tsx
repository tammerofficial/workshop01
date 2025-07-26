import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Filter, Search, Clock, User, Tag } from 'lucide-react';
import { taskService, orderService } from '../api/laravel';

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
      task.due_date === dateStr
    );
    
    const dayOrders = orders.filter(order => 
      order.due_date === dateStr
    );

    return { tasks: dayTasks, orders: dayOrders };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          className={`min-h-[120px] p-2 border border-gray-200 ${
            date.getMonth() === selectedDate.getMonth() ? 'bg-white' : 'bg-gray-50'
          } ${date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''}`}
        >
          <div className="text-sm font-medium text-gray-900 mb-1">
            {date.getDate()}
          </div>
          <div className="space-y-1">
            {events.tasks.map(task => (
              <div
                key={`task-${task.id}`}
                className="text-xs p-1 rounded bg-purple-100 text-purple-800 truncate"
                title={task.title}
              >
                📋 {task.title}
              </div>
            ))}
            {events.orders.map(order => (
              <div
                key={`order-${order.id}`}
                className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                title={order.title}
              >
                📦 {order.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
          <div key={day} className="bg-gray-100 p-3 text-center font-medium text-gray-700">
            {day}
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
        <div key={i} className="flex-1 min-h-[400px] border-r border-gray-200 last:border-r-0">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString('ar-SA', { weekday: 'short' })}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {date.getDate()}
            </div>
          </div>
          <div className="p-2 space-y-2">
            {events.tasks.map(task => (
              <div
                key={`task-${task.id}`}
                className="p-2 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div className="text-sm font-medium text-purple-900">📋 {task.title}</div>
                <div className="text-xs text-purple-700">{task.worker?.name}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'مكتمل' : 
                   task.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
                </div>
              </div>
            ))}
            {events.orders.map(order => (
              <div
                key={`order-${order.id}`}
                className="p-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="text-sm font-medium text-blue-900">📦 {order.title}</div>
                <div className="text-xs text-blue-700">{order.client?.name}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(order.status)}`}>
                  {order.status === 'completed' ? 'مكتمل' : 
                   order.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
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
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد أحداث لهذا اليوم</p>
          </div>
        ) : (
          allEvents.map(event => (
            <div
              key={`${event.type}-${event.id}`}
              className={`p-4 rounded-lg border ${
                event.type === 'task' 
                  ? 'bg-purple-50 border-purple-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {event.type === 'task' ? '📋' : '📦'}
                    </span>
                    <h3 className="font-medium text-gray-900">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                      {event.status === 'completed' ? 'مكتمل' : 
                       event.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
                    </span>
                    {event.type === 'task' && 'priority' in event && (
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(event.priority)}`}>
                        {event.priority === 'high' ? 'عالي' : 
                         event.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
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
                      <span>{new Date(event.due_date).toLocaleDateString('ar-SA')}</span>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التقويم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">التقويم</h1>
          </div>
          <p className="text-gray-600">إدارة المهام والطلبات في التقويم</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('ar-SA', { 
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['month', 'week', 'day'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      view === v 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {v === 'month' ? 'شهر' : v === 'week' ? 'أسبوع' : 'يوم'}
                  </button>
                ))}
              </div>

              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['all', 'tasks', 'orders'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === f 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f === 'all' ? 'الكل' : f === 'tasks' ? 'المهام' : 'الطلبات'}
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
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6">
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
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">دليل الألوان</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 rounded"></div>
              <span className="text-sm text-gray-700">المهام</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-sm text-gray-700">الطلبات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm text-gray-700">مكتمل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span className="text-sm text-gray-700">قيد الانتظار</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;