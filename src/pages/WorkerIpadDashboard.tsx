import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, Pause, RotateCcw, Star, Clock, Target, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import laravel from '../api/laravel';

interface WorkerTask {
  id: number;
  order_id: number;
  stage: string;
  status: string;
  priority: string;
  due_date: string;
  estimated_hours: number;
  progress_percentage: number;
  can_start: boolean;
  can_complete: boolean;
}

interface WorkerData {
  id: number;
  name: string;
  emp_code: string;
  avatar: string;
  department: string;
  shift: string;
}

interface PerformanceData {
  efficiency: number;
  quality: number;
  total_score: number;
  rank_today: number;
  streak_days: number;
}

interface WorkerIpadDashboardProps {
  workerId: number;
}

const WorkerIpadDashboard: React.FC<WorkerIpadDashboardProps> = ({ workerId }) => {
  const { t } = useLanguage();
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [currentTasks, setCurrentTasks] = useState<WorkerTask[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await laravel.get('/ipad/dashboard', {
        params: { worker_id: workerId }
      });

      if (response.data.success) {
        setWorker(response.data.worker);
        setCurrentTasks(response.data.tasks.current);
        setCompletedToday(response.data.tasks.completed_today);
        setPerformance(response.data.performance);
      }
    } catch (error) {
      console.error('خطأ في تحميل لوحة التحكم:', error);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    loadDashboard();
    // تحديث كل 30 ثانية
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleTaskAction = async (taskId: number, action: 'start' | 'complete' | 'pause') => {
    try {
      setActionLoading(taskId);
      const response = await laravel.post(`/ipad/tasks/${action}`, {
        task_id: taskId,
        worker_id: workerId
      });

      if (response.data.success) {
        await loadDashboard(); // إعادة تحميل البيانات
      }
    } catch (error) {
      console.error(`خطأ في ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'in_progress': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <img
              src={worker?.avatar || '/assets/default-avatar.png'}
              alt={worker?.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-indigo-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{worker?.name}</h1>
              <p className="text-gray-600">{t('workers.ipad.employeeCode')} {worker?.emp_code}</p>
              <p className="text-sm text-indigo-600">{worker?.shift}</p>
            </div>
          </div>
          <div className="text-left">
            <div className="text-sm text-gray-500">{t('workers.ipad.date')}</div>
            <div className="text-lg font-semibold">{new Date().toLocaleDateString('ar', { calendar: 'gregory' })}</div>
<div className="text-sm text-gray-500">{new Date().toLocaleTimeString('ar', { hour12: false })}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Cards */}
        <div className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{performance?.efficiency || 0}%</div>
              <div className="text-sm text-gray-600">{t('workers.ipad.performanceEfficiency')}</div>
              <Target className="w-6 h-6 text-green-500 mx-auto mt-2" />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{performance?.quality || 0}</div>
              <div className="text-sm text-gray-600">{t('workers.ipad.qualityScore')}</div>
              <Star className="w-6 h-6 text-blue-500 mx-auto mt-2" />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{completedToday}</div>
              <div className="text-sm text-gray-600">{t('workers.ipad.todayTasks')}</div>
              <Clock className="w-6 h-6 text-purple-500 mx-auto mt-2" />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">#{performance?.rank_today || 0}</div>
              <div className="text-sm text-gray-600">{t('workers.ipad.dailyRank')}</div>
              <Award className="w-6 h-6 text-orange-500 mx-auto mt-2" />
            </div>
          </div>

          {/* Performance Streak */}
          {performance && performance.streak_days > 0 && (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-4 text-white text-center">
              <div className="text-2xl font-bold">{performance.streak_days} أيام</div>
              <div className="text-sm opacity-90">سلسلة أداء ممتاز</div>
              <div className="flex justify-center mt-2">
                {[...Array(Math.min(performance.streak_days, 7))].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('workers.ipad.currentTasks')}</h2>
            
            {currentTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">{t('workers.ipad.noCurrentTasks')}</p>
                <p className="text-gray-500">{t('workers.ipad.newTasksSoon')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTasks.map((task) => (
                  <div key={task.id} className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                        <span className="font-semibold text-gray-800">
                          الطلبية #{task.order_id} - {task.stage}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                          {task.status === 'assigned' ? 'مخصصة' : 
                           task.status === 'in_progress' ? 'قيد التنفيذ' : task.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {task.estimated_hours} ساعة متوقعة
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {task.status === 'in_progress' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>التقدم</span>
                          <span>{Math.round(task.progress_percentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 space-x-reverse">
                      {task.can_start && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'start')}
                          disabled={actionLoading === task.id}
                          className="flex items-center space-x-2 space-x-reverse bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          <span>بدء العمل</span>
                        </button>
                      )}

                      {task.can_complete && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'complete')}
                          disabled={actionLoading === task.id}
                          className="flex items-center space-x-2 space-x-reverse bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Square className="w-4 h-4" />
                          <span>إنهاء العمل</span>
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'pause')}
                          disabled={actionLoading === task.id}
                          className="flex items-center space-x-2 space-x-reverse bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Pause className="w-4 h-4" />
                          <span>إيقاف مؤقت</span>
                        </button>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="mt-2 text-xs text-gray-500">
                      موعد الإنجاز المتوقع: {new Date(task.due_date).toLocaleString('ar', { calendar: 'gregory' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={loadDashboard}
        className="fixed bottom-6 left-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-colors"
        title="تحديث البيانات"
      >
        <RotateCcw className="w-6 h-6" />
      </button>
    </div>
  );
};

export default WorkerIpadDashboard;