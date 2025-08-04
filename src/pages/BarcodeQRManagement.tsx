import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Scan, 
  Download, 
  Package, 
  ShoppingCart, 
  Boxes, 
  Settings,
  FileImage,
  FileText,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import BarcodeQRScanner from '../components/scanner/BarcodeQRScanner';

interface GeneratedCode {
  id: string;
  type: 'barcode' | 'qrcode';
  entity_type: string;
  entity_id: number;
  entity_name: string;
  url: string;
  data: string;
  generated_at: string;
  format: 'png' | 'svg';
}

interface ScanResult {
  success: boolean;
  type: 'barcode' | 'qrcode';
  data: any;
  scanned_at: string;
  error?: string;
}

const BarcodeQRManagement: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'history' | 'analytics'>('generate');
  const [showScanner, setShowScanner] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [batchGenerationData, setBatchGenerationData] = useState({
    type: 'products',
    format: 'png',
    ids: [] as number[]
  });

  const [statistics, setStatistics] = useState({
    total_generated: 0,
    total_scans: 0,
    success_rate: 0,
    most_scanned: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load scan statistics
      const statsResponse = await fetch('http://localhost:8000/api/barcode-qr/scan-statistics');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStatistics(statsData.statistics);
      }
      
      // Load scan history
      const historyResponse = await fetch('http://localhost:8000/api/barcode-qr/scan-history');
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        setScanHistory(historyData.scans);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSingleCode = async (type: 'barcode' | 'qrcode', entityType: string, entityId: number, format: 'png' | 'svg' = 'png') => {
    try {
      setLoading(true);
      
      let endpoint = '';
      if (type === 'barcode' && entityType === 'products') {
        endpoint = `products/${entityId}/barcode`;
      } else if (type === 'qrcode') {
        switch (entityType) {
          case 'orders':
            endpoint = `orders/${entityId}/qrcode`;
            break;
          case 'materials':
            endpoint = `materials/${entityId}/qrcode`;
            break;
          case 'production':
            endpoint = `production/${entityId}/qrcode`;
            break;
        }
      }
      
      const response = await fetch(`http://localhost:8000/api/barcode-qr/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const codeData = result.barcode || result.qrcode;
        const newCode: GeneratedCode = {
          id: `${entityType}_${entityId}_${Date.now()}`,
          type,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: `${entityType} #${entityId}`,
          url: codeData.url,
          data: codeData.data,
          generated_at: codeData.generated_at,
          format: codeData.format
        };
        
        setGeneratedCodes(prev => [newCode, ...prev]);
        return result;
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateBatchCodes = async () => {
    if (batchGenerationData.ids.length === 0) {
      alert('يرجى اختيار عناصر للتوليد');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8000/api/barcode-qr/generate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batchGenerationData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Process batch results
        const newCodes = result.results.map((item: any, index: number) => ({
          id: `batch_${Date.now()}_${index}`,
          type: batchGenerationData.type === 'products' ? 'barcode' : 'qrcode',
          entity_type: batchGenerationData.type,
          entity_id: batchGenerationData.ids[index],
          entity_name: `${batchGenerationData.type} #${batchGenerationData.ids[index]}`,
          url: item.url,
          data: item.data,
          generated_at: item.generated_at,
          format: item.format
        }));
        
        setGeneratedCodes(prev => [...newCodes, ...prev]);
        alert(`تم توليد ${result.generated_count} كود بنجاح`);
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Batch generation error:', error);
      alert('خطأ في التوليد المجمع');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (result: ScanResult) => {
    console.log('Scan successful:', result);
    
    // Add to scan history
    setScanHistory(prev => [{
      id: Date.now(),
      type: result.type,
      data: result.data,
      scanned_at: result.scanned_at,
      success: result.success
    }, ...prev]);
    
    // Show result
    alert(`تم مسح ${result.type === 'barcode' ? 'الباركود' : 'رمز QR'} بنجاح!\nالبيانات: ${JSON.stringify(result.data, null, 2)}`);
  };

  const downloadCode = (code: GeneratedCode) => {
    const link = document.createElement('a');
    link.href = code.url;
    link.download = `${code.entity_type}_${code.entity_id}_${code.type}.${code.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'generate', label: t('barcodeQR.generateCodes'), icon: QrCode },
    { id: 'scan', label: t('barcodeQR.scanCodes'), icon: Scan },
    { id: 'history', label: t('barcodeQR.history'), icon: FileText },
    { id: 'analytics', label: t('barcodeQR.statistics'), icon: BarChart3 }
  ];

  return (
    <div className="space-y-6 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`bg-white ${isDark ? 'dark:bg-gray-800' : ''} rounded-lg shadow-md p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <QrCode className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('barcodeQR.title')}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('barcodeQR.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('barcodeQR.update')}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('barcodeQR.generatedCodes')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics.total_generated}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <Scan className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('barcodeQR.totalScans')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics.total_scans}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('barcodeQR.successRate')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics.success_rate}%
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('barcodeQR.mostScanned')}</p>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statistics.most_scanned?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-6">
                              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('barcodeQR.generateCodes')}
                </h3>

              {/* Quick Generation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => generateSingleCode('barcode', 'products', 1)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
                >
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">{t('barcodeQR.productBarcode')}</p>
                </button>

                <button
                  onClick={() => generateSingleCode('qrcode', 'orders', 1)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
                >
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">{t('barcodeQR.orderQR')}</p>
                </button>

                <button
                  onClick={() => generateSingleCode('qrcode', 'materials', 1)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
                >
                  <Boxes className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">{t('barcodeQR.materialQR')}</p>
                </button>

                <button
                  onClick={generateBatchCodes}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
                >
                  <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">{t('barcodeQR.batchGenerate')}</p>
                </button>
              </div>

              {/* Generated Codes List */}
              {generatedCodes.length > 0 && (
                <div>
                  <h4 className={`text-md font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('barcodeQR.generatedCodes')} ({generatedCodes.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedCodes.map((code) => (
                      <div
                        key={code.id}
                        className={`p-4 border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'} rounded-lg`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {code.entity_name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            code.type === 'barcode' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {code.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center mb-3 bg-white p-4 rounded">
                          <img 
                            src={code.url} 
                            alt={`${code.type} for ${code.entity_name}`}
                            className="max-w-full h-20 object-contain"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(code.generated_at).toLocaleDateString('ar-EG')}
                          </span>
                          <button
                            onClick={() => downloadCode(code)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scan Tab */}
          {activeTab === 'scan' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('barcodeQR.scanCodes')}
                </h3>
                <button
                  onClick={() => setShowScanner(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  بدء المسح
                </button>
                <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  استخدم الكاميرا لمسح الباركود أو رمز QR
                </p>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                سجل المسح
              </h3>
              
              {scanHistory.length > 0 ? (
                <div className="space-y-3">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={scan.id || index}
                      className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          {scan.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {scan.type === 'barcode' ? 'باركود' : 'QR Code'}
                          </span>
                        </div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(scan.scanned_at).toLocaleString('ar-EG')}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {JSON.stringify(scan.data, null, 2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scan className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    لا توجد عمليات مسح بعد
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                إحصائيات الاستخدام
              </h3>
              
              <div className="text-center py-8">
                <BarChart3 className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  الإحصائيات التفصيلية قريباً
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      <BarcodeQRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        scanType="both"
        purpose="information"
      />
    </div>
  );
};

export default BarcodeQRManagement;