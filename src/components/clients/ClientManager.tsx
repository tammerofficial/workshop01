import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Plus, Phone, Mail, Calendar, 
  ShoppingBag, Edit2, Trash2, X, Save, Eye,
  UserPlus, TrendingUp, Clock, DollarSign
} from 'lucide-react';
import { mockOrders } from '../../data/mockData';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes: string;
  status: 'active' | 'inactive';
  preferredFabrics: string[];
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    shoulders?: number;
    sleeves?: number;
    inseam?: number;
  };
}

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface NewOrderData {
  clientName: string;
  clientPhone: string;
  suitType: string;
  measurements: any;
}

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    initializeClients();
    // Simulate real-time order monitoring
    const interval = setInterval(checkForNewOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeClients = () => {
    // Extract unique clients from existing orders and create comprehensive profiles
    const uniqueClients = Array.from(new Set(mockOrders.map(order => order.clientName)))
      .map((name, index) => {
        const clientOrders = mockOrders.filter(order => order.clientName === name);
        const totalSpent = clientOrders.length * (Math.random() * 800 + 300);
        
        return {
          id: `CLIENT-${1000 + index}`,
          name,
          phone: `+971 5${Math.floor(Math.random() * 10)} ${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          address: `${Math.floor(Math.random() * 999) + 1} Al Wasl Road, Dubai, UAE`,
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          totalOrders: clientOrders.length,
          totalSpent: Math.round(totalSpent),
          lastOrderDate: clientOrders.length > 0 ? 
            clientOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt :
            new Date().toISOString(),
          notes: Math.random() > 0.7 ? 'VIP Customer - Prefers premium fabrics and express service' : '',
          status: 'active' as const,
          preferredFabrics: ['Premium Wool', 'Silk Blend', 'Cotton'].slice(0, Math.floor(Math.random() * 3) + 1),
          measurements: {
            chest: Math.floor(Math.random() * 20) + 90,
            waist: Math.floor(Math.random() * 20) + 75,
            hips: Math.floor(Math.random() * 15) + 90,
            shoulders: Math.floor(Math.random() * 10) + 40,
            sleeves: Math.floor(Math.random() * 10) + 60,
            inseam: Math.floor(Math.random() * 15) + 70,
          }
        };
      });
    
    setClients(uniqueClients);
  };

  const checkForNewOrders = () => {
    // Simulate checking for new orders and auto-creating clients
    if (Math.random() > 0.95) { // 5% chance every 5 seconds
      const newOrderData: NewOrderData = {
        clientName: `New Customer ${Math.floor(Math.random() * 1000)}`,
        clientPhone: `+971 5${Math.floor(Math.random() * 10)} ${Math.floor(1000000 + Math.random() * 9000000)}`,
        suitType: 'Classic Two-Piece',
        measurements: {
          chest: Math.floor(Math.random() * 20) + 90,
          waist: Math.floor(Math.random() * 20) + 75,
        }
      };
      
      handleNewOrderReceived(newOrderData);
    }
  };

  const handleNewOrderReceived = (orderData: NewOrderData) => {
    // Check if client already exists (by name + phone)
    const existingClient = clients.find(client => 
      client.name.toLowerCase() === orderData.clientName.toLowerCase() ||
      client.phone === orderData.clientPhone
    );

    if (existingClient) {
      // Update existing client's order count and last order date
      setClients(prev => prev.map(client => 
        client.id === existingClient.id 
          ? {
              ...client,
              totalOrders: client.totalOrders + 1,
              lastOrderDate: new Date().toISOString(),
              totalSpent: client.totalSpent + (Math.random() * 500 + 200)
            }
          : client
      ));
      
      toast.success(`Order linked to existing client: ${existingClient.name}`);
    } else {
      // Create new client automatically
      const newClient: Client = {
        id: `CLIENT-${Date.now()}`,
        name: orderData.clientName,
        phone: orderData.clientPhone,
        email: `${orderData.clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        address: 'Address to be updated',
        joinDate: new Date().toISOString(),
        totalOrders: 1,
        totalSpent: Math.random() * 500 + 200,
        lastOrderDate: new Date().toISOString(),
        notes: 'Auto-created from new order',
        status: 'active',
        preferredFabrics: [],
        measurements: orderData.measurements
      };
      
      setClients(prev => [newClient, ...prev]);
      toast.success(`New client created automatically: ${newClient.name}`, {
        icon: '👤',
        duration: 4000
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', client?: Client) => {
    setModalMode(mode);
    setSelectedClient(client || null);
    
    if (client && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        notes: client.notes
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newClient: Client = {
        id: `CLIENT-${Date.now()}`,
        ...formData,
        joinDate: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: new Date().toISOString(),
        status: 'active',
        preferredFabrics: [],
        measurements: {}
      };
      
      setClients(prev => [newClient, ...prev]);
      toast.success('Client created successfully');
    } else if (modalMode === 'edit' && selectedClient) {
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...formData }
          : client
      ));
      toast.success('Client updated successfully');
    }
    
    setShowModal(false);
  };

  const handleDelete = (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      toast.success('Client deleted successfully');
    }
  };

  const getClientOrders = (clientName: string) => {
    return mockOrders.filter(order => order.clientName === clientName);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClientValue = (client: Client) => {
    if (client.totalSpent > 2000) return 'VIP';
    if (client.totalSpent > 1000) return 'Premium';
    return 'Standard';
  };

  const getValueColor = (value: string) => {
    switch (value) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Premium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ClientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            {modalMode === 'create' ? 'Add New Client' : 
             modalMode === 'edit' ? 'Edit Client' : 'Client Details'}
          </h3>
          <button onClick={() => setShowModal(false)} className="text-gray-400 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {modalMode === 'view' && selectedClient ? (
          <div className="space-y-6">
            {/* Client Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-secondary-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                  <p className="text-gray-600">{selectedClient.email}</p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getValueColor(getClientValue(selectedClient))}`}>
                      {getClientValue(selectedClient)} Client
                    </span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedClient.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedClient.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-secondary">${selectedClient.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Spent</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <ShoppingBag size={24} className="mx-auto text-secondary mb-2" />
                <div className="text-2xl font-bold text-gray-900">{selectedClient.totalOrders}</div>
                <div className="text-sm text-gray-500">{t('productionTracking.totalOrders')}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <DollarSign size={24} className="mx-auto text-success mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round(selectedClient.totalSpent / selectedClient.totalOrders || 0)}
                </div>
                <div className="text-sm text-gray-500">Avg Order Value</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <Calendar size={24} className="mx-auto text-accent mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(selectedClient.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-500">Days as Client</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <Clock size={24} className="mx-auto text-warning mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(selectedClient.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-500">Days Since Last Order</div>
              </div>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-900">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-900">{selectedClient.email}</span>
                  </div>
                  <div className="flex items-start">
                    <Users size={16} className="text-gray-400 mr-3 mt-1" />
                    <span className="text-gray-900">{selectedClient.address}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Measurements</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(selectedClient.measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences */}
            {selectedClient.preferredFabrics.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Preferred Fabrics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.preferredFabrics.map(fabric => (
                    <span key={fabric} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                      {fabric}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Recent Order History</h4>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {getClientOrders(selectedClient.name).slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.suitType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-success-100 text-success-800' :
                          order.status === 'in progress' ? 'bg-secondary-100 text-secondary-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedClient.notes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-blue-800">{selectedClient.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleOpenModal('edit', selectedClient)}
                className="px-4 py-2 text-sm font-medium text-white bg-secondary bg-secondary-700 rounded-md"
              >
                Edit Client
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                placeholder="Special preferences, measurements notes, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary bg-secondary-700 rounded-md"
              >
                <Save size={16} className="mr-2" />
                {modalMode === 'create' ? 'Create Client' : 'Update Client'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <Users size={24} className="text-secondary mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
              <p className="text-sm text-gray-500">Auto-linked to orders • Real-time updates</p>
            </div>
          </div>
          
          <button
            onClick={() => handleOpenModal('create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary bg-secondary-700"
          >
            <UserPlus size={16} className="mr-2" />
            Add Client
          </button>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-secondary focus:border-secondary sm:text-sm"
              placeholder="Search clients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-secondary-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{clients.length}</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>
          <div className="bg-success-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">{clients.filter(c => c.status === 'active').length}</div>
            <div className="text-sm text-gray-600">Active Clients</div>
          </div>
          <div className="bg-accent-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              ${Math.round(clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg Client Value</div>
          </div>
          <div className="bg-warning-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {clients.filter(c => getClientValue(c) === 'VIP').length}
            </div>
            <div className="text-sm text-gray-600">VIP Clients</div>
          </div>
        </div>
      </motion.div>

      {/* Client Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm overflow-hidden shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getValueColor(getClientValue(client))}`}>
                      {getClientValue(client)}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">#{client.id}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={14} className="mr-2" />
                  {client.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2" />
                  Joined {formatDate(client.joinDate)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{client.totalOrders}</div>
                  <div className="text-sm text-gray-500">Orders</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">${client.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Spent</div>
                </div>
              </div>
              
              {client.notes && (
                <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-800">
                  {client.notes}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleOpenModal('view', client)}
                  className="inline-flex items-center text-secondary text-secondary-700 text-sm font-medium"
                >
                  <Eye size={14} className="mr-1" />
                  View Details
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal('edit', client)}
                    className="p-1 text-gray-400 text-secondary"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="p-1 text-gray-400 text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-500">Try adjusting your search or add a new client.</p>
        </div>
      )}

      <AnimatePresence>
        {showModal && <ClientModal />}
      </AnimatePresence>
    </div>
  );
};

export default ClientManager;