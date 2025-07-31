import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Package,
  Clock,
  Award,
  DollarSign
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ReportData {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  totalRevenue: number;
  averageEfficiency: number;
  topWorkers: Array<{
    name: string;
    efficiency: number;
    completedTasks: number;
  }>;
  stagePerformance: Array<{
    stage: string;
    avgTime: number;
    efficiency: number;
  }>;
  materialUsage: Array<{
    material: string;
    used: number;
    cost: number;
  }>;
}

interface ProductionReportsProps {
  onClose: () => void;
}

const ProductionReports: React.FC<ProductionReportsProps> = ({ onClose }) => {
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Mock data
  const reportData: ReportData = {
    totalOrders: 25,
    completedOrders: 18,
    inProgressOrders: 7,
    totalRevenue: 45000,
    averageEfficiency: 87,
    topWorkers: [
      { name: 'علي العلاوي', efficiency: 95, completedTasks: 12 },
      { name: 'هدى ورك شوب', efficiency: 92, completedTasks: 10 },
      { name: 'يوسف كرولس', efficiency: 88, completedTasks: 8 }
    ],
    stagePerformance: [
      { stage: 'التصميم', avgTime: 2.5, efficiency: 95 },
      { stage: 'القص', avgTime: 4.2, efficiency: 88 },
      { stage: 'الخياطة', avgTime: 12.8, efficiency: 82 },
      { stage: 'التجربة', avgTime: 1.8, efficiency: 90 },
      { stage: 'التشطيب', avgTime: 3.1, efficiency: 85 }
    ],
    materialUsage: [
      { material: 'قماش صوف', used: 45, cost: 2250 },
      { material: 'خيط حرير', used: 25, cost: 375 },
      { material: 'أزرار', used: 150, cost: 300 }
    ]
  };

  const generateReport = () => {
    // Mock report generation
    console.log(`Generating ${selectedReport} report for ${selectedPeriod}`);
    
    // In real implementation, this would generate and download a PDF/Excel file
    const reportContent = {
      period: selectedPeriod,
      type: selectedReport,
      data: reportData,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-report-${selectedReport}-${selectedPeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold">تقارير الإنتاج والكفاءة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">الفترة الزمنية</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            >
              <option value="day">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="quarter">هذا الربع</option>
              <option value="year">هذا العام</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">نوع التقرير</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            >
              <option value="overview">نظرة عامة</option>
              <option value="efficiency">تقرير الكفاءة</option>
              <option value="materials">استهلاك المواد</option>
              <option value="costs">تحليل التكاليف</option>
              <option value="workers">أداء العمال</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={16} />
              <span>تصدير التقرير</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبيات</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">طلبيات مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{reportData.completedOrders}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط الكفاءة</p>
                  <p className="text-2xl font-bold text-yellow-600">{reportData.averageEfficiency}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.totalRevenue.toLocaleString()} ر.س</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Charts and Detailed Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Workers */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                أفضل العمال
              </h3>
              <div className="space-y-3">
                {reportData.topWorkers.map((worker, index) => (
                  <div key={worker.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-gray-600">{worker.completedTasks} مهمة مكتملة</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{worker.efficiency}%</p>
                      <p className="text-xs text-gray-500">كفاءة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Performance */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2" size={20} />
                أداء المراحل
              </h3>
              <div className="space-y-3">
                {reportData.stagePerformance.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-sm text-gray-600">{stage.avgTime} ساعة متوسط</p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        stage.efficiency >= 90 ? 'bg-green-100 text-green-800' : 
                        stage.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stage.efficiency}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Usage */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                استهلاك المواد
              </h3>
              <div className="space-y-3">
                {reportData.materialUsage.map((material) => (
                  <div key={material.material} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium">{material.material}</p>
                      <p className="text-sm text-gray-600">{material.used} وحدة</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{material.cost} ر.س</p>
                      <p className="text-xs text-gray-500">تكلفة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Analysis */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="mr-2" size={20} />
                تحليل الأوقات
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>إجمالي ساعات العمل</span>
                  <span className="font-bold">245 ساعة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>متوسط وقت الطلبية</span>
                  <span className="font-bold">13.6 ساعة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>وقت التأخير الإجمالي</span>
                  <span className="font-bold text-red-600">18 ساعة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>نسبة التسليم في الوقت</span>
                  <span className="font-bold text-green-600">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">ملخص التقرير</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">النقاط الإيجابية:</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• كفاءة عالية في مرحلة التصميم (95%)</li>
                  <li>• أداء ممتاز للعامل علي العلاوي</li>
                  <li>• تحسن في أوقات التسليم</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">نقاط التحسين:</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• بطء في مرحلة الخياطة</li>
                  <li>• ارتفاع تكلفة بعض المواد</li>
                  <li>• الحاجة لتدريب إضافي لبعض العمال</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductionReports;