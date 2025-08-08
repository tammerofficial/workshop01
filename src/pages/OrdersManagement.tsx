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

// Real workshop data based on your dashboard
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

const statusConfig = {
  pending: {
    label: 'في الانتظار',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
    textColor: 'text-amber-700 dark:text-amber-400',
    icon: AlertCircle
  },
  in_progress: {
    label: 'قيد التنفيذ',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10',
    textColor: 'text-blue-700 dark:text-blue-400',
    icon: Clock
  },
  completed: {
    label: 'مكتمل',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10',
    textColor: 'text-green-700 dark:text-green-400',
    icon: CheckCircle
  },
  quality_check: {
    label: 'فحص الجودة',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10',
    textColor: 'text-purple-700 dark:text-purple-400',
    icon: Star
  },
  cancelled: {
    label: 'ملغي',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10',
    textColor: 'text-red-700 dark:text-red-400',
    icon: XCircle
  }
};

const priorityConfig = {
  high: {
    label: 'عالية',
    color: 'from-red-500 to-pink-600',
    bgColor: 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20',
    textColor: 'text-red-700 dark:text-red-400'
  },
  medium: {
    label: 'متوسطة',
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-400'
  },
  low: {
    label: 'منخفضة',
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20',
    textColor: 'text-green-700 dark:text-green-400'
  }
};

const OrdersManagement: React.FC = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm) ||
        order.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, priorityFilter]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowCreateModal(true);
    toast.success(t('orders.editStarted'));
  };

  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm(t('orders.confirmDelete'))) {
      setOrders(orders.filter(order => order.id !== orderId));
      toast.success(t('orders.deleteSuccess'));
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders([...mockOrders]);
      toast.success(t('orders.refreshSuccess'));
    } catch (error) {
      toast.error(t('orders.refreshError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // تحويل البيانات إلى CSV
      const headers = [
        'رقم الطلب',
        'العميل',
        'الهاتف',
        'المركبة',
        'الحالة',
        'الأولوية',
        'التقدم',
        'المبلغ',
        'تاريخ الاستحقاق'
      ];
      
      const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
          order.orderNumber,
          order.customerName,
          order.customerPhone,
          order.vehicle,
          getStatusText(order.status),
          getPriorityText(order.priority),
          `${order.progress}%`,
          `${order.totalAmount} ر.س`,
          new Date(order.dueDate).toLocaleDateString('ar-SA')
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(t('orders.exportSuccess'));
    } catch (error) {
      toast.error(t('orders.exportError'));
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: t('orders.status.pending'),
      in_progress: t('orders.status.inProgress'),
      completed: t('orders.status.completed'),
      cancelled: t('orders.status.cancelled')
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityTexts = {
      high: t('orders.priority.high'),
      medium: t('orders.priority.medium'),
      low: t('orders.priority.low')
    };
    return priorityTexts[priority as keyof typeof priorityTexts] || priority;
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('orders.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('orders.subtitle')}
          </p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('orders.refresh')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>{t('orders.export')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>{t('orders.newOrder')}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('orders.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('orders.status.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('orders.status.inProgress')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('orders.status.completed')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('orders.stats.totalRevenue')}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalRevenue.toLocaleString('ar-SA')} ر.س
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 lg:space-x-reverse">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4 space-x-reverse">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                              <option value="all">{t('orders.filters.allStatuses')}</option>
              <option value="pending">{getStatusText('pending')}</option>
              <option value="in_progress">{getStatusText('in_progress')}</option>
              <option value="completed">{getStatusText('completed')}</option>
              <option value="cancelled">{getStatusText('cancelled')}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                              <option value="all">{t('orders.filters.allPriorities')}</option>
              <option value="high">{getPriorityText('high')}</option>
              <option value="medium">{getPriorityText('medium')}</option>
              <option value="low">{getPriorityText('low')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.orderNumber')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.customer')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.vehicle')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.status')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.priority')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.progress')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.amount')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.dueDate')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('orders.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredOrders.map((order, index) => {
                  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.orderNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.vehicle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[order.priority as keyof typeof priorityColors]}`}>
                          {getPriorityText(order.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {order.progress}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.totalAmount.toLocaleString('ar-SA')} ر.س
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(order.dueDate).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditOrder(order)}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات متطابقة مع البحث</p>
          </div>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  تفاصيل الطلب - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    معلومات العميل
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">الاسم</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">الهاتف</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.customerPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    معلومات الطلب
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">المركبة</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.vehicle}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">الفني المسؤول</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.assignedTechnician}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الإنشاء</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الاستحقاق</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedOrder.dueDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    الخدمات المطلوبة
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.services.map((service: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-900 dark:text-white">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    وصف العمل
                  </h4>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.description}</p>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      إجمالي المبلغ
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedOrder.totalAmount.toLocaleString('ar-SA')} ر.س
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Plus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  إنشاء طلب جديد
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  سيتم إضافة نموذج إنشاء الطلبات قريباً
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  حسناً
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
