import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Trash2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useCache } from '../../contexts/CacheContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import CacheStatusFallback from './CacheStatusFallback';

interface CacheStatusProps {
  className?: string;
  showDetails?: boolean;
}

const CacheStatus: React.FC<CacheStatusProps> = ({ className = '', showDetails = false }) => {
  const { t } = useLanguage();
  
  // Add error handling for useCache
  let cache;
  try {
    cache = useCache();
  } catch (error) {
    console.warn('CacheProvider not available, CacheStatus disabled:', error);
    // Return fallback component if cache is not available
    return <CacheStatusFallback className={className} />;
  }
  
  const [stats, setStats] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(cache.getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [cache]);

  const handleClearCache = async () => {
    setRefreshing(true);
    cache.clearAllCache();
    setTimeout(() => {
      setRefreshing(false);
      setStats(cache.getCacheStats());
    }, 500);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCacheHealthColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-500';
    if (hitRate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCacheHealthIcon = (hitRate: number) => {
    if (hitRate >= 80) return <CheckCircle className="w-4 h-4" />;
    if (hitRate >= 60) return <Clock className="w-4 h-4" />;
    return <RefreshCw className="w-4 h-4" />;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            cache.isLoading
              ? 'bg-blue-100 text-blue-600'
              : cache.cacheHitRate >= 80
              ? 'bg-green-100 text-green-600'
              : cache.cacheHitRate >= 60
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-red-100 text-red-600'
          }`}
          title={t('Cache Status')}
        >
          <Database className="w-3 h-3" />
          <span>{Math.round(cache.cacheHitRate)}%</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('Cache Status')}
            </h3>
          </div>
          <button
            onClick={handleClearCache}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('Clear Cache')}</span>
          </button>
        </div>

        {stats && (
          <div className="space-y-4">
            {/* Cache Hit Rate */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={getCacheHealthColor(stats.hitRate)}>
                  {getCacheHealthIcon(stats.hitRate)}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t('Hit Rate')}
                </span>
              </div>
              <span className={`font-bold ${getCacheHealthColor(stats.hitRate)}`}>
                {Math.round(stats.hitRate || 0)}%
              </span>
            </div>

            {/* Total Requests */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t('Total Requests')}
                </span>
              </div>
              <span className="font-bold text-blue-600">
                {stats.totalRequests || 0}
              </span>
            </div>

            {/* Memory Items */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t('Memory Items')}
                </span>
              </div>
              <span className="font-bold text-purple-600">
                {stats.memoryItems || 0}
              </span>
            </div>

            {/* Local Storage Items */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t('Local Storage Items')}
                </span>
              </div>
              <span className="font-bold text-green-600">
                {stats.localStorageItems || 0}
              </span>
            </div>

            {/* Session Storage Items */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t('Session Items')}
                </span>
              </div>
              <span className="font-bold text-yellow-600">
                {stats.sessionStorageItems || 0}
              </span>
            </div>

            {/* Cache Performance Indicator */}
            <div className="mt-4 p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('Performance')}
                </span>
                <span className={`text-sm font-bold ${getCacheHealthColor(stats.hitRate)}`}>
                  {stats.hitRate >= 80 ? t('Excellent') : 
                   stats.hitRate >= 60 ? t('Good') : t('Needs Improvement')}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    stats.hitRate >= 80 ? 'bg-green-500' :
                    stats.hitRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(stats.hitRate || 0, 5)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cache Details Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('Cache Details')}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>{t('Loading State')}:</strong> {cache.isLoading ? t('Loading') : t('Idle')}</p>
                  <p><strong>{t('Hit Rate')}:</strong> {Math.round(cache.cacheHitRate)}%</p>
                  {stats && (
                    <>
                      <p><strong>{t('Total Requests')}:</strong> {stats.totalRequests}</p>
                      <p><strong>{t('Cache Items')}:</strong> {(stats.memoryItems || 0) + (stats.localStorageItems || 0) + (stats.sessionStorageItems || 0)}</p>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleClearCache}
                    disabled={refreshing}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{t('Clear All Cache')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CacheStatus;