import api from './apiClient';

// Interfaces for Production Flow
export interface ProductionFlowStage {
  id: string | number;
  name: string;
  name_ar: string;
  order_count: number;
  task_count: number;
  worker_count: number;
  orders: FlowOrder[];
  color: string;
}

export interface FlowOrder {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client: {
    id: number;
    name: string;
  };
  worker?: {
    id: number;
    name: string;
    position: string;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
  due_date: string;
  created_at: string;
  progress: number;
  current_stage?: {
    id: number;
    name: string;
    order_sequence: number;
  } | null;
}

export interface FlowStatistics {
  total_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  total_workers: number;
  busy_workers: number;
}

export interface FlowResponse {
  stages: ProductionFlowStage[];
  summary: {
    total_orders: number;
    total_tasks: number;
    total_workers: number;
    active_orders: number;
    completed_orders: number;
  };
}

export const productionFlowService = {
  // Get production flow overview
  async getFlow(): Promise<FlowResponse> {
    const response = await api.get('/production-flow');
    return response.data;
  },

  // Get production flow statistics
  async getStatistics(): Promise<FlowStatistics> {
    const response = await api.get('/production-flow/statistics');
    return response.data;
  },

  // Get orders by stage
  async getOrdersByStage(stageId: string | number): Promise<{ orders: FlowOrder[] }> {
    const response = await api.get(`/production-flow/stages/${stageId}/orders`);
    return response.data;
  },

  // Start production for an order
  async startProduction(orderId: number, workerId?: number): Promise<any> {
    const response = await api.post(`/production-flow/orders/${orderId}/start`, {
      worker_id: workerId
    });
    return response.data;
  },

  // Move order to next stage
  async moveToNextStage(orderId: number, currentStageId: number, workerId?: number): Promise<any> {
    const response = await api.post(`/production-flow/orders/${orderId}/move-next`, {
      current_stage_id: currentStageId,
      worker_id: workerId
    });
    return response.data;
  },

  // Move order to specific stage (for drag & drop)
  async moveToStage(orderId: number, targetStageId: string | number, workerId?: number, stationId?: number): Promise<any> {
    const response = await api.post(`/production-flow/orders/${orderId}/move-to-stage`, {
      target_stage_id: targetStageId,
      worker_id: workerId,
      station_id: stationId,
    });
    return response.data;
  }
};

export default productionFlowService;