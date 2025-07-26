import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { invoiceService, clientService } from '../api/laravel';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  notes: string;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

const Invoices = () => {
  const { t, isRTL } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    amount: '',
    tax_amount: '',
    issue_date: '',
    due_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        invoiceService.getAll(),
        clientService.getAll()
      ]);

      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('invoices.error.load'));
    } finally {
      setLoading(false);
    }
  };
      
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...newInvoice,
        amount: parseFloat(newInvoice.amount) || 0,
        tax_amount: parseFloat(newInvoice.tax_amount) || 0
      };

      await invoiceService.create(invoiceData);
      toast.success(t('invoices.success.create'));
      setShowCreateModal(false);
      setNewInvoice({
        client_id: '',
        amount: '',
        tax_amount: '',
        issue_date: '',
        due_date: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(t('invoices.error.create'));
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    try {
      await invoiceService.update(editingInvoice.id, editingInvoice);
      toast.success(t('invoices.success.update'));
      setEditingInvoice(null);
      loadData();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error(t('invoices.error.update'));
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm(t('invoices.confirm.delete'))) return;

    try {
      await invoiceService.delete(id);
      toast.success(t('invoices.success.delete'));
      loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error(t('invoices.error.delete'));
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      await invoiceService.updateStatus(invoiceId, newStatus);
      toast.success(t('invoices.success.statusUpdate'));
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('invoices.error.statusUpdate'));
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return t(`invoices.status.${status}`);
  };

  if (loading) {
        return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="space-y-6 p-4 md:p-6 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center">
    <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('invoices.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('invoices.subtitle')}</p>
        </div>
          <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
          <Plus className="h-5 w-5" />
          {t('invoices.new')}
          </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('invoices.total')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{invoices.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('invoices.paid')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${paidAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('invoices.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${pendingAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('invoices.overdue')}</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
            </div>
            <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5`} />
            <input
              type="text"
                placeholder={t('invoices.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
              <option value="all">{t('invoices.allStatuses')}</option>
              <option value="draft">{t('invoices.status.draft')}</option>
              <option value="sent">{t('invoices.status.sent')}</option>
              <option value="paid">{t('invoices.status.paid')}</option>
              <option value="overdue">{t('invoices.status.overdue')}</option>
              <option value="cancelled">{t('invoices.status.cancelled')}</option>
              </select>
          </div>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">#{invoice.invoice_number}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.client?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingInvoice(invoice)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteInvoice(invoice.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{invoice.client?.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('invoices.issued', { date: new Date(invoice.issue_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('invoices.due', { date: new Date(invoice.due_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{t('invoices.amount', { amount: invoice.amount })}</span>
              </div>

              {invoice.tax_amount > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('invoices.tax', { amount: invoice.tax_amount })}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('invoices.totalAmount', { amount: invoice.total_amount })}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                {getStatusText(invoice.status)}
              </span>
              
              <select
                value={invoice.status}
                onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="draft">{t('invoices.status.draft')}</option>
                <option value="sent">{t('invoices.status.sent')}</option>
                <option value="paid">{t('invoices.status.paid')}</option>
                <option value="overdue">{t('invoices.status.overdue')}</option>
                <option value="cancelled">{t('invoices.status.cancelled')}</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('invoices.noInvoices')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('invoices.createFirst')}</p>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('invoices.modal.addTitle')}</h2>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.client')}</label>
                    <select
                      required
                      value={newInvoice.client_id}
                      onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('invoices.form.selectClient')}</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.amount')}</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.taxAmount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newInvoice.tax_amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, tax_amount: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.issueDate')}</label>
                    <input
                      type="date"
                      required
                      value={newInvoice.issue_date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, issue_date: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.dueDate')}</label>
                    <input
                      type="date"
                      required
                      value={newInvoice.due_date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
          </div>
        </div>
        
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.notes')}</label>
                  <textarea
                    rows={3}
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                    </div>

                <div className="flex gap-4 pt-4">
                      <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                    {t('invoices.form.create')}
                      </button>
                      <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    {t('common.cancel')}
                      </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('invoices.modal.editTitle')}</h2>
              <form onSubmit={handleUpdateInvoice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.amount')}</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={editingInvoice.amount}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.taxAmount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingInvoice.tax_amount}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, tax_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.issueDate')}</label>
                    <input
                      type="date"
                      required
                      value={editingInvoice.issue_date}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, issue_date: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.dueDate')}</label>
                    <input
                      type="date"
                      required
                      value={editingInvoice.due_date}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('invoices.form.notes')}</label>
                  <textarea
                    rows={3}
                    value={editingInvoice.notes}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                      <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                    {t('invoices.form.save')}
                      </button>
                      <button 
                    type="button"
                    onClick={() => setEditingInvoice(null)}
                    className="bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    {t('common.cancel')}
                      </button>
                    </div>
              </form>
            </div>
          </div>
          </div>
        )}
    </div>
  );
};

export default Invoices;