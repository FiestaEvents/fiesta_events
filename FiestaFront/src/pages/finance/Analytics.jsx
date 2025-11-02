import { useState, useEffect } from 'react';
import { financeService } from '../../api/index';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [analytics, trends, forecast] = await Promise.all([
        financeService.getAnalytics(period),
        financeService.getTrends(period),
        financeService.getForecast(3),
      ]);

      setAnalyticsData({
        analytics: analytics.data || analytics,
        trends: trends.data || trends,
        forecast: forecast.data || forecast,
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await financeService.export('pdf', { period });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { analytics, trends, forecast } = analyticsData || {};

  // Mock data for demonstration (replace with real data from analytics)
  const keyMetrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue || 125000),
      change: analytics?.revenueChange || 12.5,
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(analytics?.totalExpenses || 75000),
      change: analytics?.expensesChange || -5.2,
      icon: TrendingDown,
      color: 'red',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(analytics?.netProfit || 50000),
      change: analytics?.profitChange || 18.3,
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Profit Margin',
      value: `${analytics?.profitMargin || 40}%`,
      change: analytics?.marginChange || 3.2,
      icon: Target,
      color: 'purple',
    },
  ];

  // Revenue vs Expenses trend data
  const trendData = trends?.monthly || [
    { month: 'Jan', revenue: 95000, expenses: 65000 },
    { month: 'Feb', revenue: 105000, expenses: 68000 },
    { month: 'Mar', revenue: 115000, expenses: 72000 },
    { month: 'Apr', revenue: 108000, expenses: 70000 },
    { month: 'May', revenue: 118000, expenses: 73000 },
    { month: 'Jun', revenue: 125000, expenses: 75000 },
  ];

  const maxValue = Math.max(
    ...trendData.map((d) => Math.max(d.revenue, d.expenses))
  );

  // Expense categories
  const expenseCategories = analytics?.expensesByCategory || [
    { category: 'Staff Salary', amount: 35000, percentage: 46.7 },
    { category: 'Utilities', amount: 15000, percentage: 20.0 },
    { category: 'Marketing', amount: 10000, percentage: 13.3 },
    { category: 'Maintenance', amount: 8000, percentage: 10.7 },
    { category: 'Equipment', amount: 5000, percentage: 6.7 },
    { category: 'Other', amount: 2000, percentage: 2.6 },
  ];

  // Revenue sources
  const revenueSources = analytics?.revenueBySource || [
    { source: 'Event Revenue', amount: 85000, percentage: 68 },
    { source: 'Venue Rental', amount: 25000, percentage: 20 },
    { source: 'Catering', amount: 10000, percentage: 8 },
    { source: 'Other Services', amount: 5000, percentage: 4 },
  ];

  // Top performing months
  const topMonths = analytics?.topMonths || [
    { month: 'June', revenue: 125000, profit: 50000 },
    { month: 'May', revenue: 118000, profit: 45000 },
    { month: 'March', revenue: 115000, profit: 43000 },
  ];

  // Forecast data
  const forecastData = forecast || [
    { month: 'Jul', predicted: 130000, confidence: 85 },
    { month: 'Aug', predicted: 135000, confidence: 78 },
    { month: 'Sep', predicted: 128000, confidence: 72 },
  ];

  const getCategoryColor = (index) => {
    const colors = ['blue', 'green', 'purple', 'yellow', 'pink', 'indigo'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of your financial performance
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
            Export
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
                  <div className={`p-3 bg-${metric.color}-50 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <ChangeIcon className="w-4 h-4" />
                    {formatPercentage(metric.change)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
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
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue vs Expenses Trend
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {trendData.map((item, index) => {
              const revenueWidth = (item.revenue / maxValue) * 100;
              const expensesWidth = (item.expenses / maxValue) * 100;
              const profit = item.revenue - item.expenses;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.month}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600 font-medium">
                        {formatCurrency(item.revenue)}
                      </span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(item.expenses)}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
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
        </div>
      </Card>

      {/* Revenue Sources & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Revenue Sources
            </h3>

            <div className="space-y-4">
              {revenueSources.map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {source.source}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(source.amount)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full bg-${getCategoryColor(
                        index
                      )}-500 rounded-full transition-all`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {source.percentage}% of total revenue
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Expense Breakdown
            </h3>

            <div className="space-y-4">
              {expenseCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full bg-${getCategoryColor(
                        index
                      )}-500 rounded-full transition-all`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {category.percentage}% of total expenses
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Months & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Months */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Top Performing Months
              </h3>
            </div>

            <div className="space-y-3">
              {topMonths.map((month, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {month.month}
                      </p>
                      <p className="text-sm text-gray-500">
                        Revenue: {formatCurrency(month.revenue)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(month.profit)}
                    </p>
                    <p className="text-xs text-gray-500">Profit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Revenue Forecast */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Forecast (Next 3 Months)
              </h3>
            </div>

            <div className="space-y-4">
              {forecastData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.month}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.predicted)}
                      </span>
                      <Badge
                        color={
                          item.confidence > 80
                            ? 'green'
                            : item.confidence > 70
                            ? 'blue'
                            : 'yellow'
                        }
                      >
                        {item.confidence}% confident
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all"
                      style={{
                        width: `${(item.predicted / maxValue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>Note:</strong> Forecasts are based on historical trends
                and seasonal patterns. Actual results may vary.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Insights & Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    Strong Revenue Growth
                  </h4>
                  <p className="text-sm text-green-700">
                    Revenue increased by 12.5% compared to last period. Continue
                    focusing on your top revenue sources.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Improved Profit Margin
                  </h4>
                  <p className="text-sm text-blue-700">
                    Profit margin improved by 3.2%. Cost optimization strategies
                    are working well.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Watch Expenses
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Staff salary represents 46.7% of expenses. Consider
                    reviewing staffing efficiency.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">
                    Positive Outlook
                  </h4>
                  <p className="text-sm text-purple-700">
                    Forecast shows continued growth. Plan for increased capacity
                    in upcoming months.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;