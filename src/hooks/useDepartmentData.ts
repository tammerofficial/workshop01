import { useState, useEffect } from 'react';
import { useDepartment } from '../contexts/DepartmentContext';
import { mockOrders, mockWorkers, mockInventoryItems, mockNotifications } from '../data/mockData';

// Hook to filter data based on current department
export const useDepartmentData = () => {
  const { currentDepartment, isLoading: departmentLoading } = useDepartment();
  const [loading, setLoading] = useState(false);

  // Filter data based on department
  const getDepartmentData = () => {
    // No longer need to filter by department, just return all mock data.
    // In a real application, you might have a default scope or no scope.
    const departmentFilter = () => true;

    // Apply department-specific modifications to data
    const departmentOrders = mockOrders.filter(departmentFilter).map((order) => ({
      ...order,
      id: `${currentDepartment.toUpperCase()}-${order.id}`,
      suitType: 'General Product',
      departmentId: currentDepartment
    }));

    const departmentWorkers = mockWorkers.filter(departmentFilter).map((worker) => ({
      ...worker,
      id: `${currentDepartment.toUpperCase()}-${worker.id}`,
      department: 'General Workshop',
      role: 'Workshop Staff'
    }));

    const departmentInventory = mockInventoryItems.filter(departmentFilter).map((item) => ({
      ...item,
      id: `${currentDepartment.toUpperCase()}-${item.id}`,
      name: `General ${item.name}`,
      category: 'general'
    }));

    const departmentNotifications = mockNotifications.filter(departmentFilter).map((notification) => ({
      ...notification,
      id: `${currentDepartment.toUpperCase()}-${notification.id}`,
      title: `General ${notification.title}`,
      message: notification.message.replace(/Order/g, 'General Order')
    }));

    return {
      orders: departmentOrders,
      workers: departmentWorkers,
      inventory: departmentInventory,
      notifications: departmentNotifications
    };
  };

  const [departmentData, setDepartmentData] = useState(getDepartmentData());

  useEffect(() => {
    const loadDepartmentData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update data based on current department
      setDepartmentData(getDepartmentData());
      setLoading(false);
    };

    loadDepartmentData();
  }, [currentDepartment]);

  return {
    ...departmentData,
    loading: loading || departmentLoading,
    currentDepartment
  };
};

// Hook for department-specific statistics
export const useDepartmentStats = () => {
  const { orders, workers, inventory, loading } = useDepartmentData();

  const stats = {
    totalOrders: orders.length,
    ordersInProgress: orders.filter(order => order.status === 'in progress').length,
    completedOrders: orders.filter(order => order.status === 'completed').length,
    cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
    activeWorkers: workers.filter(worker => worker.status === 'active').length,
    lowStockItems: inventory.filter(item => item.currentStock <= item.minStockLevel).length,
    avgProductionTime: 4.2, // Mock value
    revenue: {
      today: Math.floor(Math.random() * 5000) + 2000,
      week: Math.floor(Math.random() * 20000) + 15000,
      month: Math.floor(Math.random() * 50000) + 50000,
    },
    topPerformer: workers.sort((a, b) => b.performance.efficiency - a.performance.efficiency)[0],
  };

  return { stats, loading };
};
