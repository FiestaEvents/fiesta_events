import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { dashboardService, taskService, reminderService } from "../api/index";
import { formatCurrency } from "../utils/formatCurrency";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  PieChart,
  BarChart3,
  Star,
  Target,
  Activity,
  Zap,
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    revenue: 0,
    activeClients: 0,
    pendingPayments: 0,
    upcomingEvents: [],
    recentPayments: [],
    monthlyComparison: {
      events: { current: 0, previous: 0, change: 0 },
      revenue: { current: 0, previous: 0, change: 0 },
    },
    eventsByStatus: {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },
  });

  const [enhancedStats, setEnhancedStats] = useState({
    occupancyRate: 0,
    averageRating: 0,
    taskCompletion: 0,
    paymentCollection: 0,
    revenueTrend: [],
    eventTypeDistribution: [],
    performanceMetrics: {},
    recentActivity: [],
    teamPerformance: [],
  });
  
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [
        dashboardResponse, 
        tasksResponse, 
        remindersResponse,
        enhancedData
      ] = await Promise.all([
        dashboardService.getStats(),
        taskService.getMyTasks().catch(() => ({ tasks: [] })),
        reminderService.getUpcoming().catch(() => ({ reminders: [] })),
        fetchEnhancedData(),
      ]);

      console.log("📊 Dashboard Response:", dashboardResponse);
      console.log("🚀 Enhanced Data:", enhancedData);

      const dashboardData = dashboardResponse?.data || dashboardResponse || {};

      // Calculate monthly comparison
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      const currentMonthRevenue = dashboardData.summary?.revenueThisMonth || 0;
      const lastMonthRevenue = dashboardData.summary?.revenueLastMonth || 0;
      const revenueChange = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : 0;

      const currentMonthEvents = dashboardData.summary?.eventsThisMonth || 0;
      const lastMonthEvents = dashboardData.summary?.eventsLastMonth || 0;
      const eventsChange = lastMonthEvents > 0
        ? ((currentMonthEvents - lastMonthEvents) / lastMonthEvents * 100).toFixed(1)
        : 0;

      // Count events by status
      const eventsByStatus = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      (dashboardData.upcomingEvents || []).forEach(event => {
        const status = event.status?.toLowerCase();
        if (eventsByStatus.hasOwnProperty(status)) {
          eventsByStatus[status]++;
        }
      });

      setStats({
        totalEvents: currentMonthEvents,
        revenue: currentMonthRevenue,
        activeClients: dashboardData.summary?.totalClients || 0,
        pendingPayments: dashboardData.upcomingEvents?.filter(
          (e) => e.payment?.status === "pending"
        ).length || 0,
        upcomingEvents: (dashboardData.upcomingEvents || []).map((event) => ({
          id: event._id,
          title: event.title,
          date: event.startDate,
          location: event.clientId?.name || "N/A",
          guestCount: event.guestCount,
          status: event.status,
        })),
        recentPayments: (dashboardData.recentPayments || []).map((payment) => ({
          id: payment._id,
          clientName: payment.description || payment.category || "Payment",
          date: payment.date || payment.createdAt,
          amount: payment.amount,
        })),
        monthlyComparison: {
          events: {
            current: currentMonthEvents,
            previous: lastMonthEvents,
            change: parseFloat(eventsChange),
          },
          revenue: {
            current: currentMonthRevenue,
            previous: lastMonthRevenue,
            change: parseFloat(revenueChange),
          },
        },
        eventsByStatus,
      });

      // Set enhanced stats
      setEnhancedStats(enhancedData);

      // Safely handle tasks response
      const tasksArray = Array.isArray(tasksResponse) 
        ? tasksResponse 
        : (tasksResponse?.tasks || []);
      setTasks(Array.isArray(tasksArray) ? tasksArray.slice(0, 5) : []);

      // Safely handle reminders response
      const remindersArray = Array.isArray(remindersResponse)
        ? remindersResponse
        : (remindersResponse?.reminders || []);
      setReminders(Array.isArray(remindersArray) ? remindersArray.slice(0, 5) : []);
    } catch (err) {
      console.error("❌ Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedData = async () => {
    // Mock data - replace with actual API calls
    return {
      occupancyRate: 75,
      averageRating: 4.8,
      taskCompletion: 90,
      paymentCollection: 88,
      revenueTrend: [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 61000 },
        { month: 'May', revenue: 58000 },
        { month: 'Jun', revenue: 72000 },
      ],
      eventTypeDistribution: [
        { type: 'Wedding', count: 8, color: 'bg-purple-500' },
        { type: 'Corporate', count: 5, color: 'bg-blue-500' },
        { type: 'Birthday', count: 3, color: 'bg-pink-500' },
        { type: 'Other', count: 2, color: 'bg-gray-500' },
      ],
      performanceMetrics: {
        venueUtilization: 75,
        taskCompletion: 90,
        paymentCollection: 88,
        clientSatisfaction: 92,
      },
      recentActivity: [
        { action: 'Payment received', details: 'Wedding Client - $2,500', time: '2 hours ago', type: 'payment' },
        { action: 'Event confirmed', details: 'Corporate Gala - Dec 15', time: '5 hours ago', type: 'event' },
        { action: 'Task completed', details: 'Finalize venue setup', time: '1 day ago', type: 'task' },
        { action: 'New client registered', details: 'Sarah Johnson - Birthday', time: '1 day ago', type: 'client' },
      ],
      teamPerformance: [
        { name: 'John Doe', tasksCompleted: 12, eventsManaged: 8, rating: 4.8 },
        { name: 'Jane Smith', tasksCompleted: 15, eventsManaged: 10, rating: 4.9 },
        { name: 'Mike Johnson', tasksCompleted: 8, eventsManaged: 6, rating: 4.6 },
      ],
    };
  };

  const quickActions = [
    { label: "New Event", icon: Calendar, path: "/events/new", variant: "primary" },
    { label: "Add Client", icon: Users, path: "/clients/new", variant: "outline" },
    { label: "Record Payment", icon: DollarSign, path: "/payments/new", variant: "outline" },
    { label: "Create Task", icon: CheckCircle, path: "/tasks/new", variant: "outline" },
  ];

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Dashboard
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Overview of key metrics and upcoming events
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enhancedStats.occupancyRate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{enhancedStats.averageRating}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{enhancedStats.taskCompletion}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Task Completion</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{enhancedStats.paymentCollection}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Payment Collection</div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Events This Month */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Events This Month
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalEvents}
                </div>
                {stats.monthlyComparison.events.change !== 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    {stats.monthlyComparison.events.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stats.monthlyComparison.events.change > 0 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {Math.abs(stats.monthlyComparison.events.change)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue This Month */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revenue This Month
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.revenue)}
                </div>
                {stats.monthlyComparison.revenue.change !== 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    {stats.monthlyComparison.revenue.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stats.monthlyComparison.revenue.change > 0 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {Math.abs(stats.monthlyComparison.revenue.change)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Total Upcoming */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Upcoming
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.upcomingEvents.length}
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Pending Payments */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Payments
                </div>
                <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingPayments}
                </div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trend (Last 6 Months)
            </h3>
            <div className="h-64">
              <div className="flex items-end justify-between h-48 gap-2 px-4">
                {enhancedStats.revenueTrend.map((item, index) => {
                  const maxRevenue = Math.max(...enhancedStats.revenueTrend.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${item.month}: ${formatCurrency(item.revenue)}`}
                      />
                      <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{item.month}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(item.revenue / 1000)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Venue Utilization', value: enhancedStats.performanceMetrics.venueUtilization || 75 },
                { label: 'Task Completion', value: enhancedStats.performanceMetrics.taskCompletion || 90 },
                { label: 'Payment Collection', value: enhancedStats.performanceMetrics.paymentCollection || 88 },
                { label: 'Client Satisfaction', value: enhancedStats.performanceMetrics.clientSatisfaction || 92 },
              ].map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(metric.value)}`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Event Type Distribution */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Event Type Distribution
            </h3>
            <div className="space-y-3">
              {enhancedStats.eventTypeDistribution.map((eventType, index) => {
                const total = enhancedStats.eventTypeDistribution.reduce((sum, item) => sum + item.count, 0);
                const percentage = total > 0 ? Math.round((eventType.count / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${eventType.color}`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{eventType.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {eventType.count} events
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recent Activity
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/activity")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {enhancedStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'event' ? 'bg-blue-500' : 
                    activity.type === 'task' ? 'bg-orange-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Event Status Breakdown */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Event Status Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.eventsByStatus.pending}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.eventsByStatus.confirmed}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.eventsByStatus.completed}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.eventsByStatus.cancelled}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate("/events")}
              >
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.upcomingEvents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        No upcoming events.
                      </td>
                    </tr>
                  ) : (
                    stats.upcomingEvents.slice(0, 5).map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                          {event.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {event.guestCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              event.status?.toLowerCase() === "confirmed"
                                ? "success"
                                : event.status?.toLowerCase() === "pending"
                                  ? "warning"
                                  : "info"
                            }
                          >
                            {event.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Payments */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Payments
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate("/payments")}
                >
                  View All
                </Button>
              </div>
              <ul className="space-y-3">
                {stats.recentPayments.length === 0 ? (
                  <li className="text-gray-500 dark:text-gray-400 text-center py-6">
                    No recent payments.
                  </li>
                ) : (
                  stats.recentPayments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                      onClick={() => navigate(`/payments/${payment.id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {payment.clientName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
                        {formatCurrency(payment.amount)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Card>

          {/* My Tasks */}
          {tasks.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    My Tasks
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => navigate("/tasks")}
                  >
                    View All
                  </Button>
                </div>
                <ul className="space-y-3">
                  {tasks.map((task) => (
                    <li
                      key={task._id}
                      className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 dark:bg-red-900/20'
                            : task.priority === 'high'
                              ? 'bg-orange-100 dark:bg-orange-900/20'
                              : 'bg-blue-100 dark:bg-blue-900/20'
                        }`}>
                          <CheckCircle className={`w-4 h-4 ${
                            task.priority === 'urgent'
                              ? 'text-red-600 dark:text-red-400'
                              : task.priority === 'high'
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <Badge
                          variant={
                            task.priority === 'urgent' ? 'danger' :
                            task.priority === 'high' ? 'warning' : 'info'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Upcoming Reminders */}
          {reminders.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upcoming Reminders
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => navigate("/reminders")}
                  >
                    View All
                  </Button>
                </div>
                <ul className="space-y-3">
                  {reminders.map((reminder) => (
                    <li
                      key={reminder._id}
                      className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                      onClick={() => navigate(`/reminders/${reminder._id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {reminder.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(reminder.reminderDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })} at {reminder.reminderTime}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;