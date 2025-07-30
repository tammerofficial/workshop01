import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, RefreshCw, Trash2, Edit2, Save, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import * as biometricService from '../../api/biometric';

interface TransactionManagementProps {
  onClose: () => void;
  onUpdate: () => void;
}

interface Transaction {
  id: number;
  emp: number;
  emp_code: string;
  first_name: string;
  last_name: string;
  punch_time: string;
  punch_state: number;
  punch_state_display: string;
  verify_type: number;
  verify_type_display: string;
  terminal_sn: string;
  terminal_alias: string;
}

const TransactionManagement: React.FC<TransactionManagementProps> = ({ onClose, onUpdate }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    workerId: '',
    terminalId: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await biometricService.getBiometricTransactions(filters);
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const response = await biometricService.importBiometricTransactions({
        start_date: filters.startDate,
        end_date: filters.endDate
      });
      if (response.data.success) {
        loadTransactions();
        onUpdate();
      }
    } catch (error) {
      console.error('Error importing transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await biometricService.deleteBiometricTransaction(id);
      if (response.data.success) {
        loadTransactions();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTransactions.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) return;
    
    try {
      setLoading(true);
      // Delete each selected transaction
      await Promise.all(selectedTransactions.map(id => 
        biometricService.deleteBiometricTransaction(id)
      ));
      setSelectedTransactions([]);
      loadTransactions();
      onUpdate();
    } catch (error) {
      console.error('Error deleting transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Transaction Management
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`}
            >
              <X size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className={`px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className={`px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              placeholder="End Date"
            />
            <input
              type="text"
              value={filters.workerId}
              onChange={(e) => setFilters({ ...filters, workerId: e.target.value })}
              className={`px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              placeholder="Worker ID"
            />
            <input
              type="text"
              value={filters.terminalId}
              onChange={(e) => setFilters({ ...filters, terminalId: e.target.value })}
              className={`px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              placeholder="Terminal ID"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload size={20} />
              <span>Import from Device</span>
            </button>
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw size={20} />
              <span>Refresh</span>
            </button>
            {selectedTransactions.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                <Trash2 size={20} />
                <span>Delete Selected ({selectedTransactions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle size={48} className={`mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No transactions found
              </p>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Try importing transactions from the biometric device
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === transactions.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Employee
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Punch Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    State
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Verification
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Terminal
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransactions([...selectedTransactions, transaction.id]);
                          } else {
                            setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div>
                        <div className="font-medium">{transaction.first_name} {transaction.last_name}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {transaction.emp_code}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {new Date(transaction.punch_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.punch_state === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.punch_state_display}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {transaction.verify_type_display}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {transaction.terminal_alias}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className={`text-red-600 hover:text-red-800 ${isDark ? 'hover:text-red-400' : ''}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransactionManagement;