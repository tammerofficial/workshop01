import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clientService, orderService } from '../api/laravel';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  woocommerce_id?: number;
  created_at: string;
  orders_count?: number;
  total_orders_value?: number;
  last_order_date?: string;
}

interface Order {
  id: number;
  title: string;
  status: string;
  total_cost: number;
  due_date: string;
  created_at: string;
  woocommerce_id?: number;
  client_id: number;
}

export default function Clients() {
  const { t, isRTL } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'woocommerce' | 'local'>('all');
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loadingStats, setLoadingStats] = useState<number[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    console.log('State changed - showOrderDetails:', showOrderDetails);
    console.log('State changed - selectedOrder:', selectedOrder);
  }, [showOrderDetails, selectedOrder]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      
      // Just load clients without stats initially - we'll load stats on demand
      setClients(response);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientStats = async (client: Client) => {
    try {
      // Fetch all orders and filter by client_id to ensure we get all orders for this client
      const allOrders = await orderService.getAll();
      const clientOrders = allOrders.data.filter((order: Order) => order.client_id === client.id);
      
      const totalValue = clientOrders.reduce((sum: number, order: Order) => {
        const cost = typeof order.total_cost === 'number' ? order.total_cost : 0;
        return sum + cost;
      }, 0);
      
      return {
        ...client,
        orders_count: clientOrders.length,
        total_orders_value: totalValue,
        last_order_date: clientOrders.length > 0 ? clientOrders[0].created_at : null
      };
    } catch (error) {
      console.error('Error loading client stats:', error);
      return {
        ...client,
        orders_count: 0,
        total_orders_value: 0,
        last_order_date: null
      };
    }
  };

  const loadClientOrders = async (clientId: number) => {
    try {
      setOrdersLoading(true);
      console.log('Loading orders for client ID:', clientId);
      
      // Fetch all orders and filter by client_id
      const allOrders = await orderService.getAll();
      console.log('All orders:', allOrders.data);
      
      const clientOrders = allOrders.data.filter((order: Order) => {
        console.log(`Order ${order.id}: client_id = ${order.client_id}, target = ${clientId}`);
        return order.client_id === clientId;
      });
      
      console.log('Filtered orders for client:', clientOrders);
      setClientOrders(clientOrders);
    } catch (error) {
      console.error('Error loading client orders:', error);
      setClientOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleViewProfile = async (client: Client) => {
    // Load client stats if not already loaded
    const clientWithStats = client.orders_count !== undefined ? client : await loadClientStats(client);
    
    setSelectedClient(clientWithStats);
    setShowProfile(true);
    loadClientOrders(client.id);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      await clientService.update(editingClient.id, editingClient);
      
      // Update the client in the list
      setClients(prev => prev.map(c => c.id === editingClient.id ? editingClient : c));
      
      setShowEditModal(false);
      setEditingClient(null);
      
      // Show success message
      alert('Client updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    console.log('handleViewOrderDetails called with order:', order);
    setSelectedOrder(order);
    setShowOrderDetails(true);
    console.log('Modal should be visible now');
    console.log('showOrderDetails will be set to true');
    console.log('selectedOrder will be set to:', order);
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(num || 0).toFixed(2)} د.ك`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const getOrderDisplayTitle = (order: Order) => {
    if (order.title?.startsWith('WooCommerce Order')) {
      const match = order.title.match(/#(\d+)/);
      return match ? `#${match[1]}` : order.title;
    }
    return order.title.length > 15 ? order.title.substring(0, 15) + '...' : order.title;
  };

  const syncFromWooCommerce = async () => {
    try {
      setLoading(true);
      // Call WooCommerce sync endpoint
      const response = await fetch('http://localhost:8000/api/woocommerce/sync-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://hudaaljarallah.net/',
          consumer_key: 'ck_3a5c739c20336c33cbee2453cccf56a6441ef6fe',
          consumer_secret: 'cs_b091ba4fb33a6e4b10612c536db882fe0fa8c6aa'
        })
      });
      
      if (response.ok) {
        await loadClients(); // Reload clients after sync
      }
    } catch (error) {
      console.error('Error syncing from WooCommerce:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    
    const matchesSource = sourceFilter === 'all' || 
                         (sourceFilter === 'woocommerce' && client.woocommerce_id) ||
                         (sourceFilter === 'local' && !client.woocommerce_id);
    
    return matchesSearch && matchesSource;
  });

  const stats = {
    total: clients.length,
    woocommerce: clients.filter(c => c.woocommerce_id).length,
    local: clients.filter(c => !c.woocommerce_id).length
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

  if (showProfile && selectedClient) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => setShowProfile(false)}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← {t('common.back')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('clients.profile.title') || 'Client Profile'}
            </h1>
            <p className="text-gray-600 mt-2">{selectedClient.name}</p>
          </div>
        </div>

        {/* Client Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.table.email')}</p>
                <p className="font-semibold">{selectedClient.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.table.phone')}</p>
                <p className="font-semibold">{selectedClient.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="text-red-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.table.address')}</p>
                <p className="font-semibold">{selectedClient.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Package className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.table.source')}</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedClient.woocommerce_id 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedClient.woocommerce_id ? t('clients.source.woocommerce') : t('clients.source.local')}
                  </span>
                  {selectedClient.woocommerce_id && (
                    <ExternalLink size={12} className="text-purple-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="text-blue-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.profile.totalOrders')}</p>
                <p className="text-2xl font-bold text-blue-600">{selectedClient.orders_count || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.profile.totalValue')}</p>
                <p className="text-2xl font-bold text-green-600">
                  ${typeof selectedClient.total_orders_value === 'number' ? selectedClient.total_orders_value.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="text-purple-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">{t('clients.profile.lastActivity')}</p>
                <p className="text-sm font-semibold">
                  {selectedClient.last_order_date 
                    ? new Date(selectedClient.last_order_date).toLocaleDateString() 
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Client Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('clients.profile.orders')}</h3>
          </div>
          
          <div className="p-6">
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading orders...</p>
              </div>
            ) : clientOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                            <span>{getOrderDisplayTitle(order)}</span>
                            <Eye size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.total_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.woocommerce_id 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.woocommerce_id ? 'WooCommerce' : 'Local'}
                            </span>
                            {order.woocommerce_id && (
                              <ExternalLink size={12} className="text-purple-600" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No orders found for this client</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">تفاصيل الطلب</h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Order Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">معلومات الطلب الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">عنوان الطلب</label>
                        <p className="font-semibold">{getOrderDisplayTitle(selectedOrder)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">الحالة</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">التكلفة الإجمالية</label>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(selectedOrder.total_cost)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">تاريخ الإنشاء</label>
                        <p>{formatDate(selectedOrder.created_at)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">تاريخ التسليم</label>
                        <p>{formatDate(selectedOrder.due_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">المصدر</label>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedOrder.woocommerce_id 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedOrder.woocommerce_id ? 'WooCommerce' : 'Local'}
                          </span>
                          {selectedOrder.woocommerce_id && (
                            <ExternalLink size={12} className="text-purple-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                                  {/* Order Details */}
                {selectedOrder.woocommerce_id && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">تفاصيل الطلب</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                                                  <label className="text-sm font-medium text-gray-500">رقم الطلب</label>
                        <p className="font-semibold">#{selectedOrder.woocommerce_id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">مستورد من</label>
                          <p className="text-blue-600">WooCommerce</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Client Info */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">معلومات العميل</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">اسم العميل</label>
                        <p className="font-semibold">{selectedClient?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                        <p>{selectedClient?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                        <p>{selectedClient?.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">العنوان</label>
                        <p>{selectedClient?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إغلاق
                  </button>
                  
                  {/* Production Tracking Button - Show only for in-progress orders */}
                  {(selectedOrder.status === 'in_progress' || selectedOrder.status === 'pending') && (
                    <button
                      onClick={() => {
                        setShowOrderDetails(false);
                        // Navigate to Production Tracking page
                        window.open(`/production-tracking?order=${selectedOrder.id}`, '_blank');
                      }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <span>🏭</span>
                      <span>{t('orders.trackProduction')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      // Navigate to Orders page to edit this order
                      window.open(`/orders?order=${selectedOrder.id}`, '_blank');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    تعديل الطلب
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl font-bold text-gray-900"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.875)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--text-color)'
            }}
          >
            Clients
          </h1>
          <p 
            className="text-gray-600 mt-2"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.125)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--secondary-color)'
            }}
          >
            Manage customer information and profiles
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={syncFromWooCommerce}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span>{t('clients.syncFromWooCommerce')}</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={20} />
            <span>{t('clients.addNew')}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3">
            <UserCheck className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">{t('clients.total')}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3">
            <Package className="text-purple-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">{t('clients.woocommerce')}</p>
              <p className="text-2xl font-bold text-purple-600">{stats.woocommerce}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3">
            <UserCheck className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">{t('clients.local')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.local}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('clients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('clients.source.all') || 'All Sources'}</option>
              <option value="woocommerce">{t('clients.source.woocommerce')}</option>
              <option value="local">{t('clients.source.local')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading clients...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.table.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.table.phone')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.table.source')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.table.orders')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.woocommerce_id 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.woocommerce_id ? t('clients.source.woocommerce') : t('clients.source.local')}
                        </span>
                        {client.woocommerce_id && (
                          <ExternalLink size={12} className="text-purple-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag size={16} className="text-blue-500" />
                        {client.orders_count !== undefined ? (
                          <span>{client.orders_count}</span>
                        ) : loadingStats.includes(client.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setLoadingStats(prev => [...prev, client.id]);
                              const clientWithStats = await loadClientStats(client);
                              setClients(prev => prev.map(c => c.id === client.id ? clientWithStats : c));
                              setLoadingStats(prev => prev.filter(id => id !== client.id));
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                          >
                            Load
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProfile(client)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye size={16} />
                          <span>{t('clients.viewProfile')}</span>
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                        >
                          <Edit size={16} />
                          <span>{t('clients.editClient')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('clients.empty.title')}</h3>
            <p className="text-gray-600">{t('clients.empty.subtitle')}</p>
          </div>
        )}
      </motion.div>

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('clients.editClient')}</h2>
              <form onSubmit={handleUpdateClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('clients.table.name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingClient.name}
                      onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('clients.table.email')}
                    </label>
                    <input
                      type="email"
                      value={editingClient.email || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('clients.table.phone')}
                    </label>
                    <input
                      type="text"
                      value={editingClient.phone || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('clients.table.address')}
                    </label>
                    <input
                      type="text"
                      value={editingClient.address || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingClient(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل الطلب</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">معلومات الطلب الأساسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">عنوان الطلب</label>
                      <p className="font-semibold">{getOrderDisplayTitle(selectedOrder)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">الحالة</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">التكلفة الإجمالية</label>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(selectedOrder.total_cost)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">تاريخ الإنشاء</label>
                      <p>{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">تاريخ التسليم</label>
                      <p>{formatDate(selectedOrder.due_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">المصدر</label>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.woocommerce_id 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedOrder.woocommerce_id ? 'WooCommerce' : 'Local'}
                        </span>
                        {selectedOrder.woocommerce_id && (
                          <ExternalLink size={12} className="text-purple-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder.woocommerce_id && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">تفاصيل الطلب</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">رقم الطلب</label>
                        <p className="font-semibold">#{selectedOrder.woocommerce_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">مستورد من</label>
                        <p className="text-blue-600">WooCommerce</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-green-800">معلومات العميل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">اسم العميل</label>
                      <p className="font-semibold">{selectedClient?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                      <p>{selectedClient?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                      <p>{selectedClient?.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">العنوان</label>
                      <p>{selectedClient?.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إغلاق
                </button>
                
                {/* Production Tracking Button - Show only for in-progress orders */}
                {(selectedOrder.status === 'in_progress' || selectedOrder.status === 'pending') && (
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      // Navigate to Production Tracking page
                      window.open(`/production-tracking?order=${selectedOrder.id}`, '_blank');
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <span>🏭</span>
                    <span>{t('orders.trackProduction')}</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    // Navigate to Orders page to edit this order
                    window.open(`/orders?order=${selectedOrder.id}`, '_blank');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تعديل الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 