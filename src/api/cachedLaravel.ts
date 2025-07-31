import axios, { AxiosResponse } from 'axios';
import { cachedFetch, CacheTTL, CacheInvalidator, apiCache } from '../utils/cache';

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

/**
 * Cache-aware API wrapper
 */
class CachedApiService {
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? `_${JSON.stringify(params)}` : '';
    return `api_${endpoint.replace(/\//g, '_')}${paramString}`;
  }

  /**
   * GET request with caching
   */
  async get<T>(endpoint: string, ttl: number = CacheTTL.MEDIUM, params?: Record<string, any>): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    return cachedFetch(
      cacheKey,
      async () => {
        const response: AxiosResponse<T> = await api.get(endpoint, { params });
        return response.data;
      },
      ttl
    );
  }

  /**
   * POST request (invalidates related cache)
   */
  async post<T>(endpoint: string, data: Record<string, unknown>, invalidatePatterns: string[] = []): Promise<T> {
    const response: AxiosResponse<T> = await api.post(endpoint, data);
    
    // Invalidate related cache patterns
    this.invalidateRelatedCache(endpoint, invalidatePatterns);
    
    return response.data;
  }

  /**
   * PUT request (invalidates related cache)
   */
  async put<T>(endpoint: string, data: Record<string, unknown>, invalidatePatterns: string[] = []): Promise<T> {
    const response: AxiosResponse<T> = await api.put(endpoint, data);
    
    // Invalidate related cache patterns
    this.invalidateRelatedCache(endpoint, invalidatePatterns);
    
    return response.data;
  }

  /**
   * DELETE request (invalidates related cache)
   */
  async delete<T>(endpoint: string, invalidatePatterns: string[] = []): Promise<T> {
    const response: AxiosResponse<T> = await api.delete(endpoint);
    
    // Invalidate related cache patterns
    this.invalidateRelatedCache(endpoint, invalidatePatterns);
    
    return response.data;
  }

  /**
   * PATCH request (invalidates related cache)
   */
  async patch<T>(endpoint: string, data: Record<string, unknown> = {}, invalidatePatterns: string[] = []): Promise<T> {
    const response: AxiosResponse<T> = await api.patch(endpoint, data);
    
    // Invalidate related cache patterns
    this.invalidateRelatedCache(endpoint, invalidatePatterns);
    
    return response.data;
  }

  /**
   * Invalidate cache patterns related to endpoint
   */
  private invalidateRelatedCache(endpoint: string, customPatterns: string[]): void {
    // Auto-detect patterns from endpoint
    const autoPatterns = this.getAutoInvalidationPatterns(endpoint);
    
    // Combine auto-detected and custom patterns
    const allPatterns = [...autoPatterns, ...customPatterns];
    
    allPatterns.forEach(pattern => {
      CacheInvalidator.invalidatePattern(pattern);
    });
  }

  /**
   * Generate auto-invalidation patterns from endpoint
   */
  private getAutoInvalidationPatterns(endpoint: string): string[] {
    const patterns: string[] = [];
    
    // Extract base resource from endpoint
    const parts = endpoint.split('/').filter(part => part && !Number.isInteger(Number(part)));
    
    if (parts.length > 0) {
      const resource = parts[0];
      patterns.push(`api_${resource}`);
      
      // Also invalidate stats endpoints
      patterns.push(`api_${resource}_stats`);
      patterns.push(`api_stats`);
      
      // Invalidate related resources
      if (resource === 'workers') {
        patterns.push('api_payroll');
        patterns.push('api_attendance');
      } else if (resource === 'orders') {
        patterns.push('api_clients');
        patterns.push('api_invoices');
      } else if (resource === 'materials') {
        patterns.push('api_inventory');
        patterns.push('api_orders');
      }
    }
    
    return patterns;
  }

  /**
   * Warm up cache for specific endpoints
   */
  async warmupEndpoint(endpoint: string, ttl: number = CacheTTL.LONG): Promise<void> {
    try {
      await this.get(endpoint, ttl);
      console.log(`🔥 Warmed up cache for: ${endpoint}`);
    } catch (error) {
      console.warn(`⚠️ Failed to warm up cache for: ${endpoint}`, error);
    }
  }

  /**
   * Preload multiple endpoints
   */
  async preloadEndpoints(endpoints: string[]): Promise<void> {
    const promises = endpoints.map(endpoint => this.warmupEndpoint(endpoint));
    await Promise.allSettled(promises);
  }
}

// Create singleton instance
const cachedApi = new CachedApiService();

// Cached API Services
export const cachedWorkerService = {
  getAll: () => cachedApi.get('/workers', CacheTTL.MEDIUM),
  getById: (id: number) => cachedApi.get(`/workers/${id}`, CacheTTL.LONG),
  create: (data: Record<string, unknown>) => cachedApi.post('/workers', data, ['api_workers']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/workers/${id}`, data, [`api_workers_${id}`, 'api_workers']),
  delete: (id: number) => cachedApi.delete(`/workers/${id}`, [`api_workers_${id}`, 'api_workers']),
  activate: (id: number) => cachedApi.patch(`/workers/${id}/activate`, {}, [`api_workers_${id}`, 'api_workers']),
  deactivate: (id: number) => cachedApi.patch(`/workers/${id}/deactivate`, {}, [`api_workers_${id}`, 'api_workers']),
};

export const cachedMaterialService = {
  getAll: () => cachedApi.get('/materials', CacheTTL.MEDIUM),
  getById: (id: number) => cachedApi.get(`/materials/${id}`, CacheTTL.LONG),
  create: (data: Record<string, unknown>) => cachedApi.post('/materials', data, ['api_materials']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/materials/${id}`, data, [`api_materials_${id}`, 'api_materials']),
  delete: (id: number) => cachedApi.delete(`/materials/${id}`, [`api_materials_${id}`, 'api_materials']),
  getLowStock: () => cachedApi.get('/materials/low-stock', CacheTTL.SHORT),
  updateStock: (id: number, data: Record<string, unknown>) => cachedApi.patch(`/materials/${id}/stock`, data, [`api_materials_${id}`, 'api_materials']),
};

export const cachedOrderService = {
  getAll: () => cachedApi.get('/orders', CacheTTL.MEDIUM),
  getById: (id: number) => cachedApi.get(`/orders/${id}`, CacheTTL.LONG),
  create: (data: Record<string, unknown>) => cachedApi.post('/orders', data, ['api_orders', 'api_clients']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/orders/${id}`, data, [`api_orders_${id}`, 'api_orders']),
  delete: (id: number) => cachedApi.delete(`/orders/${id}`, [`api_orders_${id}`, 'api_orders']),
  getByClient: (clientId: number) => cachedApi.get(`/orders/client/${clientId}`, CacheTTL.MEDIUM),
  updateStatus: (id: number, status: string) => cachedApi.patch(`/orders/${id}/status`, { status }, [`api_orders_${id}`, 'api_orders']),
  getStats: () => cachedApi.get('/orders/stats', CacheTTL.SHORT),
};

export const cachedClientService = {
  getAll: () => cachedApi.get('/clients', CacheTTL.LONG),
  getById: (id: number) => cachedApi.get(`/clients/${id}`, CacheTTL.LONG),
  create: (data: Record<string, unknown>) => cachedApi.post('/clients', data, ['api_clients']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/clients/${id}`, data, [`api_clients_${id}`, 'api_clients']),
  delete: (id: number) => cachedApi.delete(`/clients/${id}`, [`api_clients_${id}`, 'api_clients']),
  getWithStats: (id: number) => cachedApi.get(`/clients/${id}/stats`, CacheTTL.MEDIUM),
};

export const cachedInvoiceService = {
  getAll: () => cachedApi.get('/invoices', CacheTTL.MEDIUM),
  getById: (id: number) => cachedApi.get(`/invoices/${id}`, CacheTTL.LONG),
  create: (data: Record<string, unknown>) => cachedApi.post('/invoices', data, ['api_invoices', 'api_orders', 'api_clients']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/invoices/${id}`, data, [`api_invoices_${id}`, 'api_invoices']),
  delete: (id: number) => cachedApi.delete(`/invoices/${id}`, [`api_invoices_${id}`, 'api_invoices']),
  getByClient: (clientId: number) => cachedApi.get(`/invoices/client/${clientId}`, CacheTTL.MEDIUM),
  markAsPaid: (id: number) => cachedApi.patch(`/invoices/${id}/paid`, {}, [`api_invoices_${id}`, 'api_invoices']),
  getStats: () => cachedApi.get('/invoices/stats', CacheTTL.SHORT),
};

export const cachedPayrollService = {
  getAll: () => cachedApi.get('/payroll', CacheTTL.MEDIUM),
  getById: (id: number) => cachedApi.get(`/payroll/${id}`, CacheTTL.LONG),
  create: (data: Record<string, unknown>) => cachedApi.post('/payroll', data, ['api_payroll', 'api_workers']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/payroll/${id}`, data, [`api_payroll_${id}`, 'api_payroll']),
  delete: (id: number) => cachedApi.delete(`/payroll/${id}`, [`api_payroll_${id}`, 'api_payroll']),
  getWorkers: () => cachedApi.get('/payroll/workers', CacheTTL.MEDIUM),
  generatePayroll: (data: Record<string, unknown>) => cachedApi.post('/payroll/generate', data, ['api_payroll']),
  getStats: () => cachedApi.get('/payroll/stats', CacheTTL.SHORT),
};

export const cachedTaskService = {
  getAll: () => cachedApi.get('/tasks', CacheTTL.MEDIUM),
  getById: (id: number) => cachedApi.get(`/tasks/${id}`, CacheTTL.MEDIUM),
  create: (data: Record<string, unknown>) => cachedApi.post('/tasks', data, ['api_tasks', 'api_workers']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/tasks/${id}`, data, [`api_tasks_${id}`, 'api_tasks']),
  delete: (id: number) => cachedApi.delete(`/tasks/${id}`, [`api_tasks_${id}`, 'api_tasks']),
  getByWorker: (workerId: number) => cachedApi.get(`/tasks/worker/${workerId}`, CacheTTL.MEDIUM),
  updateStatus: (id: number, status: string) => cachedApi.patch(`/tasks/${id}/status`, { status }, [`api_tasks_${id}`, 'api_tasks']),
};

export const cachedAttendanceService = {
  getAll: () => cachedApi.get('/attendance', CacheTTL.SHORT),
  getById: (id: number) => cachedApi.get(`/attendance/${id}`, CacheTTL.MEDIUM),
  create: (data: Record<string, unknown>) => cachedApi.post('/attendance', data, ['api_attendance', 'api_workers']),
  update: (id: number, data: Record<string, unknown>) => cachedApi.put(`/attendance/${id}`, data, [`api_attendance_${id}`, 'api_attendance']),
  delete: (id: number) => cachedApi.delete(`/attendance/${id}`, [`api_attendance_${id}`, 'api_attendance']),
  getByWorker: (workerId: number) => cachedApi.get(`/attendance/worker/${workerId}`, CacheTTL.SHORT),
  getByDate: (date: string) => cachedApi.get(`/attendance/date/${date}`, CacheTTL.SHORT),
};

// Cache warming utilities
export const cacheWarmup = {
  // Warm up essential data
  warmupEssentials: async () => {
    console.log('🔥 Starting cache warmup for essential data...');
    await cachedApi.preloadEndpoints([
      '/workers',
      '/clients',
      '/orders/stats',
      '/payroll/stats',
      '/materials/low-stock'
    ]);
    console.log('✅ Essential cache warmup completed');
  },

  // Warm up all data
  warmupAll: async () => {
    console.log('🔥 Starting full cache warmup...');
    await cachedApi.preloadEndpoints([
      '/workers',
      '/materials',
      '/orders',
      '/clients',
      '/invoices',
      '/payroll',
      '/tasks',
      '/attendance',
      '/orders/stats',
      '/invoices/stats',
      '/payroll/stats'
    ]);
    console.log('✅ Full cache warmup completed');
  },

  // Warm up for specific page
  warmupForPage: async (page: string) => {
    const pageEndpoints: Record<string, string[]> = {
      dashboard: ['/orders/stats', '/invoices/stats', '/payroll/stats', '/materials/low-stock'],
      workers: ['/workers', '/payroll/workers'],
      orders: ['/orders', '/clients', '/orders/stats'],
      clients: ['/clients'],
      invoices: ['/invoices', '/clients', '/invoices/stats'],
      payroll: ['/payroll', '/payroll/workers', '/payroll/stats'],
      materials: ['/materials', '/materials/low-stock'],
      tasks: ['/tasks', '/workers'],
      attendance: ['/attendance', '/workers']
    };

    const endpoints = pageEndpoints[page] || [];
    if (endpoints.length > 0) {
      console.log(`🔥 Warming up cache for ${page} page...`);
      await cachedApi.preloadEndpoints(endpoints);
      console.log(`✅ Cache warmup for ${page} completed`);
    }
  }
};

// Export the cached API instance for advanced use
export { cachedApi };

// Re-export original services for backward compatibility
export * from './laravel';