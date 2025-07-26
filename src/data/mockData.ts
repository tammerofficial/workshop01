import { Order, Worker, Task, InventoryItem, Station, Notification, ProductionStage } from '../types';

// Generate random past date
const randomPastDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate random future date
const randomFutureDate = (daysAhead = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date.toISOString();
};

// Mock Orders
export const mockOrders: Order[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ORD-${1000 + i}`,
  clientName: [
    'John Smith', 'Emma Wilson', 'Ahmed Al-Farsi', 'Michael Brown', 
    'Sara Johnson', 'David Lee', 'Olivia Parker', 'Yusuf Hassan', 
    'Sophia Martinez', 'Daniel Kim', 'Zainab Ali', 'Robert Chen',
    'Aisha Mohammed', 'James Taylor', 'Fatima Khan'
  ][i],
  clientContact: `+971 5${Math.floor(Math.random() * 10)} ${Math.floor(1000000 + Math.random() * 9000000)}`,
  suitType: ['Classic Two-Piece', 'Three-Piece', 'Tuxedo', 'Slim Fit', 'Double Breasted'][Math.floor(Math.random() * 5)],
  measurements: {
    chest: Math.floor(90 + Math.random() * 30),
    waist: Math.floor(75 + Math.random() * 30),
    hips: Math.floor(90 + Math.random() * 25),
    sleeves: Math.floor(60 + Math.random() * 15),
    inseam: Math.floor(70 + Math.random() * 20),
    shoulders: Math.floor(40 + Math.random() * 15),
  },
  deadline: randomFutureDate(30),
  status: ['received', 'in progress', 'completed', 'cancelled'][Math.floor(Math.random() * 3)] as any,
  currentStage: [
    'order_received', 'fabric_selection', 'cutting', 
    'sewing', 'assembly_finishing', 'ironing_packaging', 'ready_for_delivery'
  ][Math.floor(Math.random() * 7)] as ProductionStage,
  stageProgress: {
    order_received: {
      startTime: randomPastDate(20),
      endTime: randomPastDate(18),
      workerId: `W-${1000 + Math.floor(Math.random() * 10)}`,
    }
  },
  createdAt: randomPastDate(30),
  updatedAt: randomPastDate(5),
}));

// Mock Workers
export const mockWorkers: Worker[] = Array.from({ length: 12 }, (_, i) => ({
  id: `W-${1000 + i}`,
  name: [
    'Ali Hassan', 'Fatima Zaidi', 'Mohammed Al-Mansoori', 'Sarah Abdullah', 
    'Ahmad Khan', 'Layla Mahmoud', 'Omar Qasim', 'Noor Al-Hashemi', 
    'Khalid Rahman', 'Zainab Ali', 'Yusuf Ahmed', 'Mariam Hussein'
  ][i],
  role: ['Tailor', 'Cutter', 'Finisher', 'Boutique Staff', 'Manager'][Math.floor(Math.random() * 5)],
  department: ['Cutting', 'Sewing', 'Finishing', 'Boutique', 'Management'][Math.floor(Math.random() * 5)],
  status: ['active', 'on leave', 'unavailable'][Math.floor(Math.random() * 3)] as any,
  imageUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
  skills: [
    'Pattern Making', 'Hand Stitching', 'Machine Sewing', 'Cutting', 
    'Measurements', 'Fabric Knowledge', 'Alterations', 'Customer Service'
  ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
  performance: {
    completedTasks: Math.floor(Math.random() * 100) + 20,
    averageTime: Math.floor(Math.random() * 120) + 30,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  contactInfo: {
    email: `worker${i + 1}@example.com`,
    phone: `+971 5${Math.floor(Math.random() * 10)} ${Math.floor(1000000 + Math.random() * 9000000)}`,
  },
}));

// Roles and Skills specific to departments
export const roles = {
  'wedding': ['Bridal Consultant', 'Seamstress', 'Pattern Maker', 'Beading Specialist', 'Cutter'],
  'ready-to-wear': ['Sales Associate', 'Stock Manager', 'Visual Merchandiser', 'Tailor'],
  'custom-made': ['Master Tailor', 'Designer', 'Cutter', 'Client Advisor', 'Fitter']
};

export const commonSkills = {
    'wedding': ['Lace Application', 'Veil Making', 'Corsetry', 'Hand Beading', 'Alterations'],
    'ready-to-wear': ['Customer Service', 'Inventory Management', 'POS Systems', 'Styling', 'Basic Alterations'],
    'custom-made': ['Bespoke Tailoring', 'Pattern Drafting', 'Fabric Consultation', 'Draping', 'Fitting Expertise']
};


// Mock Tasks
export const mockTasks: Task[] = Array.from({ length: 20 }, (_, i) => {
  const isCompleted = Math.random() > 0.5;
  return {
    id: `TASK-${1000 + i}`,
    orderId: mockOrders[Math.floor(Math.random() * mockOrders.length)].id,
    workerId: mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id,
    stage: [
      'order_received', 'fabric_selection', 'cutting', 
      'sewing', 'assembly_finishing', 'ironing_packaging', 'ready_for_delivery'
    ][Math.floor(Math.random() * 7)] as ProductionStage,
    startTime: randomPastDate(10),
    endTime: isCompleted ? randomPastDate(5) : null,
    status: isCompleted ? 'completed' : (['assigned', 'in progress'] as const)[Math.floor(Math.random() * 2)],
    notes: ['Urgent order', 'Special fabric handling required', 'Client requested adjustments', '', ''][Math.floor(Math.random() * 5)],
  };
});

// Mock Inventory Items
export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'INV-1001',
    name: 'Premium Wool Fabric',
    category: 'fabric',
    currentStock: 135,
    minStockLevel: 50,
    unit: 'meters',
    imageUrl: 'https://images.pexels.com/photos/6843508/pexels-photo-6843508.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1002',
    name: 'Linen Blend',
    category: 'fabric',
    currentStock: 78,
    minStockLevel: 30,
    unit: 'meters',
    imageUrl: 'https://images.pexels.com/photos/4925504/pexels-photo-4925504.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1003',
    name: 'Cotton Shirting',
    category: 'fabric',
    currentStock: 210,
    minStockLevel: 100,
    unit: 'meters',
    imageUrl: 'https://images.pexels.com/photos/6050312/pexels-photo-6050312.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1004',
    name: 'Metal Buttons',
    category: 'accessory',
    currentStock: 320,
    minStockLevel: 100,
    unit: 'pieces',
    imageUrl: 'https://images.pexels.com/photos/6069211/pexels-photo-6069211.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1005',
    name: 'Silk Lining',
    category: 'fabric',
    currentStock: 45,
    minStockLevel: 20,
    unit: 'meters',
    imageUrl: 'https://images.pexels.com/photos/2918063/pexels-photo-2918063.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1006',
    name: 'Zippers',
    category: 'accessory',
    currentStock: 180,
    minStockLevel: 50,
    unit: 'pieces',
    imageUrl: 'https://images.pexels.com/photos/1961800/pexels-photo-1961800.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1007',
    name: 'Thread Spools',
    category: 'accessory',
    currentStock: 240,
    minStockLevel: 100,
    unit: 'spools',
    imageUrl: 'https://images.pexels.com/photos/4309692/pexels-photo-4309692.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
  {
    id: 'INV-1008',
    name: 'Tailoring Scissors',
    category: 'tool',
    currentStock: 8,
    minStockLevel: 3,
    unit: 'pieces',
    imageUrl: 'https://images.pexels.com/photos/4621921/pexels-photo-4621921.jpeg?auto=compress&cs=tinysrgb&w=400',
    usageLog: [],
  },
];

// Add usage logs to inventory items
mockInventoryItems.forEach(item => {
  const logEntries = Math.floor(Math.random() * 5) + 1;
  item.usageLog = Array.from({ length: logEntries }, () => ({
    date: randomPastDate(20),
    orderId: mockOrders[Math.floor(Math.random() * mockOrders.length)].id,
    workerId: mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id,
    quantity: Math.floor(Math.random() * 10) + 1,
  }));
});

// Mock Stations
export const mockStations: Station[] = [
  {
    id: 'ST-1001',
    name: 'Cutting Station 1',
    type: 'cutting',
    status: ['idle', 'active', 'maintenance'][Math.floor(Math.random() * 3)] as any,
    currentWorkerId: Math.random() > 0.3 ? mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id : null,
    currentOrderId: Math.random() > 0.3 ? mockOrders[Math.floor(Math.random() * mockOrders.length)].id : null,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  {
    id: 'ST-1002',
    name: 'Cutting Station 2',
    type: 'cutting',
    status: ['idle', 'active', 'maintenance'][Math.floor(Math.random() * 3)] as any,
    currentWorkerId: Math.random() > 0.3 ? mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id : null,
    currentOrderId: Math.random() > 0.3 ? mockOrders[Math.floor(Math.random() * mockOrders.length)].id : null,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  {
    id: 'ST-1003',
    name: 'Sewing Station 1',
    type: 'sewing',
    status: ['idle', 'active', 'maintenance'][Math.floor(Math.random() * 3)] as any,
    currentWorkerId: Math.random() > 0.3 ? mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id : null,
    currentOrderId: Math.random() > 0.3 ? mockOrders[Math.floor(Math.random() * mockOrders.length)].id : null,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  {
    id: 'ST-1004',
    name: 'Sewing Station 2',
    type: 'sewing',
    status: ['idle', 'active', 'maintenance'][Math.floor(Math.random() * 3)] as any,
    currentWorkerId: Math.random() > 0.3 ? mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id : null,
    currentOrderId: Math.random() > 0.3 ? mockOrders[Math.floor(Math.random() * mockOrders.length)].id : null,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  {
    id: 'ST-1005',
    name: 'Finishing Station',
    type: 'finishing',
    status: ['idle', 'active', 'maintenance'][Math.floor(Math.random() * 3)] as any,
    currentWorkerId: Math.random() > 0.3 ? mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id : null,
    currentOrderId: Math.random() > 0.3 ? mockOrders[Math.floor(Math.random() * mockOrders.length)].id : null,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  {
    id: 'ST-1006',
    name: 'Packaging Station',
    type: 'packaging',
    status: ['idle', 'active', 'maintenance'][Math.floor(Math.random() * 3)] as any,
    currentWorkerId: Math.random() > 0.3 ? mockWorkers[Math.floor(Math.random() * mockWorkers.length)].id : null,
    currentOrderId: Math.random() > 0.3 ? mockOrders[Math.floor(Math.random() * mockOrders.length)].id : null,
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'NOT-1001',
    type: 'order',
    title: 'Order Ready for Delivery',
    message: `Order #ORD-1002 for Ahmed Al-Farsi is ready for delivery.`,
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedId: 'ORD-1002',
  },
  {
    id: 'NOT-1002',
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'Silk Lining is running low. Current stock: 15 meters.',
    isRead: true,
    createdAt: randomPastDate(2),
    relatedId: 'INV-1005',
  },
  {
    id: 'NOT-1003',
    type: 'worker',
    title: 'Worker Status Update',
    message: 'Ali Hassan has changed status to On Leave until June 25.',
    isRead: false,
    createdAt: randomPastDate(1),
    relatedId: 'W-1000',
  },
  {
    id: 'NOT-1004',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance on Sunday, June 26 at 02:00 AM.',
    isRead: true,
    createdAt: randomPastDate(3),
  },
  {
    id: 'NOT-1005',
    type: 'order',
    title: 'Urgent Order Assigned',
    message: 'Urgent order #ORD-1008 has been assigned to Mohammed Al-Mansoori.',
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedId: 'ORD-1008',
  },
];

// Calculate statistics
export const dashboardStats = {
  totalOrders: mockOrders.length,
  ordersInProgress: mockOrders.filter(order => order.status === 'in progress').length,
  completedOrders: mockOrders.filter(order => order.status === 'completed').length,
  cancelledOrders: mockOrders.filter(order => order.status === 'cancelled').length,
  activeWorkers: mockWorkers.filter(worker => worker.status === 'active').length,
  lowStockItems: mockInventoryItems.filter(item => item.currentStock <= item.minStockLevel).length,
  avgProductionTime: 4.2, // days (mock value)
  revenue: {
    today: Math.floor(Math.random() * 5000) + 2000,
    week: Math.floor(Math.random() * 20000) + 15000,
    month: Math.floor(Math.random() * 50000) + 50000,
  },
  topPerformer: mockWorkers.sort((a, b) => b.performance.efficiency - a.performance.efficiency)[0],
};