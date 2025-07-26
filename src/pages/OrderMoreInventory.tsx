import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, ShoppingCart, Package, 
  AlertTriangle, Calendar, DollarSign, User
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';

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
      // Validate required fields
      if (!formData.quantity || !formData.supplier) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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

      toast.success(`Purchase order created successfully! Order ID: PO-${Date.now()}`, {
        icon: '📦',
        duration: 4000
      });

      // Navigate back to inventory page
      navigate('/inventory');
    } catch (error) {
      toast.error('Failed to create purchase order. Please try again.');
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
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (!item) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
              <div className="text-center">
                <Package size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
                <p className="text-gray-500 mb-4">The inventory item you're looking for doesn't exist.</p>
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Inventory
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <PageHeader 
              title={`Order More - ${item.name}`}
              subtitle={`${departmentInfo.name} • Create purchase order`}
              action={
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Inventory
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
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center mb-6">
                        <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                          <ShoppingCart size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Purchase Order Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity to Order *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="quantity"
                              required
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-2 text-gray-500">{item.unit}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority Level
                          </label>
                          <select
                            name="priority"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.priority}
                            onChange={handleInputChange}
                          >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                            <option value="express">Express</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Supplier *
                          </label>
                          <input
                            type="text"
                            name="supplier"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.supplier}
                            onChange={handleInputChange}
                            placeholder="Supplier name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                              type="number"
                              name="unitPrice"
                              step="0.01"
                              min="0"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={formData.unitPrice}
                              onChange={handleInputChange}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Delivery Date
                          </label>
                          <input
                            type="date"
                            name="expectedDelivery"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.expectedDelivery}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Notes
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Any special instructions or notes for this order..."
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => navigate('/inventory')}
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
                            Creating Order...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Create Purchase Order
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Item Summary */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Package size={20} className="mr-2" />
                      Item Summary
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/100'}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="font-medium">{item.currentStock} {item.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Level:</span>
                          <span className="font-medium">{item.minStockLevel} {item.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{departmentInfo.name}</span>
                        </div>
                      </div>

                      {item.currentStock <= item.minStockLevel && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center">
                            <AlertTriangle size={16} className="text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-800">Low Stock Alert</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            Current stock is below minimum level
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <DollarSign size={20} className="mr-2" />
                      Order Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">
                          {formData.quantity || '0'} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium">
                          ${formData.unitPrice || '0.00'}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-gray-900">Total Cost:</span>
                          <span className="text-lg font-bold text-gray-900">
                            ${calculateTotal()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                      <AlertTriangle size={20} className="mr-2" />
                      Order Tips
                    </h3>
                    
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Consider ordering 20% above minimum level</li>
                      <li>• Check supplier lead times before ordering</li>
                      <li>• Verify unit prices with supplier</li>
                      <li>• Add buffer time for delivery delays</li>
                      <li>• Keep order confirmation for tracking</li>
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