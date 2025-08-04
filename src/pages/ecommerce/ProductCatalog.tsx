import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Filter, Grid, List, Heart, ShoppingCart, Star } from 'lucide-react';
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
  colors?: string[];
  sizes?: string[];
}

interface FilterOptions {
  category: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  sortBy: string;
}

const ProductCatalog: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    priceRange: [0, 1000],
    colors: [],
    sizes: [],
    inStock: false,
    sortBy: 'name'
  });

  const categories = [
    { id: 'mens', name: isRTL ? 'ملابس رجالية' : 'Men\'s Clothing' },
    { id: 'womens', name: isRTL ? 'ملابس نسائية' : 'Women\'s Clothing' },
    { id: 'kids', name: isRTL ? 'ملابس أطفال' : 'Kids\' Clothing' },
    { id: 'accessories', name: isRTL ? 'إكسسوارات' : 'Accessories' },
    { id: 'custom', name: isRTL ? 'تخصيص مخصص' : 'Custom Design' }
  ];

  const colors = [
    { id: 'red', name: isRTL ? 'أحمر' : 'Red' },
    { id: 'blue', name: isRTL ? 'أزرق' : 'Blue' },
    { id: 'green', name: isRTL ? 'أخضر' : 'Green' },
    { id: 'black', name: isRTL ? 'أسود' : 'Black' },
    { id: 'white', name: isRTL ? 'أبيض' : 'White' },
    { id: 'gray', name: isRTL ? 'رمادي' : 'Gray' }
  ];

  const sizes = [
    { id: 'xs', name: 'XS' },
    { id: 's', name: 'S' },
    { id: 'm', name: 'M' },
    { id: 'l', name: 'L' },
    { id: 'xl', name: 'XL' },
    { id: 'xxl', name: 'XXL' }
  ];

  const sortOptions = [
    { id: 'name', name: isRTL ? 'الاسم' : 'Name' },
    { id: 'price_low', name: isRTL ? 'السعر: من الأقل' : 'Price: Low to High' },
    { id: 'price_high', name: isRTL ? 'السعر: من الأعلى' : 'Price: High to Low' },
    { id: 'rating', name: isRTL ? 'التقييم' : 'Rating' },
    { id: 'newest', name: isRTL ? 'الأحدث' : 'Newest' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

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

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Colors filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors?.some(color => filters.colors.includes(color))
      );
    }

    // Sizes filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes?.some(size => filters.sizes.includes(size))
      );
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.in_stock);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleColorToggle = (colorId: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(c => c !== colorId)
        : [...prev.colors, colorId]
    }));
  };

  const handleSizeToggle = (sizeId: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(sizeId)
        ? prev.sizes.filter(s => s !== sizeId)
        : [...prev.sizes, sizeId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      colors: [],
      sizes: [],
      inStock: false,
      sortBy: 'name'
    });
  };

  const addToCart = (product: Product) => {
    // TODO: Implement add to cart functionality
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'كتالوج المنتجات' : 'Product Catalog'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? `تم العثور على ${filteredProducts.length} منتج` : `${filteredProducts.length} products found`}
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>{isRTL ? 'الفلترة' : 'Filters'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isRTL ? 'الفلترة' : 'Filters'}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isRTL ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {isRTL ? 'الفئة' : 'Category'}
                </h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {isRTL ? 'نطاق السعر' : 'Price Range'}
                </h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{filters.priceRange[0]} {isRTL ? 'د.ك' : 'KWD'}</span>
                    <span>{filters.priceRange[1]} {isRTL ? 'د.ك' : 'KWD'}</span>
                  </div>
                </div>
              </div>

              {/* Colors Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {isRTL ? 'الألوان' : 'Colors'}
                </h4>
                <div className="space-y-2">
                  {colors.map(color => (
                    <label key={color.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color.id)}
                        onChange={() => handleColorToggle(color.id)}
                        className="mr-2"
                      />
                      <span className="text-sm">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {isRTL ? 'المقاسات' : 'Sizes'}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(size => (
                    <label key={size.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size.id)}
                        onChange={() => handleSizeToggle(size.id)}
                        className="mr-1"
                      />
                      <span className="text-sm">{size.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{isRTL ? 'متوفر في المخزون فقط' : 'In Stock Only'}</span>
                </label>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  {isRTL ? 'ترتيب حسب' : 'Sort By'}
                </h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {isRTL ? 'لم يتم العثور على منتجات تطابق معايير البحث' : 'No products found matching your criteria'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'w-48' : ''}>
                      <div className="relative">
                        <img
                          src={product.image_url || '/placeholder-product.jpg'}
                          alt={product.name}
                          className={`object-cover ${viewMode === 'list' ? 'w-full h-32' : 'w-full h-48'}`}
                        />
                        <button
                          onClick={() => addToWishlist(product)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-blue-600">
                          {product.price} {isRTL ? 'د.ك' : 'KWD'}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog; 