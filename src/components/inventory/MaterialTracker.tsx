import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingDown, AlertTriangle, Loader, Layers, ShoppingBag, User } from 'lucide-react';
import { materialService, orderService, workerService } from '../../api/laravel';
import toast from 'react-hot-toast';

// Interfaces
interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  reorder_level: number;
}

interface Order {
  id: number;
  status: string;
  materials_required: { material_id: number; quantity: number }[]; // Assuming this structure
}

const MaterialTracker: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [materialsResponse, ordersResponse] = await Promise.all([
        materialService.getAll(),
        orderService.getAll()
      ]);

      setMaterials(materialsResponse.data);
      
      // Mocking materials_required for orders as it's not in the backend
      const ordersWithMockedMaterials = ordersResponse.data.map((o: any) => ({
        ...o,
        materials_required: [
          { material_id: 1, quantity: 2 }, // Example: 2 units of material 1
          { material_id: 3, quantity: 1 }  // Example: 1 unit of material 3
        ]
      }));
      setOrders(ordersWithMockedMaterials);

    } catch (error) {
      console.error("Failed to fetch material data:", error);
      toast.error('Failed to load material tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Memoized calculation for material consumption
  const materialConsumption = useMemo(() => {
    const consumption = new Map<number, number>();
    orders
      .filter(o => o.status === 'in_progress' || o.status === 'completed')
      .forEach(order => {
        order.materials_required.forEach(req => {
          const current = consumption.get(req.material_id) || 0;
          consumption.set(req.material_id, current + req.quantity);
        });
      });
    return consumption;
  }, [orders]);

  // Memoized calculation for remaining stock
  const remainingStock = useMemo(() => {
    return materials.map(material => {
      const consumed = materialConsumption.get(material.id) || 0;
      const remaining = material.quantity - consumed;
      const isLow = remaining <= material.reorder_level;
      return { ...material, consumed, remaining, isLow };
    });
  }, [materials, materialConsumption]);

  const lowStockItems = useMemo(() => {
    return remainingStock.filter(item => item.isLow);
  }, [remainingStock]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin text-green-500" size={40} />
        <span className="ml-4 text-lg text-gray-600">Loading Material Tracker...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Live Material Tracker</h3>
            <p className="text-sm text-gray-500">Real-time inventory levels based on production.</p>
          </div>
        </div>
        {lowStockItems.length > 0 && (
          <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg">
            <AlertTriangle size={20} className="mr-2" />
            <span className="font-semibold">{lowStockItems.length} items are low on stock!</span>
          </div>
        )}
      </div>

      <div className="mt-6 max-h-96 overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Material</th>
              <th scope="col" className="px-6 py-3 text-center">Initial Stock</th>
              <th scope="col" className="px-6 py-3 text-center">Consumed</th>
              <th scope="col" className="px-6 py-3 text-center">Remaining</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {remainingStock.map(item => (
              <tr key={item.id} className={`border-b ${item.isLow ? 'bg-red-50' : 'bg-white'}`}>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.name}
                </th>
                <td className="px-6 py-4 text-center">{item.quantity} {item.unit}</td>
                <td className="px-6 py-4 text-center text-orange-600">
                  - {item.consumed} {item.unit}
                </td>
                <td className={`px-6 py-4 text-center font-bold ${item.isLow ? 'text-red-600' : 'text-green-600'}`}>
                  {item.remaining} {item.unit}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.isLow ? (
                    <span className="px-2 py-1 font-semibold text-xs text-red-800 bg-red-200 rounded-full">
                      Reorder
                    </span>
                  ) : (
                    <span className="px-2 py-1 font-semibold text-xs text-green-800 bg-green-200 rounded-full">
                      Good
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MaterialTracker;
