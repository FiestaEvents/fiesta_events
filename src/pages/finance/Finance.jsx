import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService, paymentService } from '../../api/index';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Target,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Finance = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  
  const [financialData, setFinancialData] = useState({
    summary: null,
    cashflow: null,
    expensesBreakdown: null,
    incomeBreakdown: null,
    trends: null,
    recentTransactions: [],
    upcomingPayments: [],
  });

  useEffect(() => {
    fetchAllFinancialData();
  }, [period]);

  const fetchAllFinancialData = async () => {
    try {
      setIsLoading(true);
      const dateRange = getDateRange(period);
      
      const [
        summaryRes,
        cashflowRes,
        expensesRes,
        incomeRes,
        trendsRes,
        transactionsRes,
        paymentsRes,
      ] = await Promise.all([
        financeService.getSummary(dateRange),
        financeService.getCashflow(dateRange),
        financeService.getExpensesBreakdown(dateRange),
        financeService.getIncomeBreakdown(dateRange),
        financeService.getTrends({ months: period === 'year' ? 12 : 6 }),
        financeService.getAll({ ...dateRange, limit: 10, sortBy: 'date', order: 'desc' }),
        paymentService.getAll({ status: 'pending', limit: 10 }),
      ]);

      setFinancialData({
        summary: summaryRes.summary || {},
        cashflow: cashflowRes.cashFlow || [],
        currentBalance: cashflowRes.currentBalance || 0,
        expensesBreakdown: expensesRes.breakdown || [],
        incomeBreakdown: incomeRes.breakdown || [],
        trends: trendsRes.trends || [],
        recentTransactions: transactionsRes.finance || [],
        upcomingPayments: paymentsRes.payments || paymentsRes || [],
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

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
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tn-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate event vs venue expenses
  const calculateExpenseBreakdown = () => {
    const expenses = financialData.expensesBreakdown || [];
    
    const eventExpenses = expenses
      .filter(exp => ['partner_payment'].includes(exp.category))
      .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

    const venueExpenses = expenses
      .filter(exp => !['partner_payment', 'event_revenue'].includes(exp.category))
      .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

    return { eventExpenses, venueExpenses };
  };

  const { eventExpenses, venueExpenses } = calculateExpenseBreakdown();

  // Main metric cards
  const summary = financialData.summary || {};
  const mainMetrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary.totalIncome || 0),
      change: 0, // Calculate from trends if needed
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'All income sources',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary.totalExpense || 0),
      change: 0,
      icon: TrendingDown,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      description: 'Event + Venue costs',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(summary.netProfit || 0),
      change: 0,
      icon: DollarSign,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'After all expenses',
    },
    {
      label: 'Profit Margin',
      value: `${summary.profitMargin || 0}%`,
      change: 0,
      icon: Target,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Overall profitability',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Finance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete overview of your venue's financial performance
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
          </Select>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => navigate('/finance/reports')}
          >
            Reports
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{metric.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Event & Venue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Financials */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Event Financials
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Revenue and costs from events
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Event Revenue</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(
                    (financialData.incomeBreakdown || [])
                      .find(inc => inc.category === 'event_revenue')?.totalAmount || 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Partner Costs</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(eventExpenses)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Event Profit</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(
                      ((financialData.incomeBreakdown || [])
                        .find(inc => inc.category === 'event_revenue')?.totalAmount || 0) - 
                      eventExpenses
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Venue Operating Expenses */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Building className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Venue Operating Expenses
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fixed and recurring costs
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(financialData.expensesBreakdown || [])
                .filter(exp => !['partner_payment', 'event_revenue'].includes(exp.category))
                .slice(0, 6)
                .map((expense, index) => {
                  const percentage = venueExpenses > 0 
                    ? ((expense.totalAmount || 0) / venueExpenses) * 100 
                    : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {expense.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(expense.totalAmount || 0)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-orange-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {percentage.toFixed(1)}% of venue expenses
                      </span>
                    </div>
                  );
                })}

              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Total Venue Expenses</span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(venueExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cash Flow & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cash Flow
              </h3>
            </div>

            {financialData.cashflow && financialData.cashflow.length > 0 ? (
              <div className="space-y-3">
                {financialData.cashflow.slice(-3).map((period, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {period.period}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Net</span>
                      <span className={`text-lg font-bold ${
                        period.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(period.net)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Current Balance</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(financialData.currentBalance || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No cash flow data</p>
              </div>
            )}
          </div>
        </Card>

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

              {financialData.recentTransactions && financialData.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {financialData.recentTransactions.slice(0, 5).map((transaction) => {
                    const isIncome = transaction.type === 'income';
                    return (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${
                            isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                          } rounded-lg`}>
                            {isIncome ? (
                              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.description || 'Transaction'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {(transaction.category || 'other').replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
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
      </div>

      {/* Upcoming Payments */}
      {financialData.upcomingPayments && financialData.upcomingPayments.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Payments
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/payments')}
              >
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialData.upcomingPayments.slice(0, 6).map((payment) => {
                const daysUntil = getDaysUntil(payment.dueDate);
                const isUrgent = daysUntil <= 3;

                return (
                  <div key={payment._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {payment.description || 'Payment'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
                          <p className={`text-xs ${
                            isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">View all</p>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => navigate('/finance/analytics')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deep insights</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Generate</p>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => navigate('/finance/profitability')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <PieChart className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Profitability</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">By event</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Finance;