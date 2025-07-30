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
  Eye,
  ArrowUp,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { orderService, workerService } from '../api/laravel';
import { useNavigate } from 'react-router-dom';

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
  production_stage?: string;
  estimated_hours?: number;
  actual_hours?: number;
  started_at?: string | null;
  completed_at?: string | null;
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<number | ''>('');
  const [selectedProductionStage, setSelectedProductionStage] = useState<string>('pending');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [actualHours, setActualHours] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const stages = [
    { key: 'all', label: t('production.stages.all'), color: 'bg-gray-100 text-gray-800' },
    { key: 'pending', label: t('production.stages.pending'), color: 'bg-yellow-100 text-yellow-800' },
    { key: 'design', label: t('production.stages.design'), color: 'bg-blue-100 text-blue-800' },
    { key: 'cutting', label: t('production.stages.cutting'), color: 'bg-purple-100 text-purple-800' },
    { key: 'sewing', label: t('production.stages.sewing'), color: 'bg-green-100 text-green-800' },
    { key: 'fitting', label: t('production.stages.fitting'), color: 'bg-orange-100 text-orange-800' },
    { key: 'completed', label: t('production.stages.completed'), color: 'bg-green-100 text-green-800' }
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
    if (stage === 'all') {
      return orders;
    }
    return orders.filter(order => order.production_stage === stage || order.status === stage);
  };

  const getStageStats = (stage: string) => {
    const stageOrders = getOrdersByStage(stage);
    const activeWorkers = workers.filter(w => w.department === 'Production').length;
    
    return {
      orders: stageOrders.length,
      tasks: stageOrders.length, // Assuming each order has one task
      workers: activeWorkers
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setSelectedWorker(order.worker?.id || '');
    setSelectedProductionStage(order.production_stage || 'pending');
    setEstimatedHours(order.estimated_hours || 0);
    setActualHours(order.actual_hours || 0);
    setNotes('');
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const updatedOrder = {
        ...editingOrder,
        production_stage: selectedProductionStage,
        estimated_hours: estimatedHours,
        actual_hours: actualHours,
        worker_id: selectedWorker || null,
        started_at: selectedProductionStage !== 'pending' ? new Date().toISOString() : null,
        completed_at: selectedProductionStage === 'completed' ? new Date().toISOString() : null
      };

      await orderService.update(editingOrder.id, updatedOrder);
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o));
      setShowEditModal(false);
      setEditingOrder(null);
      alert(t('production.success.update'));
    } catch (error) {
      console.error('Error updating order:', error);
      alert(t('production.error.update'));
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(t('common.deleteConfirm'))) return;

    try {
      await orderService.delete(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      alert(t('common.success'));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(t('common.error'));
    }
  };

  const handleStartProduction = async (order: Order) => {
    if (!confirm(t('production.confirmStart'))) return;

    try {
      const updatedOrder = {
        ...order,
        production_stage: 'design',
        started_at: new Date().toISOString(),
        status: 'in_progress'
      };

      await orderService.update(order.id, updatedOrder);
      setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
      alert(t('production.success.start'));
    } catch (error) {
      console.error('Error starting production:', error);
      alert(t('production.error.start'));
    }
  };

  const handleMoveToNextStage = async (order: Order) => {
    if (!confirm(t('production.confirmMove'))) return;

    const stageOrder = ['pending', 'design', 'cutting', 'sewing', 'fitting', 'completed'];
    const currentIndex = stageOrder.indexOf(order.production_stage || 'pending');
    const nextStage = stageOrder[currentIndex + 1] || 'completed';

    try {
      const updatedOrder = {
        ...order,
        production_stage: nextStage,
        completed_at: nextStage === 'completed' ? new Date().toISOString() : null,
        status: nextStage === 'completed' ? 'completed' : 'in_progress'
      };

      await orderService.update(order.id, updatedOrder);
      setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
      alert(t('production.success.move'));
    } catch (error) {
      console.error('Error moving order:', error);
      alert(t('production.error.move'));
    }
  };

  const getNextStage = (currentStage: string) => {
    const stageOrder = ['pending', 'design', 'cutting', 'sewing', 'fitting', 'completed'];
    const currentIndex = stageOrder.indexOf(currentStage);
    return stageOrder[currentIndex + 1] || 'completed';
  };

  const getStageProgress = (order: Order) => {
    const stageOrder = ['pending', 'design', 'cutting', 'sewing', 'fitting', 'completed'];
    const currentIndex = stageOrder.indexOf(order.production_stage || 'pending');
    return ((currentIndex + 1) / stageOrder.length) * 100;
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
            onClick={() => navigate('/suit-production')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Factory size={16} />
            <span>{t('production.title')}</span>
          </motion.button>
          <motion.button 
            onClick={() => setShowAddModal(true)}
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
            {stages.map((stage) => (
              <button
                key={stage.key}
                onClick={() => setSelectedStage(stage.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStage === stage.key 
                    ? 'bg-blue-500 text-white' 
                    : `${stage.color} hover:bg-opacity-80`
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {stages.map((stage) => {
          const stats = getStageStats(stage.key);
          return (
            <div 
              key={stage.key} 
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}
            >
              <h3 className="font-semibold mb-2">{stage.label}</h3>
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
        {stages.slice(1).map((stage) => {
          const stageOrders = getOrdersByStage(stage.key).filter(order => 
            order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <div 
              key={stage.key} 
              className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{stage.label}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stage.key)}`}>
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.production_stage || 'pending')}`}>
                              {t(`production.stages.${order.production_stage || 'pending'}`)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleEditOrder(order)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title={t('production.updateStatus')}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title={t('common.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{order.client?.name}</span>
                        </div>
                        {order.worker && (
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span>{order.worker.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>

                      {/* Production Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{t('production.productionProgress')}</span>
                          <span>{Math.round(getStageProgress(order))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getStageProgress(order)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        {order.production_stage === 'pending' && (
                          <button
                            onClick={() => handleStartProduction(order)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                          >
                            {t('production.startProduction')}
                          </button>
                        )}
                        {order.production_stage && order.production_stage !== 'pending' && order.production_stage !== 'completed' && (
                          <button
                            onClick={() => handleMoveToNextStage(order)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                          >
                            {t('production.moveToNextStage')}
                          </button>
                        )}
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
            onClick={() => setShowAddModal(true)}
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

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('production.modal.editTitle')}</h2>
              <form onSubmit={handleUpdateOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('production.modal.stage')}</label>
                  <select
                    value={selectedProductionStage}
                    onChange={(e) => setSelectedProductionStage(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                  >
                    {stages.slice(1).map((stage) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('production.modal.worker')}</label>
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                  >
                    <option value="">{t('production.modal.selectWorker')}</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} - {typeof worker.role === 'string' ? worker.role : worker.role?.position_name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('production.modal.estimatedHours')}</label>
                    <input
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('production.modal.actualHours')}</label>
                    <input
                      type="number"
                      value={actualHours}
                      onChange={(e) => setActualHours(Number(e.target.value))}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('production.modal.notes')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('production.modal.saveChanges')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingOrder(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {t('production.modal.cancel')}
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