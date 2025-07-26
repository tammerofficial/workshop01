import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { materialService, categoryService } from '../api/laravel';
import toast from 'react-hot-toast';

interface Material {
  id: number;
  name: string;
  description: string;
  sku: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  reorder_level: number;
  location: string;
  image_url: string;
  is_active: boolean;
  category: {
    id: number;
    name: string;
  } | null;
}

const Inventory = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    category_id: '',
    sku: '',
    quantity: '',
    unit: '',
    cost_per_unit: '',
    supplier: '',
    reorder_level: '',
    location: '',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsRes, categoriesRes] = await Promise.all([
        materialService.getAll(),
        categoryService.getAll()
      ]);

      setMaterials(materialsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const materialData = {
        ...newMaterial,
        quantity: parseInt(newMaterial.quantity) || 0,
        cost_per_unit: parseFloat(newMaterial.cost_per_unit) || 0,
        reorder_level: parseInt(newMaterial.reorder_level) || 0,
        category_id: newMaterial.category_id || null
      };

      await materialService.create(materialData);
      toast.success('تم إضافة المادة بنجاح');
      setShowCreateModal(false);
      setNewMaterial({
        name: '',
        description: '',
        category_id: '',
        sku: '',
        quantity: '',
        unit: '',
        cost_per_unit: '',
        supplier: '',
        reorder_level: '',
        location: '',
        image_url: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating material:', error);
      toast.error('فشل في إضافة المادة');
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    try {
      await materialService.update(editingMaterial.id, editingMaterial);
      toast.success('تم تحديث المادة بنجاح');
      setEditingMaterial(null);
      loadData();
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error('فشل في تحديث المادة');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return;

    try {
      await materialService.delete(id);
      toast.success('تم حذف المادة بنجاح');
      loadData();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('فشل في حذف المادة');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || material.category?.id.toString() === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && material.quantity <= material.reorder_level) ||
                        (stockFilter === 'out' && material.quantity === 0);
          return matchesSearch && matchesCategory && matchesStock;
        });

  const getStockStatus = (material: Material) => {
    if (material.quantity === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'نفد المخزون' };
    if (material.quantity <= material.reorder_level) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'مخزون منخفض' };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'متوفر' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const lowStockCount = materials.filter(m => m.quantity <= m.reorder_level).length;
  const outOfStockCount = materials.filter(m => m.quantity === 0).length;

        return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-gray-600 mt-2">إدارة المواد الخام والأقمشة</p>
        </div>
                <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
          <Plus className="h-5 w-5" />
          إضافة مادة
                </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المواد</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مخزون منخفض</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">نفد المخزون</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
              <p className="text-2xl font-bold text-green-600">
                ${materials.reduce((sum, m) => sum + (m.quantity * m.cost_per_unit), 0).toLocaleString()}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
                  </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                placeholder="البحث في المواد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
              <option value="all">جميع التصنيفات</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع المستويات</option>
              <option value="low">مخزون منخفض</option>
              <option value="out">نفد المخزون</option>
                    </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const stockStatus = getStockStatus(material);
          return (
            <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {material.image_url && (
                      <img 
                        src={material.image_url} 
                        alt={material.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                      <p className="text-sm text-gray-600">#{material.sku}</p>
                    </div>
                  </div>
                  {material.description && (
                    <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingMaterial(material)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">الكمية:</span>
                  <span className="text-sm font-medium">{material.quantity} {material.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">السعر:</span>
                  <span className="text-sm font-medium">${material.cost_per_unit}/{material.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">الموقع:</span>
                  <span className="text-sm font-medium">{material.location || 'غير محدد'}</span>
                </div>
                {material.category && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">التصنيف:</span>
                    <span className="text-sm font-medium">{material.category.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">المورد:</span>
                  <span className="text-sm font-medium">{material.supplier || 'غير محدد'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${(material.quantity * material.cost_per_unit).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواد</h3>
          <p className="text-gray-600">ابدأ بإضافة مواد جديدة للمخزون</p>
        </div>
      )}

      {/* Create Material Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة مادة جديدة</h2>
              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المادة</label>
                    <input
                      type="text"
                      required
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم المادة (SKU)</label>
                    <input
                      type="text"
                      required
                      value={newMaterial.sku}
                      onChange={(e) => setNewMaterial({ ...newMaterial, sku: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                    <select
                      value={newMaterial.category_id}
                      onChange={(e) => setNewMaterial({ ...newMaterial, category_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                    <input
                      type="text"
                      required
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                      placeholder="متر، قطعة، كيلو..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
              </div>
              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة لكل وحدة</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={newMaterial.cost_per_unit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, cost_per_unit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                    <input
                      type="text"
                      value={newMaterial.supplier}
                      onChange={(e) => setNewMaterial({ ...newMaterial, supplier: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مستوى إعادة الطلب</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newMaterial.reorder_level}
                      onChange={(e) => setNewMaterial({ ...newMaterial, reorder_level: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                    <input
                      type="text"
                      value={newMaterial.location}
                      onChange={(e) => setNewMaterial({ ...newMaterial, location: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة</label>
                    <input
                      type="url"
                      value={newMaterial.image_url}
                      onChange={(e) => setNewMaterial({ ...newMaterial, image_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                              </div>
                            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                              </div>

                <div className="flex gap-4 pt-4">
                              <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                    إضافة المادة
                              </button>
                              <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                              </button>
                            </div>
              </form>
            </div>
          </div>
                </div>
              )}
              
      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">تعديل المادة</h2>
              <form onSubmit={handleUpdateMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المادة</label>
                    <input
                      type="text"
                      required
                      value={editingMaterial.name}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingMaterial.quantity}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة لكل وحدة</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={editingMaterial.cost_per_unit}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, cost_per_unit: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مستوى إعادة الطلب</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingMaterial.reorder_level}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, reorder_level: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                    <input
                      type="text"
                      value={editingMaterial.supplier}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, supplier: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                    <input
                      type="text"
                      value={editingMaterial.location}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, location: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={editingMaterial.description}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMaterial(null)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;