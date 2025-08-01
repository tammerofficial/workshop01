import laravelApi from './apiClient';

export interface WooCommerceOrder {
  id: number;
  wc_order_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: string;
  tax_amount: string;
  shipping_amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  billing_address: any;
  shipping_address: any;
  customer_notes: string;
  order_notes: string;
  is_cloned_to_workshop: boolean;
  workshop_order_id: number | null;
  order_date: string;
  created_at: string;
  updated_at: string;
  order_items: WooCommerceOrderItem[];
}

export interface WooCommerceOrderItem {
  id: number;
  woocommerce_order_id: number;
  wc_order_item_id: number;
  wc_product_id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  line_tax: string;
  product_meta: any;
  product_attributes: any;
  item_notes: string;
  is_cloned_to_workshop: boolean;
  workshop_order_item_id: number | null;
  created_at: string;
  updated_at: string;
  product: any;
}

export interface WorkshopOrder {
  id: number;
  order_number: string;
  source_type: 'woocommerce' | 'local' | 'manual';
  source_id: number | null;
  client_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  estimated_cost: string;
  final_cost: string | null;
  selling_price: string;
  currency: string;
  status: 'pending_acceptance' | 'accepted' | 'materials_reserved' | 'in_production' | 'quality_check' | 'completed' | 'delivered' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  delivery_address: any;
  assigned_manager_id: number | null;
  manager_notes: string;
  production_notes: string;
  customer_notes: string;
  special_requirements: any;
  progress_percentage: string;
  accepted_at: string | null;
  production_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: WorkshopOrderItem[];
}

export interface WorkshopOrderItem {
  id: number;
  workshop_order_id: number;
  source_order_item_id: number | null;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_cost: string;
  total_cost: string;
  unit_price: string;
  total_price: string;
  product_specifications: any;
  materials_breakdown: any[];
  status: 'pending' | 'materials_reserved' | 'in_production' | 'quality_check' | 'completed' | 'cancelled';
  progress_percentage: string;
  assigned_worker_id: number | null;
  production_notes: string;
  quality_notes: string;
  production_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// WooCommerce Orders API
export const woocommerceOrdersApi = {
  // Get WooCommerce orders with pagination and filters
  getOrders: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    cloned?: 'true' | 'false';
  } = {}): Promise<ApiResponse<WooCommerceOrder[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.cloned) queryParams.append('cloned', params.cloned);

    const response = await laravelApi.get(`/woocommerce-orders?${queryParams.toString()}`);
    return response.data;
  },

  // Get single WooCommerce order details
  getOrder: async (orderId: number): Promise<ApiResponse<WooCommerceOrder>> => {
    const response = await laravelApi.get(`/woocommerce-orders/${orderId}`);
    return response.data;
  },

  // Sync orders from WooCommerce
  syncFromWooCommerce: async (params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<ApiResponse<any>> => {
    const response = await laravelApi.post('/woocommerce-orders/sync', params);
    return response.data;
  },

  // Clone WooCommerce order to workshop
  cloneToWorkshop: async (orderId: number): Promise<ApiResponse<WorkshopOrder>> => {
    const response = await laravelApi.post(`/woocommerce-orders/${orderId}/clone-to-workshop`);
    return response.data;
  },

  // Auto-clone eligible orders
  autoCloneEligible: async (): Promise<ApiResponse<any>> => {
    const response = await laravelApi.post('/woocommerce-orders/auto-clone-eligible');
    return response.data;
  }
};

// Workshop Orders API (we'll add routes for this)
export const workshopOrdersApi = {
  // Get workshop orders
  getOrders: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    source_type?: string;
  } = {}): Promise<ApiResponse<WorkshopOrder[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.source_type) queryParams.append('source_type', params.source_type);

    const response = await laravelApi.get(`/workshop-orders?${queryParams.toString()}`);
    return response.data;
  },

  // Accept workshop order
  acceptOrder: async (orderId: number, managerNotes?: string): Promise<ApiResponse<WorkshopOrder>> => {
    const response = await laravelApi.post(`/workshop-orders/${orderId}/accept`, {
      manager_notes: managerNotes
    });
    return response.data;
  },

  // Start production
  startProduction: async (orderId: number): Promise<ApiResponse<WorkshopOrder>> => {
    const response = await laravelApi.post(`/workshop-orders/${orderId}/start-production`);
    return response.data;
  },

  // Update order status
  updateStatus: async (orderId: number, status: string, notes?: string): Promise<ApiResponse<WorkshopOrder>> => {
    const response = await laravelApi.patch(`/workshop-orders/${orderId}/status`, {
      status,
      notes
    });
    return response.data;
  }
};

// Helper functions
export const formatCurrency = (amount: string | number, currency: string = 'KWD'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(3)} ${currency}`;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
    pending_acceptance: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    materials_reserved: 'bg-blue-100 text-blue-800',
    in_production: 'bg-indigo-100 text-indigo-800',
    quality_check: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    on_hold: 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    pending: 'في الانتظار',
    processing: 'قيد المعالجة',
    'on-hold': 'معلق',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    refunded: 'مسترد',
    failed: 'فاشل',
    pending_acceptance: 'في انتظار الموافقة',
    accepted: 'مقبول',
    materials_reserved: 'المواد محجوزة',
    in_production: 'قيد الإنتاج',
    quality_check: 'فحص الجودة',
    delivered: 'تم التسليم',
    on_hold: 'متوقف مؤقتاً'
  };
  
  return statusTexts[status] || status;
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

export const getPriorityText = (priority: string): string => {
  const priorityTexts: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    urgent: 'عاجل'
  };
  
  return priorityTexts[priority] || priority;
};