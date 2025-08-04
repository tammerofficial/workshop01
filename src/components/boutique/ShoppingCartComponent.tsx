import React from 'react';
import { Trash2, Plus, Minus, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  category?: string;
  manage_stock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface ShoppingCartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const { t } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">{t('pos.emptyCart')}</p>
        <p className="text-sm text-gray-400 mt-1">{t('pos.addProductsToStart')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {cart.map((item) => (
        <div
          key={item.product.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {item.product.name}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>SKU: {item.product.sku}</span>
              <span>•</span>
              <span className="font-medium text-green-600">
                {item.unit_price.toFixed(3)} {t('common.currency')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-3">
            {/* أدوات التحكم في الكمية */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 rounded-l-lg"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              
              <span className="px-3 py-1 text-center min-w-[3rem] border-x border-gray-300">
                {item.quantity}
              </span>
              
              <button
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                disabled={
                  item.product.manage_stock && 
                  item.quantity >= item.product.stock_quantity
                }
                className="p-1 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* المجموع الفرعي */}
            <div className="text-right min-w-[5rem]">
              <div className="font-semibold text-gray-900">
                {item.line_total.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500">
                {t('common.currency')}
              </div>
            </div>

            {/* زر الحذف */}
            <button
              onClick={() => onRemoveItem(item.product.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('pos.removeFromCart')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* معلومات إضافية */}
      <div className="pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {t('pos.totalItems')}: {cart.reduce((total, item) => total + item.quantity, 0)}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartComponent;