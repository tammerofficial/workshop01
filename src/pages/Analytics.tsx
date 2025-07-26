import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Clock,
  Download,
  Activity
} from 'lucide-react';
import { orderService, workerService, invoiceService, taskService } from '../api/laravel';
import { LanguageContext } from '../contexts/LanguageContext';

interface AnalyticsData {
  orders: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
  workers: {
    total: number;
    active: number;
    byDepartment: Record<string, number>;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  monthlyOrders: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  departmentPerformance: Array<{
    department: string;
    orders: number;
    efficiency: number;
  }>;
}

const Analytics: React.FC = () => {
  const { t } = useContext(LanguageContext)!;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<string>('orders');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, workersResponse, invoicesResponse, tasksResponse] = await Promise.all([
        orderService.getAll(),
        workerService.getAll(),
        invoiceService.getAll(),
        taskService.getAll()
      ]);

      const orders = ordersResponse.data;
      const workers = workersResponse.data;
      const invoices = invoicesResponse.data;
      const tasks = tasksResponse.data;

      // Calculate analytics data
      const analyticsData: AnalyticsData = {
        orders: {
          total: orders.length,
          completed: orders.filter((o: any) => o.status === 'completed').length,
          pending: orders.filter((o: any) => o.status === 'pending').length,
          inProgress: orders.filter((o: any) => o.status === 'in_progress').length,
        },
        workers: {
          total: workers.length,
          active: workers.filter((w: any) => w.is_active).length,
          byDepartment: workers.reduce((acc: any, worker: any) => {
            acc[worker.department] = (acc[worker.department] || 0) + 1;
            return acc;
          }, {})
        },
        revenue: {
          total: invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + parseFloat(i.total_amount || 0), 0),
          thisMonth: 0, // Calculate based on timeRange
          lastMonth: 0,
          growth: 0
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t: any) => t.status === 'completed').length,
          pending: tasks.filter((t: any) => t.status === 'pending').length,
          overdue: tasks.filter((t: any) => new Date(t.due_date) < new Date() && t.status !== 'completed').length,
        },
        monthlyOrders: generateMonthlyData(orders),
        departmentPerformance: generateDepartmentPerformance(orders)
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (orders: any[]) => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data = [];
    
    for (let i = 0; i < 12; i++) {
      const monthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === i;
      });
      
      data.push({
        month: months[i],
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total_cost || 0), 0)
      });
    }
    
    return data;
  };

  const generateDepartmentPerformance = (orders: any[]) => {
    const departments = ['design', 'cutting', 'sewing', 'fitting', 'finishing'];
    return departments.map(dept => ({
      department: dept,
      orders: orders.filter((o: any) => o.department === dept).length,
      efficiency: Math.random() * 40 + 60 // Mock efficiency calculation
    }));
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'orders':
        return 'bg-blue-100 text-blue-800';
      case 'revenue':
        return 'bg-green-100 text-green-800';
      case 'workers':
        return 'bg-purple-100 text-purple-800';
      case 'tasks':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('analytics.loading')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">{t('analytics.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t('analytics.header.title')}</h1>
              <p className="text-gray-500">{t('analytics.header.subtitle')}</p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t(`analytics.controls.${range}`)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
            {(['orders', 'revenue', 'workers', 'tasks'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedMetric === metric
                    ? `${getMetricColor(metric)} shadow`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {metric === 'orders' && <Package size={16} />}
                {metric === 'revenue' && <DollarSign size={16} />}
                {metric === 'workers' && <Users size={16} />}
                {metric === 'tasks' && <Activity size={16} />}
                {t(`analytics.controls.${metric}`)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors">
            <Download size={18} />
            {t('analytics.controls.export')}
          </button>
        </motion.div>

        {/* Metrics */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard icon={Package} title={t('analytics.metrics.totalOrders')} value={data.orders.total} change="+5.2%" changeType="increase" />
          <MetricCard icon={DollarSign} title={t('analytics.metrics.totalRevenue')} value={`$${data.revenue.total.toLocaleString()}`} change="+12.5%" changeType="increase" />
          <MetricCard icon={Users} title={t('analytics.metrics.activeWorkers')} value={data.workers.active} change="-1.2%" changeType="decrease" />
          <MetricCard icon={Clock} title={t('analytics.metrics.completedTasks')} value={data.tasks.completed} change="+8.0%" changeType="increase" />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t('analytics.charts.monthlyOrders')}>
            <div className="h-80">
              {/* Replace with actual chart component */}
              <div className="flex items-end h-full gap-2">
                {data.monthlyOrders.map(d => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                      style={{ height: `${(d.orders / Math.max(...data.monthlyOrders.map(m => m.orders))) * 100}%` }}
                      title={`${d.month}: ${d.orders} ${t('analytics.charts.ordersUnit')}`}
                    ></div>
                    <span className="text-xs text-gray-500">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
          <ChartCard title={t('analytics.charts.departmentPerformance')}>
            <div className="h-80">
              {/* Replace with actual chart component */}
              <div className="space-y-4">
                {data.departmentPerformance.map(d => (
                  <div key={d.department}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{d.department}</span>
                      <span className="text-sm font-medium text-gray-700">{d.efficiency.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${d.efficiency}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
          <ChartCard title={t('analytics.charts.orderStatus')}>
            <div className="h-80 flex items-center justify-center">
              {/* Replace with actual chart component */}
              <div className="w-64 h-64 relative">
                <div className="absolute inset-0 rounded-full bg-green-400" style={{ clipPath: `circle(50% at 50% 50%)` }}></div>
                <div className="absolute inset-0 rounded-full bg-yellow-400" style={{ clipPath: `polygon(50% 0, 50% 50%, 100% 50%, 100% 0)` }}></div>
                <div className="absolute inset-0 rounded-full bg-blue-400" style={{ clipPath: `polygon(50% 50%, 100% 100%, 0 100%)` }}></div>
                <div className="absolute inset-1/4 rounded-full bg-gray-50"></div>
              </div>
            </div>
          </ChartCard>
          <ChartCard title={t('analytics.charts.taskStatus')}>
            <div className="h-80 flex flex-col justify-center gap-4">
              <StatusItem color="bg-green-500" label={t('analytics.charts.completed')} value={data.tasks.completed} total={data.tasks.total} />
              <StatusItem color="bg-blue-500" label={t('analytics.charts.inProgress')} value={data.tasks.total - data.tasks.completed - data.tasks.pending - data.tasks.overdue} total={data.tasks.total} />
              <StatusItem color="bg-yellow-500" label={t('analytics.charts.pending')} value={data.tasks.pending} total={data.tasks.total} />
              <StatusItem color="bg-red-500" label={t('analytics.charts.overdue')} value={data.tasks.overdue} total={data.tasks.total} />
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, change, changeType }) => {
  const { t } = useContext(LanguageContext)!;
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <div className="flex items-center text-xs mt-2">
          <span className={`flex items-center gap-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} className={changeType === 'increase' ? '' : 'transform -scale-y-100'} />
            {change}
          </span>
          <span className="text-gray-400 ml-1">{t('analytics.metrics.fromLastMonth')}</span>
        </div>
      </div>
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

interface StatusItemProps {
  color: string;
  label: string;
  value: number;
  total: number;
}

const StatusItem: React.FC<StatusItemProps> = ({ color, label, value, total }) => {
  const { t } = useContext(LanguageContext)!;
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value} / {total} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default Analytics;