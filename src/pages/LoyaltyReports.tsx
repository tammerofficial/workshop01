import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Calendar,
  Filter,
  FileText,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import laravel from '../api/laravel';

interface ReportData {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    customers_count: number;
    orders_count: number;
    total_revenue: number;
    avg_order_value: number;
    points_earned: number;
    points_redeemed: number;
    active_customers: number;
  };
  top_customers: Array<{
    name: string;
    tier_name: string;
    total_points: number;
    period_revenue: number;
  }>;
  tier_analysis: Array<{
    tier: string;
    customers_count: number;
    avg_points: number;
    avg_spent: number;
    total_revenue: number;
  }>;
}

interface ROIData {
  financial_metrics: {
    loyalty_revenue: number;
    regular_revenue: number;
    total_revenue: number;
    redemption_cost: number;
    net_benefit: number;
    roi_percentage: number;
    revenue_increase_percentage: number;
  };
  customer_metrics: {
    total_customers: number;
    loyalty_customers: number;
    loyalty_penetration_percentage: number;
    avg_loyalty_customer_value: number;
    avg_regular_customer_value: number;
    customer_value_lift: number;
  };
}

const LoyaltyReports: React.FC = () => {
  const [salesData, setSalesData] = useState<ReportData | null>(null);
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const [salesResponse, roiResponse] = await Promise.all([
        laravel.get('/loyalty-reports/sales-loyalty', { params: dateRange }),
        laravel.get('/loyalty-reports/roi', { params: dateRange })
      ]);

      setSalesData(salesResponse.data.data);
      setRoiData(roiResponse.data.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      vip: '#9B59B6'
    };
    return colors[tier as keyof typeof colors] || '#6B7280';
  };

  const getTierName = (tier: string) => {
    const names = {
      bronze: 'برونزي',
      silver: 'فضي', 
      gold: 'ذهبي',
      vip: 'VIP'
    };
    return names[tier as keyof typeof names] || tier;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            تقارير نظام الولاء
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            تحليل شامل للمبيعات والولاء والعائد على الاستثمار
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            تصدير
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'sales', label: 'المبيعات والولاء', icon: BarChart3 },
            { id: 'roi', label: 'العائد على الاستثمار', icon: TrendingUp },
            { id: 'performance', label: 'أداء العملاء', icon: Users },
            { id: 'transactions', label: 'تفاصيل المعاملات', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sales & Loyalty Tab */}
      {activeTab === 'sales' && salesData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {salesData.summary.total_revenue.toFixed(3)} د.ك
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عملاء الولاء</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {salesData.summary.customers_count}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عدد الطلبات</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {salesData.summary.orders_count}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">متوسط قيمة الطلب</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {salesData.summary.avg_order_value.toFixed(3)} د.ك
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </motion.div>
          </div>

          {/* Top Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                أفضل عملاء الولاء
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      المستوى
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      النقاط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      إيرادات الفترة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {salesData.top_customers.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: getTierColor(customer.tier_name) }}
                        >
                          {getTierName(customer.tier_name)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.total_points.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.period_revenue.toFixed(3)} د.ك
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Tier Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              تحليل المستويات
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {salesData.tier_analysis.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 border-2 rounded-lg"
                  style={{ borderColor: getTierColor(tier.tier) }}
                >
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getTierColor(tier.tier) + '20' }}
                    >
                      <Users 
                        className="h-6 w-6"
                        style={{ color: getTierColor(tier.tier) }}
                      />
                    </div>
                    
                    <h4 
                      className="font-semibold mb-2"
                      style={{ color: getTierColor(tier.tier) }}
                    >
                      {getTierName(tier.tier)}
                    </h4>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        {tier.customers_count} عميل
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tier.avg_points.toFixed(0)} نقطة متوسط
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tier.avg_spent.toFixed(3)} د.ك متوسط إنفاق
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {tier.total_revenue.toFixed(3)} د.ك إيرادات
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ROI Tab */}
      {activeTab === 'roi' && roiData && (
        <div className="space-y-6">
          {/* Financial Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              المؤشرات المالية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-green-600">
                  {roiData.financial_metrics.roi_percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">العائد على الاستثمار</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-blue-600">
                  {roiData.financial_metrics.revenue_increase_percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">زيادة الإيرادات</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Target className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-purple-600">
                  {roiData.financial_metrics.net_benefit.toFixed(3)} د.ك
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">صافي الفائدة</p>
              </div>
            </div>
          </motion.div>

          {/* Revenue Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              مقارنة الإيرادات
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">عملاء الولاء</h4>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {roiData.financial_metrics.loyalty_revenue.toFixed(3)} د.ك
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {roiData.customer_metrics.loyalty_customers} عميل
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  متوسط: {roiData.customer_metrics.avg_loyalty_customer_value.toFixed(3)} د.ك
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">العملاء العاديين</h4>
                <p className="text-3xl font-bold text-gray-600 mb-2">
                  {roiData.financial_metrics.regular_revenue.toFixed(3)} د.ك
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {roiData.customer_metrics.total_customers - roiData.customer_metrics.loyalty_customers} عميل
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  متوسط: {roiData.customer_metrics.avg_regular_customer_value.toFixed(3)} د.ك
                </p>
              </div>
            </div>
          </motion.div>

          {/* Customer Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              مؤشرات العملاء
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">اختراق نظام الولاء</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {roiData.customer_metrics.loyalty_penetration_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${roiData.customer_metrics.loyalty_penetration_percentage}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {roiData.customer_metrics.loyalty_customers} من أصل {roiData.customer_metrics.total_customers} عميل
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {roiData.customer_metrics.customer_value_lift.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  زيادة قيمة العميل
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Other tabs can be implemented similarly */}
      {activeTab !== 'sales' && activeTab !== 'roi' && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-lg text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            قريباً
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            هذا التقرير قيد التطوير
          </p>
        </div>
      )}
    </div>
  );
};

export default LoyaltyReports;