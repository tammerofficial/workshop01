import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Package, User, Clock, CheckCircle, AlertTriangle, 
  Eye, Edit, MessageSquare, Camera, Scissors, 
  Search, Filter, Plus, Calendar, Star
} from 'lucide-react';
import laravel from '../../api/laravel';

interface CustomOrder {
  id: number;
  order_number: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  product_type: string;
  status: string;
  priority: string;
  quoted_price: number;
  final_price: number;
  estimated_completion_date: string;
  promised_delivery_date: string;
  assigned_to: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  production_progress: ProductionProgress[];
}

interface ProductionProgress {
  id: number;
  production_stage: {
    id: number;
    name: string;
    name_ar: string;
  };
  status: string;
  started_at: string | null;
  completed_at: string | null;
  assigned_to: {
    id: number;
    name: string;
  } | null;
}

const CustomOrdersManagement: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'production'>('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchOrders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await laravel.get('/api/workshop/custom-orders/dashboard');
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await laravel.get(`/api/workshop/custom-orders?${params.toString()}`);
      if (response.data.success) {
        setOrders(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending_quote': 'bg-yellow-100 text-yellow-800',
      'quoted': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'in_production': 'bg-purple-100 text-purple-800',
      'quality_check': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'delivered': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending_quote': isRTL ? 'في انتظار عرض السعر' : 'Pending Quote',
      'quoted': isRTL ? 'تم عرض السعر' : 'Quoted',
      'confirmed': isRTL ? 'مؤكد' : 'Confirmed',
      'in_production': isRTL ? 'قيد الإنتاج' : 'In Production',
      'quality_check': isRTL ? 'فحص الجودة' : 'Quality Check',
      'completed': isRTL ? 'مكتمل' : 'Completed',
      'delivered': isRTL ? 'تم التسليم' : 'Delivered',
      'cancelled': isRTL ? 'ملغي' : 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'low': 'text-gray-600',
      'normal': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return priorityColors[priority] || 'text-gray-600';
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'low': isRTL ? 'منخفضة' : 'Low',
      'normal': isRTL ? 'عادية' : 'Normal',
      'high': isRTL ? 'عالية' : 'High',
      'urgent': isRTL ? 'عاجلة' : 'Urgent'
    };
    return priorityMap[priority] || priority;
  };

  const calculateProgressPercentage = (order: CustomOrder) => {
    if (!order.production_progress || order.production_progress.length === 0) return 0;
    
    const completedStages = order.production_progress.filter(p => p.status === 'completed').length;
    return Math.round((completedStages / order.production_progress.length) * 100);
  };

  if (loading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'إدارة الطلبات المخصصة' : 'Custom Orders Management'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? 'إدارة ومتابعة الطلبات المخصصة والإنتاج' : 'Manage and track custom orders and production'}
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            {isRTL ? 'طلب جديد' : 'New Order'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: Package },
              { id: 'orders', label: isRTL ? 'الطلبات' : 'Orders', icon: Eye },
              { id: 'production', label: isRTL ? 'الإنتاج' : 'Production', icon: Scissors }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats.total_orders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'في انتظار السعر' : 'Pending Quote'}
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pending_quote}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'قيد الإنتاج' : 'In Production'}
                    </p>
                    <p className="text-3xl font-bold text-purple-600">{dashboardStats.in_production}</p>
                  </div>
                  <Scissors className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'فحص الجودة' : 'Quality Check'}
                    </p>
                    <p className="text-3xl font-bold text-orange-600">{dashboardStats.quality_check}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'مكتمل اليوم' : 'Completed Today'}
                    </p>
                    <p className="text-3xl font-bold text-green-600">{dashboardStats.completed_today}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Urgent Orders & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Urgent Orders */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  {isRTL ? 'الطلبات العاجلة' : 'Urgent Orders'}
                </h3>
                <div className="space-y-3">
                  {dashboardStats.urgent_orders?.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.customer?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.assigned_to?.name || (isRTL ? 'غير مخصص' : 'Unassigned')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worker Workload */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'عبء العمل للعمال' : 'Worker Workload'}
                </h3>
                <div className="space-y-3">
                  {dashboardStats.worker_workload?.map((worker: any) => (
                    <div key={worker.assigned_to} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="h-8 w-8 text-gray-600" />
                        <span className="font-medium text-gray-900">{worker.assignedTo?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">{worker.order_count}</span>
                        <p className="text-xs text-gray-500">{isRTL ? 'طلبات نشطة' : 'active orders'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث في الطلبات...' : 'Search orders...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="pending_quote">{getStatusText('pending_quote')}</option>
                  <option value="in_production">{getStatusText('in_production')}</option>
                  <option value="quality_check">{getStatusText('quality_check')}</option>
                  <option value="completed">{getStatusText('completed')}</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isRTL ? 'جميع الأولويات' : 'All Priorities'}</option>
                  <option value="urgent">{getPriorityText('urgent')}</option>
                  <option value="high">{getPriorityText('high')}</option>
                  <option value="normal">{getPriorityText('normal')}</option>
                  <option value="low">{getPriorityText('low')}</option>
                </select>
                
                <button
                  onClick={fetchOrders}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isRTL ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                      <p className="text-sm text-gray-600">{order.customer.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                        <Star className="h-3 w-3 inline" />
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{isRTL ? 'نوع المنتج:' : 'Product Type:'}</span>
                      <span className="font-medium">{order.product_type}</span>
                    </div>
                    {order.final_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{isRTL ? 'السعر:' : 'Price:'}</span>
                        <span className="font-medium text-green-600">
                          {order.final_price} {isRTL ? 'د.ك' : 'KWD'}
                        </span>
                      </div>
                    )}
                    {order.promised_delivery_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{isRTL ? 'موعد التسليم:' : 'Delivery Date:'}</span>
                        <span className="font-medium">
                          {new Date(order.promised_delivery_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {order.assigned_to && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{isRTL ? 'مخصص لـ:' : 'Assigned to:'}</span>
                        <span className="font-medium">{order.assigned_to.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{isRTL ? 'التقدم' : 'Progress'}</span>
                      <span className="font-medium">{calculateProgressPercentage(order)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgressPercentage(order)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {isRTL ? 'عرض' : 'View'}
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 text-sm">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 text-sm">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'مراحل الإنتاج النشطة' : 'Active Production Stages'}
              </h3>
              
              <div className="space-y-4">
                {orders.filter(order => order.status === 'in_production').map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{order.order_number}</h4>
                        <p className="text-sm text-gray-600">{order.customer.name} - {order.product_type}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                        {getPriorityText(order.priority)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {order.production_progress?.map((progress) => (
                        <div 
                          key={progress.id} 
                          className={`p-3 rounded-lg border ${
                            progress.status === 'completed' ? 'bg-green-50 border-green-200' :
                            progress.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {isRTL ? progress.production_stage.name_ar : progress.production_stage.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {progress.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                             progress.status === 'in_progress' ? (isRTL ? 'قيد التنفيذ' : 'In Progress') :
                             (isRTL ? 'في الانتظار' : 'Pending')}
                          </p>
                          {progress.assigned_to && (
                            <p className="text-xs text-gray-500 mt-1">{progress.assigned_to.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrdersManagement;