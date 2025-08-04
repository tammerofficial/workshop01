import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, Package, Heart, MapPin, Bell, CreditCard, 
  Gift, Settings, LogOut, Edit, Eye, Star
} from 'lucide-react';
import laravel from '../../api/laravel';

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items_count: number;
  created_at: string;
  estimated_delivery?: string;
}

interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  added_at: string;
}

interface Address {
  id: number;
  type: 'home' | 'work' | 'other';
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code?: string;
  phone?: string;
  is_default: boolean;
}

interface LoyaltyInfo {
  total_points: number;
  available_points: number;
  tier: string;
  tier_progress: number;
  next_tier: string;
  points_to_next_tier: number;
}

const CustomerDashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'loyalty' | 'settings'>('overview');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birth_date: '',
    gender: '',
    preferences: {
      newsletter: true,
      sms_notifications: true,
      email_notifications: true,
      language: 'ar'
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات العميل المختلفة
      const [ordersRes, wishlistRes, addressesRes, loyaltyRes] = await Promise.allSettled([
        laravel.get('/api/customer/orders'),
        laravel.get('/api/customer/wishlist'),
        laravel.get('/api/customer/addresses'),
        laravel.get('/api/customer/loyalty')
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.data);
      }
      
      if (wishlistRes.status === 'fulfilled' && wishlistRes.value.data.success) {
        setWishlist(wishlistRes.value.data.data);
      }
      
      if (addressesRes.status === 'fulfilled' && addressesRes.value.data.success) {
        setAddresses(addressesRes.value.data.data);
      }
      
      if (loyaltyRes.status === 'fulfilled' && loyaltyRes.value.data.success) {
        setLoyaltyInfo(loyaltyRes.value.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': isRTL ? 'قيد الانتظار' : 'Pending',
      'processing': isRTL ? 'قيد المعالجة' : 'Processing',
      'shipped': isRTL ? 'تم الشحن' : 'Shipped',
      'delivered': isRTL ? 'تم التسليم' : 'Delivered',
      'cancelled': isRTL ? 'ملغي' : 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await laravel.put('/api/customer/profile', profileData);
      if (response.data.success) {
        alert(isRTL ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(isRTL ? 'خطأ في تحديث الملف الشخصي' : 'Error updating profile');
    }
  };

  const tabs = [
    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: User },
    { id: 'orders', label: isRTL ? 'طلباتي' : 'My Orders', icon: Package },
    { id: 'wishlist', label: isRTL ? 'المفضلة' : 'Wishlist', icon: Heart },
    { id: 'addresses', label: isRTL ? 'العناوين' : 'Addresses', icon: MapPin },
    { id: 'loyalty', label: isRTL ? 'نقاط الولاء' : 'Loyalty Points', icon: Gift },
    { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isRTL ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'نظرة عامة على الحساب' : 'Account Overview'}
                  </h2>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                          </p>
                          <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            {isRTL ? 'المفضلة' : 'Wishlist Items'}
                          </p>
                          <p className="text-2xl font-bold text-purple-600">{wishlist.length}</p>
                        </div>
                        <Heart className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            {isRTL ? 'نقاط الولاء' : 'Loyalty Points'}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {loyaltyInfo?.available_points || 0}
                          </p>
                        </div>
                        <Gift className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {isRTL ? 'الطلبات الأخيرة' : 'Recent Orders'}
                    </h3>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium text-gray-900">#{order.order_number}</p>
                              <p className="text-sm text-gray-600">
                                {order.items_count} {isRTL ? 'عنصر' : 'items'} • {order.total_amount} {isRTL ? 'د.ك' : 'KWD'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <button className="text-blue-600 hover:text-blue-700">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'طلباتي' : 'My Orders'}
                  </h2>
                  
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {isRTL ? 'طلب رقم' : 'Order'} #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {isRTL ? 'تاريخ الطلب:' : 'Order Date:'} {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              {isRTL ? 'عدد العناصر:' : 'Items:'} {order.items_count}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              {isRTL ? 'المجموع:' : 'Total:'} {order.total_amount} {isRTL ? 'د.ك' : 'KWD'}
                            </p>
                          </div>
                          {order.estimated_delivery && (
                            <div>
                              <p className="text-gray-600">
                                {isRTL ? 'التسليم المتوقع:' : 'Est. Delivery:'} {order.estimated_delivery}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-3">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                          </button>
                          {order.status === 'delivered' && (
                            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
                              {isRTL ? 'إعادة الطلب' : 'Reorder'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'قائمة المفضلة' : 'Wishlist'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{item.product_name}</h3>
                          <p className="text-blue-600 font-semibold mb-3">
                            {item.product_price} {isRTL ? 'د.ك' : 'KWD'}
                          </p>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
                              {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                            </button>
                            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Heart className="h-4 w-4 text-red-500 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loyalty Tab */}
              {activeTab === 'loyalty' && loyaltyInfo && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'نقاط الولاء' : 'Loyalty Program'}
                  </h2>
                  
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {isRTL ? `مستوى ${loyaltyInfo.tier}` : `${loyaltyInfo.tier} Tier`}
                        </h3>
                        <p className="text-purple-100">
                          {loyaltyInfo.available_points} {isRTL ? 'نقطة متاحة' : 'points available'}
                        </p>
                      </div>
                      <Gift className="h-8 w-8" />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{isRTL ? 'التقدم نحو' : 'Progress to'} {loyaltyInfo.next_tier}</span>
                        <span>{loyaltyInfo.points_to_next_tier} {isRTL ? 'نقطة متبقية' : 'points to go'}</span>
                      </div>
                      <div className="w-full bg-purple-800 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${loyaltyInfo.tier_progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-purple-100">
                      {isRTL ? 'إجمالي النقاط المكتسبة:' : 'Total points earned:'} {loyaltyInfo.total_points}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {isRTL ? 'كيفية كسب النقاط' : 'How to Earn Points'}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• {isRTL ? '1 نقطة لكل 1 د.ك' : '1 point per 1 KWD spent'}</li>
                        <li>• {isRTL ? '50 نقطة لكل تقييم' : '50 points per review'}</li>
                        <li>• {isRTL ? '100 نقطة للإحالة' : '100 points per referral'}</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {isRTL ? 'استخدام النقاط' : 'Redeem Points'}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• {isRTL ? '100 نقطة = 1 د.ك خصم' : '100 points = 1 KWD discount'}</li>
                        <li>• {isRTL ? 'هدايا مجانية' : 'Free gifts'}</li>
                        <li>• {isRTL ? 'شحن مجاني' : 'Free shipping'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isRTL ? 'إعدادات الحساب' : 'Account Settings'}
                  </h2>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isRTL ? 'الاسم الكامل' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isRTL ? 'البريد الإلكتروني' : 'Email'}
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isRTL ? 'تاريخ الميلاد' : 'Birth Date'}
                        </label>
                        <input
                          type="date"
                          value={profileData.birth_date}
                          onChange={(e) => setProfileData(prev => ({ ...prev, birth_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.preferences.newsletter}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, newsletter: e.target.checked }
                            }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {isRTL ? 'النشرة الإخبارية' : 'Newsletter'}
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.preferences.email_notifications}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, email_notifications: e.target.checked }
                            }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.preferences.sms_notifications}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, sms_notifications: e.target.checked }
                            }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {isRTL ? 'الرسائل النصية' : 'SMS Notifications'}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;