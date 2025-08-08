import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Users, 
  BarChart3, PieChart, Loader
} from 'lucide-react';
import { orderService, workerService, materialService } from '../../api/laravel';
import Chart from 'react-apexcharts';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReportData {
  orders: any[];
  workers: any[];
  materials: any[];
}

const AdvancedReports: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<'overview' | 'workers' | 'materials'>('overview');
  const [reportData, setReportData] = useState<ReportData>({ orders: [], workers: [], materials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [ordersRes, workersRes, materialsRes] = await Promise.all([
          orderService.getAll(),
          workerService.getAll(),
          materialService.getAll()
        ]);
        setReportData({
          orders: ordersRes.data,
          workers: workersRes.data,
          materials: materialsRes.data
        });
      } catch (error) {
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const generateChartData = () => {
    // Order Status Chart
    const orderStatusData = {
      completed: reportData.orders.filter(o => o.status === 'completed').length,
      inProgress: reportData.orders.filter(o => o.status === 'in_progress').length,
      pending: reportData.orders.filter(o => o.status === 'pending').length,
      cancelled: reportData.orders.filter(o => o.status === 'cancelled').length,
    };

    // Worker Performance Chart
    const workerPerformanceData = reportData.workers.slice(0, 5).map(worker => ({
      name: worker.name.split(' ')[0],
      tasks: worker.tasks_count || 0,
      efficiency: worker.performance?.efficiency || 85
    }));

    return { orderStatusData, workerPerformanceData };
  };

  const { orderStatusData, workerPerformanceData } = generateChartData();

  const orderStatusChart = {
    series: [orderStatusData.completed, orderStatusData.inProgress, orderStatusData.pending, orderStatusData.cancelled],
    options: {
      chart: { type: 'donut' as const },
      labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      legend: { position: 'bottom' as const }
    }
  };

  const workerChart = {
    series: [{
      name: 'Tasks Completed',
      data: workerPerformanceData.map(w => w.tasks)
    }, {
      name: 'Efficiency %',
      data: workerPerformanceData.map(w => w.efficiency)
    }],
    options: {
      chart: { type: 'bar' as const },
      xaxis: { categories: workerPerformanceData.map(w => w.name) },
      colors: ['#3b82f6', '#10b981']
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin text-blue-500" size={40} />
        <span className="ml-4 text-lg text-gray-600">Loading Reports...</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Advanced Reports</h3>
            <p className="text-sm text-gray-500">Real-time analytics and insights.</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download size={18} className="mr-2" />
          Export
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="flex space-x-4 mb-6">
        {(['overview', 'workers', 'materials'] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedReport(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === type 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart size={20} className="mr-2 text-blue-600" />
            Order Status Distribution
          </h4>
          <Chart
            options={orderStatusChart.options}
            series={orderStatusChart.series}
            type="donut"
            height={300}
          />
        </div>

        {/* Worker Performance Chart */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users size={20} className="mr-2 text-green-600" />
            Top Worker Performance
          </h4>
          <Chart
            options={workerChart.options}
            series={workerChart.series}
            type="bar"
            height={300}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{reportData.orders.length}</div>
                          <div className="text-sm text-gray-600">{t('productionTracking.totalOrders')}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{reportData.workers.length}</div>
          <div className="text-sm text-gray-600">Active Workers</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{reportData.materials.length}</div>
          <div className="text-sm text-gray-600">Materials</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((orderStatusData.completed / reportData.orders.length) * 100) || 0}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedReports;