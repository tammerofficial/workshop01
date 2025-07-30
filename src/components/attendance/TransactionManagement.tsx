import React, { useState, useEffect } from 'react';
import { Database, Eye, Trash2, Download, FileText, BarChart3, Users, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { erpService } from '../../api/laravel';
import toast from 'react-hot-toast';

interface Transaction {
  id: number;
  emp_code: string;
  first_name?: string;
  last_name?: string;
  punch_time: string;
  punch_state: number;
  punch_state_display?: string;
  verification_type: string;
  verify_type_display?: string;
  terminal_sn: string;
  terminal_alias?: string;
  upload_time?: string;
  area_alias?: string;
  work_code?: string;
}

interface TransactionStats {
  total_transactions: number;
  check_ins: number;
  check_outs: number;
  unique_employees: number;
  date_range: {
    start: string | null;
    end: string | null;
  };
}

interface TransactionFilters {
  emp_code: string;
  terminal_sn: string;
  start_time: string;
  end_time: string;
  page: number;
  page_size: number;
}

interface TransactionManagementProps {
  activeTab: 'transactions' | 'reports';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  setDateRange: (dateRange: { startDate: string; endDate: string }) => void;
}

const TransactionManagement: React.FC<TransactionManagementProps> = ({ activeTab, dateRange, setDateRange }) => {
  const { isDark } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionStats, setTransactionStats] = useState<TransactionStats>({
    total_transactions: 0,
    check_ins: 0,
    check_outs: 0,
    unique_employees: 0,
    date_range: { start: null, end: null }
  });

  const [transactionFilters, setTransactionFilters] = useState({
    emp_code: '',
    terminal_sn: '',
    page: 1,
    page_size: 50
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounced effect for filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'transactions') {
        loadTransactions();
      }
      loadTransactionStats();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [activeTab, transactionFilters, dateRange]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Build params object, only include non-empty values
      const params: Record<string, unknown> = {
        page: transactionFilters.page,
        page_size: transactionFilters.page_size
      };
      
      if (transactionFilters.emp_code && transactionFilters.emp_code.trim()) {
        params.emp_code = transactionFilters.emp_code.trim();
      }
      if (transactionFilters.terminal_sn && transactionFilters.terminal_sn.trim()) {
        params.terminal_sn = transactionFilters.terminal_sn.trim();
      }
      if (dateRange.startDate) {
        params.start_time = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.end_time = dateRange.endDate;
      }
      
      console.log('Loading transactions with params:', params);
      const response = await erpService.getTransactions(params);
      console.log('Transactions response:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Setting transactions:', response.data.data?.data || []);
        setTransactions(response.data.data?.data || []);
      } else {
        console.log('Failed to load transactions:', response.data);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionStats = async () => {
    try {
      const params = {
        start_date: dateRange.startDate || undefined,
        end_date: dateRange.endDate || undefined
      };

      console.log('Loading transaction stats with params:', params);
      const response = await erpService.getTransactionStats(params);
      console.log('Transaction stats response:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Setting transaction stats:', response.data.data);
        setTransactionStats(response.data.data);
      } else {
        console.log('Failed to get transaction stats:', response.data);
      }
    } catch (error) {
      console.error('Error loading transaction stats:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await erpService.deleteTransaction(transactionId);
        toast.success('Transaction deleted successfully');
        loadTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleViewTransaction = async (transactionId: number) => {
    try {
      const response = await erpService.getTransaction(transactionId);
      if (response.data && response.data.success) {
        setSelectedTransaction(response.data.data);
        setShowTransactionModal(true);
      }
    } catch (error) {
      toast.error('Failed to load transaction details');
    }
  };

  const handleExportReport = async (format: 'csv' | 'txt' | 'xls') => {
    try {
      const params = {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        format
      };

      const response = await erpService.exportTransactionReport(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transaction_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const getPunchStateText = (state: number) => {
    switch (state) {
      case 0: return 'Check In';
      case 1: return 'Check Out';
      case 2: return 'Break Start';
      case 3: return 'Break End';
      case 4: return 'Overtime In';
      case 5: return 'Overtime Out';
      default: return 'Unknown';
    }
  };

  const getPunchStateColor = (state: number) => {
    switch (state) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilters.emp_code && !transaction.emp_code.includes(transactionFilters.emp_code)) {
      return false;
    }
    if (transactionFilters.terminal_sn && !transaction.terminal_sn.includes(transactionFilters.terminal_sn)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          {/* Transaction Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-xl shadow-sm border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Transactions</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transactionStats.total_transactions}
                  </p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check Ins</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transactionStats.check_ins}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check Outs</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transactionStats.check_outs}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Unique Employees</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transactionStats.unique_employees}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Transaction Filters */}
          <div className={`rounded-xl shadow-sm border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Employee Code
                </label>
                <input
                  type="text"
                  placeholder="Enter employee code"
                  value={transactionFilters.emp_code}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, emp_code: e.target.value }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Terminal SN
                </label>
                <input
                  type="text"
                  placeholder="Enter terminal serial"
                  value={transactionFilters.terminal_sn}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, terminal_sn: e.target.value }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start Time
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  End Time
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Page Size
                </label>
                <select
                  value={transactionFilters.page_size}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, page_size: parseInt(e.target.value) }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
            
            {/* Filter Action Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  loadTransactions();
                  loadTransactionStats();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setTransactionFilters({
                    emp_code: '',
                    terminal_sn: '',
                    page: 1,
                    page_size: 50
                  });
                  setDateRange({ startDate: '', endDate: '' });
                }}
                className={`px-4 py-2 border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>ID</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Employee Code</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Employee Name</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Punch Time</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Terminal</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Verification</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.id}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {transaction.emp_code}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.first_name && transaction.last_name 
                            ? `${transaction.first_name} ${transaction.last_name}` 
                            : transaction.first_name || transaction.last_name || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {new Date(transaction.punch_time).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPunchStateColor(transaction.punch_state)}`}>
                            {transaction.punch_state_display || getPunchStateText(transaction.punch_state)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          <div>
                            <div className="font-medium">{transaction.terminal_alias || transaction.terminal_sn}</div>
                            <div className="text-xs text-gray-400">SN: {transaction.terminal_sn}</div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {transaction.verify_type_display || transaction.verification_type || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewTransaction(transaction.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Transaction"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className={`flex flex-col items-center space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Database size={48} className="opacity-50" />
                          <div>
                            <h3 className="text-lg font-medium">No Transactions Found</h3>
                            <p className="text-sm">Try adjusting your filters to see transaction data.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Export Transaction Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleExportReport('csv')}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Download size={20} />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExportReport('txt')}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <FileText size={20} />
                <span>Export as TXT</span>
              </button>
              <button
                onClick={() => handleExportReport('xls')}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <BarChart3 size={20} />
                <span>Export as XLS</span>
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Transaction Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Overview</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Total Transactions:</span>
                    <span className="font-semibold">{transactionStats.total_transactions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Unique Employees:</span>
                    <span className="font-semibold">{transactionStats.unique_employees}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Check Ins:</span>
                    <span className="font-semibold text-green-600">{transactionStats.check_ins}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Check Outs:</span>
                    <span className="font-semibold text-red-600">{transactionStats.check_outs}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date Range</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Start Date:</span>
                    <span className="font-semibold">{transactionStats.date_range.start || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>End Date:</span>
                    <span className="font-semibold">{transactionStats.date_range.end || 'N/A'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Transaction Details
              </h3>
              <button onClick={() => setShowTransactionModal(false)}>
                <XCircle size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ID:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTransaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Employee Code:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTransaction.emp_code}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Punch Time:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(selectedTransaction.punch_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Action:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPunchStateColor(selectedTransaction.punch_state)}`}>
                  {getPunchStateText(selectedTransaction.punch_state)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terminal:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTransaction.terminal_alias || selectedTransaction.terminal_sn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verification:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTransaction.verification_type || 'N/A'}
                </span>
              </div>
              {selectedTransaction.upload_time && (
                <div className="flex justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upload Time:</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedTransaction.upload_time).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;