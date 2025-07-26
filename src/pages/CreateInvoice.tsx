import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, FileText, User, DollarSign, 
  Plus, Trash2
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDepartment } from '../contexts/DepartmentContext';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface InvoiceFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  orderNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  notes: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    orderNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    items: [
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0
      }
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unitPrice: 0
        }
      ]
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length === 1) {
      toast.error(t('createInvoice.error.minItems'));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.clientName || !formData.orderNumber || !formData.issueDate || !formData.dueDate) {
        toast.error(t('createInvoice.error.requiredFields'));
        setLoading(false);
        return;
      }

      if (formData.items.some(item => !item.description || item.quantity <= 0)) {
        toast.error(t('createInvoice.error.invalidItems'));
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const invoiceNumber = `INV-${departmentInfo.id.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(7)}`;
      
      console.log('Creating invoice:', {
        ...formData,
        invoiceNumber,
        departmentId: departmentInfo.id,
        total: calculateTotal(),
        createdAt: new Date().toISOString()
      });

      toast.success(t('createInvoice.success.created', { invoiceNumber }), {
        icon: '📄',
        duration: 4000
      });

      navigate('/invoices');
    } catch (error) {
      toast.error(t('createInvoice.error.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DepartmentAwareComponent>
      {({ orders }) => (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          <PageHeader 
            title={t('createInvoice.title', { departmentName: departmentInfo.name })}
            subtitle={t('createInvoice.subtitle', { departmentDescription: departmentInfo.description.toLowerCase() })}
            action={
              <button
                onClick={() => navigate('/invoices')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t('createInvoice.backToInvoices')}
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createInvoice.clientInfo')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.clientName')}
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder={t('createInvoice.clientNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.orderNumber')}
                    </label>
                    <select
                      name="orderNumber"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                    >
                      <option value="">{t('createInvoice.selectOrderPlaceholder')}</option>
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>
                          {order.id} - {order.clientName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.email')}
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      placeholder={t('createInvoice.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.phone')}
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      placeholder={t('createInvoice.phonePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createInvoice.invoiceDetails')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.issueDate')}
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.dueDate')}
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      min={formData.issueDate}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('createInvoice.status')}
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">{t('createInvoice.status.pending')}</option>
                      <option value="paid">{t('createInvoice.status.paid')}</option>
                      <option value="overdue">{t('createInvoice.status.overdue')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <DollarSign size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createInvoice.invoiceItems')}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <Plus size={16} className={isRTL ? "ml-2" : "mr-2"} />
                    {t('createInvoice.addItem')}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 md:col-span-5">
                        <label className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                          {t('createInvoice.item.description')}
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder={t('createInvoice.item.descriptionPlaceholder')}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                          {t('createInvoice.item.quantity')}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                          {t('createInvoice.item.unitPrice')}
                        </label>
                        <div className="relative">
                          <span className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-500 dark:text-gray-400`}>
                            $
                          </span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className={`w-full ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="col-span-10 md:col-span-2">
                        <label className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                          {t('createInvoice.item.total')}
                        </label>
                        <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-end items-center pt-5">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{t('createInvoice.summary.subtotal')}</span>
                        <span className="font-medium dark:text-gray-100">${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{t('createInvoice.summary.tax')}</span>
                        <span className="font-medium dark:text-gray-100">${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span className="dark:text-gray-100">{t('createInvoice.summary.total')}</span>
                        <span className="dark:text-gray-100">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('createInvoice.additionalNotes')}</h3>
                </div>
                
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t('createInvoice.notesPlaceholder')}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/invoices')}
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
                      {t('createInvoice.creatingButton')}
                    </>
                  ) : (
                    <>
                      <Save size={16} className={isRTL ? "ml-2" : "mr-2"} />
                      {t('createInvoice.createButton')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DepartmentAwareComponent>
  );
};

export default CreateInvoice;