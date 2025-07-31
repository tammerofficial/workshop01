import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calculator,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { productService } from '../../api/productService';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  purchase_price: number;
  product_type: string;
}

interface BOMItem {
  id?: number;
  material_id: number;
  quantity_required: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  is_optional: boolean;
  notes: string;
  material?: Product;
}

interface BOMModalProps {
  product: {
    id: number;
    name: string;
    sku: string;
    auto_calculate_purchase_price: boolean;
    bill_of_materials?: BOMItem[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BillOfMaterialsModal: React.FC<BOMModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const { isDark } = useTheme();
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);
  
  const [newBomItem, setNewBomItem] = useState<Partial<BOMItem>>({
    material_id: 0,
    quantity_required: 1,
    unit: 'piece',
    cost_per_unit: 0,
    is_optional: false,
    notes: ''
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Load product details with BOM
      const [productDetails, materials] = await Promise.all([
        productService.getById(product.id),
        productService.getMaterialsForBOM()
      ]);

      setBomItems(productDetails.bill_of_materials || []);
      setAvailableMaterials(materials);
    } catch (error) {
      console.error('Error loading BOM data:', error);
      toast.error('Error loading BOM data');
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleAddBomItem = async () => {
    if (!newBomItem.material_id || (newBomItem.quantity_required || 0) <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const material = availableMaterials.find(m => m.id === newBomItem.material_id);
      if (!material) return;

      const bomItem: BOMItem = {
        material_id: newBomItem.material_id,
        quantity_required: newBomItem.quantity_required || 1,
        unit: newBomItem.unit || 'piece',
        cost_per_unit: newBomItem.cost_per_unit || material.purchase_price || 0,
        total_cost: (newBomItem.quantity_required || 1) * (newBomItem.cost_per_unit || material.purchase_price || 0),
        is_optional: newBomItem.is_optional || false,
        notes: newBomItem.notes || '',
        material: material
      };

      setBomItems([...bomItems, bomItem]);
      setNewBomItem({
        material_id: 0,
        quantity_required: 1,
        unit: 'piece',
        cost_per_unit: 0,
        is_optional: false,
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding BOM item:', error);
      toast.error('Error adding BOM item');
    }
  };

  const handleUpdateBomItem = async () => {
    if (!editingItem) return;

    try {
      const updatedItems = bomItems.map(item => 
        item.material_id === editingItem.material_id ? editingItem : item
      );
      setBomItems(updatedItems);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating BOM item:', error);
      toast.error('Error updating BOM item');
    }
  };

  const handleDeleteBomItem = (materialId: number) => {
    setBomItems(bomItems.filter(item => item.material_id !== materialId));
  };

  const handleSaveBOM = async () => {
    try {
      setLoading(true);
      
      // Prepare BOM data for API
      const bomData = bomItems.map(item => ({
        material_id: item.material_id,
        quantity_required: item.quantity_required,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        is_optional: item.is_optional,
        notes: item.notes
      }));

      await productService.update(product.id, {
        bill_of_materials: bomData
      });

      toast.success('Bill of Materials saved successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving BOM:', error);
      toast.error('Error saving BOM');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return bomItems.reduce((total, item) => total + item.total_cost, 0);
  };

  const checkMaterialAvailability = (item: BOMItem, quantityToProduce: number = 1) => {
    if (!item.material) return { isAvailable: true, shortage: 0 };
    
    const requiredQuantity = item.quantity_required * quantityToProduce;
    const availableQuantity = item.material.stock_quantity || 0;
    
    return {
      isAvailable: availableQuantity >= requiredQuantity,
      shortage: Math.max(0, requiredQuantity - availableQuantity)
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className={`rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bill of Materials</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {product.name} ({product.sku})
              </p>
            </div>
            <div className="flex items-center gap-3">
              {product.auto_calculate_purchase_price && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Calculator className="w-4 h-4 mr-1" />
                  <span className="text-sm">Auto Calculate</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* BOM Items Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Materials Required</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Material
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-4 py-3 text-left">Material</th>
                        <th className="px-4 py-3 text-left">Quantity</th>
                        <th className="px-4 py-3 text-left">Unit</th>
                        <th className="px-4 py-3 text-left">Cost/Unit</th>
                        <th className="px-4 py-3 text-left">Total Cost</th>
                        <th className="px-4 py-3 text-left">Stock Status</th>
                        <th className="px-4 py-3 text-left">Optional</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bomItems.length > 0 ? (
                        bomItems.map((item, index) => {
                          const availability = checkMaterialAvailability(item);
                          return (
                            <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{item.material?.name}</div>
                                  <div className="text-gray-500 text-xs">{item.material?.sku}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{item.quantity_required}</td>
                              <td className="px-4 py-3">{item.unit}</td>
                              <td className="px-4 py-3">${item.cost_per_unit.toFixed(2)}</td>
                              <td className="px-4 py-3">${item.total_cost.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  {availability.isAvailable ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`text-xs ${availability.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.material?.stock_quantity || 0} available
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {item.is_optional ? (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Optional</span>
                                ) : (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBomItem(item.material_id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            No materials added yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total Cost */}
                {bomItems.length > 0 && (
                  <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Material Cost:</span>
                      <span className="text-xl font-bold text-blue-600">${calculateTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Add/Edit Form */}
              {(showAddForm || editingItem) && (
                <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <h4 className="font-semibold mb-4">
                    {editingItem ? 'Edit Material' : 'Add New Material'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Material</label>
                      <select
                        value={editingItem ? editingItem.material_id : newBomItem.material_id}
                        onChange={(e) => {
                          const materialId = parseInt(e.target.value);
                          const material = availableMaterials.find(m => m.id === materialId);
                          const cost = material?.purchase_price || 0;
                          
                          if (editingItem) {
                            setEditingItem({
                              ...editingItem,
                              material_id: materialId,
                              cost_per_unit: cost,
                              total_cost: editingItem.quantity_required * cost
                            });
                          } else {
                            setNewBomItem({
                              ...newBomItem,
                              material_id: materialId,
                              cost_per_unit: cost
                            });
                          }
                        }}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        required
                      >
                        <option value={0}>Select Material</option>
                        {availableMaterials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name} ({material.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingItem ? editingItem.quantity_required : newBomItem.quantity_required}
                        onChange={(e) => {
                          const quantity = parseFloat(e.target.value) || 0;
                          if (editingItem) {
                            setEditingItem({
                              ...editingItem,
                              quantity_required: quantity,
                              total_cost: quantity * editingItem.cost_per_unit
                            });
                          } else {
                            setNewBomItem({
                              ...newBomItem,
                              quantity_required: quantity
                            });
                          }
                        }}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      <select
                        value={editingItem ? editingItem.unit : newBomItem.unit}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({...editingItem, unit: e.target.value});
                          } else {
                            setNewBomItem({...newBomItem, unit: e.target.value});
                          }
                        }}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                      >
                        <option value="piece">Piece</option>
                        <option value="meter">Meter</option>
                        <option value="yard">Yard</option>
                        <option value="gram">Gram</option>
                        <option value="kilogram">Kilogram</option>
                        <option value="liter">Liter</option>
                        <option value="set">Set</option>
                        <option value="spool">Spool</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Cost per Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingItem ? editingItem.cost_per_unit : newBomItem.cost_per_unit}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          if (editingItem) {
                            setEditingItem({
                              ...editingItem,
                              cost_per_unit: cost,
                              total_cost: editingItem.quantity_required * cost
                            });
                          } else {
                            setNewBomItem({
                              ...newBomItem,
                              cost_per_unit: cost
                            });
                          }
                        }}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingItem ? editingItem.is_optional : newBomItem.is_optional}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({...editingItem, is_optional: e.target.checked});
                          } else {
                            setNewBomItem({...newBomItem, is_optional: e.target.checked});
                          }
                        }}
                        className="mr-2"
                      />
                      Optional Material
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={editingItem ? editingItem.notes : newBomItem.notes}
                      onChange={(e) => {
                        if (editingItem) {
                          setEditingItem({...editingItem, notes: e.target.value});
                        } else {
                          setNewBomItem({...newBomItem, notes: e.target.value});
                        }
                      }}
                      rows={2}
                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                      placeholder="Optional notes about this material..."
                    />
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={editingItem ? handleUpdateBomItem : handleAddBomItem}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Add'} Material
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        setNewBomItem({
                          material_id: 0,
                          quantity_required: 1,
                          unit: 'piece',
                          cost_per_unit: 0,
                          is_optional: false,
                          notes: ''
                        });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBOM}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save BOM'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BillOfMaterialsModal;
