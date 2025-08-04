import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Clock, AlertTriangle, 
  CheckCircle, Activity, Settings, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import laravel from '../api/laravel';

interface DashboardStats {
  overview: {
    orders_started: number;
    orders_completed: number;
    stages_completed: number;
    active_workers: number;
    avg_efficiency: number;
    avg_quality: number;
  };
  production_flow: {
    stages: Array<{
      stage_name: string;
      pending_tasks: number;
      in_progress_tasks: number;
      completed_today: number;
      workers_assigned: number;
    }>;
  };
  worker_performance: {
    top_performers: Array<{
      worker_name: string;
      daily_score: number;
      efficiency: number;
    }>;
    total_active_workers: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    title: string;
    message: string;
  }>;
  real_time_metrics: {
    current_active_tasks: number;
    workers_online: number;
    orders_in_queue: number;
    urgent_orders: number;
  };
}

const ManagerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await laravel.get('/manager/dashboard');
      
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('خطأ في تحميل لوحة المدير:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // تحديث كل دقيقتين
    const interval = setInterval(loadDashboard, 120000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'bg-red-100 border-red-500 text-red-700';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  const handleAction = async (action: string, params: any = {}) => {
    try {
      const response = await laravel.post('/manager/execute-action', {
        action,
        params
      });
      
      if (response.data.success) {
        // إعادة تحميل البيانات
        await loadDashboard();
      }
    } catch (error) {
      console.error('خطأ في تنفيذ الإجراء:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل لوحة المدير...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">فشل في تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('page.managerDashboard.title')}</h1>
            <p className="text-gray-600 mt-1">{t('page.managerDashboard.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-sm text-gray-500">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </div>
            <button
              onClick={loadDashboard}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الطلبيات المكتملة اليوم</p>
              <p className="text-3xl font-bold text-green-600">{dashboardData.overview.orders_completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">العمال النشطين</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardData.overview.active_workers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط الكفاءة</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(dashboardData.overview.avg_efficiency)}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط الجودة</p>
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(dashboardData.overview.avg_quality * 10) / 10}/10
              </p>
            </div>
            <Activity className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Production Flow */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">تدفق الإنتاج</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.production_flow.stages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pending_tasks" fill="#EF4444" name="معلقة" />
              <Bar dataKey="in_progress_tasks" fill="#F59E0B" name="قيد التنفيذ" />
              <Bar dataKey="completed_today" fill="#10B981" name="مكتملة اليوم" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">أفضل العمال اليوم</h3>
          <div className="space-y-3">
            {dashboardData.worker_performance.top_performers.slice(0, 5).map((worker, index) => (
              <div key={worker.worker_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="mr-3">
                    <p className="font-medium text-gray-800">{worker.worker_name}</p>
                    <p className="text-sm text-gray-600">كفاءة: {worker.efficiency}%</p>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {worker.daily_score} نقطة
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">المقاييس الفورية</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.real_time_metrics.current_active_tasks}
            </div>
            <div className="text-sm text-gray-600">مهام نشطة</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.real_time_metrics.workers_online}
            </div>
            <div className="text-sm text-gray-600">عمال متصلين</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardData.real_time_metrics.orders_in_queue}
            </div>
            <div className="text-sm text-gray-600">طلبيات في الانتظار</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.real_time_metrics.urgent_orders}
            </div>
            <div className="text-sm text-gray-600">طلبيات عاجلة</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">التنبيهات والتحذيرات</h3>
          <div className="space-y-3">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className={`p-4 border-r-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-6 left-6">
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => handleAction('rebalance_workload')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="إعادة توزيع الأحمال"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;