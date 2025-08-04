import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, 
  Plus, Minus, Edit, Search, Filter, Download,
  BarChart3, AlertCircle, CheckCircle, X
} from 'lucide-react';
import laravel from '../../api/laravel';

interface Product {
  id: number;
  name: string;
  name_ar: string;
  sku: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  category: string;
  is_active: boolean;
  stock_alerts: StockAlert[];
}

interface StockAlert {
  id: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
  current_quantity: number;
  threshold_quantity: number;
  is_resolved: boolean;
  created_at: string;
}

interface InventoryMovement {
  id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

const InventoryManagement: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockUpdateType, setStockUpdateType] = useState<'in' | 'out' | 'adjustment'>('adjustment');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [stockReason, setStockReason] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'alerts' | 'movements'>('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await laravel.get('/api/inventory/dashboard');
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (stockFilter) params.append('stock_status', stockFilter);

      const response = await laravel.get(`/api/inventory?${params.toString()}`);
      if (response.data.success) {
        setProducts(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || stockQuantity <= 0) return;

    try {
      const response = await laravel.post(`/api/inventory/${selectedProduct.id}/stock`, {
        type: stockUpdateType,
        quantity: stockQuantity,
        reason: stockReason
      });

      if (response.data.success) {
        // Update product in local state
        setProducts(prev => prev.map(p => 
          p.id === selectedProduct.id ? response.data.data : p
        ));
        
        setShowStockModal(false);
        setStockQuantity(0);
        setStockReason('');
        setSelectedProduct(null);
        
        // Refresh dashboard stats
        fetchDashboardData();
        
        alert(isRTL ? 'تم تحديث المخزون بنجاح' : 'Stock updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert(error.response?.data?.message || (isRTL ? 'خطأ في تحديث المخزون' : 'Error updating stock'));
    }
  };

  const getStockStatusColor = (product: Product) => {
    if (product.stock_quantity <= 0) return 'text-red-600 bg-red-50';
    if (product.stock_quantity <= product.min_stock_level) return 'text-yellow-600 bg-yellow-50';
    if (product.stock_quantity >= product.max_stock_level) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (product: Product) => {
    if (product.stock_quantity <= 0) return isRTL ? 'نفذ' : 'Out of Stock';
    if (product.stock_quantity <= product.min_stock_level) return isRTL ? 'منخفض' : 'Low Stock';
    if (product.stock_quantity >= product.max_stock_level) return isRTL ? 'مرتفع' : 'Overstock';
    return isRTL ? 'متوفر' : 'In Stock';
  };

  const getAlertTypeText = (type: string) => {
    const alertTypes: { [key: string]: string } = {
      'low_stock': isRTL ? 'مخزون منخفض' : 'Low Stock',
      'out_of_stock': isRTL ? 'نفد المخزون' : 'Out of Stock',
      'overstock': isRTL ? 'مخزون مرتفع' : 'Overstock'
    };
    return alertTypes[type] || type;
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
              {isRTL ? 'إدارة المخزون' : 'Inventory Management'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? 'مراقبة وإدارة مخزون المنتجات' : 'Monitor and manage product inventory'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              {isRTL ? 'تصدير' : 'Export'}
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة منتج' : 'Add Product'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
              { id: 'products', label: isRTL ? 'المنتجات' : 'Products', icon: Package },
              { id: 'alerts', label: isRTL ? 'التنبيهات' : 'Alerts', icon: AlertTriangle },
              { id: 'movements', label: isRTL ? 'الحركات' : 'Movements', icon: TrendingUp }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats.total_products}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'مخزون منخفض' : 'Low Stock'}
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">{dashboardStats.low_stock_count}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'نفد المخزون' : 'Out of Stock'}
                    </p>
                    <p className="text-3xl font-bold text-red-600">{dashboardStats.out_of_stock_count}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'قيمة المخزون' : 'Stock Value'}
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardStats.total_stock_value?.toFixed(3)} {isRTL ? 'د.ك' : 'KWD'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Movements */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'الحركات الأخيرة' : 'Recent Movements'}
                </h3>
                <div className="space-y-3">
                  {dashboardStats.recent_movements?.slice(0, 5).map((movement: any) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          movement.type === 'in' ? 'bg-green-100 text-green-600' :
                          movement.type === 'out' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {movement.type === 'in' ? <Plus className="h-4 w-4" /> :
                           movement.type === 'out' ? <Minus className="h-4 w-4" /> :
                           <Edit className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{movement.product?.name}</p>
                          <p className="text-sm text-gray-600">
                            {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{Math.abs(movement.quantity)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{movement.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unresolved Alerts */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'التنبيهات النشطة' : 'Active Alerts'}
                </h3>
                <div className="space-y-3">
                  {dashboardStats.unresolved_alerts?.slice(0, 5).map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">{alert.product?.name}</p>
                          <p className="text-sm text-red-600">{getAlertTypeText(alert.alert_type)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{alert.current_quantity}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث في المنتجات...' : 'Search products...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                  <option value="mens">{isRTL ? 'ملابس رجالية' : 'Men\'s Clothing'}</option>
                  <option value="womens">{isRTL ? 'ملابس نسائية' : 'Women\'s Clothing'}</option>
                  <option value="kids">{isRTL ? 'ملابس أطفال' : 'Kids\' Clothing'}</option>
                </select>
                
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isRTL ? 'جميع حالات المخزون' : 'All Stock Status'}</option>
                  <option value="in_stock">{isRTL ? 'متوفر' : 'In Stock'}</option>
                  <option value="low">{isRTL ? 'منخفض' : 'Low Stock'}</option>
                  <option value="out">{isRTL ? 'نفد' : 'Out of Stock'}</option>
                </select>
                
                <button
                  onClick={fetchProducts}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isRTL ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'المنتج' : 'Product'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الكمية' : 'Quantity'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'السعر' : 'Price'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {isRTL ? product.name_ar || product.name : product.name}
                            </div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                          <div className="text-xs text-gray-500">
                            {isRTL ? 'الحد الأدنى:' : 'Min:'} {product.min_stock_level}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product)}`}>
                            {getStockStatusText(product)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price.toFixed(3)} {isRTL ? 'د.ك' : 'KWD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowStockModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            {isRTL ? 'تحديث المخزون' : 'Update Stock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stock Update Modal */}
        {showStockModal && selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowStockModal(false)}></div>
              <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isRTL ? 'تحديث المخزون' : 'Update Stock'}
                  </h3>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'المنتج:' : 'Product:'} {isRTL ? selectedProduct.name_ar || selectedProduct.name : selectedProduct.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'الكمية الحالية:' : 'Current Stock:'} {selectedProduct.stock_quantity}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'نوع العملية' : 'Operation Type'}
                    </label>
                    <select
                      value={stockUpdateType}
                      onChange={(e) => setStockUpdateType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in">{isRTL ? 'إضافة مخزون' : 'Add Stock'}</option>
                      <option value="out">{isRTL ? 'تقليل مخزون' : 'Remove Stock'}</option>
                      <option value="adjustment">{isRTL ? 'تصحيح المخزون' : 'Adjust Stock'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'الكمية' : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'أدخل الكمية' : 'Enter quantity'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'السبب (اختياري)' : 'Reason (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={stockReason}
                      onChange={(e) => setStockReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'أدخل السبب' : 'Enter reason'}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleStockUpdate}
                      disabled={stockQuantity <= 0}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                      {isRTL ? 'تحديث' : 'Update'}
                    </button>
                    <button
                      onClick={() => setShowStockModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;