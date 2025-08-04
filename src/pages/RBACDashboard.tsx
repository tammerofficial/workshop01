import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye,
  TrendingUp,
  BarChart3,
  Clock,
  Download,
  RefreshCw,
  UserCheck,
  FileText,
  Bell,
  Zap,
  Crown
} from 'lucide-react';
import { rbacApi } from '../api/laravel';

interface OverviewStats {
  total_users: number;
  active_users: number;
  total_roles: number;
  system_roles: number;
  total_permissions: number;
  security_events_today: number;
  failed_permissions_today: number;
}

interface SecurityAlert {
  id: number;
  event_type: string;
  severity: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  event_data: any;
}

interface DashboardData {
  overview: OverviewStats;
  security_alerts: {
    critical_events: SecurityAlert[];
    alerts_count: number;
    patterns: any;
  };
  recent_activities: any[];
  permission_usage: {
    top_permissions: any[];
    hourly_usage: any;
  };
  role_distribution: {
    roles: any[];
    departments: any;
  };
  audit_summary: any;
}

const RBACDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'security' | 'audit' | 'reports'>('overview');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await rbacApi.getRBACDashboard();
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    bgGradient?: string;
  }> = ({ title, value, icon, trend, color, bgGradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
        bgGradient || 'bg-white'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-5" />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <div className={`p-3 rounded-xl bg-${color}-100 bg-opacity-80`}>
                {icon}
              </div>
              {trend && (
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  trend > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
            {trend && (
              <p className="text-xs text-gray-500">
                {trend > 0 ? 'زيادة' : 'نقصان'} خلال الأسبوع الماضي
              </p>
            )}
          </div>
        </div>
      </div>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500 opacity-10 rounded-full -mr-10 -mt-10`} />
    </motion.div>
  );

  const SecurityEventCard: React.FC<{ event: SecurityAlert }> = ({ event }) => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return 'text-red-700 bg-red-50 border-red-200';
        case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
        case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        default: return 'text-blue-700 bg-blue-50 border-blue-200';
      }
    };

    const getSeverityIcon = (severity: string) => {
      switch (severity) {
        case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'high': return <Zap className="w-5 h-5 text-orange-500" />;
        case 'medium': return <Bell className="w-5 h-5 text-yellow-500" />;
        default: return <Eye className="w-5 h-5 text-blue-500" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-3 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                {event.severity.toUpperCase()}
              </span>
              <span className="mr-3 text-sm font-medium text-gray-700">
                {event.event_type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-800 mb-2 font-medium">
              {event.user ? `المستخدم: ${event.user.name}` : 'نشاط نظام'}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(event.created_at).toLocaleString('ar-SA')}
            </div>
          </div>
          <div className="mr-4">
            {getSeverityIcon(event.severity)}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  لوحة تحكم الأمان والصلاحيات
                </h1>
                <p className="text-sm text-gray-500">
                  مراقبة وإدارة أمان النظام في الوقت الفعلي
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                تصدير التقرير
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 space-x-reverse">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3, color: 'blue' },
              { id: 'security', label: 'الأمان', icon: Shield, color: 'red' },
              { id: 'audit', label: 'المراجعة', icon: Eye, color: 'green' },
              { id: 'reports', label: 'التقارير', icon: FileText, color: 'purple' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'overview' | 'security' | 'audit' | 'reports')}
                whileHover={{ y: -2 }}
                className={`relative flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? `text-${tab.color}-600 bg-${tab.color}-50`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
                {selectedTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-400 rounded-t-full`}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Enhanced Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="إجمالي المستخدمين"
                value={dashboardData.overview.total_users}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="blue"
                trend={5}
                bgGradient="bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard
                title="المستخدمون النشطون"
                value={dashboardData.overview.active_users}
                icon={<UserCheck className="w-6 h-6 text-green-600" />}
                color="green"
                trend={12}
                bgGradient="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                title="إجمالي الأدوار"
                value={dashboardData.overview.total_roles}
                icon={<Crown className="w-6 h-6 text-purple-600" />}
                color="purple"
                trend={-2}
                bgGradient="bg-gradient-to-br from-purple-50 to-purple-100"
              />
              <StatCard
                title="الصلاحيات المرفوضة اليوم"
                value={dashboardData.overview.failed_permissions_today}
                icon={<Lock className="w-6 h-6 text-red-600" />}
                color="red"
                trend={-8}
                bgGradient="bg-gradient-to-br from-red-50 to-red-100"
              />
            </div>

            {/* Enhanced Security Alerts and Role Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Security Alerts */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    التنبيهات الأمنية الحرجة
                  </h2>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {dashboardData.security_alerts.critical_events.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.security_alerts.critical_events.map((event) => (
                        <SecurityEventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد تنبيهات حرجة</h3>
                      <p className="text-gray-500">النظام يعمل بأمان تام</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Enhanced Role Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-6 h-6 mr-3" />
                    توزيع الأدوار
                  </h2>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {dashboardData.role_distribution.roles.map((role, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
                            role.hierarchy_level === 0 ? 'from-purple-500 to-pink-500' :
                            role.hierarchy_level <= 2 ? 'from-blue-500 to-cyan-500' :
                            role.hierarchy_level <= 4 ? 'from-green-500 to-teal-500' :
                            'from-yellow-500 to-orange-500'
                          } flex items-center justify-center`}>
                            {role.hierarchy_level === 0 ? <Crown className="w-5 h-5 text-white" /> :
                             role.hierarchy_level <= 2 ? <Shield className="w-5 h-5 text-white" /> :
                             role.hierarchy_level <= 4 ? <Users className="w-5 h-5 text-white" /> :
                             <UserCheck className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{role.display_name}</p>
                            <p className="text-sm text-gray-500">المستوى: {role.hierarchy_level}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                            {role.users_count} مستخدم
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Activity className="w-6 h-6 mr-3" />
                  الأنشطة الأخيرة
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {dashboardData.recent_activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.severity === 'high' ? 'bg-red-100' :
                          activity.severity === 'medium' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          {activity.severity === 'high' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                           activity.severity === 'medium' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                           <Activity className="w-5 h-5 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">{activity.description}</p>
                          <p className="text-sm text-gray-500 mb-2">بواسطة: {activity.causer}</p>
                          <p className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(activity.created_at).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                          activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {activity.event}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">قسم الأمان</h3>
              <p className="text-gray-500 mb-6">
                سيتم تطوير هذا القسم قريباً لعرض تفاصيل أمنية متقدمة ومراقبة النظام
              </p>
              <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>قيد التطوير</span>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">قسم المراجعة</h3>
              <p className="text-gray-500 mb-6">
                سيتم تطوير هذا القسم قريباً لعرض سجلات المراجعة وتتبع الأنشطة
              </p>
              <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>قيد التطوير</span>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">قسم التقارير</h3>
              <p className="text-gray-500 mb-6">
                سيتم تطوير هذا القسم قريباً لتوليد وتصدير التقارير الأمنية
              </p>
              <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>قيد التطوير</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RBACDashboard;