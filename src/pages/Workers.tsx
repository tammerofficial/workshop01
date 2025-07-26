import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Phone, Mail, Calendar, Settings } from 'lucide-react';
import { workerService } from '../api/laravel';
import toast from 'react-hot-toast';

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
      toast.error('فشل في تحميل بيانات العمال');
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
      toast.success('تم إضافة العامل بنجاح');
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
      toast.error('فشل في إضافة العامل');
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      await workerService.update(editingWorker.id, editingWorker);
      toast.success('تم تحديث العامل بنجاح');
      setEditingWorker(null);
      loadWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error('فشل في تحديث العامل');
    }
  };

  const handleDeleteWorker = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العامل؟')) return;

    try {
      await workerService.delete(id);
      toast.success('تم حذف العامل بنجاح');
      loadWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('فشل في حذف العامل');
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await workerService.activate(id);
        toast.success('تم تفعيل العامل');
      } else {
        await workerService.deactivate(id);
        toast.success('تم إلغاء تفعيل العامل');
      }
      loadWorkers();
    } catch (error) {
      console.error('Error toggling worker status:', error);
      toast.error('فشل في تغيير حالة العامل');
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
          <h1 className="text-3xl font-bold text-gray-900">إدارة العمال</h1>
          <p className="text-gray-600 mt-2">إدارة فريق العمل والموظفين</p>
        </div>
                <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
          <Plus className="h-5 w-5" />
          إضافة عامل
                </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي العمال</p>
              <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">نشط</p>
              <p className="text-2xl font-bold text-green-600">{workers.filter(w => w.is_active).length}</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">غير نشط</p>
              <p className="text-2xl font-bold text-red-600">{workers.filter(w => !w.is_active).length}</p>
            </div>
            <User className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الأقسام</p>
              <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
              <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                placeholder="البحث في العمال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الأقسام</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-gray-600">{worker.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingWorker(worker)}
                  className="text-blue-600 hover:text-blue-800"
                  >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                        </div>
                      </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{worker.email || 'لم يتم تحديد البريد'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{worker.phone || 'لم يتم تحديد الهاتف'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{worker.department}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(worker.hire_date).toLocaleDateString('ar-SA')}
                </span>
                        </div>

              {worker.salary && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">الراتب: ${worker.salary}</span>
                        </div>
              )}
                      </div>

            {worker.skills && worker.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">المهارات:</p>
                <div className="flex flex-wrap gap-1">
                  {worker.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                worker.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {worker.is_active ? 'نشط' : 'غير نشط'}
              </span>
              
              <button
                onClick={() => handleToggleStatus(worker.id, !worker.is_active)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  worker.is_active
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {worker.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمال</h3>
          <p className="text-gray-600">ابدأ بإضافة عمال جدد للفريق</p>
        </div>
      )}

      {/* Create Worker Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة عامل جديد</h2>
              <form onSubmit={handleCreateWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      required
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                      </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={newWorker.email}
                      onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                    <input
                      type="tel"
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
                    <input
                      type="text"
                      required
                      value={newWorker.role}
                      onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                    <input
                      type="text"
                      required
                      value={newWorker.department}
                      onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الراتب</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newWorker.salary}
                      onChange={(e) => setNewWorker({ ...newWorker, salary: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التوظيف</label>
                    <input
                      type="date"
                      required
                      value={newWorker.hire_date}
                      onChange={(e) => setNewWorker({ ...newWorker, hire_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المهارات (مفصولة بفاصلة)</label>
                    <input
                      type="text"
                      value={newWorker.skills}
                      onChange={(e) => setNewWorker({ ...newWorker, skills: e.target.value })}
                      placeholder="خياطة، تفصيل، تطريز"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea
                    rows={3}
                    value={newWorker.notes}
                    onChange={(e) => setNewWorker({ ...newWorker, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                          <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                    إضافة العامل
                          </button>
                          <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                          </button>
                        </div>
              </form>
                      </div>
                    </div>
              </div>
            )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">تعديل العامل</h2>
              <form onSubmit={handleUpdateWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      required
                      value={editingWorker.name}
                      onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={editingWorker.email}
                      onChange={(e) => setEditingWorker({ ...editingWorker, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                    <input
                      type="tel"
                      value={editingWorker.phone}
                      onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
                    <input
                      type="text"
                      required
                      value={editingWorker.role}
                      onChange={(e) => setEditingWorker({ ...editingWorker, role: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                    <input
                      type="text"
                      required
                      value={editingWorker.department}
                      onChange={(e) => setEditingWorker({ ...editingWorker, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الراتب</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingWorker.salary}
                      onChange={(e) => setEditingWorker({ ...editingWorker, salary: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المهارات (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={editingWorker.skills?.join(', ') || ''}
                    onChange={(e) => setEditingWorker({ 
                      ...editingWorker, 
                      skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                    })}
                    placeholder="خياطة، تفصيل، تطريز"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea
                    rows={3}
                    value={editingWorker.notes}
                    onChange={(e) => setEditingWorker({ ...editingWorker, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    حفظ التغييرات
                  </button>
                <button
                    type="button"
                    onClick={() => setEditingWorker(null)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                    إلغاء
                </button>
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