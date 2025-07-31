import axios from 'axios';

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  // In production, this will be the actual domain
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }
  // In development, use local Laravel server
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8004/api';
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
  create: (data: Record<string, unknown>) => api.post('/workers', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/workers/${id}`, data),
  delete: (id: number) => api.delete(`/workers/${id}`),
  activate: (id: number) => api.patch(`/workers/${id}/activate`),
  deactivate: (id: number) => api.patch(`/workers/${id}/deactivate`),
};

export const materialService = {
  getAll: () => api.get('/materials'),
  getById: (id: number) => api.get(`/materials/${id}`),
  create: (data: Record<string, unknown>) => api.post('/materials', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/materials/${id}`, data),
  delete: (id: number) => api.delete(`/materials/${id}`),
  getLowStock: () => api.get('/materials/low-stock'),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/orders/${id}`, data),
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
  create: (data: Record<string, unknown>) => api.post('/clients', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: Record<string, unknown>) => api.post('/categories', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const invoiceService = {
  getAll: () => api.get('/invoices'),
  getById: (id: number) => api.get(`/invoices/${id}`),
  create: (data: Record<string, unknown>) => api.post('/invoices', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  markAsPaid: (id: number) => api.patch(`/invoices/${id}/mark-paid`),
  updateStatus: (id: number, status: string) => api.patch(`/invoices/${id}/status`, { status })
};

export const taskService = {
  getAll: () => api.get('/tasks'),
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => api.post('/tasks', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  start: (id: number) => api.patch(`/tasks/${id}/start`),
  complete: (id: number) => api.patch(`/tasks/${id}/complete`),
};

export const measurementService = {
  getAll: () => api.get('/measurements'),
  getById: (id: number) => api.get(`/measurements/${id}`),
  create: (data: Record<string, unknown>) => api.post('/measurements', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/measurements/${id}`, data),
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
  create: (data: Record<string, unknown>) => api.post('/roles', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/roles/${id}`, data),
  delete: (id: number) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions/available'),
  getDefaultRoles: () => api.get('/roles/defaults'),
};

// Permission Service
export const permissionService = {
  getAll: () => api.get('/permissions'),
  getGrouped: () => api.get('/permissions/grouped'),
};

// Biometric Service
export const biometricService = {
  syncWorkers: () => api.post('/biometric/sync-workers'),
  syncAttendance: (data?: Record<string, unknown>) => api.post('/biometric/sync-attendance', data),
  getAttendanceReport: (params?: Record<string, unknown>) => api.get('/biometric/attendance-report', { params }),
  getWorkerAttendance: (id: number, params?: Record<string, unknown>) => api.get(`/biometric/worker/${id}/attendance`, { params }),
  getTokenInfo: () => api.get('/biometric/token-info'),
  getBiometricWorkers: (pageSize = 50) => api.get(`/biometric/workers?page_size=${pageSize}`),
  getBiometricAttendance: (params?: Record<string, unknown>) => api.get('/biometric/attendance', { params }),
  
  // CRUD Operations for Employees
  createEmployee: (data: Record<string, unknown>) => api.post('/biometric/employees', data),
  getEmployee: (id: number) => api.get(`/biometric/employees/${id}`),
  updateEmployee: (id: number, data: Record<string, unknown>) => api.put(`/biometric/employees/${id}`, data),
  deleteEmployee: (id: number) => api.delete(`/biometric/employees/${id}`),
  
  // Support Data
  getAreas: () => api.get('/biometric/areas'),
  getDepartments: () => api.get('/biometric/departments'),
  getPositions: () => api.get('/biometric/positions'),
};

// ERP Management Service
export const erpService = {
  // Department Management
  getDepartments: () => api.get('/biometric/erp/departments'),
  createDepartment: (data: Record<string, unknown>) => api.post('/biometric/erp/departments', data),
  updateDepartment: (id: number, data: Record<string, unknown>) => api.put(`/biometric/erp/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/biometric/erp/departments/${id}`),
  
  // Position Management
  getPositions: () => api.get('/biometric/erp/positions'),
  createPosition: (data: Record<string, unknown>) => api.post('/biometric/erp/positions', data),
  updatePosition: (id: number, data: Record<string, unknown>) => api.put(`/biometric/erp/positions/${id}`, data),
  deletePosition: (id: number) => api.delete(`/biometric/erp/positions/${id}`),
  
  // Resignation Management
  getResignations: () => api.get('/biometric/erp/resignations'),
  createResignation: (data: Record<string, unknown>) => api.post('/biometric/erp/resignations', data),
  updateResignation: (id: number, data: Record<string, unknown>) => api.put(`/biometric/erp/resignations/${id}`, data),
  deleteResignation: (id: number) => api.delete(`/biometric/erp/resignations/${id}`),
  reinstateEmployee: (resignationIds: number[]) => api.post('/biometric/erp/resignations/reinstate', { resignation_ids: resignationIds }),
  
  // Device Management
  getDevices: () => api.get('/biometric/erp/devices'),
  createDevice: (data: Record<string, unknown>) => api.post('/biometric/erp/devices', data),
  updateDevice: (id: number, data: Record<string, unknown>) => api.put(`/biometric/erp/devices/${id}`, data),
  deleteDevice: (id: number) => api.delete(`/biometric/erp/devices/${id}`),
  
  // Transaction Management
  getTransactions: (params?: Record<string, unknown>) => api.get('/biometric/erp/transactions', { params }),
  getTransaction: (id: number) => api.get(`/biometric/erp/transactions/${id}`),
  deleteTransaction: (id: number) => api.delete(`/biometric/erp/transactions/${id}`),
  
  // Transaction Reports
  getTransactionReport: (params?: Record<string, unknown>) => api.get('/biometric/erp/transaction-report', { params }),
  exportTransactionReport: (params: Record<string, unknown>) => api.get('/biometric/erp/transaction-report/export', { 
    params, 
    responseType: 'blob' 
  }),
  getTransactionStats: (params?: Record<string, unknown>) => api.get('/biometric/erp/transaction-stats', { params }),
};

// Payroll Service
export const payrollService = {
  getAll: (params?: Record<string, unknown>) => api.get('/payroll', { params }),
  getStats: (params?: Record<string, unknown>) => api.get('/payroll/stats', { params }),
  getWorkers: () => api.get('/payroll/workers'),
  getById: (id: number) => api.get(`/payroll/${id}`),
  generatePayroll: (data: Record<string, unknown>) => api.post('/payroll/generate', data),
  generateAllPayrolls: (data: Record<string, unknown>) => api.post('/payroll/generate-all', data),
  updateStatus: (id: number, data: Record<string, unknown>) => api.patch(`/payroll/${id}/status`, data),
  delete: (id: number) => api.delete(`/payroll/${id}`),
};

export default api; 