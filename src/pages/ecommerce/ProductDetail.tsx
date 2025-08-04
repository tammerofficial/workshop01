import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Heart, ShoppingCart, Star, Plus, Minus, Share2, 
  ChevronLeft, ChevronRight, Truck, Shield, RefreshCw 
} from 'lucide-react';
import laravel from '../../api/laravel';
import ProductCard from '../../components/ecommerce/ProductCard';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image_url: string;
  images?: string[];
  category: string;
  in_stock: boolean;
  stock_quantity: number;
  rating: number;
  reviews_count: number;
  colors?: { id: string; name: string; hex: string }[];
  sizes?: { id: string; name: string; available: boolean }[];
  specifications?: { [key: string]: string };
  features?: string[];
  care_instructions?: string[];
  is_customizable: boolean;
  custom_options?: {
    measurements?: boolean;
    fabric_choice?: boolean;
    color_choice?: boolean;
  };
}

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await laravel.get(`/api/products/${productId}`);
      if (response.data.success) {
        const productData = response.data.data;
        setProduct(productData);
        
        // Set default selections
        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0].id);
        }
        if (productData.sizes?.length > 0) {
          const availableSize = productData.sizes.find((size: any) => size.available);
          if (availableSize) {
            setSelectedSize(availableSize.id);
          }
        }

        // Fetch related products and reviews
        fetchRelatedProducts(productData.category, productId);
        fetchReviews(productId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, excludeId: string) => {
    try {
      const response = await laravel.get(`/api/products?category=${category}&exclude=${excludeId}&limit=4`);
      if (response.data.success) {
        setRelatedProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const response = await laravel.get(`/api/products/${productId}/reviews`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      product_id: product.id,
      quantity,
      color: selectedColor,
      size: selectedSize,
      price: product.sale_price || product.price
    };
    
    console.log('Adding to cart:', cartItem);
    // TODO: Implement cart functionality
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log('Wishlist toggled:', !isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isRTL ? 'المنتج غير موجود' : 'Product Not Found'}
          </h2>
          <button
            onClick={() => navigate('/ecommerce/catalog')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {isRTL ? 'العودة للكتالوج' : 'Back to Catalog'}
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image_url];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate('/ecommerce')} className="hover:text-blue-600">
            {isRTL ? 'الرئيسية' : 'Home'}
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => navigate('/ecommerce/catalog')} className="hover:text-blue-600">
            {isRTL ? 'المنتجات' : 'Products'}
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={images[selectedImageIndex] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {hasDiscount && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{discountPercentage}%
                  </span>
                )}
                {!product.in_stock && (
                  <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {isRTL ? 'نفذ من المخزون' : 'Out of Stock'}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.category}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
                <span className="ml-2 text-lg font-medium">{product.rating}</span>
              </div>
              <span className="text-gray-600">
                ({product.reviews_count} {isRTL ? 'تقييم' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {product.sale_price} {isRTL ? 'د.ك' : 'KWD'}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {product.price} {isRTL ? 'د.ك' : 'KWD'}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {product.price} {isRTL ? 'د.ك' : 'KWD'}
                </span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {isRTL ? 'اللون' : 'Color'}
                </h3>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color.id ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isRTL ? 'المقاس' : 'Size'}
                  </h3>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {isRTL ? 'جدول المقاسات' : 'Size Chart'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      disabled={!size.available}
                      className={`py-2 px-4 border rounded-lg text-center ${
                        selectedSize === size.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : size.available
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {isRTL ? 'الكمية' : 'Quantity'}
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-gray-600">
                  {product.stock_quantity} {isRTL ? 'متوفر' : 'in stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className={`p-3 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                    isWishlisted ? 'text-red-500 border-red-500' : ''
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {product.is_customizable && (
                <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                  {isRTL ? 'تخصيص هذا المنتج' : 'Customize This Product'}
                </button>
              )}
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  {isRTL ? 'شحن مجاني للطلبات فوق 50 د.ك' : 'Free shipping on orders over 50 KWD'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {isRTL ? 'إرجاع مجاني خلال 30 يوم' : 'Free returns within 30 days'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">
                  {isRTL ? 'ضمان الجودة' : 'Quality guarantee'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: isRTL ? 'الوصف' : 'Description' },
                { id: 'specifications', label: isRTL ? 'المواصفات' : 'Specifications' },
                { id: 'reviews', label: isRTL ? 'التقييمات' : 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white rounded-lg p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {isRTL ? 'المميزات' : 'Features'}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-gray-700">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.care_instructions && product.care_instructions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {isRTL ? 'تعليمات العناية' : 'Care Instructions'}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {product.care_instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-700">{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && product.specifications && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{review.customer_name}</span>
                          {review.verified_purchase && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {isRTL ? 'مشترى محقق' : 'Verified Purchase'}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isRTL ? 'منتجات مشابهة' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onProductClick={(product) => navigate(`/ecommerce/product/${product.id}`)}
                  onAddToCart={(product) => console.log('Add to cart:', product)}
                  onAddToWishlist={(product) => console.log('Add to wishlist:', product)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;