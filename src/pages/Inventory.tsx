import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { materialService, categoryService } from '../api/laravel';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t, isRTL } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
      toast.error(t('common.error'));
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
      toast.success(t('common.success'));
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
      toast.error(t('common.error'));
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    try {
      await materialService.update(editingMaterial.id, editingMaterial);
      toast.success(t('common.success'));
      setEditingMaterial(null);
      loadData();
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm(t('common.deleteConfirm'))) return;

    try {
      await materialService.delete(id);
      toast.success(t('common.success'));
      loadData();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error(t('common.error'));
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
    if (material.quantity === 0) return { status: 'out', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: t('inventory.outOfStockStatus') };
    if (material.quantity <= material.reorder_level) return { status: 'low', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: t('inventory.lowStockStatus') };
    return { status: 'good', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: t('inventory.available') };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const lowStockCount = materials.filter(m => m.quantity <= m.reorder_level && m.quantity > 0).length;
  const outOfStockCount = materials.filter(m => m.quantity === 0).length;

        return (
    <div className="space-y-6 p-4 md:p-6 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
          <h1 
            className="text-3xl font-bold text-gray-900 dark:text-gray-100"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.875)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--text-color)'
            }}
          >
            {t('inventory.title')}
          </h1>
          <p 
            className="text-gray-600 dark:text-gray-400 mt-2"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.125)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--secondary-color)'
            }}
          >
            {t('inventory.subtitle')}
          </p>
        </div>
                <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
          <Plus className="h-5 w-5" />
          {t('inventory.addItem')}
                </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inventory.totalItems')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{materials.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inventory.lowStock')}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowStockCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inventory.outOfStock')}</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockCount}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inventory.stockValue')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {materials.reduce((acc, m) => acc + m.quantity * m.cost_per_unit, 0).toFixed(3)} {t('common.currency')}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
            <input
              type="text"
              placeholder={t('inventory.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          <div>
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('inventory.allCategories')}</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select 
              value={stockFilter} 
              onChange={e => setStockFilter(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('inventory.allStatuses')}</option>
              <option value="low">{t('inventory.lowStockStatus')}</option>
              <option value="out">{t('inventory.outOfStockStatus')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">{t('inventory.table.image')}</th>
              <th scope="col" className="px-6 py-3">{t('inventory.table.name')}</th>
              <th scope="col" className="px-6 py-3">{t('inventory.table.sku')}</th>
              <th scope="col" className="px-6 py-3">{t('inventory.table.category')}</th>
              <th scope="col" className="px-6 py-3">{t('inventory.table.quantity')}</th>
              <th scope="col" className="px-6 py-3">{t('inventory.table.status')}</th>
              <th scope="col" className="px-6 py-3">{t('inventory.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map(material => (
                <tr key={material.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="p-4">
                    <img src={material.image_url || 'https://via.placeholder.com/64'} alt={material.name} className="w-16 h-16 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {material.name}
                  </td>
                  <td className="px-6 py-4">{material.sku}</td>
                  <td className="px-6 py-4">{material.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{material.quantity} {material.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(material).color}`}>
                      {getStockStatus(material).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <button onClick={() => setEditingMaterial(material)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteMaterial(material.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  {t('inventory.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingMaterial) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial} className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingMaterial ? t('inventory.modal.editTitle') : t('inventory.modal.addTitle')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.name')}</label>
                  <input type="text" name="name" id="name" 
                         value={editingMaterial ? editingMaterial.name : newMaterial.name}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, name: e.target.value}) : setNewMaterial({...newMaterial, name: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.category')}</label>
                  <select name="category_id" id="category"
                          value={editingMaterial ? editingMaterial.category?.id.toString() : newMaterial.category_id}
                          onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, category: {id: parseInt(e.target.value), name: ''}}) : setNewMaterial({...newMaterial, category_id: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">{t('inventory.form.selectCategory')}</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.description')}</label>
                <textarea name="description" id="description" rows={3}
                          value={editingMaterial ? editingMaterial.description : newMaterial.description}
                          onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, description: e.target.value}) : setNewMaterial({...newMaterial, description: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.sku')}</label>
                  <input type="text" name="sku" id="sku"
                         value={editingMaterial ? editingMaterial.sku : newMaterial.sku}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, sku: e.target.value}) : setNewMaterial({...newMaterial, sku: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.unit')}</label>
                  <input type="text" name="unit" id="unit"
                         value={editingMaterial ? editingMaterial.unit : newMaterial.unit}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, unit: e.target.value}) : setNewMaterial({...newMaterial, unit: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.quantity')}</label>
                  <input type="number" name="quantity" id="quantity"
                         value={editingMaterial ? editingMaterial.quantity : newMaterial.quantity}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, quantity: parseInt(e.target.value)}) : setNewMaterial({...newMaterial, quantity: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="cost_per_unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.cost')}</label>
                  <input type="number" step="0.01" name="cost_per_unit" id="cost_per_unit"
                         value={editingMaterial ? editingMaterial.cost_per_unit : newMaterial.cost_per_unit}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, cost_per_unit: parseFloat(e.target.value)}) : setNewMaterial({...newMaterial, cost_per_unit: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.supplier')}</label>
                  <input type="text" name="supplier" id="supplier"
                         value={editingMaterial ? editingMaterial.supplier : newMaterial.supplier}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, supplier: e.target.value}) : setNewMaterial({...newMaterial, supplier: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.reorderLevel')}</label>
                  <input type="number" name="reorder_level" id="reorder_level"
                         value={editingMaterial ? editingMaterial.reorder_level : newMaterial.reorder_level}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, reorder_level: parseInt(e.target.value)}) : setNewMaterial({...newMaterial, reorder_level: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.location')}</label>
                  <input type="text" name="location" id="location"
                         value={editingMaterial ? editingMaterial.location : newMaterial.location}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, location: e.target.value}) : setNewMaterial({...newMaterial, location: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('inventory.form.imageUrl')}</label>
                  <input type="text" name="image_url" id="image_url"
                         value={editingMaterial ? editingMaterial.image_url : newMaterial.image_url}
                         onChange={e => editingMaterial ? setEditingMaterial({...editingMaterial, image_url: e.target.value}) : setNewMaterial({...newMaterial, image_url: e.target.value})}
                         className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setShowCreateModal(false); setEditingMaterial(null); }}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {t('common.cancel')}
                </button>
                <button type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingMaterial ? t('common.update') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;