import api from './laravel';

export interface SmartProductionStats {
  [stage: string]: {
    orders: number;
    tasks: number;
    workers: number;
    total_hours: number;
    completed_hours: number;
  };
}

export interface Worker {
  id: number;
  name: string;
  specialty: string;
  production_stages: string[];
  is_active: boolean;
  role: string;
  department: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  stage_requirements: {
    [stage: string]: number;
  };
  material_requirements: {
    [material: string]: number;
  };
  collection: {
    name: string;
    season: string;
    year: number;
  };
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  season: string;
  year: number;
  products: Product[];
}

export interface Order {
  id: number;
  title: string;
  description: string;
  status: string;
  production_stage: string;
  current_worker_id?: number;
  estimated_hours: number;
  actual_hours: number;
  quality_status: string;
  delivery_status: string;
  client: {
    id: number;
    name: string;
  };
  product?: Product;
  collection?: Collection;
  currentWorker?: Worker;
}

class SmartProductionService {
  // بدء الإنتاج الذكي
  async startProduction(orderId: number) {
    const response = await api.post(`/smart-production/orders/${orderId}/start`);
    return response.data;
  }

  // الانتقال للمرحلة التالية
  async moveToNextStage(orderId: number, completedHours?: number) {
    const response = await api.post(`/smart-production/orders/${orderId}/next-stage`, {
      completed_hours: completedHours
    });
    return response.data;
  }

  // تعيين عامل حسب المرحلة
  async assignWorkerByStage(orderId: number, stage: string, workerId?: number) {
    const response = await api.post(`/smart-production/orders/${orderId}/assign-worker`, {
      stage,
      worker_id: workerId
    });
    return response.data;
  }

  // تحديث حالة الجودة
  async updateQualityStatus(orderId: number, qualityStatus: 'approved' | 'rejected', notes?: string) {
    const response = await api.post(`/smart-production/orders/${orderId}/quality-check`, {
      quality_status: qualityStatus,
      quality_notes: notes
    });
    return response.data;
  }

  // الحصول على إحصائيات الإنتاج
  async getStats(): Promise<SmartProductionStats> {
    const response = await api.get('/smart-production/stats');
    return response.data.data;
  }

  // تقرير أداء العمال
  async getWorkerPerformance(workerId?: number, period: 'week' | 'month' | 'year' = 'week') {
    const response = await api.get('/smart-production/worker-performance', {
      params: { worker_id: workerId, period }
    });
    return response.data.data;
  }

  // الحصول على العمال حسب التخصص
  async getWorkersBySpecialty(specialty: string): Promise<Worker[]> {
    const response = await api.get(`/smart-production/workers/specialty/${specialty}`);
    return response.data.data;
  }

  // الحصول على الطلبات حسب المرحلة
  async getOrdersByStage(stage: string): Promise<Order[]> {
    const response = await api.get(`/smart-production/orders/stage/${stage}`);
    return response.data.data;
  }

  // الحصول على المنتجات مع ساعات العمل
  async getProductsWithHours(): Promise<Product[]> {
    const response = await api.get('/smart-production/products');
    return response.data.data;
  }

  // الحصول على الكولكشنات
  async getCollections(): Promise<Collection[]> {
    const response = await api.get('/smart-production/collections');
    return response.data.data;
  }

  // حساب الوقت المتوقع للطلب
  calculateEstimatedTime(product: Product): number {
    if (!product.stage_requirements) return 0;
    return Object.values(product.stage_requirements).reduce((total, hours) => total + hours, 0);
  }

  // حساب الوقت المتوقع لمرحلة معينة
  getStageEstimatedTime(product: Product, stage: string): number {
    return product.stage_requirements?.[stage] || 0;
  }

  // الحصول على العمال المتاحين لمرحلة معينة
  async getAvailableWorkersForStage(stage: string): Promise<Worker[]> {
    const workers = await this.getWorkersBySpecialty(stage);
    return workers.filter(worker => worker.is_active);
  }

  // تقدير موعد التسليم
  calculateDeliveryDate(product: Product, startDate: Date = new Date()): Date {
    const totalHours = this.calculateEstimatedTime(product);
    const workingHoursPerDay = 8; // 8 ساعات عمل يومياً
    const workingDays = Math.ceil(totalHours / workingHoursPerDay);
    
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(deliveryDate.getDate() + workingDays);
    
    return deliveryDate;
  }

  // الحصول على معلومات المرحلة الحالية
  async getCurrentStageInfo(orderId: number) {
    // يمكن إضافة endpoint مخصص لهذا أو استخدام معلومات الطلب
    const response = await api.get(`/orders/${orderId}`);
    const order = response.data.data;
    
    return {
      current_stage: order.production_stage,
      current_worker: order.currentWorker,
      estimated_remaining_hours: order.estimated_hours - (order.actual_hours || 0)
    };
  }
}

export const smartProductionService = new SmartProductionService();
