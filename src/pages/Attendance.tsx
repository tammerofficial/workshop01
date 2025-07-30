import React, { useState, useEffect, useContext } from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp, RefreshCw, Database, BarChart3, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { biometricService } from '../api/laravel';
import TransactionManagement from '../components/attendance/TransactionManagement';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: number;
  worker_id: number;
  worker_name: string;
  employee_code: string | null;
  punch_time: string;
  punch_state: number;
  punch_state_display: string;
  verification_type: string | null;
  terminal_alias: string | null;
  department: string | null;
  position: string | null;
  date: string;
  time: string;
  day_of_week: string;
  is_late: boolean;
  biometric_data: Record<string, unknown>;
}

interface AttendanceStats {
  total_records: number;
  total_workers: number;
  total_days: number;
  total_hours: number;
  avg_hours_per_day: number;
  check_ins: number;
  check_outs: number;
  late_arrivals: number;
}

interface WorkerOption {
  id: string;
  name: string;
  employee_code: string | null;
}

const Attendance: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useContext(LanguageContext)!;

  // Tab state
  const [activeTab, setActiveTab] = useState<'attendance' | 'transactions' | 'reports'>('attendance');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [displayedAttendance, setDisplayedAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  
  const [stats, setStats] = useState<AttendanceStats>({
    total_records: 0,
    total_workers: 0,
    total_days: 0,
    total_hours: 0,
    avg_hours_per_day: 0,
    check_ins: 0,
    check_outs: 0,
    late_arrivals: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 50,
    totalRecords: 0
  });

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [filters, setFilters] = useState({
    empCode: '',
    status: '',
    department: '',
    search: '',
    sortBy: 'punch_time',
    sortDir: 'desc',
    view: 'table' as 'table' | 'calendar' | 'chart'
  });

  // Handle filter changes and reset pagination
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    loadAttendanceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange, 
    filters.empCode, 
    filters.department, 
    filters.search,
    filters.status, // Move status filter to backend
    filters.sortBy, // Move sort to backend
    filters.sortDir, // Move sort direction to backend
    pagination.currentPage, 
    pagination.pageSize
  ]);

  useEffect(() => {
    loadWorkers();
  }, []);
  


  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Backend filters
      const params: Record<string, unknown> = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
      };
      
      if (dateRange.startDate) params.start_date = dateRange.startDate;
      if (dateRange.endDate) params.end_date = dateRange.endDate;
      if (filters.empCode) params.emp_code = filters.empCode;
      if (filters.department) params.department = filters.department;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.sortBy) params.sort_by = filters.sortBy;
      if (filters.sortDir) params.sort_dir = filters.sortDir;
      
      const response = await biometricService.getBiometricAttendance(params);
      
      if (response.data.success) {
        setAttendance(response.data.data); // Store data from API
        
        if(response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.current_page,
            totalPages: response.data.pagination.total_pages,
            pageSize: response.data.pagination.page_size,
            totalRecords: response.data.pagination.total_records
          });
        }
        setStats(response.data.stats);
      } else {
        setAttendance([]);
        setStats({
          total_records: 0,
          total_workers: 0,
          total_days: 0,
          total_hours: 0,
          avg_hours_per_day: 0,
          check_ins: 0,
          check_outs: 0,
          late_arrivals: 0
        });
        toast.error(response.data.message || t('attendance.noDataFound'));
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error(t('common.error'));
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      // Get workers from biometric system
      const response = await biometricService.getBiometricWorkers(50);
      
      if (response.data && Array.isArray(response.data)) {
        const workerOptions: WorkerOption[] = response.data.map((worker: Record<string, unknown>) => ({
          id: String(worker.id),
          name: String(worker.name),
          employee_code: String(worker.employee_code || worker.emp_code || ''), // Handle both possible keys
        }));
        setWorkers(workerOptions);
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(response.data.map((worker: Record<string, unknown>) => {
          const dept = worker.department as Record<string, unknown> | undefined;
          return dept?.dept_name ? String(dept.dept_name) : undefined;
        }).filter((dept): dept is string => Boolean(dept)))];
        setDepartments(uniqueDepartments);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
      // Fallback to empty data
      setWorkers([]);
      setDepartments([]);
    }
  };

  const syncBiometricData = async () => {
    try {
      setSyncing(true);
      toast.loading(t('attendance.syncing'));
      
      // Sync attendance data from biometric system
      await biometricService.syncAttendance();
      
      // Reload data after sync
      await loadAttendanceData();
      
      toast.success(t('attendance.syncSuccess'));
    } catch (error) {
      console.error('Error syncing biometric data:', error);
      toast.error(t('attendance.syncError'));
    } finally {
      setSyncing(false);
    }
  };

  const handleSort = (column: keyof AttendanceRecord) => {
    if (filters.sortBy === column) {
      setFilters(prev => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }));
    } else {
      setFilters(prev => ({ ...prev, sortBy: column, sortDir: 'asc' }));
    }
  };

  const SortableHeader = ({ column, label }: { column: keyof AttendanceRecord; label: string }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 ${isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        {filters.sortBy === column && (
          <span className="ml-2">
            {filters.sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('attendance.title')}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('attendance.subtitle')}
          </p>
        </div>
        <button
          onClick={syncBiometricData}
          disabled={syncing}
          className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 ${
            syncing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? t('attendance.syncing') : t('attendance.syncBiometric')}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'attendance', label: 'Attendance Records', icon: Clock },
            { key: 'transactions', label: 'Transaction Management', icon: Database },
            { key: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'attendance' | 'transactions' | 'reports')}
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

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check Ins</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.check_ins}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check Outs</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.check_outs}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendance.totalHours')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total_hours.toFixed(1)}h</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Late Arrivals</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.late_arrivals}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Filters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Range */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, startDate: e.target.value });
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, endDate: e.target.value });
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Worker */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('Worker')}
                </label>
                <select
                  value={filters.empCode}
                  onChange={(e) => handleFilterChange('empCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('All Workers')}</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.employee_code || ''}>{worker.name} ({worker.employee_code})</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('Department')}
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('All Departments')}</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}_${filters.sortDir}`}
                  onChange={(e) => {
                    const [sortBy, sortDir] = e.target.value.split('_');
                    setFilters(prev => ({ ...prev, sortBy, sortDir }));
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="punch_time_desc">Punch Time (Newest First)</option>
                  <option value="punch_time_asc">Punch Time (Oldest First)</option>
                  <option value="worker_name_asc">Worker Name (A-Z)</option>
                  <option value="worker_name_desc">Worker Name (Z-A)</option>
                  <option value="punch_state_display_asc">Action (A-Z)</option>
                  <option value="punch_state_display_desc">Action (Z-A)</option>
                  <option value="department_asc">Department (A-Z)</option>
                  <option value="department_desc">Department (Z-A)</option>
                </select>
              </div>
              
              {/* Search Bar */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('Search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('Search workers...')}
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className={`w-full px-4 py-2 pl-10 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Date & Status Filters */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setDateRange({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }); setPagination(prev => ({...prev, currentPage: 1})); }} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">{t('Today')}</button>
                  <button onClick={() => { const d = new Date(); d.setDate(d.getDate() - 1); setDateRange({ startDate: d.toISOString().split('T')[0], endDate: d.toISOString().split('T')[0] }); setPagination(prev => ({...prev, currentPage: 1})); }} className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200">{t('Yesterday')}</button>
                  <button onClick={() => { const d = new Date(); const start = new Date(d.setDate(d.getDate() - d.getDay())); setDateRange({ startDate: start.toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }); setPagination(prev => ({...prev, currentPage: 1})); }} className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200">{t('This Week')}</button>
                  <button onClick={() => { const d = new Date(); const start = new Date(d.getFullYear(), d.getMonth(), 1); setDateRange({ startDate: start.toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }); setPagination(prev => ({...prev, currentPage: 1})); }} className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200">{t('This Month')}</button>
                  <button onClick={() => { setDateRange({ startDate: '', endDate: '' }); setPagination(prev => ({...prev, currentPage: 1})); }} className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full hover:bg-red-200">{t('All Records')}</button>
                </div>
                <div className="border-l border-gray-300 h-6 mx-2"></div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleFilterChange('status', 'check_in')} className={`px-3 py-1 text-sm rounded-full ${filters.status === 'check_in' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>{t('Check-In')}</button>
                  <button onClick={() => handleFilterChange('status', 'check_out')} className={`px-3 py-1 text-sm rounded-full ${filters.status === 'check_out' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>{t('Check-Out')}</button>
                  <button onClick={() => handleFilterChange('status', 'late')} className={`px-3 py-1 text-sm rounded-full ${filters.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>{t('Late')}</button>
                  <button onClick={() => handleFilterChange('status', '')} className={`px-3 py-1 text-sm rounded-full ${filters.status === '' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>{t('All Statuses')}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on view */}
          {filters.view === 'table' && (
            <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="p-6 border-b border-gray-200">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('attendance.attendanceRecords')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <SortableHeader column="worker_name" label={t('Worker')} />
                      <SortableHeader column="punch_time" label={t('Punch Time')} />
                      <SortableHeader column="punch_state_display" label={t('Action')} />
                      <SortableHeader column="verification_type" label={t('Verification')} />
                      <SortableHeader column="terminal_alias" label={t('Terminal')} />
                      <SortableHeader column="department" label={t('Department')} />
                      <SortableHeader column="position" label={t('Position')} />
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {attendance.length > 0 ? (
                      attendance.map((record) => (
                        <tr key={record.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {record.worker_name}
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{record.employee_code}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.punch_time}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.punch_state_display}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.verification_type}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.terminal_alias}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.department}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.position}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className={`flex flex-col items-center space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock size={48} className="opacity-50" />
                            <div>
                              <h3 className="text-lg font-medium">{t('attendance.noRecordsFound')}</h3>
                              <p className="text-sm">{t('attendance.adjustFilters')}</p>
                            </div>
                            <button
                              onClick={syncBiometricData}
                              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                            >
                              <RefreshCw size={16} />
                              <span>{t('attendance.syncNow')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</span> of <span className="font-medium">{pagination.totalRecords}</span> results
                    </p>
                    <div className="flex items-center space-x-2">
                      <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Show:
                      </label>
                      <select
                        value={pagination.pageSize}
                        onChange={(e) => setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 1 }))}
                        className={`px-2 py-1 border rounded text-sm ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>per page</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      First
                    </button>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                            className={`px-3 py-2 border rounded-md text-sm ${
                              pagination.currentPage === pageNum
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.totalPages }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Transaction Management Tabs */}
      {(activeTab === 'transactions' || activeTab === 'reports') && (
        <TransactionManagement 
          activeTab={activeTab as 'transactions' | 'reports'} 
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      )}
    </div>
  );
};

export default Attendance;