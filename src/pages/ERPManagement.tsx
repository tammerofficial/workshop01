import React, { useState, useEffect, useContext } from 'react';
import { Building2, Users, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { erpService } from '../api/laravel';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';

interface Department {
  id: number;
  dept_name: string;
  dept_code: string;
}

interface Position {
  id: number;
  position_name: string;
  position_code: string;
}

const ERPManagement: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useContext(LanguageContext)!;
  
  // Departments State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptData, setDeptData] = useState({ dept_name: '', dept_code: '' });
  
  // Positions State
  const [positions, setPositions] = useState<Position[]>([]);
  const [showPosModal, setShowPosModal] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [posData, setPosData] = useState({ position_name: '', position_code: '' });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptResponse, posResponse] = await Promise.all([
        erpService.getDepartments(),
        erpService.getPositions()
      ]);
      
      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data);
      }
      
      if (posResponse.data.success) {
        setPositions(posResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading ERP data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Department Functions
  const handleCreateDept = () => {
    setEditingDept(null);
    setDeptData({ dept_name: '', dept_code: '' });
    setShowDeptModal(true);
  };

  const handleEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptData({ dept_name: dept.dept_name, dept_code: dept.dept_code });
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await erpService.updateDepartment(editingDept.id, deptData);
        toast.success('Department updated successfully');
      } else {
        await erpService.createDepartment(deptData);
        toast.success('Department created successfully');
      }
      
      setShowDeptModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Error saving department');
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await erpService.deleteDepartment(id);
      toast.success('Department deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Error deleting department');
    }
  };

  // Position Functions
  const handleCreatePos = () => {
    setEditingPos(null);
    setPosData({ position_name: '', position_code: '' });
    setShowPosModal(true);
  };

  const handleEditPos = (pos: Position) => {
    setEditingPos(pos);
    setPosData({ position_name: pos.position_name, position_code: pos.position_code });
    setShowPosModal(true);
  };

  const handleSavePos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPos) {
        await erpService.updatePosition(editingPos.id, posData);
        toast.success('Position updated successfully');
      } else {
        await erpService.createPosition(posData);
        toast.success('Position created successfully');
      }
      
      setShowPosModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Error saving position');
    }
  };

  const handleDeletePos = async (id: number) => {
    if (!confirm('Are you sure you want to delete this position?')) return;
    
    try {
      await erpService.deletePosition(id);
      toast.success('Position deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Error deleting position');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="ERP Management"
        subtitle="Manage departments and positions for the organization"
        icon={Building2}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments Section */}
        <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="text-blue-600" size={20} />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Departments
                </h2>
              </div>
              <button
                onClick={handleCreateDept}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Department</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {departments.length > 0 ? (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}
                  >
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dept.dept_name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Code: {dept.dept_code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditDept(dept)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 size={48} className={`mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No departments found</p>
              </div>
            )}
          </div>
        </div>

        {/* Positions Section */}
        <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={20} />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Positions
                </h2>
              </div>
              <button
                onClick={handleCreatePos}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Position</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}
                  >
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pos.position_name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Code: {pos.position_code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPos(pos)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePos(pos.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={48} className={`mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No positions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingDept ? 'Edit Department' : 'Add Department'}
                </h3>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSaveDept}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={deptData.dept_name}
                      onChange={(e) => setDeptData({...deptData, dept_name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Department Code
                    </label>
                    <input
                      type="text"
                      value={deptData.dept_code}
                      onChange={(e) => setDeptData({...deptData, dept_code: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {showPosModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingPos ? 'Edit Position' : 'Add Position'}
                </h3>
                <button
                  onClick={() => setShowPosModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSavePos}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position Name
                    </label>
                    <input
                      type="text"
                      value={posData.position_name}
                      onChange={(e) => setPosData({...posData, position_name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position Code
                    </label>
                    <input
                      type="text"
                      value={posData.position_code}
                      onChange={(e) => setPosData({...posData, position_code: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPosModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save</span>
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

export default ERPManagement;