import React, { useState, useEffect, useContext } from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
// Components removed as filters are now integrated directly
import { biometricService } from '../api/laravel';
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

const Attendance: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useContext(LanguageContext)!;
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  // Calendar view disabled for biometric data
  // const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
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

  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    workerId: '',
    status: '',
    department: '',
    search: '',
    sortBy: 'date_desc',
    view: 'table' as 'table' | 'calendar' | 'chart'
  });

  useEffect(() => {
    loadAttendanceData();
    loadWorkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.workerId, filters.department, filters.status]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get attendance data from biometric system
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        worker_id: filters.workerId || undefined
      };
      
      const response = await biometricService.getBiometricAttendance(params);
      
      if (response.data.success) {
        setAttendance(response.data.data);
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
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      // Get workers from biometric system
      const response = await biometricService.getBiometricWorkers(50);
      
      if (response.data && Array.isArray(response.data)) {
        const workers = response.data.map((worker: {id: number, name: string, department: string, role?: Record<string, unknown>}) => ({
          id: worker.id.toString(),
          name: worker.name
        }));
        setWorkers(workers);
        
        // Extract unique departments - handle role being object or string
        const uniqueDepartments = [...new Set(response.data.map((worker: {department: string, role?: Record<string, unknown>}) => {
          if (typeof worker.role === 'object' && worker.role && 'position_name' in worker.role) {
            return worker.role.position_name as string;
          }
          return worker.department || 'Unknown';
        }))];
        setDepartments(uniqueDepartments.filter(Boolean));
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

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Functions removed as they are not used with biometric data

  // Calendar and chart views disabled for biometric data
  // const calendarData: Record<string, unknown>[] = [];
  // const chartData: Record<string, unknown>[] = [];

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
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
              Worker
            </label>
            <select
              value={filters.workerId}
              onChange={(e) => handleFilterChange('workerId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Workers</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>{worker.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Department
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
              <option value="">All Departments</option>
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
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search workers..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`w-full px-4 py-2 pl-10 border rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Date Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilters(prev => ({ ...prev, startDate: today, endDate: today }));
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const dateStr = yesterday.toISOString().split('T')[0];
              setFilters(prev => ({ ...prev, startDate: dateStr, endDate: dateStr }));
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Yesterday
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              const weekEnd = new Date();
              setFilters(prev => ({ 
                ...prev, 
                startDate: weekStart.toISOString().split('T')[0], 
                endDate: weekEnd.toISOString().split('T')[0] 
              }));
            }}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const monthEnd = new Date();
              setFilters(prev => ({ 
                ...prev, 
                startDate: monthStart.toISOString().split('T')[0], 
                endDate: monthEnd.toISOString().split('T')[0] 
              }));
            }}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            This Month
          </button>
        </div>

        {/* Status Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('status', 'present')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.status === 'present' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => handleFilterChange('status', 'absent')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.status === 'absent' 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => handleFilterChange('status', 'late')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.status === 'late' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Late
          </button>
          <button
            onClick={() => handleFilterChange('status', '')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.status === '' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Statuses
          </button>
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Worker
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Day
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.date')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Action
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Verification
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Punch Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Terminal
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {attendance.length > 0 ? (
                  attendance
                    .filter(record => {
                      // Search filter
                      if (filters.search && !record.worker_name.toLowerCase().includes(filters.search.toLowerCase()) && 
                          !(record.employee_code && record.employee_code.toLowerCase().includes(filters.search.toLowerCase()))) {
                        return false;
                      }
                      
                      // Status filter
                      if (filters.status) {
                        if (filters.status === 'present' && record.punch_state !== 0) return false;
                        if (filters.status === 'absent' && record.punch_state === 0) return false;
                        if (filters.status === 'late' && !record.is_late) return false;
                      }
                      
                      return true;
                    })
                    .sort((a, b) => {
                      if (filters.sortBy === 'date_desc') {
                        return new Date(b.punch_time).getTime() - new Date(a.punch_time).getTime();
                      } else if (filters.sortBy === 'date_asc') {
                        return new Date(a.punch_time).getTime() - new Date(b.punch_time).getTime();
                      } else if (filters.sortBy === 'name') {
                        return a.worker_name.localeCompare(b.worker_name);
                      }
                      return 0;
                    })
                    .map((record) => (
                    <tr key={record.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div>
                          <div className="font-medium">{record.worker_name}</div>
                          <div className="text-xs opacity-75">{record.employee_code || 'N/A'}</div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="capitalize">{record.day_of_week}</span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {record.punch_state === 0 ? 
                            <CheckCircle size={16} className="text-green-600" /> : 
                            <XCircle size={16} className="text-red-600" />
                          }
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            record.punch_state === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.punch_state_display}
                          </span>
                          {record.is_late && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Late
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {record.time}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="capitalize">
                          {record.verification_type || t('attendance.notAvailable')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(record.punch_time).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="truncate max-w-32">
                          {record.terminal_alias || t('attendance.notAvailable')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className={`flex flex-col items-center space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock size={48} className="opacity-50" />
                        <div>
                          <h3 className="text-lg font-medium">No Attendance Records Found</h3>
                          <p className="text-sm">Try adjusting your filters or date range to see attendance data.</p>
                        </div>
                        <button
                          onClick={syncBiometricData}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Sync Attendance Data
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar and Chart views are disabled for biometric data */}
      {filters.view === 'calendar' && (
        <div className={`rounded-xl shadow-sm border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <Clock size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Calendar View Coming Soon
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Calendar view for biometric attendance data will be available in a future update.
          </p>
        </div>
      )}

      {filters.view === 'chart' && (
        <div className={`rounded-xl shadow-sm border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <TrendingUp size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Charts Coming Soon
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Chart visualization for biometric attendance data will be available in a future update.
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendance;