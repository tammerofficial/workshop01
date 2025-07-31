import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Clock, Calendar, Plus, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { payrollService, biometricService } from '../api/laravel';
import { toast } from 'react-hot-toast';

interface Payroll {
  id: number;
  payroll_number: string;
  worker: {
    name: string;
    role: string;
  };
  payroll_date: string;
  working_hours: number;
  hourly_rate: number;
  base_salary: number;
  overtime_hours: number;
  overtime_pay: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  status: string;
}

const Payroll: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayroll: 0,
    averageSalary: 0,
    totalWorkers: 0,
    totalHours: 0
  });

  const [workers, setWorkers] = useState<any[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAllGenerateModal, setShowAllGenerateModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [generateForm, setGenerateForm] = useState({
    worker_id: '',
    payroll_date: new Date().toISOString().split('T')[0],
    hourly_rate: 5.00,
    overtime_rate: 7.50,
    bonus: 0,
    deductions: 0,
    notes: ''
  });
  const [allGenerateForm, setAllGenerateForm] = useState({
    payroll_date: new Date().toISOString().split('T')[0],
    hourly_rate: 5.00,
    overtime_rate: 7.50,
    bonus_percentage: 0,
    deductions_percentage: 0
  });

  useEffect(() => {
    loadPayrollData();
    loadWorkers();
  }, []);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const [payrollsResponse, statsResponse] = await Promise.all([
        payrollService.getAll(),
        payrollService.getStats()
      ]);

      if (payrollsResponse.data?.success) {
        setPayrolls(payrollsResponse.data.data || []);
      }

      if (statsResponse.data?.success) {
        const statsData = statsResponse.data.data;
        setStats({
          totalPayroll: statsData.total_payroll || 0,
          averageSalary: statsData.average_salary || 0,
          totalWorkers: statsData.total_workers || 0,
          totalHours: statsData.total_hours || 0
        });
      }
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error('فشل في تحميل بيانات الرواتب');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await payrollService.getWorkers();
      if (response.data?.success) {
        setWorkers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error('فشل في تحميل قائمة العمال');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const response = await payrollService.generatePayroll(generateForm);
      if (response.data?.success) {
        toast.success('تم إنشاء الراتب بنجاح');
        setShowGenerateModal(false);
        setGenerateForm({
          worker_id: '',
          payroll_date: new Date().toISOString().split('T')[0],
          hourly_rate: 5.00,
          overtime_rate: 7.50,
          bonus: 0,
          deductions: 0,
          notes: ''
        });
        loadPayrollData();
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast.error('فشل في إنشاء الراتب');
    }
  };

  const handleGenerateAllPayrolls = async () => {
    try {
      const response = await payrollService.generateAllPayrolls(allGenerateForm);
      if (response.data?.success) {
        toast.success(`تم إنشاء ${response.data.data.generated_count} راتب بنجاح`);
        setShowAllGenerateModal(false);
        loadPayrollData();
      }
    } catch (error) {
      console.error('Error generating all payrolls:', error);
      toast.error('فشل في إنشاء الرواتب');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await payrollService.updateStatus(id, { status });
      if (response.data?.success) {
        toast.success('تم تحديث حالة الراتب بنجاح');
        loadPayrollData();
      }
    } catch (error) {
      console.error('Error updating payroll status:', error);
      toast.error('فشل في تحديث حالة الراتب');
    }
  };

  const handleDeletePayroll = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الراتب؟')) return;
    
    try {
      const response = await payrollService.delete(id);
      if (response.data?.success) {
        toast.success('تم حذف الراتب بنجاح');
        loadPayrollData();
      }
    } catch (error) {
      console.error('Error deleting payroll:', error);
      toast.error('فشل في حذف الراتب');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('payroll.title')} 💰
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('payroll.description')}
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t('payroll.createPayroll')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAllGenerateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
          >
            <TrendingUp size={20} />
            <span>{t('payroll.createAllPayrolls')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadPayrollData}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
          >
            <RefreshCw size={20} />
            <span>{t('common.refresh')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('payroll.totalPayroll')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalPayroll}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('payroll.averageSalary')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.averageSalary}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('payroll.totalWorkers')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalWorkers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('payroll.totalHours')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours}h</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payroll Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('payroll.records')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.payrollNumber')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.worker')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.hours')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.baseSalary')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.overtime')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.bonus')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('payroll.netSalary')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('common.status')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('common.date')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {payrolls.map((payroll) => (
                <tr key={payroll.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {payroll.payroll_number}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <div>
                      <div className="font-medium">{payroll.worker.name}</div>
                      <div className="text-xs">
                  {typeof payroll.worker.role === 'string' 
                    ? payroll.worker.role 
                    : payroll.worker.role?.position_name || 'Unknown'
                  }
                </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {payroll.working_hours}h
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${payroll.base_salary}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    ${payroll.overtime_pay}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    ${payroll.bonus}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${payroll.net_salary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payroll.status)}`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {payroll.payroll_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(payroll.id, 'paid')}
                        disabled={payroll.status === 'paid'}
                        className={`p-1 rounded ${payroll.status === 'paid' ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                        title="Mark as Paid"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(payroll.id, 'pending')}
                        disabled={payroll.status === 'pending'}
                        className={`p-1 rounded ${payroll.status === 'pending' ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                        title="Mark as Pending"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePayroll(payroll.id)}
                        className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-lg max-w-md w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('payroll.createNew')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('payroll.worker')}
                </label>
                <select
                  value={generateForm.worker_id}
                  onChange={(e) => setGenerateForm({...generateForm, worker_id: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">{t('payroll.selectWorker')}</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('payroll.payrollDate')}
                </label>
                <input
                  type="date"
                  value={generateForm.payroll_date}
                  onChange={(e) => setGenerateForm({...generateForm, payroll_date: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('Hourly Rate')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.hourly_rate}
                    onChange={(e) => setGenerateForm({...generateForm, hourly_rate: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('Overtime Rate')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.overtime_rate}
                    onChange={(e) => setGenerateForm({...generateForm, overtime_rate: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('payroll.bonus')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.bonus}
                    onChange={(e) => setGenerateForm({...generateForm, bonus: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('payroll.deductions')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.deductions}
                    onChange={(e) => setGenerateForm({...generateForm, deductions: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('notes')}
                </label>
                <textarea
                  value={generateForm.notes}
                  onChange={(e) => setGenerateForm({...generateForm, notes: e.target.value})}
                  rows={3}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleGeneratePayroll}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {t('payroll.createPayroll')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate All Payrolls Modal */}
      {showAllGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-lg max-w-md w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('payroll.createAllPayrolls')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('payroll.payrollDate')}
                </label>
                <input
                  type="date"
                  value={allGenerateForm.payroll_date}
                  onChange={(e) => setAllGenerateForm({...allGenerateForm, payroll_date: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('Hourly Rate')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={allGenerateForm.hourly_rate}
                    onChange={(e) => setAllGenerateForm({...allGenerateForm, hourly_rate: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('Overtime Rate')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={allGenerateForm.overtime_rate}
                    onChange={(e) => setAllGenerateForm({...allGenerateForm, overtime_rate: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('Bonus Percentage')} (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={allGenerateForm.bonus_percentage}
                    onChange={(e) => setAllGenerateForm({...allGenerateForm, bonus_percentage: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('payroll.deductionsPercentage')} (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={allGenerateForm.deductions_percentage}
                    onChange={(e) => setAllGenerateForm({...allGenerateForm, deductions_percentage: parseFloat(e.target.value)})}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAllGenerateModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleGenerateAllPayrolls}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {t('payroll.createAllPayrolls')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll; 