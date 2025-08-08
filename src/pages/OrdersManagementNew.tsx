import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../api/laravel';

// Types
interface Order {
  id: number;
  order_number: string;
  client: {
    name: string;
    phone: string;
    email?: string;
  };
  status: string;
  priority: 'high' | 'medium' | 'low';
  total_cost: number;
  created_at: string;
  due_date: string;
  description: string;
  vehicle_details?: string;
  services?: { name: string }[];
  assigned_worker?: { name: string };
  progress?: number;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const priorityColors: { [key: string]: string } = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
};

const statusIcons: { [key: string]: React.ElementType } = {
  pending: AlertCircle,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
  on_hold: Clock,
};

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getAll();
      // Handle different response structures
      const ordersData = response.data.data || response.data || [];
      setOrders(ordersData);
    } catch (error) {
      toast.error('فشل في جلب الطلبات');
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.order_number && order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.client && order.client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.client && order.client.phone.includes(searchTerm)) ||
        (order.vehicle_details && order.vehicle_details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, priorityFilter]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleEditOrder = (_order: Order) => {
    toast.success('سيتم فتح نموذج التحرير قريباً');
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await orderService.delete(orderId);
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        toast.success('تم حذف الطلب بنجاح');
      } catch (error) {
        toast.error('فشل في حذف الطلب');
        console.error("Error deleting order:", error);
      }
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts: { [key: string]: string } = {
      pending: 'في الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      on_hold: 'معلق'
    };
    return statusTexts[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityTexts: { [key: string]: string } = {
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة'
    };
    return priorityTexts[priority] || priority;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (Number(o.total_cost) || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            إدارة الطلبات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            إدارة وتتبع جميع طلبات الورشة من قاعدة البيانات مباشرة
          </p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchOrders}
            disabled={isLoading}
            className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 dark:bg-gray-800/80 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg border border-gray-200/50 dark:border-gray-700/50 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="font-medium">{isLoading ? 'جاري التحديث...' : 'تحديث'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">تصدير</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">طلب جديد</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">في الانتظار</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">قيد التنفيذ</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">مكتملة</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.totalRevenue.toLocaleString('ar-SA')} ر.س
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 lg:space-x-reverse">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-0 rounded-xl bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-0 rounded-xl bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
              <option value="on_hold">معلق</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border-0 rounded-xl bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="all">جميع الأولويات</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">المركبة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الأولوية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">التقدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ الاستحقاق</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex flex-col justify-center items-center space-y-4">
                      <div className="relative">
                        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">جاري تحميل الطلبات من قاعدة البيانات...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredOrders.map((order, index) => {
                    const StatusIcon = statusIcons[order.status] || AlertCircle;
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{order.order_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{order.client?.name || 'غير محدد'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{order.client?.phone || ''}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-medium">{order.vehicle_details || 'غير محدد'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[order.status] || statusColors.on_hold}`}>
                            <StatusIcon className="w-3 h-3 ml-1.5" />
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${priorityColors[order.priority] || priorityColors.medium}`}>
                            {getPriorityText(order.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${order.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{order.progress || 0}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {(Number(order.total_cost) || 0).toLocaleString('ar-SA')} ر.س
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {new Date(order.due_date).toLocaleDateString('ar-SA')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <motion.button 
                              whileHover={{ scale: 1.1 }} 
                              whileTap={{ scale: 0.9 }} 
                              onClick={() => handleViewOrder(order)} 
                              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }} 
                              whileTap={{ scale: 0.9 }} 
                              onClick={() => handleEditOrder(order)} 
                              className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }} 
                              whileTap={{ scale: 0.9 }} 
                              onClick={() => handleDeleteOrder(order.id)} 
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <Package className="w-16 h-16 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">لا توجد طلبات في قاعدة البيانات</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span>إنشاء أول طلب</span>
                      </motion.button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  تفاصيل الطلب - {selectedOrder.order_number}
                </h3>
                <button 
                  onClick={() => setShowOrderDetails(false)} 
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 ml-2 text-blue-600" />
                    معلومات العميل
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">الاسم</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedOrder.client?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">الهاتف</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedOrder.client?.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">معلومات الطلب</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">المركبة</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.vehicle_details || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">الفني المسؤول</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.assigned_worker?.name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">تاريخ الإنشاء</p>
                      <p className="font-bold text-gray-900 dark:text-white">{new Date(selectedOrder.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">تاريخ الاستحقاق</p>
                      <p className="font-bold text-gray-900 dark:text-white">{new Date(selectedOrder.due_date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                </div>
                {selectedOrder.services && selectedOrder.services.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الخدمات المطلوبة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedOrder.services.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 space-x-reverse p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-900 dark:text-white font-medium">{service.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">وصف العمل</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedOrder.description}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">إجمالي المبلغ</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                      {(Number(selectedOrder.total_cost) || 0).toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Order Modal Placeholder */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">إنشاء طلب جديد</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  سيتم إضافة نموذج شامل لإنشاء الطلبات قريباً بإذن الله
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-medium"
                >
                  فهمت، شكراً
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersManagement;
