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

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      
      // Add statistics for each client
      const clientsWithStats = await Promise.all(
        response.map(async (client: Client) => {
          try {
            const orders = await orderService.getOrdersByClient(client.id);
            return {
              ...client,
              orders_count: orders.length,
              total_orders_value: orders.reduce((sum: number, order: Order) => sum + order.total_cost, 0),
              last_order_date: orders.length > 0 ? orders[0].created_at : null
            };
          } catch (error) {
            return {
              ...client,
              orders_count: 0,
              total_orders_value: 0,
              last_order_date: null
            };
          }
        })
      );
      
      setClients(clientsWithStats);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientOrders = async (clientId: number) => {
    try {
      setOrdersLoading(true);
      const orders = await orderService.getOrdersByClient(clientId);
      setClientOrders(orders);
    } catch (error) {
      console.error('Error loading client orders:', error);
      setClientOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setShowProfile(true);
    loadClientOrders(client.id);
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
            <h1 className="text-3xl font-bold text-gray-900">{t('clients.profile.title')}</h1>
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
                  ${selectedClient.total_orders_value?.toFixed(2) || '0.00'}
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
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total_cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('clients.title')}</h1>
          <p className="text-gray-600 mt-2">{t('clients.subtitle')}</p>
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
                        <span>{client.orders_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewProfile(client)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>{t('clients.viewProfile')}</span>
                      </button>
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
    </div>
  );
} 