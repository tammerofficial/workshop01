import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, UserCheck, AlertTriangle, Loader, Users, ShoppingBag } from 'lucide-react';
import { orderService, workerService } from '../../api/laravel';
import toast from 'react-hot-toast';

// Define interfaces for our data
interface Order {
  id: number;
  description: string;
  status: string;
  complexity: number; // Assuming complexity is a number from 1 to 10
  due_date: string;
}

interface Worker {
  id: number;
  name: string;
  skills: string[];
  current_load: number; // Number of tasks currently assigned
  performance_score: number; // A score from 1 to 100
}

const AIAssignmentEngine: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Map<number, number>>(new Map());
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch initial data from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, workersResponse] = await Promise.all([
        orderService.getAll(),
        workerService.getAll()
      ]);
      
      // Filter for pending orders and map to the expected structure
      const pendingOrders = ordersResponse.data
        .filter((o: any) => o.status === 'pending')
        .map((o: any) => ({
          id: o.id,
          description: o.description || `Order #${o.id}`,
          status: o.status,
          complexity: o.complexity || Math.floor(Math.random() * 10) + 1, // Mock complexity if not present
          due_date: o.due_date
        }));

      // Map workers to the expected structure
      const activeWorkers = workersResponse.data.map((w: any) => ({
        id: w.id,
        name: w.name,
        skills: w.skills || [], // Mock skills if not present
        current_load: w.tasks_count || 0,
        performance_score: w.performance?.efficiency || 80 // Mock performance if not present
      }));

      setOrders(pendingOrders);
      setWorkers(activeWorkers);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error('Failed to load data for AI engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Memoize the unassigned orders to prevent re-renders
  const unassignedOrders = useMemo(() => {
    return orders.filter(order => !assignments.has(order.id));
  }, [orders, assignments]);

  // AI Logic to find the best worker for an order
  const findBestWorkerForOrder = (order: Order, availableWorkers: Worker[]): Worker | null => {
    let bestWorker: Worker | null = null;
    let maxScore = -1;

    availableWorkers.forEach(worker => {
      // Simple scoring: performance minus load, higher is better
      const score = worker.performance_score - (worker.current_load * 10);
      if (score > maxScore) {
        maxScore = score;
        bestWorker = worker;
      }
    });

    return bestWorker;
  };

  // Handle the assignment process
  const handleRunAssignment = () => {
    setIsAssigning(true);
    const newAssignments = new Map(assignments);
    let availableWorkers = [...workers];

    const assignmentPromises = unassignedOrders.map(async (order, index) => {
      return new Promise(resolve => {
        setTimeout(() => {
          const bestWorker = findBestWorkerForOrder(order, availableWorkers);
          if (bestWorker) {
            newAssignments.set(order.id, bestWorker.id);
            // Update worker's load for subsequent assignments in this run
            availableWorkers = availableWorkers.map(w => 
              w.id === bestWorker.id ? { ...w, current_load: w.current_load + 1 } : w
            );
            
            // Simulate API call to assign worker
            orderService.assignWorker(order.id, bestWorker.id)
              .then(() => toast.success(`Order #${order.id} assigned to ${bestWorker.name}`))
              .catch(() => toast.error(`Failed to assign Order #${order.id}`));
          } else {
            toast.warn(`No suitable worker found for Order #${order.id}`);
          }
          resolve(true);
        }, 500 * (index + 1)); // Stagger the assignments for visual effect
      });
    });

    Promise.all(assignmentPromises).then(() => {
      setAssignments(newAssignments);
      setIsAssigning(false);
      // Refresh data after assignments
      fetchData();
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin text-blue-500" size={40} />
        <span className="ml-4 text-lg text-gray-600">Loading AI Engine...</span>
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">AI Assignment Engine</h3>
            <p className="text-sm text-gray-500">Automatically assign pending orders to the best available worker.</p>
          </div>
        </div>
        <motion.button
          onClick={handleRunAssignment}
          disabled={isAssigning || unassignedOrders.length === 0}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAssigning ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Assigning...
            </>
          ) : (
            <>
              <Zap className="mr-2" size={20} />
              Run Smart Assignment
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Pending Orders Column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center"><ShoppingBag size={18} className="mr-2 text-orange-500" />Pending Orders ({unassignedOrders.length})</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {unassignedOrders.length > 0 ? unassignedOrders.map(order => (
              <div key={order.id} className="bg-white p-3 rounded-md shadow-sm border">
                <p className="font-medium text-gray-800">Order #{order.id}</p>
                <p className="text-xs text-gray-500">{order.description}</p>
                <div className="text-xs mt-1">Complexity: <span className="font-bold">{order.complexity}/10</span></div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500">
                <UserCheck size={32} className="mx-auto mb-2" />
                <p>All orders assigned!</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Workers Column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center"><Users size={18} className="mr-2 text-green-500" />Available Workers ({workers.length})</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {workers.map(worker => (
              <div key={worker.id} className="bg-white p-3 rounded-md shadow-sm border">
                <p className="font-medium text-gray-800">{worker.name}</p>
                <div className="text-xs mt-1">
                  Load: <span className="font-bold">{worker.current_load}</span> | 
                  Performance: <span className="font-bold">{worker.performance_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {assignments.size > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">Recent Assignments</h4>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg max-h-40 overflow-y-auto">
            {[...assignments.entries()].map(([orderId, workerId]) => (
              <div key={orderId} className="text-sm text-green-800">
                - Order <span className="font-bold">#{orderId}</span> was assigned to <span className="font-bold">{workers.find(w => w.id === workerId)?.name || 'Unknown'}</span>.
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AIAssignmentEngine;
