import axios from 'axios';

const BASE_URL = 'https://wordpress-1446204-5489188.cloudwaysapps.com/wp-json/wc/v3';
const AUTH_PARAMS = {
  consumer_key: 'ck_f148efa76346d32567e16c4a100f19f0a025bfab',
  consumer_secret: 'cs_02e1bfa704ed1756f1c4f291d5ac162a89e617f4'
};

const api = axios.create({
  baseURL: BASE_URL,
  params: AUTH_PARAMS
});

export const wooCommerceApi = {
  // Generic GET request
  get: (endpoint: string) => api.get(endpoint),

  // Orders
  getOrders: () => api.get('/orders'),
  getOrder: (id: number) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post('/orders', data),
  updateOrder: (id: number, data: any) => api.put(`/orders/${id}`, data),
  updateOrderStage: (id: number, data: any) => api.put(`/orders/${id}`, {
    meta_data: [
      {
        key: 'current_stage',
        value: data.currentStage
      },
      {
        key: 'stage_start_time',
        value: data.stageStartTime
      },
      {
        key: 'stage_end_time',
        value: data.stageEndTime
      },
      {
        key: 'completed_by',
        value: JSON.stringify(data.completedBy)
      }
    ]
  }),

  // Workers (Customers)
  getWorkers: () => api.get('/customers'),
  getWorker: (id: number) => api.get(`/customers/${id}`),
  createWorker: (data: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    role?: string;
    department?: string;
    meta_data?: Array<{ key: string; value: string }>;
  }) => api.post('/customers', data),
  updateWorker: (id: number, data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    department?: string;
    meta_data?: Array<{ key: string; value: string }>;
  }) => api.put(`/customers/${id}`, data),
  deleteWorker: (id: number) => api.delete(`/customers/${id}`, { params: { force: true } }),
  getWorkerPerformance: (id: number) => api.get(`/customers/${id}/meta`),

  // Products (Inventory)
  getProducts: () => api.get('/products'),
  getProduct: (id: number) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}`, data),

  // Stations (using products endpoint with category filtering)
  getStations: () => api.get('/products', { 
    params: { 
      category: 'stations',
      per_page: 100,
      status: 'publish'
    }
  }),
  getStationHistory: (id: string) => api.get(`/products/${id}/notes`),
  updateStationStatus: (id: string, data: any) => api.put(`/products/${id}`, {
    status: data.status,
    meta_data: [
      {
        key: 'station_status',
        value: data.status
      }
    ]
  })
};