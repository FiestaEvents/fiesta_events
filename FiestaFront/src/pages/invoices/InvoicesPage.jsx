// src/pages/payments/InvoicesPage.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Download, Search, X, Calendar, DollarSign, User, Hash } from 'lucide-react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { invoiceService } from '../../api/index';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await invoiceService.getAll();
        setInvoices(response?.data || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError('Failed to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleCreateInvoice = () => {
    console.log('Create new invoice');
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDownloadInvoice = (e, invoiceId) => {
    e.stopPropagation();
    console.log('Download invoice:', invoiceId);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Invoices
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            Manage all client invoices and payments
          </p>
        </div>
        <Button variant="outline" onClick={handleCreateInvoice}>
          <Plus className="w-5 h-5 mr-2" />
          Create New Invoice
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Invoices</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{paidInvoices}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Invoices</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingInvoices}</div>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No invoices found matching your search.' : 'No invoices found. Create your first invoice to get started.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} onClick={() => handleViewInvoice(invoice)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{invoice.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{invoice.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : invoice.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>{invoice.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View Invoice">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDownloadInvoice(e, invoice.id)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCloseModal} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-700">
              {/* Modal content remains the same */}
              {/* ... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
