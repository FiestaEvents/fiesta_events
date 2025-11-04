import { useState, useEffect } from 'react';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  
  // FIXED: Separate state for each data type
  const [summary, setSummary] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [expensesBreakdown, setExpensesBreakdown] = useState(null);
  const [incomeBreakdown, setIncomeBreakdown] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  // FIXED: Use actual API methods
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      const dateRange = getDateRange(period);
      
      const [
        summaryRes,
        cashflowRes,
        expensesRes,
        incomeRes,
        profitLossRes,
        trendsRes,
      ] = await Promise.all([
        financeService.getSummary(dateRange),
        financeService.getCashflow(),
        financeService.getExpensesBreakdown(),
        financeService.getIncomeBreakdown(),
        financeService.getProfitLoss(),
        financeService.getTrends(),
      ]);

      setSummary(summaryRes?.summary || summaryRes);
      setCashflow(cashflowRes?.cashflow || cashflowRes);
      setExpensesBreakdown(expensesRes?.expenses || expensesRes);
      setIncomeBreakdown(incomeRes?.income || incomeRes);
      setProfitLoss(profitLossRes?.profitLoss || profitLossRes);
      setTrends(trendsRes?.trends || trendsRes);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics');
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
      case 'all':
        return {};
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // FIXED: Calculate metrics from real data
  const calculateKeyMetrics = () => {
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
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
      },
      {
        label: 'Total Expenses',
        value: formatCurrency(totalExpenses),
        change: trends?.expensesChange || 0,
        icon: TrendingDown,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400',
      },
      {
        label: 'Net Profit',
        value: formatCurrency(netProfit),
        change: trends?.profitChange || 0,
        icon: DollarSign,
        bgColor: netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20',
        iconColor: netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      },
      {
        label: 'Profit Margin',
        value: `${profitMargin.toFixed(1)}%`,
        change: trends?.marginChange || 0,
        icon: Target,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
      },
    ];
  };

  // FIXED: Get chart color class
  const getChartColorClass = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const keyMetrics = calculateKeyMetrics();
  
  // FIXED: Use real profit/loss data for trends
  const trendData = profitLoss && profitLoss.length > 0 
    ? profitLoss.slice(-6).map(item => ({
        month: item.period || item.month || 'N/A',
        revenue: item.income || 0,
        expenses: item.expenses || 0,
      }))
    : [];

  const maxValue = trendData.length > 0
    ? Math.max(...trendData.map((d) => Math.max(d.revenue, d.expenses)))
    : 1;

  // FIXED: Calculate top performing periods from profit/loss data
  const topMonths = profitLoss && profitLoss.length > 0
    ? [...profitLoss]
        .sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses))
        .slice(0, 3)
        .map(item => ({
          month: item.period || item.month || 'N/A',
          revenue: item.income || 0,
          profit: (item.income || 0) - (item.expenses || 0),
        }))
    : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis of your financial performance
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
            onClick={fetchAnalytics}
            loading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    <ChangeIcon className="w-4 h-4" />
                    {formatPercentage(metric.change)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue vs Expenses Trend */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue vs Expenses Trend
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </div>

          {trendData.length > 0 ? (
            <div className="space-y-4">
              {trendData.map((item, index) => {
                const revenueWidth = maxValue > 0 ? (item.revenue / maxValue) * 100 : 0;
                const expensesWidth = maxValue > 0 ? (item.expenses / maxValue) * 100 : 0;
                const profit = item.revenue - item.expenses;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.month}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(item.revenue)}
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {formatCurrency(item.expenses)}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {formatCurrency(profit)}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500 opacity-70 rounded-lg transition-all"
                        style={{ width: `${revenueWidth}%` }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-red-500 opacity-50 rounded-lg transition-all"
                        style={{ width: `${expensesWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No trend data available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Revenue Sources & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Revenue Sources
            </h3>

            {incomeBreakdown && incomeBreakdown.length > 0 ? (
              <div className="space-y-4">
                {incomeBreakdown.map((source, index) => {
                  const totalIncome = incomeBreakdown.reduce((sum, item) => sum + (item.total || 0), 0);
                  const percentage = totalIncome > 0 ? ((source.total || 0) / totalIncome) * 100 : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {(source.category || source._id || 'Other').replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(source.total || 0)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full ${getChartColorClass(index)} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {percentage.toFixed(1)}% of total revenue
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No revenue data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Expense Breakdown
            </h3>

            {expensesBreakdown && expensesBreakdown.length > 0 ? (
              <div className="space-y-4">
                {expensesBreakdown.map((category, index) => {
                  const totalExpenses = expensesBreakdown.reduce((sum, item) => sum + (item.total || 0), 0);
                  const percentage = totalExpenses > 0 ? ((category.total || 0) / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {(category.category || category._id || 'Other').replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(category.total || 0)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full ${getChartColorClass(index)} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {percentage.toFixed(1)}% of total expenses
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No expense data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Performing Periods & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Periods */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Performing Periods
              </h3>
            </div>

            {topMonths.length > 0 ? (
              <div className="space-y-3">
                {topMonths.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {month.month}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Revenue: {formatCurrency(month.revenue)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(month.profit)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No performance data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Cash Flow Summary */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cash Flow Summary
              </h3>
            </div>

            {cashflow ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Inflow</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(cashflow.totalInflow || 0)}
                  </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Outflow</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(cashflow.totalOutflow || 0)}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${
                  (cashflow.netCashFlow || 0) >= 0 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-orange-50 dark:bg-orange-900/20'
                }`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${
                    (cashflow.netCashFlow || 0) >= 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {formatCurrency(cashflow.netCashFlow || 0)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No cash flow data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary && summary.totalIncome > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                      Revenue Activity
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Total revenue: {formatCurrency(summary.totalIncome)}. Monitor trends to identify growth opportunities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {cashflow && cashflow.netCashFlow >= 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Positive Cash Flow
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Net cash flow is positive at {formatCurrency(cashflow.netCashFlow)}. Good financial health indicator.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {expensesBreakdown && expensesBreakdown.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded">
                    <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                      Expense Management
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      {expensesBreakdown.length} expense categories tracked. Review regularly for optimization opportunities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(!summary || !cashflow || !expensesBreakdown || expensesBreakdown.length === 0) && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-300 mb-1">
                      Limited Data
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Add more financial records to generate comprehensive insights and recommendations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;