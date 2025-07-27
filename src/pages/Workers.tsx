import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Phone, Mail, Calendar, Settings } from 'lucide-react';
import { workerService } from '../api/laravel';
import toast from 'react-hot-toast';
import { LanguageContext } from '../contexts/LanguageContext';

interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  hire_date: string;
  is_active: boolean;
  skills: string[];
  notes: string;
}

const Workers = () => {
  const { t } = useContext(LanguageContext)!;
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    salary: '',
    hire_date: '',
    skills: '',
    notes: ''
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const response = await workerService.getAll();
      setWorkers(response.data);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workerData = {
        ...newWorker,
        salary: parseFloat(newWorker.salary) || 0,
        skills: newWorker.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };

      await workerService.create(workerData);
      toast.success(t('common.success'));
      setShowCreateModal(false);
      setNewWorker({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        salary: '',
        hire_date: '',
        skills: '',
        notes: ''
      });
      loadWorkers();
    } catch (error) {
      console.error('Error creating worker:', error);
      toast.error(t('common.error'));
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      await workerService.update(editingWorker.id, editingWorker);
      toast.success(t('common.success'));
      setEditingWorker(null);
      loadWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDeleteWorker = async (id: number) => {
    if (!confirm(t('common.deleteConfirm'))) return;

    try {
      await workerService.delete(id);
      toast.success(t('common.success'));
      loadWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error(t('common.error'));
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await workerService.activate(id);
        toast.success(t('common.success'));
      } else {
        await workerService.deactivate(id);
        toast.success(t('common.success'));
      }
      loadWorkers();
    } catch (error) {
      console.error('Error toggling worker status:', error);
      toast.error(t('common.error'));
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || worker.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && worker.is_active) ||
                         (statusFilter === 'inactive' && !worker.is_active);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(workers.map(w => w.department))];

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
            Workers
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
            Manage workshop staff and assignments
          </p>
        </div>
                <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
          <Plus className="h-5 w-5" />
          {t('workers.addWorker')}
                </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('workers.total')}</p>
              <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {departments.map(dep => (
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
        </div>
      </div>

      {/* Workers Table */}
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
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{worker.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{worker.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{worker.role}</td>
                  <td className="px-6 py-4">{worker.department}</td>
                  <td className="px-6 py-4">{new Date(worker.hire_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={worker.is_active} onChange={() => handleToggleStatus(worker.id, !worker.is_active)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <button onClick={() => setEditingWorker(worker)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteWorker(worker.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  {t('workers.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingWorker) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={editingWorker ? handleUpdateWorker : handleCreateWorker} className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingWorker ? t('workers.modal.editTitle') : t('workers.modal.addTitle')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('workers.form.name')}</label>
                  <input type="text" name="name" id="name" 
                         value={editingWorker ? editingWorker.name : newWorker.name}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, name: e.target.value}) : setNewWorker({...newWorker, name: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('workers.form.email')}</label>
                  <input type="email" name="email" id="email"
                         value={editingWorker ? editingWorker.email : newWorker.email}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, email: e.target.value}) : setNewWorker({...newWorker, email: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('workers.form.phone')}</label>
                  <input type="tel" name="phone" id="phone"
                         value={editingWorker ? editingWorker.phone : newWorker.phone}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, phone: e.target.value}) : setNewWorker({...newWorker, phone: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('workers.form.role')}</label>
                  <input type="text" name="role" id="role"
                         value={editingWorker ? editingWorker.role : newWorker.role}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, role: e.target.value}) : setNewWorker({...newWorker, role: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">{t('workers.form.department')}</label>
                  <input type="text" name="department" id="department"
                         value={editingWorker ? editingWorker.department : newWorker.department}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, department: e.target.value}) : setNewWorker({...newWorker, department: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">{t('workers.form.salary')}</label>
                  <input type="number" name="salary" id="salary"
                         value={editingWorker ? editingWorker.salary : newWorker.salary}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, salary: parseFloat(e.target.value)}) : setNewWorker({...newWorker, salary: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">{t('workers.form.hireDate')}</label>
                  <input type="date" name="hire_date" id="hire_date"
                         value={editingWorker ? editingWorker.hire_date : newWorker.hire_date}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, hire_date: e.target.value}) : setNewWorker({...newWorker, hire_date: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">{t('workers.form.skills')}</label>
                  <input type="text" name="skills" id="skills"
                         value={editingWorker ? (Array.isArray(editingWorker.skills) ? editingWorker.skills.join(', ') : '') : newWorker.skills}
                         onChange={e => editingWorker ? setEditingWorker({...editingWorker, skills: e.target.value.split(',').map(s => s.trim())}) : setNewWorker({...newWorker, skills: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">{t('workers.form.notes')}</label>
                <textarea name="notes" id="notes" rows="3"
                          value={editingWorker ? editingWorker.notes : newWorker.notes}
                          onChange={e => editingWorker ? setEditingWorker({...editingWorker, notes: e.target.value}) : setNewWorker({...newWorker, notes: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setShowCreateModal(false); setEditingWorker(null); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  {t('common.cancel')}
                </button>
                <button type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingWorker ? t('common.update') : t('common.save')}
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