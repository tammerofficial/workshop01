import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Square,
  Settings,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react';
import { workerService, taskService, orderService } from '../api/laravel';

interface Worker {
  id: number;
  name: string;
  role: string;
  department: string;
  is_active: boolean;
  current_task?: Task;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
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
  status: string;
  due_date: string;
  priority: string;
  client?: {
    name: string;
  };
  worker?: {
    name: string;
  };
}

const StationDisplay: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const departments = [
    { id: 'all', name: 'جميع الأقسام', color: 'bg-gray-100 text-gray-800' },
    { id: 'design', name: 'التصميم', color: 'bg-blue-100 text-blue-800' },
    { id: 'cutting', name: 'القطع', color: 'bg-purple-100 text-purple-800' },
    { id: 'sewing', name: 'الخياطة', color: 'bg-green-100 text-green-800' },
    { id: 'fitting', name: 'التركيب', color: 'bg-orange-100 text-orange-800' },
    { id: 'finishing', name: 'التشطيب', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadStationData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadStationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStationData = async () => {
    try {
      setLoading(true);
      const [workersResponse, tasksResponse, ordersResponse] = await Promise.all([
        workerService.getAll(),
        taskService.getAll(),
        orderService.getAll()
      ]);
      
      const activeWorkers = workersResponse.data.filter((w: Worker) => w.is_active);
      
      // Assign current tasks to workers
      const workersWithTasks = activeWorkers.map((worker: Worker) => {
        const currentTask = tasksResponse.data.find((task: Task) => 
          task.worker?.name === worker.name && task.status === 'in_progress'
        );
        return { ...worker, current_task: currentTask };
      });
      
      setWorkers(workersWithTasks);
      setTasks(tasksResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error loading station data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkersByDepartment = () => {
    if (selectedDepartment === 'all') {
      return workers;
    }
    return workers.filter(worker => worker.department === selectedDepartment);
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

  const getWorkerStatus = (worker: Worker) => {
    if (worker.current_task) {
      return {
        status: 'busy',
        text: 'مشغول',
        color: 'bg-red-100 text-red-800',
        icon: Play
      };
    }
    return {
      status: 'available',
      text: 'متاح',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات المحطات...</p>
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
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">عرض المحطات</h1>
          </div>
          <p className="text-gray-600">مراقبة حالة العمال والمهام في الوقت الفعلي</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['grid', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode === 'grid' ? 'شبكة' : 'قائمة'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadStationData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العمال</p>
                <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">العمال المتاحون</p>
                <p className="text-2xl font-bold text-green-600">
                  {workers.filter(w => !w.current_task).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المهام النشطة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الطلبات المعلقة</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Worker Stations */}
        {viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {getWorkersByDepartment().map((worker, index) => {
              const workerStatus = getWorkerStatus(worker);
              const StatusIcon = workerStatus.icon;
              
              return (
                <motion.div
                  key={worker.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Worker Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                          <p className="text-sm text-gray-600">{worker.role}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${workerStatus.color}`}>
                        {workerStatus.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{worker.department}</span>
                    </div>
                  </div>

                  {/* Current Task */}
                  <div className="p-6">
                    {worker.current_task ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-blue-900">📋 {worker.current_task.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(worker.current_task.priority)}`}>
                              {worker.current_task.priority === 'high' ? 'عالي' : 
                               worker.current_task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </span>
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            {worker.current_task.order && (
                              <p>📦 {worker.current_task.order.title}</p>
                            )}
                            <p>📅 {new Date(worker.current_task.due_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button className="p-1 hover:bg-blue-200 rounded transition-colors">
                              <Pause className="h-4 w-4 text-blue-600" />
                            </button>
                                                         <button className="p-1 hover:bg-blue-200 rounded transition-colors">
                               <Square className="h-4 w-4 text-blue-600" />
                             </button>
                            <button className="p-1 hover:bg-blue-200 rounded transition-colors">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>متاح للعمل</p>
                        <p className="text-sm mt-1">لا توجد مهام حالية</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العامل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      القسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المهمة الحالية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getWorkersByDepartment().map((worker) => {
                    const workerStatus = getWorkerStatus(worker);
                    const StatusIcon = workerStatus.icon;
                    
                    return (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="mr-3">
                              <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                              <div className="text-sm text-gray-500">{worker.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {worker.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workerStatus.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {workerStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {worker.current_task ? (
                            <div>
                              <div className="font-medium">{worker.current_task.title}</div>
                              <div className="text-gray-500">{worker.current_task.order?.title}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">متاح</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <Settings className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Department Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">دليل الأقسام</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments.slice(1).map(dept => (
              <div key={dept.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${dept.color.replace('text-', 'bg-').replace('800', '100')}`}></div>
                <span className="text-sm text-gray-700">{dept.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StationDisplay;