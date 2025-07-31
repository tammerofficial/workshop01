import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Settings,
  Clock,
  Users,
  Layers,
  CheckCircle,
  AlertTriangle,
  Save,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  product_type: 'simple' | 'variable' | 'raw_material' | 'product_part';
  price: number;
  purchase_price: number;
  stock_quantity: number;
  production_hours: number;
  manufacturing_time_days: number;
  category?: { id: number; name: string; };
  collection?: { id: number; name: string; };
  bill_of_materials?: BOMItem[];
  stage_requirements?: StageRequirement[];
  worker_requirements?: WorkerRequirement[];
  is_active: boolean;
}

interface BOMItem {
  id?: number;
  material_id: number;
  material?: { id: number; name: string; sku: string; stock_quantity: number; };
  quantity_required: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  is_optional: boolean;
  notes?: string;
}

interface StageRequirement {
  id?: number;
  production_stage_id: number;
  production_stage?: { id: number; name: string; };
  order_sequence: number;
  estimated_hours: number;
  required_workers: number;
  skill_requirements?: string[];
  equipment_requirements?: string[];
  is_parallel: boolean;
  parallel_stages?: number[];
  is_critical: boolean;
  buffer_time_hours: number;
  notes?: string;
}

interface WorkerRequirement {
  id?: number;
  stage_requirement_id: number;
  worker_id: number;
  worker?: { id: number; name: string; employee_code: string; };
  priority: number;
  efficiency_rate: number;
  required_skills?: string[];
  hourly_rate?: number;
  max_concurrent_orders: number;
  is_primary: boolean;
  can_supervise: boolean;
}

interface ProductionStage {
  id: number;
  name: string;
  description?: string;
  order_sequence: number;
  estimated_hours: number;
}

interface Worker {
  id: number;
  name: string;
  employee_code: string;
  department: string;
  position: string;
  hourly_rate?: number;
  skills?: string[];
}

interface Material {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  cost_per_unit: number;
  unit: string;
}

const EnhancedProductManager: React.FC = () => {
  const { isDark } = useTheme();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [productionStages, setProductionStages] = useState<ProductionStage[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'bom' | 'stages' | 'workers'>('basic');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all necessary data in parallel
      const [productsRes, stagesRes, workersRes, materialsRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/products/production-stages').then(r => r.json()),
        fetch('/api/products/available-workers').then(r => r.json()),
        fetch('/api/products/materials-for-bom').then(r => r.json())
      ]);
      
      setProducts(productsRes.data || productsRes);
      setProductionStages(stagesRes);
      setWorkers(workersRes);
      setMaterials(materialsRes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const loadCompleteProductData = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/complete-data`);
      const data = await response.json();
      setSelectedProduct(data.product);
    } catch (error) {
      console.error('Error loading complete product data:', error);
      toast.error('Error loading product details');
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const ProductBasicInfo: React.FC<{ product: Product }> = ({ product }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={product.name}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            type="text"
            value={product.sku}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product Type</label>
          <input
            type="text"
            value={product.product_type.replace('_', ' ').toUpperCase()}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="text"
            value={`$${product.price}`}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Production Hours</label>
          <input
            type="text"
            value={`${product.production_hours} hours`}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Manufacturing Days</label>
          <input
            type="text"
            value={`${product.manufacturing_time_days} days`}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            readOnly
          />
        </div>
      </div>
    </div>
  );

  const BillOfMaterialsSection: React.FC<{ product: Product }> = ({ product }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bill of Materials</h3>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>
      
      {product.bill_of_materials && product.bill_of_materials.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-3">Material</th>
                <th className="text-left p-3">Quantity</th>
                <th className="text-left p-3">Unit</th>
                <th className="text-left p-3">Cost per Unit</th>
                <th className="text-left p-3">Total Cost</th>
                <th className="text-left p-3">Optional</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {product.bill_of_materials.map((item, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{item.material?.name}</div>
                      <div className="text-sm text-gray-500">{item.material?.sku}</div>
                    </div>
                  </td>
                  <td className="p-3">{item.quantity_required}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">${item.cost_per_unit}</td>
                  <td className="p-3">${item.total_cost}</td>
                  <td className="p-3">
                    {item.is_optional ? (
                      <span className="text-yellow-600">Optional</span>
                    ) : (
                      <span className="text-green-600">Required</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No materials defined yet</p>
        </div>
      )}
    </div>
  );

  const ProductionStagesSection: React.FC<{ product: Product }> = ({ product }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Production Stages</h3>
        <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          Add Stage
        </button>
      </div>
      
      {product.stage_requirements && product.stage_requirements.length > 0 ? (
        <div className="space-y-3">
          {product.stage_requirements
            .sort((a, b) => a.order_sequence - b.order_sequence)
            .map((stage, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium">
                    Step {stage.order_sequence}
                  </div>
                  <h4 className="font-medium">{stage.production_stage?.name}</h4>
                  {stage.is_critical && (
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs">
                      Critical
                    </span>
                  )}
                  {stage.is_parallel && (
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                      Parallel
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Estimated Hours:</span>
                  <div className="font-medium">{stage.estimated_hours}h</div>
                </div>
                <div>
                  <span className="text-gray-500">Required Workers:</span>
                  <div className="font-medium">{stage.required_workers}</div>
                </div>
                <div>
                  <span className="text-gray-500">Buffer Time:</span>
                  <div className="font-medium">{stage.buffer_time_hours}h</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Time:</span>
                  <div className="font-medium">{stage.estimated_hours + stage.buffer_time_hours}h</div>
                </div>
              </div>
              
              {stage.skill_requirements && stage.skill_requirements.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Required Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {stage.skill_requirements.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No production stages defined yet</p>
        </div>
      )}
    </div>
  );

  const WorkerRequirementsSection: React.FC<{ product: Product }> = ({ product }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Worker Requirements</h3>
        <button className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          Assign Worker
        </button>
      </div>
      
      {product.worker_requirements && product.worker_requirements.length > 0 ? (
        <div className="space-y-3">
          {product.worker_requirements.map((workerReq, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm font-medium">
                    Priority {workerReq.priority}
                  </div>
                  <h4 className="font-medium">{workerReq.worker?.name}</h4>
                  <span className="text-gray-500 text-sm">({workerReq.worker?.employee_code})</span>
                  {workerReq.is_primary && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                      Primary
                    </span>
                  )}
                  {workerReq.can_supervise && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                      Supervisor
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Efficiency Rate:</span>
                  <div className="font-medium">{(workerReq.efficiency_rate * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Hourly Rate:</span>
                  <div className="font-medium">${workerReq.hourly_rate || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Max Concurrent Orders:</span>
                  <div className="font-medium">{workerReq.max_concurrent_orders}</div>
                </div>
                <div>
                  <span className="text-gray-500">Stage:</span>
                  <div className="font-medium">Stage {workerReq.stage_requirement_id}</div>
                </div>
              </div>
              
              {workerReq.required_skills && workerReq.required_skills.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Required Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {workerReq.required_skills.map((skill, idx) => (
                      <span key={idx} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No worker assignments yet</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete product lifecycle management with BOM, stages, and worker assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => loadCompleteProductData(product.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.product_type === 'simple' ? 'bg-green-100 text-green-800' :
                      product.product_type === 'raw_material' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {product.product_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.sku}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'basic', label: 'Basic Info', icon: Package },
                    { id: 'bom', label: 'Bill of Materials', icon: Layers },
                    { id: 'stages', label: 'Production Stages', icon: Clock },
                    { id: 'workers', label: 'Worker Requirements', icon: Users }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'basic' && <ProductBasicInfo product={selectedProduct} />}
                  {activeTab === 'bom' && <BillOfMaterialsSection product={selectedProduct} />}
                  {activeTab === 'stages' && <ProductionStagesSection product={selectedProduct} />}
                  {activeTab === 'workers' && <WorkerRequirementsSection product={selectedProduct} />}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Select a Product
              </h3>
              <p className="text-gray-500">
                Choose a product from the list to view and manage its details, BOM, stages, and worker requirements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductManager;