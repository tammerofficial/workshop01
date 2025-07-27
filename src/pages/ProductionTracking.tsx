import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, 
  Clock, 
  CheckCircle, 
  Play, 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  User, 
  Calendar,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { orderService, workerService } from '../api/laravel';

interface ProductionStage {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  actual_hours: number | null;
  estimated_hours: number;
  worker: {
    id: number;
    name: string;
  } | null;
  station: {
    id: number;
    name: string;
  } | null;
}

interface Order {
  id: number;
  title: string;
  status: string;
  priority: string;
  client: {
    id: number;
    name: string;
  };
  worker: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  woocommerce_id?: number;
}

interface Worker {
  id: number;
  name: string;
  role: string;
  department: string;
}

const ProductionTracking: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useContext(LanguageContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const stages = [
    { key: 'all', label: t('production.stages.all') },
    { key: 'pending', label: t('production.stages.pending') },
    { key: 'design', label: t('production.stages.design') },
    { key: 'cutting', label: t('production.stages.cutting') },
    { key: 'sewing', label: t('production.stages.sewing') },
    { key: 'fitting', label: t('production.stages.fitting') },
    { key: 'completed', label: t('production.stages.completed') }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, workersRes] = await Promise.all([
        orderService.getAll(),
        workerService.getAll()
      ]);
      
      setOrders(ordersRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByStage = (stage: string) => {
    if (stage === 'all') return orders;
    return orders.filter(order => order.status === stage);
  };

  const getStageStats = (stage: string) => {
    const stageOrders = getOrdersByStage(stage);
    return {
      orders: stageOrders.length,
      tasks: 0, // TODO: Implement tasks
      workers: stageOrders.filter(order => order.worker).length
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالية';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await orderService.update(editingOrder.id, editingOrder);
      await loadData();
      setShowEditModal(false);
      setEditingOrder(null);
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await orderService.delete(orderId);
      await loadData();
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const filteredOrders = getOrdersByStage(selectedStage).filter(order =>
    order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t('production.addNewOrder')}</span>
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {stages.map((stage) => (
              <button
                key={stage.key}
                onClick={() => setSelectedStage(stage.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStage === stage.key
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stage Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {stages.map((stage) => {
          const stats = getStageStats(stage.key);
          return (
            <div
              key={stage.key}
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stage.label}
              </h3>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.orders}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.orders} {t('production.stats.orders')} • {stats.tasks} {t('production.stats.tasks')} • {stats.workers} {t('production.stats.workers')}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Orders by Stage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {stages.slice(1).map((stage) => {
          const stageOrders = getOrdersByStage(stage.key).filter(order =>
            order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.client.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          return (
            <div
              key={stage.key}
              className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stage.label}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stage.key)}`}>
                  {stageOrders.length}
                </span>
              </div>

              {stageOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('production.empty.noItems')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stageOrders.slice(0, 3).map((order) => (
                    <motion.div
                      key={order.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:border-blue-300 transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            📦 {order.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                              {getPriorityText(order.priority)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <User size={14} className="text-gray-500 mr-1" />
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            👤 {order.client.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Users size={14} className="text-gray-500 mr-1" />
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            👷 {order.worker ? order.worker.name : 'غير محدد'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Calendar size={14} className="text-gray-500 mr-1" />
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            📅 {new Date(order.created_at).toLocaleDateString('ar-SA')}
                          </span>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('production.quickActions')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>{t('production.addNewOrder')}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Plus size={20} />
            <span>{t('production.addNewTask')}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Users size={20} />
            <span>{t('production.manageWorkers')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">تعديل الطلب</h2>
              <form onSubmit={handleUpdateOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الطلب</label>
                    <input
                      type="text"
                      required
                      value={editingOrder.title}
                      onChange={(e) => setEditingOrder({ ...editingOrder, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="design">التصميم</option>
                      <option value="cutting">القطع</option>
                      <option value="sewing">الخياطة</option>
                      <option value="fitting">التركيب</option>
                      <option value="completed">مكتمل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                    <select
                      value={editingOrder.priority}
                      onChange={(e) => setEditingOrder({ ...editingOrder, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسط</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العامل المسؤول</label>
                    <select
                      value={editingOrder.worker?.id || ''}
                      onChange={(e) => {
                        const workerId = e.target.value ? parseInt(e.target.value) : null;
                        const worker = workerId ? workers.find(w => w.id === workerId) : null;
                        setEditingOrder({ 
                          ...editingOrder, 
                          worker: worker ? { id: worker.id, name: worker.name } : null 
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">غير محدد</option>
                      {workers.map(worker => (
                        <option key={worker.id} value={worker.id}>{worker.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingOrder(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionTracking;