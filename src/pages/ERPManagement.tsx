import React, { useState, useEffect, useContext } from 'react';
import { Building2, Users, Plus, Edit2, Trash2, Save, X, UserX, Monitor, RotateCcw, Search, Calendar, FileText, Power, PowerOff } from 'lucide-react';
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

interface Resignation {
  id: number;
  employee: number;
  employee_name?: string;
  resign_type: string;
  resign_date: string;
  reason?: string;
  description?: string;
  create_time?: string;
}

interface Device {
  id: number;
  sn: string;
  alias: string;
  ip_address: string;
  terminal_tz?: string;
  state: number;
  transfer_mode?: number;
  transfer_time?: number;
  last_activity?: string;
}

const ERPManagement: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useContext(LanguageContext)!;
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'departments' | 'positions' | 'resignations' | 'devices'>('departments');
  
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
  
  // Resignations State
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [showResignModal, setShowResignModal] = useState(false);
  const [editingResign, setEditingResign] = useState<Resignation | null>(null);
  const [resignData, setResignData] = useState({ 
    employee: '', 
    resign_type: '', 
    resign_date: '', 
    reason: '', 
    description: '' 
  });
  const [selectedResignations, setSelectedResignations] = useState<number[]>([]);
  
  // Devices State
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceData, setDeviceData] = useState({ 
    sn: '', 
    alias: '', 
    ip_address: '', 
    terminal_tz: 'UTC', 
    state: 1,
    transfer_mode: 1,
    transfer_time: 30
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'departments') {
        const response = await erpService.getDepartments();
        if (response.data.success) {
          setDepartments(response.data.data || []);
        }
      } else if (activeTab === 'positions') {
        const response = await erpService.getPositions();
        if (response.data.success) {
          setPositions(response.data.data || []);
        }
      } else if (activeTab === 'resignations') {
        const response = await erpService.getResignations();
        if (response.data.success) {
          setResignations(response.data.data || []);
        }
      } else if (activeTab === 'devices') {
        const response = await erpService.getDevices();
        if (response.data.success) {
          setDevices(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Department Functions
  const handleDeptSubmit = async (e: React.FormEvent) => {
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
      setEditingDept(null);
      setDeptData({ dept_name: '', dept_code: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to save department');
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await erpService.deleteDepartment(id);
        toast.success('Department deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  // Position Functions
  const handlePosSubmit = async (e: React.FormEvent) => {
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
      setEditingPos(null);
      setPosData({ position_name: '', position_code: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to save position');
    }
  };

  const handleDeletePos = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await erpService.deletePosition(id);
        toast.success('Position deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete position');
      }
    }
  };

  // Resignation Functions
  const handleResignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...resignData,
        employee: parseInt(resignData.employee)
      };
      
      if (editingResign) {
        await erpService.updateResignation(editingResign.id, submitData);
        toast.success('Resignation updated successfully');
      } else {
        await erpService.createResignation(submitData);
        toast.success('Resignation created successfully');
      }
      setShowResignModal(false);
      setEditingResign(null);
      setResignData({ employee: '', resign_type: '', resign_date: '', reason: '', description: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to save resignation');
    }
  };

  const handleDeleteResign = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this resignation?')) {
      try {
        await erpService.deleteResignation(id);
        toast.success('Resignation deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete resignation');
      }
    }
  };

  const handleReinstate = async () => {
    if (selectedResignations.length === 0) {
      toast.error('Please select resignations to reinstate');
      return;
    }
    
    try {
      await erpService.reinstateEmployee(selectedResignations);
      toast.success('Employee(s) reinstated successfully');
      setSelectedResignations([]);
      loadData();
    } catch (error) {
      toast.error('Failed to reinstate employee(s)');
    }
  };

  // Device Functions
  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...deviceData,
        state: parseInt(deviceData.state.toString()),
        transfer_mode: parseInt(deviceData.transfer_mode?.toString() || '1'),
        transfer_time: parseInt(deviceData.transfer_time?.toString() || '30')
      };
      
      if (editingDevice) {
        await erpService.updateDevice(editingDevice.id, submitData);
        toast.success('Device updated successfully');
      } else {
        await erpService.createDevice(submitData);
        toast.success('Device created successfully');
      }
      setShowDeviceModal(false);
      setEditingDevice(null);
      setDeviceData({ sn: '', alias: '', ip_address: '', terminal_tz: 'UTC', state: 1, transfer_mode: 1, transfer_time: 30 });
      loadData();
    } catch (error) {
      toast.error('Failed to save device');
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await erpService.deleteDevice(id);
        toast.success('Device deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete device');
      }
    }
  };

  // Filter data based on search
  const filteredData = () => {
    if (!searchTerm) {
      if (activeTab === 'departments') return departments;
      if (activeTab === 'positions') return positions;
      if (activeTab === 'resignations') return resignations;
      if (activeTab === 'devices') return devices;
    }
    
    const term = searchTerm.toLowerCase();
    if (activeTab === 'departments') {
      return departments.filter(d => 
        d.dept_name.toLowerCase().includes(term) || 
        d.dept_code.toLowerCase().includes(term)
      );
    }
    if (activeTab === 'positions') {
      return positions.filter(p => 
        p.position_name.toLowerCase().includes(term) || 
        p.position_code.toLowerCase().includes(term)
      );
    }
    if (activeTab === 'resignations') {
      return resignations.filter(r => 
        r.employee_name?.toLowerCase().includes(term) || 
        r.resign_type.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term)
      );
    }
    if (activeTab === 'devices') {
      return devices.filter(d => 
        d.alias.toLowerCase().includes(term) || 
        d.sn.toLowerCase().includes(term) ||
        d.ip_address.toLowerCase().includes(term)
      );
    }
    return [];
  };

  const getDeviceStateIcon = (state: number) => {
    return state === 1 ? (
      <Power className="w-4 h-4 text-green-500" />
    ) : (
      <PowerOff className="w-4 h-4 text-red-500" />
    );
  };

  const getDeviceStateText = (state: number) => {
    return state === 1 ? 'Online' : 'Offline';
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
      />

      {/* Tab Navigation */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'departments', label: 'Departments', icon: Building2 },
            { key: 'positions', label: 'Positions', icon: Users },
            { key: 'resignations', label: 'Resignations', icon: UserX },
            { key: 'devices', label: 'Devices', icon: Monitor }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="flex space-x-2">
          {activeTab === 'resignations' && selectedResignations.length > 0 && (
            <button
              onClick={handleReinstate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reinstate ({selectedResignations.length})</span>
            </button>
          )}
          
          <button
            onClick={() => {
              if (activeTab === 'departments') {
                setEditingDept(null);
                setDeptData({ dept_name: '', dept_code: '' });
                setShowDeptModal(true);
              } else if (activeTab === 'positions') {
                setEditingPos(null);
                setPosData({ position_name: '', position_code: '' });
                setShowPosModal(true);
              } else if (activeTab === 'resignations') {
                setEditingResign(null);
                setResignData({ employee: '', resign_type: '', resign_date: '', reason: '', description: '' });
                setShowResignModal(true);
              } else if (activeTab === 'devices') {
                setEditingDevice(null);
                setDeviceData({ sn: '', alias: '', ip_address: '', terminal_tz: 'UTC', state: 1, transfer_mode: 1, transfer_time: 30 });
                setShowDeviceModal(true);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add {activeTab.slice(0, -1)}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {activeTab === 'resignations' && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedResignations(resignations.map(r => r.id));
                        } else {
                          setSelectedResignations([]);
                        }
                      }}
                      checked={selectedResignations.length === resignations.length && resignations.length > 0}
                      className="rounded"
                    />
                  </th>
                )}
                {activeTab === 'departments' && (
                  <>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Department Name</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Department Code</th>
                  </>
                )}
                {activeTab === 'positions' && (
                  <>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Position Name</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Position Code</th>
                  </>
                )}
                {activeTab === 'resignations' && (
                  <>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Employee</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Type</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Reason</th>
                  </>
                )}
                {activeTab === 'devices' && (
                  <>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Alias</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Serial Number</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>IP Address</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  </>
                )}
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredData().map((item: any) => (
                <tr key={item.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  {activeTab === 'resignations' && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedResignations.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResignations([...selectedResignations, item.id]);
                          } else {
                            setSelectedResignations(selectedResignations.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                  )}
                  
                  {activeTab === 'departments' && (
                    <>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.dept_name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.dept_code}
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'positions' && (
                    <>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.position_name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.position_code}
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'resignations' && (
                    <>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.employee_name || `Employee #${item.employee}`}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {item.resign_type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(item.resign_date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.reason || 'N/A'}
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'devices' && (
                    <>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.alias}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.sn}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.ip_address}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className="flex items-center space-x-2">
                          {getDeviceStateIcon(item.state)}
                          <span>{getDeviceStateText(item.state)}</span>
                        </div>
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (activeTab === 'departments') {
                            setEditingDept(item);
                            setDeptData({ dept_name: item.dept_name, dept_code: item.dept_code });
                            setShowDeptModal(true);
                          } else if (activeTab === 'positions') {
                            setEditingPos(item);
                            setPosData({ position_name: item.position_name, position_code: item.position_code });
                            setShowPosModal(true);
                          } else if (activeTab === 'resignations') {
                            setEditingResign(item);
                            setResignData({
                              employee: item.employee.toString(),
                              resign_type: item.resign_type,
                              resign_date: item.resign_date,
                              reason: item.reason || '',
                              description: item.description || ''
                            });
                            setShowResignModal(true);
                          } else if (activeTab === 'devices') {
                            setEditingDevice(item);
                            setDeviceData({
                              sn: item.sn,
                              alias: item.alias,
                              ip_address: item.ip_address,
                              terminal_tz: item.terminal_tz || 'UTC',
                              state: item.state,
                              transfer_mode: item.transfer_mode || 1,
                              transfer_time: item.transfer_time || 30
                            });
                            setShowDeviceModal(true);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (activeTab === 'departments') handleDeleteDept(item.id);
                          else if (activeTab === 'positions') handleDeletePos(item.id);
                          else if (activeTab === 'resignations') handleDeleteResign(item.id);
                          else if (activeTab === 'devices') handleDeleteDevice(item.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData().length === 0 && (
            <div className="text-center py-12">
              <div className={`text-gray-500 ${isDark ? 'text-gray-400' : ''}`}>
                No {activeTab} found
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={() => setShowDeptModal(false)}>
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department Name
                </label>
                <input
                  type="text"
                  value={deptData.dept_name}
                  onChange={(e) => setDeptData({ ...deptData, dept_name: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department Code
                </label>
                <input
                  type="text"
                  value={deptData.dept_code}
                  onChange={(e) => setDeptData({ ...deptData, dept_code: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {showPosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPos ? 'Edit Position' : 'Add Position'}
              </h3>
              <button onClick={() => setShowPosModal(false)}>
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            <form onSubmit={handlePosSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position Name
                </label>
                <input
                  type="text"
                  value={posData.position_name}
                  onChange={(e) => setPosData({ ...posData, position_name: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position Code
                </label>
                <input
                  type="text"
                  value={posData.position_code}
                  onChange={(e) => setPosData({ ...posData, position_code: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPosModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPos ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resignation Modal */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingResign ? 'Edit Resignation' : 'Add Resignation'}
              </h3>
              <button onClick={() => setShowResignModal(false)}>
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            <form onSubmit={handleResignSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Employee ID
                </label>
                <input
                  type="number"
                  value={resignData.employee}
                  onChange={(e) => setResignData({ ...resignData, employee: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resignation Type
                </label>
                <select
                  value={resignData.resign_type}
                  onChange={(e) => setResignData({ ...resignData, resign_type: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="voluntary">Voluntary</option>
                  <option value="involuntary">Involuntary</option>
                  <option value="retirement">Retirement</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resignation Date
                </label>
                <input
                  type="date"
                  value={resignData.resign_date}
                  onChange={(e) => setResignData({ ...resignData, resign_date: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason
                </label>
                <input
                  type="text"
                  value={resignData.reason}
                  onChange={(e) => setResignData({ ...resignData, reason: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={resignData.description}
                  onChange={(e) => setResignData({ ...resignData, description: e.target.value })}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingResign ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingDevice ? 'Edit Device' : 'Add Device'}
              </h3>
              <button onClick={() => setShowDeviceModal(false)}>
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            <form onSubmit={handleDeviceSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Serial Number
                </label>
                <input
                  type="text"
                  value={deviceData.sn}
                  onChange={(e) => setDeviceData({ ...deviceData, sn: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Alias
                </label>
                <input
                  type="text"
                  value={deviceData.alias}
                  onChange={(e) => setDeviceData({ ...deviceData, alias: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  IP Address
                </label>
                <input
                  type="text"
                  value={deviceData.ip_address}
                  onChange={(e) => setDeviceData({ ...deviceData, ip_address: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Timezone
                </label>
                <input
                  type="text"
                  value={deviceData.terminal_tz}
                  onChange={(e) => setDeviceData({ ...deviceData, terminal_tz: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  State
                </label>
                <select
                  value={deviceData.state}
                  onChange={(e) => setDeviceData({ ...deviceData, state: parseInt(e.target.value) })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                >
                  <option value={1}>Online</option>
                  <option value={0}>Offline</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingDevice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPManagement;