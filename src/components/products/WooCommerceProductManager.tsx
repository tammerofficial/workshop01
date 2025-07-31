import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Sync, 
  Package, 
  ShoppingCart,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Globe,
  Database
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface WooCommerceStats {
  total_wc_products: number;
  imported_products: number;
  not_imported: number;
  last_import_date: string | null;
  import_percentage: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  product_type: string;
  price: number;
  stock_quantity: number;
  woocommerce_id: number;
  is_active: boolean;
  image_url?: string;
  category?: {
    id: number;
    name: string;
  };
}

const WooCommerceProductManager: React.FC = () => {
  const { isDark } = useTheme();
  
  // State
  const [stats, setStats] = useState<WooCommerceStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showOnlyWooCommerce, setShowOnlyWooCommerce] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadStats();
    loadProducts();
  }, [currentPage, showOnlyWooCommerce, searchTerm]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/products/woocommerce/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading WooCommerce stats:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      let url = `/api/products?page=${currentPage}&per_page=20`;
      
      if (showOnlyWooCommerce) {
        url += '&woocommerce_only=true';
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setProducts(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleImportBatch = async () => {
    try {
      setImporting(true);
      
      const response = await fetch('/api/products/woocommerce/import-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          batch_size: 50,
          update_existing: true
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`تم استيراد ${data.stats.created + data.stats.updated} منتج بنجاح`);
        loadStats();
        loadProducts();
      } else {
        toast.error(data.message || 'خطأ في استيراد المنتجات');
      }
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('خطأ في استيراد المنتجات');
    } finally {
      setImporting(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      
      const response = await fetch('/api/products/woocommerce/run-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_size: 100,
          update_existing: true
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('بدأت عملية مزامنة جميع المنتجات');
        // Reload stats every 10 seconds to track progress
        const interval = setInterval(() => {
          loadStats();
        }, 10000);
        
        setTimeout(() => {
          clearInterval(interval);
          loadProducts();
        }, 60000); // Stop after 1 minute
      } else {
        toast.error(data.message || 'خطأ في بدء عملية المزامنة');
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      toast.error('خطأ في مزامنة المنتجات');
    } finally {
      setSyncing(false);
    }
  };

  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    description?: string;
  }> = ({ title, value, icon: Icon, color, description }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            SKU: {product.sku}
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">السعر:</span>
              <span className="text-sm font-medium text-green-600">${product.price}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">المخزون:</span>
              <span className="text-sm font-medium">{product.stock_quantity}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            {product.woocommerce_id && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Globe className="h-3 w-3 mr-1" />
                WooCommerce
              </span>
            )}
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.is_active 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {product.is_active ? 'نشط' : 'غير نشط'}
            </span>
            
            {product.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">منتجات WooCommerce</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة المنتجات المستوردة من WooCommerce ({stats?.imported_products || 0} منتج)
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleImportBatch}
            disabled={importing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {importing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            استيراد دفعة
          </button>
          
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {syncing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Sync className="h-4 w-4" />
            )}
            مزامنة الكل
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="إجمالي منتجات WooCommerce"
            value={stats.total_wc_products}
            icon={Globe}
            color="blue"
            description="في المتجر الإلكتروني"
          />
          
          <StatsCard
            title="المنتجات المستوردة"
            value={stats.imported_products}
            icon={Database}
            color="green"
            description="في قاعدة البيانات"
          />
          
          <StatsCard
            title="غير مستوردة"
            value={stats.not_imported}
            icon={AlertTriangle}
            color={stats.not_imported > 0 ? "orange" : "gray"}
            description="تحتاج استيراد"
          />
          
          <StatsCard
            title="نسبة الاستيراد"
            value={`${stats.import_percentage.toFixed(1)}%`}
            icon={CheckCircle}
            color={stats.import_percentage === 100 ? "green" : "blue"}
            description={stats.last_import_date ? `آخر استيراد: ${new Date(stats.last_import_date).toLocaleDateString('ar-EG')}` : 'لم يتم الاستيراد بعد'}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">البحث</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">التصفية</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showOnlyWooCommerce}
                  onChange={(e) => setShowOnlyWooCommerce(e.target.checked)}
                  className="rounded"
                />
                <span className="ml-2 text-sm">منتجات WooCommerce فقط</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadProducts}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            المنتجات ({products.length})
          </h2>
          
          {/* Pagination Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            صفحة {currentPage} من {totalPages}
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                >
                  السابق
                </button>
                
                <span className="px-4 py-2">
                  {currentPage} من {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-gray-500">
              {showOnlyWooCommerce 
                ? 'لم يتم استيراد أي منتجات من WooCommerce بعد'
                : 'لا توجد منتجات مطابقة للبحث'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WooCommerceProductManager;