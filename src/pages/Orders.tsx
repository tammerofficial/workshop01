import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Calendar, DollarSign, Package, ShoppingCart, ExternalLink, Eye, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { orderService, clientService, workerService, categoryService } from '../api/laravel';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface WooCommerceOrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
  variation_id?: number;
}

interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  date_modified: string;
  total: string;
  subtotal: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  currency: string;
  payment_method: string;
  payment_method_title: string;
  shipping_method: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: WooCommerceOrderItem[];
  meta_data: Array<{
    key: string;
    value: any;
  }>;
}

interface Order {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  due_date: string;
  total_cost: number;
  woocommerce_id?: number;
  woocommerce_order?: WooCommerceOrder;
  client: {
    id: number;
    name: string;
    phone: string;
    email?: string;
  };
  worker: {
    id: number;
    name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
}

const Orders = () => {
  const { t, isRTL } = useContext(LanguageContext)!;
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    client_id: '',
    assigned_worker_id: '',
    category_id: '',
    priority: 'medium',
    start_date: '',
    due_date: '',
    total_cost: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, clientsRes, workersRes, categoriesRes] = await Promise.all([
        orderService.getAll(),
        clientService.getAll(),
        workerService.getAll(),
        categoryService.getAll()
      ]);

      setOrders(ordersRes.data);
      setClients(clientsRes.data);
      setWorkers(workersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        ...newOrder,
        total_cost: parseFloat(newOrder.total_cost) || 0,
        assigned_worker_id: newOrder.assigned_worker_id || null,
        category_id: newOrder.category_id || null
      };

      await orderService.create(orderData);
      toast.success(t('orders.createSuccess'));
      setShowCreateModal(false);
      setNewOrder({
        title: '',
        description: '',
        client_id: '',
        assigned_worker_id: '',
        category_id: '',
        priority: 'medium',
        start_date: '',
        due_date: '',
        total_cost: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(t('common.error'));
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    try {
      const orderData = {
        ...editingOrder,
        total_cost: parseFloat(editingOrder.total_cost.toString()) || 0,
        assigned_worker_id: editingOrder.worker?.id || null,
        category_id: editingOrder.category?.id || null
      };

      await orderService.update(editingOrder.id, orderData);
      toast.success(t('orders.updateSuccess'));
      setEditingOrder(null);
      loadData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm(t('orders.deleteConfirm'))) return;
    
    try {
      await orderService.delete(id);
      toast.success(t('orders.deleteSuccess'));
      loadData();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(t('common.error'));
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedOrder = { ...order, status: newStatus as any };
      await orderService.update(orderId, updatedOrder);
      toast.success(t('orders.statusUpdateSuccess'));
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('common.error'));
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('orders.status.completed');
      case 'in_progress': return t('orders.status.inProgress');
      case 'pending': return t('orders.status.pending');
      case 'cancelled': return t('orders.status.cancelled');
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t('orders.priority.high');
      case 'medium': return t('orders.priority.medium');
      case 'low': return t('orders.priority.low');
      case 'urgent': return t('orders.priority.urgent');
      default: return priority;
    }
  };

  const getWooCommerceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWooCommerceStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('woocommerce.status.completed');
      case 'processing': return t('woocommerce.status.processing');
      case 'pending': return t('woocommerce.status.pending');
      case 'on-hold': return t('woocommerce.status.onHold');
      case 'cancelled': return t('woocommerce.status.cancelled');
      case 'refunded': return t('woocommerce.status.refunded');
      default: return status;
    }
  };

  const getOrderDisplayTitle = (order: Order) => {
    if (order.title?.startsWith('WooCommerce Order')) {
      const match = order.title.match(/#(\d+)/);
      return match ? `#${match[1]}` : order.title;
    }
    return order.title.length > 15 ? order.title.substring(0, 15) + '...' : order.title;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.woocommerce_id && `#${order.woocommerce_id}`.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toFixed(2)} د.ك`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.875)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--text-color)'
            }}
          >
            Orders
          </h1>
          <p 
            className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.125)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--secondary-color)'
            }}
          >
            Manage customer orders and track progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t('orders.newOrder')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('orders.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                }`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="all">{t('orders.allStatuses')}</option>
              <option value="pending">{t('orders.status.pending')}</option>
              <option value="in_progress">{t('orders.status.inProgress')}</option>
              <option value="completed">{t('orders.status.completed')}</option>
              <option value="cancelled">{t('orders.status.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => {
              setSelectedOrder(order);
              setShowOrderDetails(true);
            }}
          >
            {/* WooCommerce Badge */}
            {order.woocommerce_id && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="text-blue-500" size={16} />
                  <span className="text-sm font-medium text-blue-600">
                    #{order.woocommerce_id}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {t('woocommerce.imported')}
                </span>
              </div>
            )}

            {/* Order Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{getOrderDisplayTitle(order)}</h3>
                <p className="text-sm text-gray-500 mb-2">{order.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={14} />
                  <span>{order.client.name}</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('orders.date')}</span>
                <span className="text-sm font-medium">{formatDate(order.start_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('orders.total')}</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(order.total_cost)}
                </span>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                {getPriorityText(order.priority)}
              </span>
            </div>

            {/* WooCommerce Status */}
            {order.woocommerce_order && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('woocommerce.status')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWooCommerceStatusColor(order.woocommerce_order.status)}`}>
                    {getWooCommerceStatusText(order.woocommerce_order.status)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(order);
                  setShowOrderDetails(true);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center space-x-1"
              >
                <Eye size={14} />
                <span>{t('orders.viewDetails')}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOrder(order);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteOrder(order.id);
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
                              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('orders.orderDetails') || 'تفاصيل الطلب'}</h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                    title={t('common.close') || 'إغلاق'}
                  >
                    ✕
                  </button>
                </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Order Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('orders.basicInfo') || 'المعلومات الأساسية'}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('orders.title')}</label>
                      <p className="text-lg">{getOrderDisplayTitle(selectedOrder)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('orders.description')}</label>
                      <p className="text-gray-700">{selectedOrder.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('orders.total')}</label>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedOrder.total_cost)}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">{t('orders.status')}</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">{t('orders.priority')}</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPriorityColor(selectedOrder.priority)}`}>
                          {getPriorityText(selectedOrder.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('orders.clientInfo')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="text-gray-400" size={16} />
                      <span className="font-medium">{selectedOrder.client.name}</span>
                    </div>
                    {selectedOrder.client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="text-gray-400" size={16} />
                        <span>{selectedOrder.client.phone}</span>
                      </div>
                    )}
                    {selectedOrder.client.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="text-gray-400" size={16} />
                        <span>{selectedOrder.client.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* WooCommerce Details */}
              {selectedOrder.woocommerce_order && (
                <div className="mt-8 space-y-6">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="text-blue-500" size={20} />
                    <h3 className="text-lg font-semibold">{t('woocommerce.orderDetails')}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">{t('woocommerce.orderInfo')}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t('woocommerce.orderNumber')}</label>
                          <p className="font-medium">#{selectedOrder.woocommerce_order.number}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t('woocommerce.status')}</label>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getWooCommerceStatusColor(selectedOrder.woocommerce_order.status)}`}>
                            {getWooCommerceStatusText(selectedOrder.woocommerce_order.status)}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t('woocommerce.dateCreated')}</label>
                          <p>{formatDate(selectedOrder.woocommerce_order.date_created)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t('woocommerce.paymentMethod')}</label>
                          <p>{selectedOrder.woocommerce_order.payment_method_title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">{t('woocommerce.financialInfo')}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{t('woocommerce.subtotal')}</span>
                          <span>{formatCurrency(selectedOrder.woocommerce_order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{t('woocommerce.shipping')}</span>
                          <span>{formatCurrency(selectedOrder.woocommerce_order.shipping_total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{t('woocommerce.tax')}</span>
                          <span>{formatCurrency(selectedOrder.woocommerce_order.total_tax)}</span>
                        </div>
                        {parseFloat(selectedOrder.woocommerce_order.discount_total) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">{t('woocommerce.discount')}</span>
                            <span className="text-red-600">-{formatCurrency(selectedOrder.woocommerce_order.discount_total)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">{t('woocommerce.total')}</span>
                          <span className="font-bold text-lg">{formatCurrency(selectedOrder.woocommerce_order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {selectedOrder.woocommerce_order.line_items.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">{t('woocommerce.orderItems')}</h4>
                      <div className="space-y-3">
                        {selectedOrder.woocommerce_order.line_items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {t('woocommerce.quantity')}: {item.quantity} × {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.total)}</p>
                              {item.sku && (
                                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Billing Address */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">{t('woocommerce.billingAddress')}</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">
                          {selectedOrder.woocommerce_order.billing.first_name} {selectedOrder.woocommerce_order.billing.last_name}
                        </p>
                        {selectedOrder.woocommerce_order.billing.company && (
                          <p className="text-gray-600">{selectedOrder.woocommerce_order.billing.company}</p>
                        )}
                        <p className="text-gray-600">{selectedOrder.woocommerce_order.billing.address_1}</p>
                        {selectedOrder.woocommerce_order.billing.address_2 && (
                          <p className="text-gray-600">{selectedOrder.woocommerce_order.billing.address_2}</p>
                        )}
                        <p className="text-gray-600">
                          {selectedOrder.woocommerce_order.billing.city}, {selectedOrder.woocommerce_order.billing.state} {selectedOrder.woocommerce_order.billing.postcode}
                        </p>
                        <p className="text-gray-600">{selectedOrder.woocommerce_order.billing.country}</p>
                        <p className="text-gray-600">{selectedOrder.woocommerce_order.billing.phone}</p>
                        <p className="text-gray-600">{selectedOrder.woocommerce_order.billing.email}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">{t('woocommerce.shippingAddress')}</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">
                          {selectedOrder.woocommerce_order.shipping.first_name} {selectedOrder.woocommerce_order.shipping.last_name}
                        </p>
                        {selectedOrder.woocommerce_order.shipping.company && (
                          <p className="text-gray-600">{selectedOrder.woocommerce_order.shipping.company}</p>
                        )}
                        <p className="text-gray-600">{selectedOrder.woocommerce_order.shipping.address_1}</p>
                        {selectedOrder.woocommerce_order.shipping.address_2 && (
                          <p className="text-gray-600">{selectedOrder.woocommerce_order.shipping.address_2}</p>
                        )}
                        <p className="text-gray-600">
                          {selectedOrder.woocommerce_order.shipping.city}, {selectedOrder.woocommerce_order.shipping.state} {selectedOrder.woocommerce_order.shipping.postcode}
                        </p>
                        <p className="text-gray-600">{selectedOrder.woocommerce_order.shipping.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => setEditingOrder(selectedOrder)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {t('orders.editOrder')}
                </button>
                
                {/* Production Tracking Button - Show only for in-progress orders */}
                {(selectedOrder.status === 'in_progress' || selectedOrder.status === 'pending') && (
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      // Navigate to Production Tracking page
                      window.open(`/production-tracking?order=${selectedOrder.id}`, '_blank');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <span>🏭</span>
                    <span>{t('orders.trackProduction')}</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg max-w-2xl w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('orders.createOrder')}</h2>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('orders.title')}</label>
                  <input
                    type="text"
                    value={newOrder.title}
                    onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('orders.description')}</label>
                  <textarea
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                    rows={3}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.client')}</label>
                    <select
                      value={newOrder.client_id}
                      onChange={(e) => setNewOrder({...newOrder, client_id: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                      required
                    >
                      <option value="">{t('orders.selectClient')}</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.category')}</label>
                    <select
                      value={newOrder.category_id}
                      onChange={(e) => setNewOrder({...newOrder, category_id: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    >
                      <option value="">{t('orders.selectCategory')}</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.assignedWorker')}</label>
                    <select
                      value={newOrder.assigned_worker_id}
                      onChange={(e) => setNewOrder({...newOrder, assigned_worker_id: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    >
                      <option value="">{t('orders.selectWorker')}</option>
                      {workers.map((worker: any) => (
                        <option key={worker.id} value={worker.id}>{worker.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.priority')}</label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    >
                      <option value="low">{t('orders.priority.low')}</option>
                      <option value="medium">{t('orders.priority.medium')}</option>
                      <option value="high">{t('orders.priority.high')}</option>
                      <option value="urgent">{t('orders.priority.urgent')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.startDate')}</label>
                    <input
                      type="date"
                      value={newOrder.start_date}
                      onChange={(e) => setNewOrder({...newOrder, start_date: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.dueDate')}</label>
                    <input
                      type="date"
                      value={newOrder.due_date}
                      onChange={(e) => setNewOrder({...newOrder, due_date: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('orders.totalCost')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrder.total_cost}
                    onChange={(e) => setNewOrder({...newOrder, total_cost: e.target.value})}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {t('orders.createOrder')}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg max-w-2xl w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('orders.editOrder')}</h2>
              <form onSubmit={handleUpdateOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('orders.title')}</label>
                  <input
                    type="text"
                    value={editingOrder.title}
                    onChange={(e) => setEditingOrder({...editingOrder, title: e.target.value})}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('orders.description')}</label>
                  <textarea
                    value={editingOrder.description}
                    onChange={(e) => setEditingOrder({...editingOrder, description: e.target.value})}
                    rows={3}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.status')}</label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value as any})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    >
                      <option value="pending">{t('orders.status.pending')}</option>
                      <option value="in_progress">{t('orders.status.inProgress')}</option>
                      <option value="completed">{t('orders.status.completed')}</option>
                      <option value="cancelled">{t('orders.status.cancelled')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.priority')}</label>
                    <select
                      value={editingOrder.priority}
                      onChange={(e) => setEditingOrder({...editingOrder, priority: e.target.value as any})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    >
                      <option value="low">{t('orders.priority.low')}</option>
                      <option value="medium">{t('orders.priority.medium')}</option>
                      <option value="high">{t('orders.priority.high')}</option>
                      <option value="urgent">{t('orders.priority.urgent')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.startDate')}</label>
                    <input
                      type="date"
                      value={editingOrder.start_date}
                      onChange={(e) => setEditingOrder({...editingOrder, start_date: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('orders.dueDate')}</label>
                    <input
                      type="date"
                      value={editingOrder.due_date}
                      onChange={(e) => setEditingOrder({...editingOrder, due_date: e.target.value})}
                      className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('orders.totalCost')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.total_cost}
                    onChange={(e) => setEditingOrder({...editingOrder, total_cost: parseFloat(e.target.value) || 0})}
                    className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {t('orders.updateOrder')}
                  </button>
                  <button type="button" onClick={() => setEditingOrder(null)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    {t('common.cancel')}
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

export default Orders;