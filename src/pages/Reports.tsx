import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, BarChart3, PieChart, TrendingUp, 
  Calendar, Download, Filter, Eye, 
  DollarSign, Users, Package, Clock,
  Activity, Award, Target, Zap
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  badge?: string;
  stats?: {
    total: number;
    period: string;
  };
}

const Reports: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reportCategories: ReportCard[] = [
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Comprehensive business analytics and insights',
      icon: <BarChart3 size={24} />,
      path: '/reports/analytics',
      color: 'blue',
      badge: 'Hot',
      stats: { total: 25, period: 'This Month' }
    },
    {
      id: 'production',
      title: 'Production Reports',
      description: 'Manufacturing and production performance metrics',
      icon: <Activity size={24} />,
      path: '/production-tracking',
      color: 'green',
      badge: 'New',
      stats: { total: 18, period: 'Active Projects' }
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      description: 'Revenue, expenses, and financial performance',
      icon: <DollarSign size={24} />,
      path: '/invoices',
      color: 'purple',
      stats: { total: 12, period: 'Monthly Reports' }
    },
    {
      id: 'inventory',
      title: 'Inventory Reports',
      description: 'Stock levels, movements, and inventory analytics',
      icon: <Package size={24} />,
      path: '/inventory',
      color: 'orange',
      stats: { total: 8, period: 'Categories' }
    },
    {
      id: 'workers',
      title: 'Worker Performance',
      description: 'Employee productivity and performance metrics',
      icon: <Users size={24} />,
      path: '/workers',
      color: 'teal',
      stats: { total: 45, period: 'Active Workers' }
    },
    {
      id: 'quality',
      title: 'Quality Control',
      description: 'Quality metrics and control reports',
      icon: <Award size={24} />,
      path: '/quality-control',
      color: 'indigo',
      badge: 'New',
      stats: { total: 96, period: 'Quality Score' }
    },
    {
      id: 'attendance',
      title: 'Attendance Reports',
      description: 'Employee attendance and time tracking',
      icon: <Clock size={24} />,
      path: '/attendance',
      color: 'pink',
      stats: { total: 98, period: 'Attendance Rate' }
    },
    {
      id: 'sales',
      title: 'Sales Reports',
      description: 'Sales performance and customer analytics',
      icon: <TrendingUp size={24} />,
      path: '/sales',
      color: 'cyan',
      stats: { total: 156, period: 'Sales This Month' }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      teal: 'from-teal-500 to-teal-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600',
      cyan: 'from-cyan-500 to-cyan-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"
            style={{ color: 'var(--text-primary)' }}>
            <FileText className="h-8 w-8 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive business reports and analytics dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={20} />
            Export All
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Reports', value: '156', change: '+12%', color: 'blue' },
          { label: 'Active Projects', value: '24', change: '+8%', color: 'green' },
          { label: 'Completed Orders', value: '89', change: '+15%', color: 'purple' },
          { label: 'Revenue Growth', value: '34%', change: '+5%', color: 'orange' }
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(stat.color)}`}>
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
                vs last period
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Report Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {reportCategories.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link to={report.path}>
              <div
                className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(report.color)}`}>
                    <div className="text-white">
                      {report.icon}
                    </div>
                  </div>
                  {report.badge && (
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      report.badge === 'Hot' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.badge}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {report.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {report.description}
                </p>
                
                {report.stats && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {report.stats.total}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {report.stats.period}
                      </p>
                    </div>
                    <Eye size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-semibold flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
            <Activity size={20} />
            Recent Report Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'Financial Report', time: '2 hours ago', user: 'Admin User', status: 'Generated' },
              { type: 'Production Analysis', time: '5 hours ago', user: 'Manager', status: 'Downloaded' },
              { type: 'Worker Performance', time: '1 day ago', user: 'HR Manager', status: 'Exported' },
              { type: 'Inventory Report', time: '2 days ago', user: 'Inventory Manager', status: 'Shared' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {activity.type}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {activity.time} • by {activity.user}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;