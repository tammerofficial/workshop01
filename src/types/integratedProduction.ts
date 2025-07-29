// /src/types/integratedProduction.ts

export interface Material {
    id: number;
    name: string;
    quantity: number;
    reserved_quantity: number;
    unit: string;
    cost_per_unit: string;
}

export interface MaterialReservation {
    id: number;
    material_id: number;
    reserved_quantity: string;
    material: Material;
}

export interface ProductionStage {
    id: number;
    name: string;
    description: string;
}

export interface OrderProductionTracking {
    id: number;
    production_stage_id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'paused';
    started_at: string | null;
    completed_at: string | null;
    estimated_minutes: number;
    actual_hours: number | null;
    notes: string | null;
    production_stage: ProductionStage;
}

export interface OrderCostBreakdown {
    id: number;
    cost_type: 'material' | 'labor' | 'overhead' | 'other';
    description: string;
    amount: string;
}

export interface OrderProgress {
    id: number;
    title: string;
    status: string;
    production_tracking: OrderProductionTracking[];
    material_reservations: MaterialReservation[];
    cost_breakdown: OrderCostBreakdown[];
}

export interface ProductionProgressResponse {
    success: boolean;
    order: OrderProgress;
    progress: {
        total_stages: number;
        completed_stages: number;
        current_stage: OrderProductionTracking | null;
        progress_percentage: number;
    };
}

export interface MoveToNextStageData {
    actual_minutes: number;
    quality_score?: number;
    notes?: string;
}

export interface MoveToNextStageResponse {
    success: boolean;
    current_stage: OrderProductionTracking;
    next_stage: OrderProductionTracking | null;
    order_completed: boolean;
}
