import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, User, Phone, Shirt, Ruler, Save, ArrowLeft,
  Calendar, FileText, Scissors, Package
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';

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
      // Generate unique order code
      const orderCode = `${departmentInfo.id.toUpperCase()}-${Date.now()}`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make an API call to create the order
      console.log('Creating order:', {
        ...formData,
        orderCode,
        departmentId: departmentInfo.id
      });

      toast.success(`Order ${orderCode} created successfully!`, {
        icon: departmentInfo.icon,
        duration: 4000
      });

      // Navigate back to orders page
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const productTypes = {
    wedding: ['Wedding Dress', 'Bridal Gown', 'Evening Dress', 'Bridesmaid Dress'],
    'ready-to-wear': ['Casual Dress', 'Formal Dress', 'Cocktail Dress', 'Business Dress'],
    'custom-made': ['Custom Dress', 'Bespoke Gown', 'Tailored Outfit', 'Special Occasion Dress']
  };

  return (
    <div>
      <PageHeader 
        title={`Create New ${departmentInfo.name} Order`}
        subtitle={`Add a new order for ${departmentInfo.description.toLowerCase()}`}
        action={
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
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
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="+971 50 123 4567"
                />
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="clientAddress"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  placeholder="Enter client's address"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                <Shirt size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  name="productType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.productType}
                  onChange={handleInputChange}
                >
                  {productTypes[departmentInfo.id as keyof typeof productTypes].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabric Type
                </label>
                <input
                  type="text"
                  name="fabric"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  placeholder="e.g., Silk, Cotton, Chiffon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., White, Ivory, Blush"
                />
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                <Ruler size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Measurements (inches)</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(formData.measurements).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={value}
                    onChange={(e) => handleMeasurementChange(key, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
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
              placeholder="Any special requirements, design preferences, or additional notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
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
                  Create Order
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