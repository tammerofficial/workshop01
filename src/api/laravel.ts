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

// Export API_BASE_URL for external use
export const API_BASE_URL = getApiBaseUrl();

// Create axios instance for Laravel API
// Create axios instance for Laravel API
const laravelApi = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add response interceptor for error handling
laravelApi.interceptors.response.use(
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
  getAll: () => laravelApi.get('/workers'),
  getById: (id: number) => laravelApi.get(`/workers/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/workers', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/workers/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/workers/${id}`),
  activate: (id: number) => laravelApi.patch(`/workers/${id}/activate`),
  deactivate: (id: number) => laravelApi.patch(`/workers/${id}/deactivate`),
};

export const materialService = {
  getAll: () => laravelApi.get('/materials'),
  getById: (id: number) => laravelApi.get(`/materials/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/materials', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/materials/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/materials/${id}`),
  getLowStock: () => laravelApi.get('/materials/low-stock'),
};

export const orderService = {
  getAll: () => laravelApi.get('/orders'),
  getById: (id: number) => laravelApi.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/orders', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/orders/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/orders/${id}`),
  assignWorker: (id: number, workerId: number) => 
    laravelApi.patch(`/orders/${id}/assign-worker`, { worker_id: workerId }),
  updateStatus: (id: number, status: string) => 
    laravelApi.patch(`/orders/${id}/status`, { status }),
  getOrdersByClient: (clientId: number) => 
    laravelApi.get(`/orders?client_id=${clientId}`).then(response => response.data),
};

export const clientService = {
  getAll: () => laravelApi.get('/clients'),
  getClients: () => laravelApi.get('/clients').then(response => response.data),
  getById: (id: number) => laravelApi.get(`/clients/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/clients', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/clients/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/clients/${id}`),
};

export const categoryService = {
  getAll: () => laravelApi.get('/categories'),
  getById: (id: number) => laravelApi.get(`/categories/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/categories', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/categories/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/categories/${id}`),
};

export const invoiceService = {
  getAll: () => laravelApi.get('/invoices'),
  getById: (id: number) => laravelApi.get(`/invoices/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/invoices', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/invoices/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/invoices/${id}`),
  markAsPaid: (id: number) => laravelApi.patch(`/invoices/${id}/mark-paid`),
  updateStatus: (id: number, status: string) => laravelApi.patch(`/invoices/${id}/status`, { status })
};

export const taskService = {
  getAll: () => laravelApi.get('/tasks'),
  getById: (id: number) => laravelApi.get(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/tasks', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/tasks/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/tasks/${id}`),
  start: (id: number) => laravelApi.patch(`/tasks/${id}/start`),
  complete: (id: number) => laravelApi.patch(`/tasks/${id}/complete`),
};

export const measurementService = {
  getAll: () => laravelApi.get('/measurements'),
  getById: (id: number) => laravelApi.get(`/measurements/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/measurements', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/measurements/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/measurements/${id}`),
  getByClient: (clientId: number) => laravelApi.get(`/measurements/client/${clientId}`),
};

export const dashboardService = {
  getStats: () => laravelApi.get('/dashboard/stats'),
  getRecentOrders: () => laravelApi.get('/dashboard/recent-orders'),
  getRecentTasks: () => laravelApi.get('/dashboard/recent-tasks'),
  getWorkerPerformance: () => laravelApi.get('/dashboard/worker-performance'),
  getProductionMetrics: () => laravelApi.get('/dashboard/production-metrics'),
  getInventoryAlerts: () => laravelApi.get('/dashboard/inventory-alerts'),
  getProductionFlowSummary: () => laravelApi.get('/dashboard/production-flow-summary'),
};

export const wooCommerceService = {
  importCustomers: () => laravelApi.post('/woocommerce/import/customers'),
  importOrders: () => laravelApi.post('/woocommerce/import/orders'),
  importProducts: () => laravelApi.post('/woocommerce/import/products'),
  importAll: () => laravelApi.post('/woocommerce/import/all'),
};

// Role Service
export const roleService = {
  getAll: () => laravelApi.get('/roles'),
  getById: (id: number) => laravelApi.get(`/roles/${id}`),
  create: (data: Record<string, unknown>) => laravelApi.post('/roles', data),
  update: (id: number, data: Record<string, unknown>) => laravelApi.put(`/roles/${id}`, data),
  delete: (id: number) => laravelApi.delete(`/roles/${id}`),
  getPermissions: () => laravelApi.get('/roles/permissions/available'),
  getDefaultRoles: () => laravelApi.get('/roles/defaults'),
};

// Permission Service
export const permissionService = {
  getAll: () => laravelApi.get('/permissions'),
  getGrouped: () => laravelApi.get('/permissions/grouped'),
};

// Biometric Service
export const biometricService = {
  syncWorkers: () => laravelApi.post('/biometric/sync-workers'),
  syncAttendance: (data?: Record<string, unknown>) => laravelApi.post('/biometric/sync-attendance', data),
  getAttendanceReport: (params?: Record<string, unknown>) => laravelApi.get('/biometric/attendance-report', { params }),
  getWorkerAttendance: (id: number, params?: Record<string, unknown>) => laravelApi.get(`/biometric/worker/${id}/attendance`, { params }),
  getTokenInfo: () => laravelApi.get('/biometric/token-info'),
  getBiometricWorkers: (pageSize = 50) => laravelApi.get(`/biometric/workers?page_size=${pageSize}`),
  getBiometricAttendance: (params?: Record<string, unknown>) => laravelApi.get('/biometric/attendance', { params }),
  
  // CRUD Operations for Employees
  createEmployee: (data: Record<string, unknown>) => laravelApi.post('/biometric/employees', data),
  getEmployee: (id: number) => laravelApi.get(`/biometric/employees/${id}`),
  updateEmployee: (id: number, data: Record<string, unknown>) => laravelApi.put(`/biometric/employees/${id}`, data),
  deleteEmployee: (id: number) => laravelApi.delete(`/biometric/employees/${id}`),
  
  // Support Data
  getAreas: () => laravelApi.get('/biometric/areas'),
  getDepartments: () => laravelApi.get('/biometric/departments'),
  getPositions: () => laravelApi.get('/biometric/positions'),
};

// ERP Management Service
export const erpService = {
  // Department Management
  getDepartments: () => laravelApi.get('/biometric/erp/departments'),
  createDepartment: (data: Record<string, unknown>) => laravelApi.post('/biometric/erp/departments', data),
  updateDepartment: (id: number, data: Record<string, unknown>) => laravelApi.put(`/biometric/erp/departments/${id}`, data),
  deleteDepartment: (id: number) => laravelApi.delete(`/biometric/erp/departments/${id}`),
  
  // Position Management
  getPositions: () => laravelApi.get('/biometric/erp/positions'),
  createPosition: (data: Record<string, unknown>) => laravelApi.post('/biometric/erp/positions', data),
  updatePosition: (id: number, data: Record<string, unknown>) => laravelApi.put(`/biometric/erp/positions/${id}`, data),
  deletePosition: (id: number) => laravelApi.delete(`/biometric/erp/positions/${id}`),
  
  // Resignation Management
  getResignations: () => laravelApi.get('/biometric/erp/resignations'),
  createResignation: (data: Record<string, unknown>) => laravelApi.post('/biometric/erp/resignations', data),
  updateResignation: (id: number, data: Record<string, unknown>) => laravelApi.put(`/biometric/erp/resignations/${id}`, data),
  deleteResignation: (id: number) => laravelApi.delete(`/biometric/erp/resignations/${id}`),
  reinstateEmployee: (resignationIds: number[]) => laravelApi.post('/biometric/erp/resignations/reinstate', { resignation_ids: resignationIds }),
  
  // Device Management
  getDevices: () => laravelApi.get('/biometric/erp/devices'),
  createDevice: (data: Record<string, unknown>) => laravelApi.post('/biometric/erp/devices', data),
  updateDevice: (id: number, data: Record<string, unknown>) => laravelApi.put(`/biometric/erp/devices/${id}`, data),
  deleteDevice: (id: number) => laravelApi.delete(`/biometric/erp/devices/${id}`),
  
  // Transaction Management
  getTransactions: (params?: Record<string, unknown>) => laravelApi.get('/biometric/erp/transactions', { params }),
  getTransaction: (id: number) => laravelApi.get(`/biometric/erp/transactions/${id}`),
  deleteTransaction: (id: number) => laravelApi.delete(`/biometric/erp/transactions/${id}`),
  
  // Transaction Reports
  getTransactionReport: (params?: Record<string, unknown>) => laravelApi.get('/biometric/erp/transaction-report', { params }),
  exportTransactionReport: (params: Record<string, unknown>) => laravelApi.get('/biometric/erp/transaction-report/export', { 
    params, 
    responseType: 'blob' 
  }),
  getTransactionStats: (params?: Record<string, unknown>) => laravelApi.get('/biometric/erp/transaction-stats', { params }),
};

// Payroll Service
export const payrollService = {
  getAll: (params?: Record<string, unknown>) => laravelApi.get('/payroll', { params }),
  getStats: (params?: Record<string, unknown>) => laravelApi.get('/payroll/stats', { params }),
  getWorkers: () => laravelApi.get('/payroll/workers'),
  getById: (id: number) => laravelApi.get(`/payroll/${id}`),
  generatePayroll: (data: Record<string, unknown>) => laravelApi.post('/payroll/generate', data),
  generateAllPayrolls: (data: Record<string, unknown>) => laravelApi.post('/payroll/generate-all', data),
  updateStatus: (id: number, data: Record<string, unknown>) => laravelApi.patch(`/payroll/${id}/status`, data),
  delete: (id: number) => laravelApi.delete(`/payroll/${id}`),
};

// Loyalty Service
export const loyaltyService = {
  // Statistics and Configuration
  getStatistics: () => laravelApi.get('/loyalty/statistics'),
  getConfig: () => laravelApi.get('/loyalty/config'),
  
  // Customers
  getCustomers: (params?: Record<string, unknown>) => laravelApi.get('/loyalty/customers', { params }),
  getCustomerDetails: (customerId: number) => laravelApi.get(`/loyalty/customers/${customerId}`),
  getCustomerSummary: (clientId: number) => laravelApi.get(`/loyalty/customers/${clientId}/summary`),
  createAccount: (clientId: number, data?: Record<string, unknown>) => laravelApi.post(`/loyalty/customers/${clientId}/create-account`, data || {}),
  
  // Points Management
  addBonusPoints: (data: Record<string, unknown>) => laravelApi.post('/loyalty/points/add-bonus', data),
  redeemPoints: (data: Record<string, unknown>) => laravelApi.post('/loyalty/points/redeem', data),
  convertPoints: (data: Record<string, unknown>) => laravelApi.post('/loyalty/points/convert', data),
  expirePoints: () => laravelApi.post('/loyalty/points/expire'),
  sendExpiryReminders: (params?: Record<string, unknown>) => laravelApi.post('/loyalty/points/send-expiry-reminders', params || {}),
  
  // Orders and Sales Integration
  processOrderPoints: (orderId: number) => laravelApi.post(`/loyalty/orders/${orderId}/process-points`),
  applyOrderDiscount: (orderId: number, data: Record<string, unknown>) => laravelApi.post(`/loyalty/orders/${orderId}/apply-discount`, data),
  processSalePoints: (saleId: number) => laravelApi.post(`/loyalty/sales/${saleId}/process-points`),
};

// RBAC Dashboard API functions
export const rbacApi = {
  // Dashboard Overview
  getRBACDashboard: () => laravelApi.get('/rbac/dashboard'),
  getSecurityDetails: () => laravelApi.get('/rbac/security-details'),
  exportReport: (params?: Record<string, unknown>) => laravelApi.get('/rbac/export-report', { params }),
  
  // Role Management
  getRoleHierarchy: () => laravelApi.get('/rbac/roles/hierarchical'),
  createRole: (data: Record<string, unknown>) => laravelApi.post('/rbac/roles', data),
  updateRole: (id: number, data: Record<string, unknown>) => laravelApi.put(`/rbac/roles/${id}`, data),
  deleteRole: (id: number) => laravelApi.delete(`/rbac/roles/${id}`),
  
  // Permission Management
  getAvailablePermissions: () => laravelApi.get('/rbac/permissions/available'),
  getGroupedPermissions: () => laravelApi.get('/rbac/permissions/grouped'),
  
  // Security Events
  getSecurityEvents: (params?: Record<string, unknown>) => laravelApi.get('/security/events', { params }),
  investigateEvent: (eventId: number, notes: string) => laravelApi.post(`/security/events/${eventId}/investigate`, { notes }),
  resolveEvent: (eventId: number, notes: string) => laravelApi.post(`/security/events/${eventId}/resolve`, { notes }),
  
  // Audit Logs
  getAuditLogs: (params?: Record<string, unknown>) => laravelApi.get('/security/audit-logs', { params }),
  getActivityLogs: (params?: Record<string, unknown>) => laravelApi.get('/security/activity-logs', { params }),
  
  // Real-time Security
  startMonitoring: (data: Record<string, unknown>) => laravelApi.post('/security/realtime/start-monitoring', data),
  getLiveUpdates: () => laravelApi.get('/security/realtime/live-updates'),
  handleAlert: (data: Record<string, unknown>) => laravelApi.post('/security/realtime/handle-alert', data),
  runAIAnalysis: (data: Record<string, unknown>) => laravelApi.post('/security/realtime/ai-analysis', data),
  getActiveSessions: () => laravelApi.get('/security/realtime/active-sessions'),
  
  // Advanced Analytics
  getBehaviorPatterns: () => laravelApi.get('/analytics/advanced/behavior-patterns'),
  getThreatPredictions: () => laravelApi.get('/analytics/advanced/threat-predictions'),
  getSecurityEffectiveness: () => laravelApi.get('/analytics/advanced/security-effectiveness'),
  getComplianceMetrics: () => laravelApi.get('/analytics/advanced/compliance-metrics'),
  getSecurityROI: () => laravelApi.get('/analytics/advanced/security-roi'),
  getAIPredictions: () => laravelApi.get('/analytics/advanced/ai-predictions'),
  
  // Blockchain Audit
  recordEvent: (data: Record<string, unknown>) => laravelApi.post('/blockchain/record-event', data),
  verifyIntegrity: (eventId: string) => laravelApi.get(`/blockchain/verify/${eventId}`),
  getIntegrityReport: (params?: Record<string, unknown>) => laravelApi.get('/blockchain/integrity-report', { params }),
  searchBlockchain: (data: Record<string, unknown>) => laravelApi.post('/blockchain/search', data),
  generateCertificate: (data: Record<string, unknown>) => laravelApi.post('/blockchain/generate-certificate', data),
};

export default laravelApi; 