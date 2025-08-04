import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CreditCard, Truck, MapPin, User, Phone, Mail, 
  Lock, CheckCircle, ArrowLeft, Plus, Edit 
} from 'lucide-react';
import laravel from '../../api/laravel';

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
}

interface Address {
  id?: number;
  type: 'home' | 'work' | 'other';
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code?: string;
  phone?: string;
  is_default: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'knet' | 'apple_pay' | 'google_pay';
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const Checkout: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  
  const [newAddress, setNewAddress] = useState<Address>({
    type: 'home',
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    phone: '',
    is_default: false
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery',
      type: 'cash',
      icon: <Truck className="h-6 w-6" />,
      description: isRTL ? 'ادفع عند استلام الطلب' : 'Pay when you receive your order',
      available: true
    },
    {
      id: 'knet',
      name: isRTL ? 'كي نت' : 'K-Net',
      type: 'knet',
      icon: <CreditCard className="h-6 w-6" />,
      description: isRTL ? 'الدفع بواسطة بطاقة كي نت' : 'Pay with K-Net card',
      available: true
    },
    {
      id: 'visa',
      name: isRTL ? 'بطاقة ائتمان' : 'Credit Card',
      type: 'card',
      icon: <CreditCard className="h-6 w-6" />,
      description: isRTL ? 'فيزا، ماستركارد' : 'Visa, Mastercard',
      available: true
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      type: 'apple_pay',
      icon: <CreditCard className="h-6 w-6" />,
      description: isRTL ? 'الدفع بواسطة Apple Pay' : 'Pay with Apple Pay',
      available: true
    }
  ];

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      
      // جلب عناصر السلة والعناوين
      const [cartRes, addressesRes] = await Promise.allSettled([
        laravel.get('/api/cart'),
        laravel.get('/api/customer/addresses')
      ]);

      if (cartRes.status === 'fulfilled' && cartRes.value.data.success) {
        setCartItems(cartRes.value.data.data);
      }
      
      if (addressesRes.status === 'fulfilled' && addressesRes.value.data.success) {
        const addressList = addressesRes.value.data.data;
        setAddresses(addressList);
        
        // اختيار العنوان الافتراضي
        const defaultAddress = addressList.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }

    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.sale_price || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 5; // شحن مجاني فوق 50 د.ك
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSaveAddress = async () => {
    try {
      setLoading(true);
      const response = await laravel.post('/api/customer/addresses', newAddress);
      
      if (response.data.success) {
        const savedAddress = response.data.data;
        setAddresses(prev => [...prev, savedAddress]);
        setSelectedAddress(savedAddress);
        setShowAddressForm(false);
        setNewAddress({
          type: 'home',
          name: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          postal_code: '',
          phone: '',
          is_default: false
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert(isRTL ? 'خطأ في حفظ العنوان' : 'Error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert(isRTL ? 'يرجى اختيار العنوان وطريقة الدفع' : 'Please select address and payment method');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        address_id: selectedAddress.id,
        payment_method: selectedPayment,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.sale_price || item.price,
          color: item.color,
          size: item.size
        })),
        subtotal: calculateSubtotal(),
        shipping_cost: calculateShipping(),
        total_amount: calculateTotal(),
        notes: orderNote
      };

      const response = await laravel.post('/api/orders', orderData);
      
      if (response.data.success) {
        const orderId = response.data.data.id;
        
        // توجيه حسب طريقة الدفع
        if (selectedPayment === 'cash') {
          navigate(`/ecommerce/order-confirmation/${orderId}`);
        } else {
          // توجيه لصفحة الدفع
          navigate(`/ecommerce/payment/${orderId}`);
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(isRTL ? 'خطأ في إتمام الطلب' : 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { 
      id: 1, 
      title: isRTL ? 'عنوان التسليم' : 'Shipping Address',
      description: isRTL ? 'اختر عنوان التسليم' : 'Choose delivery address'
    },
    { 
      id: 2, 
      title: isRTL ? 'طريقة الدفع' : 'Payment Method',
      description: isRTL ? 'اختر طريقة الدفع' : 'Choose payment method'
    },
    { 
      id: 3, 
      title: isRTL ? 'مراجعة الطلب' : 'Review Order',
      description: isRTL ? 'راجع تفاصيل الطلب' : 'Review order details'
    }
  ];

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isRTL ? 'السلة فارغة' : 'Cart is Empty'}
          </h2>
          <button
            onClick={() => navigate('/ecommerce/catalog')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {isRTL ? 'تسوق الآن' : 'Shop Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'إتمام الطلب' : 'Checkout'}
          </h1>
          <button
            onClick={() => navigate('/ecommerce/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{isRTL ? 'العودة للسلة' : 'Back to Cart'}</span>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'عنوان التسليم' : 'Shipping Address'}
                  </h2>
                  
                  {/* Existing Addresses */}
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddress?.id === address.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{address.name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                address.type === 'home' ? 'bg-green-100 text-green-800' :
                                address.type === 'work' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {address.type === 'home' ? (isRTL ? 'المنزل' : 'Home') :
                                 address.type === 'work' ? (isRTL ? 'العمل' : 'Work') :
                                 (isRTL ? 'أخرى' : 'Other')}
                              </span>
                              {address.is_default && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                  {isRTL ? 'افتراضي' : 'Default'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.address_line_1}
                              {address.address_line_2 && `, ${address.address_line_2}`}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.city} {address.postal_code}
                            </p>
                            {address.phone && (
                              <p className="text-gray-600 text-sm">{address.phone}</p>
                            )}
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Address */}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                  >
                    <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <span className="text-gray-600">
                      {isRTL ? 'إضافة عنوان جديد' : 'Add New Address'}
                    </span>
                  </button>

                  {/* New Address Form */}
                  {showAddressForm && (
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {isRTL ? 'عنوان جديد' : 'New Address'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'الاسم' : 'Name'}
                          </label>
                          <input
                            type="text"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'نوع العنوان' : 'Address Type'}
                          </label>
                          <select
                            value={newAddress.type}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="home">{isRTL ? 'المنزل' : 'Home'}</option>
                            <option value="work">{isRTL ? 'العمل' : 'Work'}</option>
                            <option value="other">{isRTL ? 'أخرى' : 'Other'}</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'العنوان الأول' : 'Address Line 1'}
                          </label>
                          <input
                            type="text"
                            value={newAddress.address_line_1}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'العنوان الثاني (اختياري)' : 'Address Line 2 (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={newAddress.address_line_2}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'المدينة' : 'City'}
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'الرمز البريدي (اختياري)' : 'Postal Code (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isRTL ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)'}
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newAddress.is_default}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              {isRTL ? 'جعل هذا العنوان افتراضي' : 'Make this my default address'}
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={handleSaveAddress}
                          disabled={loading || !newAddress.name || !newAddress.address_line_1 || !newAddress.city}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                        >
                          {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ العنوان' : 'Save Address')}
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                          {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRTL ? 'متابعة إلى الدفع' : 'Continue to Payment'}
                  </button>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                  </h2>
                  
                  <div className="space-y-4">
                    {paymentMethods.filter(method => method.available).map((method) => (
                      <div
                        key={method.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedPayment === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            selectedPayment === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {method.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {isRTL ? 'السابق' : 'Previous'}
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedPayment}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRTL ? 'مراجعة الطلب' : 'Review Order'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'مراجعة الطلب' : 'Review Your Order'}
                  </h2>
                  
                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {isRTL ? 'عناصر الطلب' : 'Order Items'}
                    </h3>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            {(item.color || item.size) && (
                              <p className="text-sm text-gray-600">
                                {item.color && `${isRTL ? 'اللون:' : 'Color:'} ${item.color}`}
                                {item.color && item.size && ' | '}
                                {item.size && `${isRTL ? 'المقاس:' : 'Size:'} ${item.size}`}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              {isRTL ? 'الكمية:' : 'Quantity:'} {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {((item.sale_price || item.price) * item.quantity).toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                            </p>
                            {item.sale_price && (
                              <p className="text-sm text-gray-500 line-through">
                                {(item.price * item.quantity).toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isRTL ? 'عنوان التسليم' : 'Delivery Address'}
                    </h3>
                    {selectedAddress && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">{selectedAddress.name}</p>
                        <p className="text-gray-600">
                          {selectedAddress.address_line_1}
                          {selectedAddress.address_line_2 && `, ${selectedAddress.address_line_2}`}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.city} {selectedAddress.postal_code}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {paymentMethods.find(method => method.id === selectedPayment)?.name}
                      </p>
                      <p className="text-gray-600">
                        {paymentMethods.find(method => method.id === selectedPayment)?.description}
                      </p>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'ملاحظات الطلب (اختياري)' : 'Order Notes (Optional)'}
                    </label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'أي ملاحظات خاصة للطلب...' : 'Any special instructions for your order...'}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {isRTL ? 'السابق' : 'Previous'}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          {isRTL ? 'تأكيد الطلب' : 'Place Order'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {isRTL ? 'المجموع الفرعي' : 'Subtotal'} ({cartItems.length} {isRTL ? 'عنصر' : 'items'})
                  </span>
                  <span className="font-medium">
                    {calculateSubtotal().toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{isRTL ? 'الشحن' : 'Shipping'}</span>
                  <span className="font-medium">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">{isRTL ? 'مجاني' : 'Free'}</span>
                    ) : (
                      `${calculateShipping().toFixed(2)} ${isRTL ? 'د.ك' : 'KWD'}`
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>{isRTL ? 'المجموع' : 'Total'}</span>
                    <span>{calculateTotal().toFixed(2)} {isRTL ? 'د.ك' : 'KWD'}</span>
                  </div>
                </div>
              </div>
              
              {calculateShipping() > 0 && (
                <div className="mt-4 text-center text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                  {isRTL 
                    ? `أضف ${(50 - calculateSubtotal()).toFixed(2)} د.ك للحصول على شحن مجاني!`
                    : `Add ${(50 - calculateSubtotal()).toFixed(2)} KWD more for free shipping!`
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;