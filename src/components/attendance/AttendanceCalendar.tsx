import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'late' | 'weekend' | 'holiday' | 'half_day';
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
}

interface WorkerAttendance {
  workerId: number;
  workerName: string;
  days: AttendanceDay[];
}

interface AttendanceCalendarProps {
  month: Date;
  onChangeMonth: (date: Date) => void;
  data: WorkerAttendance[];
  t: (key: string) => string;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ month, onChangeMonth, data, t }) => {
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDayOfMonth = getFirstDayOfMonth(year, monthIndex);
  
  // Generate days array with empty slots for proper alignment
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty slots for days before the 1st of month
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  // Get month name
  const monthNames = [
    t('calendar.january'), t('calendar.february'), t('calendar.march'),
    t('calendar.april'), t('calendar.may'), t('calendar.june'),
    t('calendar.july'), t('calendar.august'), t('calendar.september'),
    t('calendar.october'), t('calendar.november'), t('calendar.december')
  ];
  
  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 border-green-300';
      case 'absent': return 'bg-red-100 border-red-300';
      case 'late': return 'bg-yellow-100 border-yellow-300';
      case 'weekend': return 'bg-gray-100 border-gray-300';
      case 'holiday': return 'bg-blue-100 border-blue-300';
      case 'half_day': return 'bg-orange-100 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };
  
  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
      case 'absent': return <div className="h-2 w-2 rounded-full bg-red-500"></div>;
      case 'late': return <div className="h-2 w-2 rounded-full bg-yellow-500"></div>;
      case 'weekend': return <div className="h-2 w-2 rounded-full bg-gray-500"></div>;
      case 'holiday': return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
      case 'half_day': return <div className="h-2 w-2 rounded-full bg-orange-500"></div>;
      default: return null;
    }
  };
  
  // Helper to get attendance for a specific day
  const getAttendanceForDay = (workerId: number, day: number) => {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const worker = data.find(w => w.workerId === workerId);
    if (!worker) return null;
    
    return worker.days.find(d => d.date === dateStr) || null;
  };
  
  // Previous month
  const handlePrevMonth = () => {
    const prevMonth = new Date(year, monthIndex - 1, 1);
    onChangeMonth(prevMonth);
  };
  
  // Next month
  const handleNextMonth = () => {
    const nextMonth = new Date(year, monthIndex + 1, 1);
    onChangeMonth(nextMonth);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[monthIndex]} {year}
          </h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => onChangeMonth(new Date())}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            {t('attendance.today')}
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {[t('calendar.sun'), t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat')].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Workers and their attendance */}
        {data.map(worker => (
          <div key={worker.workerId} className="mb-6">
            <div className="flex items-center mb-2 bg-gray-50 p-2 rounded-md">
              <User className="h-5 w-5 text-gray-600 mr-2" />
              <span className="font-medium text-gray-800">{worker.workerName}</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-14 border border-transparent"></div>;
                }
                
                const attendance = getAttendanceForDay(worker.workerId, day);
                const isWeekend = (index % 7 === 0 || index % 7 === 6); // Sunday or Saturday
                const status = attendance?.status || (isWeekend ? 'weekend' : '');
                
                return (
                  <div 
                    key={`${worker.workerId}-${day}`} 
                    className={`h-14 p-1 border rounded-md ${getStatusColor(status)}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium">{day}</span>
                      {getStatusIcon(status)}
                    </div>
                    
                    {attendance?.checkIn && (
                      <div className="mt-1 flex items-center">
                        <Clock className="h-3 w-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-600">{attendance.checkIn}</span>
                      </div>
                    )}
                    
                    {attendance?.totalHours !== undefined && (
                      <div className="mt-1">
                        <span className="text-xs font-medium">{attendance.totalHours}h</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceCalendar;