import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  HardDrive,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Settings
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BackupItem {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  description?: string;
}

const BackupManager: React.FC = () => {
  const { isDark } = useTheme();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    retentionDays: 30,
    backupTime: '02:00'
  });

  // Mock data
  useEffect(() => {
    const mockBackups: BackupItem[] = [
      {
        id: '1',
        filename: 'backup_2025-01-20_14-30-00.zip',
        size: 145.6,
        created_at: '2025-01-20T14:30:00Z',
        type: 'manual',
        status: 'completed',
        description: 'نسخة احتياطية يدوية قبل التحديث'
      },
      {
        id: '2',
        filename: 'backup_2025-01-20_02-00-00.zip',
        size: 142.3,
        created_at: '2025-01-20T02:00:00Z',
        type: 'automatic',
        status: 'completed',
        description: 'نسخة احتياطية تلقائية يومية'
      },
      {
        id: '3',
        filename: 'backup_2025-01-19_02-00-00.zip',
        size: 138.9,
        created_at: '2025-01-19T02:00:00Z',
        type: 'automatic',
        status: 'completed',
        description: 'نسخة احتياطية تلقائية يومية'
      }
    ];
    setBackups(mockBackups);
  }, []);

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    
    try {
      // In real implementation, this would call the backup API
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate backup process
      
      const newBackup: BackupItem = {
        id: Date.now().toString(),
        filename: `backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.zip`,
        size: Math.random() * 50 + 100, // Random size between 100-150 MB
        created_at: new Date().toISOString(),
        type: 'manual',
        status: 'completed',
        description: 'نسخة احتياطية يدوية'
      };
      
      setBackups(prev => [newBackup, ...prev]);
      
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = (backup: BackupItem) => {
    // In real implementation, this would download the backup file
    console.log('Downloading backup:', backup.filename);
    
    // Mock download
    const link = document.createElement('a');
    link.href = '#';
    link.download = backup.filename;
    link.click();
  };

  const deleteBackup = (backupId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      setBackups(prev => prev.filter(b => b.id !== backupId));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة النسخ الاحتياطية</h2>
          <p className="text-gray-600 mt-1">إنشاء واستعادة وإدارة النسخ الاحتياطية للنظام</p>
        </div>
        <button
          onClick={createManualBackup}
          disabled={isCreatingBackup}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isCreatingBackup ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{isCreatingBackup ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي النسخ</p>
              <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الحجم الإجمالي</p>
              <p className="text-2xl font-bold text-green-600">
                {formatFileSize(backups.reduce((sum, b) => sum + b.size * 1024 * 1024, 0))}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">آخر نسخة</p>
              <p className="text-lg font-bold text-purple-600">
                {backups.length > 0 ? formatDate(backups[0].created_at).split(' ')[0] : '-'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">النسخ التلقائية</p>
              <p className="text-2xl font-bold text-orange-600">
                {backups.filter(b => b.type === 'automatic').length}
              </p>
            </div>
            <Settings className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">إعدادات النسخ الاحتياطي</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={backupSettings.autoBackup}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                className="rounded"
              />
              <span>تفعيل النسخ التلقائي</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">مدة الاحتفاظ (أيام)</label>
            <input
              type="number"
              value={backupSettings.retentionDays}
              onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="365"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">وقت النسخ التلقائي</label>
            <input
              type="time"
              value={backupSettings.backupTime}
              onChange={(e) => setBackupSettings(prev => ({ ...prev, backupTime: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="mt-4">
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* Backups List */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">النسخ الاحتياطية المتوفرة</h3>
        </div>
        
        <div className="p-6">
          {backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database size={48} className="mx-auto mb-4" />
              <p>لا توجد نسخ احتياطية متوفرة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          backup.status === 'completed' ? 'bg-green-100 text-green-600' :
                          backup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {backup.status === 'completed' && <CheckCircle size={16} />}
                          {backup.status === 'in_progress' && <Clock size={16} />}
                          {backup.status === 'failed' && <AlertCircle size={16} />}
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{backup.filename}</h4>
                          <p className="text-sm text-gray-600">{backup.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{formatFileSize(backup.size * 1024 * 1024)}</span>
                            <span>{formatDate(backup.created_at)}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              backup.type === 'automatic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {backup.type === 'automatic' ? 'تلقائي' : 'يدوي'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadBackup(backup)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                        title="تنزيل"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restore Section */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">استعادة نسخة احتياطية</h3>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".zip"
            className="flex-1 p-2 border rounded-lg"
          />
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Upload size={16} />
            <span>استعادة</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ⚠️ تحذير: عملية الاستعادة ستقوم بالكتابة فوق البيانات الحالية. تأكد من إنشاء نسخة احتياطية قبل المتابعة.
        </p>
      </div>
    </div>
  );
};

export default BackupManager;