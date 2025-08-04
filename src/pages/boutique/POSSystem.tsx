import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ShoppingCart, Search, Users, CreditCard, Receipt, Package } from 'lucide-react';
import ProductSearch from '../../components/boutique/ProductSearch';
import ShoppingCartComponent from '../../components/boutique/ShoppingCartComponent';
import LoyaltyCustomerSearch from '../../components/boutique/LoyaltyCustomerSearch';
import PaymentModal from '../../components/boutique/PaymentModal';
import ReceiptPrinter from '../../components/boutique/ReceiptPrinter';
import InventoryMonitor from '../../components/boutique/InventoryMonitor';
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

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface LoyaltyCustomer {
  loyalty_customer_id: number;
  client_id: number;
  membership_number: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  available_points: number;
  total_points: number;
  tier_multiplier: number;
  wallet_enabled: boolean;
  can_earn_points: boolean;
  points_per_kwd: number;
}

const POSSystem: React.FC = () => {
  const { t, language } = useLanguage();
  const { hasPermission } = usePermissions();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // التحقق من الصلاحيات
  const canOperate = hasPermission('pos.operate');
  const canDiscount = hasPermission('pos.discount');

  useEffect(() => {
    // التحقق من إذن التشغيل
    if (!canOperate) {
      alert(t('pos.noPermission'));
      return;
    }
  }, [canOperate, t]);

  // إضافة منتج للسلة
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      // تحديث الكمية للمنتج الموجود
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].line_total = 
        updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].unit_price;
      setCart(updatedCart);
    } else {
      // إضافة منتج جديد
      const newItem: CartItem = {
        product,
        quantity,
        unit_price: product.price,
        line_total: quantity * product.price
      };
      setCart([...cart, newItem]);
    }
  };

  // إزالة منتج من السلة
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // تحديث كمية منتج في السلة
  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          line_total: newQuantity * item.unit_price
        };
      }
      return item;
    });
    setCart(updatedCart);
  };

  // حساب إجمالي السلة
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.line_total, 0);
  };

  // مسح السلة
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPointsToUse(0);
  };

  // معالجة البيع
  const processSale = async (paymentMethod: string, paidAmount?: number) => {
    if (cart.length === 0) {
      alert(t('pos.emptyCart'));
      return;
    }

    setIsProcessingSale(true);
    
    try {
      const saleData = {
        boutique_id: 1, // يجب الحصول على هذا من السياق
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        payment_method: paymentMethod,
        loyalty_customer_id: selectedCustomer?.loyalty_customer_id || null,
        points_to_use: pointsToUse
      };

      const response = await laravel.post('/boutique/pos/create-sale', saleData);
      
      if (response.data.success) {
        // إنشاء بيانات الإيصال
        const receiptData = {
          invoice_number: response.data.data.invoice_number,
          sale_date: new Date().toISOString(),
          boutique_name: 'البوتيك الرئيسي', // يجب الحصول على هذا من السياق
          cashier_name: 'الكاشير', // يجب الحصول على هذا من بيانات المستخدم
          items: cart,
          subtotal: calculateSubtotal(),
          discount_amount: 0,
          loyalty_discount: pointsToUse / 100,
          tax_amount: 0,
          total_amount: response.data.data.total_amount,
          paid_amount: response.data.data.total_amount,
          change_amount: 0,
          payment_method: paymentMethod,
          customer: selectedCustomer,
          loyalty_points_used: pointsToUse,
          loyalty_points_earned: response.data.data.loyalty_points_earned || 0,
        };

        setLastSaleReceipt(receiptData);
        setShowReceiptModal(true);
        clearCart();
        setShowPaymentModal(false);
      } else {
        alert(t('pos.saleError'));
      }
    } catch (error) {
      console.error('Sale processing error:', error);
      alert(t('pos.saleError'));
    } finally {
      setIsProcessingSale(false);
    }
  };

  if (!canOperate) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {t('pos.accessDenied')}
          </h2>
          <p className="text-gray-500">
            {t('pos.contactManager')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* العمود الأيسر - البحث والمنتجات */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <CreditCard className="mr-3" />
              {t('pos.title')}
            </h1>
            
            {/* معلومات العميل */}
            {selectedCustomer && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">{selectedCustomer.name}</div>
                    <div className="text-sm opacity-90">
                      {selectedCustomer.available_points} {t('loyalty.points')} • {selectedCustomer.tier}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* بحث العملاء */}
          <div className="mb-6">
            <LoyaltyCustomerSearch
              onCustomerSelect={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
            />
          </div>

          {/* بحث المنتجات */}
          <ProductSearch onProductSelect={addToCart} />
        </div>

        {/* مراقب المخزون */}
        <div className="mt-6">
          <InventoryMonitor 
            boutique_id={1} 
            onLowStockAlert={(products) => {
              console.log('Low stock alert:', products);
              // يمكن إضافة إشعارات هنا
            }}
          />
        </div>
      </div>

      {/* العمود الأيمن - السلة والدفع */}
      <div className="w-96 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShoppingCart className="mr-2" />
              {t('pos.cart')}
            </h2>
            
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-800"
              >
                {t('pos.clearCart')}
              </button>
            )}
          </div>

          {/* عناصر السلة */}
          <ShoppingCartComponent
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
          />
        </div>

        {/* ملخص المبلغ */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('pos.subtotal')}</span>
              <span>{calculateSubtotal().toFixed(3)} {t('common.currency')}</span>
            </div>
            
            {selectedCustomer && pointsToUse > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t('loyalty.pointsDiscount')}</span>
                <span>-{(pointsToUse / 100).toFixed(3)} {t('common.currency')}</span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>{t('pos.total')}</span>
                <span>
                  {(calculateSubtotal() - (pointsToUse / 100)).toFixed(3)} {t('common.currency')}
                </span>
              </div>
            </div>
          </div>

          {/* استخدام نقاط الولاء */}
          {selectedCustomer && selectedCustomer.available_points > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                {t('loyalty.usePoints')} ({t('loyalty.available')}: {selectedCustomer.available_points})
              </label>
              <input
                type="number"
                min="0"
                max={Math.min(selectedCustomer.available_points, calculateSubtotal() * 100)}
                value={pointsToUse}
                onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('loyalty.enterPoints')}
              />
              <div className="text-xs text-blue-600 mt-1">
                {t('loyalty.conversionRate')}: 100 {t('loyalty.points')} = 1 {t('common.currency')}
              </div>
            </div>
          )}
        </div>

        {/* أزرار الدفع */}
        <div className="p-6">
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0 || isProcessingSale}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessingSale ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('pos.processing')}
              </div>
            ) : (
              <>
                <Receipt className="w-4 h-4 mr-2" />
                {t('pos.processSale')}
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => processSale('cash')}
              disabled={cart.length === 0 || isProcessingSale}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              💵 {t('payment.cash')}
            </button>
            <button
              onClick={() => processSale('card')}
              disabled={cart.length === 0 || isProcessingSale}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              💳 {t('payment.card')}
            </button>
          </div>
        </div>
      </div>

      {/* نافذة الدفع */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totalAmount={calculateSubtotal() - (pointsToUse / 100)}
          onPayment={processSale}
          customer={selectedCustomer}
          pointsUsed={pointsToUse}
        />
      )}

      {/* نافذة الإيصال */}
      {showReceiptModal && lastSaleReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('receipt.title')}
                </h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <ReceiptPrinter
                receiptData={lastSaleReceipt}
                onPrint={() => {
                  console.log('Receipt printed');
                }}
                onDownload={() => {
                  console.log('Receipt downloaded');
                }}
                onShare={() => {
                  console.log('Receipt shared');
                }}
              />
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSystem;