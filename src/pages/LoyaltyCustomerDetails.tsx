import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Award,
  Star,
  Coins,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  Gift,
  Phone,
  Mail,
  MapPin,
  Plus,
  Minus,
  Download,
  Smartphone
} from 'lucide-react';
import { laravel } from '../api/laravel';

interface CustomerInfo {
  membership_number: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  tier_name: string;
  tier_color: string;
  total_points: number;
  available_points: number;
  total_spent: number;
  total_orders: number;
  member_since: string;
  last_purchase: string;
  expiring_points: number;
  next_tier: string;
  points_to_next_tier: number;
}

interface Transaction {
  id: number;
  type: string;
  type_label: string;
  points: string;
  amount: string;
  description: string;
  date: string;
  expires_at?: string;
  reference_number: string;
}

interface CustomerSummary {
  has_loyalty: boolean;
  customer_info: CustomerInfo;
  statistics: {
    total_earned: number;
    total_redeemed: number;
    total_expired: number;
    current_value: number;
  };
  recent_transactions: Transaction[];
}

const LoyaltyCustomerDetails: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [pointsAmount, setPointsAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const response = await laravel.get(`/loyalty/customers/${customerId}/summary`);
      setCustomerData(response.data.data);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async () => {
    try {
      await laravel.post('/loyalty/points/add-bonus', {
        client_id: customerId,
        points: parseInt(pointsAmount),
        description: description || 'نقاط مكافأة'
      });
      
      setShowAddPointsModal(false);
      setPointsAmount('');
      setDescription('');
      loadCustomerData();
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const handleRedeemPoints = async () => {
    try {
      await laravel.post('/loyalty/points/redeem', {
        client_id: customerId,
        points: parseInt(pointsAmount),
        description: description || 'استخدام نقاط'
      });
      
      setShowRedeemModal(false);
      setPointsAmount('');
      setDescription('');
      loadCustomerData();
    } catch (error) {
      console.error('Error redeeming points:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'redeemed': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'expired': return <Calendar className="h-5 w-5 text-gray-500" />;
      case 'bonus': return <Gift className="h-5 w-5 text-purple-500" />;
      default: return <Coins className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customerData || !customerData.has_loyalty) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            العميل غير موجود في نظام الولاء
          </h2>
          <button
            onClick={() => navigate('/loyalty/customers')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  const { customer_info, statistics, recent_transactions } = customerData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/loyalty/customers')}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {customer_info.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              رقم العضوية: {customer_info.membership_number}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddPointsModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة نقاط
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRedeemModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Minus className="h-4 w-4" />
            استخدام نقاط
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Apple Wallet
          </motion.button>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6" style={{ color: customer_info.tier_color }} />
              <span className="font-medium" style={{ color: customer_info.tier_color }}>
                {customer_info.tier_name}
              </span>
            </div>
            {customer_info.tier === 'vip' && <Star className="h-5 w-5 text-yellow-500" />}
          </div>
          
          {customer_info.next_tier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  للمستوى التالي
                </span>
                <span className="font-medium">
                  {customer_info.points_to_next_tier} نقطة
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.max(10, (customer_info.total_points / (customer_info.total_points + customer_info.points_to_next_tier)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Available Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">النقاط المتاحة</p>
              <p className="text-2xl font-bold text-green-600">
                {customer_info.available_points.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                القيمة: {statistics.current_value.toFixed(3)} د.ك
              </p>
            </div>
            <Coins className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        {/* Total Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي النقاط</p>
              <p className="text-2xl font-bold text-blue-600">
                {customer_info.total_points.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">
                +{statistics.total_earned.toLocaleString()} مكتسب
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المصروف</p>
              <p className="text-2xl font-bold text-purple-600">
                {customer_info.total_spent.toFixed(3)} د.ك
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {customer_info.total_orders} طلب
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Customer Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          معلومات العميل
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {customer_info.email || 'غير محدد'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">رقم الهاتف</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {customer_info.phone || 'غير محدد'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">عضو منذ</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {customer_info.member_since ? new Date(customer_info.member_since).toLocaleDateString('ar') : 'غير محدد'}
              </p>
            </div>
          </div>
        </div>

        {customer_info.expiring_points > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                تنبيه: {customer_info.expiring_points} نقطة ستنتهي صلاحيتها خلال 30 يوماً
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          إحصائيات النقاط
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {statistics.total_earned.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">نقاط مكتسبة</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">
              {statistics.total_redeemed.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">نقاط مستخدمة</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">
              {statistics.total_expired.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">نقاط منتهية</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {statistics.current_value.toFixed(3)} د.ك
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">القيمة الحالية</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            آخر المعاملات
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  انتهاء الصلاحية
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recent_transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.type_label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      transaction.points.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.amount || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('ar')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.expires_at ? new Date(transaction.expires_at).toLocaleDateString('ar') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Points Modal */}
      {showAddPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إضافة نقاط مكافأة
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عدد النقاط
                </label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل عدد النقاط"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="سبب إضافة النقاط"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPoints}
                disabled={!pointsAmount}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium"
              >
                إضافة النقاط
              </button>
              <button
                onClick={() => setShowAddPointsModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              استخدام النقاط
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عدد النقاط
                </label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  max={customer_info.available_points}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل عدد النقاط"
                />
                <p className="text-xs text-gray-500 mt-1">
                  متاح: {customer_info.available_points.toLocaleString()} نقطة
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="سبب استخدام النقاط"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRedeemPoints}
                disabled={!pointsAmount || parseInt(pointsAmount) > customer_info.available_points}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium"
              >
                استخدام النقاط
              </button>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCustomerDetails;