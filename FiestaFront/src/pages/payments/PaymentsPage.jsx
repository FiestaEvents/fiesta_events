import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { paymentService } from '../../api/index';
import { formatCurrency } from '../../utils/formatCurrency';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getAll();

      console.log("💳 Raw payments response:", response.data);

      // Handle nested data structure
      const responseData = response.data || response;
      
      const normalizedPayments = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.payments)
        ? responseData.payments
        : [];

      console.log("💳 Normalized payments:", normalizedPayments);
      setPayments(normalizedPayments);
    } catch (err) {
      console.error('❌ Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Helper functions to extract data from different structures
  const getClientName = (payment) => {
    if (payment.clientName) return payment.clientName;
    if (payment.client?.name) return payment.client.name;
    if (payment.event?.clientId?.name) return payment.event.clientId.name;
    if (payment.processedBy?.name) return payment.processedBy.name;
    return 'N/A';
  };

  const getPaymentDate = (payment) => {
    return payment.paidDate || payment.date || payment.createdAt;
  };

  const getPaymentStatus = (payment) => {
    return payment.status || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading payments...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalIncome = payments
    .filter(p => p.type === 'income')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalExpenses = payments
    .filter(p => p.type === 'expense')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const netAmount = totalIncome - totalExpenses;
  
  const completedPayments = payments.filter(p => 
    p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid'
  ).length;
  
  const pendingPayments = payments.filter(p => 
    p.status?.toLowerCase() === 'pending'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Payments
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Track all income and expenses
          </p>
        </div>
        <Button onClick={fetchPayments} variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={fetchPayments} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Amount</div>
              <div className={`mt-2 text-3xl font-bold ${
                netAmount >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(netAmount)}
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-gray-500" />
          </div>
        </Card>
        
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {completedPayments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingPayments}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client/Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        p.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {p.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {p.description || p.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {getClientName(p)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {getPaymentDate(p) 
                        ? new Date(getPaymentDate(p)).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 capitalize">
                      {p.method?.replace('-', ' ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${
                        p.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {p.type === 'income' ? '+' : '-'}{formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          getPaymentStatus(p).toLowerCase() === 'completed' || getPaymentStatus(p).toLowerCase() === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : getPaymentStatus(p).toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getPaymentStatus(p)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PaymentsPage;