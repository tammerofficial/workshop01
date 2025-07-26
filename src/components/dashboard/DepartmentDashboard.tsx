import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Users, Package, TrendingUp, 
  Calendar, AlertTriangle, Clock, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity,
  Target, Zap, Award
} from 'lucide-react';
import ModernStatCard from './ModernStatCard';
import ModernOrdersChart from './ModernOrdersChart';
import ModernWorkerChart from './ModernWorkerChart';
import ModernRecentActivity from './ModernRecentActivity';
import { useDepartmentStats, useDepartmentData } from '../../hooks/useDepartmentData';
import { useDepartment } from '../../contexts/DepartmentContext';
import DepartmentLoader from '../common/DepartmentLoader';

const DepartmentDashboard: React.FC = () => {
  const { departmentInfo } = useDepartment();
  const { stats, loading } = useDepartmentStats();
  const { orders } = useDepartmentData();

  // Calculate orders with approaching deadlines
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    return orders.filter(order => {
      const deadline = new Date(order.deadline);
      return (
        deadline >= today && 
        deadline <= threeDaysLater && 
        order.status !== 'completed' && 
        order.status !== 'cancelled'
      );
    }).length;
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <DepartmentLoader>
      <div className="space-y-8">
        {/* Modern Department Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 rounded-2xl ${departmentInfo.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                  {departmentInfo.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{departmentInfo.name}</h1>
                  <p className="text-gray-600 text-lg">{departmentInfo.description}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">${stats.revenue.month.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ModernStatCard 
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingBag size={24} />}
            change={{ value: 12, positive: true }}
            color="blue"
          />
          
          <ModernStatCard 
            title="Active Workers"
            value={stats.activeWorkers}
            icon={<Users size={24} />}
            change={{ value: 5, positive: true }}
            color="purple"
          />
          
          <ModernStatCard 
            title="Completion Rate"
            value="94.8%"
            icon={<Target size={24} />}
            change={{ value: 2.3, positive: true }}
            color="green"
          />
          
          <ModernStatCard 
            title="Avg. Production"
            value={`${stats.avgProductionTime} days`}
            icon={<Clock size={24} />}
            change={{ value: 0.5, positive: false }}
            color="orange"
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ModernOrdersChart />
          </motion.div>
          
          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Activity size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Award size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed Today</p>
                    <p className="text-xs text-gray-500">Orders finished</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{Math.floor(stats.completedOrders * 0.1)}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight size={12} className="mr-1" />
                    +15%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calendar size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Due Soon</p>
                    <p className="text-xs text-gray-500">Next 3 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{upcomingDeadlines}</p>
                  <div className="flex items-center text-xs text-orange-600">
                    <AlertTriangle size={12} className="mr-1" />
                    Urgent
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Zap size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Efficiency</p>
                    <p className="text-xs text-gray-500">Team average</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(stats.activeWorkers > 0 ? 
                      (stats.completedOrders / stats.activeWorkers) * 10 : 0)}%
                  </p>
                  <div className="flex items-center text-xs text-purple-600">
                    <ArrowUpRight size={12} className="mr-1" />
                    +8%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Package size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Low Stock</p>
                    <p className="text-xs text-gray-500">Items to reorder</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{stats.lowStockItems}</p>
                  <div className="flex items-center text-xs text-red-600">
                    <ArrowDownRight size={12} className="mr-1" />
                    Alert
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ModernWorkerChart />
          <ModernRecentActivity />
        </div>
      </div>
    </DepartmentLoader>
  );
};

export default DepartmentDashboard;