import { useState, useEffect } from "react";
import { financeService } from "../../api/index";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  RefreshCw,
  Target,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Analytics = () => {
  const [period, setPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState({
    summary: null,
    profitLoss: null,
    trends: null,
    expensesBreakdown: null,
    incomeBreakdown: null,
    cashflow: null,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      const dateRange = getDateRange(period);

      const [
        summaryRes,
        profitLossRes,
        trendsRes,
        expensesRes,
        incomeRes,
        cashflowRes,
      ] = await Promise.all([
        financeService.getSummary(dateRange),
        financeService.getProfitLoss(dateRange),
        financeService.getTrends({ months: 12 }),
        financeService.getExpensesBreakdown(dateRange),
        financeService.getIncomeBreakdown(dateRange),
        financeService.getCashflow({ ...dateRange, groupBy: "month" }),
      ]);

      setAnalyticsData({
        summary: summaryRes.summary || {},
        profitLoss: profitLossRes || {},
        trends: trendsRes.trends || [],
        expensesBreakdown: expensesRes.breakdown || [],
        incomeBreakdown: incomeRes.breakdown || [],
        cashflow: cashflowRes.cashFlow || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
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
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate key metrics
  const summary = analyticsData.summary || {};
  const profitLoss = analyticsData.profitLoss || {};

  const keyMetrics = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totalIncome || 0),
      icon: TrendingUp,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(summary.totalExpense || 0),
      icon: TrendingDown,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Net Profit",
      value: formatCurrency(summary.netProfit || 0),
      icon: DollarSign,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Profit Margin",
      value: `${summary.profitMargin || 0}%`,
      icon: Target,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const trends = analyticsData.trends || [];
  const maxTrendValue =
    trends.length > 0
      ? Math.max(...trends.map((t) => Math.max(t.income, t.expense)))
      : 1;

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
          </Select>
          <Button variant="outline" icon={RefreshCw} onClick={fetchAnalytics}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <div key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue vs Expenses Trend */}
      <div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue vs Expenses Trend (Last 12 Months)
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Revenue
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Expenses
                </span>
              </div>
            </div>
          </div>

          {trends.length > 0 ? (
            <div className="space-y-4">
              {trends.slice(-6).map((item, index) => {
                const revenueWidth =
                  maxTrendValue > 0 ? (item.income / maxTrendValue) * 100 : 0;
                const expensesWidth =
                  maxTrendValue > 0 ? (item.expense / maxTrendValue) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.month}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(item.income)}
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {formatCurrency(item.expense)}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {formatCurrency(item.net)}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500 opacity-70 rounded-lg"
                        style={{ width: `${revenueWidth}%` }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-red-500 opacity-50 rounded-lg"
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
              <p className="text-gray-600 dark:text-gray-400">
                No trend data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Sources & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Revenue Sources
            </h3>

            {analyticsData.incomeBreakdown &&
            analyticsData.incomeBreakdown.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.incomeBreakdown.map((source, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {source.category.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(source.totalAmount || 0)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {source.percentage}% of total revenue
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No revenue data
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Expense Breakdown
            </h3>

            {analyticsData.expensesBreakdown &&
            analyticsData.expensesBreakdown.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.expensesBreakdown.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {category.category.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(category.totalAmount || 0)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-orange-500 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.percentage}% of total expenses
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No expense data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profit & Loss Statement */}
      <div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Profit & Loss Statement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Gross Profit
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(profitLoss.profitability?.grossProfit || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Margin: {profitLoss.profitability?.grossMargin || 0}%
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Operating Income
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(profitLoss.profitability?.operatingIncome || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Margin: {profitLoss.profitability?.operatingMargin || 0}%
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Net Income
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(profitLoss.profitability?.netIncome || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Margin: {profitLoss.profitability?.netMargin || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cash Flow Summary
            </h3>
          </div>

          {analyticsData.cashflow && analyticsData.cashflow.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.cashflow.slice(-6).map((period, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {period.period}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        In: {formatCurrency(period.income)}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        Out: {formatCurrency(period.expense)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        period.net >= 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(period.net)}
                    </p>
                    {period.growthRate && (
                      <p
                        className={`text-xs ${
                          period.growthRate >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {period.growthRate >= 0 ? "+" : ""}
                        {period.growthRate}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No cash flow data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
