import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import laravel from '../../api/laravel';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: boolean;
  rating: number;
}

const HomePage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await laravel.get('/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await laravel.get('/api/products/featured');
      if (response.data.success) {
        setFeaturedProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const addToCart = (product: Product) => {
    // TODO: Implement add to cart functionality
    setCartCount(prev => prev + 1);
    console.log('Added to cart:', product.name);
  };

  const addToWishlist = (product: Product) => {
    // TODO: Implement wishlist functionality
    console.log('Added to wishlist:', product.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isRTL ? 'متجر الورشة' : 'Workshop Store'}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                {isRTL ? 'الرئيسية' : 'Home'}
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                {isRTL ? 'المنتجات' : 'Products'}
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                {isRTL ? 'التخصيص' : 'Custom'}
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                {isRTL ? 'اتصل بنا' : 'Contact'}
              </a>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isRTL ? 'ابحث عن المنتجات...' : 'Search products...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-700 hover:text-blue-600">
                <Heart className="h-6 w-6" />
              </button>
              <button className="relative p-2 text-gray-700 hover:text-blue-600">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="p-2 text-gray-700 hover:text-blue-600">
                <User className="h-6 w-6" />
              </button>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث عن المنتجات...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <nav className="flex flex-col space-y-2">
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  {isRTL ? 'الرئيسية' : 'Home'}
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  {isRTL ? 'المنتجات' : 'Products'}
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  {isRTL ? 'التخصيص' : 'Custom'}
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  {isRTL ? 'اتصل بنا' : 'Contact'}
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {isRTL ? 'أزياء مخصصة بجودة عالية' : 'Custom Fashion with Premium Quality'}
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {isRTL ? 'اكتشف مجموعتنا المتنوعة من الملابس المخصصة والجاهزة' : 'Discover our diverse collection of custom and ready-made clothing'}
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {isRTL ? 'تسوق الآن' : 'Shop Now'}
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {isRTL ? 'المنتجات المميزة' : 'Featured Products'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => addToWishlist(product)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      {product.price} {isRTL ? 'د.ك' : 'KWD'}
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.in_stock}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {product.in_stock ? (isRTL ? 'أضف للسلة' : 'Add to Cart') : (isRTL ? 'غير متوفر' : 'Out of Stock')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {isRTL ? 'تصفح الفئات' : 'Browse Categories'}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: isRTL ? 'ملابس رجالية' : 'Men\'s Clothing', image: '/category-men.jpg' },
              { name: isRTL ? 'ملابس نسائية' : 'Women\'s Clothing', image: '/category-women.jpg' },
              { name: isRTL ? 'ملابس أطفال' : 'Kids\' Clothing', image: '/category-kids.jpg' },
              { name: isRTL ? 'تخصيص مخصص' : 'Custom Design', image: '/category-custom.jpg' }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4 text-center">
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {isRTL ? 'متجر الورشة' : 'Workshop Store'}
              </h4>
              <p className="text-gray-400">
                {isRTL ? 'أزياء مخصصة بجودة عالية' : 'Custom fashion with premium quality'}
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">
                {isRTL ? 'روابط سريعة' : 'Quick Links'}
              </h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{isRTL ? 'المنتجات' : 'Products'}</a></li>
                <li><a href="#" className="hover:text-white">{isRTL ? 'التخصيص' : 'Custom'}</a></li>
                <li><a href="#" className="hover:text-white">{isRTL ? 'حولنا' : 'About'}</a></li>
                <li><a href="#" className="hover:text-white">{isRTL ? 'اتصل بنا' : 'Contact'}</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">
                {isRTL ? 'خدمة العملاء' : 'Customer Service'}
              </h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{isRTL ? 'سياسة الإرجاع' : 'Return Policy'}</a></li>
                <li><a href="#" className="hover:text-white">{isRTL ? 'الشحن والتوصيل' : 'Shipping'}</a></li>
                <li><a href="#" className="hover:text-white">{isRTL ? 'الأسئلة الشائعة' : 'FAQ'}</a></li>
                <li><a href="#" className="hover:text-white">{isRTL ? 'الدعم' : 'Support'}</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">
                {isRTL ? 'تواصل معنا' : 'Contact Us'}
              </h5>
              <div className="space-y-2 text-gray-400">
                <p>{isRTL ? 'الهاتف: +965 1234 5678' : 'Phone: +965 1234 5678'}</p>
                <p>{isRTL ? 'البريد الإلكتروني: info@workshop.com' : 'Email: info@workshop.com'}</p>
                <p>{isRTL ? 'العنوان: الكويت' : 'Address: Kuwait'}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {isRTL ? 'متجر الورشة' : 'Workshop Store'}. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 