import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Finance = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await financeService.getDashboard(period);
      setDashboardData(data.data);
    } catch (error) {
      toast.error('Failed to load finance dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await financeService.exportReport(period, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = dashboardData
    ? [
        {
          label: 'Total Revenue',
          value: formatCurrency(dashboardData.totalRevenue),
          change: dashboardData.revenueChange,
          icon: TrendingUp,
          color: 'green',
        },
        {
          label: 'Total Expenses',
          value: formatCurrency(dashboardData.totalExpenses),
          change: dashboardData.expensesChange,
          icon: TrendingDown,
          color: 'red',
        },
        {
          label: 'Net Profit',
          value: formatCurrency(dashboardData.netProfit),
          change: dashboardData.profitChange,
          icon: DollarSign,
          color: dashboardData.netProfit >= 0 ? 'green' : 'red',
        },
        {
          label: 'Profit Margin',
          value: `${dashboardData.profitMargin.toFixed(1)}%`,
          change: dashboardData.marginChange,
          icon: PieChart,
          color: 'blue',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your financial performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </Select>
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export Report
          </Button>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => navigate('/finance/reports')}
          >
            View Reports
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
                  <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <ChangeIcon className="w-4 h-4" />
                    {formatPercentage(stat.change)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue vs Expenses
            </h3>
            {dashboardData?.revenueVsExpenses ? (
              <div className="space-y-4">
                {dashboardData.revenueVsExpenses.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.revenue - item.expenses)}
                      </span>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500 rounded-lg"
                        style={{
                          width: `${(item.revenue / Math.max(...dashboardData.revenueVsExpenses.map(i => Math.max(i.revenue, i.expenses)))) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-red-500 opacity-50 rounded-lg"
                        style={{
                          width: `${(item.expenses / Math.max(...dashboardData.revenueVsExpenses.map(i => Math.max(i.revenue, i.expenses)))) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-green-600">
                        Revenue: {formatCurrency(item.revenue)}
                      </span>
                      <span className="text-red-600">
                        Expenses: {formatCurrency(item.expenses)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Expense Categories */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Expense Breakdown
            </h3>
            {dashboardData?.expensesByCategory ? (
              <div className="space-y-3">
                {dashboardData.expensesByCategory.map((category, index) => {
                  const percentage = (category.amount / dashboardData.totalExpenses) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-900 capitalize">
                          {category.category.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {percentage.toFixed(1)}% of total expenses
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No data available</p>
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
                <h3 className="text-lg font-semibold text-gray-900">
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

              {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentTransactions.map((transaction, index) => {
                    const isIncome = transaction.type === 'income';
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 ${
                              isIncome ? 'bg-green-100' : 'bg-red-100'
                            } rounded-lg`}
                          >
                            {isIncome ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {transaction.category.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isIncome ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
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
                  <p className="text-gray-600">No recent transactions</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Transaction</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(dashboardData?.avgTransaction || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {dashboardData?.totalTransactions || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cash Flow</span>
                  <span
                    className={`text-sm font-semibold ${
                      (dashboardData?.cashFlow || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(dashboardData?.cashFlow || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Outstanding</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {formatCurrency(dashboardData?.outstanding || 0)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Methods
              </h3>

              {dashboardData?.paymentMethods ? (
                <div className="space-y-3">
                  {dashboardData.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 capitalize">
                          {method.method.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(method.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/finance/transactions')}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Transactions</h4>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/finance/reports')}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reports</h4>
                <p className="text-sm text-gray-600">Generate financial reports</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/payments')}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Payments</h4>
                <p className="text-sm text-gray-600">Manage payments</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Finance;