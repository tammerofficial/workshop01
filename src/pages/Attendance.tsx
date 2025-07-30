import React, { useState, useEffect, useContext } from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import AttendanceFilter from '../components/attendance/AttendanceFilter';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import AttendanceChart from '../components/attendance/AttendanceChart';
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
  biometric_data: Record<string, any>;
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
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
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
    sortBy: 'date_desc',
    view: 'table' as 'table' | 'calendar' | 'chart'
  });

  useEffect(() => {
    loadAttendanceData();
    loadWorkers();
  }, [filters.startDate, filters.endDate, filters.workerId]);

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
      const response = await biometricService.getBiometricWorkers();
      
      if (response.data && Array.isArray(response.data)) {
        const workers = response.data.map((worker: {id: number, name: string, department: string}) => ({
          id: worker.id.toString(),
          name: worker.name
        }));
        setWorkers(workers);
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(response.data.map((worker: {department: string}) => worker.department))];
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

  const handleViewChange = (view: 'table' | 'calendar' | 'chart') => {
    setFilters(prev => ({ ...prev, view }));
  };

  // Functions removed as they are not used with biometric data

  // Simplified data for biometric attendance (table view only for now)
  const calendarData: any[] = []; // Disabled calendar view for biometric data
  const chartData: any[] = []; // Disabled chart view for biometric data

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

      {/* Filters */}
      <AttendanceFilter
        filters={filters}
        departments={departments}
        workers={workers}
        onFilterChange={handleFilterChange}
        onViewChange={handleViewChange}
        t={t}
      />

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
                {attendance.map((record) => (
                  <tr key={record.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      <div>
                        <div className="font-medium">{record.worker_name}</div>
                        <div className="text-xs">{record.employee_code || 'N/A'}</div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.day_of_week}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {record.punch_state === 0 ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.time}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.verification_type || t('attendance.notAvailable')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(record.punch_time).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.terminal_alias || t('attendance.notAvailable')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filters.view === 'calendar' && (
        <AttendanceCalendar
          month={calendarMonth}
          onChangeMonth={setCalendarMonth}
          data={calendarData}
          t={t}
        />
      )}

      {filters.view === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart
            data={chartData}
            type="status"
            t={t}
          />
          <AttendanceChart
            data={chartData}
            type="hours"
            t={t}
          />
        </div>
      )}
    </div>
  );
};

export default Attendance;