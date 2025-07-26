import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Bot, 
  BarChart3, 
  Camera, 
  QrCode,
  Smartphone,
  Wifi,
  Cloud,
  Shield,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Download,
  Upload,
  Database,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react';
import { orderService, workerService, taskService } from '../api/laravel';

interface SystemStatus {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  uptime: string;
}

interface AIFeatures {
  autoAssignment: boolean;
  predictiveAnalytics: boolean;
  qualityControl: boolean;
  demandForecasting: boolean;
}

interface IoTDevices {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'printer' | 'scanner';
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
}

const AdvancedFeatures: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu: 45,
    memory: 62,
    storage: 78,
    network: 95,
    uptime: '15 days, 8 hours'
  });
  const [aiFeatures, setAiFeatures] = useState<AIFeatures>({
    autoAssignment: true,
    predictiveAnalytics: true,
    qualityControl: false,
    demandForecasting: true
  });
  const [iotDevices, setIotDevices] = useState<IoTDevices[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'iot' | 'system' | 'automation'>('ai');

  useEffect(() => {
    loadAdvancedFeaturesData();
    // Simulate real-time updates
    const interval = setInterval(updateSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAdvancedFeaturesData = async () => {
    try {
      setLoading(true);
      
      // Load IoT devices data
      const mockIoTDevices: IoTDevices[] = [
        {
          id: '1',
          name: 'Production Camera 1',
          type: 'camera',
          status: 'online',
          lastSeen: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Quality Sensor A',
          type: 'sensor',
          status: 'online',
          lastSeen: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Label Printer',
          type: 'printer',
          status: 'maintenance',
          lastSeen: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '4',
          name: 'Barcode Scanner',
          type: 'scanner',
          status: 'offline',
          lastSeen: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      setIotDevices(mockIoTDevices);
    } catch (error) {
      console.error('Error loading advanced features data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSystemStatus = () => {
    setSystemStatus(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 30) + 30,
      memory: Math.floor(Math.random() * 20) + 50,
      network: Math.floor(Math.random() * 10) + 90
    }));
  };

  const toggleAIFeature = (feature: keyof AIFeatures) => {
    setAiFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return Camera;
      case 'sensor':
        return BarChart3;
      case 'printer':
        return QrCode;
      case 'scanner':
        return QrCode;
      default:
        return Settings;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الميزات المتقدمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">الميزات المتقدمة</h1>
          </div>
          <p className="text-gray-600">تقنيات الذكاء الاصطناعي وإنترنت الأشياء والأتمتة</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'ai', name: 'الذكاء الاصطناعي', icon: Brain },
              { id: 'iot', name: 'إنترنت الأشياء', icon: Wifi },
              { id: 'system', name: 'حالة النظام', icon: Cpu },
              { id: 'automation', name: 'الأتمتة', icon: Bot }
            ] as const).map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* AI Features */}
          {activeTab === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ميزات الذكاء الاصطناعي</h3>
                <div className="space-y-4">
                  {Object.entries(aiFeatures).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {feature === 'autoAssignment' ? 'التعيين التلقائي' :
                             feature === 'predictiveAnalytics' ? 'التحليلات التنبؤية' :
                             feature === 'qualityControl' ? 'مراقبة الجودة' : 'توقع الطلب'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {feature === 'autoAssignment' ? 'تعيين المهام تلقائياً للعمال' :
                             feature === 'predictiveAnalytics' ? 'تحليل البيانات للتنبؤ بالأداء' :
                             feature === 'qualityControl' ? 'مراقبة جودة المنتجات' : 'توقع الطلب المستقبلي'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleAIFeature(feature as keyof AIFeatures)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الذكاء الاصطناعي</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">دقة التعيين التلقائي</span>
                      <span className="text-sm font-bold text-purple-900">94%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">دقة التنبؤ</span>
                      <span className="text-sm font-bold text-blue-900">87%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">تحسين الإنتاجية</span>
                      <span className="text-sm font-bold text-green-900">+23%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* IoT Devices */}
          {activeTab === 'iot' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">أجهزة إنترنت الأشياء</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    إضافة جهاز
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {iotDevices.map(device => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <div key={device.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <DeviceIcon className="h-6 w-6 text-gray-600" />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
                            {device.status === 'online' ? 'متصل' : 
                             device.status === 'offline' ? 'غير متصل' : 'صيانة'}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{device.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {device.type === 'camera' ? 'كاميرا' :
                           device.type === 'sensor' ? 'مستشعر' :
                           device.type === 'printer' ? 'طابعة' : 'ماسح ضوئي'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>آخر ظهور:</span>
                          <span>{new Date(device.lastSeen).toLocaleTimeString('ar-SA')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الأجهزة</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">الأجهزة المتصلة</span>
                      <span className="text-sm font-medium text-green-600">
                        {iotDevices.filter(d => d.status === 'online').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">الأجهزة غير المتصلة</span>
                      <span className="text-sm font-medium text-red-600">
                        {iotDevices.filter(d => d.status === 'offline').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">الأجهزة في الصيانة</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {iotDevices.filter(d => d.status === 'maintenance').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">مراقبة البيانات</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-900">البيانات المرسلة اليوم</span>
                        <span className="text-sm font-medium text-blue-900">2.4 GB</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-900">معدل الاستجابة</span>
                        <span className="text-sm font-medium text-green-900">99.8%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-900">متوسط الاستجابة</span>
                        <span className="text-sm font-medium text-purple-900">45ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Status */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة النظام</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cpu className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-700">استخدام المعالج</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemStatus.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${systemStatus.cpu}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MemoryStick className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-700">استخدام الذاكرة</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemStatus.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${systemStatus.memory}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-700">استخدام التخزين</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemStatus.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${systemStatus.storage}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-gray-700">سرعة الشبكة</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemStatus.network}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${systemStatus.network}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">وقت التشغيل</span>
                      <span className="text-sm font-medium text-gray-900">{systemStatus.uptime}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">إصدار النظام</span>
                      <span className="text-sm font-medium text-gray-900">v2.1.4</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">آخر تحديث</span>
                      <span className="text-sm font-medium text-gray-900">منذ 3 أيام</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">حالة الأمان</span>
                      <span className="text-sm font-medium text-green-600">محمي</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Automation */}
          {activeTab === 'automation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">سير العمل الأوتوماتيكي</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900">معالجة الطلبات</h4>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-blue-200 rounded transition-colors">
                            <Play className="h-4 w-4 text-blue-600" />
                          </button>
                          <button className="p-1 hover:bg-blue-200 rounded transition-colors">
                            <Pause className="h-4 w-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700">معالجة تلقائية للطلبات الجديدة</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-900">إدارة المخزون</h4>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-green-200 rounded transition-colors">
                            <Play className="h-4 w-4 text-green-600" />
                          </button>
                          <button className="p-1 hover:bg-green-200 rounded transition-colors">
                            <Pause className="h-4 w-4 text-green-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-green-700">مراقبة تلقائية للمخزون وإعادة الطلب</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-900">التقارير</h4>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-purple-200 rounded transition-colors">
                            <Play className="h-4 w-4 text-purple-600" />
                          </button>
                          <button className="p-1 hover:bg-purple-200 rounded transition-colors">
                            <Pause className="h-4 w-4 text-purple-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-purple-700">إنشاء تقارير تلقائية يومية</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الأتمتة</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">المهام المكتملة اليوم</span>
                        <span className="text-sm font-medium text-gray-900">156</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">الوقت المحفوظ</span>
                        <span className="text-sm font-medium text-gray-900">4.2 ساعة</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">معدل النجاح</span>
                        <span className="text-sm font-medium text-green-600">98.5%</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">الأخطاء</span>
                        <span className="text-sm font-medium text-red-600">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">سجل الأتمتة</h3>
                <div className="space-y-3">
                  {[
                    { time: '10:30', action: 'تم معالجة طلب جديد #1234', status: 'success' },
                    { time: '10:25', action: 'تم إرسال تنبيه مخزون منخفض', status: 'warning' },
                    { time: '10:20', action: 'تم إنشاء تقرير الإنتاج اليومي', status: 'success' },
                    { time: '10:15', action: 'فشل في معالجة طلب #1233', status: 'error' },
                    { time: '10:10', action: 'تم تعيين مهمة تلقائياً للعامل أحمد', status: 'success' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{log.time}</span>
                        <span className="text-sm text-gray-700">{log.action}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'success' ? 'نجح' : 
                         log.status === 'warning' ? 'تحذير' : 'خطأ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;