import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { apiCache, pageCache, userCache, CacheTTL, cachedFetch, CacheInvalidator } from '../utils/cache';

interface CacheContextType {
  // API Caching
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, ttl?: number) => void;
  invalidateCache: (key: string) => void;
  invalidatePattern: (pattern: string) => void;
  
  // Cached fetch wrapper
  fetchWithCache: <T>(key: string, fetchFn: () => Promise<T>, ttl?: number) => Promise<T>;
  
  // Cache stats and management
  getCacheStats: () => any;
  clearAllCache: () => void;
  
  // Pre-defined cache functions for common data
  getCachedWorkers: () => any[] | null;
  setCachedWorkers: (workers: any[], ttl?: number) => void;
  invalidateWorkers: () => void;
  
  getCachedOrders: () => any[] | null;
  setCachedOrders: (orders: any[], ttl?: number) => void;
  invalidateOrders: () => void;
  
  getCachedClients: () => any[] | null;
  setCachedClients: (clients: any[], ttl?: number) => void;
  invalidateClients: () => void;
  
  getCachedInvoices: () => any[] | null;
  setCachedInvoices: (invoices: any[], ttl?: number) => void;
  invalidateInvoices: () => void;
  
  getCachedPayrolls: () => any[] | null;
  setCachedPayrolls: (payrolls: any[], ttl?: number) => void;
  invalidatePayrolls: () => void;
  
  getCachedMaterials: () => any[] | null;
  setCachedMaterials: (materials: any[], ttl?: number) => void;
  invalidateMaterials: () => void;
  
  // Cache warming functions
  warmupCache: () => Promise<void>;
  
  // Cache status
  isLoading: boolean;
  cacheHitRate: number;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export function CacheProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [cacheHitRate, setCacheHitRate] = useState(0);
  const [stats, setStats] = useState({ hits: 0, misses: 0 });

  // Track cache hit rate
  const trackCacheHit = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, hits: prev.hits + 1 };
      setCacheHitRate((newStats.hits / (newStats.hits + newStats.misses)) * 100);
      return newStats;
    });
  }, []);

  const trackCacheMiss = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, misses: prev.misses + 1 };
      setCacheHitRate((newStats.hits / (newStats.hits + newStats.misses)) * 100);
      return newStats;
    });
  }, []);

  // Generic cache functions
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    const data = apiCache.get<T>(key);
    if (data !== null) {
      trackCacheHit();
    } else {
      trackCacheMiss();
    }
    return data;
  }, [trackCacheHit, trackCacheMiss]);

  const setCachedData = useCallback(<T,>(key: string, data: T, ttl?: number) => {
    apiCache.set(key, data, ttl);
  }, []);

  const invalidateCache = useCallback((key: string) => {
    CacheInvalidator.invalidate(key);
  }, []);

  const invalidatePattern = useCallback((pattern: string) => {
    CacheInvalidator.invalidatePattern(pattern);
  }, []);

  // Cached fetch wrapper with loading state
  const fetchWithCache = useCallback(async <T,>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await cachedFetch(key, fetchFn, ttl);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cache stats
  const getCacheStats = useCallback(() => {
    return {
      ...apiCache.getStats(),
      hitRate: cacheHitRate,
      totalRequests: stats.hits + stats.misses
    };
  }, [cacheHitRate, stats]);

  const clearAllCache = useCallback(() => {
    apiCache.clear();
    pageCache.clear();
    userCache.clear();
    setStats({ hits: 0, misses: 0 });
    setCacheHitRate(0);
  }, []);

  // Specific cache functions for common entities
  const getCachedWorkers = useCallback(() => getCachedData<any[]>('workers'), [getCachedData]);
  const setCachedWorkers = useCallback((workers: any[], ttl = CacheTTL.MEDIUM) => {
    setCachedData('workers', workers, ttl);
  }, [setCachedData]);
  const invalidateWorkers = useCallback(() => {
    invalidatePattern('workers');
    invalidateCache('worker_');
  }, [invalidatePattern, invalidateCache]);

  const getCachedOrders = useCallback(() => getCachedData<any[]>('orders'), [getCachedData]);
  const setCachedOrders = useCallback((orders: any[], ttl = CacheTTL.MEDIUM) => {
    setCachedData('orders', orders, ttl);
  }, [setCachedData]);
  const invalidateOrders = useCallback(() => {
    invalidatePattern('orders');
    invalidateCache('order_');
  }, [invalidatePattern, invalidateCache]);

  const getCachedClients = useCallback(() => getCachedData<any[]>('clients'), [getCachedData]);
  const setCachedClients = useCallback((clients: any[], ttl = CacheTTL.MEDIUM) => {
    setCachedData('clients', clients, ttl);
  }, [setCachedData]);
  const invalidateClients = useCallback(() => {
    invalidatePattern('clients');
    invalidateCache('client_');
  }, [invalidatePattern, invalidateCache]);

  const getCachedInvoices = useCallback(() => getCachedData<any[]>('invoices'), [getCachedData]);
  const setCachedInvoices = useCallback((invoices: any[], ttl = CacheTTL.MEDIUM) => {
    setCachedData('invoices', invoices, ttl);
  }, [setCachedData]);
  const invalidateInvoices = useCallback(() => {
    invalidatePattern('invoices');
    invalidateCache('invoice_');
  }, [invalidatePattern, invalidateCache]);

  const getCachedPayrolls = useCallback(() => getCachedData<any[]>('payrolls'), [getCachedData]);
  const setCachedPayrolls = useCallback((payrolls: any[], ttl = CacheTTL.MEDIUM) => {
    setCachedData('payrolls', payrolls, ttl);
  }, [setCachedData]);
  const invalidatePayrolls = useCallback(() => {
    invalidatePattern('payrolls');
    invalidateCache('payroll_');
  }, [invalidatePattern, invalidateCache]);

  const getCachedMaterials = useCallback(() => getCachedData<any[]>('materials'), [getCachedData]);
  const setCachedMaterials = useCallback((materials: any[], ttl = CacheTTL.MEDIUM) => {
    setCachedData('materials', materials, ttl);
  }, [setCachedData]);
  const invalidateMaterials = useCallback(() => {
    invalidatePattern('materials');
    invalidateCache('material_');
  }, [invalidatePattern, invalidateCache]);

  // Cache warming - pre-load common data
  const warmupCache = useCallback(async () => {
    console.log('🔥 Warming up cache...');
    try {
      // This would typically pre-load commonly accessed data
      // Implementation depends on your API structure
      const warmupPromises = [
        // You can add specific warmup calls here
      ];
      
      await Promise.allSettled(warmupPromises);
      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.warn('⚠️ Cache warmup failed:', error);
    }
  }, []);

  // Auto-warmup on mount
  useEffect(() => {
    // warmupCache(); // Enable if you want automatic cache warming
  }, []);

  // Periodic cache cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Cache stats logging (optional)
      const currentStats = getCacheStats();
      console.log('📊 Cache Stats:', currentStats);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanup);
  }, [getCacheStats]);

  const value: CacheContextType = {
    getCachedData,
    setCachedData,
    invalidateCache,
    invalidatePattern,
    fetchWithCache,
    getCacheStats,
    clearAllCache,
    
    getCachedWorkers,
    setCachedWorkers,
    invalidateWorkers,
    
    getCachedOrders,
    setCachedOrders,
    invalidateOrders,
    
    getCachedClients,
    setCachedClients,
    invalidateClients,
    
    getCachedInvoices,
    setCachedInvoices,
    invalidateInvoices,
    
    getCachedPayrolls,
    setCachedPayrolls,
    invalidatePayrolls,
    
    getCachedMaterials,
    setCachedMaterials,
    invalidateMaterials,
    
    warmupCache,
    isLoading,
    cacheHitRate
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}

export default CacheContext;