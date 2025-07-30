import React from 'react';
import { Filter, Search, Calendar, User, ArrowDownUp } from 'lucide-react';

interface AttendanceFilterProps {
  filters: {
    startDate: string;
    endDate: string;
    workerId: string;
    status: string;
    department: string;
    sortBy: string;
    view: 'table' | 'calendar' | 'chart';
  };
  departments: string[];
  workers: { id: string; name: string }[];
  onFilterChange: (name: string, value: string) => void;
  onViewChange: (view: 'table' | 'calendar' | 'chart') => void;
  t: (key: string) => string;
}

const AttendanceFilter: React.FC<AttendanceFilterProps> = ({ 
  filters, 
  departments, 
  workers, 
  onFilterChange, 
  onViewChange,
  t 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{t('attendance.filters')}</h3>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onViewChange('table')}
            className={`p-2 rounded-md ${filters.view === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title={t('attendance.tableView')}
          >
            <ArrowDownUp className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onViewChange('calendar')}
            className={`p-2 rounded-md ${filters.view === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title={t('attendance.calendarView')}
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onViewChange('chart')}
            className={`p-2 rounded-md ${filters.view === 'chart' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title={t('attendance.chartView')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="8" x2="9" y2="21" />
              <line x1="15" y1="8" x2="15" y2="21" />
              <line x1="3" y1="14" x2="21" y2="14" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('attendance.dateRange')}</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <span className="flex items-center text-gray-500">-</span>
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Worker Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('attendance.worker')}</label>
          <select
            value={filters.workerId}
            onChange={(e) => onFilterChange('workerId', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">{t('attendance.allWorkers')}</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('attendance.department')}</label>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">{t('attendance.allDepartments')}</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('attendance.status')}</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">{t('attendance.allStatuses')}</option>
            <option value="present">{t('attendance.present')}</option>
            <option value="absent">{t('attendance.absent')}</option>
            <option value="late">{t('attendance.late')}</option>
            <option value="half_day">{t('attendance.halfDay')}</option>
          </select>
        </div>
        
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('attendance.sortBy')}</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="date_desc">{t('attendance.dateDesc')}</option>
            <option value="date_asc">{t('attendance.dateAsc')}</option>
            <option value="name_asc">{t('attendance.nameAsc')}</option>
            <option value="name_desc">{t('attendance.nameDesc')}</option>
            <option value="hours_desc">{t('attendance.hoursDesc')}</option>
            <option value="hours_asc">{t('attendance.hoursAsc')}</option>
          </select>
        </div>
        
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('attendance.search')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('attendance.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button 
          onClick={() => {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            onFilterChange('startDate', formattedDate);
            onFilterChange('endDate', formattedDate);
          }}
          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
        >
          {t('attendance.today')}
        </button>
        <button 
          onClick={() => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const formattedDate = yesterday.toISOString().split('T')[0];
            onFilterChange('startDate', formattedDate);
            onFilterChange('endDate', formattedDate);
          }}
          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
        >
          {t('attendance.yesterday')}
        </button>
        <button 
          onClick={() => {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(today);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            onFilterChange('startDate', startOfWeek.toISOString().split('T')[0]);
            onFilterChange('endDate', endOfWeek.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
        >
          {t('attendance.thisWeek')}
        </button>
        <button 
          onClick={() => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            onFilterChange('startDate', startOfMonth.toISOString().split('T')[0]);
            onFilterChange('endDate', endOfMonth.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
        >
          {t('attendance.thisMonth')}
        </button>
        <button 
          onClick={() => {
            onFilterChange('status', 'present');
          }}
          className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-full hover:bg-green-100"
        >
          {t('attendance.present')}
        </button>
        <button 
          onClick={() => {
            onFilterChange('status', 'absent');
          }}
          className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-full hover:bg-red-100"
        >
          {t('attendance.absent')}
        </button>
        <button 
          onClick={() => {
            onFilterChange('status', 'late');
          }}
          className="px-3 py-1 text-xs bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100"
        >
          {t('attendance.late')}
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilter;