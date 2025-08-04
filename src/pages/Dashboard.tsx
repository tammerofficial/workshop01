import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingBag, Package, UserCheck, PackageSearch, Workflow, Monitor, Factory, Calendar, 
  FileText, Bell, Zap, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Clock, Activity,
  Briefcase, Settings, BarChart3, CreditCard, ShoppingCart, Timer, Award, Target
} from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService } from '../api/laravel';
import { useCache } from '../contexts/CacheContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';


interface TabData {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: { value: number; positive: boolean };
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, loading }) => {
  if (loading) {
    return (
      <motion.div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="mt-4 w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
          {change && (
            <div className={`flex items-center text-sm mt-1 ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              {change.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1">{change.value}%</span>
            </div>
          )}
        </div>
      </div>
      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mt-4">{title}</h3>
    </motion.div>
  );
};

const WorkshopDashboard: React.FC<{ stats: any; t: any }> = ({ stats, t }) => {
  return (
    <div className="space-y-6">
      {/* إحصائيات التصنيع والإنتاج */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.activeOrders')}
          value={stats.in_progress_orders || 0}
          icon={<Workflow className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change={{ value: 15, positive: true }}
        />
        <StatCard
          title={t('dashboard.completedToday')}
          value={stats.completed_this_month || 0}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={{ value: 8, positive: true }}
        />
        <StatCard
          title={t('dashboard.productionStages')}
          value={stats.active_stations || 0}
          icon={<Factory className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title={t('dashboard.qualityRate')}
          value="96%"
          icon={<Award className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change={{ value: 2, positive: true }}
        />
      </div>

      {/* مراحل الإنتاج */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
            <Workflow className="mr-2 text-blue-600" size={24} />
            {t('dashboard.productionFlow')}
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/suit-production'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t('common.viewDetails')}
          </motion.button>
        </div>

        {/* مراحل الإنتاج مع التدفق */}
        <div className="space-y-4">
          {[
            { 
              id: 'pending', 
              name: t('dashboard.stages.pending'), 
              nameAr: t('dashboard.stages.pending'),
              count: stats.pending_orders || 8, 
              icon: <Clock className="h-5 w-5" />, 
              color: 'bg-gray-500',
              bgColor: 'bg-gray-50 dark:bg-gray-700',
              textColor: 'text-gray-700 dark:text-gray-300'
            },
            { 
              id: 'design', 
              name: t('dashboard.stages.design'), 
              nameAr: t('dashboard.stages.design'),
              count: 12, 
              icon: <Package className="h-5 w-5" />, 
              color: 'bg-blue-500',
              bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              textColor: 'text-blue-700 dark:text-blue-300'
            },
            { 
              id: 'cutting', 
              name: t('dashboard.stages.cutting'), 
              nameAr: t('dashboard.stages.cutting'),
              count: 6, 
              icon: <Activity className="h-5 w-5" />, 
              color: 'bg-yellow-500',
              bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
              textColor: 'text-yellow-700 dark:text-yellow-300'
            },
            { 
              id: 'sewing', 
              name: t('dashboard.stages.sewing'), 
              nameAr: t('dashboard.stages.sewing'),
              count: 9, 
              icon: <Target className="h-5 w-5" />, 
              color: 'bg-green-500',
              bgColor: 'bg-green-50 dark:bg-green-900/20',
              textColor: 'text-green-700 dark:text-green-300'
            },
            { 
              id: 'fitting', 
              name: t('dashboard.stages.fitting'), 
              nameAr: t('dashboard.stages.fitting'),
              count: 7, 
              icon: <Users className="h-5 w-5" />, 
              color: 'bg-purple-500',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              textColor: 'text-purple-700 dark:text-purple-300'
            },
            { 
              id: 'finishing', 
              name: t('dashboard.stages.finishing'), 
              nameAr: t('dashboard.stages.finishing'),
              count: 4, 
              icon: <Award className="h-5 w-5" />, 
              color: 'bg-orange-500',
              bgColor: 'bg-orange-50 dark:bg-orange-900/20',
              textColor: 'text-orange-700 dark:text-orange-300'
            },
            { 
              id: 'completed', 
              name: t('dashboard.stages.completed'), 
              nameAr: t('dashboard.stages.completed'),
              count: stats.completed_orders || 25, 
              icon: <CheckCircle className="h-5 w-5" />, 
              color: 'bg-emerald-500',
              bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
              textColor: 'text-emerald-700 dark:text-emerald-300'
            }
          ].map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 ${stage.bgColor} rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer`}
              onClick={() => window.location.href = `/production-flow/stage/${stage.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${stage.color} text-white`}>
                  {stage.icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${stage.textColor}`}>
                    {stage.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stage.nameAr}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stage.textColor}`}>
                    {stage.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.orders')}</div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${stage.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stage.count / 30) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {((stats.completed_orders || 25) / ((stats.orders_count || 64)) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.completionRate')}</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">2.5d</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.avgStageTime')}</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">96%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.qualityRate')}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.active_stations || 8}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.activeStations')}</div>
          </div>
        </div>

        {/* مؤشر التقدم العام */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg max-w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('dashboard.overallProgress')}
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-white">
              {((stats.completed_orders || 25) / (stats.orders_count || 64) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((stats.completed_orders || 25) / (stats.orders_count || 64) * 100), 100)}%` }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>Start</span>
            <span>In Progress</span>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* إحصائيات الحضور والانصراف */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Present Today"
          value={stats.active_workers_today || 0}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={{ value: 5, positive: true }}
        />
        <StatCard
          title="Total Hours"
          value={stats.total_working_hours_today || 0}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Overtime Hours"
          value="12h"
          icon={<Timer className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Efficiency Rate"
          value="94%"
          icon={<Target className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change={{ value: 3, positive: true }}
        />
      </div>

      {/* أداء العمال */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Performers</h3>
          <div className="space-y-4">
            {['أحمد محمد', 'فاطمة علي', 'خالد السالم'].map((name, index) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency: {95 - index * 2}%</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{8 + index}h</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Payroll Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Monthly Total</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">$15,750</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Overtime Pay</span>
              <span className="font-bold text-green-600 dark:text-green-400">$2,340</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Bonuses</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">$890</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SalesDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* إحصائيات المبيعات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(stats.total_revenue || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={{ value: 22, positive: true }}
        />
        <StatCard
          title="Monthly Sales"
          value={`$${(stats.monthly_revenue || 0).toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change={{ value: 18, positive: true }}
        />
        <StatCard
          title="Pending Payments"
          value={stats.unpaid_invoices || 0}
          icon={<CreditCard className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Profit Margin"
          value="34%"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change={{ value: 5, positive: true }}
        />
      </div>

      {/* تحليل المبيعات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Sales by Category</h3>
          <div className="space-y-4">
            {[
              { name: 'Custom Dresses', value: '$8,500', percentage: 45 },
              { name: 'Ready to Wear', value: '$6,200', percentage: 33 },
              { name: 'Alterations', value: '$4,100', percentage: 22 }
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Clients</h3>
          <div className="space-y-4">
            {[
              { name: 'سارة أحمد', orders: 8, spent: '$2,400' },
              { name: 'نورا محمد', orders: 6, spent: '$1,850' },
              { name: 'مريم علي', orders: 5, spent: '$1,200' }
            ].map((client, index) => (
              <div key={client.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{client.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{client.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{client.spent}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* إحصائيات المخزون */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats.materials_count || 0}
          icon={<Package className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.low_stock_materials || 0}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-red-500 to-red-600"
        />
        <StatCard
          title="Stock Value"
          value={`$${(stats.total_stock_value || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Categories"
          value="12"
          icon={<PackageSearch className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      {/* تحليل المخزون */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Low Stock Items</h3>
          <div className="space-y-4">
            {['Silk Fabric', 'Cotton Thread', 'Buttons Set', 'Zippers'].map((item, index) => (
              <div key={item} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{item}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Only {5 - index} left</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Recent Purchases</h3>
          <div className="space-y-4">
            {[
              { item: 'Premium Fabric', cost: '$450', date: 'Today' },
              { item: 'Thread Collection', cost: '$120', date: 'Yesterday' },
              { item: 'Accessories Kit', cost: '$89', date: '2 days ago' }
            ].map((purchase) => (
              <div key={purchase.item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{purchase.item}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{purchase.date}</p>
                </div>
                <p className="font-bold text-blue-600">{purchase.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t, isRTL } = useLanguage();
  const cache = useCache();
  const [activeTab, setActiveTab] = useState('workshop');
  const [stats, setStats] = useState({
    orders_count: 0,
    products_count: 0,
    clients_count: 0,
    materials_count: 0,
    workers_count: 0,
    in_progress_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    low_stock_materials: 0,
    unpaid_invoices: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    active_workers_today: 0,
    total_working_hours_today: 0,
    total_stock_value: 0,
    completed_this_month: 0,
    active_stations: 0,
  });
  const [loading, setLoading] = useState(true);

  const tabs: TabData[] = [
    {
      id: 'workshop',
      name: t('dashboard.tabs.workshop'),
      nameAr: 'الورشة',
      icon: <Factory size={20} />,
      color: 'bg-blue-500',
      description: t('dashboard.tabs.workshopDesc')
    },
    {
      id: 'attendance',
      name: t('dashboard.tabs.hr'),
      nameAr: 'الموارد البشرية',
      icon: <Users size={20} />,
      color: 'bg-green-500',
      description: t('dashboard.tabs.hrDesc')
    },
    {
      id: 'sales',
      name: t('dashboard.tabs.sales'),
      nameAr: 'المبيعات والمالية',
      icon: <DollarSign size={20} />,
      color: 'bg-purple-500',
      description: t('dashboard.tabs.salesDesc')
    },
    {
      id: 'inventory',
      name: t('dashboard.tabs.inventory'),
      nameAr: 'المخزون',
      icon: <Package size={20} />,
      color: 'bg-orange-500',
      description: t('dashboard.tabs.inventoryDesc')
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (!forceRefresh) {
        const cachedStats = cache.getCachedData('dashboard_complete_stats');
        if (cachedStats) {
          setStats(cachedStats);
          setLoading(false);
          return;
        }
      }

      const statsResponse = await cache.fetchWithCache(
        'dashboard_complete_stats',
        () => dashboardService.getStats(),
        2 * 60 * 1000
      );

      const statsData = statsResponse.data || statsResponse;
      
      // Add some mock production metrics temporarily
      const combinedStats = { 
        ...statsData,
        active_stations: 8,
        completed_this_month: 25,
        capacity_utilization: 94
      };
      setStats(prev => ({ ...prev, ...combinedStats }));
      
      cache.setCachedData('dashboard_complete_stats', combinedStats, 2 * 60 * 1000);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workshop':
        return <WorkshopDashboard stats={stats} t={t} />;
      case 'attendance':
        return <AttendanceDashboard stats={stats} />;
      case 'sales':
        return <SalesDashboard stats={stats} />;
      case 'inventory':
        return <InventoryDashboard stats={stats} />;
      default:
        return <WorkshopDashboard stats={stats} t={t} />;
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={() => loadDashboardData(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
        >
          <Activity size={20} />
          <span>{t('common.refresh')}</span>
        </button>
      </motion.div>

      {/* أزرار التبويب */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? `${tab.color} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <div className="text-left">
                <div className="font-semibold">{tab.name}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* محتوى التبويب */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;