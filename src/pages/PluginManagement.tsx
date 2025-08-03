import React, { useState, useEffect } from 'react';
import { FiPlus, FiSettings, FiDownload, FiPower, FiTrash2, FiSearch, FiGrid, FiList, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Plugin {
  id: number;
  name: string;
  slug: string;
  version: string;
  description: string;
  author: string;
  author_email?: string;
  status: boolean; // true = active, false = inactive
  category: string;
  dependencies?: string[];
  hooks?: string[];
  config?: Record<string, string | number | boolean>;
  permissions?: string[];
  routes?: Record<string, string>;
  assets?: {
    css?: string[];
    js?: string[];
  };
  install_date?: string;
  last_update?: string;
  compatibility_version: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface MarketplacePlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  thumbnail?: string;
  rating: number;
  downloads: number;
  price: number;
  tags: string[];
}

const PluginManagement: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [marketplacePlugins, setMarketplacePlugins] = useState<MarketplacePlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfigModal, setShowConfigModal] = useState<Plugin | null>(null);

  const categories = [
    'all',
    'analytics',
    'automation',
    'communication',
    'dashboard',
    'integration',
    'productivity',
    'security',
    'ui-enhancement',
    'workflow'
  ];

  useEffect(() => {
    fetchPlugins();
    if (activeTab === 'marketplace') {
      fetchMarketplacePlugins();
    }
  }, [activeTab]);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/plugins');
      if (!response.ok) {
        throw new Error('Failed to fetch plugins');
      }
      const data = await response.json();
      setPlugins(data);
    } catch (err) {
      console.error('Error fetching plugins:', err);
      setError('Failed to connect to the plugin service. Please ensure the backend server is running.');
      // Mock data for demonstration
      setPlugins([
        {
          id: 1,
          name: 'Advanced Analytics',
          slug: 'advanced-analytics',
          version: '1.2.0',
          description: 'Enhanced analytics dashboard with real-time reporting and custom metrics.',
          author: 'Workshop Team',
          author_email: 'team@workshop.com',
          status: true, // active
          category: 'analytics',
          dependencies: ['charts-library'],
          hooks: ['dashboard.render', 'reports.generate'],
          config: { refreshInterval: 30000, defaultChart: 'line' },
          permissions: ['analytics.view', 'analytics.export'],
          routes: { 'analytics/dashboard': 'AnalyticsController@dashboard' },
          assets: { css: ['advanced-analytics/style.css'], js: ['advanced-analytics/main.js'] },
          install_date: '2024-01-15T10:00:00Z',
          last_update: '2024-01-20T14:30:00Z',
          compatibility_version: '1.0.0',
          priority: 5,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z'
        },
        {
          id: 2,
          name: 'Smart Notifications',
          slug: 'smart-notifications',
          version: '2.1.0',
          description: 'Intelligent notification system with AI-powered filtering and priority management.',
          author: 'NotifyPro',
          author_email: 'support@notifypro.com',
          status: false, // inactive
          category: 'communication',
          dependencies: ['notification-engine'],
          hooks: ['notification.send', 'priority.calculate'],
          config: { enableAI: true, priority: 'medium' },
          permissions: ['notifications.manage', 'notifications.send'],
          routes: { 'notifications/manage': 'NotificationController@manage' },
          assets: { css: ['smart-notifications/style.css'], js: ['smart-notifications/main.js'] },
          install_date: '2024-01-10T08:15:00Z',
          last_update: '2024-01-18T16:45:00Z',
          compatibility_version: '1.0.0',
          priority: 10,
          created_at: '2024-01-10T08:15:00Z',
          updated_at: '2024-01-18T16:45:00Z'
        },
        {
          id: 3,
          name: 'Workflow Automation',
          slug: 'workflow-automation',
          version: '1.0.5',
          description: 'Automate repetitive tasks and create custom workflows for your workshop processes.',
          author: 'AutoFlow Inc',
          author_email: 'info@autoflow.com',
          status: false, // installed but not active
          category: 'automation',
          dependencies: [],
          hooks: ['workflow.execute', 'task.automate'],
          config: { maxConcurrentWorkflows: 10 },
          permissions: ['workflows.create', 'workflows.execute'],
          routes: { 'workflows/create': 'WorkflowController@create' },
          assets: { css: ['workflow-automation/style.css'], js: ['workflow-automation/main.js'] },
          install_date: '2024-01-05T12:00:00Z',
          last_update: '2024-01-25T09:20:00Z',
          compatibility_version: '1.0.0',
          priority: 15,
          created_at: '2024-01-05T12:00:00Z',
          updated_at: '2024-01-25T09:20:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplacePlugins = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/plugins/marketplace/browse');
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace plugins');
      }
      const data = await response.json();
      setMarketplacePlugins(data);
    } catch (err) {
      console.error('Error fetching marketplace plugins:', err);
      // Mock marketplace data
      setMarketplacePlugins([
        {
          id: 'mp-1',
          name: 'AI Production Optimizer',
          version: '3.0.0',
          description: 'Machine learning-powered production optimization with predictive scheduling.',
          author: 'AI Workshop Solutions',
          category: 'automation',
          rating: 4.9,
          downloads: 5420,
          price: 99.99,
          tags: ['ai', 'optimization', 'scheduling']
        },
        {
          id: 'mp-2',
          name: 'Custom Dashboard Builder',
          version: '2.5.0',
          description: 'Drag-and-drop dashboard builder with customizable widgets and themes.',
          author: 'Dashboard Pro',
          category: 'dashboard',
          rating: 4.7,
          downloads: 3890,
          price: 49.99,
          tags: ['dashboard', 'widgets', 'customization']
        },
        {
          id: 'mp-3',
          name: 'Security Monitor',
          version: '1.8.2',
          description: 'Advanced security monitoring with threat detection and audit logging.',
          author: 'SecureFlow',
          category: 'security',
          rating: 4.8,
          downloads: 2340,
          price: 79.99,
          tags: ['security', 'monitoring', 'audit']
        }
      ]);
    }
  };

  const handlePluginAction = async (plugin: Plugin, action: 'activate' | 'deactivate' | 'install' | 'uninstall') => {
    try {
      const response = await fetch(`http://localhost:8000/api/plugins/${plugin.id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} plugin`);
      }

      // Update plugin status locally
      setPlugins(prev => prev.map(p => 
        p.id === plugin.id 
          ? { 
              ...p, 
              status: action === 'activate' ? true : false
            }
          : p
      ));

      // Show success message (you can implement a toast notification here)
      console.log(`Plugin ${plugin.name} ${action}d successfully`);
    } catch (err) {
      console.error(`Error ${action}ing plugin:`, err);
      setError(`Failed to ${action} plugin: ${plugin.name}`);
    }
  };

  const handleInstallFromMarketplace = async (marketplacePlugin: MarketplacePlugin) => {
    try {
      const response = await fetch('http://localhost:8000/api/plugins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: marketplacePlugin.name,
          slug: marketplacePlugin.id,
          version: marketplacePlugin.version,
          description: marketplacePlugin.description,
          author: marketplacePlugin.author,
          category: marketplacePlugin.category,
          status: 'installed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to install plugin');
      }

      const newPlugin = await response.json();
      setPlugins(prev => [...prev, newPlugin]);
      console.log(`Plugin ${marketplacePlugin.name} installed successfully`);
    } catch (err) {
      console.error('Error installing plugin:', err);
      setError(`Failed to install plugin: ${marketplacePlugin.name}`);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMarketplacePlugins = marketplacePlugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const PluginCard: React.FC<{ plugin: Plugin | MarketplacePlugin; isMarketplace?: boolean }> = ({ 
    plugin, 
    isMarketplace = false 
  }) => {
    const isInstalled = !isMarketplace;
    const installedPlugin = plugin as Plugin;
    const marketplacePlugin = plugin as MarketplacePlugin;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FiPackage className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                <p className="text-sm text-gray-500">v{plugin.version} by {plugin.author}</p>
              </div>
            </div>
            {isInstalled && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                installedPlugin.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {installedPlugin.status ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plugin.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {plugin.category}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Priority: {('priority' in plugin) ? plugin.priority : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {isMarketplace ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">
                  ${marketplacePlugin.price}
                </span>
                <button
                  onClick={() => handleInstallFromMarketplace(marketplacePlugin)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <FiDownload className="text-sm" />
                  <span>Install</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {!installedPlugin.status && (
                  <button
                    onClick={() => handlePluginAction(installedPlugin, 'activate')}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FiPower className="text-sm" />
                    <span>Activate</span>
                  </button>
                )}
                {installedPlugin.status && (
                  <>
                    <button
                      onClick={() => setShowConfigModal(installedPlugin)}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <FiSettings className="text-sm" />
                      <span>Config</span>
                    </button>
                    <button
                      onClick={() => handlePluginAction(installedPlugin, 'deactivate')}
                      className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      <FiPower className="text-sm" />
                      <span>Deactivate</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => handlePluginAction(installedPlugin, 'uninstall')}
                  className="flex items-center space-x-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plugin Management</h1>
              <p className="text-gray-600 mt-2">Manage and discover plugins to extend your workshop functionality</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FiPlus />
              <span>Upload Plugin</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Connection Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'installed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Installed Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Marketplace ({marketplacePlugins.length})
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plugins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* Plugins Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {activeTab === 'installed' ? (
              filteredPlugins.length > 0 ? (
                filteredPlugins.map(plugin => (
                  <PluginCard key={plugin.id} plugin={plugin} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FiPackage className="mx-auto text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins found</h3>
                  <p className="text-gray-600">Try adjusting your search or browse the marketplace for new plugins.</p>
                </div>
              )
            ) : (
              filteredMarketplacePlugins.length > 0 ? (
                filteredMarketplacePlugins.map(plugin => (
                  <PluginCard key={plugin.id} plugin={plugin} isMarketplace />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FiPackage className="mx-auto text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No marketplace plugins found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria.</p>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Configure {showConfigModal.name}</h3>
                <button
                  onClick={() => setShowConfigModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {showConfigModal.config && Object.entries(showConfigModal.config).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type={typeof value === 'boolean' ? 'checkbox' : typeof value === 'number' ? 'number' : 'text'}
                      defaultValue={typeof value === 'boolean' ? undefined : String(value)}
                      defaultChecked={typeof value === 'boolean' ? value : undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConfigModal(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfigModal(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManagement;
