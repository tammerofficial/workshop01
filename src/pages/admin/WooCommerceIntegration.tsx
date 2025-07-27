import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { wooCommerceService } from '../../api/woocommerce';

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

interface SyncStatus {
  connected: boolean;
  testing: boolean;
  syncing: boolean;
  lastSync: string | null;
}

export default function WooCommerceIntegration() {
  const { t, isRTL } = useLanguage();
  const [config, setConfig] = useState<WooCommerceConfig>({
    url: 'https://hudaaljarallah.net/',
    consumerKey: 'ck_3a5c739c20336c33cbee2453cccf56a6441ef6fe',
    consumerSecret: 'cs_b091ba4fb33a6e4b10612c536db882fe0fa8c6aa'
  });
  
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    testing: false,
    syncing: false,
    lastSync: null
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({
    type: '',
    text: ''
  });

  // Load saved configuration on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('woocommerce_config');
    const savedLastSync = localStorage.getItem('woocommerce_last_sync');
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    if (savedLastSync) {
      setStatus(prev => ({ ...prev, lastSync: savedLastSync }));
    }
  }, []);

  const handleConfigChange = (field: keyof WooCommerceConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfiguration = () => {
    localStorage.setItem('woocommerce_config', JSON.stringify(config));
    setMessage({ type: 'success', text: t('woocommerce.success.saved') });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, testing: true }));
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8000/api/woocommerce/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: config.url,
          consumer_key: config.consumerKey,
          consumer_secret: config.consumerSecret
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStatus(prev => ({ ...prev, connected: true, testing: false }));
        setMessage({ type: 'success', text: t('woocommerce.success.connected') });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, connected: false, testing: false }));
      setMessage({ type: 'error', text: t('woocommerce.error.connection') });
    }
  };

  const syncData = async (type: 'products' | 'orders' | 'customers' | 'all') => {
    setStatus(prev => ({ ...prev, syncing: true }));
    setMessage({ type: '', text: '' });

    try {
      let result;
      
      if (type === 'all') {
        const response = await fetch('http://localhost:8000/api/woocommerce/sync-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: config.url,
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret
          })
        });
        result = await response.json();
      } else {
        if (type === 'products') {
          result = await syncProducts();
        } else if (type === 'orders') {
          result = await syncOrders();
        } else if (type === 'customers') {
          result = await syncCustomers();
        }
      }

      if (result.success) {
        const now = new Date().toISOString();
        localStorage.setItem('woocommerce_last_sync', now);
        setStatus(prev => ({ ...prev, syncing: false, lastSync: now }));
        setMessage({ type: 'success', text: result.message || t('woocommerce.success.synced') });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, syncing: false }));
      setMessage({ type: 'error', text: t('woocommerce.error.sync') });
    }
  };

  const syncProducts = async () => {
    // Use Laravel API endpoint for syncing
    const response = await fetch('http://localhost:8000/api/woocommerce/sync-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: config.url,
        consumer_key: config.consumerKey,
        consumer_secret: config.consumerSecret
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync products');
    }
    
    return await response.json();
  };

  const syncOrders = async () => {
    const response = await fetch('http://localhost:8000/api/woocommerce/sync-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: config.url,
        consumer_key: config.consumerKey,
        consumer_secret: config.consumerSecret
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync orders');
    }
    
    return await response.json();
  };

  const syncCustomers = async () => {
    const response = await fetch('http://localhost:8000/api/woocommerce/sync-customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: config.url,
        consumer_key: config.consumerKey,
        consumer_secret: config.consumerSecret
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync customers');
    }
    
    return await response.json();
  };



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('woocommerce.title')}</h1>
        <p className="text-gray-600 mt-2">{t('woocommerce.subtitle')}</p>
      </div>

      {/* Status Indicator */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 
              className="text-lg font-semibold text-gray-900"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'calc(var(--font-size) * 1.125)',
                fontWeight: 'var(--font-weight)',
                lineHeight: 'var(--line-height)'
              }}
            >
              WooCommerce Integration
            </h3>
            <p 
              className="text-sm text-gray-600"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--font-size)',
                fontWeight: 'var(--font-weight)',
                lineHeight: 'var(--line-height)'
              }}
            >
              Connect and sync with your WooCommerce store
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.connected ? t('woocommerce.status.connected') : t('woocommerce.status.disconnected')}
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('woocommerce.config.title')}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('woocommerce.config.url')}
            </label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourstore.com/"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('woocommerce.config.consumerKey')}
            </label>
            <input
              type="text"
              value={config.consumerKey}
              onChange={(e) => handleConfigChange('consumerKey', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ck_..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('woocommerce.config.consumerSecret')}
            </label>
            <input
              type="password"
              value={config.consumerSecret}
              onChange={(e) => handleConfigChange('consumerSecret', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cs_..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveConfiguration}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('woocommerce.config.save')}
            </button>
            
            <button
              onClick={testConnection}
              disabled={status.testing}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {status.testing ? t('woocommerce.status.testing') : t('woocommerce.config.test')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Synchronization Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('woocommerce.sync.title')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => syncData('products')}
            disabled={status.syncing || !status.connected}
            className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {t('woocommerce.sync.products')}
          </button>
          
          <button
            onClick={() => syncData('orders')}
            disabled={status.syncing || !status.connected}
            className="bg-orange-600 text-white px-4 py-3 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {t('woocommerce.sync.orders')}
          </button>
          
          <button
            onClick={() => syncData('customers')}
            disabled={status.syncing || !status.connected}
            className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {t('woocommerce.sync.customers')}
          </button>
          
          <button
            onClick={() => syncData('all')}
            disabled={status.syncing || !status.connected}
            className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {status.syncing ? t('woocommerce.status.syncing') : t('woocommerce.sync.all')}
          </button>
        </div>
      </motion.div>

      {/* Message Display */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}
    </div>
  );
} 