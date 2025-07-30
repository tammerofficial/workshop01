import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceChartProps {
  data: {
    name: string;
    present: number;
    absent: number;
    late: number;
    totalHours: number;
  }[];
  type: 'status' | 'hours';
  t: (key: string) => string;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data, type, t }) => {
  // For status chart (present, absent, late)
  const renderStatusChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'present') return [value, t('attendance.present')];
            if (name === 'absent') return [value, t('attendance.absent')];
            if (name === 'late') return [value, t('attendance.late')];
            return [value, name];
          }}
        />
        <Legend 
          formatter={(value) => {
            if (value === 'present') return t('attendance.present');
            if (value === 'absent') return t('attendance.absent');
            if (value === 'late') return t('attendance.late');
            return value;
          }}
        />
        <Bar dataKey="present" fill="#10B981" />
        <Bar dataKey="absent" fill="#EF4444" />
        <Bar dataKey="late" fill="#F59E0B" />
      </BarChart>
    </ResponsiveContainer>
  );

  // For hours chart (total hours worked)
  const renderHoursChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'totalHours') return [`${value} ${t('attendance.hours')}`, t('attendance.totalHours')];
            return [value, name];
          }}
        />
        <Legend 
          formatter={(value) => {
            if (value === 'totalHours') return t('attendance.totalHours');
            return value;
          }}
        />
        <Bar dataKey="totalHours" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {type === 'status' ? t('attendance.statusChart') : t('attendance.hoursChart')}
      </h3>
      {type === 'status' ? renderStatusChart() : renderHoursChart()}
    </div>
  );
};

export default AttendanceChart;