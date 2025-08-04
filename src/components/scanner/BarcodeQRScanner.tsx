import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Flashlight, FlashlightOff, ScanLine, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScanResult {
  success: boolean;
  type: 'barcode' | 'qrcode';
  data: any;
  scanned_at: string;
  error?: string;
}

interface BarcodeQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: ScanResult) => void;
  scanType?: 'barcode' | 'qrcode' | 'both';
  purpose?: 'information' | 'update_status' | 'track_production' | 'inventory_check';
}

const BarcodeQRScanner: React.FC<BarcodeQRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  scanType = 'both',
  purpose = 'information'
}) => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && hasPermissions()) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const hasPermissions = async (): Promise<boolean> => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permissions.state === 'granted';
    } catch {
      return true; // Assume permission if we can't check
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera for scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
      }
      
      // Start scanning loop
      startScanningLoop();
      
    } catch (err) {
      console.error('Camera access error:', err);
      setError('لا يمكن الوصول للكاميرا. تأكد من السماح بالوصول للكاميرا.');
      setHasCamera(false);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    setIsScanning(false);
    setHasCamera(false);
  };

  const startScanningLoop = () => {
    if (!videoRef.current || !isScanning) return;
    
    // Create canvas for image capture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const scanFrame = () => {
      if (!isScanning || !video.videoWidth) {
        scanTimeoutRef.current = setTimeout(scanFrame, 100);
        return;
      }
      
      // Draw current frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Try to detect codes using browser APIs (if available)
      // For production, you'd use a library like ZXing or QuaggaJS
      tryDetectCode(canvas.toDataURL('image/jpeg', 0.8));
      
      // Continue scanning
      scanTimeoutRef.current = setTimeout(scanFrame, 200);
    };
    
    // Start scanning after video is ready
    if (video.readyState >= 2) {
      scanFrame();
    } else {
      video.addEventListener('loadeddata', scanFrame, { once: true });
    }
  };

  const tryDetectCode = async (imageData: string) => {
    try {
      // This is a placeholder - in production you'd use:
      // 1. ZXing library for barcode detection
      // 2. QR code detection libraries
      // 3. Browser's native BarcodeDetector API (if supported)
      
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8']
        });
        
        const barcodes = await barcodeDetector.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          processScannedData(barcode.rawValue, barcode.format.includes('qr') ? 'qrcode' : 'barcode');
        }
      }
    } catch (err) {
      console.warn('Barcode detection error:', err);
    }
  };

  const processScannedData = async (scannedData: string, detectedType: 'barcode' | 'qrcode') => {
    // Prevent duplicate scans
    if (scannedData === lastScan) return;
    setLastScan(scannedData);
    
    try {
      const response = await fetch('http://localhost:8000/api/barcode-qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          scanned_data: scannedData,
          scanner_type: detectedType,
          scan_purpose: purpose
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success feedback
        showScanSuccess();
        
        // Call success callback
        onScanSuccess({
          success: true,
          type: detectedType,
          data: result.scan_result.data,
          scanned_at: result.timestamp
        });
        
        // Auto close after successful scan
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'فشل في معالجة الكود المسحوح');
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const showScanSuccess = () => {
    // Visual/audio feedback for successful scan
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Flash effect
    const overlay = document.getElementById('scan-success-overlay');
    if (overlay) {
      overlay.style.opacity = '1';
      setTimeout(() => {
        overlay.style.opacity = '0';
      }, 300);
    }
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn } as any]
        });
        setFlashOn(!flashOn);
      }
    } catch (err) {
      console.warn('Flash control not supported:', err);
    }
  };

  const handleManualInput = () => {
    if (manualInput.trim()) {
      processScannedData(manualInput.trim(), 'barcode');
      setManualInput('');
      setShowManualInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className={`relative w-full h-full max-w-lg ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {scanType === 'barcode' ? 'مسح الباركود' : scanType === 'qrcode' ? 'مسح رمز QR' : 'مسح الكود'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative flex-1 bg-black">
          {hasCamera ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scan frame */}
                <div className="absolute inset-8 border-2 border-white rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
                
                {/* Scan line animation */}
                <div className="absolute inset-8 overflow-hidden rounded-lg">
                  <div className="scan-line"></div>
                </div>
                
                {/* Success overlay */}
                <div 
                  id="scan-success-overlay"
                  className="absolute inset-0 bg-green-500 bg-opacity-30 transition-opacity duration-300 opacity-0"
                ></div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>جاري تشغيل الكاميرا...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-center space-x-4 space-x-reverse mb-4">
            {/* Flash toggle */}
            <button
              onClick={toggleFlash}
              className={`p-3 rounded-full ${flashOn ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} hover:bg-opacity-80 transition-colors`}
            >
              {flashOn ? <Flashlight className="h-6 w-6" /> : <FlashlightOff className="h-6 w-6" />}
            </button>

            {/* Manual input toggle */}
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إدخال يدوي
            </button>

            {/* Restart camera */}
            <button
              onClick={() => { stopCamera(); startCamera(); }}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-opacity-80 transition-colors"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </div>

          {/* Manual input */}
          {showManualInput && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="أدخل الكود يدوياً"
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              />
              <button
                onClick={handleManualInput}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Instructions */}
          <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {scanType === 'barcode' 
              ? 'وجه الكاميرا نحو الباركود' 
              : scanType === 'qrcode' 
              ? 'وجه الكاميرا نحو رمز QR' 
              : 'وجه الكاميرا نحو الكود المراد مسحه'
            }
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        
        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BarcodeQRScanner;