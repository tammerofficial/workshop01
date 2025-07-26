import { useState, useEffect } from 'react';
import { useDepartment } from '../contexts/DepartmentContext';
import { mockOrders, mockWorkers, mockInventoryItems, mockNotifications } from '../data/mockData';

// Hook to filter data based on current department
export const useDepartmentData = () => {
  const { currentDepartment, isLoading: departmentLoading } = useDepartment();
  const [loading, setLoading] = useState(false);

  // Filter data based on department
  const getDepartmentData = () => {
    // In a real application, you would filter by department_id from the backend
    // For now, we'll simulate department-specific data by filtering existing mock data
    
    const departmentFilter = (item: any, index: number) => {
      // Simulate department filtering logic based on index and department
      switch (currentDepartment) {
        case 'wedding':
          // Wedding department gets items with indices divisible by 3
          return index % 3 === 0;
        case 'ready-to-wear':
          // Ready-to-wear gets items with indices divisible by 3 with remainder 1
          return index % 3 === 1;
        case 'custom-made':
          // Custom-made gets items with indices divisible by 3 with remainder 2
          return index % 3 === 2;
        default:
          return true;
      }
    };

    // Apply department-specific modifications to data
    const departmentOrders = mockOrders.filter(departmentFilter).map((order, index) => ({
      ...order,
      id: `${currentDepartment.toUpperCase()}-${order.id}`,
      suitType: currentDepartment === 'wedding' ? 'Wedding Dress' :
                 currentDepartment === 'ready-to-wear' ? 'Ready-to-Wear Dress' :
                 'Custom-Made Dress',
      departmentId: currentDepartment
    }));

    const departmentWorkers = mockWorkers.filter(departmentFilter).map((worker, index) => ({
      ...worker,
      id: `${currentDepartment.toUpperCase()}-${worker.id}`,
      department: currentDepartment === 'wedding' ? 'Wedding Department' :
                  currentDepartment === 'ready-to-wear' ? 'Ready-to-Wear Department' :
                  'Custom-Made Department',
      role: currentDepartment === 'wedding' ? 'Bridal Specialist' :
            currentDepartment === 'ready-to-wear' ? 'Fashion Designer' :
            'Custom Tailor'
    }));

    const departmentInventory = mockInventoryItems.filter(departmentFilter).map((item, index) => ({
      ...item,
      id: `${currentDepartment.toUpperCase()}-${item.id}`,
      name: currentDepartment === 'wedding' ? `Wedding ${item.name}` :
            currentDepartment === 'ready-to-wear' ? `RTW ${item.name}` :
            `Custom ${item.name}`,
      category: currentDepartment === 'wedding' ? 'bridal' :
               currentDepartment === 'ready-to-wear' ? 'ready-to-wear' :
               'custom'
    }));

    const departmentNotifications = mockNotifications.filter(departmentFilter).map((notification, index) => ({
      ...notification,
      id: `${currentDepartment.toUpperCase()}-${notification.id}`,
      title: `${currentDepartment === 'wedding' ? 'Wedding' : 
              currentDepartment === 'ready-to-wear' ? 'RTW' : 'Custom'} ${notification.title}`,
      message: notification.message.replace(/Order/g, 
        currentDepartment === 'wedding' ? 'Wedding Order' :
        currentDepartment === 'ready-to-wear' ? 'RTW Order' :
        'Custom Order')
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