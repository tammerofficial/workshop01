import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Trash2, User, Phone, Mail, Settings, Grid, List, X, RefreshCw } from 'lucide-react';
import { biometricService } from '../api/laravel';
import toast from 'react-hot-toast';
import { LanguageContext } from '../contexts/LanguageContext';
import WorkerCard from '../components/workers/WorkerCard';

interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string | { id: number; position_code: string; position_name: string };
  department: string;
  salary: number;
  hire_date: string;
  is_active: boolean;
  skills: string[];
  notes?: string;
  biometric_id?: string;
  employee_code?: string;
  biometric_data?: Record<string, unknown>;
}

const Workers = () => {
  const { t } = useContext(LanguageContext)!;
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  // تم إزالة showCreateModal لأن البيانات تأتي من البصمة فقط
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [areas, setAreas] = useState<{id: number, area_name: string, area_code: string}[]>([]);
  const [departments, setDepartments] = useState<{id: number, dept_name: string, dept_code: string}[]>([]);
  const [positions, setPositions] = useState<{id: number, position_name: string}[]>([]);
  
  const [totalWorkers, setTotalWorkers] = useState(0);

  const [newWorker, setNewWorker] = useState({
    emp_code: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    department: '',
    area: [] as number[],
    position: '',
    hire_date: ''
  });

  const [editWorkerData, setEditWorkerData] = useState({
    emp_code: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    department: '',
    area: [] as number[],
    position: '',
    hire_date: ''
  });

  useEffect(() => {
    loadWorkers();
    loadSupportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await biometricService.getBiometricWorkers(50);
      setWorkers(response.data.data || response.data);
      setTotalWorkers(response.data.count || response.data.length);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkers = async () => {
    try {
      setLoading(true);
      toast.loading(t('workers.refreshing'));
      await loadWorkers();
      toast.success(t('workers.refreshed'));
    } catch (error) {
      console.error('Error refreshing workers:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const refreshSupportData = async () => {
    try {
      // مسح الـ cache وإعادة تحميل البيانات
      localStorage.removeItem('biometric_areas');
      localStorage.removeItem('biometric_departments');
      localStorage.removeItem('biometric_positions');
      localStorage.removeItem('biometric_cache_timestamp');
      
      toast.loading('Refreshing departments and positions...');
      await loadSupportData();
      toast.success('Departments and positions refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing support data:', error);
      toast.error('Error refreshing data');
    }
  };

  const loadSupportData = async () => {
    // تحقق من وجود البيانات في cache محلي
    const cachedAreas = localStorage.getItem('biometric_areas');
    const cachedDepartments = localStorage.getItem('biometric_departments');
    const cachedPositions = localStorage.getItem('biometric_positions');
    const cacheTimestamp = localStorage.getItem('biometric_cache_timestamp');
    
    // استخدام cache إذا كان عمره أقل من 10 دقائق
    const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
    if (cacheAge < 10 * 60 * 1000 && cachedAreas && cachedDepartments && cachedPositions) {
      setAreas(JSON.parse(cachedAreas));
      setDepartments(JSON.parse(cachedDepartments));
      setPositions(JSON.parse(cachedPositions));
      return;
    }
    
    try {
      const [areasResponse, departmentsResponse, positionsResponse] = await Promise.all([
        biometricService.getAreas(),
        biometricService.getDepartments(),
        biometricService.getPositions()
      ]);
      
      if (areasResponse.data.success) {
        const areasData = areasResponse.data.data;
        setAreas(areasData);
        localStorage.setItem('biometric_areas', JSON.stringify(areasData));
      }
      if (departmentsResponse.data.success) {
        const departmentsData = departmentsResponse.data.data;
        setDepartments(departmentsData);
        localStorage.setItem('biometric_departments', JSON.stringify(departmentsData));
      }
      if (positionsResponse.data.success) {
        const positionsData = positionsResponse.data.data;
        setPositions(positionsData);
        localStorage.setItem('biometric_positions', JSON.stringify(positionsData));
      }
      
      // حفظ timestamp للcache
      localStorage.setItem('biometric_cache_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error loading support data:', error);
    }
  };
  
  const handleToggleStatus = (id: number, status: boolean) => {
    // This functionality might need to be implemented via the biometric API if available.
    // For now, it will only affect the local view.
    setWorkers(workers.map(w => w.id === id ? {...w, is_active: status} : w));
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const workerData = {
        ...newWorker,
        department: parseInt(newWorker.department),
        area: newWorker.area,
        position: newWorker.position ? parseInt(newWorker.position) : undefined,
        hire_date: newWorker.hire_date || new Date().toISOString().split('T')[0]
      };

      const response = await biometricService.createEmployee(workerData);
      
      if (response.data.success) {
        toast.success(t('workers.createSuccess'));
        setShowCreateModal(false);
        setNewWorker({
          emp_code: '',
          first_name: '',
          last_name: '',
          email: '',
          mobile: '',
          department: '',
          area: [],
          position: '',
          hire_date: ''
        });
        loadWorkers(); // Refresh workers list
      } else {
        toast.error(response.data.message || t('common.error'));
      }
    } catch (error) {
      console.error('Error creating worker:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    
    // تحويل بيانات العامل إلى نموذج التعديل
    const biometricData = worker.biometric_data as {
      emp_code?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      mobile?: string;
      department?: { id: number };
      area?: Array<{ id: number }>;
      position?: { id: number };
      hire_date?: string;
    };
    
    setEditWorkerData({
      emp_code: worker.employee_code || biometricData?.emp_code || '',
      first_name: biometricData?.first_name || worker.name.split(' ')[0] || '',
      last_name: biometricData?.last_name || worker.name.split(' ').slice(1).join(' ') || '',
      email: worker.email || biometricData?.email || '',
      mobile: worker.phone || biometricData?.mobile || '',
      department: biometricData?.department?.id?.toString() || '',
      area: biometricData?.area?.map(a => a.id) || [],
      position: biometricData?.position?.id?.toString() || '',
      hire_date: worker.hire_date || biometricData?.hire_date || ''
    });
    
    setShowEditModal(true);
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      setLoading(true);
      
      // إزالة emp_code من البيانات المُرسلة لأن نظام البصمة لا يدعم تحديثه
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { emp_code, ...editableData } = editWorkerData;
      // emp_code is excluded from updates as it's not supported by the biometric system
      
      const workerData = {
        ...editableData,
        department: parseInt(editWorkerData.department),
        area: editWorkerData.area,
        position: editWorkerData.position ? parseInt(editWorkerData.position) : undefined,
      };

      // استخدام biometric_id للتحديث في نظام البصمة
      const employeeId = editingWorker.biometric_id;
      
      if (!employeeId) {
        toast.error(t('workers.biometricIdNotFound') || 'Employee biometric ID not found');
        return;
      }

      const response = await biometricService.updateEmployee(Number(employeeId), workerData);
      
      if (response.data.success) {
        toast.success(t('workers.updateSuccess'));
        setShowEditModal(false);
        setEditingWorker(null);
        setEditWorkerData({
          emp_code: '',
          first_name: '',
          last_name: '',
          email: '',
          mobile: '',
          department: '',
          area: [],
          position: '',
          hire_date: ''
        });
        loadWorkers(); // Refresh workers list
      } else {
        toast.error(response.data.message || t('common.error'));
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (id: number) => {
    if (!confirm(t('common.deleteConfirm'))) return;

    try {
      setLoading(true);
      
      const response = await biometricService.deleteEmployee(id);
      
      if (response.data.success) {
        toast.success(t('workers.deleteSuccess'));
        loadWorkers(); // Refresh workers list
      } else {
        toast.error(response.data.message || t('common.error'));
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (typeof worker.role === 'string' ? worker.role : worker.role?.position_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || worker.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && worker.is_active) ||
                         (statusFilter === 'inactive' && !worker.is_active);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
          <h1 
            className="text-3xl font-bold text-gray-900"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.875)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--text-color)'
            }}
          >
            {t('workers.title')}
          </h1>
          <p 
            className="text-gray-600 mt-2"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.125)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--secondary-color)'
            }}
          >
            {t('workers.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshWorkers}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Settings className="h-5 w-5" />
            {t('workers.refresh')}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {t('workers.addWorker')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('workers.total')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalWorkers}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('workers.active')}</p>
              <p className="text-2xl font-bold text-green-600">{workers.filter(w => w.is_active).length}</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('workers.inactive')}</p>
              <p className="text-2xl font-bold text-red-600">{workers.filter(w => !w.is_active).length}</p>
            </div>
            <User className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('workers.department')}</p>
              <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('workers.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <select 
              value={departmentFilter} 
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">{t('workers.allDepartments')}</option>
              {[...new Set(workers.map(w => w.department))].filter(Boolean).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <div>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">{t('inventory.allStatuses')}</option>
              <option value="active">{t('workers.activeStatus')}</option>
              <option value="inactive">{t('workers.inactiveStatus')}</option>
            </select>
          </div>
          <div className="flex justify-end">
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                onClick={() => setViewMode('card')} 
                className={`p-2 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map(worker => (
              <WorkerCard 
                key={worker.id} 
                worker={worker}
                onEdit={handleEditWorker} 
                onDelete={handleDeleteWorker}
                t={t}
              />
            ))
          ) : (
            <div className="col-span-full flex justify-center py-10">
              <p className="text-gray-500">{t('workers.noResults')}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">{t('workers.table.name')}</th>
                <th scope="col" className="px-6 py-3">{t('workers.table.contact')}</th>
                <th scope="col" className="px-6 py-3">{t('workers.table.role')}</th>
                <th scope="col" className="px-6 py-3">{t('workers.table.department')}</th>
                <th scope="col" className="px-6 py-3">{t('workers.table.hireDate')}</th>
                <th scope="col" className="px-6 py-3">{t('workers.table.status')}</th>
                <th scope="col" className="px-6 py-3">{t('workers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map(worker => (
                  <tr key={worker.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {worker.name}
                      {worker.biometric_id && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {t('workers.biometric')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{worker.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{worker.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {typeof worker.role === 'string' 
                        ? worker.role 
                        : worker.role?.position_name || t('common.notAvailable')
                      }
                    </td>
                    <td className="px-6 py-4">{worker.department}</td>
                    <td className="px-6 py-4">{new Date(worker.hire_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={worker.is_active} onChange={() => handleToggleStatus(worker.id, !worker.is_active)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <button onClick={() => handleDeleteWorker(worker.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    {t('workers.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Worker Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('workers.modal.addTitle')}</h2>
            <form onSubmit={handleCreateWorker}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emp_code" className="block text-sm font-medium text-gray-700">Employee Code *</label>
                  <input
                    type="text"
                    id="emp_code"
                    value={newWorker.emp_code}
                    onChange={(e) => setNewWorker({...newWorker, emp_code: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    id="first_name"
                    value={newWorker.first_name}
                    onChange={(e) => setNewWorker({...newWorker, first_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    value={newWorker.last_name}
                    onChange={(e) => setNewWorker({...newWorker, last_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newWorker.email}
                    onChange={(e) => setNewWorker({...newWorker, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="tel"
                    id="mobile"
                    value={newWorker.mobile}
                    onChange={(e) => setNewWorker({...newWorker, mobile: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department *</label>
                  <select
                    id="department"
                    value={newWorker.department}
                    onChange={(e) => setNewWorker({...newWorker, department: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                  <select
                    id="position"
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({...newWorker, position: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.position_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">Hire Date</label>
                  <input
                    type="date"
                    id="hire_date"
                    value={newWorker.hire_date}
                    onChange={(e) => setNewWorker({...newWorker, hire_date: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Areas * (Select at least one)</label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {areas.map((area) => (
                    <label key={area.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newWorker.area.includes(area.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWorker({...newWorker, area: [...newWorker.area, area.id]});
                          } else {
                            setNewWorker({...newWorker, area: newWorker.area.filter(id => id !== area.id)});
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">{area.area_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWorker({
                      emp_code: '',
                      first_name: '',
                      last_name: '',
                      email: '',
                      mobile: '',
                      department: '',
                      area: [],
                      position: '',
                      hire_date: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Employee</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWorker(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Employee Code cannot be changed due to biometric system constraints. All other information can be updated.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateWorker}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="edit_emp_code" className="block text-sm font-medium text-gray-700">
                      Employee Code
                      <span className="ml-1 text-xs text-yellow-600">(Cannot be changed)</span>
                    </label>
                    <input
                      type="text"
                      id="edit_emp_code"
                      value={editWorkerData.emp_code}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm cursor-not-allowed opacity-75"
                      title="Employee Code cannot be changed after creation due to biometric system constraints"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      id="edit_first_name"
                      value={editWorkerData.first_name}
                      onChange={(e) => setEditWorkerData({...editWorkerData, first_name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      id="edit_last_name"
                      value={editWorkerData.last_name}
                      onChange={(e) => setEditWorkerData({...editWorkerData, last_name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="edit_email"
                      value={editWorkerData.email}
                      onChange={(e) => setEditWorkerData({...editWorkerData, email: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input
                      type="text"
                      id="edit_mobile"
                      value={editWorkerData.mobile}
                      onChange={(e) => setEditWorkerData({...editWorkerData, mobile: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_department" className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      id="edit_department"
                      value={editWorkerData.department}
                      onChange={(e) => setEditWorkerData({...editWorkerData, department: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit_position" className="block text-sm font-medium text-gray-700">Position</label>
                    <select
                      id="edit_position"
                      value={editWorkerData.position}
                      onChange={(e) => setEditWorkerData({...editWorkerData, position: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Position</option>
                      {positions.map((pos) => (
                        <option key={pos.id} value={pos.id}>{pos.position_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit_hire_date" className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <input
                      type="date"
                      id="edit_hire_date"
                      value={editWorkerData.hire_date}
                      onChange={(e) => setEditWorkerData({...editWorkerData, hire_date: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={refreshSupportData}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1"
                  >
                    <RefreshCw size={16} />
                    <span>Refresh Data</span>
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingWorker(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Employee'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;