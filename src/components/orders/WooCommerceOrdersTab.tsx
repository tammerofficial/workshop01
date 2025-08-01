import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Eye, 
  Copy,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  WooCommerceOrder, 
  woocommerceOrdersApi, 
  formatCurrency, 
  getStatusColor, 
  getStatusText 
} from '../../api/woocommerceOrders';

interface WooCommerceOrdersTabProps {
  onOrderCloned?: (workshopOrder: any) => void;
}

const WooCommerceOrdersTab: React.FC<WooCommerceOrdersTabProps> = ({ onOrderCloned }) => {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<WooCommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [cloningOrderId, setCloningOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WooCommerceOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const perPage = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [clonedFilter, setClonedFilter] = useState<string>('');

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await woocommerceOrdersApi.getOrders({
        page: currentPage,
        per_page: perPage,
        status: statusFilter || undefined,
        cloned: clonedFilter || undefined
      });

      if (response.success) {
        setOrders(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.last_page);
          setTotalOrders(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error loading WooCommerce orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync orders from WooCommerce
  const syncOrders = async () => {
    try {
      setSyncing(true);
      const response = await woocommerceOrdersApi.syncFromWooCommerce({
        page: 1,
        per_page: 50
      });

      if (response.success) {
        alert(`تم مزامنة ${response.synced_count} طلب بنجاح`);
        loadOrders(); // Reload orders
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
      alert('خطأ في مزامنة الطلبات');
    } finally {
      setSyncing(false);
    }
  };

  // Clone order to workshop
  const cloneOrder = async (orderId: number) => {
    try {
      setCloningOrderId(orderId);
      const response = await woocommerceOrdersApi.cloneToWorkshop(orderId);

      if (response.success) {
        alert('تم استنساخ الطلب بنجاح للورشة');
        loadOrders(); // Reload to update cloned status
        if (onOrderCloned) {
          onOrderCloned(response.data);
        }
      }
    } catch (error) {
      console.error('Error cloning order:', error);
      alert('خطأ في استنساخ الطلب');
    } finally {
      setCloningOrderId(null);
    }
  };

  // Show order details
  const showDetails = async (orderId: number) => {
    try {
      const response = await woocommerceOrdersApi.getOrder(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setShowOrderDetails(true);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, clonedFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'on-hold':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RotateCcw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">جاري تحميل الطلبات...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              طلبات الموقع (WooCommerce)
            </h2>
            <p className="text-sm text-gray-500">
              {totalOrders} طلب إجمالي
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={syncOrders}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'جاري المزامنة...' : 'مزامنة الطلبات'}
          </button>
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
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="on-hold">معلق</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              حالة الاستنساخ
            </label>
            <select
              value={clonedFilter}
              onChange={(e) => setClonedFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              <option value="false">غير مستنسخ</option>
              <option value="true">مستنسخ للورشة</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setClonedFilter('');
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
                  تاريخ الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاستنساخ
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
                      WC-{order.wc_order_id}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer_email}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount, order.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.order_items?.length || 0} عنصر
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.order_date).toLocaleDateString('ar-SA')}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.is_cloned_to_workshop ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        مستنسخ للورشة
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        غير مستنسخ
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => showDetails(order.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {!order.is_cloned_to_workshop && (
                      <button
                        onClick={() => cloneOrder(order.id)}
                        disabled={cloningOrderId === order.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="استنساخ للورشة"
                      >
                        <Copy className={`h-5 w-5 ${cloningOrderId === order.id ? 'animate-spin' : ''}`} />
                      </button>
                    )}
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
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
                      تفاصيل الطلب {selectedOrder.order_number}
                    </h3>
                    
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">العميل:</span>
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
                        <div>
                          <span className="text-sm font-medium text-gray-500">المبلغ الإجمالي:</span>
                          <p className="text-sm text-gray-900 font-medium">{formatCurrency(selectedOrder.total_amount, selectedOrder.currency)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">طريقة الدفع:</span>
                          <p className="text-sm text-gray-900">{selectedOrder.payment_method}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">تاريخ الطلب:</span>
                          <p className="text-sm text-gray-900">{new Date(selectedOrder.order_date).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">عناصر الطلب</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
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
                                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.unit_price, selectedOrder.currency)}</td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(item.line_total, selectedOrder.currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  إغلاق
                </button>
                
                {!selectedOrder.is_cloned_to_workshop && (
                  <button
                    onClick={() => {
                      cloneOrder(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    استنساخ للورشة
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

export default WooCommerceOrdersTab;