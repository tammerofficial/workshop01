import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Mail,
  Clock, Ruler, Edit2, Trash2,
  CheckCircle, AlertTriangle, X, Save, Printer
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes'>('details');
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar' : 'en-US', {
      calendar: 'gregory',
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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <AlertTriangle size={16} className="text-gray-600 dark:text-gray-400" />;
      case 'in progress':
        return <Clock size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      case 'cancelled':
        return <X size={16} className="text-red-600 dark:text-red-400" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success(t('orderDetails.toast.print'));
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      toast.success(t('orderDetails.toast.updated'));
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('orderDetails.confirm.delete'))) {
      toast.success(t('orderDetails.toast.deleted'));
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
            <div className="flex items-center justify-center h-64 dark:bg-gray-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          );
        }

        if (!order) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)] dark:bg-gray-900">
              <div className="text-center">
                <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('orderDetails.notFound.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('orderDetails.notFound.message')}</p>
                <button
                  onClick={() => navigate('/orders')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t('orderDetails.backToOrders')}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="dark:bg-gray-900">
            <PageHeader 
              title={t('orderDetails.title', { orderId: order.id })}
              subtitle={t('orderDetails.subtitle', { departmentName: departmentInfo.name, clientName: order.clientName })}
              action={
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Printer size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                    {t('orderDetails.print')}
                  </button>
                  <button
                    onClick={handleEdit}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                        {t('orderDetails.save')}
                      </>
                    ) : (
                      <>
                        <Edit2 size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                        {t('orderDetails.edit')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <ArrowLeft size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                    {t('orderDetails.backToOrders')}
                  </button>
                </div>
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Status Card */}
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{order.id}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{order.suitType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{t(`orderDetails.status.${order.status.replace(' ', '_')}`)}</span>
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {t('orderDetails.created_at', { date: formatDate(order.createdAt) })}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{t('orderDetails.progress')}</span>
                      <span>
                        {order.status === 'completed' ? '100%' : 
                         order.status === 'in progress' ? '60%' : 
                         order.status === 'received' ? '20%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${
                          activeTab === 'details'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {t('orderDetails.tab.details')}
                      </button>
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${
                          activeTab === 'timeline'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {t('orderDetails.tab.timeline')}
                      </button>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${
                          activeTab === 'notes'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {t('orderDetails.tab.notes')}
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Measurements */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                          <Ruler size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
                          {t('orderDetails.measurements')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(order.measurements).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}</div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    defaultValue={value}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
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
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('orderDetails.orderInfo')}</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('orderDetails.productType')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{order.suitType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('orderDetails.deadline')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(order.deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('orderDetails.department')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{departmentInfo.name}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('orderDetails.timeline')}</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('orderDetails.created')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('orderDetails.lastUpdated')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(order.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('orderDetails.daysRemaining')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {t('orderDetails.days', { count: Math.ceil((new Date(order.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) })}
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
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('orderDetails.timeline.created')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {order.status !== 'received' && (
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('orderDetails.timeline.productionStarted')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('orderDetails.timeline.completed')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('orderDetails.notes.label')}
                        </label>
                        <textarea
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={t('orderDetails.notes.placeholder')}
                          defaultValue="Customer requested express delivery. Special attention to sleeve length."
                          readOnly={!isEditing}
                        />
                      </div>
                      {isEditing && (
                        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          <Save size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                          {t('orderDetails.notes.save')}
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <User size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
                    {t('orderDetails.clientInfo')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.clientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetails.clientName')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.clientContact}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetails.phoneNumber')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">client@email.com</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetails.emailAddress')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('orderDetails.quickActions')}</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleScheduleFitting}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <Clock size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                      {t('orderDetails.scheduleFitting')}
                    </button>
                    
                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-500 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                      {t('orderDetails.deleteOrder')}
                    </button>
                  </div>
                </motion.div>

                {/* Order Statistics */}
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('orderDetails.stats')}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('orderDetails.daysInProduction')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('orderDetails.priority')}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {t('orderDetails.priority.normal')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('orderDetails.department')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{departmentInfo.name}</span>
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