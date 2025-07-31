import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSalesStats, getRecentOrders } from '../../api/woocommerce';
import { workerService } from '../../api/laravel';
import productService from '../../api/productService';
import { Bar } from 'react-chartjs-2';

const DashboardStats: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, workersRes, tasksRes] = await Promise.all([
        getRecentOrders(10),
        workerService.getAll(),
        productService.getAll ? productService.getAll() : Promise.resolve([])
      ]);
      setRecentOrders(orders);
      setWorkers(workersRes.data || workersRes || []);
      setTasks(tasksRes.data || tasksRes || []);
    } catch {
      // handle error
    }
  };

  // Sales calculations
  const today = new Date().toISOString().split('T')[0];
  const totalSales = recentOrders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0);
  const todaysSales = recentOrders.filter(o => (o.date_created || '').split('T')[0] === today)
    .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0);
  const averageSale = recentOrders.length > 0 ? (totalSales / recentOrders.length) : 0;
  const totalOrders = recentOrders.length;

  return (
    <div className="space-y-8">
      {/* Sales Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="text-gray-500 text-sm">{t('dashboard.revenue')}</div>
          <div className="text-2xl font-bold">KWD {totalSales.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{t('dashboard.totalSales')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="text-gray-500 text-sm">{t('dashboard.revenue')}</div>
          <div className="text-2xl font-bold">KWD {todaysSales.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{t('dashboard.todaysSales') || "Today's Sales"}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="text-gray-500 text-sm">{t('dashboard.revenue')}</div>
          <div className="text-2xl font-bold">KWD {averageSale.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-400 mt-1">{t('dashboard.averageSale') || 'Average Sale'}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="text-gray-500 text-sm">{t('dashboard.totalOrders')}</div>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold mb-4">{t('dashboard.recentOrders')}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>{t('orders.form.title.label')}</th>
              <th>{t('orders.form.client.label')}</th>
              <th>{t('orders.form.worker.label')}</th>
              <th>{t('orders.form.cost.label')}</th>
              <th>{t('woocommerce.paymentMethod')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.date')}</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, idx) => (
              <tr key={order.id || idx}>
                <td>{order.number || order.id}</td>
                <td>{order.billing?.first_name} {order.billing?.last_name}</td>
                <td>{order.worker_name || '-'}</td>
                <td>KWD {order.total}</td>
                <td>{order.payment_method_title}</td>
                <td>{t(`orders.status.${order.status}`) || order.status}</td>
                <td>{order.date_created?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardStats;
