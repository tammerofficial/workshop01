import React, { useEffect, useState } from 'react';
import { getRecentOrders } from '../../api/woocommerce';
import { workerService } from '../../api/laravel';
import productService from '../../api/productService';
import { useLanguage } from '../../contexts/LanguageContext';

// Simple animated widget component
const Widget = ({ color, icon, title, value, description }) => (
  <div className={`rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform duration-500 hover:scale-105`} style={{ background: color, minWidth: 220, minHeight: 160 }}>
    <div className="text-4xl mb-2 animate-bounce-slow">{icon}</div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-lg font-semibold mb-1">{title}</div>
    <div className="text-sm opacity-80 text-center">{description}</div>
  </div>
);

const HomeTVScreen: React.FC = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, workersRes, tasksRes] = await Promise.all([
        getRecentOrders(10),
        workerService.getAll(),
        productService.getAll ? productService.getAll() : Promise.resolve([])
      ]);
      setOrders(ordersRes);
      setWorkers(workersRes.data || workersRes || []);
      setTasks(tasksRes.data || tasksRes || []);
    };
    fetchData();
    const interval = setInterval(fetchData, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Widgets data
  const widgets = [
    {
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '📦',
      title: t('dashboard.totalOrders'),
      value: orders.length,
      description: t('orders.subtitle'),
    },
    {
      color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      icon: '💰',
      title: t('dashboard.revenue'),
      value: 'KWD ' + orders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0).toLocaleString(),
      description: t('dashboard.totalSales'),
    },
    {
      color: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      icon: '👷‍♂️',
      title: t('dashboard.activeWorkers'),
      value: workers.length,
      description: t('workers.subtitle') || 'Active in workshop',
    },
    {
      color: 'linear-gradient(135deg, #ff5858 0%, #f09819 100%)',
      icon: '📝',
      title: t('dashboard.pendingTasks'),
      value: tasks.filter(tk => tk.status !== 'completed').length,
      description: t('dashboard.pendingTasks'),
    },
    {
      color: 'linear-gradient(135deg, #36d1c4 0%, #1e3799 100%)',
      icon: '✅',
      title: t('dashboard.completedToday'),
      value: tasks.filter(tk => tk.status === 'completed').length,
      description: t('dashboard.completedToday'),
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8">
      <h1 className="text-4xl font-extrabold text-white mb-10 drop-shadow-lg animate-fade-in">{t('dashboard.title')}</h1>
      <div className="flex flex-wrap gap-8 justify-center items-center animate-fade-in-slow">
        {widgets.map((w, i) => (
          <Widget key={i} {...w} />
        ))}
      </div>
      <div className="mt-16 w-full max-w-5xl animate-fade-in-slow">
        <h2 className="text-2xl font-bold text-white mb-4">{t('dashboard.recentOrders')}</h2>
        <div className="overflow-x-auto rounded-xl bg-white bg-opacity-10 p-4 shadow-xl">
          <table className="w-full text-lg text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-4 py-2">{t('orders.form.title.label')}</th>
                <th className="px-4 py-2">{t('orders.form.client.label')}</th>
                <th className="px-4 py-2">{t('orders.form.cost.label')}</th>
                <th className="px-4 py-2">{t('woocommerce.paymentMethod')}</th>
                <th className="px-4 py-2">{t('common.status')}</th>
                <th className="px-4 py-2">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id || idx} className="hover:bg-white/10 transition-colors">
                  <td className="px-4 py-2 font-bold">{order.number || order.id}</td>
                  <td className="px-4 py-2">{order.billing?.first_name} {order.billing?.last_name}</td>
                  <td className="px-4 py-2">KWD {order.total}</td>
                  <td className="px-4 py-2">{order.payment_method_title}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2">{order.date_created?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
        .animate-fade-in { animation: fadeIn 1.2s ease; }
        .animate-fade-in-slow { animation: fadeIn 2.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default HomeTVScreen;
