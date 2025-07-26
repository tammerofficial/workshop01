import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, LineChart, PieChart, Download, Calendar,
  Users, Package, Clock, TrendingUp, FileText
} from 'lucide-react';
import { mockOrders, mockWorkers, mockInventoryItems } from '../../data/mockData';
import Chart from 'react-apexcharts';

interface ReportData {
  daily: any;
  monthly: any;
  productivity: any;
  materials: any;
}

const AdvancedReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedReport, setSelectedReport] = useState<'overview' | 'workers' | 'materials' | 'productivity'>('overview');

  const generateReportData = (): ReportData => {
    // Worker Performance Data
    const workerData = mockWorkers.map(worker => ({
      name: worker.name.split(' ')[0],
      completed: worker.performance.completedTasks,
      efficiency: worker.performance.efficiency,
      avgTime: worker.performance.averageTime
    }));

    // Order Status Distribution
    const orderStatusData = {
      completed: mockOrders.filter(o => o.status === 'completed').length,
      inProgress: mockOrders.filter(o => o.status === 'in progress').length,
      cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
      received: mockOrders.filter(o => o.status === 'received').length
    };

    // Material Usage Data
    const materialData = mockInventoryItems.map(item => ({
      name: item.name,
      used: item.usageLog.reduce((sum, log) => sum + log.quantity, 0),
      remaining: item.currentStock,
      category: item.category
    }));

    // Daily/Monthly trends (mock data)
    const trendData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      orders: Math.floor(Math.random() * 10) + 5,
      completed: Math.floor(Math.random() * 8) + 3,
      efficiency: Math.floor(Math.random() * 20) + 75
    }));

    return {
      daily: trendData,
      monthly: trendData,
      productivity: workerData,
      materials: materialData
    };
  };

  const reportData = generateReportData();

  const workerPerformanceChart = {
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      colors: ['#3a86ff', '#06d6a0', '#ff9e00'],
      plotOptions: {
        bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: reportData.productivity.map(w => w.name),
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      legend: { position: 'top' },
      grid: { borderColor: '#f1f1f1', strokeDashArray: 4 }
    },
    series: [
      {
        name: 'Completed Tasks',
        data: reportData.productivity.map(w => w.completed)
      },
      {
        name: 'Efficiency %',
        data: reportData.productivity.map(w => w.efficiency)
      },
      {
        name: 'Avg Time (min)',
        data: reportData.productivity.map(w => w.avgTime)
      }
    ]
  };

  const orderTrendChart = {
    options: {
      chart: { type: 'line', toolbar: { show: false } },
      colors: ['#3a86ff', '#06d6a0'],
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: reportData.daily.slice(-7).map(d => d.date),
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: { borderColor: '#f1f1f1', strokeDashArray: 4 }
    },
    series: [
      {
        name: 'Orders Received',
        data: reportData.daily.slice(-7).map(d => d.orders)
      },
      {
        name: 'Orders Completed',
        data: reportData.daily.slice(-7).map(d => d.completed)
      }
    ]
  };

  const materialUsageChart = {
    options: {
      chart: { type: 'donut' },
      colors: ['#3a86ff', '#06d6a0', '#ff9e00', '#ef476f'],
      labels: reportData.materials.slice(0, 4).map(m => m.name),
      legend: { position: 'bottom' },
      dataLabels: { enabled: true }
    },
    series: reportData.materials.slice(0, 4).map(m => m.used)
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Simulate report export
    console.log(`Exporting ${selectedReport} report as ${format}`);
    // Here you would implement actual export functionality
  };

  const renderOverviewReport = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Order Trends (Last 7 Days)</h3>
        <Chart
          options={orderTrendChart.options}
          series={orderTrendChart.series}
          type="line"
          height={300}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Material Usage Distribution</h3>
        <Chart
          options={materialUsageChart.options}
          series={materialUsageChart.series}
          type="donut"
          height={300}
        />
      </div>
      
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Key Metrics Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-secondary">{mockOrders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-success">
              {mockOrders.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-warning">
              {mockOrders.filter(o => o.status === 'in progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-accent">{mockWorkers.length}</div>
            <div className="text-sm text-gray-600">Active Workers</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkerReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Worker Performance Analysis</h3>
        <Chart
          options={workerPerformanceChart.options}
          series={workerPerformanceChart.series}
          type="bar"
          height={400}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Individual Worker Stats</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockWorkers.map(worker => (
                <tr key={worker.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={worker.imageUrl} alt={worker.name} className="w-8 h-8 rounded-full mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-sm text-gray-500">{worker.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.performance.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.performance.efficiency}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.performance.averageTime} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      worker.status === 'active' ? 'bg-success-100 text-success-800' :
                      worker.status === 'on leave' ? 'bg-warning-100 text-warning-800' :
                      'bg-danger-100 text-danger-800'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMaterialReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Material Consumption Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportData.materials.slice(0, 6).map(material => (
            <div key={material.name} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{material.name}</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-medium">{material.used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{material.remaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{material.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FileText size={24} className="text-secondary mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Advanced Reports</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="overview">Overview</option>
              <option value="workers">Worker Performance</option>
              <option value="materials">Material Usage</option>
              <option value="productivity">Productivity Analysis</option>
            </select>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download size={16} className="mr-2" />
                PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download size={16} className="mr-2" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {selectedReport === 'overview' && renderOverviewReport()}
        {selectedReport === 'workers' && renderWorkerReport()}
        {selectedReport === 'materials' && renderMaterialReport()}
        {selectedReport === 'productivity' && renderWorkerReport()}
      </motion.div>
    </div>
  );
};

export default AdvancedReports;