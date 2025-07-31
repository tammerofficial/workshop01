import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product interfaces
export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  product_type: 'simple' | 'variable' | 'raw_material' | 'product_part';
  price: number;
  purchase_price: number;
  stock_quantity: number;
  manage_stock: boolean;
  auto_calculate_purchase_price: boolean;
  production_hours: number;
  manufacturing_time_days: number;
  stage_requirements: any;
  image_url: string;
  is_active: boolean;
  woocommerce_id?: number;
  category?: {
    id: number;
    name: string;
  };
  collection?: {
    id: number;
    name: string;
  };
  bill_of_materials?: BOMItem[];
  created_at: string;
  updated_at: string;
}

export interface BOMItem {
  id: number;
  material_id: number;
  quantity_required: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  is_optional: boolean;
  notes: string;
  material: {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
  };
}

export interface ManufacturingRequirements {
  product: Product;
  quantity_to_manufacture: number;
  can_manufacture: boolean;
  requirements: Array<{
    material: Product;
    quantity_required: number;
    available_quantity: number;
    is_sufficient: boolean;
    shortage: number;
  }>;
  shortages: Array<{
    material: Product;
    required: number;
    available: number;
    shortage: number;
  }>;
  estimated_manufacturing_time: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  sku: string;
  product_type: Product['product_type'];
  price: number;
  purchase_price?: number;
  stock_quantity?: number;
  category_id?: number;
  collection_id?: number;
  production_hours?: number;
  manufacturing_time_days?: number;
  manage_stock?: boolean;
  auto_calculate_purchase_price?: boolean;
  is_active?: boolean;
  image_url?: string;
  bill_of_materials?: Array<{
    material_id: number;
    quantity_required: number;
    unit?: string;
    cost_per_unit?: number;
    is_optional?: boolean;
    notes?: string;
  }>;
}

export const productService = {
  // Get all products
  async getAll(params?: {
    type?: string;
    category_id?: number;
    stock_status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  async getById(id: number) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  async create(data: CreateProductData) {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product
  async update(id: number, data: Partial<CreateProductData>) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  async delete(id: number) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get manufacturing requirements
  async getManufacturingRequirements(id: number, quantity: number = 1): Promise<ManufacturingRequirements> {
    const response = await api.get(`/products/${id}/manufacturing-requirements`, {
      params: { quantity }
    });
    return response.data;
  },

  // Reserve materials for manufacturing
  async reserveMaterials(id: number, quantity: number, orderId: number) {
    const response = await api.post(`/products/${id}/reserve-materials`, {
      quantity,
      order_id: orderId
    });
    return response.data;
  },

  // Get materials for BOM (raw materials and product parts)
  async getMaterialsForBOM() {
    const response = await api.get('/products/materials-for-bom');
    return response.data;
  },

  // WooCommerce sync
  async syncWooCommerce() {
    const response = await api.post('/products/sync-woocommerce');
    return response.data;
  },

  // Test WooCommerce connection
  async testWooCommerceConnection() {
    const response = await api.post('/products/test-woocommerce');
    return response.data;
  }
};

export default productService;
