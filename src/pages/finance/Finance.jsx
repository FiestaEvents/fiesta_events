import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Finance = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  
  // FIXED: Individual state for each data type
  const [summary, setSummary] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [expensesBreakdown, setExpensesBreakdown] = useState(null);
  const [incomeBreakdown, setIncomeBreakdown] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  // FIXED: Use actual API methods that exist
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on period
      const dateRange = getDateRange(period);
      
      // Call multiple endpoints in parallel
      const [
        summaryRes,
        cashflowRes,
        expensesRes,
        incomeRes,
        profitLossRes,
        trendsRes,
        transactionsRes,
      ] = await Promise.all([
        financeService.getSummary(dateRange),
        financeService.getCashflow(),
        financeService.getExpensesBreakdown(),
        financeService.getIncomeBreakdown(),
        financeService.getProfitLoss(),
        financeService.getTrends(),
        financeService.getAll({ ...dateRange, limit: 10, sort: '-date' }),
      ]);

      // FIXED: API service handleResponse returns normalized data
      setSummary(summaryRes?.summary || summaryRes);
      setCashflow(cashflowRes?.cashflow || cashflowRes);
      setExpensesBreakdown(expensesRes?.expenses || expensesRes);
      setIncomeBreakdown(incomeRes?.income || incomeRes);
      setProfitLoss(profitLossRes?.profitLoss || profitLossRes);
      setTrends(trendsRes?.trends || trendsRes);
      setRecentTransactions(transactionsRes?.finance || transactionsRes?.data || []);
      
    } catch (error) {
      console.error('Error fetching finance dashboard:', error);
      toast.error(error.message || 'Failed to load finance dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get date range based on period
  const getDateRange = (period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return {}; // No date filter
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // FIXED: Calculate stats from actual data
  const calculateStats = () => {
    const totalRevenue = summary?.totalIncome || 0;
    const totalExpenses = summary?.totalExpenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return [
      {
        label: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: trends?.revenueChange || 0,
        icon: TrendingUp,
        color: 'green',
      },
      {
        label: 'Total Expenses',
        value: formatCurrency(totalExpenses),
        change: trends?.expensesChange || 0,
        icon: TrendingDown,
        color: 'red',
      },
      {
        label: 'Net Profit',
        value: formatCurrency(netProfit),
        change: trends?.profitChange || 0,
        icon: DollarSign,
        color: netProfit >= 0 ? 'green' : 'red',
      },
      {
        label: 'Profit Margin',
        value: `${profitMargin.toFixed(1)}%`,
        change: trends?.marginChange || 0,
        icon: PieChart,
        color: 'blue',
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Finance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your financial performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="min-w-[140px]"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </Select>
          <Button 
            variant="outline" 
            icon={RefreshCw} 
            onClick={fetchDashboardData}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => navigate('/finance/reports')}
          >
            Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                    stat.color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
                    stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    'bg-gray-50 dark:bg-gray-800'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    <ChangeIcon className="w-4 h-4" />
                    {formatPercentage(stat.change)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Loss Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profit & Loss
            </h3>
            {profitLoss && profitLoss.length > 0 ? (
              <div className="space-y-4">
                {profitLoss.slice(0, 6).map((item, index) => {
                  const profit = (item.income || 0) - (item.expenses || 0);
                  const maxValue = Math.max(...profitLoss.map(i => Math.max(i.income || 0, i.expenses || 0)));
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.period || item.month || 'N/A'}
                        </span>
                        <span className={`text-sm font-medium ${
                          profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(profit)}
                        </span>
                      </div>
                      <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-green-500 rounded-lg"
                          style={{
                            width: `${((item.income || 0) / maxValue) * 100}%`,
                          }}
                        />
                        <div
                          className="absolute left-0 top-0 h-full bg-red-500 opacity-50 rounded-lg"
                          style={{
                            width: `${((item.expenses || 0) / maxValue) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-green-600 dark:text-green-400">
                          Income: {formatCurrency(item.income || 0)}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          Expenses: {formatCurrency(item.expenses || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expense Breakdown
            </h3>
            {expensesBreakdown && expensesBreakdown.length > 0 ? (
              <div className="space-y-3">
                {expensesBreakdown.map((category, index) => {
                  const totalExpenses = expensesBreakdown.reduce((sum, cat) => sum + (cat.total || 0), 0);
                  const percentage = totalExpenses > 0 ? ((category.total || 0) / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {(category.category || category._id || 'Other').replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(category.total || 0)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}% of total expenses
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Transactions
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/finance/transactions')}
                >
                  View All
                </Button>
              </div>

              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => {
                    const isIncome = transaction.type === 'income';
                    return (
                      <div
                        key={transaction._id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 ${
                              isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            } rounded-lg`}
                          >
                            {isIncome ? (
                              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.description || 'Unnamed transaction'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {(transaction.category || 'other').replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No recent transactions</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Transaction</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(summary?.avgTransaction || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {summary?.totalTransactions || recentTransactions.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cash Flow</span>
                  <span
                    className={`text-sm font-semibold ${
                      (cashflow?.netCashFlow || 0) >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(cashflow?.netCashFlow || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(summary?.pending || 0)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Income Breakdown
              </h3>

              {incomeBreakdown && incomeBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {incomeBreakdown.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {(item.category || item._id || 'Other').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.total || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => navigate('/finance/transactions')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Transactions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">View all transactions</p>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => navigate('/finance/reports')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Reports</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generate financial reports</p>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => navigate('/payments')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Payments</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage payments</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Finance;