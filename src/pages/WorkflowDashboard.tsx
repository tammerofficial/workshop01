import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Users, Clock, CheckCircle, AlertCircle, 
  TrendingUp, Activity, Settings, RefreshCw, Zap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import laravel from '../api/laravel';

interface WorkflowStats {
  stages: Array<{
    stage_name: string;
    pending_tasks: number;
    in_progress_tasks: number;
    completed_today: number;
    workers_assigned: number;
  }>;
  workers: {
    total_active: number;
    available: number;
    busy: number;
    on_break: number;
  };
  performance: {
    avg_efficiency: number;
    avg_quality: number;
    completion_rate: number;
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

const WorkflowDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadWorkflowStats = async () => {
    try {
      setLoading(true);
      const response = await laravel.get('/workflow/worker-status-summary');
      if (response.data.success) {
        // We need to adapt the structure from the API to the one expected by the component
        const apiData = response.data.data;
        const mockData: WorkflowStats = {
          stages: [ // This part is still mock, we will replace it later
            { stage_name: 'القص', pending_tasks: 5, in_progress_tasks: 3, completed_today: 12, workers_assigned: 4 },
            { stage_name: 'الخياطة', pending_tasks: 8, in_progress_tasks: 6, completed_today: 15, workers_assigned: 8 },
            { stage_name: 'التطريز', pending_tasks: 3, in_progress_tasks: 2, completed_today: 8, workers_assigned: 5 },
            { stage_name: 'مراقبة الجودة', pending_tasks: 2, in_progress_tasks: 1, completed_today: 10, workers_assigned: 3 },
            { stage_name: 'التعبئة', pending_tasks: 1, in_progress_tasks: 2, completed_today: 18, workers_assigned: 4 },
            { stage_name: 'التسليم', pending_tasks: 0, in_progress_tasks: 1, completed_today: 20, workers_assigned: 2 }
          ],
          workers: {
            total_active: apiData.total_active,
            available: apiData.available,
            busy: apiData.busy,
            on_break: apiData.on_break
          },
          performance: { // This is also mock for now
            avg_efficiency: 87.5,
            avg_quality: 8.9,
            completion_rate: 94.2
          },
          alerts: [ // Mock alerts
            { type: 'warning', message: 'الخياطة بها 8 مهام معلقة', severity: 'medium' },
            { type: 'info', message: 'تم إكمال 83 مهمة اليوم', severity: 'low' }
          ]
        };
        setStats(mockData);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات التدفق:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowStats();
    // تحديث كل دقيقة
    const interval = setInterval(loadWorkflowStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStageColor = (pending: number, inProgress: number) => {
    const total = pending + inProgress;
    if (total > 10) return 'bg-red-500';
    if (total > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-blue-500';
      case 'on_break': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل نظام التدفق...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
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
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Zap className="w-8 h-8 text-blue-600 ml-3" />
              {t('page.workflow.title')}
            </h1>
            <p className="text-gray-600 mt-1">{t('page.workflow.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-sm text-gray-500">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </div>
            <button
              onClick={loadWorkflowStats}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط الكفاءة</p>
              <p className="text-3xl font-bold text-blue-600">{stats.performance.avg_efficiency}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط الجودة</p>
              <p className="text-3xl font-bold text-green-600">{stats.performance.avg_quality}/10</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">معدل الإكمال</p>
              <p className="text-3xl font-bold text-purple-600">{stats.performance.completion_rate}%</p>
            </div>
            <Activity className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Production Stages */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">مراحل الإنتاج</h3>
          <div className="space-y-4">
            {stats.stages.map((stage, index) => (
              <div key={stage.stage_name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${getStageColor(stage.pending_tasks, stage.in_progress_tasks)} ml-3`}></div>
                    <span className="font-medium text-gray-800">{stage.stage_name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{stage.workers_assigned} عامل</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-bold text-red-600">{stage.pending_tasks}</div>
                    <div className="text-red-600">معلقة</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-600">{stage.in_progress_tasks}</div>
                    <div className="text-yellow-600">قيد التنفيذ</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-600">{stage.completed_today}</div>
                    <div className="text-green-600">مكتملة اليوم</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workers Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">حالة العمال</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">إجمالي العمال النشطين</span>
              <span className="text-2xl font-bold text-gray-800">{stats.workers.total_active}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full ml-3"></div>
                <span className="text-green-700">متاحين</span>
              </div>
              <span className="font-bold text-green-700">{stats.workers.available}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full ml-3"></div>
                <span className="text-blue-700">مشغولين</span>
              </div>
              <span className="font-bold text-blue-700">{stats.workers.busy}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full ml-3"></div>
                <span className="text-yellow-700">في استراحة</span>
              </div>
              <span className="font-bold text-yellow-700">{stats.workers.on_break}</span>
            </div>
          </div>

          {/* Workers Distribution Chart */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-l-full" 
                style={{ width: `${(stats.workers.available / stats.workers.total_active) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0</span>
              <span>{stats.workers.total_active} عامل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">التنبيهات والإشعارات</h3>
          <div className="space-y-3">
            {stats.alerts.map((alert, index) => (
              <div key={index} className="flex items-start p-3 border-r-4 border-yellow-500 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 ml-3" />
                <div>
                  <p className="text-yellow-800">{alert.message}</p>
                  <span className="text-xs text-yellow-600 capitalize">{alert.severity}</span>
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
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="إعدادات النظام"
          >
            <Settings className="w-6 h-6" />
          </button>
          
          <button
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="بدء العمليات"
          >
            <Play className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;