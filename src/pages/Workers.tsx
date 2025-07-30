import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Trash2, User, Phone, Mail, Settings, Grid, List } from 'lucide-react';
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
  notes: string;
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

  const loadSupportData = async () => {
    try {
      const [areasResponse, departmentsResponse, positionsResponse] = await Promise.all([
        biometricService.getAreas(),
        biometricService.getDepartments(),
        biometricService.getPositions()
      ]);
      
      if (areasResponse.data.success) {
        setAreas(areasResponse.data.data);
      }
      if (departmentsResponse.data.success) {
        setDepartments(departmentsResponse.data.data);
      }
      if (positionsResponse.data.success) {
        setPositions(positionsResponse.data.data);
      }
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
                onEdit={() => {}} 
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
    </div>
  );
};

export default Workers;