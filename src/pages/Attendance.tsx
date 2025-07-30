import React, { useState, useEffect, useContext } from 'react';
import { Clock, Users, CheckCircle, XCircle, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import AttendanceFilter from '../components/attendance/AttendanceFilter';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import AttendanceChart from '../components/attendance/AttendanceChart';

interface AttendanceRecord {
  id: number;
  worker_id: number;
  worker: {
    id: number;
    name: string;
    role: string;
    department: string;
  };
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: number;
  status: string;
  device_id: string | null;
  punch_state: string | null;
  verification_type: string | null;
  terminal_alias: string | null;
  biometric_transaction_id: string | null;
}

interface AttendanceStats {
  totalWorkers: number;
  presentToday: number;
  absentToday: number;
  totalHours: number;
  lateToday: number;
  averageHoursPerDay: number;
  attendanceRate: number;
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
    totalWorkers: 0,
    presentToday: 0,
    absentToday: 0,
    totalHours: 0,
    lateToday: 0,
    averageHoursPerDay: 0,
    attendanceRate: 0
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
      
      // In a real implementation, this would be an API call
      // For now, we'll simulate with mock data
      setTimeout(() => {
        const mockAttendance: AttendanceRecord[] = [
          {
            id: 1,
            worker_id: 1,
            worker: { id: 1, name: 'Youssef', role: 'Tailor', department: 'Production' },
            attendance_date: '2025-07-30',
            check_in_time: '09:00',
            check_out_time: '17:00',
            total_hours: 8,
            status: 'present',
            device_id: 'ZKTeco-001',
            punch_state: 'in',
            verification_type: 'fingerprint',
            terminal_alias: 'Main Entrance',
            biometric_transaction_id: '12345'
          },
          {
            id: 2,
            worker_id: 2,
            worker: { id: 2, name: 'Mohammed', role: 'Cutter', department: 'Production' },
            attendance_date: '2025-07-30',
            check_in_time: '08:45',
            check_out_time: '17:30',
            total_hours: 8.75,
            status: 'present',
            device_id: 'ZKTeco-002',
            punch_state: 'in',
            verification_type: 'fingerprint',
            terminal_alias: 'Main Entrance',
            biometric_transaction_id: '12346'
          },
          {
            id: 3,
            worker_id: 3,
            worker: { id: 3, name: 'Ahmed', role: 'Finisher', department: 'Quality Control' },
            attendance_date: '2025-07-30',
            check_in_time: null,
            check_out_time: null,
            total_hours: 0,
            status: 'absent',
            device_id: null,
            punch_state: null,
            verification_type: null,
            terminal_alias: null,
            biometric_transaction_id: null
          },
          {
            id: 4,
            worker_id: 4,
            worker: { id: 4, name: 'Sara', role: 'Designer', department: 'Design' },
            attendance_date: '2025-07-30',
            check_in_time: '09:15',
            check_out_time: '17:00',
            total_hours: 7.75,
            status: 'late',
            device_id: 'ZKTeco-001',
            punch_state: 'in',
            verification_type: 'fingerprint',
            terminal_alias: 'Main Entrance',
            biometric_transaction_id: '12347'
          },
          {
            id: 5,
            worker_id: 5,
            worker: { id: 5, name: 'Fatima', role: 'Supervisor', department: 'Management' },
            attendance_date: '2025-07-30',
            check_in_time: '08:30',
            check_out_time: '18:00',
            total_hours: 9.5,
            status: 'present',
            device_id: 'ZKTeco-002',
            punch_state: 'in',
            verification_type: 'fingerprint',
            terminal_alias: 'Main Entrance',
            biometric_transaction_id: '12348'
          }
        ];

        setAttendance(mockAttendance);
        
        // Calculate stats
        setStats({
          totalWorkers: 5,
          presentToday: 3,
          absentToday: 1,
          lateToday: 1,
          totalHours: mockAttendance.reduce((sum, record) => sum + record.total_hours, 0),
          averageHoursPerDay: mockAttendance.filter(r => r.total_hours > 0).reduce((sum, record) => sum + record.total_hours, 0) / 
                             mockAttendance.filter(r => r.total_hours > 0).length,
          attendanceRate: (3 / 5) * 100 // (present / total) * 100
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    // In a real implementation, this would be an API call
    const mockWorkers = [
      { id: '1', name: 'Youssef' },
      { id: '2', name: 'Mohammed' },
      { id: '3', name: 'Ahmed' },
      { id: '4', name: 'Sara' },
      { id: '5', name: 'Fatima' }
    ];
    
    const mockDepartments = ['Production', 'Quality Control', 'Design', 'Management'];
    
    setWorkers(mockWorkers);
    setDepartments(mockDepartments);
  };

  const syncBiometricData = async () => {
    try {
      setSyncing(true);
      
      // In a real implementation, this would call the biometric sync endpoint
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        loadAttendanceData();
        setSyncing(false);
      }, 2000);
    } catch (error) {
      console.error('Error syncing biometric data:', error);
      setSyncing(false);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewChange = (view: 'table' | 'calendar' | 'chart') => {
    setFilters(prev => ({ ...prev, view }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'half_day': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} className="text-green-600" />;
      case 'absent': return <XCircle size={16} className="text-red-600" />;
      case 'late': return <Clock size={16} className="text-yellow-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  // Prepare data for calendar view
  const calendarData = workers.map(worker => {
    const workerAttendance = attendance.filter(a => a.worker_id === parseInt(worker.id));
    
    return {
      workerId: parseInt(worker.id),
      workerName: worker.name,
      days: workerAttendance.map(a => ({
        date: a.attendance_date,
        status: a.status as any,
        checkIn: a.check_in_time,
        checkOut: a.check_out_time,
        totalHours: a.total_hours
      }))
    };
  });

  // Prepare data for chart view
  const chartData = workers.map(worker => {
    const workerAttendance = attendance.filter(a => a.worker_id === parseInt(worker.id));
    
    return {
      name: worker.name,
      present: workerAttendance.filter(a => a.status === 'present').length,
      absent: workerAttendance.filter(a => a.status === 'absent').length,
      late: workerAttendance.filter(a => a.status === 'late').length,
      totalHours: workerAttendance.reduce((sum, a) => sum + a.total_hours, 0)
    };
  });

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
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendance.presentToday')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.presentToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendance.absentToday')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.absentToday}</p>
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
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours.toFixed(1)}h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendance.attendanceRate')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.attendanceRate.toFixed(0)}%</p>
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
                    {t('attendance.worker')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.department')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.date')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.status')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.checkIn')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.checkOut')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.totalHours')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    {t('attendance.device')}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {attendance.map((record) => (
                  <tr key={record.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      <div>
                        <div className="font-medium">{record.worker.name}</div>
                        <div className="text-xs">{record.worker.role}</div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.worker.department}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.attendance_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {t(`attendance.${record.status}`)}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.check_in_time || t('attendance.notAvailable')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.check_out_time || t('attendance.notAvailable')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {record.total_hours}h
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {record.device_id || t('attendance.notAvailable')}
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