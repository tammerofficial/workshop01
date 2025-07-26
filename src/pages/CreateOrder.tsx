import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Save, ArrowLeft,
  Shirt, Ruler, FileText
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface OrderFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  productType: string;
  measurements: {
    chest: string;
    waist: string;
    hips: string;
    shoulders: string;
    sleeves: string;
    inseam: string;
    length: string;
  };
  deadline: string;
  notes: string;
  priority: 'normal' | 'urgent' | 'express';
  fabric: string;
  color: string;
}

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    productType: departmentInfo.id === 'wedding' ? 'Wedding Dress' : 
                 departmentInfo.id === 'ready-to-wear' ? 'Ready-to-Wear Dress' : 
                 'Custom Dress',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      shoulders: '',
      sleeves: '',
      inseam: '',
      length: ''
    },
    deadline: '',
    notes: '',
    priority: 'normal',
    fabric: '',
    color: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.clientName || !formData.clientPhone || !formData.productType || !formData.deadline) {
        toast.error(t('createOrder.error.requiredFields'));
        setLoading(false);
        return;
      }

      const orderCode = `${departmentInfo.id.toUpperCase()}-${Date.now()}`;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Creating order:', {
        ...formData,
        orderCode,
        departmentId: departmentInfo.id
      });

      toast.success(t('createOrder.success.created', { orderCode }), {
        icon: '📄',
        duration: 4000
      });

      navigate('/orders');
    } catch (error) {
      toast.error(t('createOrder.error.failed'));
    } finally {
      setLoading(false);
    }
  };

  const productTypes: { [key: string]: { key: string; value: string }[] } = {
    wedding: [
      { key: 'createOrder.productTypes.wedding.dress', value: 'Wedding Dress' },
      { key: 'createOrder.productTypes.wedding.gown', value: 'Bridal Gown' },
      { key: 'createOrder.productTypes.wedding.evening', value: 'Evening Dress' },
      { key: 'createOrder.productTypes.wedding.bridesmaid', value: 'Bridesmaid Dress' },
    ],
    'ready-to-wear': [
      { key: 'createOrder.productTypes.ready-to-wear.casual', value: 'Casual Dress' },
      { key: 'createOrder.productTypes.ready-to-wear.formal', value: 'Formal Dress' },
      { key: 'createOrder.productTypes.ready-to-wear.cocktail', value: 'Cocktail Dress' },
      { key: 'createOrder.productTypes.ready-to-wear.business', value: 'Business Dress' },
    ],
    'custom-made': [
      { key: 'createOrder.productTypes.custom-made.custom', value: 'Custom Dress' },
      { key: 'createOrder.productTypes.custom-made.bespoke', value: 'Bespoke Gown' },
      { key: 'createOrder.productTypes.custom-made.tailored', value: 'Tailored Outfit' },
      { key: 'createOrder.productTypes.custom-made.special', value: 'Special Occasion Dress' },
    ]
  };

  const measurementFields = [
    'chest', 'waist', 'hips', 'shoulders', 'sleeves', 'inseam', 'length'
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader 
        title={t('createOrder.title', { departmentName: departmentInfo.name })}
        subtitle={t('createOrder.subtitle', { departmentDescription: departmentInfo.description.toLowerCase() })}
        action={
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
            {t('createOrder.backToOrders')}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <User size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createOrder.clientInfo')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.clientName')}
                </label>
                <input
                  type="text"
                  name="clientName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder={t('createOrder.clientNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.phone')}
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder={t('createOrder.phonePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.email')}
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder={t('createOrder.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.priority')}
                </label>
                <select
                  name="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="normal">{t('createOrder.priority.normal')}</option>
                  <option value="urgent">{t('createOrder.priority.urgent')}</option>
                  <option value="express">{t('createOrder.priority.express')}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.address')}
                </label>
                <textarea
                  name="clientAddress"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  placeholder={t('createOrder.addressPlaceholder')}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <Shirt size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createOrder.productDetails')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.productType')}
                </label>
                <select
                  name="productType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.productType}
                  onChange={handleInputChange}
                >
                  {(productTypes[departmentInfo.id as keyof typeof productTypes] || []).map(type => (
                    <option key={type.key} value={type.value}>{t(type.key)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.deadline')}
                </label>
                <input
                  type="date"
                  name="deadline"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.fabricType')}
                </label>
                <input
                  type="text"
                  name="fabric"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  placeholder={t('createOrder.fabricTypePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createOrder.color')}
                </label>
                <input
                  type="text"
                  name="color"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder={t('createOrder.colorPlaceholder')}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <Ruler size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createOrder.measurements')}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {measurementFields.map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {t(`createOrder.measurements.${key}`)}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.measurements[key as keyof typeof formData.measurements]}
                    onChange={(e) => handleMeasurementChange(key, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createOrder.notes')}</h3>
            </div>
            
            <textarea
              name="notes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder={t('createOrder.notesPlaceholder')}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {t('orders.cancel')}
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
                  {t('createOrder.creatingButton')}
                </>
              ) : (
                <>
                  <Save size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t('createOrder.createButton')}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateOrder;