import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, Award, Calendar, Clock, 
  CheckCircle, AlertTriangle, BarChart, Loader, 
  ClockIcon, UserCheck
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { biometricService, taskService } from '../api/laravel';
import toast from 'react-hot-toast';

const WorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'performance' | 'attendance'>('overview');
  const [worker, setWorker] = useState<Record<string, unknown> | null>(null);
  const [workerTasks, setWorkerTasks] = useState<Record<string, unknown>[]>([]);
  const [attendance, setAttendance] = useState<Record<string, unknown>[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  
  useEffect(() => {
    const fetchWorkerData = async () => {
      setLoading(true);
      try {
        // جلب جميع العمال من نظام البصمة والبحث عن العامل المطلوب
        const workersRes = await biometricService.getBiometricWorkers(50);
        const workers = workersRes.data.data || workersRes.data;
        const foundWorker = workers.find((w: Record<string, unknown>) => (w.id as string)?.toString() === id || (w.biometric_id as string)?.toString() === id);
        
        if (foundWorker) {
          setWorker(foundWorker);
          
          // جلب المهام المرتبطة بهذا العامل
          try {
            const tasksRes = await taskService.getAll();
            setWorkerTasks(tasksRes.data.filter((task: Record<string, unknown>) => task.worker_id === foundWorker.id));
          } catch (taskError) {
            console.log('Tasks not available:', taskError);
            setWorkerTasks([]);
          }
        } else {
          toast.error('Worker not found');
        }
      } catch (error) {
        console.error('Error loading worker details:', error);
        toast.error('Failed to load worker details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkerData();
    }
  }, [id]);

  // دالة لجلب بيانات الحضور والانصراف
  const fetchAttendanceData = async () => {
    if (!worker?.employee_code && !worker?.emp_code) return;
    
    setAttendanceLoading(true);
    try {
      const empCode = worker.employee_code || worker.emp_code;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // جلب بيانات الحضور للعامل المحدد لآخر 30 يوم
      const response = await biometricService.getBiometricAttendance({
        emp_code: empCode,
        start_date: startDate,
        end_date: endDate,
        page_size: 200
      });
      
      if (response.data && response.data.success) {
        const attendanceData = response.data.data || [];
        setAttendance(attendanceData);
        
        // حساب الإحصائيات
        calculateAttendanceStats(attendanceData);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setAttendanceLoading(false);
    }
  };

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
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100,
      punctualityRate: Math.round(punctualityRate * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    });
  };

  // جلب بيانات الحضور عند تغيير التاب أو العامل
  useEffect(() => {
    if (activeTab === 'attendance' && worker) {
      fetchAttendanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, worker]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader className="animate-spin text-blue-500" size={40} />
        <span className="ml-4 text-lg text-gray-600">Loading Worker Details...</span>
      </div>
    );
  }
  
  if (!worker) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-warning mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Worker Not Found</h2>
          <p className="text-gray-500">The worker you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={worker.name as string} 
        subtitle={`${typeof worker.role === 'string' ? worker.role : (worker.role as Record<string, unknown>)?.position_name || 'Unknown'} - ${worker.department as string}`}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Profile Card */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <img
                src={worker.imageUrl as string}
                alt={worker.name as string}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-xl font-semibold text-gray-900">{worker.name as string}</h2>
              <p className="text-gray-500">
              {typeof worker.role === 'string' 
                ? worker.role 
                : (worker.role as Record<string, unknown>)?.position_name || 'Unknown'
              }
            </p>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  worker.status === 'active' 
                    ? 'bg-success-100 text-success-800'
                    : worker.status === 'on leave'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {worker.status === 'active' && <CheckCircle size={14} className="mr-1" />}
                  {worker.status === 'on leave' && <Calendar size={14} className="mr-1" />}
                  {worker.status === 'unavailable' && <AlertTriangle size={14} className="mr-1" />}
                  {worker.status ? (worker.status as string).charAt(0).toUpperCase() + (worker.status as string).slice(1) : 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{worker.email as string || (worker.contactInfo as Record<string, unknown>)?.email as string || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{worker.phone as string || (worker.contactInfo as Record<string, unknown>)?.phone as string || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Award size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {worker.skills && (worker.skills as string[]).length > 0 ? (
                      (worker.skills as string[]).map((skill: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No skills listed</span>
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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-secondary text-secondary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'tasks'
                      ? 'border-b-2 border-secondary text-secondary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'performance'
                      ? 'border-b-2 border-secondary text-secondary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'attendance'
                      ? 'border-b-2 border-secondary text-secondary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Attendance
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle size={20} className="text-success mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {(worker.performance as Record<string, unknown>)?.completedTasks as number || workerTasks.filter(task => task.status === 'completed').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock size={20} className="text-secondary mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Average Time</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {(worker.performance as Record<string, unknown>)?.averageTime as string || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <BarChart size={20} className="text-accent mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Efficiency</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {(worker.performance as Record<string, unknown>)?.efficiency as string || 'N/A'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {workerTasks && workerTasks.length > 0 ? (
                        workerTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                              <User size={16} className="text-secondary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              Task {task.id} - {task.stage.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              Started: {new Date(task.startTime).toLocaleDateString()}
                            </p>
                            {task.endTime && (
                              <p className="text-sm text-gray-500">
                                Completed: {new Date(task.endTime).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="ml-auto">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.status === 'completed'
                                ? 'bg-success-100 text-success-800'
                                : task.status === 'in progress'
                                ? 'bg-secondary-100 text-secondary-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No recent tasks available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Task ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workerTasks && workerTasks.length > 0 ? (
                          workerTasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {task.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.stage.replace(/_/g, ' ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(task.startTime).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === 'completed'
                                    ? 'bg-success-100 text-success-800'
                                    : task.status === 'in progress'
                                    ? 'bg-secondary-100 text-secondary-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              No tasks available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Efficiency Rate</p>
                        <div className="mt-1 relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${(worker.performance as Record<string, unknown>)?.efficiency as number || 0}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success"
                            ></div>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-gray-700">
                            {(worker.performance as Record<string, unknown>)?.efficiency as string || 'N/A'}%
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">
                          {(worker.performance as Record<string, unknown>)?.completedTasks as number || workerTasks.filter(task => task.status === 'completed').length}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Time per Task</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">
                          {(worker.performance as Record<string, unknown>)?.averageTime as string || 'N/A'}
                          <span className="text-sm text-gray-500 ml-1">min</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Assessment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {worker.skills && (worker.skills as string[]).length > 0 ? (
                        (worker.skills as string[]).map((skill: string, index: number) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-700">{skill}</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                                Expert
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-500">No skills data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  {attendanceLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="animate-spin text-blue-500" size={40} />
                      <span className="ml-4 text-lg text-gray-600">Loading Attendance Data...</span>
                    </div>
                  ) : (
                    <>
                      {/* إحصائيات الحضور */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                          <div className="flex items-center">
                            <Calendar size={28} className="mr-3" />
                            <div>
                              <p className="text-blue-100 text-sm">Attendance Rate</p>
                              <p className="text-2xl font-bold">
                                {(attendanceStats?.attendanceRate as number) || 0}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                          <div className="flex items-center">
                            <UserCheck size={28} className="mr-3" />
                            <div>
                              <p className="text-green-100 text-sm">Punctuality Rate</p>
                              <p className="text-2xl font-bold">
                                {(attendanceStats?.punctualityRate as number) || 0}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                          <div className="flex items-center">
                            <ClockIcon size={28} className="mr-3" />
                            <div>
                              <p className="text-purple-100 text-sm">Avg Daily Hours</p>
                              <p className="text-2xl font-bold">
                                {(attendanceStats?.averageHours as number) || 0}h
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                          <div className="flex items-center">
                            <AlertTriangle size={28} className="mr-3" />
                            <div>
                              <p className="text-orange-100 text-sm">Late Arrivals</p>
                              <p className="text-2xl font-bold">
                                {(attendanceStats?.lateArrivals as number) || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* مؤشرات التزام العامل */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Commitment Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* معدل الحضور */}
                          <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-20 h-20">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-gray-300"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className={`${
                                    ((attendanceStats?.attendanceRate as number) || 0) >= 90 ? 'text-green-500' :
                                    ((attendanceStats?.attendanceRate as number) || 0) >= 75 ? 'text-yellow-500' : 'text-red-500'
                                  }`}
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  fill="none"
                                  strokeDasharray={`${((attendanceStats?.attendanceRate as number) || 0)}, 100`}
                                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <span className="absolute text-lg font-bold text-gray-700">
                                {Math.round((attendanceStats?.attendanceRate as number) || 0)}%
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-600">Attendance</p>
                            <p className={`text-xs ${
                              (attendanceStats?.attendanceRate || 0) >= 90 ? 'text-green-600' :
                              (attendanceStats?.attendanceRate || 0) >= 75 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {(attendanceStats?.attendanceRate || 0) >= 90 ? 'Excellent' :
                               (attendanceStats?.attendanceRate || 0) >= 75 ? 'Good' : 'Needs Improvement'}
                            </p>
                          </div>

                          {/* معدل الالتزام بالوقت */}
                          <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-20 h-20">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-gray-300"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className={`${
                                    (attendanceStats?.punctualityRate || 0) >= 90 ? 'text-green-500' :
                                    (attendanceStats?.punctualityRate || 0) >= 75 ? 'text-yellow-500' : 'text-red-500'
                                  }`}
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  fill="none"
                                  strokeDasharray={`${(attendanceStats?.punctualityRate || 0)}, 100`}
                                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <span className="absolute text-lg font-bold text-gray-700">
                                {Math.round(attendanceStats?.punctualityRate || 0)}%
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-600">Punctuality</p>
                            <p className={`text-xs ${
                              (attendanceStats?.punctualityRate || 0) >= 90 ? 'text-green-600' :
                              (attendanceStats?.punctualityRate || 0) >= 75 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {(attendanceStats?.punctualityRate || 0) >= 90 ? 'Very Punctual' :
                               (attendanceStats?.punctualityRate || 0) >= 75 ? 'Usually On Time' : 'Often Late'}
                            </p>
                          </div>

                          {/* ساعات العمل اليومية */}
                          <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-20 h-20">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-gray-300"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className={`${
                                    (attendanceStats?.averageHours || 0) >= 8 ? 'text-green-500' :
                                    (attendanceStats?.averageHours || 0) >= 6 ? 'text-yellow-500' : 'text-red-500'
                                  }`}
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  fill="none"
                                  strokeDasharray={`${Math.min((attendanceStats?.averageHours || 0) * 12.5, 100)}, 100`}
                                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <span className="absolute text-lg font-bold text-gray-700">
                                {(attendanceStats?.averageHours || 0).toFixed(1)}h
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-600">Daily Hours</p>
                            <p className={`text-xs ${
                              (attendanceStats?.averageHours || 0) >= 8 ? 'text-green-600' :
                              (attendanceStats?.averageHours || 0) >= 6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {(attendanceStats?.averageHours || 0) >= 8 ? 'Full Time' :
                               (attendanceStats?.averageHours || 0) >= 6 ? 'Adequate' : 'Below Standard'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* جدول سجلات الحضور الأخيرة */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance Records</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {attendance && attendance.length > 0 ? (
                                  attendance.slice(0, 10).map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {new Date(record.date as string).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.time as string}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.punch_state_display as string || 'Unknown'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          (record.time as string) <= '08:30:00' ? 'bg-green-100 text-green-800' :
                                          (record.time as string) <= '09:00:00' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {(record.time as string) <= '08:30:00' ? 'On Time' :
                                           (record.time as string) <= '09:00:00' ? 'Slightly Late' : 'Late'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                      No attendance records found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkerDetails;