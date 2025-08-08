import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, CheckCircle, AlertTriangle, XCircle,
  Search, Filter, Eye, Download,
  BarChart3, TrendingUp, Target, Star,
  Clock, Users, Package, Shield,
  Calendar, Camera, FileText, Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface QualityCheck {
  id: string;
  orderId: string;
  workerName: string;
  checkDate: string;
  checkType: 'initial' | 'intermediate' | 'final';
  status: 'passed' | 'failed' | 'requires_attention';
  score: number;
  inspector: string;
  notes: string;
  images?: string[];
}

interface QualityMetric {
  id: string;
  name: string;
  category: string;
  target: number;
  current: number;
  trend: 'up' | 'down' | 'stable';
}

const QualityControl: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'metrics' | 'reports' | 'settings'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const qualityChecks: QualityCheck[] = [
    {
      id: 'qc-001',
      orderId: 'ORD-2025-001',
      workerName: 'Ahmed Ali',
      checkDate: '2025-01-15T10:30:00Z',
      checkType: 'final',
      status: 'passed',
      score: 95,
      inspector: 'Quality Manager',
      notes: 'Excellent stitching quality, perfect measurements'
    },
    {
      id: 'qc-002',
      orderId: 'ORD-2025-002',
      workerName: 'Fatima Hassan',
      checkDate: '2025-01-15T09:45:00Z',
      checkType: 'intermediate',
      status: 'requires_attention',
      score: 78,
      inspector: 'Senior Inspector',
      notes: 'Button alignment needs adjustment'
    },
    {
      id: 'qc-003',
      orderId: 'ORD-2025-003',
      workerName: 'Mohammed Saleh',
      checkDate: '2025-01-14T16:20:00Z',
      checkType: 'initial',
      status: 'failed',
      score: 65,
      inspector: 'Quality Manager',
      notes: 'Fabric pattern mismatch, requires rework'
    },
    {
      id: 'qc-004',
      orderId: 'ORD-2025-004',
      workerName: 'Aisha Abdullah',
      checkDate: '2025-01-14T14:15:00Z',
      checkType: 'final',
      status: 'passed',
      score: 92,
      inspector: 'Senior Inspector',
      notes: 'Good quality overall, minor finishing touches needed'
    }
  ];

  const qualityMetrics: QualityMetric[] = [
    {
      id: 'metric-001',
      name: 'Overall Quality Score',
      category: 'General',
      target: 90,
      current: 87.5,
      trend: 'up'
    },
    {
      id: 'metric-002',
      name: 'First Pass Rate',
      category: 'Efficiency',
      target: 85,
      current: 82.3,
      trend: 'stable'
    },
    {
      id: 'metric-003',
      name: 'Rework Rate',
      category: 'Efficiency',
      target: 10,
      current: 12.8,
      trend: 'down'
    },
    {
      id: 'metric-004',
      name: 'Customer Satisfaction',
      category: 'Customer',
      target: 95,
      current: 93.2,
      trend: 'up'
    },
    {
      id: 'metric-005',
      name: 'Defect Rate',
      category: 'Quality',
      target: 5,
      current: 3.8,
      trend: 'up'
    },
    {
      id: 'metric-006',
      name: 'On-Time Delivery',
      category: 'Delivery',
      target: 98,
      current: 96.5,
      trend: 'stable'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'requires_attention':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} />;
      case 'failed':
        return <XCircle size={16} />;
      case 'requires_attention':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getCheckTypeColor = (type: string) => {
    switch (type) {
      case 'initial':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'final':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'down':
        return <TrendingUp size={16} className="text-red-600 transform rotate-180" />;
      case 'stable':
        return <Target size={16} className="text-blue-600" />;
      default:
        return <Target size={16} className="text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = {
    totalInspections: 156,
    passedInspections: 128,
    averageScore: 87.5,
    improvementRate: 12.3
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
            <Award className="h-8 w-8 text-green-600" />
            Quality Control
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Monitor and maintain quality standards across all productions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
          
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { 
            label: 'Total Inspections', 
            value: stats.totalInspections.toString(), 
            icon: <Eye size={24} />, 
            color: 'blue',
            change: '+18 this week'
          },
          { 
            label: 'Passed Rate', 
            value: `${Math.round((stats.passedInspections / stats.totalInspections) * 100)}%`, 
            icon: <CheckCircle size={24} />, 
            color: 'green',
            change: '+5% vs last week'
          },
          { 
            label: 'Average Score', 
            value: `${stats.averageScore.toFixed(1)}`, 
            icon: <Star size={24} />, 
            color: 'purple',
            change: '+2.3 improvement'
          },
          { 
            label: 'Quality Growth', 
            value: `+${stats.improvementRate}%`, 
            icon: <TrendingUp size={24} />, 
            color: 'orange',
            change: 'monthly improvement'
          }
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
              <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b" style={{ borderColor: 'var(--border-color)' }}
      >
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
            { id: 'inspections', label: 'Inspections', icon: <Eye size={16} /> },
            { id: 'metrics', label: 'Metrics', icon: <Target size={16} /> },
            { id: 'reports', label: 'Reports', icon: <FileText size={16} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ 
                color: activeTab === tab.id ? '#16a34a' : 'var(--text-secondary)' 
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quality Score Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Quality Metrics Overview
                </h3>
                <div className="space-y-4">
                  {qualityMetrics.slice(0, 4).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(metric.trend)}
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {metric.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {metric.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {metric.current}%
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Target: {metric.target}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Recent Inspections
                </h3>
                <div className="space-y-3">
                  {qualityChecks.slice(0, 5).map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(check.status)}`}>
                          {getStatusIcon(check.status)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {check.orderId}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {check.workerName} • {check.inspector}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(check.score)}`}>
                          {check.score}%
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCheckTypeColor(check.checkType)}`}>
                          {check.checkType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality Trends Chart */}
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Quality Score Trends
              </h3>
              <div className="h-64 flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Quality trends chart would be displayed here
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="requires_attention">Requires Attention</option>
              </select>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Types</option>
                <option value="initial">Initial</option>
                <option value="intermediate">Intermediate</option>
                <option value="final">Final</option>
              </select>
            </div>

            {/* Inspections Table */}
            <div className="rounded-xl border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Worker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Inspector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                    {qualityChecks.map((check) => (
                      <tr key={check.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {check.orderId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {check.workerName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCheckTypeColor(check.checkType)}`}>
                            {check.checkType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                            {getStatusIcon(check.status)}
                            {check.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-bold ${getScoreColor(check.score)}`}>
                              {check.score}%
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  check.score >= 90 ? 'bg-green-500' : 
                                  check.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${check.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {check.inspector}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(check.checkDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-700">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-700">
                              <Camera size={16} />
                            </button>
                            <button className="text-purple-600 hover:text-purple-700">
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualityMetrics.map((metric) => (
                <div key={metric.id} className="rounded-xl border p-6"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(metric.trend)}
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {metric.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {metric.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Current
                      </span>
                      <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {metric.current}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.current >= metric.target ? 'bg-green-500' : 
                          metric.current >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Target: {metric.target}%
                      </span>
                      <span className={`font-medium ${
                        metric.current >= metric.target ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.current >= metric.target ? 'On Target' : 'Below Target'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              Quality Reports
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Daily Quality Report',
                  description: 'Comprehensive daily quality metrics and inspection results',
                  icon: <Calendar size={24} />,
                  color: 'blue'
                },
                {
                  title: 'Worker Performance Report',
                  description: 'Individual worker quality scores and improvement areas',
                  icon: <Users size={24} />,
                  color: 'green'
                },
                {
                  title: 'Defect Analysis Report',
                  description: 'Analysis of common defects and root causes',
                  icon: <AlertTriangle size={24} />,
                  color: 'red'
                },
                {
                  title: 'Customer Feedback Report',
                  description: 'Quality-related customer feedback and satisfaction scores',
                  icon: <Star size={24} />,
                  color: 'purple'
                },
                {
                  title: 'Trend Analysis Report',
                  description: 'Long-term quality trends and improvement opportunities',
                  icon: <TrendingUp size={24} />,
                  color: 'orange'
                },
                {
                  title: 'Process Improvement Report',
                  description: 'Recommendations for process improvements and quality enhancements',
                  icon: <Target size={24} />,
                  color: 'teal'
                }
              ].map((report, index) => (
                <div key={index} className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${report.color}-100 text-${report.color}-600`}>
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {report.title}
                      </h4>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download size={16} />
                    Generate Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Quality Standards
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Minimum Pass Score
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      defaultValue="75"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>60%</span>
                      <span>75%</span>
                      <span>95%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Default Inspector
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}>
                      <option value="quality_manager">Quality Manager</option>
                      <option value="senior_inspector">Senior Inspector</option>
                      <option value="lead_tailor">Lead Tailor</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Mandatory final inspection', value: true, description: 'Require final quality check for all orders' },
                      { label: 'Photo documentation', value: true, description: 'Require photos for failed inspections' },
                      { label: 'Customer feedback integration', value: false, description: 'Include customer feedback in quality scores' },
                      { label: 'Auto-rework assignment', value: true, description: 'Automatically assign rework for failed items' }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {setting.label}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {setting.description}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={setting.value}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          onChange={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Inspection Checklists
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Men\'s Suit Checklist', items: 15, updated: '2025-01-10' },
                    { name: 'Women\'s Dress Checklist', items: 12, updated: '2025-01-08' },
                    { name: 'Shirt & Blouse Checklist', items: 8, updated: '2025-01-05' },
                    { name: 'Alterations Checklist', items: 6, updated: '2025-01-03' }
                  ].map((checklist, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {checklist.name}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {checklist.items} items • Updated {checklist.updated}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Edit
                      </button>
                    </div>
                  ))}
                  
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
                    <Plus size={16} />
                    Add New Checklist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QualityControl;