import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Coins,
  TrendingUp,
  Award,
  Star,
  ArrowRight,
  Gift
} from 'lucide-react';
import { loyaltyService } from '../../api/laravel';

interface LoyaltyStats {
  summary: {
    total_customers: number;
    total_points_issued: number;
    available_points: number;
    total_spent: number;
    average_points_per_customer: number;
  };
  tier_distribution: Record<string, number>;
}

interface LoyaltyDashboardCardProps {
  onViewDetails?: () => void;
}

const LoyaltyDashboardCard: React.FC<LoyaltyDashboardCardProps> = ({ onViewDetails }) => {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await loyaltyService.getStatistics();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading loyalty stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    vip: '#9B59B6'
  };

  const tierNames = {
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    vip: 'VIP'
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'vip': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="text-center text-gray-500 dark:text-gray-400">
          خطأ في تحميل بيانات نظام الولاء
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                 p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              نظام الولاء
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              إدارة عملاء الولاء والنقاط
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewDetails}
          className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </motion.button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.summary.total_customers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">عملاء الولاء</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {(stats.summary.available_points / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">نقاط متاحة</p>
            </div>
            <Coins className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.summary.total_spent.toFixed(0)} د.ك
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">إجمالي المبيعات</p>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.summary.average_points_per_customer}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">متوسط النقاط</p>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          توزيع المستويات
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(stats.tier_distribution).map(([tier, count]) => (
            <motion.div
              key={tier}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg"
            >
              <div style={{ color: tierColors[tier as keyof typeof tierColors] }}>
                {getTierIcon(tier)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tierNames[tier as keyof typeof tierNames]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg font-medium"
          >
            إضافة عميل
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium"
          >
            نقاط مكافأة
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default LoyaltyDashboardCard;