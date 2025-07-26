import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Package, Upload, Barcode, 
  AlertTriangle, Camera, X, Plus
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryFormData {
  name: string;
  category: string;
  currentStock: string;
  minStockLevel: string;
  unit: string;
  sku: string;
  description: string;
  supplier: string;
  costPrice: string;
  location: string;
  imageFile: File | null;
}

const EditInventoryItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    category: 'fabric',
    currentStock: '',
    minStockLevel: '',
    unit: 'meters',
    sku: '',
    description: '',
    supplier: '',
    costPrice: '',
    location: '',
    imageFile: null
  });

  const categories = {
    wedding: ['Bridal Fabric', 'Lace', 'Beading', 'Veils', 'Accessories'],
    'ready-to-wear': ['Cotton', 'Polyester', 'Silk', 'Buttons', 'Zippers'],
    'custom-made': ['Premium Fabric', 'Luxury Materials', 'Custom Hardware', 'Specialty Tools']
  };

  const units = ['meters', 'yards', 'pieces', 'rolls', 'sets', 'kg', 'grams'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(t('editInventory.error.imageSize'));
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const generateSKU = () => {
    const prefix = departmentInfo.id.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const sku = `${prefix}-${timestamp}-${random}`;
    
    setFormData(prev => ({ ...prev, sku }));
    toast.success(t('editInventory.success.skuGenerated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.currentStock || !formData.minStockLevel) {
        toast.error(t('editInventory.error.requiredFields'));
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Updating inventory item:', {
        id,
        ...formData,
        departmentId: departmentInfo.id,
        currentStock: parseInt(formData.currentStock),
        minStockLevel: parseInt(formData.minStockLevel),
        costPrice: parseFloat(formData.costPrice) || 0,
        updatedAt: new Date().toISOString()
      });

      toast.success(t('editInventory.success.updated', { itemName: formData.name }), {
        icon: departmentInfo.icon,
        duration: 4000
      });

      // Navigate back to inventory page
      navigate('/inventory');
    } catch (error) {
      toast.error(t('editInventory.error.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DepartmentAwareComponent>
      {({ inventory, loading: inventoryLoading }) => {
        const item = inventory.find(i => i.id === id);

        useEffect(() => {
          if (item) {
            setFormData({
              name: item.name,
              category: item.category,
              currentStock: item.currentStock.toString(),
              minStockLevel: item.minStockLevel.toString(),
              unit: item.unit,
              sku: item.id,
              description: '',
              supplier: '',
              costPrice: '',
              location: '',
              imageFile: null
            });
            setImagePreview(item.imageUrl);
          }
        }, [item]);

        if (inventoryLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          );
        }

        if (!item) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="text-center">
                <Package size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('editInventory.itemNotFound')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('editInventory.itemNotFoundMessage')}</p>
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <ArrowLeft size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t('editInventory.backToInventory')}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div dir={isRTL ? 'rtl' : 'ltr'}>
            <PageHeader 
              title={t('editInventory.title', { itemName: item.name })}
              subtitle={t('editInventory.subtitle', { departmentName: departmentInfo.name })}
              action={
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <ArrowLeft size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t('editInventory.backToInventory')}
                </button>
              }
            />

            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <Package size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('editInventory.basicInfo')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.itemName')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t('editInventory.itemNamePlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.category')}
                      </label>
                      <select
                        name="category"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        {categories[departmentInfo.id as keyof typeof categories].map(category => (
                          <option key={category} value={category.toLowerCase()}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.currentStock')}
                      </label>
                      <input
                        type="number"
                        name="currentStock"
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.currentStock}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.minStockLevel')}
                      </label>
                      <input
                        type="number"
                        name="minStockLevel"
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.minStockLevel}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.unitOfMeasurement')}
                      </label>
                      <select
                        name="unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.unit}
                        onChange={handleInputChange}
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.sku')}
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="sku"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={formData.sku}
                          onChange={handleInputChange}
                          placeholder={t('editInventory.skuPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={generateSKU}
                          className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:hover:bg-gray-500"
                          title={t('editInventory.generateSku')}
                        >
                          <Barcode size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('editInventory.description')}
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t('editInventory.descriptionPlaceholder')}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('editInventory.additionalDetails')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.supplier')}
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        placeholder={t('editInventory.supplierPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.costPrice')}
                      </label>
                      <div className="relative">
                        <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2 text-gray-500 dark:text-gray-400`}>$</span>
                        <input
                          type="number"
                          name="costPrice"
                          step="0.01"
                          min="0"
                          className={`w-full ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                          value={formData.costPrice}
                          onChange={handleInputChange}
                          placeholder={t('editInventory.costPricePlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editInventory.storageLocation')}
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder={t('editInventory.storageLocationPlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <Camera size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('editInventory.productImage')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          title={t('editInventory.removeImage')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <Upload size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{t('editInventory.uploadImage')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('editInventory.imageUploadNote')}</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          <Plus size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                          {t('editInventory.chooseImage')}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    {t('editInventory.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('editInventory.updatingButton')}
                      </>
                    ) : (
                      <>
                        <Save size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                        {t('editInventory.updateButton')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default EditInventoryItem;