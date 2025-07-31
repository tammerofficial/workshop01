import api from './laravel';

// Interfaces for Production Tracking
export interface ProductionStage {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  progress: number;
  estimated_hours: number;
  actual_hours: number;
  quality_score?: number;
  notes?: string;
  worker?: {
    id: number;
    name: string;
    position: string;
  } | null;
  station?: {
    id: number;
    name: string;
  } | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface RequiredMaterial {
  id: number;
  name: string;
  quantity_needed: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  is_available: boolean;
}

export interface OrderTracking {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  overall_progress: number;
  estimated_completion: string;
  actual_start?: string | null;
  client: {
    id: number;
    name: string;
  };
  assignedWorker?: {
    id: number;
    name: string;
    position: string;
  } | null;
  production_stages: ProductionStage[];
  total_estimated_hours: number;
  total_actual_hours: number;
  efficiency_score: number;
  is_delayed: boolean;
  delay_reason?: string | null;
  required_materials: RequiredMaterial[];
  material_cost: number;
  labor_cost: number;
  created_at: string;
  due_date: string;
}

export interface TrackingStatistics {
  total_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  average_efficiency: number;
  low_stock_materials: number;
}

export interface Alert {
  id: string;
  type: 'stock_low' | 'production_delay' | 'quality_low';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  [key: string]: string | number;
}

export interface WorkerEfficiency {
  worker_id: number;
  worker_name: string;
  stage_name: string;
  completed_tasks: number;
  avg_efficiency: number;
  avg_quality: number;
  total_hours_worked: number;
  on_time_delivery: number;
  cost_per_hour: number;
}

export interface TrackingFilters {
  status?: string;
  priority?: string;
  search?: string;
}

export const productionTrackingService = {
  // Get all orders with production tracking
  async getOrdersWithTracking(filters?: TrackingFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/production-tracking?${params.toString()}`);
    return response.data;
  },

  // Get specific order tracking details
  async getOrderTracking(orderId: number) {
    const response = await api.get(`/production-tracking/orders/${orderId}`);
    return response.data;
  },

  // Initialize production stages for an order
  async initializeOrderStages(orderId: number) {
    const response = await api.post(`/production-tracking/orders/${orderId}/initialize`);
    return response.data;
  },

  // Update production stage status
  async updateStageStatus(trackingId: number, data: {
    status: 'pending' | 'in_progress' | 'completed' | 'paused';
    actual_hours?: number;
    quality_score?: number;
    notes?: string;
    worker_id?: number;
  }) {
    const response = await api.patch(`/production-tracking/stages/${trackingId}/status`, data);
    return response.data;
  },

  // Get production statistics
  async getStatistics() {
    const response = await api.get('/production-tracking/statistics');
    return response.data;
  },

  // Get production alerts
  async getAlerts() {
    const response = await api.get('/production-tracking/alerts');
    return response.data;
  },

  // Get worker efficiency analysis
  async getWorkerAnalysis() {
    const response = await api.get('/production-tracking/worker-analysis');
    return response.data;
  }
};

export default productionTrackingService;