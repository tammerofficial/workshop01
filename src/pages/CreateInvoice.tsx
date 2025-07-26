import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, FileText, User, DollarSign, 
  Calendar, Plus, Trash2, Clock, CheckCircle
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDepartment } from '../contexts/DepartmentContext';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import toast from 'react-hot-toast';

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
      toast.error('Invoice must have at least one item');
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
      // Validate required fields
      if (!formData.clientName || !formData.orderNumber || !formData.issueDate || !formData.dueDate) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate items
      if (formData.items.some(item => !item.description || item.quantity <= 0)) {
        toast.error('Please fill in all item details with valid quantities');
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate invoice number
      const invoiceNumber = `INV-${departmentInfo.id.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(7)}`;
      
      console.log('Creating invoice:', {
        ...formData,
        invoiceNumber,
        departmentId: departmentInfo.id,
        total: calculateTotal(),
        createdAt: new Date().toISOString()
      });

      toast.success(`Invoice ${invoiceNumber} created successfully!`, {
        icon: '📄',
        duration: 4000
      });

      // Navigate back to invoices page
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DepartmentAwareComponent>
      {({ orders }) => {
        return (
          <div>
            <PageHeader 
              title={`Create New Invoice - ${departmentInfo.name}`}
              subtitle={`Generate a new invoice for ${departmentInfo.description.toLowerCase()}`}
              action={
                <button
                  onClick={() => navigate('/invoices')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Invoices
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
                {/* Client Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <User size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Enter client's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Number *
                      </label>
                      <select
                        name="orderNumber"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                      >
                        <option value="">Select an order</option>
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.id} - {order.clientName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="clientEmail"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        placeholder="client@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="clientPhone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <FileText size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date *
                      </label>
                      <input
                        type="date"
                        name="issueDate"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        min={formData.issueDate}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                        <DollarSign size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5">
                          <label className={`block text-xs font-medium text-gray-700 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                            Description
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={`block text-xs font-medium text-gray-700 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                            Quantity
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className={`block text-xs font-medium text-gray-700 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                            Unit Price
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                              $
                            </span>
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className={`block text-xs font-medium text-gray-700 mb-1 ${index !== 0 ? 'sr-only' : ''}`}>
                            Total
                          </label>
                          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-0 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax (5%):</span>
                          <span className="font-medium">${calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                          <span>Total:</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <FileText size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                  </div>
                  
                  <textarea
                    name="notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes or payment instructions..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/invoices')}
                    className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Invoice...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Create Invoice
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

export default CreateInvoice;