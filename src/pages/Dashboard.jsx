import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { 
  dashboardService, 
  taskService, 
  reminderService,
  eventService,
  paymentService,
  clientService,
  venueService,
  invoiceService,
  financeService
} from "../api/index";
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
  CreditCard,
  UserCheck,
  Building,
  Package,
  Heart,
  Shield,
  ThumbsUp,
} from "lucide-react";

// Import Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
);

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
    financialHealth: {},
    clientRetention: 0,
    partnerPerformance: [],
    averageEventValue: 0,
    clientSatisfaction: 0,
  });
  
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setHasInitialLoad(false);
      
      // Fetch all data in parallel with proper limits
      const [
        dashboardResponse, 
        tasksResponse, 
        remindersResponse,
        eventsResponse,
        paymentsResponse,
        clientsResponse,
        invoicesResponse,
        financeSummaryResponse
      ] = await Promise.all([
        dashboardService.getStats(),
        taskService.getMyTasks().catch(() => ({ tasks: [] })),
        reminderService.getUpcoming().catch(() => ({ reminders: [] })),
        // Use proper limit that doesn't exceed API constraints
        eventService.getAll({ limit: 100, includeArchived: false }).catch(() => ({ events: [] })),
        paymentService.getAll({ limit: 100 }).catch(() => ({ payments: [] })),
        clientService.getAll({ limit: 100 }).catch(() => ({ clients: [] })),
        invoiceService.getStats().catch(() => ({})),
        financeService.getSummary().catch(() => ({}))
      ]);

      console.log("📊 Dashboard Response:", dashboardResponse);
      console.log("📈 Events Response:", eventsResponse);

      const dashboardData = dashboardResponse?.data || dashboardResponse || {};
      const financeSummary = financeSummaryResponse || {};

      // Process events data with proper error handling
      const events = eventsResponse?.events || eventsResponse?.data?.events || [];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthEvents = events.filter(event => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      }).length;

      const lastMonthEvents = events.filter(event => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return eventDate.getMonth() === lastMonth && eventDate.getFullYear() === year;
      }).length;

      // Calculate revenue from payments with proper error handling
      const payments = paymentsResponse?.payments || paymentsResponse?.data?.payments || [];
      const currentMonthRevenue = payments
        .filter(payment => {
          const paymentDate = new Date(payment.paidDate || payment.createdAt);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);

      const lastMonthRevenue = payments
        .filter(payment => {
          const paymentDate = new Date(payment.paidDate || payment.createdAt);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const year = currentMonth === 0 ? currentYear - 1 : currentYear;
          return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === year;
        })
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);

      const revenueChange = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
        : currentMonthRevenue > 0 ? 100 : 0;

      const eventsChange = lastMonthEvents > 0
        ? ((currentMonthEvents - lastMonthEvents) / lastMonthEvents * 100)
        : currentMonthEvents > 0 ? 100 : 0;

      // Count events by status with proper error handling
      const eventsByStatus = events.reduce((acc, event) => {
        const status = event.status?.toLowerCase() || 'pending';
        if (acc.hasOwnProperty(status)) {
          acc[status]++;
        }
        return acc;
      }, { pending: 0, confirmed: 0, completed: 0, cancelled: 0 });

      // Get upcoming events (next 30 days) with proper error handling
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const upcomingEvents = events
        .filter(event => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          return eventDate >= new Date() && eventDate <= thirtyDaysFromNow;
        })
        .slice(0, 5)
        .map(event => ({
          id: event._id,
          title: event.title || 'Untitled Event',
          date: event.startDate,
          clientName: event.clientId?.name || "N/A",
          guestCount: event.guestCount || 0,
          status: event.status || 'pending',
        }));

      setStats({
        totalEvents: currentMonthEvents,
        revenue: currentMonthRevenue,
        activeClients: clientsResponse?.clients?.length || clientsResponse?.data?.clients?.length || 0,
        pendingPayments: invoicesResponse?.overdue?.total || 0,
        upcomingEvents,
        recentPayments: payments.slice(0, 5).map(payment => ({
          id: payment._id,
          clientName: payment.clientId?.name || payment.description || "Payment",
          date: payment.paidDate || payment.createdAt,
          amount: payment.amount || 0,
        })),
        monthlyComparison: {
          events: {
            current: currentMonthEvents,
            previous: lastMonthEvents,
            change: parseFloat(eventsChange.toFixed(1)),
          },
          revenue: {
            current: currentMonthRevenue,
            previous: lastMonthRevenue,
            change: parseFloat(revenueChange.toFixed(1)),
          },
        },
        eventsByStatus,
      });

      // Fetch enhanced stats
      const enhancedData = await fetchEnhancedData(events, payments, clientsResponse, financeSummary, currentMonthEvents, currentMonthRevenue);
      setEnhancedStats(enhancedData);

      // Handle tasks and reminders with proper error handling
      const tasksArray = tasksResponse?.tasks || tasksResponse?.data?.tasks || [];
      setTasks(Array.isArray(tasksArray) ? tasksArray.slice(0, 5) : []);

      const remindersArray = remindersResponse?.reminders || remindersResponse?.data?.reminders || [];
      setReminders(Array.isArray(remindersArray) ? remindersArray.slice(0, 5) : []);
      
      setHasInitialLoad(true);
    } catch (err) {
      console.error("❌ Dashboard load failed:", err);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedData = async (events, payments, clientsResponse, financeSummary, currentMonthEvents, currentMonthRevenue) => {
    try {
      // Fetch additional data for enhanced metrics with proper error handling
      const [
        venuesResponse,
        allTasksResponse,
        clientStatsResponse
      ] = await Promise.all([
        venueService.getMe().catch(() => ({})),
        taskService.getAll({ limit: 100 }).catch(() => ({ tasks: [] })),
        clientService.getStats().catch(() => ({}))
      ]);

      const venues = venuesResponse?.venue || venuesResponse?.data || {};
      const allTasks = allTasksResponse?.tasks || allTasksResponse?.data?.tasks || [];
      const clients = clientsResponse?.clients || clientsResponse?.data?.clients || [];
      const clientStats = clientStatsResponse || {};

      // Calculate occupancy rate based on venue capacity and booked events
      const venueCapacity = venues.capacity?.max || 1;
      const bookedEvents = events.filter(event => 
        ['confirmed', 'completed', 'in-progress'].includes(event.status?.toLowerCase())
      ).length;
      const occupancyRate = Math.round((bookedEvents / venueCapacity) * 100);

      // Calculate task completion rate
      const completedTasks = allTasks.filter(task => 
        task.status?.toLowerCase() === 'completed'
      ).length;
      const taskCompletion = allTasks.length > 0 ? 
        Math.round((completedTasks / allTasks.length) * 100) : 0;

      // Calculate payment collection rate from invoices
      const totalInvoiced = events.reduce((sum, event) => sum + (event.pricing?.totalAmount || 0), 0);
      const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const paymentCollection = totalInvoiced > 0 ? 
        Math.round((totalCollected / totalInvoiced) * 100) : 0;

      // Calculate average event value
      const averageEventValue = currentMonthEvents > 0 ? currentMonthRevenue / currentMonthEvents : 0;

      // Calculate event type distribution with proper error handling
      const eventTypeCount = {};
      events.forEach(event => {
        const type = event.type || event.eventType || 'Other';
        eventTypeCount[type] = (eventTypeCount[type] || 0) + 1;
      });

      const eventTypeDistribution = Object.entries(eventTypeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([type, count], index) => {
          const colors = ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#6B7280'];
          return {
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count,
            color: colors[index % colors.length]
          };
        });

      // Generate revenue trend (last 6 months) with proper error handling
      const revenueTrend = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthRevenue = payments
          .filter(payment => {
            if (!payment.paidDate && !payment.createdAt) return false;
            const paymentDate = new Date(payment.paidDate || payment.createdAt);
            return paymentDate.getMonth() === date.getMonth() && 
                   paymentDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        return { month, revenue: monthRevenue };
      });

      // Calculate financial health metrics
      const totalRevenue = financeSummary.totalRevenue || totalCollected;
      const totalExpenses = financeSummary.totalExpenses || 0;
      const profitMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;
      
      const financialHealth = {
        profitMargin,
        cashFlow: (financeSummary.cashFlow?.currentBalance || 0),
        revenueGrowth: stats.monthlyComparison.revenue.change,
        expenseRatio: totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0,
      };

      // Calculate client retention rate (simplified)
      const repeatClients = clients.filter(client => 
        client.totalEvents > 1
      ).length;
      const clientRetention = clients.length > 0 ? 
        Math.round((repeatClients / clients.length) * 100) : 0;

      // Calculate client satisfaction (simplified - based on ratings)
      const ratedClients = clients.filter(client => client.rating);
      const clientSatisfaction = ratedClients.length > 0 ? 
        Math.round((ratedClients.reduce((sum, client) => sum + (client.rating || 0), 0) / ratedClients.length) * 20) : 85;

      // Get recent activity from multiple sources with proper error handling
      const recentActivity = [
        ...payments.slice(0, 2).map(payment => ({
          action: 'Payment received',
          details: `${payment.clientId?.name || 'Client'} - ${formatCurrency(payment.amount)}`,
          time: new Date(payment.paidDate || payment.createdAt).toLocaleDateString(),
          type: 'payment'
        })),
        ...events.slice(0, 2).map(event => ({
          action: `Event ${event.status}`,
          details: `${event.title} - ${new Date(event.startDate).toLocaleDateString()}`,
          time: new Date(event.updatedAt || event.createdAt).toLocaleDateString(),
          type: 'event'
        })),
        ...allTasks.slice(0, 1).filter(task => task.status === 'completed').map(task => ({
          action: 'Task completed',
          details: task.title,
          time: new Date(task.completedAt || task.updatedAt).toLocaleDateString(),
          type: 'task'
        }))
      ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 4);

      return {
        occupancyRate,
        averageRating: clientStats.averageRating || 4.5,
        taskCompletion,
        paymentCollection,
        revenueTrend,
        eventTypeDistribution,
        performanceMetrics: {
          venueUtilization: occupancyRate,
          taskCompletion,
          paymentCollection,
          clientSatisfaction,
        },
        financialHealth,
        clientRetention,
        clientSatisfaction,
        averageEventValue,
        recentActivity,
        teamPerformance: [], // This would come from a team API
      };

    } catch (error) {
      console.error("Error fetching enhanced data:", error);
      return getFallbackEnhancedData();
    }
  };

  const getFallbackEnhancedData = () => ({
    occupancyRate: 75,
    averageRating: 4.5,
    taskCompletion: 85,
    paymentCollection: 80,
    revenueTrend: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 58000 },
      { month: 'Jun', revenue: 72000 },
    ],
    eventTypeDistribution: [
      { type: 'Wedding', count: 8, color: '#8B5CF6' },
      { type: 'Corporate', count: 5, color: '#3B82F6' },
      { type: 'Birthday', count: 3, color: '#EC4899' },
      { type: 'Other', count: 2, color: '#6B7280' },
    ],
    performanceMetrics: {
      venueUtilization: 75,
      taskCompletion: 85,
      paymentCollection: 80,
      clientSatisfaction: 90,
    },
    financialHealth: {
      profitMargin: 35,
      cashFlow: 125000,
      revenueGrowth: 12.5,
      expenseRatio: 65,
    },
    clientRetention: 78,
    clientSatisfaction: 90,
    averageEventValue: 4500,
    recentActivity: [
      { action: 'Payment received', details: 'Wedding Client - $2,500', time: '2 hours ago', type: 'payment' },
      { action: 'Event confirmed', details: 'Corporate Gala - Dec 15', time: '5 hours ago', type: 'event' },
      { action: 'Task completed', details: 'Finalize venue setup', time: '1 day ago', type: 'task' },
    ],
    teamPerformance: [],
  });

  // Prepare chart data
  const eventTypeChartData = {
    labels: enhancedStats.eventTypeDistribution.map(item => item.type),
    datasets: [
      {
        data: enhancedStats.eventTypeDistribution.map(item => item.count),
        backgroundColor: enhancedStats.eventTypeDistribution.map(item => item.color),
        borderColor: enhancedStats.eventTypeDistribution.map(item => item.color),
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const revenueTrendChartData = {
    labels: enhancedStats.revenueTrend.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: enhancedStats.revenueTrend.map(item => item.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const revenueChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFinancialHealthColor = (metric, value) => {
    if (metric === 'profitMargin') {
      if (value >= 30) return 'text-green-600';
      if (value >= 15) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (metric === 'expenseRatio') {
      if (value <= 60) return 'text-green-600';
      if (value <= 75) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Loading State
  if (loading && !hasInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-white rounded-lg dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Dashboard
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Comprehensive overview of your venue performance
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

      {/* Financial Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</div>
              <div className={`text-2xl font-bold ${getFinancialHealthColor('profitMargin', enhancedStats.financialHealth.profitMargin)}`}>
                {enhancedStats.financialHealth.profitMargin}%
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cash Flow</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(enhancedStats.financialHealth.cashFlow)}
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Client Retention</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {enhancedStats.clientRetention}%
              </div>
            </div>
            <UserCheck className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expense Ratio</div>
              <div className={`text-2xl font-bold ${getFinancialHealthColor('expenseRatio', enhancedStats.financialHealth.expenseRatio)}`}>
                {enhancedStats.financialHealth.expenseRatio}%
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enhancedStats.occupancyRate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{enhancedStats.averageRating}/5</div>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        </div>

        {/* Revenue This Month */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        </div>

        {/* Average Event Value */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Event Value
                </div>
                <div className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(enhancedStats.averageEventValue)}
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Client Satisfaction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Client Satisfaction
                </div>
                <div className="mt-2 text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {enhancedStats.clientSatisfaction}%
                </div>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trend (Last 6 Months)
            </h3>
            <div className="h-64">
              <Line data={revenueTrendChartData} options={revenueChartOptions} />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        </div>

        {/* Event Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Event Type Distribution
            </h3>
            <div className="h-64 relative">
              <Doughnut data={eventTypeChartData} options={chartOptions} />
            </div>
            {/* Additional summary stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {enhancedStats.eventTypeDistribution.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Most Popular</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {enhancedStats.eventTypeDistribution.length > 0 
                    ? enhancedStats.eventTypeDistribution.reduce((prev, current) => 
                        (prev.count > current.count) ? prev : current
                      ).type 
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        </div>
      </div>

      {/* Event Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upcoming Events (30 Days)
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
                          {event.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {event.guestCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
          </div>

          {/* My Tasks */}
          {tasks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }) : 'No due date'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {reminders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                            {reminder.reminderDate ? new Date(reminder.reminderDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }) : 'No date set'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;