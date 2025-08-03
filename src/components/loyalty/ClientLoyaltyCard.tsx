import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Star, 
  Coins, 
  Gift, 
  Plus, 
  TrendingUp,
  Calendar,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { loyaltyService } from '../../api/laravel';

interface LoyaltyData {
  has_loyalty: boolean;
  customer_info?: {
    membership_number: string;
    tier: string;
    tier_name: string;
    tier_color: string;
    total_points: number;
    available_points: number;
    total_spent: number;
    total_orders: number;
    expiring_points: number;
    next_tier?: string;
    points_to_next_tier: number;
  };
  statistics?: {
    total_earned: number;
    total_redeemed: number;
    current_value: number;
  };
}

interface ClientLoyaltyCardProps {
  clientId: number;
  clientName: string;
  onCreateAccount?: () => void;
  onViewDetails?: () => void;
}

const ClientLoyaltyCard: React.FC<ClientLoyaltyCardProps> = ({
  clientId,
  clientName,
  onCreateAccount,
  onViewDetails
}) => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
  }, [clientId]);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      const response = await loyaltyService.getCustomerSummary(clientId);
      setLoyaltyData(response.data.data);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      setLoyaltyData({ has_loyalty: false });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      await loyaltyService.createAccount(clientId);
      setShowCreateModal(false);
      loadLoyaltyData();
      onCreateAccount?.();
    } catch (error) {
      console.error('Error creating loyalty account:', error);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="h-5 w-5" />;
      case 'silver': return <Award className="h-5 w-5" />;
      case 'gold': return <Award className="h-5 w-5" />;
      case 'vip': return <Star className="h-5 w-5" />;
      default: return <Award className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!loyaltyData?.has_loyalty) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                   p-6 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-700"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            لا يوجد حساب ولاء
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            قم بإنشاء حساب ولاء لـ {clientName} للاستفادة من النقاط والمكافآت
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            إنشاء حساب ولاء
          </motion.button>
        </div>

        {/* Create Account Confirmation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                تأكيد إنشاء حساب ولاء
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                هل تريد إنشاء حساب ولاء جديد للعميل {clientName}؟
                سيحصل على نقاط ترحيب عند الإنشاء.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
                >
                  إنشاء الحساب
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  const { customer_info, statistics } = loyaltyData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {getTierIcon(customer_info!.tier)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">حساب الولاء</h3>
              <p className="text-blue-100 text-sm">
                {customer_info!.membership_number}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span 
                className="font-medium"
                style={{ color: customer_info!.tier_color }}
              >
                {customer_info!.tier_name}
              </span>
              <div style={{ color: customer_info!.tier_color }}>
                {getTierIcon(customer_info!.tier)}
              </div>
            </div>
            {customer_info!.tier === 'vip' && (
              <div className="flex items-center justify-end">
                <Star className="h-4 w-4 text-yellow-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Coins className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {customer_info!.available_points.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">نقاط متاحة</p>
            <p className="text-xs text-green-600">
              القيمة: {statistics!.current_value.toFixed(3)} د.ك
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {customer_info!.total_points.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي النقاط</p>
            <p className="text-xs text-blue-600">
              +{statistics!.total_earned.toLocaleString()} مكتسب
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <CreditCard className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المصروف</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {customer_info!.total_spent.toFixed(3)} د.ك
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {customer_info!.total_orders}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">عدد الطلبات</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {customer_info!.total_orders} طلب
              </p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {customer_info!.next_tier && customer_info!.points_to_next_tier > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                للوصول للمستوى التالي
              </span>
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                {customer_info!.points_to_next_tier} نقطة
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.max(10, (customer_info!.total_points / (customer_info!.total_points + customer_info!.points_to_next_tier)) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Expiring Points Warning */}
        {customer_info!.expiring_points > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              <p className="text-red-800 dark:text-red-200 text-sm">
                <span className="font-medium">{customer_info!.expiring_points}</span> نقطة ستنتهي صلاحيتها قريباً
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewDetails}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm"
          >
            عرض التفاصيل
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg"
          >
            <Smartphone className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientLoyaltyCard;