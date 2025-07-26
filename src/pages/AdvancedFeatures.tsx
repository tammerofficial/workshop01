import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Package, BarChart, Bell, Users, 
  Settings, ChevronRight, Activity
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import AIAssignmentEngine from '../components/ai/AIAssignmentEngine';
import MaterialTracker from '../components/inventory/MaterialTracker';
import AdvancedReports from '../components/reports/AdvancedReports';
import NotificationSystem from '../components/notifications/NotificationSystem';
import ClientManager from '../components/clients/ClientManager';

type FeatureTab = 'ai' | 'inventory' | 'reports' | 'notifications' | 'clients';

const AdvancedFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('clients');

  const features = [
    {
      id: 'clients' as FeatureTab,
      title: 'Smart Client Management',
      description: 'Auto-linked customer profiles with order history',
      icon: <Users size={24} />,
      color: 'bg-indigo-100 text-indigo-600',
      badge: 'AUTO-LINK'
    },
    {
      id: 'ai' as FeatureTab,
      title: 'AI Smart Automation',
      description: 'Intelligent order assignment and performance optimization',
      icon: <Brain size={24} />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'inventory' as FeatureTab,
      title: 'Advanced Inventory',
      description: 'Material tracking, auto-deduction, and consumption analytics',
      icon: <Package size={24} />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'reports' as FeatureTab,
      title: 'Reports & Analytics',
      description: 'Comprehensive reporting and productivity analysis',
      icon: <BarChart size={24} />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'notifications' as FeatureTab,
      title: 'Smart Notifications',
      description: 'Real-time alerts with TTS and customizable settings',
      icon: <Bell size={24} />,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const renderFeatureContent = () => {
    switch (activeTab) {
      case 'clients':
        return <ClientManager />;
      case 'ai':
        return <AIAssignmentEngine />;
      case 'inventory':
        return <MaterialTracker />;
      case 'reports':
        return <AdvancedReports />;
      case 'notifications':
        return <NotificationSystem />;
      default:
        return <ClientManager />;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Advanced Features" 
        subtitle="Powerful tools to optimize your workshop operations" 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Feature Navigation */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Features</h3>
            </div>
            
            <nav className="space-y-1 p-2">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors duration-200 ${
                    activeTab === feature.id
                      ? 'bg-secondary-50 text-secondary border-l-4 border-secondary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    activeTab === feature.id ? 'bg-secondary text-white' : feature.color
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{feature.description}</div>
                    {feature.badge && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-accent text-white rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className={`${
                    activeTab === feature.id ? 'text-secondary' : 'text-gray-400'
                  }`} />
                </button>
              ))}
            </nav>
          </div>
          
          {/* Quick Stats */}
          <motion.div 
            className="mt-6 bg-white rounded-lg shadow-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center mb-3">
              <Activity size={20} className="text-secondary mr-2" />
              <h4 className="font-medium text-gray-900">System Status</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auto-Linking</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Engine</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Notifications</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  Enabled
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Client Sync</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                  Syncing
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Feature Content */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          key={activeTab}
        >
          {renderFeatureContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;