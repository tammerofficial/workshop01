import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Users, CheckCircle, XCircle, Calendar, 
  TrendingUp, Filter, Search, Download, RefreshCw,
  ChevronLeft, ChevronRight, Fingerprint, Smartphone,
  AlertCircle, BarChart3, User
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import * as biometricService from '../api/biometric';
import TransactionManagement from '../components/biometric/TransactionManagement';

interface BiometricAttendance {
  id: number;
  worker_id: number;
  worker_name: string;
  employee_code?: string;
  punch_time: string;
  punch_state: number;
  punch_state_display: string;
  verification_type?: string;
  terminal_alias?: string;
  department?: string;
  position?: string;
  date: string;
  time: string;
  photo_url?: string;
}

interface AttendanceStats {
  total_records: number;
  total_workers: number;
  total_days: number;
  total_hours: number;
  check_ins: number;
  check_outs: number;
  late_arrivals: number;
}

interface Worker {
  id: number;
  name: string;
  department?: string;
}

const Attendance: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useContext(LanguageContext)!;
  
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<BiometricAttendance[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  
  const [stats, setStats] = useState<AttendanceStats>({
    total_records: 0,
    total_workers: 0,
    total_days: 0,
    total_hours: 0,
    check_ins: 0,
    check_outs: 0,
    late_arrivals: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0
  });

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [filters, setFilters] = useState({
    workerId: '',
    status: '',
    department: '',
    search: '',
    sortBy: 'date_desc',
    view: 'table' as 'table' | 'calendar' | 'chart'
  });

  // Handle filter changes and reset pagination
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    loadAttendanceData();
    loadWorkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, filters.workerId, filters.department, filters.status, pagination.currentPage]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      const params = {
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate }),
        worker_id: filters.workerId || undefined,
        page: pagination.currentPage,
        page_size: pagination.pageSize
      };
      
      const response = await biometricService.getBiometricAttendance(params);
      
      if (response.data.success) {
        setAttendance(response.data.data);
        setStats(response.data.stats);
        if(response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.current_page,
            totalPages: response.data.pagination.total_pages,
            pageSize: response.data.pagination.page_size,
            totalRecords: response.data.pagination.total_records
          });
        }
      } else {
        setAttendance([]);
        setStats({
          total_records: 0,
          total_workers: 0,
          total_days: 0,
          total_hours: 0,
          check_ins: 0,
          check_outs: 0,
          late_arrivals: 0
        });
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await biometricService.getBiometricWorkers();
      if (response.data.success) {
        setWorkers(response.data.data);
        
        // Extract unique departments
        const uniqueDepts = [...new Set(response.data.data
          .map((w: Worker) => w.department)
          .filter((d: string | undefined) => d)
        )] as string[];
        setDepartments(uniqueDepts);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const handleRefresh = () => {
    loadAttendanceData();
  };

  const handleExport = async () => {
    try {
      const response = await biometricService.exportAttendance({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        format: 'excel'
      });
      
      // Handle file download
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const getPunchStateColor = (state: number) => {
    switch (state) {
      case 0: return 'text-green-600 bg-green-100';
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-orange-600 bg-orange-100';
      case 4: return 'text-purple-600 bg-purple-100';
      case 5: return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationIcon = (type?: string) => {
    switch (type) {
      case 'Fingerprint': return <Fingerprint size={16} />;
      case 'Face': return <User size={16} />;
      case 'Card': return <Smartphone size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Filter attendance based on search
  const filteredAttendance = attendance.filter(record => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return record.worker_name.toLowerCase().includes(searchLower) ||
             record.employee_code?.toLowerCase().includes(searchLower) ||
             record.department?.toLowerCase().includes(searchLower);
    }
    return true;
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('attendance.title')} ⏰
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('attendance.subtitle')}
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransactions(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Fingerprint size={20} />
            <span>Manage Transactions</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendance.totalWorkers')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total_workers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('attendance.checkIns')}</p>
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
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
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
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              setDateRange({ startDate: today, endDate: today });
              setPagination(prev => ({ ...prev, currentPage: 1 }));
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
              setDateRange({ startDate: dateStr, endDate: dateStr });
              setPagination(prev => ({ ...prev, currentPage: 1 }));
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
              setDateRange({ 
                startDate: weekStart.toISOString().split('T')[0], 
                endDate: weekEnd.toISOString().split('T')[0] 
              });
              setPagination(prev => ({ ...prev, currentPage: 1 }));
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
              setDateRange({ 
                startDate: monthStart.toISOString().split('T')[0], 
                endDate: monthEnd.toISOString().split('T')[0] 
              });
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => {
              setDateRange({ startDate: '', endDate: '' });
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
          >
            All Records
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
            All Status
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      {filters.view === 'table' && (
      <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Attendance Records
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
                  Date & Time
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Action
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Verification
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Terminal
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={48} className={`mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No attendance records found
                      </p>
                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredAttendance.map((record) => (
                <tr key={record.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {record.photo_url ? (
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={record.photo_url} 
                            alt={record.worker_name} 
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <User size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">{record.worker_name}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {record.employee_code} • {record.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <div>
                      <div>{record.date}</div>
                      <div className="text-xs">{record.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPunchStateColor(record.punch_state)}`}>
                      {record.punch_state_display}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <div className="flex items-center space-x-1">
                      {getVerificationIcon(record.verification_type)}
                      <span>{record.verification_type || 'N/A'}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {record.terminal_alias || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        className={`text-blue-600 hover:text-blue-800 ${isDark ? 'hover:text-blue-400' : ''}`}
                        onClick={() => console.log('View details:', record.id)}
                      >
                        View
                      </button>
                      <button
                        className={`text-red-600 hover:text-red-800 ${isDark ? 'hover:text-red-400' : ''}`}
                        onClick={() => console.log('Delete:', record.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</span> of <span className="font-medium">{pagination.totalRecords}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
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
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Calendar and Chart views are disabled for biometric data */}
      {filters.view === 'calendar' && (
        <div className={`rounded-xl shadow-sm border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <Clock size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Calendar view is not available for biometric data
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please use the table view to see attendance records
          </p>
        </div>
      )}

      {filters.view === 'chart' && (
        <div className={`rounded-xl shadow-sm border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <BarChart3 size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Chart view is coming soon
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            We're working on beautiful visualizations for your attendance data
          </p>
        </div>
      )}

      {/* Transaction Management Modal */}
      <AnimatePresence>
        {showTransactions && (
          <TransactionManagement 
            onClose={() => setShowTransactions(false)}
            onUpdate={loadAttendanceData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;