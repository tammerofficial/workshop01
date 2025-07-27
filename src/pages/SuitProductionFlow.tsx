import React, { useState, useEffect, useContext } from 'react';
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
  Trash2,
  Package,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { orderService, taskService, workerService } from '../api/laravel';
import { useNavigate } from 'react-router-dom';

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
  const { isDark } = useTheme();
  const { t, isRTL } = useContext(LanguageContext)!;
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stages = [
    { id: 'pending', name: t('production.stages.pending'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'design', name: t('production.stages.design'), color: 'bg-blue-100 text-blue-800', icon: Edit },
    { id: 'cutting', name: t('production.stages.cutting'), color: 'bg-purple-100 text-purple-800', icon: Factory },
    { id: 'sewing', name: t('production.stages.sewing'), color: 'bg-green-100 text-green-800', icon: Users },
    { id: 'fitting', name: t('production.stages.fitting'), color: 'bg-orange-100 text-orange-800', icon: Eye },
    { id: 'completed', name: t('production.stages.completed'), color: 'bg-green-100 text-green-800', icon: CheckCircle }
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
      order.status === stage &&
      (order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.client?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getTasksByStage = (stage: string) => {
    if (stage === 'all') {
      return tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.order?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return tasks.filter(task => 
      task.status === stage &&
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       task.order?.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getStageStats = (stage: string) => {
    const stageOrders = getOrdersByStage(stage);
    const stageTasks = getTasksByStage(stage);
    const activeWorkers = workers.filter(w => w.is_active).length;
    
    return {
      orders: stageOrders.length,
      tasks: stageTasks.length,
      workers: activeWorkers
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'متوسط';
    }
  };

  const getOrderDisplayTitle = (order: Order) => {
    if (order.title?.startsWith('WooCommerce Order')) {
      const match = order.title.match(/#(\d+)/);
      return match ? `#${match[1]}` : order.title;
    }
    return order.title.length > 15 ? order.title.substring(0, 15) + '...' : order.title;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('production.title')}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('production.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button 
            onClick={() => navigate('/station-display')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Users size={16} />
            <span>{t('stations.title')}</span>
          </motion.button>
          <motion.button 
            onClick={() => navigate('/production-tracking')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <TrendingUp size={16} />
            <span>{t('production.title')}</span>
          </motion.button>
          <motion.button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t('production.addNewOrder')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder={t('production.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStage === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('production.stages.all')}
            </button>
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStage === stage.id 
                    ? 'bg-blue-500 text-white' 
                    : `${stage.color} hover:bg-opacity-80`
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stage Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}>
          <h3 className="font-semibold mb-2">{t('production.stages.all')}</h3>
          <div className="text-2xl font-bold text-blue-600 mb-1">{orders.length}</div>
          <div className="text-sm text-gray-500">
            {orders.length} {t('production.stats.orders')} • {tasks.length} {t('production.stats.tasks')} • {workers.length} {t('production.stats.workers')}
          </div>
        </div>
        {stages.map((stage) => {
          const stats = getStageStats(stage.id);
          return (
            <div 
              key={stage.id} 
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}
            >
              <h3 className="font-semibold mb-2">{stage.name}</h3>
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.orders}</div>
              <div className="text-sm text-gray-500">
                {stats.orders} {t('production.stats.orders')} • {stats.tasks} {t('production.stats.tasks')} • {stats.workers} {t('production.stats.workers')}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Orders by Stage */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {stages.map((stage) => {
          const stageOrders = getOrdersByStage(stage.id);

          return (
            <div 
              key={stage.id} 
              className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{stage.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stage.id)}`}>
                  {stageOrders.length}
                </span>
              </div>

              {stageOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">{t('production.empty.noItems')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stageOrders.slice(0, 3).map((order) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">📦 {getOrderDisplayTitle(order)}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                              {getPriorityText(order.priority)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {t(`production.stages.${order.status}`)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title={t('production.updateStatus')}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            title={t('common.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        {order.client && (
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span>{order.client.name}</span>
                          </div>
                        )}
                        {order.worker && (
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span>{order.worker.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{new Date(order.due_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {stageOrders.length > 3 && (
                    <button className="w-full text-center py-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      {t('production.showMore')} ({stageOrders.length - 3})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}
      >
        <h3 className="text-lg font-semibold mb-4">{t('production.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>{t('production.addNewOrder')}</span>
          </motion.button>
          <motion.button 
            className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Plus size={20} />
            <span>{t('production.addNewTask')}</span>
          </motion.button>
          <motion.button 
            className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Users size={20} />
            <span>{t('production.manageWorkers')}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuitProductionFlow;