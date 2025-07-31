import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Layers,
  ShoppingBag,
  AlertTriangle,
  Download,
  Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { productService } from '../api/productService';
import { wooCommerceApi } from '../api/woocommerce';
import toast from 'react-hot-toast';
import BillOfMaterialsModal from '../components/products/BillOfMaterialsModal';

interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  product_type: 'simple' | 'variable' | 'raw_material' | 'product_part';
  price: number;
  purchase_price: number;
  stock_quantity: number;
  manage_stock: boolean;
  auto_calculate_purchase_price: boolean;
  production_hours: number;
  manufacturing_time_days: number;
  // Fix any type
  stage_requirements: Record<string, unknown>;
  image_url: string;
  is_active: boolean;
  woocommerce_id?: number;
  category?: {
    id: number;
    name: string;
  };
  collection?: {
    id: number;
    name: string;
  };
  bill_of_materials?: BOMItem[];
  created_at: string;
  updated_at: string;
}

interface BOMItem {
  id: number;
  material_id: number;
  quantity_required: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  is_optional: boolean;
  notes: string;
  material: {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    purchase_price: number;
    product_type: string;
  };
}

interface Category {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const { isDark } = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncingWooCommerce, setSyncingWooCommerce] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [selectedProductForBOM, setSelectedProductForBOM] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    product_type: 'simple' as Product['product_type'],
    price: '',
    purchase_price: '',
    stock_quantity: '',
    category_id: '',
    collection_id: '',
    production_hours: '',
    manufacturing_time_days: '',
    manage_stock: true,
    auto_calculate_purchase_price: false,
    is_active: true,
    image_url: '',
    bill_of_materials: [] as Array<{
      material_id: number;
      quantity_required: number;
      unit?: string;
      cost_per_unit?: number;
      is_optional?: boolean;
      notes?: string;
    }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // جلب المنتجات من WooCommerce فقط
      const productsRes = await wooCommerceApi.getProducts();
      console.log('WooCommerce products response:', productsRes);
      let products = [];
      if (Array.isArray(productsRes.data)) {
        products = productsRes.data;
      } else if (Array.isArray(productsRes)) {
        products = productsRes;
      } else if (productsRes && productsRes.products && Array.isArray(productsRes.products)) {
        products = productsRes.products;
      }
      setProducts(products);
    } catch (error) {
      console.error('Error loading WooCommerce products:', error);
      toast.error('Error loading WooCommerce products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price) || 0,
        purchase_price: parseFloat(newProduct.purchase_price) || 0,
        stock_quantity: parseInt(newProduct.stock_quantity) || 0,
        production_hours: parseInt(newProduct.production_hours) || 0,
        manufacturing_time_days: parseInt(newProduct.manufacturing_time_days) || 0,
        category_id: newProduct.category_id ? parseInt(newProduct.category_id) : undefined,
        collection_id: newProduct.collection_id ? parseInt(newProduct.collection_id) : undefined
      };

      await productService.create(productData);
      toast.success('Product created successfully');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error creating product');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await productService.update(editingProduct.id, editingProduct);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.delete(id);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const handleSyncWooCommerce = async () => {
    try {
      setSyncingWooCommerce(true);
      const result = await productService.syncWooCommerce();
      
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error syncing WooCommerce:', error);
      toast.error('Error syncing WooCommerce');
    } finally {
      setSyncingWooCommerce(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      sku: '',
      product_type: 'simple',
      price: '',
      purchase_price: '',
      stock_quantity: '',
      category_id: '',
      collection_id: '',
      production_hours: '',
      manufacturing_time_days: '',
      manage_stock: true,
      auto_calculate_purchase_price: false,
      is_active: true,
      image_url: '',
      bill_of_materials: []
    });
  };

  const handleBOMSave = () => {
    loadData();
    setShowBOMModal(false);
    setSelectedProductForBOM(null);
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'raw_material':
        return <Layers className="w-5 h-5" />;
      case 'product_part':
        return <Package className="w-5 h-5" />;
      case 'variable':
        return <Settings className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'raw_material':
        return 'bg-orange-100 text-orange-800';
      case 'product_part':
        return 'bg-purple-100 text-purple-800';
      case 'variable':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.manage_stock) {
      return { text: 'Not Managed', color: 'bg-gray-100 text-gray-800' };
    }
    
    if (product.stock_quantity === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (product.stock_quantity <= 10) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || product.product_type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || product.category?.id.toString() === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = product.stock_quantity > 10;
    else if (stockFilter === 'low_stock') matchesStock = product.stock_quantity <= 10 && product.stock_quantity > 0;
    else if (stockFilter === 'out_of_stock') matchesStock = product.stock_quantity === 0;
    
    return matchesSearch && matchesType && matchesCategory && matchesStock;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage products, raw materials, and Bill of Materials
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSyncWooCommerce}
            disabled={syncingWooCommerce}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {syncingWooCommerce ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            Sync WooCommerce
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Array.isArray(products) ? products.length : 0}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Raw Materials</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Array.isArray(products) ? products.filter(p => p.product_type === 'raw_material').length : 0}
              </p>
            </div>
            <Layers className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Parts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Array.isArray(products) ? products.filter(p => p.product_type === 'product_part').length : 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Array.isArray(products) ? products.filter(p => p.manage_stock && p.stock_quantity <= 10).length : 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Product Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Types</option>
              <option value="simple">Simple Products</option>
              <option value="variable">Variable Products</option>
              <option value="raw_material">Raw Materials</option>
              <option value="product_part">Product Parts</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Stock Status</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.tr 
                  key={product.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.image_url || 'https://via.placeholder.com/48'} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-gray-500 text-sm">{product.category?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getProductTypeColor(product.product_type)}`}>
                      {getProductTypeIcon(product.product_type)}
                      {product.product_type ? product.product_type.replace('_', ' ') : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{product.sku}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">${product.price}</div>
                    {product.purchase_price > 0 && (
                      <div className="text-gray-500 text-sm">Cost: ${product.purchase_price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.manage_stock ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(product).color}`}>
                        {product.stock_quantity} units
                      </span>
                    ) : (
                      <span className="text-gray-500">Not managed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(product.product_type === 'simple' || product.product_type === 'variable') && (
                        <button
                          onClick={() => {
                            setSelectedProductForBOM(product);
                            setShowBOMModal(true);
                          }}
                          className="p-1 text-purple-600 hover:text-purple-800"
                          title="Bill of Materials"
                        >
                          <Layers className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Product Modal */}
      {(showCreateModal || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="p-6 space-y-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, name: e.target.value})
                      : setNewProduct({...newProduct, name: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.sku : newProduct.sku}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, sku: e.target.value})
                      : setNewProduct({...newProduct, sku: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Product Type</label>
                  <select
                    value={editingProduct ? editingProduct.product_type : newProduct.product_type}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, product_type: e.target.value as Product['product_type']})
                      : setNewProduct({...newProduct, product_type: e.target.value as Product['product_type']})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="simple">Simple Product</option>
                    <option value="variable">Variable Product</option>
                    <option value="raw_material">Raw Material</option>
                    <option value="product_part">Product Part</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={editingProduct ? editingProduct.category?.id || '' : newProduct.category_id}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, category: categories.find(c => c.id.toString() === e.target.value) || undefined})
                      : setNewProduct({...newProduct, category_id: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})
                      : setNewProduct({...newProduct, price: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct ? editingProduct.purchase_price : newProduct.purchase_price}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, purchase_price: parseFloat(e.target.value) || 0})
                      : setNewProduct({...newProduct, purchase_price: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.stock_quantity : newProduct.stock_quantity}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value) || 0})
                      : setNewProduct({...newProduct, stock_quantity: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Manufacturing Time (Days)</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.manufacturing_time_days : newProduct.manufacturing_time_days}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, manufacturing_time_days: parseInt(e.target.value) || 0})
                      : setNewProduct({...newProduct, manufacturing_time_days: e.target.value})
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({...editingProduct, description: e.target.value})
                    : setNewProduct({...newProduct, description: e.target.value})
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingProduct ? editingProduct.manage_stock : newProduct.manage_stock}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, manage_stock: e.target.checked})
                      : setNewProduct({...newProduct, manage_stock: e.target.checked})
                    }
                    className="mr-2"
                  />
                  Manage Stock
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingProduct ? editingProduct.auto_calculate_purchase_price : newProduct.auto_calculate_purchase_price}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, auto_calculate_purchase_price: e.target.checked})
                      : setNewProduct({...newProduct, auto_calculate_purchase_price: e.target.checked})
                    }
                    className="mr-2"
                  />
                  Auto Calculate Purchase Price
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingProduct ? editingProduct.is_active : newProduct.is_active}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, is_active: e.target.checked})
                      : setNewProduct({...newProduct, is_active: e.target.checked})
                    }
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill of Materials Modal */}
      {showBOMModal && selectedProductForBOM && (
        <BillOfMaterialsModal
          product={selectedProductForBOM}
          isOpen={showBOMModal}
          onClose={() => {
            setShowBOMModal(false);
            setSelectedProductForBOM(null);
          }}
          onSave={() => {
            loadData(); // Reload products to get updated BOM data
          }}
        />
      )}
    </div>
  );
};

export default Products;
