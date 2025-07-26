import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Factory, Clock, CheckCircle, Play, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ProductionStage {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  actual_hours: number | null;
  estimated_hours: number;
  worker: {
    name: string;
  } | null;
  station: {
    name: string;
  } | null;
}

interface Order {
  id: number;
  title: string;
  status: string;
  client: {
    name: string;
  };
  worker: {
    name: string;
  } | null;
}

const ProductionTracking: React.FC = () => {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productionStages, setProductionStages] = useState<ProductionStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: 1,
          title: 'ODR-0001',
          status: 'in_progress',
          client: { name: 'Ali Abdullah' },
          worker: { name: 'Youssef' }
        },
        {
          id: 2,
          title: 'ODR-0002',
          status: 'pending',
          client: { name: 'Ahmed Hassan' },
          worker: null
        }
      ];

      const mockStages: ProductionStage[] = [
        {
          id: 1,
          name: 'Design & Planning',
          status: 'completed',
          started_at: '2025-07-26 08:00',
          completed_at: '2025-07-26 10:00',
          actual_hours: 2,
          estimated_hours: 2,
          worker: { name: 'Youssef' },
          station: { name: 'Design Station 1' }
        },
        {
          id: 2,
          name: 'Cutting',
          status: 'completed',
          started_at: '2025-07-26 10:00',
          completed_at: '2025-07-26 13:00',
          actual_hours: 3,
          estimated_hours: 3,
          worker: { name: 'Youssef' },
          station: { name: 'Cutting Station 1' }
        },
        {
          id: 3,
          name: 'Sewing',
          status: 'in_progress',
          started_at: '2025-07-26 13:00',
          completed_at: null,
          actual_hours: null,
          estimated_hours: 8,
          worker: { name: 'Youssef' },
          station: { name: 'Sewing Station 1' }
        },
        {
          id: 4,
          name: 'Fitting',
          status: 'pending',
          started_at: null,
          completed_at: null,
          actual_hours: null,
          estimated_hours: 2,
          worker: null,
          station: null
        },
        {
          id: 5,
          name: 'Finishing',
          status: 'pending',
          started_at: null,
          completed_at: null,
          actual_hours: null,
          estimated_hours: 3,
          worker: null,
          station: null
        },
        {
          id: 6,
          name: 'Quality Check',
          status: 'pending',
          started_at: null,
          completed_at: null,
          actual_hours: null,
          estimated_hours: 1,
          worker: null,
          station: null
        }
      ];

      setOrders(mockOrders);
      setSelectedOrder(mockOrders[0]);
      setProductionStages(mockStages);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress': return <Play size={16} className="text-blue-600" />;
      case 'pending': return <Clock size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const calculateProgress = () => {
    const completed = productionStages.filter(stage => stage.status === 'completed').length;
    return Math.round((completed / productionStages.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Production Tracking 🏭
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor production stages and progress
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
        >
          <Factory size={20} />
          <span>Start Production</span>
        </motion.button>
      </motion.div>

      {/* Order Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Select Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOrder(order)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedOrder?.id === order.id
                  ? 'border-blue-500 bg-blue-50'
                  : isDark
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.client.name}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Production Progress */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Production Progress - {selectedOrder.title}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Overall Progress: {calculateProgress()}%
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Client</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedOrder.client.name}</p>
              </div>
              {selectedOrder.worker && (
                <div className="text-center">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Worker</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedOrder.worker.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Production Stages */}
          <div className="space-y-4">
            {productionStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(stage.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stage.status)}`}>
                        {stage.status}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stage.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Estimated: {stage.estimated_hours}h
                        {stage.actual_hours && ` | Actual: ${stage.actual_hours}h`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {stage.worker && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Worker: {stage.worker.name}
                      </p>
                    )}
                    {stage.station && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Station: {stage.station.name}
                      </p>
                    )}
                    {stage.started_at && (
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Started: {stage.started_at}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductionTracking; 