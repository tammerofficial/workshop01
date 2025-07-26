import React, { useState, useEffect } from 'react';
import { Calendar, Users, ShoppingBag, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import ModernStatCard from '../components/dashboard/ModernStatCard';
import ModernOrdersChart from '../components/dashboard/ModernOrdersChart';
import ModernWorkerChart from '../components/dashboard/ModernWorkerChart';
import ModernRecentActivity from '../components/dashboard/ModernRecentActivity';
import { dashboardService, orderService, wooCommerceService } from '../api/laravel';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    workers_count: 0,
    orders_count: 0,
    pending_orders: 0,
    in_progress_orders: 0,
    completed_orders: 0,
    clients_count: 0,
    materials_count: 0,
    low_stock_materials: 0,
    unpaid_invoices: 0,
    total_revenue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse, tasksResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
        dashboardService.getRecentTasks()
      ]);

      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data);
      setRecentTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('فشل في تحميل بيانات لوحة القيادة');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromWooCommerce = async () => {
    setImporting(true);
    try {
      const response = await wooCommerceService.importAll();
      toast.success('تم استيراد البيانات من WooCommerce بنجاح!');
      
      // Refresh dashboard data
      await loadDashboardData();
      
      // Show import results
      const imported = response.data.imported;
      toast.success(`تم استيراد: ${imported.customers} عميل، ${imported.products} منتج، ${imported.orders} طلب`);
    } catch (error) {
      console.error('Error importing from WooCommerce:', error);
      toast.error('فشل في استيراد البيانات من WooCommerce');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats.orders_count.toString(),
      icon: <ShoppingBag className="h-6 w-6" />,
      change: { value: 12, positive: true },
      color: 'blue' as const
    },
    {
      title: 'العمال النشطين',
      value: stats.workers_count.toString(),
      icon: <Users className="h-6 w-6" />,
      change: { value: 3, positive: true },
      color: 'green' as const
    },
    {
      title: 'إجمالي الإيرادات',
      value: `$${stats.total_revenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      change: { value: 18, positive: true },
      color: 'purple' as const
    },
    {
      title: 'المخزون المنخفض',
      value: stats.low_stock_materials.toString(),
      icon: <AlertTriangle className="h-6 w-6" />,
      change: { value: 8, positive: false },
      color: 'orange' as const
    }
  ];

  const orderChartData = [
    { name: 'قيد الانتظار', value: stats.pending_orders, color: '#fbbf24' },
    { name: 'قيد التنفيذ', value: stats.in_progress_orders, color: '#3b82f6' },
    { name: 'مكتملة', value: stats.completed_orders, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Import Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة القيادة</h1>
          <p className="text-gray-600 mt-2">نظرة عامة على إدارة ورشة الخياطة</p>
        </div>
        
        <button
          onClick={handleImportFromWooCommerce}
          disabled={importing}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
            importing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {importing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الاستيراد...
            </div>
          ) : (
            '🛒 استيراد من WooCommerce'
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <ModernStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernOrdersChart />
        <ModernWorkerChart />
      </div>

      {/* Recent Activity */}
      <ModernRecentActivity orders={recentOrders} loading={loading} />

      {/* Additional Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          إحصائيات إضافية
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.clients_count}</div>
            <div className="text-sm text-gray-600">العملاء</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.materials_count}</div>
            <div className="text-sm text-gray-600">المواد</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.unpaid_invoices}</div>
            <div className="text-sm text-gray-600">فواتير غير مدفوعة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((stats.completed_orders / stats.orders_count) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">معدل الإنجاز</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;