import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { financeService, paymentService } from '../../api/index';
import { formatCurrency } from '../../utils/formatCurrency';

const FinancePage = () => {
  const [financeData, setFinanceData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    pendingPayments: 0,
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        // ✅ Use /finance/summary + /payments instead of getTransactions()
        const [summaryRes, paymentsRes] = await Promise.all([
          financeService.getSummary(),
          paymentService.getAll(),
        ]);

        const summary = summaryRes.data || {};
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

        // Compute totals if finance summary missing some fields
        const totalRevenue =
          summary.totalRevenue ??
          payments
            .filter(p => p.type === 'income')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalExpenses =
          summary.totalExpenses ??
          payments
            .filter(p => p.type === 'expense')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const profit = summary.profit ?? totalRevenue - totalExpenses;
        const pendingPayments =
          summary.pendingPayments ??
          payments.filter(p => p.status?.toLowerCase() === 'pending').length;

        setFinanceData({
          totalRevenue,
          totalExpenses,
          profit,
          pendingPayments,
        });
        setTransactions(payments);
      } catch (error) {
        console.error('Error fetching finance data:', error);
      }
    };

    fetchFinanceData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance</h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
          Overview of revenue, expenses, and transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(financeData.totalRevenue)}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(financeData.totalExpenses)}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(financeData.profit)}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {financeData.pendingPayments}
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
        <Table>
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{tx.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.description || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                        tx.status?.toLowerCase() === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : tx.status?.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default FinancePage;
