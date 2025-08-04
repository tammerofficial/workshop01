import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star, 
  Gift, 
  TrendingUp, 
  Search,
  Filter,
  Award,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Coins,
  Plus
} from 'lucide-react';
import laravel from '../api/laravel';

interface LoyaltyCustomer {
  id: number;
  membership_number: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  total_points: number;
  available_points: number;
  total_spent: number;
  total_orders: number;
  joined_at: string;
  last_purchase_at: string;
  client: {
    id: number;
    name: string;
  };
}

interface LoyaltyStatistics {
  summary: {
    total_customers: number;
    total_points_issued: number;
    available_points: number;
    total_spent: number;
    average_points_per_customer: number;
  };
  tier_distribution: Record<string, number>;
}

const LoyaltyCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [statistics, setStatistics] = useState<LoyaltyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

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

  useEffect(() => {
    loadData();
  }, [currentPage, selectedTier, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // تحميل الإحصائيات
      const statsResponse = await laravel.get('/loyalty/statistics');
      setStatistics(statsResponse.data.data);

      // تحميل العملاء
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '20'
      });
      
      if (selectedTier) params.append('tier', selectedTier);
      if (searchTerm) params.append('search', searchTerm);

      const customersResponse = await laravel.get(`/loyalty/customers?${params}`);
      setCustomers(customersResponse.data.data.customers);
      setTotalPages(customersResponse.data.data.pagination.last_page);
      
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="h-5 w-5" style={{ color: tierColors.bronze }} />;
      case 'silver': return <Award className="h-5 w-5" style={{ color: tierColors.silver }} />;
      case 'gold': return <Award className="h-5 w-5" style={{ color: tierColors.gold }} />;
      case 'vip': return <Star className="h-5 w-5" style={{ color: tierColors.vip }} />;
      default: return <Award className="h-5 w-5 text-gray-400" />;
    }
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
            نظام ولاء العملاء
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة عملاء الولاء ونقاطهم ومستوياتهم
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          إضافة عميل للولاء
        </motion.button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.summary.total_customers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي النقاط</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.summary.total_points_issued.toLocaleString()}
                </p>
              </div>
              <Coins className="h-8 w-8 text-yellow-500" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">النقاط المتاحة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.summary.available_points.toLocaleString()}
                </p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.summary.total_spent.toFixed(3)} د.ك
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">متوسط النقاط</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.summary.average_points_per_customer}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Tier Distribution */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            توزيع المستويات
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.tier_distribution).map(([tier, count]) => (
              <div key={tier} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getTierIcon(tier)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tierNames[tier as keyof typeof tierNames]}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع المستويات</option>
              <option value="bronze">برونزي</option>
              <option value="silver">فضي</option>
              <option value="gold">ذهبي</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المستوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  إجمالي المصروف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عدد الطلبات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  آخر شراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.membership_number}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {customer.email && (
                            <Mail className="h-3 w-3 text-gray-400" />
                          )}
                          {customer.phone && (
                            <Phone className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTierIcon(customer.tier)}
                      <span className="text-sm font-medium" style={{ color: tierColors[customer.tier as keyof typeof tierColors] }}>
                        {tierNames[customer.tier as keyof typeof tierNames]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="font-medium">{customer.available_points.toLocaleString()} متاح</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {customer.total_points.toLocaleString()} إجمالي
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {customer.total_spent.toFixed(3)} د.ك
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {customer.total_orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {customer.last_purchase_at ? new Date(customer.last_purchase_at).toLocaleDateString('ar') : 'لا يوجد'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        عرض التفاصيل
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        إضافة نقاط
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoyaltyCustomers;