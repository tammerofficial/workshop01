import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: boolean;
  rating: number;
  colors?: string[];
  sizes?: string[];
  sale_price?: number;
  is_featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  showQuickView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  onAddToCart,
  onAddToWishlist,
  onProductClick,
  showQuickView = true
}) => {
  const { t, isRTL } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const handleProductClick = () => {
    onProductClick?.(product);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            <Star className="h-4 w-4 text-yellow-400 fill-current absolute top-0 left-0 w-1/2 overflow-hidden" />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer ${
        viewMode === 'list' ? 'flex' : ''
      } ${!product.in_stock ? 'opacity-75' : ''}`}
      onClick={handleProductClick}
    >
      {/* Image Section */}
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img
          src={product.image_url || '/placeholder-product.jpg'}
          alt={product.name}
          className={`object-cover w-full ${viewMode === 'list' ? 'h-32' : 'h-48'} transition-transform duration-200 hover:scale-105`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.in_stock && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              {isRTL ? 'نفذ' : 'Out of Stock'}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {isRTL ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          title={isRTL ? 'أضف للمفضلة' : 'Add to Wishlist'}
        >
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
        </button>

        {/* Quick View Button */}
        {showQuickView && viewMode === 'grid' && (
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              {isRTL ? 'عرض سريع' : 'Quick View'}
            </button>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 flex-1">
            {product.name}
          </h4>
          {product.category && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {product.category}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({product.rating.toFixed(1)})
          </span>
        </div>

        {/* Colors & Sizes */}
        {(product.colors || product.sizes) && (
          <div className="mb-3 space-y-1">
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">
                  {isRTL ? 'الألوان:' : 'Colors:'}
                </span>
                <div className="flex space-x-1">
                  {product.colors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
                  )}
                </div>
              </div>
            )}
            
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">
                  {isRTL ? 'المقاسات:' : 'Sizes:'}
                </span>
                <div className="flex space-x-1">
                  {product.sizes.slice(0, 4).map((size, index) => (
                    <span key={index} className="text-xs bg-gray-100 px-1 rounded">
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 4 && (
                    <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  {product.sale_price} {isRTL ? 'د.ك' : 'KWD'}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price} {isRTL ? 'د.ك' : 'KWD'}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                {product.price} {isRTL ? 'د.ك' : 'KWD'}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {product.in_stock ? (
            <>
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              {isRTL ? 'أضف للسلة' : 'Add to Cart'}
            </>
          ) : (
            isRTL ? 'غير متوفر' : 'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;