import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileText,
  Building,
  Target,
  Clock,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// API & Services
import { financeService, paymentService } from "../../api/index";
import { useToast } from "../../context/ToastContext";

// Components
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";
import formatCurrency from "../../utils/formatCurrency";

const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

const Finance = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useToast();

  const [period, setPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  const [financialData, setFinancialData] = useState({
    summary: {},
    cashflow: [],
    currentBalance: 0,
    expensesBreakdown: [],
    incomeBreakdown: [],
    trends: [],
    recentTransactions: [],
    upcomingPayments: [],
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
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
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
          financeService.getCashFlowReport(dateRange),
          financeService.getExpenseBreakdown(dateRange),
          financeService.getIncomeBreakdown(dateRange),
          financeService.getFinancialTrends({
            months: period === "year" ? 12 : 6,
          }),
          financeService.getFinanceRecords({
            ...dateRange,
            limit: 10,
            sortBy: "date",
            order: "desc",
          }),
          paymentService.getPayments({ status: "pending", limit: 6 }),
        ]);

        setFinancialData({
          summary: summaryRes.summary || {},
          cashflow: cashflowRes.cashFlow || [],
          currentBalance: cashflowRes.currentBalance || 0,
          expensesBreakdown: expensesRes.breakdown || [],
          incomeBreakdown: incomeRes.breakdown || [],
          trends: trendsRes.trends || [],
          recentTransactions: transactionsRes.records || [],
          upcomingPayments: paymentsRes.payments || [],
        });
      } catch (error) {
        console.error(error);
        showError(t("finance.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [period, getDateRange, t, showError]);

  // Chart Data Preparation
  const expenseChartData = useMemo(() => {
    return financialData.expensesBreakdown
      .map((item) => ({
        name: item.category.replace(/_/g, " "),
        value: item.totalAmount,
      }))
      .filter((i) => i.value > 0);
  }, [financialData.expensesBreakdown]);

  const trendChartData = useMemo(() => {
    return financialData.trends.map((t) => ({
      name: t.month,
      Income: t.income,
      Expense: t.expense,
    }));
  }, [financialData.trends]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("finance.dashboard")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("finance.overview")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: "week", label: t("finance.period.week") },
                { value: "month", label: t("finance.period.month") },
                { value: "quarter", label: t("finance.period.quarter") },
                { value: "year", label: t("finance.period.year") },
              ]}
            />
          </div>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => navigate("/finance/reports")}
          >
            {t("finance.buttons.reports")}
          </Button>
        </div>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label={t("finance.metrics.totalRevenue")}
          value={financialData.summary.totalIncome}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          label={t("finance.metrics.totalExpenses")}
          value={financialData.summary.totalExpense}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          label={t("finance.metrics.netProfit")}
          value={financialData.summary.netProfit}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          label={t("finance.metrics.profitMargin")}
          value={`${financialData.summary.profitMargin || 0}%`}
          icon={Target}
          color="purple"
          isPercent
        />
      </div>

      {/* 2. Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">
            Financial Trends
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#1F2937",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInc)"
                />
                <Area
                  type="monotone"
                  dataKey="Expense"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Donut */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Expense Breakdown
          </h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={
                    expenseChartData.length > 0
                      ? expenseChartData
                      : [{ name: "No Data", value: 1 }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Recent Transactions List */}
      <Card title={t("finance.recentTransactions.title")}>
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
          {financialData.recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions found for this period.
            </div>
          ) : (
            financialData.recentTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {isIncome ? (
                        <TrendingUp size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tx.description || "Transaction"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {tx.category?.replace(/_/g, " ") || "General"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 4. Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickActionCard
          icon={Wallet}
          title={t("finance.quickActions.transactions.title")}
          description={t("finance.quickActions.transactions.description")}
          onClick={() => navigate("/finance/transactions")}
          color="blue"
        />
        <QuickActionCard
          icon={BarChart3}
          title={t("finance.quickActions.analytics.title")}
          description={t("finance.quickActions.analytics.description")}
          onClick={() => navigate("/finance/analytics")}
          color="purple"
        />
        <QuickActionCard
          icon={FileText}
          title={t("finance.quickActions.reports.title")}
          description={t("finance.quickActions.reports.description")}
          onClick={() => navigate("/finance/reports")}
          color="green"
        />
        <QuickActionCard
          icon={PieChart}
          title={t("finance.quickActions.profitability.title")}
          description={t("finance.quickActions.profitability.description")}
          onClick={() => navigate("/finance/profitability")}
          color="yellow"
        />
      </div>
    </div>
  );
};

// --- Sub Components ---

const MetricCard = ({ label, value, icon: Icon, color, isPercent }) => {
  const bgColors = {
    green: "bg-green-50 text-green-600 dark:bg-green-900/20",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
  };
  return (
    <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${bgColors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isPercent ? value : formatCurrency(value || 0)}
        </h3>
      </div>
    </Card>
  );
};

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  color,
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
  };
  return (
    <div onClick={onClick} className="cursor-pointer group">
      <Card className="h-full p-5 hover:border-orange-200 transition-all group-hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-lg ${colorClasses[color]} dark:bg-opacity-10`}
          >
            <Icon size={20} />
          </div>
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-xs text-gray-500">{description}</p>
      </Card>
    </div>
  );
};

export default Finance;
