import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ API & Services
import { financeService } from "../../api/index";

// ✅ Generic Components & Utils
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";
import formatCurrency from "../../utils/formatCurrency";

// ✅ Context
import { useToast } from "../../hooks/useToast"; // Updated hook path

const Analytics = () => {
  const { t } = useTranslation();
  const { apiError } = useToast(); // Use custom toast hook

  const [period, setPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState({
    summary: {},
    profitLoss: {},
    trends: [],
    expensesBreakdown: [],
    incomeBreakdown: [],
    cashflow: [],
  });

  const getDateRange = useCallback((selectedPeriod) => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
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
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  }, []);

  useEffect(() => {
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
          financeService.getTrends(dateRange),
          financeService.getExpensesBreakdown(dateRange),
          financeService.getIncomeBreakdown(dateRange),
          financeService.getCashflow(dateRange),
        ]);

        setAnalyticsData({
          summary: summaryRes || {},
          profitLoss: profitLossRes || {},
          trends: trendsRes?.trends || trendsRes?.data || [],
          expensesBreakdown: expensesRes?.breakdown || expensesRes?.data || [],
          incomeBreakdown: incomeRes?.breakdown || incomeRes?.data || [],
          cashflow: cashflowRes?.cashFlow || cashflowRes?.data || [],
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        apiError(error, t("analytics.errors.loadFailed"));
        setAnalyticsData({
          summary: {},
          profitLoss: {},
          trends: [],
          expensesBreakdown: [],
          incomeBreakdown: [],
          cashflow: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, getDateRange, apiError, t]);

  // Calculate key metrics
  const summary = analyticsData.summary || {};
  const totalIncome = summary.totalIncome || summary.income || 0;
  const totalExpenses = summary.totalExpenses || summary.expenses || 0;
  const netProfit = summary.netProfit || (totalIncome - totalExpenses);
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  const periodOptions = [
    { value: "week", label: t("analytics.period.week") },
    { value: "month", label: t("analytics.period.month") },
    { value: "quarter", label: t("analytics.period.quarter") },
    { value: "year", label: t("analytics.period.year") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <OrbitLoader />
      </div>
    );
  }

  // Handle trends data properly
  const trends = analyticsData.trends || [];
  const maxTrendValue = trends.length > 0
    ? Math.max(...trends.map((t) => Math.max(t.income || 0, t.expense || 0, t.revenue || 0)))
    : 1;

  // Calculate percentages for breakdowns
  const calculatePercentage = (items, key = "total") => {
    const total = items.reduce((sum, item) => sum + (item[key] || item.amount || 0), 0);
    return items.map((item) => ({
      ...item,
      percentage: total > 0 ? (((item[key] || item.amount || 0) / total) * 100).toFixed(1) : 0,
    }));
  };

  const incomeBreakdown = calculatePercentage(analyticsData.incomeBreakdown || []);
  const expensesBreakdown = calculatePercentage(analyticsData.expensesBreakdown || []);

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("analytics.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("analytics.description")}
          </p>
        </div>
        <div className="w-40">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={periodOptions}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label={t("analytics.metrics.totalRevenue")}
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          label={t("analytics.metrics.totalExpenses")}
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          label={t("analytics.metrics.netProfit")}
          value={formatCurrency(netProfit)}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          label={t("analytics.metrics.profitMargin")}
          value={`${profitMargin}%`}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Revenue vs Expenses Trend */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("analytics.trends.title")}
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {t("analytics.trends.revenue")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {t("analytics.trends.expenses")}
              </span>
            </div>
          </div>
        </div>

        {trends.length > 0 ? (
          <div className="space-y-4">
            {trends.slice(-6).map((item, index) => {
              const income = item.income || item.revenue || 0;
              const expense = item.expense || item.cost || 0;
              const net = item.net || income - expense;
              const periodLabel = item.period || item.month || `Period ${index + 1}`;

              const revenueWidth = maxTrendValue > 0 ? (income / maxTrendValue) * 100 : 0;
              const expensesWidth = maxTrendValue > 0 ? (expense / maxTrendValue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {periodLabel}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(income)}
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(expense)}
                      </span>
                      <span
                        className={`font-semibold ${
                          net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(net)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500 opacity-70 rounded-lg transition-all duration-300"
                      style={{ width: `${revenueWidth}%` }}
                    />
                    <div
                      className="absolute left-0 top-0 h-full bg-red-500 opacity-50 rounded-lg transition-all duration-300"
                      style={{ width: `${expensesWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("analytics.trends.noData")}
            </p>
          </div>
        )}
      </Card>

      {/* Revenue Sources & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("analytics.revenue.title")}
          </h3>

          {incomeBreakdown.length > 0 ? (
            <div className="space-y-4">
              {incomeBreakdown.map((source, index) => {
                const category = source.category || source._id || "Other";
                const amount = source.total || source.amount || source.totalAmount || 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {category.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("analytics.revenue.percentage", { percentage: source.percentage })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("analytics.revenue.noData")}
              </p>
            </div>
          )}
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("analytics.expenses.title")}
          </h3>

          {expensesBreakdown.length > 0 ? (
            <div className="space-y-4">
              {expensesBreakdown.map((category, index) => {
                const categoryName = category.category || category._id || "Other";
                const amount = category.total || category.amount || category.totalAmount || 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {categoryName.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("analytics.expenses.percentage", { percentage: category.percentage })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("analytics.expenses.noData")}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Profit & Loss Statement */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t("analytics.profitLoss.title")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("analytics.profitLoss.totalRevenue")}
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("analytics.profitLoss.totalExpenses")}
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("analytics.profitLoss.netProfit")}
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(netProfit)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t("analytics.profitLoss.margin", { percentage: profitMargin })}
            </p>
          </div>
        </div>
      </Card>

      {/* Cash Flow Summary */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("analytics.cashFlow.title")}
          </h3>
        </div>

        {analyticsData.cashflow.length > 0 ? (
          <div className="space-y-3">
            {analyticsData.cashflow.slice(-6).map((period, index) => {
              const income = period.income || period.inflow || 0;
              const expense = period.expense || period.outflow || 0;
              const net = period.net || period.netCashFlow || income - expense;
              const periodLabel = period.period || period.month || `Period ${index + 1}`;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {periodLabel}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        {t("analytics.cashFlow.in")}: {formatCurrency(income)}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        {t("analytics.cashFlow.out")}: {formatCurrency(expense)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        net >= 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(net)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("analytics.cashFlow.noData")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Sub-components ---

const MetricCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
    </Card>
  );
};

export default Analytics;