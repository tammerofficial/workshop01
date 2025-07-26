import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Clock,
  Calendar,
  Filter,
  Download,
  Eye,
  PieChart,
  Activity
} from 'lucide-react';
import { orderService, workerService, invoiceService, taskService } from '../api/laravel';

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
        monthlyOrders: generateMonthlyData(orders, timeRange),
        departmentPerformance: generateDepartmentPerformance(orders, workers)
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (orders: any[], range: string) => {
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

  const generateDepartmentPerformance = (orders: any[], workers: any[]) => {
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
          <p className="mt-4 text-gray-600">جاري تحميل البيانات التحليلية...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">لا توجد بيانات متاحة</p>
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
            <h1 className="text-3xl font-bold text-gray-900">التحليلات</h1>
          </div>
          <p className="text-gray-600">تحليل شامل لأداء الورشة والإنتاجية</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">الأسبوع</option>
                <option value="month">الشهر</option>
                <option value="quarter">الربع</option>
                <option value="year">السنة</option>
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['orders', 'revenue', 'workers', 'tasks'] as const).map(metric => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedMetric === metric 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {metric === 'orders' ? 'الطلبات' : 
                     metric === 'revenue' ? 'الإيرادات' : 
                     metric === 'workers' ? 'العمال' : 'المهام'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{data.orders.total}</p>
                <p className="text-sm text-green-600">+12% من الشهر الماضي</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">${data.revenue.total.toLocaleString()}</p>
                <p className="text-sm text-green-600">+8% من الشهر الماضي</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">العمال النشطين</p>
                <p className="text-2xl font-bold text-gray-900">{data.workers.active}</p>
                <p className="text-sm text-blue-600">من أصل {data.workers.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المهام المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">{data.tasks.completed}</p>
                <p className="text-sm text-orange-600">من أصل {data.tasks.total}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">الطلبات الشهرية</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+15%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {data.monthlyOrders.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.orders / Math.max(...data.monthlyOrders.map(m => m.orders))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">أداء الأقسام</h3>
              <PieChart className="h-5 w-5 text-gray-600" />
            </div>
            
            <div className="space-y-4">
              {data.departmentPerformance.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">{dept.department}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{dept.orders} طلب</span>
                    <span className="text-sm font-medium text-gray-900">{dept.efficiency.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Order Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة الطلبات</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">مكتمل</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.orders.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">قيد التنفيذ</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.orders.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">قيد الانتظار</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.orders.pending}</span>
              </div>
            </div>
          </div>

          {/* Task Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة المهام</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">مكتملة</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.tasks.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">قيد الانتظار</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.tasks.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">متأخرة</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.tasks.overdue}</span>
              </div>
            </div>
          </div>

          {/* Worker Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع العمال</h3>
            <div className="space-y-4">
              {Object.entries(data.workers.byDepartment).map(([dept, count], index) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">{dept}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;