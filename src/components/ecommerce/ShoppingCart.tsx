import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  quantity: number;
  color?: string;
  size?: string;
  max_quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { t, isRTL } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Load cart items from API or localStorage
    setCartItems([
      {
        id: 1,
        product_id: 101,
        name: 'قميص رجالي كلاسيكي',
        price: 45.00,
        sale_price: 35.00,
        image_url: '/placeholder-product.jpg',
        quantity: 2,
        color: 'أبيض',
        size: 'L',
        max_quantity: 10
      },
      {
        id: 2,
        product_id: 102,
        name: 'فستان نسائي أنيق',
        price: 75.00,
        image_url: '/placeholder-product.jpg',
        quantity: 1,
        color: 'أزرق',
        size: 'M',
        max_quantity: 5
      }
    ]);
  }, []);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(newQuantity, item.max_quantity) }
          : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setLoading(true);
    try {
      // TODO: Call API to validate coupon
      // const response = await laravel.post('/api/coupons/validate', { code: couponCode });
      
      // Mock response
      if (couponCode.toLowerCase() === 'save10') {
        setCouponDiscount(10);
        alert(isRTL ? 'تم تطبيق الكوبون بنجاح!' : 'Coupon applied successfully!');
      } else {
        alert(isRTL ? 'كوبون غير صالح' : 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert(isRTL ? 'خطأ في تطبيق الكوبون' : 'Error applying coupon');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.sale_price || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * couponDiscount) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-xl`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                </h3>
                <p className="text-gray-500">
                  {isRTL ? 'أضف بعض المنتجات لتبدأ التسوق' : 'Add some products to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h4>
                      
                      {(item.color || item.size) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.color && (
                            <span>{isRTL ? 'اللون:' : 'Color:'} {item.color}</span>
                          )}
                          {item.color && item.size && ' | '}
                          {item.size && (
                            <span>{isRTL ? 'المقاس:' : 'Size:'} {item.size}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {item.sale_price ? (
                            <>
                              <span className="text-sm font-medium text-red-600">
                                {item.sale_price} {isRTL ? 'د.ك' : 'KWD'}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                {item.price} {isRTL ? 'د.ك' : 'KWD'}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
                              {item.price} {isRTL ? 'د.ك' : 'KWD'}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title={isRTL ? 'إزالة' : 'Remove'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-l-lg"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 text-sm min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-r-lg"
                            disabled={item.quantity >= item.max_quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <span className="text-sm font-medium text-gray-900">
                          {((item.sale_price || item.price) * item.quantity).toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupon Section */}
          {cartItems.length > 0 && (
            <div className="border-t p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={isRTL ? 'كود الخصم' : 'Coupon code'}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || couponDiscount > 0}
                    />
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {couponDiscount > 0 ? (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      {isRTL ? 'إزالة' : 'Remove'}
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={loading || !couponCode.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {loading ? (isRTL ? 'جاري...' : 'Applying...') : (isRTL ? 'تطبيق' : 'Apply')}
                    </button>
                  )}
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      {isRTL ? 'خصم الكوبون' : 'Coupon Discount'} ({couponDiscount}%)
                    </span>
                    <span className="text-green-600 font-medium">
                      -{calculateDiscount().toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer with totals and checkout */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span className="font-medium">
                    {calculateSubtotal().toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                  </span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{isRTL ? 'الخصم' : 'Discount'}</span>
                    <span>-{calculateDiscount().toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {isRTL ? 'الشحن' : 'Shipping'}
                  </span>
                  <span className="font-medium">
                    {calculateTotal() > 50 ? (
                      <span className="text-green-600">
                        {isRTL ? 'مجاني' : 'Free'}
                      </span>
                    ) : (
                      '5.00 ' + (isRTL ? 'د.ك' : 'KWD')
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>{isRTL ? 'المجموع' : 'Total'}</span>
                    <span>
                      {(calculateTotal() + (calculateTotal() > 50 ? 0 : 5)).toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={onCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isRTL ? 'إتمام الشراء' : 'Proceed to Checkout'}
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  {isRTL ? 'تفريغ السلة' : 'Clear Cart'}
                </button>
              </div>
              
              {/* Free shipping notice */}
              {calculateTotal() < 50 && (
                <div className="text-center text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                  {isRTL 
                    ? `أضف ${(50 - calculateTotal()).toFixed(2)} د.ك للحصول على شحن مجاني!`
                    : `Add ${(50 - calculateTotal()).toFixed(2)} KWD more for free shipping!`
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;