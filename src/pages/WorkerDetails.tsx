import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, Award, Calendar, Clock, 
  CheckCircle, AlertTriangle, BarChart, Loader, 
  ClockIcon, UserCheck, Edit, ArrowLeft, RefreshCw,
  TrendingUp, Target, Activity, MapPin, Briefcase,
  Shield, Calendar as CalendarIcon, Timer, CheckSquare
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { biometricService, taskService } from '../api/laravel';
import { useCache } from '../contexts/CacheContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const WorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const cache = useCache();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'performance' | 'attendance'>('overview');
  const [worker, setWorker] = useState<Record<string, unknown> | null>(null);
  const [workerTasks, setWorkerTasks] = useState<Record<string, unknown>[]>([]);
  const [attendance, setAttendance] = useState<Record<string, unknown>[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchWorkerData = async () => {
      setLoading(true);
      try {
        // Try to get from cache first
        const cacheKey = `worker_details_${id}`;
        const cachedWorker = cache.getCachedData(cacheKey);
        
        if (cachedWorker) {
          setWorker(cachedWorker);
          setLoading(false);
          
          // Load additional data in background
          loadWorkerTasks(cachedWorker);
          return;
        }

        // جلب جميع العمال من نظام البصمة مع كاش
        const workers = await cache.fetchWithCache(
          'biometric_workers',
          async () => {
            const workersRes = await biometricService.getBiometricWorkers(50);
            return workersRes.data.data || workersRes.data;
          },
          5 * 60 * 1000 // 5 minutes cache
        );
        
        const foundWorker = workers.find((w: Record<string, unknown>) => 
          (w.id as string)?.toString() === id || (w.biometric_id as string)?.toString() === id
        );
        
        if (foundWorker) {
          setWorker(foundWorker);
          
          // Cache worker details for 10 minutes
          cache.setCachedData(cacheKey, foundWorker, 10 * 60 * 1000);
          
          // Load additional data
          loadWorkerTasks(foundWorker);
        } else {
          toast.error(t('Worker not found'));
        }
      } catch (error) {
        console.error('Error loading worker details:', error);
        toast.error(t('Failed to load worker details'));
      } finally {
        setLoading(false);
      }
    };

    const loadWorkerTasks = async (workerData: Record<string, unknown>) => {
      try {
        const tasksData = await cache.fetchWithCache(
          `worker_tasks_${workerData.id}`,
          async () => {
            const tasksRes = await taskService.getAll();
            return tasksRes.data.filter((task: Record<string, unknown>) => 
              task.worker_id === workerData.id
            );
          },
          3 * 60 * 1000 // 3 minutes cache for tasks
        );
        setWorkerTasks(tasksData);
      } catch (taskError) {
        console.log('Tasks not available:', taskError);
        setWorkerTasks([]);
      }
    };

    if (id) {
      fetchWorkerData();
    }
  }, [id, cache, t]);

  // دالة لجلب بيانات الحضور والانصراف مع كاش
  const fetchAttendanceData = async (forceRefresh = false) => {
    if (!worker?.employee_code && !worker?.emp_code) {
      console.log('No employee code found for worker:', worker);
      return;
    }
    
    if (attendanceLoading) {
      console.log('Already loading attendance data, skipping...');
      return;
    }
    
    setAttendanceLoading(true);
    try {
      const empCode = worker.employee_code || worker.emp_code;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const cacheKey = `attendance_${empCode}_${startDate}_${endDate}`;
      
      // Try to get from cache first
      if (!forceRefresh) {
        const cachedAttendance = cache.getCachedData(cacheKey);
        if (cachedAttendance && Array.isArray(cachedAttendance)) {
          console.log('Loading attendance from cache:', cachedAttendance.length, 'records');
          setAttendance(cachedAttendance);
          calculateAttendanceStats(cachedAttendance);
          setAttendanceLoading(false);
          return;
        }
      }

      console.log('Fetching attendance data from API for emp_code:', empCode);
      
      // جلب بيانات الحضور من API مع timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const apiPromise = cache.fetchWithCache(
        cacheKey,
        async () => {
          const response = await biometricService.getBiometricAttendance({
            emp_code: empCode,
            start_date: startDate,
            end_date: endDate,
            page_size: 200
          });
          
          console.log('API Response received:', response.data);
          
          if (response.data && response.data.success) {
            return response.data.data || [];
          }
          return [];
        },
        1 * 60 * 1000 // 1 minute cache for attendance (more frequent updates)
      );
      
      const attendanceData = await Promise.race([apiPromise, timeoutPromise]);
      
      if (Array.isArray(attendanceData)) {
        console.log('Setting attendance data:', attendanceData.length, 'records');
        setAttendance(attendanceData);
        calculateAttendanceStats(attendanceData);
      } else {
        console.warn('Invalid attendance data received:', attendanceData);
        setAttendance([]);
      }
      
    } catch (error) {
      console.error('Error loading attendance data:', error);
      
      if (error.message === 'Request timeout') {
        toast.error(t('Request timeout. Please try again.'));
      } else {
        toast.error(t('Failed to load attendance data'));
      }
      
      // Set empty array on error to avoid infinite loading
      setAttendance([]);
      setAttendanceStats(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Auto-fetch attendance when switching to attendance tab
  useEffect(() => {
    if (activeTab === 'attendance' && worker && attendance.length === 0 && !attendanceLoading) {
      fetchAttendanceData();
    }
  }, [activeTab, worker]);

  // دالة لحساب إحصائيات الحضور
  const calculateAttendanceStats = (attendanceData: Record<string, unknown>[]) => {
    const totalDays = attendanceData.length;
    const uniqueDates = [...new Set(attendanceData.map(record => record.date))].length;
    
    let checkIns = 0;
    let checkOuts = 0;
    let lateArrivals = 0;
    let earlyArrivals = 0;
    let totalHours = 0;
    
    const dailyRecords = new Map();
    
    attendanceData.forEach(record => {
      const date = record.date as string;
      const time = record.time as string;
      const punchState = (record.punch_state_display as string)?.toLowerCase() || '';
      
      if (!dailyRecords.has(date)) {
        dailyRecords.set(date, { checkIn: null, checkOut: null, hours: 0 });
      }
      
      if (punchState.includes('in') || time < '12:00:00') {
        checkIns++;
        if (time > '08:30:00') {
          lateArrivals++;
        } else if (time < '08:00:00') {
          earlyArrivals++;
        }
        dailyRecords.get(date).checkIn = time;
      } else if (punchState.includes('out') || time >= '12:00:00') {
        checkOuts++;
        dailyRecords.get(date).checkOut = time;
      }
    });
    
    // حساب ساعات العمل اليومية
    dailyRecords.forEach(day => {
      if (day.checkIn && day.checkOut) {
        const inTime = new Date(`2000-01-01 ${day.checkIn}`);
        const outTime = new Date(`2000-01-01 ${day.checkOut}`);
        const hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
        if (hours > 0 && hours < 24) {
          totalHours += hours;
          day.hours = hours;
        }
      }
    });
    
    const averageHours = totalHours / Math.max(uniqueDates, 1);
    const punctualityRate = uniqueDates > 0 ? ((uniqueDates - lateArrivals) / uniqueDates) * 100 : 0;
    const attendanceRate = uniqueDates > 0 ? (uniqueDates / 30) * 100 : 0; // افتراض 30 يوم عمل
    
    setAttendanceStats({
      totalRecords: totalDays,
      uniqueDates,
      checkIns,
      checkOuts,
      lateArrivals,
      earlyArrivals,
      totalHours: Math.round(totalHours * 10) / 10,
      averageHours: Math.round(averageHours * 10) / 10,
      punctualityRate: Math.round(punctualityRate),
      attendanceRate: Math.round(attendanceRate),
      dailyRecords
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Invalidate all caches for this worker
    cache.invalidateCache(`worker_details_${id}`);
    cache.invalidateCache(`worker_tasks_${id}`);
    
    if (worker?.employee_code || worker?.emp_code) {
      const empCode = worker.employee_code || worker.emp_code;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      cache.invalidateCache(`attendance_${empCode}_${startDate}_${endDate}`);
    }
    
    // Reload all data
    window.location.reload();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: t('Active')
        };
      case 'on leave':
        return {
          icon: Calendar,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: t('On Leave')
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: t('Unavailable')
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">{t('Loading worker details...')}</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('Worker not found')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('The requested worker could not be found')}</p>
          <button
            onClick={() => navigate('/workers')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('Back to Workers')}
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(worker.status as string);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader
        title={t('Worker Details')}
        subtitle={t('View and manage worker information')}
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{t('Refresh')}</span>
            </button>
            <button
              onClick={() => navigate(`/workers/${id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>{t('Edit Worker')}</span>
            </button>
            <button
              onClick={() => navigate('/workers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Back')}</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Worker Profile Card */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <img
                    src={worker.imageUrl as string || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name as string)}&background=6366f1&color=fff&size=128`}
                    alt={worker.name as string}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${statusInfo.bgColor} rounded-full flex items-center justify-center border-2 border-white`}>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  </div>
                </div>
                
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {worker.name as string}
                </h2>
                
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {typeof worker.role === 'string' 
                    ? worker.role 
                    : (worker.role as Record<string, unknown>)?.position_name || t('Unknown Position')
                  }
                </p>

                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
                  {worker.department || t('No Department')}
                </p>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.text}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center mr-3`}>
                    <Mail className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                      {t('Email')}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'} truncate`}>
                      {worker.email as string || (worker.contactInfo as Record<string, unknown>)?.email as string || t('Not provided')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center mr-3`}>
                    <Phone className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                      {t('Phone')}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {worker.phone as string || (worker.contactInfo as Record<string, unknown>)?.phone as string || t('Not provided')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center mr-3 mt-1`}>
                    <Award className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-2`}>
                      {t('Skills')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills && (worker.skills as string[]).length > 0 ? (
                        (worker.skills as string[]).map((skill: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {t('No skills listed')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content Area */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
              {/* Enhanced Tabs */}
              <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <nav className="flex -mb-px">
                  {[
                    { id: 'overview', label: t('Overview'), icon: BarChart },
                    { id: 'tasks', label: t('Tasks'), icon: CheckSquare },
                    { id: 'performance', label: t('Performance'), icon: TrendingUp },
                    { id: 'attendance', label: t('Attendance'), icon: ClockIcon }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? `border-b-2 border-blue-500 text-blue-600 ${isDark ? 'text-blue-400' : ''}`
                            : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Completed Tasks')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {workerTasks.filter(task => task.status === 'completed').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Active Tasks')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {workerTasks.filter(task => task.status === 'in_progress').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Target className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Efficiency')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {workerTasks.length > 0 
                                ? Math.round((workerTasks.filter(task => task.status === 'completed').length / workerTasks.length) * 100)
                                : 0
                              }%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                            <Activity className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Total Tasks')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {workerTasks.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        {t('Recent Activity')}
                      </h3>
                      {workerTasks.length > 0 ? (
                        <div className="space-y-3">
                          {workerTasks.slice(0, 5).map((task, index) => (
                            <div key={index} className={`flex items-center p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'in_progress' ? 'bg-blue-500' :
                                'bg-gray-400'
                              }`} />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {task.title as string}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {task.description as string}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {t(task.status as string)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>{t('No recent tasks available')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('Tasks')} ({workerTasks.length})
                      </h3>
                    </div>
                    
                    {workerTasks.length > 0 ? (
                      <div className="space-y-3">
                        {workerTasks.map((task, index) => (
                          <div key={index} className={`p-4 border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'} rounded-lg`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                                  {task.title as string}
                                </h4>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                  {task.description as string}
                                </p>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('Created')}: {new Date(task.created_at as string).toLocaleDateString()}
                                  </span>
                                  {task.due_date && (
                                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {t('Due')}: {new Date(task.due_date as string).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {t(task.priority as string)}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {t(task.status as string)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h4 className="text-lg font-medium mb-2">{t('No Tasks Found')}</h4>
                        <p>{t('This worker has no assigned tasks yet')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('Performance Metrics')}
                    </h3>
                    
                    {/* Performance Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Task Completion Rate')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {workerTasks.length > 0 
                                ? Math.round((workerTasks.filter(task => task.status === 'completed').length / workerTasks.length) * 100)
                                : 0
                              }%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Quality Score')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {attendanceStats ? Math.round(attendanceStats.punctualityRate as number) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Timer className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                              {t('Average Hours')}
                            </p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {attendanceStats ? (attendanceStats.averageHours as number).toFixed(1) : '0.0'}h
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Chart Placeholder */}
                    <div className={`p-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-center`}>
                      <BarChart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {t('Performance Analytics')}
                      </h4>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('Detailed performance charts will be available here')}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('Attendance Records')}
                      </h3>
                      <button
                        onClick={() => fetchAttendanceData(true)}
                        disabled={attendanceLoading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                          isDark 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        } ${attendanceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RefreshCw className={`w-4 h-4 ${attendanceLoading ? 'animate-spin' : ''}`} />
                        <span>{t('Refresh')}</span>
                      </button>
                    </div>

                    {attendanceLoading ? (
                      <div className="text-center py-12">
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('Loading attendance data...')}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Attendance Stats */}
                        {attendanceStats && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                  <UserCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                                    {t('Attendance Rate')}
                                  </p>
                                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {attendanceStats.attendanceRate}%
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                                    {t('Total Hours')}
                                  </p>
                                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {attendanceStats.totalHours}h
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                  <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                                    {t('Late Arrivals')}
                                  </p>
                                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {attendanceStats.lateArrivals}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                  <Target className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                                    {t('Punctuality')}
                                  </p>
                                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {attendanceStats.punctualityRate}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Attendance Records */}
                        {attendance.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t('Recent Records')} ({attendance.length})
                              </h4>
                              <div className="flex items-center space-x-3 text-xs">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('Check In')}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('Check Out')}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Table Header */}
                            <div className={`grid grid-cols-4 gap-4 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <div>{t('Date')}</div>
                              <div>{t('Time')}</div>
                              <div>{t('Action')}</div>
                              <div>{t('Device')}</div>
                            </div>
                            
                            {/* Records */}
                            <div className="max-h-96 overflow-y-auto space-y-2">
                              {attendance.slice(0, 50).map((record, index) => {
                                const isCheckIn = (record.punch_state_display as string)?.toLowerCase().includes('in') || 
                                                  (record.punch_state_display as string)?.toLowerCase().includes('دخول');
                                const date = new Date(record.date as string);
                                const formattedDate = date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
                                const time = record.time as string;
                                const action = record.punch_state_display as string || (isCheckIn ? t('Check In') : t('Check Out'));
                                const device = record.device_name as string || t('Unknown Device');
                                
                                return (
                                  <div key={index} className={`grid grid-cols-4 gap-4 p-4 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors`}>
                                    <div className="flex items-center">
                                      <div className={`w-3 h-3 rounded-full mr-3 ${isCheckIn ? 'bg-green-500' : 'bg-red-500'}`} />
                                      <div>
                                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                          {formattedDate}
                                        </p>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <div className={`p-2 ${isDark ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg`}>
                                        <p className={`text-sm font-mono font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                          {time}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        isCheckIn 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                      }`}>
                                        {action}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <div className="flex items-center">
                                        <div className={`w-2 h-2 ${device !== t('Unknown Device') ? 'bg-green-400' : 'bg-gray-400'} rounded-full mr-2`}></div>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                                          {device}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {attendance.length > 50 && (
                              <div className="text-center">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {t('Showing latest 50 records of')} {attendance.length} {t('total records')}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h4 className="text-lg font-medium mb-2">{t('No Attendance Records')}</h4>
                            <p>{t('No attendance data found for this worker')}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetails;