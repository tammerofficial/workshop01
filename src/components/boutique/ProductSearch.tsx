import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import laravel from '../../api/laravel';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  category?: string;
  manage_stock: boolean;
}

interface ProductSearchProps {
  onProductSelect: (product: Product, quantity?: number) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: number]: number }>({});

  // البحث عن المنتجات
  const searchProducts = async (term: string) => {
    if (term.length < 2) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await laravel.post('/boutique/pos/search-products', {
        search_term: term,
        boutique_id: 1 // يجب الحصول على هذا من السياق
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Product search error:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // استخدام debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // تحديث الكمية المحددة لمنتج
  const updateQuantity = (productId: number, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // إضافة منتج للسلة
  const handleAddProduct = (product: Product) => {
    const quantity = selectedQuantities[product.id] || 1;
    
    // التحقق من المخزون
    if (product.manage_stock && quantity > product.stock_quantity) {
      alert(t('pos.insufficientStock'));
      return;
    }

    onProductSelect(product, quantity);
    
    // إعادة تعيين الكمية
    setSelectedQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  return (
    <div className="space-y-4">
      {/* شريط البحث */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t('pos.searchProducts')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          autoFocus
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* نتائج البحث */}
      <div className="max-h-96 overflow-y-auto">
        {products.length > 0 ? (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Package className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.category && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>SKU: {product.sku}</span>
                    <span className="font-medium text-green-600">
                      {product.price.toFixed(3)} {t('common.currency')}
                    </span>
                    
                    {/* حالة المخزون */}
                    <div className="flex items-center">
                      {product.manage_stock ? (
                        product.stock_quantity > 0 ? (
                          <span className="text-green-600">
                            {t('pos.inStock')}: {product.stock_quantity}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {t('pos.outOfStock')}
                          </span>
                        )
                      ) : (
                        <span className="text-blue-600">{t('pos.unlimitedStock')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* أدوات التحكم */}
                <div className="flex items-center space-x-3 ml-4">
                  {/* محدد الكمية */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">{t('pos.quantity')}:</label>
                    <input
                      type="number"
                      min="1"
                      max={product.manage_stock ? product.stock_quantity : 999}
                      value={selectedQuantities[product.id] || 1}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* زر الإضافة */}
                  <button
                    onClick={() => handleAddProduct(product)}
                    disabled={product.manage_stock && product.stock_quantity === 0}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('pos.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm.length >= 2 && !isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('pos.noProductsFound')}</p>
            <p className="text-sm mt-1">{t('pos.tryDifferentSearch')}</p>
          </div>
        ) : searchTerm.length >= 2 && isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">{t('pos.searching')}</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <p>{t('pos.startTyping')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;