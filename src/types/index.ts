export type OrderStatus = 'received' | 'in progress' | 'completed' | 'cancelled';
export type WorkerStatus = 'active' | 'on leave' | 'unavailable';
export type ProductionStage = 
  | 'order_received' 
  | 'fabric_selection'
  | 'cutting'
  | 'sewing'
  | 'assembly_finishing'
  | 'ironing_packaging'
  | 'ready_for_delivery';

export interface Order {
  id: string;
  clientName: string;
  clientContact: string;
  suitType: string;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    sleeves: number;
    [key: string]: number;
  };
  deadline: string;
  status: OrderStatus;
  currentStage: ProductionStage;
  stageProgress: {
    [key in ProductionStage]?: {
      startTime: string;
      endTime: string | null;
      workerId: string | null;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  status: WorkerStatus;
  imageUrl: string;
  skills: string[];
  performance: {
    completedTasks: number;
    averageTime: number;
    efficiency: number;
  };
  contactInfo: {
    email: string;
    phone: string;
  };
}

export interface Task {
  id: string;
  orderId: string;
  workerId: string;
  stage: ProductionStage;
  startTime: string;
  endTime: string | null;
  status: 'assigned' | 'in progress' | 'completed';
  notes: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'fabric' | 'accessory' | 'tool';
  currentStock: number;
  minStockLevel: number;
  unit: string;
  imageUrl: string;
  usageLog: {
    date: string;
    orderId: string;
    workerId: string;
    quantity: number;
  }[];
}

export interface Station {
  id: string;
  name: string;
  type: 'cutting' | 'sewing' | 'finishing' | 'packaging';
  status: 'idle' | 'active' | 'maintenance';
  currentWorkerId: string | null;
  currentOrderId: string | null;
  efficiency: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'worker' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface SystemSettings {
  language: string;
  timeZone: string;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  deliveryBufferDays: number;
  measurementFields: string[];
  theme: 'light' | 'dark';
  wooCommerceSettings: {
    siteUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };
}