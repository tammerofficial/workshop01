import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Star, Gift, Trophy, CreditCard, Users, TrendingUp,
  Award, Zap, Calendar, DollarSign, Target, Crown,
  Plus, Edit, Eye, Download, Send, Settings
} from 'lucide-react';
import laravel from '../../api/laravel';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface LoyaltyAnalytics {
  overview: {
    total_customers: number;
    active_loyalty_customers: number;
    total_points_in_circulation: number;
    total_value_in_circulation: number;
  };
  period_stats: {
    points_earned: number;
    points_redeemed: number;
    value_redeemed: number;
    new_customers_joined: number;
  };
  tier_distribution: { [key: string]: number };
  redemption_types: Array<{
    redemption_type: string;
    count: number;
    total_value: number;
  }>;
  top_earners: Array<{
    customer: {
      id: number;
      name: string;
      email: string;
    };
    total_earned: number;
  }>;
  campaign_performance: Array<{
    id: number;
    name: string;
    usage_count: number;
    points_distributed: number;
  }>;
}

interface LoyaltyTier {
  id: number;
  name: string;
  name_ar: string;
  level: number;
  min_spending_amount: number;
  points_multiplier: number;
  benefits: string[];
  badge_color: string;
  is_active: boolean;
}

interface LoyaltyCampaign {
  id: number;
  name: string;
  name_ar: string;
  type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  current_uses: number;
  total_uses_limit: number;
}

const AdvancedLoyaltyDashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [analytics, setAnalytics] = useState<LoyaltyAnalytics | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [campaigns, setCampaigns] = useState<LoyaltyCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'campaigns' | 'analytics' | 'cards'>('overview');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  useEffect(() => {
    fetchLoyaltyData();
  }, [selectedPeriod]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, tiersRes, campaignsRes] = await Promise.allSettled([
        laravel.get(`/api/loyalty/advanced/analytics?period=${selectedPeriod}`),
        laravel.get('/api/loyalty/advanced/tiers'),
        laravel.get('/api/loyalty/campaigns')
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
        setAnalytics(analyticsRes.value.data.data);
      }
      
      if (tiersRes.status === 'fulfilled' && tiersRes.value.data.success) {
        setTiers(tiersRes.value.data.data);
      }
      
      if (campaignsRes.status === 'fulfilled' && campaignsRes.value.data.success) {
        setCampaigns(campaignsRes.value.data.data);
      }

    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(3)} ${isRTL ? 'د.ك' : 'KWD'}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-KW' : 'en-US').format(num);
  };

  const getTierColor = (level: number) => {
    const colors = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2', '#50C878'];
    return colors[level - 1] || '#808080';
  };

  const getTierIcon = (level: number) => {
    switch (level) {
      case 1: return <Award className="h-5 w-5" />;
      case 2: return <Star className="h-5 w-5" />;
      case 3: return <Trophy className="h-5 w-5" />;
      case 4: return <Crown className="h-5 w-5" />;
      case 5: return <Zap className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getCampaignTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'bonus_points': isRTL ? 'نقاط إضافية' : 'Bonus Points',
      'double_points': isRTL ? 'نقاط مضاعفة' : 'Double Points',
      'cashback': isRTL ? 'استرداد نقدي' : 'Cashback',
      'free_shipping': isRTL ? 'شحن مجاني' : 'Free Shipping',
      'early_access': isRTL ? 'وصول مبكر' : 'Early Access'
    };
    return typeMap[type] || type;
  };

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'نظام الولاء المتقدم' : 'Advanced Loyalty System'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? 'إدارة شاملة لبرنامج ولاء العملاء' : 'Comprehensive customer loyalty program management'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</option>
              <option value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</option>
              <option value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</option>
              <option value="year">{isRTL ? 'هذا العام' : 'This Year'}</option>
            </select>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'حملة جديدة' : 'New Campaign'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: Star },
              { id: 'tiers', label: isRTL ? 'مستويات الولاء' : 'Loyalty Tiers', icon: Trophy },
              { id: 'campaigns', label: isRTL ? 'الحملات' : 'Campaigns', icon: Gift },
              { id: 'analytics', label: isRTL ? 'التحليلات' : 'Analytics', icon: TrendingUp },
              { id: 'cards', label: isRTL ? 'البطاقات الرقمية' : 'Digital Cards', icon: CreditCard }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'إجمالي العملاء' : 'Total Customers'}
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatNumber(analytics.overview.total_customers)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'عملاء الولاء النشطون' : 'Active Loyalty Members'}
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatNumber(analytics.overview.active_loyalty_customers)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'النقاط المتداولة' : 'Points in Circulation'}
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatNumber(analytics.overview.total_points_in_circulation)}
                    </p>
                  </div>
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'قيمة النقاط' : 'Points Value'}
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {formatCurrency(analytics.overview.total_value_in_circulation)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Period Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'نقاط مكتسبة' : 'Points Earned'}
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(analytics.period_stats.points_earned)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isRTL ? 'هذه الفترة' : 'This period'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'نقاط مستبدلة' : 'Points Redeemed'}
                </h4>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(analytics.period_stats.points_redeemed)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isRTL ? 'هذه الفترة' : 'This period'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'قيمة الاستبدال' : 'Value Redeemed'}
                </h4>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analytics.period_stats.value_redeemed)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isRTL ? 'هذه الفترة' : 'This period'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {isRTL ? 'عملاء جدد' : 'New Members'}
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(analytics.period_stats.new_customers_joined)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isRTL ? 'هذه الفترة' : 'This period'}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tier Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'توزيع مستويات الولاء' : 'Loyalty Tier Distribution'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.tier_distribution).map(([tier, count]) => ({
                        name: tier,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {Object.entries(analytics.tier_distribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Earners */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isRTL ? 'أعلى كاسبي النقاط' : 'Top Point Earners'}
                </h3>
                <div className="space-y-3">
                  {analytics.top_earners.slice(0, 5).map((earner, index) => (
                    <div key={earner.customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{earner.customer.name}</p>
                          <p className="text-sm text-gray-600">{earner.customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{formatNumber(earner.total_earned)}</p>
                        <p className="text-sm text-gray-600">{isRTL ? 'نقطة' : 'points'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Redemption Types */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'أنواع الاستبدال' : 'Redemption Types'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.redemption_types}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="redemption_type" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'total_value' ? formatCurrency(value) : formatNumber(value)
                  } />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name={isRTL ? 'العدد' : 'Count'} />
                  <Bar dataKey="total_value" fill="#10B981" name={isRTL ? 'القيمة' : 'Value'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isRTL ? 'مستويات الولاء' : 'Loyalty Tiers'}
              </h2>
              <button 
                onClick={() => setShowTierModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'مستوى جديد' : 'New Tier'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div 
                  key={tier.id} 
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                  style={{ borderTop: `4px solid ${getTierColor(tier.level)}` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div style={{ color: getTierColor(tier.level) }}>
                        {getTierIcon(tier.level)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isRTL ? tier.name_ar : tier.name}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {isRTL ? 'المستوى' : 'Level'} {tier.level}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'الحد الأدنى للإنفاق' : 'Minimum Spending'}
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(tier.min_spending_amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'مضاعف النقاط' : 'Points Multiplier'}
                      </p>
                      <p className="font-bold text-green-600">
                        {tier.points_multiplier}x
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {isRTL ? 'المزايا' : 'Benefits'}
                      </p>
                      <div className="space-y-1">
                        {tier.benefits.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {benefit}
                          </div>
                        ))}
                        {tier.benefits.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{tier.benefits.length - 3} {isRTL ? 'مزايا أخرى' : 'more benefits'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 text-sm flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {isRTL ? 'عرض' : 'View'}
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 text-sm flex items-center justify-center">
                      <Edit className="h-4 w-4 mr-1" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isRTL ? 'حملات الولاء' : 'Loyalty Campaigns'}
              </h2>
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'حملة جديدة' : 'New Campaign'}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'اسم الحملة' : 'Campaign Name'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'النوع' : 'Type'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الفترة' : 'Period'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الاستخدام' : 'Usage'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {isRTL ? campaign.name_ar : campaign.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.type === 'bonus_points' ? 'bg-blue-100 text-blue-800' :
                            campaign.type === 'double_points' ? 'bg-green-100 text-green-800' :
                            campaign.type === 'cashback' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getCampaignTypeText(campaign.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{new Date(campaign.start_date).toLocaleDateString()}</div>
                            <div className="text-gray-500">
                              {isRTL ? 'إلى' : 'to'} {new Date(campaign.end_date).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${campaign.total_uses_limit ? 
                                    (campaign.current_uses / campaign.total_uses_limit) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {campaign.current_uses}/{campaign.total_uses_limit || '∞'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {campaign.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Send className="h-4 w-4" />
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

        {/* Digital Cards Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isRTL ? 'البطاقات الرقمية' : 'Digital Loyalty Cards'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isRTL ? 'إدارة البطاقات الرقمية لـ Apple Wallet و Google Pay' : 'Manage digital cards for Apple Wallet and Google Pay'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Apple Wallet</h4>
                    <div className="bg-white rounded-lg p-2">
                      <Download className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">
                    {isRTL ? 'بطاقات ولاء متزامنة مع Apple Wallet' : 'Synchronized loyalty cards for Apple Wallet'}
                  </p>
                  <button className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">
                    {isRTL ? 'إنشاء بطاقة' : 'Generate Card'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Google Pay</h4>
                    <div className="bg-white rounded-lg p-2">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-blue-100 mb-4">
                    {isRTL ? 'بطاقات ولاء لمنصة Google Pay' : 'Loyalty cards for Google Pay platform'}
                  </p>
                  <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">
                    {isRTL ? 'إنشاء بطاقة' : 'Generate Card'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedLoyaltyDashboard;