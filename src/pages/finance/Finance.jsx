import { useState, useEffect, useCallback } from "react";
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

// ✅ API & Services
import { financeService, paymentService } from "../../api/index";

// ✅ Generic Components & Utils
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";
import formatCurrency from "../../utils/formatCurrency";

// ✅ Context
import { useToast } from "../../hooks/useToast"; // Updated hook path

const Finance = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { apiError } = useToast(); // Use custom toast

  const [period, setPeriod] = useState("month");
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

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

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
          financeService.getTrends({ months: period === "year" ? 12 : 6 }),
          financeService.getAll({
            ...dateRange,
            limit: 10,
            sortBy: "date",
            order: "desc",
          }),
          paymentService.getAll({ status: "pending", limit: 10 }),
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
        apiError(error, t("finance.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFinancialData();
  }, [period, getDateRange, apiError, t]);

  const getDaysUntil = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate event vs venue expenses
  const calculateExpenseBreakdown = () => {
    const expenses = financialData.expensesBreakdown || [];

    const eventExpenses = expenses
      .filter((exp) => ["partner_payment"].includes(exp.category))
      .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

    const venueExpenses = expenses
      .filter(
        (exp) => !["partner_payment", "event_revenue"].includes(exp.category)
      )
      .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

    return { eventExpenses, venueExpenses };
  };

  const { eventExpenses, venueExpenses } = calculateExpenseBreakdown();

  // Period Options for Select Component
  const periodOptions = [
    { value: "week", label: t("finance.period.week") },
    { value: "month", label: t("finance.period.month") },
    { value: "quarter", label: t("finance.period.quarter") },
    { value: "year", label: t("finance.period.year") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const summary = financialData.summary || {};

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("finance.dashboard")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("finance.overview")}
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
            variant="primary"
            icon={FileText}
            onClick={() => navigate("/finance/reports")}
          >
            {t("finance.buttons.reports")}
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label={t("finance.metrics.totalRevenue")}
          value={formatCurrency(summary.totalIncome || 0)}
          icon={TrendingUp}
          color="green"
          description={t("finance.metrics.allIncomeSources")}
        />
        <MetricCard
          label={t("finance.metrics.totalExpenses")}
          value={formatCurrency(summary.totalExpense || 0)}
          icon={TrendingDown}
          color="red"
          description={t("finance.metrics.eventVenueCosts")}
        />
        <MetricCard
          label={t("finance.metrics.netProfit")}
          value={formatCurrency(summary.netProfit || 0)}
          icon={DollarSign}
          color="blue"
          description={t("finance.metrics.afterAllExpenses")}
        />
        <MetricCard
          label={t("finance.metrics.profitMargin")}
          value={`${summary.profitMargin || 0}%`}
          icon={Target}
          color="purple"
          description={t("finance.metrics.overallProfitability")}
        />
      </div>

      {/* Event & Venue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Financials */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("finance.eventFinancials.title")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("finance.eventFinancials.description")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <FinancialRow 
              label={t("finance.eventFinancials.eventRevenue")}
              amount={(financialData.incomeBreakdown || []).find(inc => inc.category === "event_revenue")?.totalAmount || 0}
              color="green"
            />
            <FinancialRow 
              label={t("finance.eventFinancials.partnerCosts")}
              amount={eventExpenses}
              color="red"
            />

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("finance.eventFinancials.eventProfit")}
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(
                    ((financialData.incomeBreakdown || []).find(inc => inc.category === "event_revenue")?.totalAmount || 0) - eventExpenses
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Venue Operating Expenses */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Building className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("finance.venueExpenses.title")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("finance.venueExpenses.description")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(financialData.expensesBreakdown || [])
              .filter(exp => !["partner_payment", "event_revenue"].includes(exp.category))
              .slice(0, 5)
              .map((expense, index) => {
                const percentage = venueExpenses > 0 ? ((expense.totalAmount || 0) / venueExpenses) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {expense.category.replace(/_/g, " ")}
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
                  </div>
                );
              })}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("finance.venueExpenses.totalVenueExpenses")}
                </span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(venueExpenses)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cash Flow & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("finance.cashFlow.title")}
            </h3>
          </div>

          {financialData.cashflow && financialData.cashflow.length > 0 ? (
            <div className="space-y-3">
              {financialData.cashflow.slice(-3).map((period, index) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {period.period}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t("finance.cashFlow.net")}
                    </span>
                    <span className={`text-sm font-bold ${period.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(period.net)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("finance.cashFlow.currentBalance")}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(financialData.currentBalance || 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t("finance.cashFlow.noData")}</p>
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4 ">
              <h3 className="text-lg font-semibold text-gray-900  dark:text-gray-100">
                {t("finance.recentTransactions.title")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="dark:text-gray-600"
                onClick={() => navigate("/finance/transactions")}
              >
                {t("finance.recentTransactions.viewAll")}
              </Button>
            </div>

            {financialData.recentTransactions?.length > 0 ? (
              <div className="space-y-2">
                {financialData.recentTransactions.slice(0, 5).map((transaction) => {
                  const isIncome = transaction.type === "income";
                  return (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 ">
                        <div className={`p-2 rounded-lg ${isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900  dark:text-gray-100">
                            {transaction.description || t("finance.recentTransactions.transaction")}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {(transaction.category || "other").replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t("finance.recentTransactions.noData")}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Upcoming Payments */}
      {financialData.upcomingPayments?.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("finance.upcomingPayments.title")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/payments")}
            >
              {t("finance.upcomingPayments.viewAll")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialData.upcomingPayments.slice(0, 6).map((payment) => {
              const daysUntil = getDaysUntil(payment.dueDate);
              const isUrgent = daysUntil <= 3;

              let dueText = "";
              if (daysUntil === 0) dueText = t("finance.upcomingPayments.dueToday");
              else if (daysUntil === 1) dueText = t("finance.upcomingPayments.dueTomorrow");
              else dueText = t("finance.upcomingPayments.dueInDays", { days: daysUntil });

              return (
                <div key={payment._id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {payment.description || t("finance.upcomingPayments.payment")}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className={`w-3 h-3 ${isUrgent ? "text-red-500" : "text-gray-400"}`} />
                        <span className={`text-xs ${isUrgent ? "text-red-500 font-medium" : "text-gray-500"}`}>
                          {dueText}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
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

// --- Sub-components ---

const MetricCard = ({ label, value, icon: Icon, color, description }) => {
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
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
    </Card>
  );
};

const FinancialRow = ({ label, amount, color }) => {
  const bgColors = {
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${bgColors[color]}`}>
      <span className="text-sm font-medium opacity-80">{label}</span>
      <span className="text-base font-bold">{formatCurrency(amount)}</span>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, onClick, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div onClick={onClick} className="cursor-pointer transition-transform hover:-translate-y-1">
      <Card className="h-full hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg dark:bg-opacity-20 ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Finance;