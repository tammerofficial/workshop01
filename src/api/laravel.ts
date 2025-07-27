import axios from 'axios';

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  // In production, this will be the actual domain
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }
  // In development, use local Laravel server
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
};

// Create axios instance for Laravel API
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// API Services
export const workerService = {
  getAll: () => api.get('/workers'),
  getById: (id: number) => api.get(`/workers/${id}`),
  create: (data: any) => api.post('/workers', data),
  update: (id: number, data: any) => api.put(`/workers/${id}`, data),
  delete: (id: number) => api.delete(`/workers/${id}`),
  activate: (id: number) => api.patch(`/workers/${id}/activate`),
  deactivate: (id: number) => api.patch(`/workers/${id}/deactivate`),
};

export const materialService = {
  getAll: () => api.get('/materials'),
  getById: (id: number) => api.get(`/materials/${id}`),
  create: (data: any) => api.post('/materials', data),
  update: (id: number, data: any) => api.put(`/materials/${id}`, data),
  delete: (id: number) => api.delete(`/materials/${id}`),
  getLowStock: () => api.get('/materials/low-stock'),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: number, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
  assignWorker: (id: number, workerId: number) => 
    api.patch(`/orders/${id}/assign-worker`, { worker_id: workerId }),
  updateStatus: (id: number, status: string) => 
    api.patch(`/orders/${id}/status`, { status }),
  getOrdersByClient: (clientId: number) => 
    api.get(`/orders?client_id=${clientId}`).then(response => response.data),
};

export const clientService = {
  getAll: () => api.get('/clients'),
  getClients: () => api.get('/clients').then(response => response.data),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: number, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const invoiceService = {
  getAll: () => api.get('/invoices'),
  getById: (id: number) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: number, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  markAsPaid: (id: number) => api.patch(`/invoices/${id}/mark-paid`),
  updateStatus: (id: number, status: string) => api.patch(`/invoices/${id}/status`, { status })
};

export const taskService = {
  getAll: () => api.get('/tasks'),
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: number, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  start: (id: number) => api.patch(`/tasks/${id}/start`),
  complete: (id: number) => api.patch(`/tasks/${id}/complete`),
};

export const measurementService = {
  getAll: () => api.get('/measurements'),
  getById: (id: number) => api.get(`/measurements/${id}`),
  create: (data: any) => api.post('/measurements', data),
  update: (id: number, data: any) => api.put(`/measurements/${id}`, data),
  delete: (id: number) => api.delete(`/measurements/${id}`),
  getByClient: (clientId: number) => api.get(`/measurements/client/${clientId}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getRecentTasks: () => api.get('/dashboard/recent-tasks'),
};

export const wooCommerceService = {
  importCustomers: () => api.post('/woocommerce/import/customers'),
  importOrders: () => api.post('/woocommerce/import/orders'),
  importProducts: () => api.post('/woocommerce/import/products'),
  importAll: () => api.post('/woocommerce/import/all'),
};

// Role Service
export const roleService = {
  getAll: () => api.get('/roles'),
  getById: (id: number) => api.get(`/roles/${id}`),
  create: (data: any) => api.post('/roles', data),
  update: (id: number, data: any) => api.put(`/roles/${id}`, data),
  delete: (id: number) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions/available'),
  getDefaultRoles: () => api.get('/roles/defaults'),
};

// Permission Service
export const permissionService = {
  getAll: () => api.get('/permissions'),
  getGrouped: () => api.get('/permissions/grouped'),
};

export default api; 