import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, AlertTriangle, X, ArrowRight, Activity } from 'lucide-react';

interface Order {
  id: string | number;
  client_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  due_date?: string;
  description?: string;
}

interface ModernRecentActivityProps {
  orders: Order[];
  loading?: boolean;
}

const ModernRecentActivity: React.FC<ModernRecentActivityProps> = ({ orders = [], loading = false }) => {
  // Get only the most recent 6 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
      case 'in progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'completed':
        return <Check size={16} className="text-green-500" />;
      case 'cancelled':
        return <X size={16} className="text-red-500" />;
      default:
        return <AlertTriangle size={16} className="text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <motion.button 
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm font-medium transition-colors"
          whileHover={{ x: 3 }}
        >
          <span>View all</span>
          <ArrowRight size={14} />
        </motion.button>
      </div>

      <div className="space-y-3">
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        ) : (
          recentOrders.map((order, index) => (
            <motion.div 
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {getStatusIcon(order.status)}
                </motion.div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {formatDate(order.created_at)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {order.client_name} • {order.description || 'Custom Order'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <div className="text-sm font-semibold text-gray-900">
                  ${order.total_amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ModernRecentActivity;