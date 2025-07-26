import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { orderService, taskService, workerService } from '../api/laravel';

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
  tasks?: Task[];
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
  };
}

interface Worker {
  id: number;
  name: string;
  role: string;
  is_active: boolean;
}

const SuitProductionFlow: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stages = [
    { id: 'pending', name: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'design', name: 'التصميم', color: 'bg-blue-100 text-blue-800', icon: Edit },
    { id: 'cutting', name: 'القطع', color: 'bg-purple-100 text-purple-800', icon: Factory },
    { id: 'sewing', name: 'الخياطة', color: 'bg-green-100 text-green-800', icon: Users },
    { id: 'fitting', name: 'التركيب', color: 'bg-orange-100 text-orange-800', icon: Eye },
    { id: 'completed', name: 'مكتمل', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  ];

  useEffect(() => {
    loadProductionData();
  }, []);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, tasksResponse, workersResponse] = await Promise.all([
        orderService.getAll(),
        taskService.getAll(),
        workerService.getAll()
      ]);
      
      setOrders(ordersResponse.data);
      setTasks(tasksResponse.data);
      setWorkers(workersResponse.data.filter((w: Worker) => w.is_active));
    } catch (error) {
      console.error('Error loading production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByStage = (stage: string) => {
    if (stage === 'all') {
      return orders.filter(order => 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return orders.filter(order => 
      order.status === stage && (
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getTasksByStage = (stage: string) => {
    if (stage === 'all') {
      return tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.worker?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return tasks.filter(task => 
      task.status === stage && (
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.worker?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getStageStats = (stage: string) => {
    const stageOrders = getOrdersByStage(stage);
    const stageTasks = getTasksByStage(stage);
    
    return {
      orders: stageOrders.length,
      tasks: stageTasks.length,
      workers: workers.filter(w => w.role.toLowerCase().includes(stage)).length
    };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الإنتاج...</p>
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
              <Factory className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">سير الإنتاج</h1>
          </div>
          <p className="text-gray-600">إدارة مراحل إنتاج البدلات والملابس</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الطلبات والمهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">جميع المراحل</option>
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Production Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stages.map((stage, index) => {
            const stats = getStageStats(stage.id);
            const stageOrders = getOrdersByStage(stage.id);
            const stageTasks = getTasksByStage(stage.id);
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Stage Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stage.color.replace('text-', 'bg-').replace('800', '100')}`}>
                        <stage.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                        <p className="text-sm text-gray-600">
                          {stats.orders} طلب • {stats.tasks} مهمة • {stats.workers} عامل
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${stage.color}`}>
                      {stats.orders + stats.tasks}
                    </div>
                  </div>
                </div>

                {/* Stage Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Orders in this stage */}
                    {stageOrders.slice(0, 3).map(order => (
                      <div
                        key={`order-${order.id}`}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">📦 {order.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(order.priority)}`}>
                            {order.priority === 'high' ? 'عالي' : 
                             order.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>👤 {order.client?.name}</p>
                          <p>👷 {order.worker?.name || 'غير محدد'}</p>
                          <p>📅 {new Date(order.due_date).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Tasks in this stage */}
                    {stageTasks.slice(0, 3).map(task => (
                      <div
                        key={`task-${task.id}`}
                        className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-purple-900">📋 {task.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? 'عالي' : 
                             task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                        <div className="text-sm text-purple-700 space-y-1">
                          <p>👷 {task.worker?.name || 'غير محدد'}</p>
                          <p>📅 {new Date(task.due_date).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="p-1 hover:bg-purple-200 rounded transition-colors">
                            <Eye className="h-4 w-4 text-purple-600" />
                          </button>
                          <button className="p-1 hover:bg-purple-200 rounded transition-colors">
                            <Edit className="h-4 w-4 text-purple-600" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Show more indicator */}
                    {(stageOrders.length > 3 || stageTasks.length > 3) && (
                      <div className="text-center py-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          عرض المزيد ({stageOrders.length + stageTasks.length - 6})
                        </button>
                      </div>
                    )}

                    {/* Empty state */}
                    {stageOrders.length === 0 && stageTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <stage.icon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>لا توجد عناصر في هذه المرحلة</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Production Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">سير الإنتاج</h3>
          <div className="flex items-center justify-center overflow-x-auto">
            <div className="flex items-center space-x-4 min-w-max">
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${stage.color.replace('text-', 'bg-').replace('800', '100')} mb-2`}>
                      <stage.icon className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                    <p className="text-xs text-gray-600">{getStageStats(stage.id).orders + getStageStats(stage.id).tasks}</p>
                  </div>
                  {index < stages.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" />
              إضافة طلب جديد
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
              <Plus className="h-5 w-5" />
              إضافة مهمة جديدة
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              <Users className="h-5 w-5" />
              إدارة العمال
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuitProductionFlow;