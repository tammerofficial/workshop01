import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  QrCode, 
  CheckCircle, 
  Clock, 
  User, 
  Package,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import BarcodeQRScanner from '../scanner/BarcodeQRScanner';

interface ProductionScannerProps {
  workerId?: number;
  onStatusUpdate?: (update: any) => void;
}

interface ScanResult {
  success: boolean;
  type: 'barcode' | 'qrcode';
  data: any;
  scanned_at: string;
  error?: string;
}

interface ProductionStageUpdate {
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  worker_id?: number;
  actual_hours?: number;
  quality_score?: number;
  notes?: string;
}

const ProductionScanner: React.FC<ProductionScannerProps> = ({
  workerId,
  onStatusUpdate
}) => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  
  const [showScanner, setShowScanner] = useState(false);
  const [currentScan, setCurrentScan] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState<ProductionStageUpdate>({
    status: 'in_progress',
    worker_id: workerId,
    actual_hours: 0,
    quality_score: 8,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/barcode-qr/scan-history?limit=5');
      const result = await response.json();
      
      if (result.success) {
        setRecentScans(result.scans);
      }
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  const handleScanSuccess = (result: ScanResult) => {
    console.log('Production scan result:', result);
    
    setCurrentScan({
      ...result,
      id: Date.now(),
      scanned_at: new Date().toISOString()
    });
    
    // If it's a production stage QR code, show update modal
    if (result.data?.type === 'production_stage') {
      setUpdateForm(prev => ({
        ...prev,
        worker_id: workerId || prev.worker_id
      }));
      setShowUpdateModal(true);
    }
    
    // Add to recent scans
    setRecentScans(prev => [
      {
        id: Date.now(),
        type: result.type,
        data: result.data,
        scanned_at: result.scanned_at,
        success: result.success
      },
      ...prev.slice(0, 4)
    ]);
  };

  const updateProductionStatus = async () => {
    if (!currentScan?.data) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8000/api/barcode-qr/scan/update-production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scanned_data: JSON.stringify(currentScan.data),
          ...updateForm
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Notify parent component
        if (onStatusUpdate) {
          onStatusUpdate({
            type: 'production_update',
            scan: currentScan,
            update: updateForm,
            result: result.result
          });
        }
        
        // Close modal and reset
        setShowUpdateModal(false);
        setCurrentScan(null);
        setUpdateForm({
          status: 'in_progress',
          worker_id: workerId,
          actual_hours: 0,
          quality_score: 8,
          notes: ''
        });
        
        // Show success message
        alert('تم تحديث حالة الإنتاج بنجاح!');
        
      } else {
        alert(`خطأ: ${result.message}`);
      }
      
    } catch (error) {
      console.error('Error updating production:', error);
      alert('خطأ في تحديث حالة الإنتاج');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'paused': return 'متوقف';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                مسح مراحل الإنتاج
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                امسح QR Code لتحديث حالة مرحلة الإنتاج
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Scan className="h-4 w-4 mr-2" />
            بدء المسح
          </button>
        </div>

        {/* Worker Info */}
        {workerId && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <User className="h-5 w-5 text-gray-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                العامل: #{workerId}
              </span>
            </div>
          </div>
        )}

        {/* Current Scan Info */}
        {currentScan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-l-4 ${
              currentScan.success 
                ? 'border-green-500 bg-green-50 dark:bg-green-900' 
                : 'border-red-500 bg-red-50 dark:bg-red-900'
            } mb-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                {currentScan.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    آخر مسح: {currentScan.type === 'barcode' ? 'باركود' : 'QR Code'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(currentScan.scanned_at).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
              
              {currentScan.data?.type === 'production_stage' && (
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  تحديث الحالة
                </button>
              )}
            </div>
            
            {currentScan.data && (
              <div className="mt-3 text-sm">
                <pre className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                  {JSON.stringify(currentScan.data, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}

        {/* Recent Scans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              المسح الأخير
            </h4>
            <button
              onClick={loadRecentScans}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          {recentScans.length > 0 ? (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {scan.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {scan.type === 'barcode' ? 'باركود' : 'QR Code'}
                      </span>
                      {scan.data?.type && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          scan.data.type === 'production_stage' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : scan.data.type === 'product'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {scan.data.type}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(scan.scanned_at).toLocaleTimeString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scan className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                لا توجد عمليات مسح بعد
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      <BarcodeQRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        scanType="qrcode"
        purpose="track_production"
      />

      {/* Update Production Status Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}
            >
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    تحديث حالة الإنتاج
                  </h3>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    الحالة
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="pending">في الانتظار</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="paused">متوقف</option>
                  </select>
                </div>

                {/* Actual Hours */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    الساعات الفعلية
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={updateForm.actual_hours}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, actual_hours: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>

                {/* Quality Score */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    تقييم الجودة (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={updateForm.quality_score}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, quality_score: parseInt(e.target.value) || 8 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    ملاحظات
                  </label>
                  <textarea
                    rows={3}
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="أدخل أي ملاحظات إضافية..."
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>
              
              <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3 space-x-reverse`}>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                >
                  إلغاء
                </button>
                <button
                  onClick={updateProductionStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحديث...
                    </div>
                  ) : (
                    'تحديث الحالة'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionScanner;