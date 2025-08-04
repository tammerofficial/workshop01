import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  BarChart3, TrendingUp, Users, Package, DollarSign, 
  ShoppingCart, Clock, AlertTriangle, Calendar, Download,
  Eye, Filter, RefreshCw
} from 'lucide-react';
import laravel from '../../api/laravel';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface SalesOverview {
  total_revenue: number;
  pos_revenue: number;
  boutique_revenue: number;
  custom_orders_revenue: number;
  total_transactions: number;
  average_order_value: number;
  daily_breakdown: DailyStats[];
}

interface DailyStats {
  date: string;
  pos_revenue: number;
  boutique_revenue: number;
  custom_revenue: number;
  total_revenue: number;
}

interface ProductAnalytics {
  top_selling_by_quantity: TopProduct[];
  top_selling_by_revenue: TopProduct[];
  category_performance: CategoryPerformance[];
  low_stock_products: LowStockProduct[];
}

interface TopProduct {
  id: number;
  name: string;
  sku: string;
  total_quantity: number;
  total_revenue: number;
}

interface CategoryPerformance {
  category: string;
  total_quantity: number;
  total_revenue: number;
  product_count: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  min_stock_level: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [salesData, setSalesData] = useState<SalesOverview | null>(null);
  const [productData, setProductData] = useState<ProductAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [workshopData, setWorkshopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'products' | 'customers' | 'inventory' | 'workshop'>('overview');

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedPeriod]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      const [salesRes, productRes, customerRes, inventoryRes, workshopRes] = await Promise.allSettled([
        laravel.get(`/api/reports/sales-overview?period=${selectedPeriod}`),
        laravel.get(`/api/reports/product-analytics?period=${selectedPeriod}`),
        laravel.get(`/api/reports/customer-analytics?period=${selectedPeriod}`),
        laravel.get('/api/reports/inventory-analytics'),
        laravel.get(`/api/reports/workshop-analytics?period=${selectedPeriod}`)
      ]);

      if (salesRes.status === 'fulfilled' && salesRes.value.data.success) {
        setSalesData(salesRes.value.data.data.summary);
      }
      
      if (productRes.status === 'fulfilled' && productRes.value.data.success) {
        setProductData(productRes.value.data.data);
      }
      
      if (customerRes.status === 'fulfilled' && customerRes.value.data.success) {
        setCustomerData(customerRes.value.data.data);
      }
      
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value.data.success) {
        setInventoryData(inventoryRes.value.data.data);
      }
      
      if (workshopRes.status === 'fulfilled' && workshopRes.value.data.success) {
        setWorkshopData(workshopRes.value.data.data);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(3)} ${isRTL ? 'د.ك' : 'KWD'}`;
  };

  const pieChartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
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
              {isRTL ? 'لوحة التحليلات والتقارير' : 'Analytics & Reports Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? 'تحليلات شاملة لجميع العمليات' : 'Comprehensive analytics for all operations'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">{isRTL ? 'اليوم' : 'Today'}</option>
              <option value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</option>
              <option value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</option>
              <option value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</option>
              <option value="year">{isRTL ? 'هذا العام' : 'This Year'}</option>
            </select>
            
            <button
              onClick={fetchAllAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </button>
            
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              {isRTL ? 'تصدير' : 'Export'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
              { id: 'sales', label: isRTL ? 'المبيعات' : 'Sales', icon: DollarSign },
              { id: 'products', label: isRTL ? 'المنتجات' : 'Products', icon: Package },
              { id: 'customers', label: isRTL ? 'العملاء' : 'Customers', icon: Users },
              { id: 'inventory', label: isRTL ? 'المخزون' : 'Inventory', icon: Package },
              { id: 'workshop', label: isRTL ? 'الورشة' : 'Workshop', icon: Clock }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {salesData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(salesData.total_revenue)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              )}
              
              {salesData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'عدد المعاملات' : 'Total Transactions'}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {salesData.total_transactions}
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              )}
              
              {customerData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'عملاء جدد' : 'New Customers'}
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {customerData.new_customers}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              )}
              
              {inventoryData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'تنبيهات المخزون' : 'Stock Alerts'}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {inventoryData.stock_stats.low_stock_count + inventoryData.stock_stats.out_of_stock_count}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Breakdown Chart */}
            {salesData && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'توزيع الإيرادات حسب القناة' : 'Revenue Distribution by Channel'}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: isRTL ? 'نقاط البيع' : 'POS', value: salesData.pos_revenue },
                            { name: isRTL ? 'البوتيك' : 'Boutique', value: salesData.boutique_revenue },
                            { name: isRTL ? 'الطلبات المخصصة' : 'Custom Orders', value: salesData.custom_orders_revenue }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieChartColors.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">
                        {isRTL ? 'نقاط البيع (POS)' : 'Point of Sale (POS)'}
                      </span>
                      <span className="text-blue-900 font-bold">
                        {formatCurrency(salesData.pos_revenue)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800 font-medium">
                        {isRTL ? 'المتجر الإلكتروني' : 'E-Commerce'}
                      </span>
                      <span className="text-green-900 font-bold">
                        {formatCurrency(salesData.boutique_revenue)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-800 font-medium">
                        {isRTL ? 'الطلبات المخصصة' : 'Custom Orders'}
                      </span>
                      <span className="text-yellow-900 font-bold">
                        {formatCurrency(salesData.custom_orders_revenue)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">
                          {isRTL ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                        </span>
                        <span className="text-gray-900 font-bold text-lg">
                          {formatCurrency(salesData.average_order_value)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && salesData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                </h4>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(salesData.total_revenue)}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {isRTL ? 'نمو إيجابي' : 'Positive growth'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'عدد المعاملات' : 'Total Transactions'}
                </h4>
                <p className="text-3xl font-bold text-gray-900">
                  {salesData.total_transactions}
                </p>
                <div className="text-sm text-gray-500 mt-2">
                  POS: {salesData.pos_transactions_count} | 
                  {isRTL ? ' البوتيك: ' : ' Boutique: '}{salesData.boutique_orders_count} | 
                  {isRTL ? ' مخصص: ' : ' Custom: '}{salesData.custom_orders_count}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                </h4>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(salesData.average_order_value)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {isRTL ? 'لكل معاملة' : 'Per transaction'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && productData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products by Quantity */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'الأكثر مبيعاً (بالكمية)' : 'Top Selling (by Quantity)'}
                </h3>
                <div className="space-y-3">
                  {productData.top_selling_by_quantity.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{product.total_quantity}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(product.total_revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products by Revenue */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'الأكثر مبيعاً (بالإيراد)' : 'Top Selling (by Revenue)'}
                </h3>
                <div className="space-y-3">
                  {productData.top_selling_by_revenue.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="bg-green-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(product.total_revenue)}</p>
                        <p className="text-sm text-gray-600">{product.total_quantity} {isRTL ? 'قطعة' : 'units'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'أداء الفئات' : 'Category Performance'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productData.category_performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'total_revenue' ? formatCurrency(value) : value
                  } />
                  <Legend />
                  <Bar dataKey="total_revenue" fill="#3B82F6" name={isRTL ? 'الإيراد' : 'Revenue'} />
                  <Bar dataKey="total_quantity" fill="#10B981" name={isRTL ? 'الكمية' : 'Quantity'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && customerData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'عملاء جدد' : 'New Customers'}
                </h4>
                <p className="text-3xl font-bold text-blue-600">{customerData.new_customers}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'عملاء متكررون' : 'Repeat Customers'}
                </h4>
                <p className="text-3xl font-bold text-green-600">{customerData.repeat_customers}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'أعلى العملاء' : 'Top Customers'}
                </h4>
                <p className="text-3xl font-bold text-purple-600">
                  {customerData.top_customers_by_revenue?.length || 0}
                </p>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'أعلى العملاء بالإيراد' : 'Top Customers by Revenue'}
              </h3>
              <div className="space-y-3">
                {customerData.top_customers_by_revenue?.slice(0, 10).map((customer: any, index: number) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="bg-purple-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{formatCurrency(customer.total_spent)}</p>
                      <p className="text-sm text-gray-600">{customer.total_orders} {isRTL ? 'طلبات' : 'orders'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'شرائح العملاء' : 'Customer Segments'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerData.customer_segments}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="customer_count"
                    nameKey="segment"
                  >
                    {pieChartColors.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && inventoryData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
                </h4>
                <p className="text-3xl font-bold text-blue-600">{inventoryData.stock_stats.total_products}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'مخزون منخفض' : 'Low Stock'}
                </h4>
                <p className="text-3xl font-bold text-yellow-600">{inventoryData.stock_stats.low_stock_count}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'نفد المخزون' : 'Out of Stock'}
                </h4>
                <p className="text-3xl font-bold text-red-600">{inventoryData.stock_stats.out_of_stock_count}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'قيمة المخزون' : 'Stock Value'}
                </h4>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(inventoryData.stock_stats.total_stock_value || 0)}
                </p>
              </div>
            </div>

            {/* Top Moving Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'المنتجات الأكثر حركة' : 'Top Moving Products'}
              </h3>
              <div className="space-y-3">
                {inventoryData.top_moving_products?.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{product.total_movement}</p>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'متوفر:' : 'Available:'} {product.stock_quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workshop Tab */}
        {activeTab === 'workshop' && workshopData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                </h4>
                <p className="text-3xl font-bold text-blue-600">{workshopData.custom_order_stats.total_orders}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'مكتملة' : 'Completed'}
                </h4>
                <p className="text-3xl font-bold text-green-600">{workshopData.custom_order_stats.completed_orders}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'قيد الإنتاج' : 'In Production'}
                </h4>
                <p className="text-3xl font-bold text-purple-600">{workshopData.custom_order_stats.in_production}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'إيراد الورشة' : 'Workshop Revenue'}
                </h4>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(workshopData.custom_order_stats.total_revenue || 0)}
                </p>
              </div>
            </div>

            {/* Worker Productivity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'إنتاجية العمال' : 'Worker Productivity'}
              </h3>
              <div className="space-y-3">
                {workshopData.worker_productivity?.map((worker: any, index: number) => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="bg-purple-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{worker.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{worker.completed_orders}</p>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'من' : 'of'} {worker.total_orders} {isRTL ? 'طلبات' : 'orders'}
                      </p>
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

export default AnalyticsDashboard;