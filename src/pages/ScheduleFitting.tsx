import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, User, Phone, MapPin,
  Save, X, Plus, AlertTriangle, CheckCircle, Bell
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';

interface FittingData {
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
  reminderEnabled: boolean;
  reminderTime: string;
  fittingType: 'initial' | 'progress' | 'final';
}

const ScheduleFitting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const [loading, setLoading] = useState(false);
  const [fittingData, setFittingData] = useState<FittingData>({
    date: '',
    time: '',
    duration: '60',
    location: 'Main Fitting Room',
    notes: '',
    reminderEnabled: true,
    reminderTime: '24',
    fittingType: 'initial'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFittingData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFittingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!fittingData.date || !fittingData.time) {
        toast.error('Please select both date and time for the fitting');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make an API call to schedule the fitting
      console.log('Scheduling fitting:', {
        orderId: id,
        ...fittingData,
        departmentId: departmentInfo.id
      });

      toast.success(`Fitting scheduled successfully for ${new Date(fittingData.date).toLocaleDateString()} at ${fittingData.time}!`, {
        icon: '📅',
        duration: 4000
      });

      // Navigate back to order details
      navigate(`/orders/${id}`);
    } catch (error) {
      toast.error('Failed to schedule fitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const locations = [
    'Main Fitting Room',
    'VIP Fitting Suite',
    'Private Consultation Room',
    'Bridal Fitting Room',
    'Express Fitting Area'
  ];

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  const reminderOptions = [
    { value: '1', label: '1 hour before' },
    { value: '2', label: '2 hours before' },
    { value: '24', label: '1 day before' },
    { value: '48', label: '2 days before' },
    { value: '72', label: '3 days before' }
  ];

  return (
    <DepartmentAwareComponent>
      {({ orders, loading: ordersLoading }) => {
        const order = orders.find(o => o.id === id);

        if (ordersLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (!order) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
              <div className="text-center">
                <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or has been removed.</p>
                <button
                  onClick={() => navigate('/orders')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Orders
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <PageHeader 
              title={`Schedule Fitting - Order #${order.id}`}
              subtitle={`${departmentInfo.name} • ${order.clientName}`}
              action={
                <button
                  onClick={() => navigate(`/orders/${id}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Order
                </button>
              }
            />

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                  <motion.div 
                    className="bg-white rounded-lg shadow-sm p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                        <Calendar size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Fitting Appointment Details</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Fitting Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fitting Type *
                        </label>
                        <select
                          name="fittingType"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={fittingData.fittingType}
                          onChange={handleInputChange}
                        >
                          <option value="initial">Initial Fitting</option>
                          <option value="progress">Progress Check</option>
                          <option value="final">Final Fitting</option>
                        </select>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                          </label>
                          <input
                            type="date"
                            name="date"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={fittingData.date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time *
                          </label>
                          <select
                            name="time"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={fittingData.time}
                            onChange={handleInputChange}
                          >
                            <option value="">Select time</option>
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Duration and Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                          </label>
                          <select
                            name="duration"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={fittingData.duration}
                            onChange={handleInputChange}
                          >
                            {durations.map(duration => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <select
                            name="location"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={fittingData.location}
                            onChange={handleInputChange}
                          >
                            {locations.map(location => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Reminder Settings */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Bell size={20} className="text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-900">Reminder Settings</h4>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="reminderEnabled"
                              className="sr-only peer" 
                              checked={fittingData.reminderEnabled}
                              onChange={handleInputChange}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {fittingData.reminderEnabled && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Send reminder
                            </label>
                            <select
                              name="reminderTime"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={fittingData.reminderTime}
                              onChange={handleInputChange}
                            >
                              {reminderOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={fittingData.notes}
                          onChange={handleInputChange}
                          placeholder="Any special instructions or notes for the fitting..."
                        />
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${id}`)}
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
                              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <Save size={16} className="mr-2" />
                              Schedule Fitting
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Order Summary */}
                  <motion.div 
                    className="bg-white rounded-lg shadow-sm p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User size={20} className="mr-2" />
                      Order Summary
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-medium text-gray-900">#{order.id}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="font-medium text-gray-900">{order.clientName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Product</p>
                        <p className="font-medium text-gray-900">{order.suitType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'received' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Deadline</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div 
                    className="bg-white rounded-lg shadow-sm p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Phone size={20} className="mr-2" />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.clientContact}</p>
                          <p className="text-sm text-gray-500">Phone</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MapPin size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Workshop Address</p>
                          <p className="text-sm text-gray-500">123 Fashion Street, Dubai</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Fitting Tips */}
                  <motion.div 
                    className="bg-blue-50 rounded-lg p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                      <CheckCircle size={20} className="mr-2" />
                      Fitting Tips
                    </h3>
                    
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Wear appropriate undergarments</li>
                      <li>• Bring shoes you plan to wear</li>
                      <li>• Allow extra time for adjustments</li>
                      <li>• Bring any accessories if needed</li>
                      <li>• Communicate any concerns clearly</li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default ScheduleFitting;