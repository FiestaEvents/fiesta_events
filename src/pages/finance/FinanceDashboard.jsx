import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  Building,
} from 'lucide-react';

// Mock data - replace with actual API calls
const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  
  const [financialData, setFinancialData] = useState({
    summary: {
      totalRevenue: 125000,
      totalExpenses: 87500,
      netProfit: 37500,
      profitMargin: 30,
      revenueChange: 12.5,
      expenseChange: 8.2,
      profitChange: 18.7,
    },
    eventFinancials: {
      totalEvents: 24,
      confirmedEvents: 18,
      completedEvents: 15,
      avgRevenuePerEvent: 5208,
      totalEventRevenue: 78125,
      totalEventExpenses: 45500,
      avgProfitPerEvent: 2175,
    },
    venueExpenses: {
      total: 42000,
      utilities: 8500,
      maintenance: 6200,
      marketing: 4800,
      staffSalary: 18000,
      insurance: 2500,
      other: 2000,
    },
    cashFlow: {
      totalInflow: 125000,
      totalOutflow: 87500,
      netCashFlow: 37500,
      cashOnHand: 156000,
    },
    upcomingPayments: [
      { id: 1, description: 'Event Deposit - Johnson Wedding', amount: 2500, dueDate: '2025-11-08', type: 'income' },
      { id: 2, description: 'Partner Payment - Catering Co', amount: 1800, dueDate: '2025-11-10', type: 'expense' },
      { id: 3, description: 'Event Balance - Tech Corp Conference', amount: 4200, dueDate: '2025-11-12', type: 'income' },
      { id: 4, description: 'Utilities Bill', amount: 850, dueDate: '2025-11-15', type: 'expense' },
    ],
    recentTransactions: [
      { id: 1, description: 'Birthday Party - Smith', type: 'income', amount: 3500, date: '2025-11-01', category: 'event_revenue' },
      { id: 2, description: 'DJ Services', type: 'expense', amount: 800, date: '2025-11-01', category: 'partner_payment' },
      { id: 3, description: 'Marketing Campaign', type: 'expense', amount: 1200, date: '2025-11-02', category: 'marketing' },
      { id: 4, description: 'Corporate Event Deposit', type: 'income', amount: 5000, date: '2025-11-03', category: 'event_revenue' },
      { id: 5, description: 'Maintenance Repairs', type: 'expense', amount: 450, date: '2025-11-03', category: 'maintenance' },
    ],
    topPerformingEvents: [
      { id: 1, title: 'Tech Summit 2024', revenue: 12500, profit: 6800, profitMargin: 54.4 },
      { id: 2, title: 'Johnson-Smith Wedding', revenue: 8500, profit: 4200, profitMargin: 49.4 },
      { id: 3, title: 'Annual Gala Dinner', revenue: 9200, profit: 3900, profitMargin: 42.4 },
    ],
    budgetTracking: {
      monthly: { budget: 100000, spent: 87500, remaining: 12500, percentage: 87.5 },
      eventBudgets: { allocated: 60000, spent: 45500, remaining: 14500, percentage: 75.8 },
      venueBudgets: { allocated: 40000, spent: 42000, remaining: -2000, percentage: 105 },
    },
  });

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

  const getDaysUntil = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Main metrics
  const mainMetrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(financialData.summary.totalRevenue),
      change: financialData.summary.revenueChange,
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'All income sources',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(financialData.summary.totalExpenses),
      change: financialData.summary.expenseChange,
      icon: TrendingDown,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      description: 'Event + Venue costs',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(financialData.summary.netProfit),
      change: financialData.summary.profitChange,
      icon: DollarSign,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'After all expenses',
    },
    {
      label: 'Profit Margin',
      value: `${financialData.summary.profitMargin}%`,
      change: financialData.summary.profitChange,
      icon: Target,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Overall profitability',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete overview of your venue's financial performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              onClick={() => setIsLoading(!isLoading)}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              onClick={() => navigate('/finance/reports')}
            >
              <FileText className="w-4 h-4" />
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  <ChangeIcon className="w-4 h-4" />
                  {formatPercentage(metric.change)}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Event & Venue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Event Financials */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {financialData.eventFinancials.totalEvents}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Event Revenue</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(financialData.eventFinancials.totalEventRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Event Expenses</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(financialData.eventFinancials.totalEventExpenses)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Profit/Event</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(financialData.eventFinancials.avgProfitPerEvent)}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Event Profit</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(
                    financialData.eventFinancials.totalEventRevenue - 
                    financialData.eventFinancials.totalEventExpenses
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Operating Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
            {[
              { label: 'Staff Salaries', amount: financialData.venueExpenses.staffSalary, color: 'blue' },
              { label: 'Utilities', amount: financialData.venueExpenses.utilities, color: 'green' },
              { label: 'Maintenance', amount: financialData.venueExpenses.maintenance, color: 'yellow' },
              { label: 'Marketing', amount: financialData.venueExpenses.marketing, color: 'purple' },
              { label: 'Insurance', amount: financialData.venueExpenses.insurance, color: 'pink' },
              { label: 'Other', amount: financialData.venueExpenses.other, color: 'gray' },
            ].map((expense, index) => {
              const percentage = (expense.amount / financialData.venueExpenses.total) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{expense.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-900/50 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full bg-${expense.color}-500 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {percentage.toFixed(1)}% of venue expenses
                  </span>
                </div>
              );
            })}

            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Total Venue Expenses</span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(financialData.venueExpenses.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cash Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cash Flow
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cash Inflow</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(financialData.cashFlow.totalInflow)}
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cash Outflow</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(financialData.cashFlow.totalOutflow)}
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Cash Flow</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(financialData.cashFlow.netCashFlow)}
              </p>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cash on Hand</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(financialData.cashFlow.cashOnHand)}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Tracking */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Budget Tracking
            </h3>
          </div>

          <div className="space-y-4">
            {/* Monthly Budget */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Budget
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(financialData.budgetTracking.monthly.spent)} / {formatCurrency(financialData.budgetTracking.monthly.budget)}
                  </span>
                  <span className={`text-sm font-semibold ${
                    financialData.budgetTracking.monthly.percentage > 90 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {financialData.budgetTracking.monthly.percentage}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 dark:bg-gray-900/50 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                    financialData.budgetTracking.monthly.percentage > 90 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(financialData.budgetTracking.monthly.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatCurrency(financialData.budgetTracking.monthly.remaining)} remaining
              </p>
            </div>

            {/* Event Budgets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Event Budgets
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(financialData.budgetTracking.eventBudgets.spent)} / {formatCurrency(financialData.budgetTracking.eventBudgets.allocated)}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {financialData.budgetTracking.eventBudgets.percentage}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 dark:bg-gray-900/50 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(financialData.budgetTracking.eventBudgets.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatCurrency(financialData.budgetTracking.eventBudgets.remaining)} available
              </p>
            </div>

            {/* Venue Budgets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Venue Operating Budget
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(financialData.budgetTracking.venueBudgets.spent)} / {formatCurrency(financialData.budgetTracking.venueBudgets.allocated)}
                  </span>
                  <span className={`text-sm font-semibold ${
                    financialData.budgetTracking.venueBudgets.percentage > 100 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {financialData.budgetTracking.venueBudgets.percentage}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 dark:bg-gray-900/50 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                    financialData.budgetTracking.venueBudgets.percentage > 100 
                      ? 'bg-red-500' 
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(financialData.budgetTracking.venueBudgets.percentage, 100)}%` }}
                />
              </div>
              <p className={`text-xs mt-1 ${
                financialData.budgetTracking.venueBudgets.remaining < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-500'
              }`}>
                {financialData.budgetTracking.venueBudgets.remaining < 0 ? 'Over budget by ' : ''}
                {formatCurrency(Math.abs(financialData.budgetTracking.venueBudgets.remaining))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Payments
            </h3>
            <button 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => navigate('/payments')}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {financialData.upcomingPayments.map((payment) => {
              const daysUntil = getDaysUntil(payment.dueDate);
              const isUrgent = daysUntil <= 3;
              const isIncome = payment.type === 'income';

              return (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isIncome 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {isIncome ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className={`text-xs ${
                          isUrgent 
                            ? 'text-red-600 dark:text-red-400 font-medium' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `Due in ${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      isIncome 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Events
            </h3>
            <button 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => navigate('/events')}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {financialData.topPerformingEvents.map((event, index) => (
              <div key={event.id} className="p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white flex-1">
                    {event.title}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 ml-11">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Revenue</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(event.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Profit</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(event.profit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Margin</p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {event.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;