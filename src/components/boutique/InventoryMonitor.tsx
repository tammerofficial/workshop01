import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import laravel from '../../api/laravel';

interface Product {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  manage_stock: boolean;
  category?: string;
  low_stock_threshold?: number;
}

interface InventoryMonitorProps {
  boutique_id: number;
  onLowStockAlert?: (products: Product[]) => void;
}

const InventoryMonitor: React.FC<InventoryMonitorProps> = ({
  boutique_id,
  onLowStockAlert
}) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // تحديث حالة المخزون
  const updateInventoryStatus = async () => {
    setIsLoading(true);
    try {
      // يمكن إضافة API خاص للحصول على حالة المخزون
      const response = await laravel.get('/products', {
        params: {
          manage_stock: true,
          boutique_id: boutique_id
        }
      });

      if (response.data) {
        const allProducts = response.data.data || response.data;
        setProducts(allProducts);

        // تصنيف المنتجات حسب حالة المخزون
        const lowStock = allProducts.filter((product: Product) => 
          product.manage_stock && 
          product.stock_quantity > 0 && 
          product.stock_quantity <= (product.low_stock_threshold || 5)
        );

        const outOfStock = allProducts.filter((product: Product) => 
          product.manage_stock && product.stock_quantity === 0
        );

        setLowStockProducts(lowStock);
        setOutOfStockProducts(outOfStock);
        setLastUpdated(new Date());

        // إشعار بالمنتجات منخفضة المخزون
        if (onLowStockAlert && lowStock.length > 0) {
          onLowStockAlert(lowStock);
        }
      }
    } catch (error) {
      console.error('Error updating inventory status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث المخزون عند تحميل المكون
  useEffect(() => {
    updateInventoryStatus();
    
    // تحديث دوري كل 5 دقائق
    const interval = setInterval(updateInventoryStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [boutique_id]);

  // حساب إحصائيات المخزون
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.stock_quantity > 0).length;
  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          {t('inventory.monitor')}
        </h3>
        
        <button
          onClick={updateInventoryStatus}
          disabled={isLoading}
          className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <div className="text-sm text-green-600">{t('inventory.available')}</div>
              <div className="text-lg font-semibold text-green-900">
                {availableProducts}/{totalProducts}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center">
            <TrendingDown className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <div className="text-sm text-gray-600">{t('inventory.outOfStock')}</div>
              <div className="text-lg font-semibold text-gray-900">
                {outOfStockCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تحذيرات المخزون المنخفض */}
      {lowStockCount > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h4 className="font-medium text-yellow-800">
              {t('inventory.lowStockAlert')} ({lowStockCount})
            </h4>
          </div>
          <div className="space-y-1">
            {lowStockProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="text-sm text-yellow-700">
                {product.name} - {t('inventory.remaining')}: {product.stock_quantity}
              </div>
            ))}
            {lowStockCount > 3 && (
              <div className="text-sm text-yellow-600">
                {t('inventory.andMore', { count: lowStockCount - 3 })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* منتجات نفد مخزونها */}
      {outOfStockCount > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="font-medium text-red-800">
              {t('inventory.outOfStockAlert')} ({outOfStockCount})
            </h4>
          </div>
          <div className="space-y-1">
            {outOfStockProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="text-sm text-red-700">
                {product.name} - {product.sku}
              </div>
            ))}
            {outOfStockCount > 3 && (
              <div className="text-sm text-red-600">
                {t('inventory.andMore', { count: outOfStockCount - 3 })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* معلومات آخر تحديث */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center">
          {t('inventory.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default InventoryMonitor;