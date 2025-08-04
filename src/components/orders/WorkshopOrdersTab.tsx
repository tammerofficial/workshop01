import React, { useState, useEffect } from 'react';
import { 
  Wrench,
  Eye,
  CheckCircle,
  Play,
  Pause,
  Clock,
  X,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  WorkshopOrder, 
  workshopOrdersApi, 
  formatCurrency, 
  getStatusColor, 
  getStatusText,
  getPriorityColor,
  getPriorityText
} from '../../api/woocommerceOrders';

interface WorkshopOrdersTabProps {
  onOrderUpdated?: (order: WorkshopOrder) => void;
}

const WorkshopOrdersTab: React.FC<WorkshopOrdersTabProps> = ({ onOrderUpdated }) => {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkshopOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [actioningOrderId, setActioningOrderId] = useState<number | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const perPage = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await workshopOrdersApi.getOrders({
        page: currentPage,
        per_page: perPage,
        status: statusFilter || undefined,
        source_type: sourceFilter || undefined
      });

      if (response.success) {
        setOrders(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.last_page);
          setTotalOrders(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error loading workshop orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Accept order
  const acceptOrder = async (orderId: number) => {
    try {
      setActioningOrderId(orderId);
      const response = await workshopOrdersApi.acceptOrder(orderId, 'تمت الموافقة على الطلب');

      if (response.success) {
        alert('تمت الموافقة على الطلب');
        loadOrders(); // Reload orders
        if (onOrderUpdated) {
          onOrderUpdated(response.data);
        }
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('خطأ في الموافقة على الطلب');
    } finally {
      setActioningOrderId(null);
    }
  };

  // Start production
  const startProduction = async (orderId: number) => {
    try {
      setActioningOrderId(orderId);
      const response = await workshopOrdersApi.startProduction(orderId);

      if (response.success) {
        alert('تم بدء الإنتاج');
        loadOrders(); // Reload orders
        if (onOrderUpdated) {
          onOrderUpdated(response.data);
        }
      }
    } catch (error) {
      console.error('Error starting production:', error);
      alert('خطأ في بدء الإنتاج');
    } finally {
      setActioningOrderId(null);
    }
  };

  // Update order status
  const updateStatus = async (orderId: number, status: string) => {
    try {
      setActioningOrderId(orderId);
      const response = await workshopOrdersApi.updateStatus(orderId, status);

      if (response.success) {
        alert('تم تحديث حالة الطلب');
        loadOrders(); // Reload orders
        if (onOrderUpdated) {
          onOrderUpdated(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('خطأ في تحديث حالة الطلب');
    } finally {
      setActioningOrderId(null);
    }
  };

  // Show order details
  const showDetails = (order: WorkshopOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, sourceFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_production':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'pending_acceptance':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'on_hold':
        return <Pause className="w-5 h-5 text-orange-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      case 'quality_check':
        return <AlertTriangle className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'woocommerce':
        return '🌐';
      case 'local':
        return '🏪';
      case 'manual':
        return '📝';
      default:
        return '📄';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Wrench className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">جاري تحميل طلبات الورشة...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Wrench className="h-8 w-8 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              طلبات الورشة
            </h2>
            <p className="text-sm text-gray-500">
              {totalOrders} طلب إجمالي
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">جميع الحالات</option>
              <option value="pending_acceptance">في انتظار الموافقة</option>
              <option value="accepted">مقبول</option>
              <option value="materials_reserved">المواد محجوزة</option>
              <option value="in_production">قيد الإنتاج</option>
              <option value="quality_check">فحص الجودة</option>
              <option value="completed">مكتمل</option>
              <option value="delivered">تم التسليم</option>
              <option value="on_hold">متوقف مؤقتاً</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المصدر
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">جميع المصادر</option>
              <option value="woocommerce">الموقع الإلكتروني</option>
              <option value="local">طلب محلي</option>
              <option value="manual">يدوي</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setSourceFilter('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأولوية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التقدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المصدر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ar', { calendar: 'gregory' })}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.selling_price, order.currency)}
                    </div>
                    {order.estimated_cost && (
                      <div className="text-sm text-gray-500">
                        تكلفة: {formatCurrency(order.estimated_cost, order.currency)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {getPriorityText(order.priority)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${order.progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{order.progress_percentage}%</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getSourceIcon(order.source_type)}</span>
                      <span className="text-sm text-gray-600">
                        {order.source_type === 'woocommerce' ? 'الموقع' : 
                         order.source_type === 'local' ? 'محلي' : 'يدوي'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      
                      {order.status === 'pending_acceptance' && (
                        <button
                          onClick={() => acceptOrder(order.id)}
                          disabled={actioningOrderId === order.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="الموافقة على الطلب"
                        >
                          <CheckCircle className={`h-5 w-5 ${actioningOrderId === order.id ? 'animate-pulse' : ''}`} />
                        </button>
                      )}
                      
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => startProduction(order.id)}
                          disabled={actioningOrderId === order.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="بدء الإنتاج"
                        >
                          <Play className={`h-5 w-5 ${actioningOrderId === order.id ? 'animate-pulse' : ''}`} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    عرض <span className="font-medium">{((currentPage - 1) * perPage) + 1}</span> إلى{' '}
                    <span className="font-medium">{Math.min(currentPage * perPage, totalOrders)}</span> من{' '}
                    <span className="font-medium">{totalOrders}</span> نتيجة
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      السابق
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      التالي
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowOrderDetails(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-right w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      تفاصيل طلب الورشة {selectedOrder.order_number}
                    </h3>
                    
                    {/* Order Status and Progress */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">الحالة:</span>
                          <div className="flex items-center mt-1">
                            {getStatusIcon(selectedOrder.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                              {getStatusText(selectedOrder.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">الأولوية:</span>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                              {getPriorityText(selectedOrder.priority)}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">التقدم:</span>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${selectedOrder.progress_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{selectedOrder.progress_percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer and Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-900 mb-3">معلومات العميل</h4>
                        <div>
                          <span className="text-sm font-medium text-gray-500">الاسم:</span>
                          <p className="text-sm text-gray-900">{selectedOrder.customer_name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">البريد الإلكتروني:</span>
                          <p className="text-sm text-gray-900">{selectedOrder.customer_email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">الهاتف:</span>
                          <p className="text-sm text-gray-900">{selectedOrder.customer_phone}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-900 mb-3">معلومات الطلب</h4>
                        <div>
                          <span className="text-sm font-medium text-gray-500">سعر البيع:</span>
                          <p className="text-sm text-gray-900 font-medium">{formatCurrency(selectedOrder.selling_price, selectedOrder.currency)}</p>
                        </div>
                        {selectedOrder.estimated_cost && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">التكلفة المقدرة:</span>
                            <p className="text-sm text-gray-900">{formatCurrency(selectedOrder.estimated_cost, selectedOrder.currency)}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-500">تاريخ التسليم المقدر:</span>
                          <p className="text-sm text-gray-900">
                            {selectedOrder.estimated_delivery_date 
                              ? new Date(selectedOrder.estimated_delivery_date).toLocaleDateString('ar', { calendar: 'gregory' })
                              : 'غير محدد'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">عناصر الطلب</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">التكلفة</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedOrder.order_items.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-4 py-2">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                                      <div className="text-sm text-gray-500">{item.product_sku}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.total_cost, selectedOrder.currency)}</td>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(item.total_price, selectedOrder.currency)}</td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                      {getStatusText(item.status)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {(selectedOrder.customer_notes || selectedOrder.manager_notes || selectedOrder.production_notes) && (
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">الملاحظات</h4>
                        <div className="space-y-3">
                          {selectedOrder.customer_notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">ملاحظات العميل:</span>
                              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedOrder.customer_notes}</p>
                            </div>
                          )}
                          {selectedOrder.manager_notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">ملاحظات المدير:</span>
                              <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">{selectedOrder.manager_notes}</p>
                            </div>
                          )}
                          {selectedOrder.production_notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">ملاحظات الإنتاج:</span>
                              <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">{selectedOrder.production_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  إغلاق
                </button>
                
                {selectedOrder.status === 'pending_acceptance' && (
                  <button
                    onClick={() => {
                      acceptOrder(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    الموافقة على الطلب
                  </button>
                )}
                
                {selectedOrder.status === 'accepted' && (
                  <button
                    onClick={() => {
                      startProduction(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    بدء الإنتاج
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopOrdersTab;