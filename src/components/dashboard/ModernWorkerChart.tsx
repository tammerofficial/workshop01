import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Award, TrendingUp } from 'lucide-react';
import { mockWorkers } from '../../data/mockData';

// Extract top 5 workers by efficiency for the chart
const performanceData = mockWorkers
  .sort((a, b) => b.performance.efficiency - a.performance.efficiency)
  .slice(0, 5)
  .map(worker => ({
    name: worker.name.split(' ')[0], // Just the first name for cleaner display
    efficiency: worker.performance.efficiency,
    completed: worker.performance.completedTasks,
  }));

const ModernWorkerChart: React.FC = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Efficiency:</span>
              <span className="font-medium text-gray-900">{payload[0]?.value}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="font-medium text-gray-900">{payload[0]?.payload?.completed} tasks</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
              <p className="text-sm text-gray-500">Worker efficiency rankings</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <TrendingUp size={14} />
            <span className="font-medium">+12% this week</span>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 20,
              }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={false} 
                domain={[60, 100]}
                tickFormatter={value => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="efficiency"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Performance Badges */}
        <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center space-x-2 text-sm">
            <Award size={16} className="text-yellow-500" />
            <span className="text-gray-600">Top Performer:</span>
            <span className="font-medium text-gray-900">{performanceData[0]?.name}</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="text-sm text-gray-600">
            Avg Efficiency: <span className="font-medium text-gray-900">
              {Math.round(performanceData.reduce((acc, worker) => acc + worker.efficiency, 0) / performanceData.length)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModernWorkerChart;