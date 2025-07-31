import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus,
  Search,
  Eye,
  Package,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Move
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import productionFlowService, { 
  type ProductionFlowStage, 
  type FlowOrder, 
  type FlowStatistics
} from '../api/productionFlowService';
import api from '../api/laravel';

// Draggable Order Card Component
const DraggableOrderCard: React.FC<{
  order: FlowOrder;
  isDark: boolean;
  isRTL: boolean;
  t: (key: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
  onViewDetails: (orderId: number) => void;
}> = ({ order, isDark, isRTL, t, getPriorityColor, getPriorityText, onViewDetails }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `order-${order.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-3 rounded-lg border ${
        isDark 
          ? 'border-gray-700 bg-gray-700/50' 
          : 'border-gray-200 bg-gray-50'
      } ${isDragging ? 'ring-2 ring-blue-500' : ''} cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Package className="w-4 h-4 text-blue-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {order.title}
            </h4>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
              {getPriorityText(order.priority)}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {order.status}
            </span>
          </div>

          <div className="space-y-1">
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('common.client')}: {order.client.name}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('common.dueDate')}: {new Date(order.due_date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('common.progress')}
              </span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {order.progress}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${order.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 ml-3">
          <button
            onClick={() => onViewDetails(order.id)}
            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded transition-colors"
            title={t('common.viewDetails')}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Droppable Stage Component
const DroppableStage: React.FC<{
  stage: ProductionFlowStage;
  isDark: boolean;
  isRTL: boolean;
  t: (key: string) => string;
  showOrdersLimit: {[key: string]: number};
  onShowMore: (stageId: string) => void;
  onViewDetails: (orderId: number) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
  getStageColor: (color: string) => string;
  isDragging: boolean;
}> = ({ 
  stage, 
  isDark, 
  isRTL, 
  t, 
  showOrdersLimit, 
  onShowMore, 
  onViewDetails, 
  getPriorityColor, 
  getPriorityText, 
  getStageColor,
  isDragging
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  });

  return (
    <motion.div
      key={stage.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden transition-opacity duration-300 ${
        isDragging && !isOver ? 'opacity-20' : 'opacity-100'
      } ${
        isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Stage Header */}
      <div className={`${getStageColor(stage.color)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isRTL ? stage.name_ar : stage.name}
          </h3>
          <span className="text-2xl font-bold">{stage.order_count}</span>
        </div>
        <p className="text-sm opacity-90 mt-1">
          {stage.order_count} {t('orders.ordersCount')} • {stage.task_count} {t('tasks.tasksCount')} • {stage.worker_count} {t('workers.workersCount')}
        </p>
      </div>

      {/* Drop Zone for Orders */}
      <div 
        ref={setNodeRef}
        className={`p-4 min-h-[200px] transition-colors ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
      >
        <SortableContext 
          items={stage.orders.map(order => `order-${order.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {stage.orders.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isOver ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('orders.noItemsInStage')}
              </p>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('production.dragToMove')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stage.orders.slice(0, showOrdersLimit[stage.id.toString()] || 3).map((order) => (
                <DraggableOrderCard
                  key={order.id}
                  order={order}
                  isDark={isDark}
                  isRTL={isRTL}
                  t={t}
                  getPriorityColor={getPriorityColor}
                  getPriorityText={getPriorityText}
                  onViewDetails={onViewDetails}
                />
              ))}

              {/* Show More Button */}
              {stage.orders.length > (showOrdersLimit[stage.id.toString()] || 3) && (
                <button
                  onClick={() => onShowMore(stage.id.toString())}
                  className={`w-full text-center py-2 text-sm ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  } font-medium`}
                >
                  {t('common.showMore')} ({stage.orders.length - (showOrdersLimit[stage.id.toString()] || 3)})
                </button>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </motion.div>
  );
};

// Assignment Modal Component
const AssignmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAssign: (workerId?: number, stationId?: number) => void;
  order: FlowOrder | null;
  targetStage: ProductionFlowStage | null;
  workers: any[];
  stations: any[];
  isDark: boolean;
  t: (key: string) => string;
}> = ({ isOpen, onClose, onAssign, order, targetStage, workers, stations, isDark, t }) => {
  const [selectedWorker, setSelectedWorker] = useState<number | undefined>();
  const [selectedStation, setSelectedStation] = useState<number | undefined>();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('production.assignToStage')}
        </h2>
        <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('orders.order')}: <span className="font-semibold">{order?.title}</span>
        </p>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('production.targetStage')}: <span className="font-semibold">{targetStage?.name}</span>
        </p>

        {/* Worker Selection */}
        <div className="mb-4">
          <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('workers.assignWorker')}
          </label>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(parseInt(e.target.value))}
            className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">{t('common.selectOptional')}</option>
            {workers.map(worker => (
              <option key={worker.id} value={worker.id}>{worker.name}</option>
            ))}
          </select>
        </div>

        {/* Station Selection */}
        <div className="mb-6">
          <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('stations.assignStation')}
          </label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(parseInt(e.target.value))}
            className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">{t('common.selectOptional')}</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>{station.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onAssign(selectedWorker, selectedStation)}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('common.assign')}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuitProductionFlow: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  // State variables
  const [stages, setStages] = useState<ProductionFlowStage[]>([]);
  const [statistics, setStatistics] = useState<FlowStatistics | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showOrdersLimit, setShowOrdersLimit] = useState<{[key: string]: number}>({});
  const [draggedOrder, setDraggedOrder] = useState<FlowOrder | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    order: FlowOrder | null;
    targetStageId: string | number | null;
  }>({ isOpen: false, order: null, targetStageId: null });
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [availableStations, setAvailableStations] = useState<any[]>([]);

  // ... (sensors, loadData, etc.)

  // Load available workers and stations
  const loadAssignmentData = async () => {
    try {
      const [workersRes, stationsRes] = await Promise.all([
        api.get('/workers/available'),
        api.get('/stations/available')
      ]);
      setAvailableWorkers(workersRes.data);
      setAvailableStations(stationsRes.data);
    } catch (error) {
      console.error('Error loading assignment data:', error);
    }
  };

  useEffect(() => {
    loadAssignmentData();
  }, []);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [flowResponse, statisticsResponse] = await Promise.all([
        productionFlowService.getFlow(),
        productionFlowService.getStatistics()
      ]);

      setStages(flowResponse.stages);
      setStatistics(statisticsResponse);
      
    } catch (error) {
      console.error('Error loading production flow data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Filter orders based on search term
  const filterOrders = (orders: FlowOrder[]): FlowOrder[] => {
    if (!searchTerm) return orders;
    
    return orders.filter(order => 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get filtered stage data
  const getFilteredStages = (): ProductionFlowStage[] => {
    if (selectedStage === 'all') {
      return stages.map(stage => ({
        ...stage,
        orders: filterOrders(stage.orders)
      }));
    }
    
    const stage = stages.find(s => s.id.toString() === selectedStage);
    return stage ? [{
      ...stage,
      orders: filterOrders(stage.orders)
    }] : [];
  };



  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const { active } = event;
    const orderId = parseInt(active.id.toString().replace('order-', ''));
    const order = stages.flatMap(stage => stage.orders).find(o => o.id === orderId);
    setDraggedOrder(order || null);
  };

  // Handle drag end (move order to new stage)
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    setDraggedOrder(null);

    if (!over) return;

    const orderId = parseInt(active.id.toString().replace('order-', ''));
    const targetStageId = over.id.toString().replace('stage-', '');

    // Don't move if dropped on the same stage
    const order = stages.flatMap(stage => stage.orders).find(o => o.id === orderId);
    if (!order) return;

    // Find current stage
    const currentStage = stages.find(stage => 
      stage.orders.some(o => o.id === orderId)
    );

    if (currentStage && currentStage.id.toString() === targetStageId) {
      return; // Same stage, no need to move
    }

    setAssignmentModal({
      isOpen: true,
      order: order,
      targetStageId: targetStageId,
    });
  };

  // Handle assignment from modal
  const handleAssign = async (workerId?: number, stationId?: number) => {
    if (!assignmentModal.order || !assignmentModal.targetStageId) return;

    try {
      await productionFlowService.moveToStage(
        assignmentModal.order.id,
        assignmentModal.targetStageId,
        workerId,
        stationId
      );
      loadData();
    } catch (error) {
      console.error('Error assigning to stage:', error);
    } finally {
      setAssignmentModal({ isOpen: false, order: null, targetStageId: null });
    }
  };

  // Show more orders for a stage
  const showMoreOrders = (stageId: string) => {
    setShowOrdersLimit(prev => ({
      ...prev,
      [stageId]: (prev[stageId] || 3) + 5
    }));
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return t('common.urgent');
      case 'high':
        return t('common.high');
      case 'medium':
        return t('common.medium');
      case 'low':
        return t('common.low');
      default:
        return priority;
    }
  };

  // Get stage color
  const getStageColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      gray: 'bg-gray-500'
    };
    return colors[color as keyof typeof colors] || 'bg-blue-500';
  };

  const filteredStages = getFilteredStages();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-6`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
            <Factory className="w-8 h-8 mr-3 text-blue-500" />
            {t('productionFlow.title')}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('productionFlow.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Station Display Button */}
          <button
            onClick={() => navigate('/station-display')}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            } transition-colors flex items-center`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('stationDisplay.title')}
          </button>

          {/* Production Tracking Button */}
          <button
            onClick={() => navigate('/production-tracking')}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } transition-colors flex items-center`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('productionTracking.title')}
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors disabled:opacity-50 flex items-center`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Add New Order Button */}
          <button
            onClick={() => navigate('/create-order')}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } transition-colors flex items-center`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('orders.addNew')}
          </button>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder={t('orders.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64`}
              />
            </div>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
            {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {isRTL ? stage.name_ar : stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('orders.total')}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.total_orders}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tasks.total')}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.total_tasks}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('workers.total')}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.total_workers}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('orders.inProgress')}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.in_progress_orders}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
                        </div>
                      </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('orders.completed')}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.completed_orders}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
                          </div>
                          </div>
                        )}

      {/* Production Stages with Drag & Drop */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {t('common.loading')}...
            </span>
                        </div>
                      </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStages.map((stage) => (
              <DroppableStage
                key={stage.id}
                stage={stage}
                isDark={isDark}
                isRTL={isRTL}
                t={t}
                showOrdersLimit={showOrdersLimit}
                onShowMore={showMoreOrders}
                onViewDetails={(orderId) => navigate(`/orders/${orderId}`)}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                getStageColor={getStageColor}
                isDragging={isDragging}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedOrder ? (
              <DraggableOrderCard
                order={draggedOrder}
                isDark={isDark}
                isRTL={isRTL}
                t={t}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                onViewDetails={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal({ isOpen: false, order: null, targetStageId: null })}
        onAssign={handleAssign}
        order={assignmentModal.order}
        targetStage={stages.find(s => s.id === assignmentModal.targetStageId) || null}
        workers={availableWorkers}
        stations={availableStations}
        isDark={isDark}
        t={t}
      />

      {/* Quick Actions */}
      <div className={`fixed bottom-6 right-6 flex flex-col space-y-3`}>
        <button
          onClick={() => navigate('/create-order')}
          className={`p-4 rounded-full shadow-lg ${
            isDark 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } transition-colors`}
          title={t('orders.addNew')}
        >
          <Plus className="w-6 h-6" />
        </button>
        </div>
    </div>
  );
};

export default SuitProductionFlow;