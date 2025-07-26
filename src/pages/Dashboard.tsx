import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import ModernStatCard from '../components/dashboard/ModernStatCard';
import ModernOrdersChart from '../components/dashboard/ModernOrdersChart';
import ModernWorkerChart from '../components/dashboard/ModernWorkerChart';
import ModernRecentActivity from '../components/dashboard/ModernRecentActivity';
import { dashboardService, wooCommerceService } from '../api/laravel';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { t, isRTL } = useLanguage();
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
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
      ]);

      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromWooCommerce = async () => {
    setImporting(true);
    toast.loading(t('dashboard.importing'), { id: 'import-toast' });
    try {
      const response = await wooCommerceService.importAll();
      toast.success(t('dashboard.importSuccess'), { id: 'import-toast' });
      
      await loadDashboardData();
      
      const imported = response.data.imported;
      toast.success(t('dashboard.importResults', {
        customers: imported.customers,
        products: imported.products,
        orders: imported.orders
      }), { duration: 6000 });
    } catch (error) {
      console.error('Error importing from WooCommerce:', error);
      toast.error(t('dashboard.importFailed'), { id: 'import-toast' });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('dashboard.totalOrders'),
      value: stats.orders_count.toString(),
      icon: <ShoppingBag className="h-6 w-6" />,
      change: { value: 12, positive: true },
      color: 'blue' as const
    },
    {
      title: t('dashboard.activeWorkers'),
      value: stats.workers_count.toString(),
      icon: <Users className="h-6 w-6" />,
      change: { value: 3, positive: true },
      color: 'green' as const
    },
    {
      title: t('dashboard.revenue'),
      value: `$${stats.total_revenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      change: { value: 18, positive: true },
      color: 'purple' as const
    },
    {
      title: t('inventory.lowStock'),
      value: stats.low_stock_materials.toString(),
      icon: <AlertTriangle className="h-6 w-6" />,
      change: { value: 8, positive: false },
      color: 'orange' as const
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.header.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('dashboard.header.subtitle')}</p>
        </div>
        
        <button
          onClick={handleImportFromWooCommerce}
          disabled={importing}
          className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors ${
            importing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          {importing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('dashboard.importing')}
            </div>
          ) : (
            `🛒 ${t('dashboard.importFromWooCommerce')}`
          )}
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernOrdersChart />
        <ModernWorkerChart />
      </div>

      <ModernRecentActivity orders={recentOrders} loading={loading} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          {t('dashboard.additionalStats')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.clients_count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.clients')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.materials_count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.materials')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unpaid_invoices}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.unpaidInvoices')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((stats.completed_orders / (stats.orders_count || 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.completionRate')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;