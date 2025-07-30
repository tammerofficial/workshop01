import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, Award, Calendar, Clock, 
  CheckCircle, AlertTriangle, BarChart, Loader
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { biometricService, taskService } from '../api/laravel';
import { Worker, Task } from '../types';
import toast from 'react-hot-toast';

const WorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'performance'>('overview');
  const [worker, setWorker] = useState<any>(null);
  const [workerTasks, setWorkerTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWorkerData = async () => {
      setLoading(true);
      try {
        // جلب جميع العمال من نظام البصمة والبحث عن العامل المطلوب
        const workersRes = await biometricService.getBiometricWorkers(50);
        const workers = workersRes.data.data || workersRes.data;
        const foundWorker = workers.find((w: any) => w.id.toString() === id || w.biometric_id?.toString() === id);
        
        if (foundWorker) {
          setWorker(foundWorker);
          
          // جلب المهام المرتبطة بهذا العامل
          try {
            const tasksRes = await taskService.getAll();
            setWorkerTasks(tasksRes.data.filter((task: any) => task.worker_id === foundWorker.id));
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
        title={worker.name} 
        subtitle={`${typeof worker.role === 'string' ? worker.role : worker.role?.position_name || 'Unknown'} - ${worker.department}`}
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
                src={worker.imageUrl}
                alt={worker.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-xl font-semibold text-gray-900">{worker.name}</h2>
              <p className="text-gray-500">
              {typeof worker.role === 'string' 
                ? worker.role 
                : worker.role?.position_name || 'Unknown'
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
                  {worker.status ? worker.status.charAt(0).toUpperCase() + worker.status.slice(1) : 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{worker.email || worker.contactInfo?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{worker.phone || worker.contactInfo?.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Award size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {worker.skills && worker.skills.length > 0 ? (
                      worker.skills.map((skill, index) => (
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
                            {worker.performance?.completedTasks || workerTasks.filter(task => task.status === 'completed').length}
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
                            {worker.performance?.averageTime || 'N/A'}
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
                            {worker.performance?.efficiency || 'N/A'}%
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
                              style={{ width: `${worker.performance?.efficiency || 0}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success"
                            ></div>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-gray-700">
                            {worker.performance?.efficiency || 'N/A'}%
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">
                          {worker.performance?.completedTasks || workerTasks.filter(task => task.status === 'completed').length}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Time per Task</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">
                          {worker.performance?.averageTime || 'N/A'}
                          <span className="text-sm text-gray-500 ml-1">min</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Assessment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {worker.skills && worker.skills.length > 0 ? (
                        worker.skills.map((skill, index) => (
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkerDetails;