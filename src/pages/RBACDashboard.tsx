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
  MapPin,
  Download,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL, rbacApi } from '../api/laravel';

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
  }> = ({ title, value, icon, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend > 0 ? '+' : ''}{trend}% هذا الأسبوع
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const SecurityEventCard: React.FC<{ event: SecurityAlert }> = ({ event }) => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return 'text-red-600 bg-red-100';
        case 'high': return 'text-orange-600 bg-orange-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-blue-600 bg-blue-100';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                {event.severity.toUpperCase()}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                {event.event_type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-800 mb-1">
              {event.user ? `المستخدم: ${event.user.name}` : 'نشاط نظام'}
            </p>
            <p className="text-xs text-gray-500">
              <Clock className="w-3 h-3 inline mr-1" />
              {new Date(event.created_at).toLocaleString('ar-SA')}
            </p>
          </div>
          <AlertTriangle className={`w-5 h-5 ${event.severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              لوحة تحكم الأمان والصلاحيات
            </h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                تصدير تقرير
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 space-x-reverse">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'security', label: 'الأمان', icon: Shield },
              { id: 'audit', label: 'المراجعة', icon: Eye },
              { id: 'reports', label: 'التقارير', icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="إجمالي المستخدمين"
                value={dashboardData.overview.total_users}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="blue"
              />
              <StatCard
                title="المستخدمين النشطين"
                value={dashboardData.overview.active_users}
                icon={<Activity className="w-6 h-6 text-green-600" />}
                color="green"
              />
              <StatCard
                title="إجمالي الأدوار"
                value={dashboardData.overview.total_roles}
                icon={<Shield className="w-6 h-6 text-purple-600" />}
                color="purple"
              />
              <StatCard
                title="الصلاحيات المرفوضة اليوم"
                value={dashboardData.overview.failed_permissions_today}
                icon={<Lock className="w-6 h-6 text-red-600" />}
                color="red"
              />
            </div>

            {/* Security Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  التنبيهات الأمنية الحرجة
                </h2>
                <div className="space-y-3">
                  {dashboardData.security_alerts.critical_events.length > 0 ? (
                    dashboardData.security_alerts.critical_events.map((event) => (
                      <SecurityEventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 text-center">لا توجد تنبيهات حرجة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Role Distribution */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  توزيع الأدوار
                </h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="space-y-4">
                    {dashboardData.role_distribution.roles.map((role, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{role.display_name}</p>
                          <p className="text-sm text-gray-500">المستوى: {role.hierarchy_level}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {role.users_count} مستخدم
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 text-green-500 mr-2" />
                الأنشطة الأخيرة
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {dashboardData.recent_activities.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">بواسطة: {activity.causer}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                            activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.event}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'security' && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">قسم الأمان</h3>
            <p className="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
          </div>
        )}

        {selectedTab === 'audit' && (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">قسم المراجعة</h3>
            <p className="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
          </div>
        )}

        {selectedTab === 'reports' && (
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">قسم التقارير</h3>
            <p className="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RBACDashboard;