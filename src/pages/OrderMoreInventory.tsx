import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, ShoppingCart, Package, 
  AlertTriangle, DollarSign
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface OrderFormData {
  quantity: string;
  supplier: string;
  unitPrice: string;
  expectedDelivery: string;
  notes: string;
  priority: 'normal' | 'urgent' | 'express';
}

const OrderMoreInventory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    quantity: '',
    supplier: '',
    unitPrice: '',
    expectedDelivery: '',
    notes: '',
    priority: 'normal'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.quantity || !formData.supplier) {
        toast.error(t('orderMoreInventory.toast.error.required'));
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderId = `PO-${Date.now()}`;
      const orderData = {
        itemId: id,
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice) || 0,
        totalCost: parseInt(formData.quantity) * (parseFloat(formData.unitPrice) || 0),
        departmentId: departmentInfo.id,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Creating purchase order:', orderData);

      toast.success(t('orderMoreInventory.toast.success', { orderId }), {
        icon: '📦',
        duration: 4000
      });

      navigate('/inventory');
    } catch (error) {
      toast.error(t('orderMoreInventory.toast.error.failed'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    return (quantity * unitPrice).toFixed(2);
  };

  return (
    <DepartmentAwareComponent>
      {({ inventory, loading: inventoryLoading }) => {
        const item = inventory.find(i => i.id === id);

        if (inventoryLoading) {
          return (
            <div className="flex items-center justify-center h-64 dark:bg-gray-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          );
        }

        if (!item) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)] dark:bg-gray-900">
              <div className="text-center">
                <Package size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('orderMoreInventory.notFound.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('orderMoreInventory.notFound.message')}</p>
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t('orderMoreInventory.backToInventory')}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="dark:bg-gray-900">
            <PageHeader 
              title={t('orderMoreInventory.title', { itemName: item.name })}
              subtitle={t('orderMoreInventory.subtitle', { departmentName: departmentInfo.name })}
              action={
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <ArrowLeft size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t('orderMoreInventory.backToInventory')}
                </button>
              }
            />

            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Form */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <div className="flex items-center mb-6">
                        <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                          <ShoppingCart size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('orderMoreInventory.form.title')}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderMoreInventory.form.quantity')}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="quantity"
                              required
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              placeholder="0"
                            />
                            <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'left-3' : 'right-3'}`}>{item.unit}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderMoreInventory.form.priority')}
                          </label>
                          <select
                            name="priority"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={formData.priority}
                            onChange={handleInputChange}
                          >
                            <option value="normal">{t('orderMoreInventory.form.priority.normal')}</option>
                            <option value="urgent">{t('orderMoreInventory.form.priority.urgent')}</option>
                            <option value="express">{t('orderMoreInventory.form.priority.express')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderMoreInventory.form.supplier')}
                          </label>
                          <input
                            type="text"
                            name="supplier"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={formData.supplier}
                            onChange={handleInputChange}
                            placeholder={t('orderMoreInventory.form.supplier.placeholder')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderMoreInventory.form.unitPrice')}
                          </label>
                          <div className="relative">
                            <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>$</span>
                            <input
                              type="number"
                              name="unitPrice"
                              step="0.01"
                              min="0"
                              className={`w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2`}
                              value={formData.unitPrice}
                              onChange={handleInputChange}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderMoreInventory.form.expectedDelivery')}
                          </label>
                          <input
                            type="date"
                            name="expectedDelivery"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={formData.expectedDelivery}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('orderMoreInventory.form.notes')}
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder={t('orderMoreInventory.form.notes.placeholder')}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => navigate('/inventory')}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t('orderMoreInventory.form.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-blue-500'
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
                            {t('orderMoreInventory.form.submitting')}
                          </>
                        ) : (
                          <>
                            <Save size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                            {t('orderMoreInventory.form.submit')}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Item Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Package size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
                      {t('orderMoreInventory.summary.item.title')}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/100'}
                          alt={item.name}
                          className={`w-16 h-16 rounded-lg object-cover ${isRTL ? 'ml-4' : 'mr-4'}`}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('orderMoreInventory.summary.item.currentStock')}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.currentStock} {item.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('orderMoreInventory.summary.item.minLevel')}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.minStockLevel} {item.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('orderMoreInventory.summary.item.department')}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{departmentInfo.name}</span>
                        </div>
                      </div>

                      {item.currentStock <= item.minStockLevel && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30">
                          <div className="flex items-center">
                            <AlertTriangle size={16} className={`text-red-600 dark:text-red-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            <span className="text-sm font-medium text-red-800 dark:text-red-300">{t('orderMoreInventory.summary.item.lowStock')}</span>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {t('orderMoreInventory.summary.item.lowStock.message')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <DollarSign size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
                      {t('orderMoreInventory.summary.order.title')}
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('orderMoreInventory.summary.order.quantity')}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formData.quantity || '0'} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('orderMoreInventory.summary.order.unitPrice')}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${formData.unitPrice || '0.00'}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('orderMoreInventory.summary.order.totalCost')}</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ${calculateTotal()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                      <AlertTriangle size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
                      {t('orderMoreInventory.tips.title')}
                    </h3>
                    
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                      <li>{t('orderMoreInventory.tips.tip1')}</li>
                      <li>{t('orderMoreInventory.tips.tip2')}</li>
                      <li>{t('orderMoreInventory.tips.tip3')}</li>
                      <li>{t('orderMoreInventory.tips.tip4')}</li>
                      <li>{t('orderMoreInventory.tips.tip5')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default OrderMoreInventory;