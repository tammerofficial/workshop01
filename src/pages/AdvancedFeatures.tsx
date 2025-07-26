import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Bot, 
  BarChart3, 
  Camera, 
  Wifi,
  Settings,
  Play,
  Pause,
  Eye,
  Cpu,
  MemoryStick,
  HardDrive,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

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
  const { t } = useContext(LanguageContext)!;
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
          status: 'offline',
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        },
        {
          id: '4',
          name: 'QR Code Scanner',
          type: 'scanner',
          status: 'maintenance',
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ];
      
      setIotDevices(mockIoTDevices);

    } catch (error) {
      console.error("Error loading advanced features data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSystemStatus = () => {
    setSystemStatus(prev => ({
      ...prev,
      cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() - 0.5) * 5)),
      memory: Math.min(100, Math.max(20, prev.memory + (Math.random() - 0.5) * 5)),
      network: Math.min(100, Math.max(80, prev.network + (Math.random() - 0.5) * 2)),
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AIFeaturesTab />;
      case 'iot':
        return <IoTDevicesTab />;
      case 'system':
        return <SystemStatusTab />;
      case 'automation':
        return <AutomationTab />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: string, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  const AIFeaturesTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{t('advanced.features.ai.title')}</h3>
      <p className="text-gray-600">{t('advanced.features.ai.description')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title={t('advanced.features.ai.autoAssignment')}
          description={t('advanced.features.ai.autoAssignment.description')}
          enabled={aiFeatures.autoAssignment}
          onToggle={() => setAiFeatures(prev => ({ ...prev, autoAssignment: !prev.autoAssignment }))}
          icon={<Bot className="w-6 h-6 text-blue-500" />}
        />
        <FeatureCard
          title={t('advanced.features.ai.predictiveAnalytics')}
          description={t('advanced.features.ai.predictiveAnalytics.description')}
          enabled={aiFeatures.predictiveAnalytics}
          onToggle={() => setAiFeatures(prev => ({ ...prev, predictiveAnalytics: !prev.predictiveAnalytics }))}
          icon={<BarChart3 className="w-6 h-6 text-green-500" />}
        />
        <FeatureCard
          title={t('advanced.features.ai.qualityControl')}
          description={t('advanced.features.ai.qualityControl.description')}
          enabled={aiFeatures.qualityControl}
          onToggle={() => setAiFeatures(prev => ({ ...prev, qualityControl: !prev.qualityControl }))}
          icon={<Camera className="w-6 h-6 text-purple-500" />}
        />
        <FeatureCard
          title={t('advanced.features.ai.demandForecasting')}
          description={t('advanced.features.ai.demandForecasting.description')}
          enabled={aiFeatures.demandForecasting}
          onToggle={() => setAiFeatures(prev => ({ ...prev, demandForecasting: !prev.demandForecasting }))}
          icon={<Brain className="w-6 h-6 text-orange-500" />}
        />
      </div>
    </motion.div>
  );

  const IoTDevicesTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{t('advanced.features.iot.title')}</h3>
      <p className="text-gray-600">{t('advanced.features.iot.description')}</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.iot.deviceName')}</th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.iot.type')}</th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.iot.status')}</th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.iot.lastSeen')}</th>
            </tr>
          </thead>
          <tbody>
            {iotDevices.map(device => (
              <tr key={device.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b text-sm text-gray-800">{device.name}</td>
                <td className="py-3 px-4 border-b text-sm text-gray-800 capitalize">{t(`advanced.features.iot.type.${device.type}`)}</td>
                <td className="py-3 px-4 border-b text-sm">
                  <StatusBadge status={device.status} />
                </td>
                <td className="py-3 px-4 border-b text-sm text-gray-600">{new Date(device.lastSeen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const SystemStatusTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{t('advanced.features.system.title')}</h3>
      <p className="text-gray-600">{t('advanced.features.system.description')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusMetric title={t('advanced.features.system.cpu')} value={`${systemStatus.cpu}%`} icon={<Cpu className="w-8 h-8 text-blue-500" />} />
        <StatusMetric title={t('advanced.features.system.memory')} value={`${systemStatus.memory}%`} icon={<MemoryStick className="w-8 h-8 text-green-500" />} />
        <StatusMetric title={t('advanced.features.system.storage')} value={`${systemStatus.storage}%`} icon={<HardDrive className="w-8 h-8 text-red-500" />} />
        <StatusMetric title={t('advanced.features.system.network')} value={`${systemStatus.network}%`} icon={<Wifi className="w-8 h-8 text-purple-500" />} />
      </div>
      <div className="text-center text-gray-600 mt-6">
        <p>{t('advanced.features.system.uptime')}: <span className="font-semibold">{systemStatus.uptime}</span></p>
      </div>
    </motion.div>
  );

  const AutomationTab = () => {
    const workflows = [
      {
        name: t('advanced.features.automation.workflows.backup.name'),
        description: t('advanced.features.automation.workflows.backup.description'),
        trigger: t('advanced.features.automation.workflows.backup.trigger'),
        lastRun: '2023-10-27 02:00:15',
        status: 'success'
      },
      {
        name: t('advanced.features.automation.workflows.inventory.name'),
        description: t('advanced.features.automation.workflows.inventory.description'),
        trigger: t('advanced.features.automation.workflows.inventory.trigger'),
        lastRun: '2023-10-27 14:35:02',
        status: 'running'
      },
      {
        name: t('advanced.features.automation.workflows.completion.name'),
        description: t('advanced.features.automation.workflows.completion.description'),
        trigger: t('advanced.features.automation.workflows.completion.trigger'),
        lastRun: '2023-10-26 18:00:00',
        status: 'paused'
      }
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">{t('advanced.features.automation.title')}</h3>
        <p className="text-gray-600">{t('advanced.features.automation.description')}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.automation.workflowName')}</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.automation.trigger')}</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.automation.lastRun')}</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.automation.status')}</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">{t('advanced.features.automation.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((flow, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    <p className="font-semibold text-gray-800">{flow.name}</p>
                    <p className="text-xs text-gray-500">{flow.description}</p>
                  </td>
                  <td className="py-3 px-4 border-b text-sm text-gray-600">{flow.trigger}</td>
                  <td className="py-3 px-4 border-b text-sm text-gray-600">{flow.lastRun}</td>
                  <td className="py-3 px-4 border-b text-sm">
                    <AutomationStatusBadge status={flow.status} />
                  </td>
                  <td className="py-3 px-4 border-b text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800"><Play size={16} /></button>
                      <button className="p-1 text-yellow-600 hover:text-yellow-800"><Pause size={16} /></button>
                      <button className="p-1 text-gray-600 hover:text-gray-800"><Eye size={16} /></button>
                      <button className="p-1 text-gray-600 hover:text-gray-800"><Settings size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-blue-600" />
            {t('advanced.title')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">{t('advanced.subtitle')}</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex space-x-2 border-b mb-6 pb-2">
            <TabButton tab="ai" label={t('advanced.tabs.ai')} icon={<Brain size={16} />} />
            <TabButton tab="iot" label={t('advanced.tabs.iot')} icon={<Wifi size={16} />} />
            <TabButton tab="system" label={t('advanced.tabs.system')} icon={<Cpu size={16} />} />
            <TabButton tab="automation" label={t('advanced.tabs.automation')} icon={<Bot size={16} />} />
          </div>
          
          <div>
            {renderContent()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ title, description, enabled, onToggle, icon }: { title: string, description: string, enabled: boolean, onToggle: () => void, icon: React.ReactNode }) => {
  const { t } = useContext(LanguageContext)!;
  return (
    <div className="bg-gray-50 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center mb-3">
          {icon}
          <h4 className="font-semibold text-lg ml-3 text-gray-800">{title}</h4>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-sm font-medium ${enabled ? 'text-green-600' : 'text-red-600'}`}>
          {enabled ? t('common.enabled') : t('common.disabled')}
        </span>
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: IoTDevices['status'] }) => {
  const { t } = useContext(LanguageContext)!;
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-block";
  const statusMap = {
    online: { text: t('advanced.features.iot.status.online'), classes: 'bg-green-100 text-green-800' },
    offline: { text: t('advanced.features.iot.status.offline'), classes: 'bg-red-100 text-red-800' },
    maintenance: { text: t('advanced.features.iot.status.maintenance'), classes: 'bg-yellow-100 text-yellow-800' }
  };
  const { text, classes } = statusMap[status];
  return <span className={`${baseClasses} ${classes}`}>{text}</span>;
};

const AutomationStatusBadge = ({ status }: { status: string }) => {
  const { t } = useContext(LanguageContext)!;
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center";
  const statusMap: { [key: string]: { text: string, classes: string, icon: React.ReactNode } } = {
    success: { text: t('advanced.features.automation.status.success'), classes: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    running: { text: t('advanced.features.automation.status.running'), classes: 'bg-blue-100 text-blue-800', icon: <PlayCircle className="w-3 h-3 mr-1 animate-pulse" /> },
    paused: { text: t('advanced.features.automation.status.paused'), classes: 'bg-yellow-100 text-yellow-800', icon: <PauseCircle className="w-3 h-3 mr-1" /> },
    failed: { text: t('advanced.features.automation.status.failed'), classes: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> }
  };
  const { text, classes, icon } = statusMap[status] || statusMap.failed;
  return <span className={`${baseClasses} ${classes}`}>{icon}{text}</span>;
};

const StatusMetric = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-center shadow-sm">
    <div className="mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default AdvancedFeatures;