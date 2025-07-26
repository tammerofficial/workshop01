import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Calendar, DollarSign } from 'lucide-react';
import { orderService, clientService, workerService, categoryService } from '../api/laravel';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  due_date: string;
  total_cost: number;
  client: {
    id: number;
    name: string;
    phone: string;
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
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

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
      toast.error(t('orders.createError'));
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await orderService.update(editingOrder.id, editingOrder);
      toast.success(t('orders.updateSuccess'));
      setEditingOrder(null);
      loadData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(t('orders.updateError'));
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
      toast.error(t('orders.deleteError'));
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(t('orders.statusUpdateSuccess'));
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('orders.statusUpdateError'));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
        return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
        );
    }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2">عرض وإدارة جميع طلبات العملاء</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          طلب جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
          <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{order.title}</h3>
                <p className="text-sm text-gray-600">{order.description}</p>
              </div>
              <div className="flex gap-2">
                  <button
                  onClick={() => setEditingOrder(order)}
                  className="text-blue-600 hover:text-blue-800"
                  >
                  <Edit className="h-4 w-4" />
                  </button>
                  <button 
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-red-600 hover:text-red-800"
                  >
                  <Trash2 className="h-4 w-4" />
                  </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.client?.name}</span>
              </div>
              
              {order.worker && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">العامل: {order.worker.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(order.due_date).toLocaleDateString('ar-SA')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">${order.total_cost}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                  {order.priority === 'urgent' ? 'عاجل' :
                   order.priority === 'high' ? 'عالي' :
                   order.priority === 'medium' ? 'متوسط' : 'منخفض'}
                </span>
              </div>
              
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600">ابدأ بإنشاء طلب جديد</p>
                  </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">إنشاء طلب جديد</h2>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الطلب</label>
                  <input
                    type="text"
                      required
                      value={newOrder.title}
                      onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
                    <select
                      required
                      value={newOrder.client_id}
                      onChange={(e) => setNewOrder({ ...newOrder, client_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر العميل</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                    <select
                      value={newOrder.category_id}
                      onChange={(e) => setNewOrder({ ...newOrder, category_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العامل المسؤول</label>
                    <select
                      value={newOrder.assigned_worker_id}
                      onChange={(e) => setNewOrder({ ...newOrder, assigned_worker_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر العامل</option>
                      {workers.map((worker: any) => (
                        <option key={worker.id} value={worker.id}>{worker.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">منخفض</option>
                      <option value="medium">متوسط</option>
                      <option value="high">عالي</option>
                      <option value="urgent">عاجل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOrder.total_cost}
                      onChange={(e) => setNewOrder({ ...newOrder, total_cost: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                    <input
                      type="date"
                      value={newOrder.start_date}
                      onChange={(e) => setNewOrder({ ...newOrder, start_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسليم</label>
                    <input
                      type="date"
                      value={newOrder.due_date}
                      onChange={(e) => setNewOrder({ ...newOrder, due_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إنشاء الطلب
                  </button>
                            <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
              
      {/* Edit Order Modal */}
      {editingOrder && (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingOrder.total_cost}
                      onChange={(e) => setEditingOrder({ ...editingOrder, total_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                    <input
                      type="date"
                      value={editingOrder.start_date}
                      onChange={(e) => setEditingOrder({ ...editingOrder, start_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسليم</label>
                    <input
                      type="date"
                      value={editingOrder.due_date}
                      onChange={(e) => setEditingOrder({ ...editingOrder, due_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={editingOrder.description}
                    onChange={(e) => setEditingOrder({ ...editingOrder, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                    onClick={() => setEditingOrder(null)}
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

export default Orders;