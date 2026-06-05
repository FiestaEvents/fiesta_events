import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// API
import { eventService, invoiceService, financeService } from "../../api/index";

// Components
import OrbitLoader from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";

// Colors for Pie Chart
const COLORS = ["#F97316", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6"];

const ServiceDashboard = ({ type }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Data State
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [financialTrends, setFinancialTrends] = useState([]);
  const [eventStats, setEventStats] = useState([]);
  const [invoiceMetrics, setInvoiceMetrics] = useState({
    totalRevenue: 0,
    paid: 0,
    totalDue: 0,
    overdue: 0,
  });

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date().toISOString();

        // Parallel Fetching
        const [jobsRes, trendsRes, eventStatsRes, invStatsRes] =
          await Promise.all([
            // 1. Upcoming Jobs (Next 5)
            eventService.getAll({
              limit: 5,
              sort: "startDate",
              startDate: today, // Only future events
              status: "confirmed", // Optional: filter by confirmed
            }),

            // 2. Financial Trends (Last 6 Months)
            financeService.getFinancialTrends({ months: 6 }),

            // 3. Event Distribution Stats
            eventService.getEventStats(),

            // 4. Invoice/Revenue Metrics
            invoiceService.getStats(),
          ]);

        // Set State
        setUpcomingJobs(jobsRes.data?.events || jobsRes.events || []);
        setFinancialTrends(trendsRes.data?.trends || trendsRes.trends || []);
        setEventStats(
          eventStatsRes.data?.statusStats || eventStatsRes.statusStats || []
        );

        const iStats = invStatsRes.data?.stats || invStatsRes.stats || {};
        // If invoiceService returns an array (by type), fallback to object or find specific type
        const metrics = Array.isArray(iStats) ? iStats[0] : iStats;

        setInvoiceMetrics({
          totalRevenue: metrics?.totalRevenue || 0,
          paid: metrics?.paid || 0,
          totalDue: metrics?.totalDue || 0,
          overdue: metrics?.overdue || 0,
        });
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- DATA TRANSFORMERS ---

  // 1. Transform Trends for Area Chart
  const chartData = useMemo(() => {
    if (!financialTrends.length) return [];

    return financialTrends.map((item) => {
      // Convert "YYYY-MM" to Short Month Name (e.g. "Jan")
      const date = new Date(item.month + "-01");
      const monthName = date.toLocaleDateString(i18n.language, {
        month: "short",
      });
      return {
        name: monthName,
        income: item.income || 0,
        expense: item.expense || 0,
      };
    });
  }, [financialTrends, i18n.language]);

  // 2. Transform Event Stats for Pie Chart
  const pieData = useMemo(() => {
    if (!eventStats.length) return [{ name: "No Data", value: 1 }];

    return eventStats.map((stat) => ({
      name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1), // Capitalize
      value: stat.count,
    }));
  }, [eventStats]);

  // 3. Helper for currency
  const formatCurrency = (val) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "TND",
      maximumSignificantDigits: 3,
    }).format(val);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {type === "visual" ? "Creative Studio" : "Service Dashboard"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of your performance and upcoming schedule
          </p>
        </div>
        <div className="hidden md:block">
          <span className="text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border dark:border-gray-700">
            📅{" "}
            {new Date().toLocaleDateString(i18n.language, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* 1. Metrics Cards (Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Upcoming Jobs"
          value={upcomingJobs.length}
          icon={Briefcase}
          color="blue"
          trend="Next 30 Days"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(invoiceMetrics.totalRevenue)}
          icon={DollarSign}
          color="green"
          trend="Lifetime"
        />
        <MetricCard
          title="Pending Payments"
          value={formatCurrency(invoiceMetrics.totalDue)}
          icon={Activity}
          color="orange"
          trend={`${invoiceMetrics.overdue} Overdue`}
          trendColor="text-red-500"
        />
        <MetricCard
          title="Collected"
          value={formatCurrency(invoiceMetrics.paid)}
          icon={TrendingUp}
          color="purple"
          trend="Paid Invoices"
        />
      </div>

      {/* 2. Charts Section (Real Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (Area) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Revenue Trend (6 Months)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
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
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value) => [`${value} TND`, "Amount"]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#F97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Income"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Status Chart (Donut) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Job Status
          </h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text (Total Jobs) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {eventStats.reduce((acc, curr) => acc + curr.count, 0)}
              </span>
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Jobs List (Real Data) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Upcoming Schedule
            </h3>
          </div>

          <div className="space-y-4">
            {upcomingJobs.length > 0 ? (
              upcomingJobs.map((job) => (
                <div
                  key={job._id}
                  className="group flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-3 rounded-xl group-hover:bg-white transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">
                        {job.title}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>
                          {new Date(job.startDate).toLocaleDateString()}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{job.clientId?.name || "Client"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {job.pricing?.totalPriceAfterTax || 0} TND
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold mt-1 ${
                        job.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No upcoming jobs found.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
            <h3 className="font-bold text-lg mb-1">Quick Actions</h3>
            <p className="text-white/80 text-sm mb-6">
              Manage your workflow efficiently
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center justify-center transition-all">
                <FileText className="mb-2" size={20} />
                <span className="text-xs font-semibold">New Quote</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center justify-center transition-all">
                <DollarSign className="mb-2" size={20} />
                <span className="text-xs font-semibold">Add Expense</span>
              </button>
              <button className="col-span-2 bg-white text-orange-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <ArrowUpRight size={16} /> Create New Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent: Metric Card
const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendColor = "text-green-500",
}) => {
  const bgColors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    orange:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColors[color]}`}>
          <Icon size={22} />
        </div>
        <span
          className={`text-xs font-bold ${trendColor} bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full`}
        >
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default ServiceDashboard;
