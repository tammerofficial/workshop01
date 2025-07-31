import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  AlertCircle,
  Timer,
  CheckCheck,
  Activity,
  TrendingUp,
  Save,
  X,
  RefreshCw,
  Award,
  BarChart3,
  FileText,
  Eye
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductionReports from '../components/reports/ProductionReports';
import productionTrackingService, { 
  type OrderTracking, 
  type TrackingStatistics, 
  type Alert, 
  type WorkerEfficiency,
  type ProductionStage
} from '../api/productionTrackingService';

const ProductionTracking: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  
  // State variables
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [statistics, setStatistics] = useState<TrackingStatistics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProductionStage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showWorkerAnalysisModal, setShowWorkerAnalysisModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [workerAnalysis, setWorkerAnalysis] = useState<WorkerEfficiency[]>([]);

  const [actualHours, setActualHours] = useState<number>(0);
  const [stageNotes, setStageNotes] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<number>(5);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load orders with tracking details
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      };
      
      // Parallel loading of all data
      const [ordersResponse, statisticsResponse, alertsResponse, workerAnalysisResponse] = await Promise.all([
        productionTrackingService.getOrdersWithTracking(filters),
        productionTrackingService.getStatistics(),
        productionTrackingService.getAlerts(),
        productionTrackingService.getWorkerAnalysis()
      ]);

      setOrders(ordersResponse.data);
      setStatistics(statisticsResponse);
      setAlerts(alertsResponse);
      setWorkerAnalysis(workerAnalysisResponse);
      
    } catch (error) {
      console.error('Error loading production tracking data:', error);
      // Keep existing data if any, just log the error
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Update stage status
  const updateStageStatus = async () => {
    if (!selectedStage) return;

    try {
      await productionTrackingService.updateStageStatus(selectedStage.id, {
        status: 'in_progress', // This would come from form
        actual_hours: actualHours,
        quality_score: qualityScore,
        notes: stageNotes
      });

      setShowStageModal(false);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error updating stage status:', error);
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-3 md:p-6`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('productionTracking.title')}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('productionTracking.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Alerts Button */}
          <button
            onClick={() => setShowAlertsModal(true)}
            className={`relative px-3 lg:px-4 py-2 text-sm lg:text-base rounded-lg ${
              isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            } transition-colors`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {t('productionTracking.alerts')}
            {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Worker Analysis Button */}
          <button
            onClick={() => setShowWorkerAnalysisModal(true)}
            className={`px-3 lg:px-4 py-2 text-sm lg:text-base rounded-lg ${
              isDark 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            } transition-colors`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            {t('productionTracking.workerAnalysis')}
          </button>

          {/* Reports Button */}
          <button
            onClick={() => setShowReportsModal(true)}
            className={`px-3 lg:px-4 py-2 text-sm lg:text-base rounded-lg ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            {t('productionTracking.reports')}
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className={`px-3 lg:px-4 py-2 text-sm lg:text-base rounded-lg ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } transition-colors disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('productionTracking.refreshData')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('productionTracking.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">{t('productionTracking.allStatuses')}</option>
              <option value="pending">{t('productionTracking.pending')}</option>
              <option value="in_progress">{t('productionTracking.inProgress')}</option>
              <option value="completed">{t('productionTracking.completed')}</option>
              <option value="paused">{t('productionTracking.paused')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('productionTracking.totalOrders')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.total_orders || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('productionTracking.inProgressOrders')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.in_progress_orders || 0}
              </p>
            </div>
            <Timer className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('productionTracking.completedOrders')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.completed_orders || 0}
              </p>
            </div>
            <CheckCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('productionTracking.averageEfficiency')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.average_efficiency || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('productionTracking.lowStockMaterials')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.low_stock_materials || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {t('productionTracking.loadingData')}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
            >
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {order.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.priority === 'high' ? 'bg-red-100 text-red-800' :
                      order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {t(`productionTracking.priority${order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}`)}
                    </span>
                    {order.is_delayed && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        {t('productionTracking.delayed')}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('common.client')}: {order.client.name}
                  </p>
                </div>
                <div className="text-right mt-4 lg:mt-0">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('productionTracking.overallProgress')}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {order.overall_progress}%
                  </p>
                </div>
              </div>

              {/* Production Stages */}
              <div className="mb-4">
                <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('productionTracking.productionStages')}:
                </h4>
                <div className="space-y-3">
                  {order.production_stages.map((stage) => (
                    <div key={stage.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {stage.name}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                              stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              stage.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {stage.status === 'completed' ? t('productionTracking.completed') :
                               stage.status === 'in_progress' ? t('productionTracking.inProgress') :
                               stage.status === 'paused' ? t('productionTracking.paused') :
                               t('productionTracking.pending')}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('common.worker')}: {stage.worker?.name || t('productionTracking.noWorkerAssigned')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                          <div className="text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              stage.status === 'completed' ? 'bg-green-500' :
                              stage.status === 'in_progress' ? 'bg-blue-500' :
                              stage.status === 'paused' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}>
                              <span className="text-white font-semibold text-sm">{stage.progress}%</span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              {stage.actual_hours || 0}h / {stage.estimated_hours}h
                            </p>
                            {stage.quality_score && (
                              <div className="flex items-center space-x-1">
                                <Award className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs">{stage.quality_score}/10</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                                                          setSelectedStage(stage);
                            setActualHours(stage.actual_hours || 0);
                              setQualityScore(stage.quality_score || 5);
                              setStageNotes(stage.notes || '');
                              setShowStageModal(true);
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              isDark
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } transition-colors`}
                          >
                            {t('common.edit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('common.efficiency')}: {order.efficiency_score}%
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('productionTracking.totalHours')}: {order.total_actual_hours}h / {order.total_estimated_hours}h
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('productionTracking.expectedDelivery')}: {new Date(order.estimated_completion).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowMaterialsModal(true);
                    }}
                    className={`px-3 py-1 text-xs rounded ${
                      isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    } transition-colors`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    {t('productionTracking.viewMaterials')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stage Modal */}
      <AnimatePresence>
        {showStageModal && selectedStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('productionTracking.updateStageStatus')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('common.stage')}
                  </label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedStage.name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('common.worker')}: {selectedStage.worker?.name || t('productionTracking.noWorkerAssigned')}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('common.estimated')} {t('common.hours')}
                  </label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedStage.estimated_hours}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('productionTracking.actualHours')}
                  </label>
                  <input
                    type="number"
                    value={actualHours}
                    onChange={(e) => setActualHours(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('productionTracking.qualityScore')} (1-10)
                  </label>
                  <input
                    type="number"
                    value={qualityScore}
                    onChange={(e) => setQualityScore(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('common.notes')}
                  </label>
                  <textarea
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    rows={3}
                    placeholder={t('productionTracking.notesPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowStageModal(false)}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    isDark
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } transition-colors`}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  {t('common.cancel')}
                </button>
                <button
                  onClick={updateStageStatus}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors`}
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {t('productionTracking.saveChanges')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Materials Modal */}
      <AnimatePresence>
        {showMaterialsModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`w-full max-w-2xl p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl max-h-[80vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('productionTracking.requiredMaterials')} - {selectedOrder.title}
                </h3>
                <button
                  onClick={() => setShowMaterialsModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedOrder.required_materials.map((material) => (
                  <div key={material.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {material.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {material.quantity_needed} {material.unit} × {material.cost_per_unit} = {material.total_cost} KWD
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        material.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {material.is_available ? t('common.available') : t('common.notAvailable')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('productionTracking.totalMaterialCost')}:
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.material_cost} KWD
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('productionTracking.laborCost')}:
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.labor_cost} KWD
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('common.total')}:
                  </span>
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.material_cost + selectedOrder.labor_cost} KWD
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts Modal */}
      <AnimatePresence>
        {showAlertsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`w-full max-w-2xl p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl max-h-[80vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('productionTracking.alerts')} ({alerts.length})
                </h3>
                <button
                  onClick={() => setShowAlertsModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {alert.title}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          {new Date(alert.timestamp).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('productionTracking.noAlerts')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Worker Analysis Modal */}
      <AnimatePresence>
        {showWorkerAnalysisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`w-full max-w-6xl p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl max-h-[80vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('productionTracking.workerAnalysis')}
                </h3>
                <button
                  onClick={() => setShowWorkerAnalysisModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <th className="text-left py-2">{t('common.worker')}</th>
                      <th className="text-left py-2">{t('common.stage')}</th>
                      <th className="text-center py-2">{t('productionTracking.completedTasks')}</th>
                      <th className="text-center py-2">{t('common.efficiency')}</th>
                      <th className="text-center py-2">{t('common.quality')}</th>
                      <th className="text-center py-2">{t('productionTracking.onTimeDelivery')}</th>
                      <th className="text-center py-2">{t('common.hours')}</th>
                      <th className="text-center py-2">{t('productionTracking.costPerHour')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workerAnalysis.map((worker, index) => (
                      <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-2">{worker.worker_name}</td>
                        <td className="py-2">{worker.stage_name}</td>
                        <td className="py-2 text-center">{worker.completed_tasks}</td>
                        <td className="py-2 text-center">{worker.avg_efficiency}%</td>
                        <td className="py-2 text-center">{worker.avg_quality}/10</td>
                        <td className="py-2 text-center">{worker.on_time_delivery}%</td>
                        <td className="py-2 text-center">{worker.total_hours_worked}h</td>
                        <td className="py-2 text-center">{worker.cost_per_hour} KWD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {workerAnalysis.length === 0 && (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('productionTracking.noWorkerData')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports Modal */}
      <AnimatePresence>
        {showReportsModal && (
          <ProductionReports onClose={() => setShowReportsModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionTracking;