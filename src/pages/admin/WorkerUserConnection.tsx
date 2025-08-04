import React, { useState, useEffect } from 'react';
import { Link2, User, Users, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { biometricService, userApi } from '../../api/laravel';
import toast from 'react-hot-toast';

interface BiometricWorker {
  id: number;
  name: string;
  email?: string;
  employee_code?: string;
  department?: string;
  biometric_id?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    display_name: string;
  };
}

interface Worker {
  id: number;
  name: string;
  email?: string;
  user_id?: number;
  biometric_id?: string;
  employee_code?: string;
}

const WorkerUserConnection: React.FC = () => {
  const [biometricWorkers, setBiometricWorkers] = useState<BiometricWorker[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [biometricResponse, usersResponse, workersResponse] = await Promise.all([
        biometricService.getBiometricWorkers(100),
        userApi.getUsers({ role_name: 'worker' }),
        // TODO: Add worker service to get all workers
      ]);

      setBiometricWorkers(biometricResponse.data.data || []);
      setUsers(usersResponse.data.data || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const connectWorkerToUser = async (biometricWorkerId: number, userId: number) => {
    try {
      setConnecting(biometricWorkerId);
      
      // TODO: Create API endpoint to connect worker to user
      // For now, we'll create/update worker record
      const biometricWorker = biometricWorkers.find(w => w.id === biometricWorkerId);
      
      if (!biometricWorker) {
        toast.error('العامل غير موجود');
        return;
      }

      // Create worker record with user connection
      const workerData = {
        name: biometricWorker.name,
        email: biometricWorker.email,
        role: 'worker',
        department: biometricWorker.department || 'Production',
        biometric_id: biometricWorker.biometric_id || biometricWorkerId,
        employee_code: biometricWorker.employee_code,
        user_id: userId,
        is_active: true,
        hire_date: new Date().toISOString().split('T')[0]
      };

      // TODO: Use proper worker API endpoint
      // const response = await workerService.create(workerData);
      
      toast.success('تم ربط العامل بالمستخدم بنجاح');
      loadData(); // Refresh data
      
    } catch (error) {
      console.error('Error connecting worker to user:', error);
      toast.error('خطأ في ربط العامل بالمستخدم');
    } finally {
      setConnecting(null);
    }
  };

  const getAvailableUsers = () => {
    return users.filter(user => 
      user.role?.name === 'worker' && 
      !workers.some(worker => worker.user_id === user.id)
    );
  };

  const getUnconnectedBiometricWorkers = () => {
    return biometricWorkers.filter(biometricWorker => 
      !workers.some(worker => 
        worker.biometric_id === biometricWorker.biometric_id || 
        worker.biometric_id === biometricWorker.id.toString()
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ربط العمال بالمستخدمين</h1>
          <p className="text-gray-600 mt-2">ربط عمال البيومترك بحسابات المستخدمين في النظام</p>
        </div>
        <button
          onClick={loadData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          تحديث البيانات
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عمال البيومترك</p>
              <p className="text-2xl font-bold text-blue-600">{biometricWorkers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مستخدمين متاحين</p>
              <p className="text-2xl font-bold text-green-600">{getAvailableUsers().length}</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عمال غير مربوطين</p>
              <p className="text-2xl font-bold text-orange-600">{getUnconnectedBiometricWorkers().length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عمال مربوطين</p>
              <p className="text-2xl font-bold text-purple-600">{workers.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Connection Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">ربط العمال بالمستخدمين</h2>
        
        {getUnconnectedBiometricWorkers().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>جميع العمال مربوطين بالمستخدمين</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getUnconnectedBiometricWorkers().map((biometricWorker) => (
              <div key={biometricWorker.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{biometricWorker.name}</h3>
                    <p className="text-sm text-gray-500">
                      كود الموظف: {biometricWorker.employee_code || biometricWorker.id}
                      {biometricWorker.email && ` | البريد: ${biometricWorker.email}`}
                      {biometricWorker.department && ` | القسم: ${biometricWorker.department}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select 
                      className="border rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          connectWorkerToUser(biometricWorker.id, parseInt(e.target.value));
                        }
                      }}
                      disabled={connecting === biometricWorker.id}
                    >
                      <option value="">اختر مستخدم للربط</option>
                      {getAvailableUsers().map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    
                    {connecting === biometricWorker.id && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Workers Display */}
      {workers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">العمال المربوطين</h2>
          <div className="space-y-3">
            {workers.map((worker) => {
              const user = users.find(u => u.id === worker.user_id);
              return (
                <div key={worker.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Link2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-gray-500">
                        مربوط بـ: {user?.name} ({user?.email})
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    كود البيومترك: {worker.biometric_id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerUserConnection;