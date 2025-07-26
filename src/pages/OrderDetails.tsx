import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, 
  Clock, Package, Ruler, FileText, Edit2, Trash2,
  CheckCircle, AlertTriangle, X, Save, Printer,
  MessageSquare, History, Settings
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes'>('details');
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <AlertTriangle size={16} className="text-gray-600" />;
      case 'in progress':
        return <Clock size={16} className="text-blue-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled':
        return <X size={16} className="text-red-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      toast.success('Order updated successfully');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      toast.success('Order deleted successfully');
      navigate('/orders');
    }
  };

  const handleScheduleFitting = () => {
    navigate(`/orders/${id}/schedule-fitting`);
  };

  return (
    <DepartmentAwareComponent>
      {({ orders, loading }) => {
        const order = orders.find(o => o.id === id);

        if (loading) {
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
              title={`Order #${order.id}`}
              subtitle={`${departmentInfo.name} • ${order.clientName}`}
              action={
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Printer size={16} className="mr-2" />
                    Print
                  </button>
                  <button
                    onClick={handleEdit}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit2 size={16} className="mr-2" />
                        Edit Order
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Orders
                  </button>
                </div>
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Status Card */}
                <motion.div 
                  className="bg-white rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white text-xl`}>
                        {departmentInfo.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">#{order.id}</h2>
                        <p className="text-gray-500">{order.suitType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        Created {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Order Progress</span>
                      <span>
                        {order.status === 'completed' ? '100%' : 
                         order.status === 'in progress' ? '60%' : 
                         order.status === 'received' ? '20%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          order.status === 'completed' ? 'bg-green-500 w-full' :
                          order.status === 'in progress' ? 'bg-blue-500 w-3/5' :
                          order.status === 'received' ? 'bg-yellow-500 w-1/5' :
                          'bg-gray-300 w-0'
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${
                          activeTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Order Details
                      </button>
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${
                          activeTab === 'timeline'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${
                          activeTab === 'notes'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Notes
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Measurements */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Ruler size={20} className="mr-2" />
                          Measurements
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(order.measurements).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-600 capitalize">{key}</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    defaultValue={value}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                ) : (
                                  `${value}"`
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Product Type:</span>
                              <span className="font-medium">{order.suitType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Deadline:</span>
                              <span className="font-medium">{new Date(order.deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Department:</span>
                              <span className="font-medium">{departmentInfo.name}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="font-medium">{new Date(order.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Days Remaining:</span>
                              <span className="font-medium">
                                {Math.ceil((new Date(order.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Order Created</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {order.status !== 'received' && (
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock size={16} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Production Started</p>
                            <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={16} className="text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Order Completed</p>
                            <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Notes
                        </label>
                        <textarea
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add notes about this order..."
                          defaultValue="Customer requested express delivery. Special attention to sleeve length."
                          readOnly={!isEditing}
                        />
                      </div>
                      {isEditing && (
                        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          <Save size={16} className="mr-2" />
                          Save Notes
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Client Information */}
                <motion.div 
                  className="bg-white rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User size={20} className="mr-2" />
                    Client Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.clientName}</p>
                        <p className="text-sm text-gray-500">Client Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.clientContact}</p>
                        <p className="text-sm text-gray-500">Phone Number</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">client@email.com</p>
                        <p className="text-sm text-gray-500">Email Address</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  className="bg-white rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleScheduleFitting}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Calendar size={16} className="mr-2" />
                      Schedule Fitting
                    </button>
                    
                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Order
                    </button>
                  </div>
                </motion.div>

                {/* Order Statistics */}
                <motion.div 
                  className="bg-white rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Days in Production</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Priority</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Normal
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">{departmentInfo.name}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default OrderDetails;