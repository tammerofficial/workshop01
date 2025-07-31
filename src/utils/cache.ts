/**
 * Advanced Caching System
 * نظام كاش متقدم للبيانات والصفحات
 */

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
  key: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxItems: number;
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager {
  private memoryCache: Map<string, CacheItem> = new Map();
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes default
    maxItems: 100,
    storageType: 'localStorage'
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // تنظيف الكاش المنتهي الصلاحية كل دقيقة
    setInterval(() => this.cleanExpiredCache(), 60 * 1000);
  }

  /**
   * حفظ البيانات في الكاش
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    };

    try {
      switch (this.config.storageType) {
        case 'memory':
          this.setMemoryCache(key, cacheItem);
          break;
        case 'localStorage':
          this.setStorageCache(key, cacheItem, localStorage);
          break;
        case 'sessionStorage':
          this.setStorageCache(key, cacheItem, sessionStorage);
          break;
      }
    } catch (error) {
      console.warn('Cache storage failed, falling back to memory:', error);
      this.setMemoryCache(key, cacheItem);
    }
  }

  /**
   * استرجاع البيانات من الكاش
   */
  get<T>(key: string): T | null {
    try {
      let cacheItem: CacheItem<T> | null = null;

      switch (this.config.storageType) {
        case 'memory':
          cacheItem = this.getMemoryCache<T>(key);
          break;
        case 'localStorage':
          cacheItem = this.getStorageCache<T>(key, localStorage);
          break;
        case 'sessionStorage':
          cacheItem = this.getStorageCache<T>(key, sessionStorage);
          break;
      }

      if (!cacheItem) return null;

      // فحص انتهاء الصلاحية
      if (this.isExpired(cacheItem)) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * حذف عنصر من الكاش
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    
    try {
      localStorage.removeItem(`cache_${key}`);
      sessionStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Cache deletion failed:', error);
    }
  }

  /**
   * مسح جميع الكاش
   */
  clear(): void {
    this.memoryCache.clear();
    
    try {
      // مسح جميع عناصر الكاش من localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // مسح جميع عناصر الكاش من sessionStorage
      keysToRemove.length = 0;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * تحديث TTL لعنصر موجود
   */
  updateTTL(key: string, newTTL: number): boolean {
    const item = this.get(key);
    if (item) {
      this.set(key, item, newTTL);
      return true;
    }
    return false;
  }

  /**
   * فحص وجود الكاش وصلاحيته
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * الحصول على حالة الكاش
   */
  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      localStorageItems: this.getStorageItemCount(localStorage),
      sessionStorageItems: this.getStorageItemCount(sessionStorage),
      config: this.config
    };
  }

  // Private methods
  private setMemoryCache<T>(key: string, item: CacheItem<T>): void {
    // التحقق من الحد الأقصى للعناصر
    if (this.memoryCache.size >= this.config.maxItems) {
      // حذف أقدم عنصر
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    
    this.memoryCache.set(key, item);
  }

  private getMemoryCache<T>(key: string): CacheItem<T> | null {
    return this.memoryCache.get(key) as CacheItem<T> || null;
  }

  private setStorageCache<T>(key: string, item: CacheItem<T>, storage: Storage): void {
    const serialized = JSON.stringify(item);
    storage.setItem(`cache_${key}`, serialized);
  }

  private getStorageCache<T>(key: string, storage: Storage): CacheItem<T> | null {
    const serialized = storage.getItem(`cache_${key}`);
    if (!serialized) return null;
    
    try {
      return JSON.parse(serialized) as CacheItem<T>;
    } catch {
      storage.removeItem(`cache_${key}`);
      return null;
    }
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanExpiredCache(): void {
    // تنظيف memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
      }
    }

    // تنظيف localStorage
    this.cleanStorageCache(localStorage);
    // تنظيف sessionStorage
    this.cleanStorageCache(sessionStorage);
  }

  private cleanStorageCache(storage: Storage): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const item = JSON.parse(storage.getItem(key) || '');
            if (this.isExpired(item)) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key); // حذف البيانات التالفة
          }
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.warn('Storage cache cleanup failed:', error);
    }
  }

  private getStorageItemCount(storage: Storage): number {
    let count = 0;
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('cache_')) {
          count++;
        }
      }
    } catch (error) {
      console.warn('Storage item count failed:', error);
    }
    return count;
  }
}

// Cache instances for different use cases
export const apiCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for API data
  maxItems: 200,
  storageType: 'localStorage'
});

export const pageCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for page data
  maxItems: 50,
  storageType: 'sessionStorage'
});

export const userCache = new CacheManager({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for user-specific data
  maxItems: 100,
  storageType: 'localStorage'
});

/**
 * Cache TTL presets
 */
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  PERSISTENT: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Helper function for cached API calls
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  // تحقق من وجود البيانات في الكاش
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // جلب البيانات من API
  try {
    const data = await fetchFn();
    apiCache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`Failed to fetch data for key: ${key}`, error);
    throw error;
  }
}

/**
 * Cache invalidation utilities
 */
export const CacheInvalidator = {
  // إبطال كاش معين
  invalidate: (key: string) => {
    apiCache.delete(key);
    pageCache.delete(key);
    userCache.delete(key);
  },

  // إبطال الكاش بناءً على pattern
  invalidatePattern: (pattern: string) => {
    const regex = new RegExp(pattern);
    
    // تنظيف localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && regex.test(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // تنظيف sessionStorage
    keysToRemove.length = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cache_') && regex.test(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  },

  // إبطال جميع كاش API
  invalidateAllAPI: () => {
    apiCache.clear();
  },

  // إبطال كاش المستخدم
  invalidateUser: () => {
    userCache.clear();
  }
};

export default CacheManager;