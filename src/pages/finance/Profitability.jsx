import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  FileText,
  Activity,
  Calculator,
} from "lucide-react";

//  API & Services
import { financeService } from "../../api/index";

//  Generic Components
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";
import formatCurrency from "../../utils/formatCurrency";

//  Context
import { useToast } from "../../hooks/useToast";

const Profitability = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { apiError } = useToast();

  const [period, setPeriod] = useState("year"); // Default to year for profitability
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState({
    profitLoss: null,
    trends: [],
    incomeBreakdown: [],
    expensesBreakdown: [],
    tax: null,
  });

  //  Helper: Date Range (Same as Finance Page)
  const getDateRange = useCallback((selectedPeriod) => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
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
        startDate.setFullYear(now.getFullYear() - 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dateRange = getDateRange(period);

        const [plRes, trendsRes, incRes, expRes, taxRes] = await Promise.all([
          financeService.getProfitLoss(dateRange),
          financeService.getTrends({ months: period === "year" ? 12 : 6 }),
          financeService.getIncomeBreakdown(dateRange),
          financeService.getExpensesBreakdown(dateRange),
          financeService.getTaxSummary(dateRange),
        ]);

        setData({
          profitLoss: plRes || {},
          trends: trendsRes.trends || [],
          incomeBreakdown: incRes.breakdown || [],
          expensesBreakdown: expRes.breakdown || [],
          tax: taxRes || {},
        });
      } catch (error) {
        apiError(error, t("finance.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, getDateRange, apiError, t]);

  // Options
  const periodOptions = [
    { value: "month", label: t("finance.period.month") },
    { value: "quarter", label: t("finance.period.quarter") },
    { value: "year", label: t("finance.period.year") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <OrbitLoader />
      </div>
    );
  }

  const { profitLoss, tax, trends } = data;
  const revenue = profitLoss?.revenue || 0;
  const expenses = profitLoss?.expenses || 0;
  const netProfit = profitLoss?.profitability || revenue - expenses;
  const profitMargin =
    revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("finance.profitability.title") || "Profitability Analysis"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("finance.profitability.subtitle") ||
              "Track your margins and net income"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={periodOptions}
            />
          </div>
          <Button
            variant="outline"
            icon={FileText}
            onClick={() => window.print()} // Simple print for report
          >
            {t("common.export") || "Export"}
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label={t("finance.metrics.netProfit")}
          value={formatCurrency(netProfit)}
          icon={DollarSign}
          color={netProfit >= 0 ? "blue" : "red"}
          trend={netProfit >= 0 ? "up" : "down"}
          description={
            t("finance.profitability.netIncomeDesc") || "Net earnings"
          }
        />
        <MetricCard
          label={t("finance.metrics.profitMargin")}
          value={`${profitMargin}%`}
          icon={Percent}
          color={parseFloat(profitMargin) > 20 ? "green" : "yellow"}
          description={
            t("finance.profitability.marginDesc") || "Efficiency ratio"
          }
        />
        <MetricCard
          label={t("finance.metrics.totalRevenue")}
          value={formatCurrency(revenue)}
          icon={TrendingUp}
          color="green"
          description={t("finance.profitability.revenueDesc") || "Gross income"}
        />
        <MetricCard
          label={t("finance.metrics.totalExpenses")}
          value={formatCurrency(expenses)}
          icon={TrendingDown}
          color="red"
          description={t("finance.profitability.expensesDesc") || "Total costs"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit & Loss Statement - Takes up 1 column */}
        <Card className="lg:col-span-1 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("finance.profitability.plStatement") || "P&L Statement"}
              </h3>
            </div>
          </div>

          <div className="space-y-1">
            {/* Revenue */}
            <PLRow
              label={t("finance.metrics.grossRevenue") || "Gross Revenue"}
              amount={revenue}
              type="positive"
              bold
            />

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />

            {/* Expenses Breakdown (Simulated top 3 categories) */}
            {data.expensesBreakdown.slice(0, 3).map((exp, idx) => (
              <PLRow
                key={idx}
                label={exp.category.replace(/_/g, " ")}
                amount={-Math.abs(exp.totalAmount)}
                type="negative"
                indent
              />
            ))}
            <PLRow
              label={t("finance.metrics.otherExpenses") || "Other Expenses"}
              amount={
                -(
                  expenses -
                  data.expensesBreakdown
                    .slice(0, 3)
                    .reduce((acc, curr) => acc + curr.totalAmount, 0)
                )
              }
              type="negative"
              indent
            />

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />

            <PLRow
              label={t("finance.metrics.ebit") || "Operating Profit (EBIT)"}
              amount={revenue - expenses}
              type="neutral"
              bold
            />

            {/* Tax */}
            <PLRow
              label={t("finance.metrics.tax") || "Estimated Tax"}
              amount={-(tax?.totalTaxPaid || 0)}
              type="negative"
            />

            {/* Final Net Profit */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("finance.metrics.netIncome") || "Net Income"}
                </span>
                <span
                  className={`text-xl font-bold ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {formatCurrency(netProfit - (tax?.totalTaxPaid || 0))}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Trends Chart - Takes up 2 columns */}
        <Card className="lg:col-span-2 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("finance.profitability.trendsTitle") ||
                  "Profitability Trends"}
              </h3>
              <p className="text-sm text-gray-500">
                {t("finance.profitability.trendsDesc") ||
                  "Income vs Expenses over time"}
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 min-h-[250px] pb-6">
            {trends.length > 0 ? (
              <SimpleBarChart data={trends} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BreakdownCard
          title={t("finance.profitability.revenueSources") || "Revenue Sources"}
          icon={TrendingUp}
          color="green"
          data={data.incomeBreakdown}
          total={revenue}
        />
        <BreakdownCard
          title={
            t("finance.profitability.expenseDistribution") ||
            "Expense Distribution"
          }
          icon={TrendingDown}
          color="red"
          data={data.expensesBreakdown}
          total={expenses}
        />
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const MetricCard = ({
  label,
  value,
  icon: Icon,
  color,
  description,
  trend,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    yellow:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {trend === "up" ? "Positive" : "Negative"}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {description}
      </p>
    </Card>
  );
};

const PLRow = ({ label, amount, type, bold, indent }) => {
  const getTextColor = () => {
    if (type === "positive") return "text-green-600 dark:text-green-400";
    if (type === "negative") return "text-red-600 dark:text-red-400";
    return "text-gray-900 dark:text-white";
  };

  return (
    <div
      className={`flex justify-between items-center py-1.5 ${indent ? "pl-4" : ""}`}
    >
      <span
        className={`text-sm ${bold ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"} capitalize`}
      >
        {label}
      </span>
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {amount < 0 ? "-" : ""}
        {formatCurrency(Math.abs(amount))}
      </span>
    </div>
  );
};

const BreakdownCard = ({ title, icon: Icon, color, data, total }) => {
  const bgColors = {
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };
  const barColors = {
    green: "bg-green-500",
    red: "bg-red-500",
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${bgColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-5">
        {data.slice(0, 5).map((item, idx) => {
          const percent = total > 0 ? (item.totalAmount / total) * 100 : 0;
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                  {item.category.replace(/_/g, " ")}
                </span>
                <span className="text-gray-900 dark:text-white font-bold">
                  {formatCurrency(item.totalAmount)}{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    ({percent.toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${barColors[color]}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            No data available
          </div>
        )}
      </div>
    </Card>
  );
};

// A custom Bar chart using CSS Flexbox to avoid Recharts dependency
const SimpleBarChart = ({ data }) => {
  // Find max value for scaling
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2">
        {data.map((item, idx) => {
          const incHeight = (item.income / maxVal) * 100;
          const expHeight = (item.expense / maxVal) * 100;

          return (
            <div
              key={idx}
              className="flex flex-col items-center flex-1 group relative"
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 text-white text-xs p-2 rounded z-10 transition-opacity whitespace-nowrap pointer-events-none">
                In: {formatCurrency(item.income)} <br /> Out:{" "}
                {formatCurrency(item.expense)}
              </div>

              <div className="w-full flex gap-1 justify-center items-end h-[200px]">
                {/* Income Bar */}
                <div
                  style={{ height: `${incHeight}%` }}
                  className="w-3 sm:w-6 bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-400"
                />
                {/* Expense Bar */}
                <div
                  style={{ height: `${expHeight}%` }}
                  className="w-3 sm:w-6 bg-red-500 rounded-t-sm transition-all duration-500 hover:bg-red-400"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                {item.month || item.period}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <span className="w-3 h-3 bg-green-500 rounded-sm mr-2" /> Income
        </div>
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <span className="w-3 h-3 bg-red-500 rounded-sm mr-2" /> Expenses
        </div>
      </div>
    </div>
  );
};

export default Profitability;
