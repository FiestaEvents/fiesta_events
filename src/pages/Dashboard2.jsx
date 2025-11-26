import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Generic Components
import Button from "../components/common/Button"; 
import { StatusBadge } from "../components/common/Badge";

// Hooks & API
import useToast from "../hooks/useToast";
import {
  taskService,
  eventService,
  paymentService,
  venueService,
  invoiceService,
  dashboardService
} from "../api/index";

import formatCurrency from "../utils/formatCurrency";
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Wallet,
  LayoutDashboard,
  Users,
  Briefcase,
  Plus,
  FileText,
  Settings,
  Loader2,
  ChevronRight
} from "lucide-react";

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiError } = useToast();
  const [loading, setLoading] = useState(true);
  
  // State for Metrics & Data
  const [metrics, setMetrics] = useState({
    revenue: { current: 0, growth: 0, outstanding: 0 },
    occupancy: { rate: 0, totalEvents: 0 },
    leads: { conversionRate: 0, pending: 0 },
    operations: { pendingTasks: 0, urgentReminders: 0 }
  });

  const [charts, setCharts] = useState({
    revenueTrend: { labels: [], datasets: [] },
    eventDistribution: { labels: [], datasets: [] }
  });

  const [activity, setActivity] = useState({
    upcoming: [],
    payments: [],
    actions: [],
    riskyEvents: [],
    pendingLeads: [],
    allEvents: [] 
  });

  const [currentDateContext, setCurrentDateContext] = useState(new Date());

  // Helper: Strict DD/MM/YYYY formatter
  const formatDateDDMMYYYY = useCallback((isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-GB");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  }, []);

  // Helper: Safe array extraction
  const extractArray = useCallback((response, ...keys) => {
    if (!response) return [];
    
    // Try direct access first
    for (const key of keys) {
      const value = response[key];
      if (Array.isArray(value)) return value;
    }
    
    // Try nested data access
    if (response.data) {
      for (const key of keys) {
        const value = response.data[key];
        if (Array.isArray(value)) return value;
      }
    }
    
    return [];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Parallel Fetching with individual error handling
        const [dashboardRes, eventsRes, paymentsRes, tasksRes, invoicesRes, venueRes] = await Promise.allSettled([
          dashboardService.getStats(),
          eventService.getAll({ limit: 100, includeArchived: false }),
          paymentService.getAll({ limit: 100 }),
          taskService.getMyTasks(),
          invoiceService.getStats(),
          venueService.getMe()
        ]);

        // 2. Extract data safely with fallbacks
        const dashboardData = dashboardRes.status === 'fulfilled' ? dashboardRes.value : {};
        const serverStats = dashboardData?.data?.stats || dashboardData?.stats || {};
        
        // Extract arrays with safe fallbacks
        const allEvents = extractArray(
          eventsRes.status === 'fulfilled' ? eventsRes.value : {}, 
          'events', 'data'
        );
        
        const allPayments = extractArray(
          paymentsRes.status === 'fulfilled' ? paymentsRes.value : {}, 
          'payments', 'data'
        );
        
        const allTasks = extractArray(
          tasksRes.status === 'fulfilled' ? tasksRes.value : {}, 
          'tasks', 'data'
        );
        
        const venueData = venueRes.status === 'fulfilled' 
          ? (venueRes.value?.data?.venue || venueRes.value?.venue || {})
          : {};
        
        const invoiceStats = invoicesRes.status === 'fulfilled'
          ? (invoicesRes.value?.data?.stats || invoicesRes.value?.stats || {})
          : {};

        // 3. Determine relevant date context
        let relevantDate = new Date();
        if (allEvents.length > 0) {
          // Sort events by date
          const sortedEvents = [...allEvents].sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
          );
          
          // Find next upcoming event
          const nextEvent = sortedEvents.find(e => 
            new Date(e.startDate) >= new Date().setHours(0,0,0,0)
          );
          
          if (nextEvent) {
            relevantDate = new Date(nextEvent.startDate);
          } else if (sortedEvents.length > 0) {
            // Use last event if no upcoming events
            relevantDate = new Date(sortedEvents[sortedEvents.length - 1].startDate);
          }
        }

        setCurrentDateContext(relevantDate);
        const currentMonth = relevantDate.getMonth();
        const currentYear = relevantDate.getFullYear();

        // 4. Calculate Metrics
        
        // Revenue Calculation
        const currentMonthPayments = allPayments.filter(p => {
          const paymentDate = new Date(p.paidDate || p.createdAt);
          return paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        });
        
        const currentMonthRevenue = currentMonthPayments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0), 
          0
        );

        // Calculate last month for growth
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const lastMonthPayments = allPayments.filter(p => {
          const paymentDate = new Date(p.paidDate || p.createdAt);
          return paymentDate.getMonth() === lastMonth && 
                 paymentDate.getFullYear() === lastMonthYear;
        });
        
        const lastMonthRevenue = lastMonthPayments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0), 
          0
        );

        const revenueGrowth = lastMonthRevenue > 0 
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : (currentMonthRevenue > 0 ? 100 : 0);

        // Occupancy Calculation
        const currentMonthEvents = allEvents.filter(e => {
          if (!e.startDate) return false;
          const eventDate = new Date(e.startDate);
          return eventDate.getMonth() === currentMonth && 
                 eventDate.getFullYear() === currentYear;
        });
        
        const currentMonthEventsCount = currentMonthEvents.length;
        const maxCapacity = venueData?.capacity?.max || 30;
        const occupancyRate = maxCapacity > 0 
          ? Math.min(Math.round((currentMonthEventsCount / maxCapacity) * 100), 100)
          : 0;

        // Lead Conversion Calculation
        const pendingEvents = allEvents.filter(e => e.status === 'pending');
        const confirmedEvents = allEvents.filter(e => 
          ['confirmed', 'completed', 'paid', 'in-progress'].includes(e.status?.toLowerCase())
        );
        
        const totalLeads = pendingEvents.length + confirmedEvents.length;
        const conversionRate = totalLeads > 0 
          ? Math.round((confirmedEvents.length / totalLeads) * 100)
          : 0;

        // Operations Calculation
        const pendingTasks = allTasks.filter(t => t.status !== 'completed');
        const urgentTasks = allTasks.filter(t => 
          (t.priority === 'high' || t.priority === 'urgent') && 
          t.status !== 'completed'
        );

        setMetrics({
          revenue: { 
            current: currentMonthRevenue, 
            growth: revenueGrowth, 
            outstanding: invoiceStats.totalDue || 0 
          },
          occupancy: { 
            rate: occupancyRate, 
            totalEvents: currentMonthEventsCount 
          },
          leads: { 
            conversionRate, 
            pending: pendingEvents.length 
          },
          operations: { 
            pendingTasks: pendingTasks.length, 
            urgentReminders: urgentTasks.length 
          }
        });

        // 5. Prepare Activity Lists
        
        // Upcoming Events (next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const upcomingEvents = allEvents
          .filter(e => {
            if (!e.startDate) return false;
            const eventDate = new Date(e.startDate);
            return eventDate >= now && eventDate <= thirtyDaysFromNow;
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5);

        // Recent Payments
        const recentPayments = [...allPayments]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Risky Events (confirmed but no partners)
        const riskyEvents = allEvents
          .filter(e => 
            ['confirmed', 'in-progress'].includes(e.status?.toLowerCase()) &&
            (!e.partners || e.partners.length === 0) &&
            new Date(e.startDate) >= now
          )
          .slice(0, 3);

        // Action Items
        const actionItems = [];
        if (invoiceStats.overdue > 0) {
          actionItems.push({ 
            type: 'critical', 
            text: `${invoiceStats.overdue} Overdue Invoices`, 
            link: '/invoices?status=overdue' 
          });
        }
        if (pendingEvents.length > 0) {
          actionItems.push({ 
            type: 'warning', 
            text: `${pendingEvents.length} New Enquiries`, 
            link: '/events?status=pending' 
          });
        }
        if (urgentTasks.length > 0) {
          actionItems.push({ 
            type: 'info', 
            text: `${urgentTasks.length} Urgent Tasks`, 
            link: '/tasks' 
          });
        }

        setActivity({
          upcoming: upcomingEvents,
          payments: recentPayments,
          actions: actionItems,
          riskyEvents,
          pendingLeads: pendingEvents.slice(0, 5),
          allEvents
        });

        // 6. Prepare Chart Data
        
        // Event Distribution by Status
        const statusCounts = {
          Pending: 0,
          Confirmed: 0,
          Completed: 0,
          Cancelled: 0
        };

        allEvents.forEach(event => {
          const status = event.status?.toLowerCase() || 'pending';
          
          if (status === 'pending') statusCounts.Pending++;
          else if (['confirmed', 'in-progress', 'paid'].includes(status)) statusCounts.Confirmed++;
          else if (status === 'completed') statusCounts.Completed++;
          else if (status === 'cancelled') statusCounts.Cancelled++;
          else statusCounts.Pending++; // Default to pending
        });

        // Revenue Trend (last 6 months)
        const monthNames = [];
        const revenueData = [];
        
        for (let i = 5; i >= 0; i--) {
          const targetMonth = currentMonth - i;
          const targetYear = targetMonth < 0 
            ? currentYear - 1 
            : currentYear;
          const adjustedMonth = targetMonth < 0 
            ? 12 + targetMonth 
            : targetMonth;
          
          const monthName = new Date(targetYear, adjustedMonth, 1)
            .toLocaleString('default', { month: 'short' });
          monthNames.push(monthName);
          
          const monthRevenue = allPayments
            .filter(p => {
              const paymentDate = new Date(p.paidDate || p.createdAt);
              return paymentDate.getMonth() === adjustedMonth && 
                     paymentDate.getFullYear() === targetYear;
            })
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          
          revenueData.push(monthRevenue);
        }

        setCharts({
          eventDistribution: {
            labels: Object.keys(statusCounts),
            datasets: [{
              data: Object.values(statusCounts),
              backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444'],
              borderWidth: 0,
              hoverOffset: 10
            }]
          },
          revenueTrend: {
            labels: monthNames,
            datasets: [{
              label: 'Revenue',
              data: revenueData,
              borderColor: '#F97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#F97316',
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          }
        });

      } catch (error) {
        console.error("Dashboard fetch error:", error);
        apiError(error, "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiError, extractArray, formatDateDDMMYYYY]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500 animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6 lg:p-8 space-y-8">
      
      {/* 1. HEADER & ACTION CENTER */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="text-orange-500" /> {t('dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-gray-500 mt-2">
            {t('dashboard.welcome_msg', "Here is what is happening at your venue today.")}
          </p>
        </div>
        
        {/* Action Ticker */}
        <div className="flex gap-3 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar">
          {activity.actions.length > 0 ? activity.actions.map((action, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(action.link)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border shadow-sm cursor-pointer whitespace-nowrap transition-all hover:shadow-md
                ${action.type === 'critical' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800' : 
                  action.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800' : 
                  'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800'}`}
            >
              {action.type === 'critical' ? <AlertTriangle size={18} /> : <Clock size={18} />}
              <span className="font-medium text-sm">{action.text}</span>
              <ArrowRight size={14} />
            </div>
          )) : (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle2 size={18} /> 
              <span className="font-medium text-sm">
                {t('dashboard.all_caught_up', 'All caught up!')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title={t('dashboard.metrics.revenue', 'Monthly Revenue')}
          value={formatCurrency(metrics.revenue.current)}
          trend={metrics.revenue.growth}
          icon={Wallet}
          color="orange"
          subValue={`${formatCurrency(metrics.revenue.outstanding)} ${t('dashboard.metrics.pending', 'Pending')}`}
        />
        <MetricCard 
          title={t('dashboard.metrics.occupancy', 'Occupancy')}
          value={`${metrics.occupancy.rate}%`}
          icon={CalendarIcon}
          color="blue"
          subValue={`${metrics.occupancy.totalEvents} ${t('dashboard.metrics.events_this_month', 'Events this month')}`}
        />
        <MetricCard 
          title={t('dashboard.metrics.conversion', 'Lead Conversion')}
          value={`${metrics.leads.conversionRate}%`}
          icon={Users}
          color="purple"
          subValue={`${metrics.leads.pending} ${t('dashboard.metrics.pending_enquiries', 'Pending Enquiries')}`}
        />
        <MetricCard 
          title={t('dashboard.metrics.tasks', 'Operations')}
          value={metrics.operations.pendingTasks}
          icon={CheckCircle2}
          color="green"
          subValue={`${metrics.operations.urgentReminders} ${t('dashboard.metrics.urgent_items', 'Urgent Items')}`}
        />
      </div>

      {/* 3. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (66%) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('dashboard.charts.revenue_trend', 'Revenue Trend')}
              </h3>
              <div className="h-64 w-full">
                <Line 
                  data={charts.revenueTrend} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => formatCurrency(context.parsed.y)
                        }
                      }
                    },
                    scales: { 
                      y: { 
                        grid: { color: '#f3f4f6' }, 
                        ticks: { display: false } 
                      }, 
                      x: { grid: { display: false } } 
                    }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('dashboard.charts.event_status', 'Event Status')}
              </h3>
              <div className="h-64 relative flex justify-center">
                <Doughnut 
                  data={charts.eventDistribution}
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    cutout: '75%', 
                    plugins: { 
                      legend: { 
                        position: 'right', 
                        labels: { usePointStyle: true } 
                      } 
                    } 
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                    {metrics.occupancy.totalEvents}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t('dashboard.charts.total', 'Total')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Risk Widget */}
          {activity.riskyEvents.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={20} /> 
                {t('dashboard.alerts.missing_partners', 'Events Missing Partners')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activity.riskyEvents.map(event => (
                  <div 
                    key={event._id} 
                    className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate pr-2">
                      {event.title}
                    </span>
                    <button 
                      onClick={() => navigate(`/events/${event._id}/detail`)} 
                      className="text-xs text-blue-600 font-semibold hover:underline whitespace-nowrap"
                    >
                      {t('dashboard.actions.assign', 'Assign')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="text-blue-500" size={20} /> 
                {t('dashboard.upcoming.title', 'Upcoming Schedule')}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
                {t('dashboard.view_all', 'View All')}
              </Button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activity.upcoming.length > 0 ? activity.upcoming.map(event => (
                <div 
                  key={event._id} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center justify-between group cursor-pointer" 
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {event.clientId?.name || "Unknown Client"} • {event.guestCount || 0} Guests
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={event.status} size="sm" dot={true} />
                    <ArrowRight className="text-gray-300 group-hover:text-orange-500" size={18} />
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t('dashboard.upcoming.no_events', 'No upcoming events scheduled.')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (33%) */}
        <div className="space-y-8">
          
          {/* Mini Calendar */}
          <MiniCalendar 
            events={activity.allEvents} 
            displayDate={currentDateContext} 
          />

          {/* Pending Leads */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="text-purple-500" size={20} /> 
              {t('dashboard.leads.title', 'Pending Leads')}
            </h3>
            <div className="space-y-4">
              {activity.pendingLeads.length > 0 ? activity.pendingLeads.map(event => (
                <div key={event._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 font-bold text-xs">
                      {event.clientId?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                        {event.clientId?.name || "Unknown Client"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateDDMMYYYY(event.startDate)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => navigate(`/events/${event._id}/detail`)} 
                    className="text-gray-400 hover:text-purple-600"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  {t('dashboard.leads.no_leads', 'No pending leads')}
                </p>
              )}
            </div>
          </div>

          {/* Recent Inflow */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-green-500" size={20} /> 
                {t('dashboard.recent_inflow', 'Recent Inflow')}
              </h3>
            </div>
            <div>
              {activity.payments.length > 0 ? activity.payments.map((pay, idx) => (
                <div 
                  key={pay._id || idx} 
                  className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <span className="text-xs font-bold">$</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {pay.clientId?.name || pay.client?.name || "Client Payment"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDateDDMMYYYY(pay.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-sm">
                    +{formatCurrency(pay.amount)}
                  </span>
                </div>
              )) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  {t('dashboard.no_payments', 'No recent payments.')}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const MiniCalendar = ({ events = [], displayDate }) => {
  const { t } = useTranslation();
  const baseDate = displayDate || new Date();
  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getDay(); 

  const getDayStatus = (day) => {
    try {
      const dateStr = new Date(baseDate.getFullYear(), baseDate.getMonth(), day).toDateString();
      const event = events.find(e => {
        if (!e.startDate) return false;
        return new Date(e.startDate).toDateString() === dateStr;
      });
      
      if (!event) return null;
      
      const status = event.status?.toLowerCase() || 'pending';
      return ['confirmed', 'completed', 'paid', 'in-progress'].includes(status) ? 'booked' : 'pending';
    } catch (error) {
      console.error("Date status check error:", error);
      return null;
    }
  };

  const today = new Date();
  const isCurrentMonth = baseDate.getMonth() === today.getMonth() && 
                         baseDate.getFullYear() === today.getFullYear();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
        <span>{baseDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded uppercase tracking-wide">
          {t('dashboard.calendar.occupancy_view', 'Occupancy')}
        </span>
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
        {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          const isToday = isCurrentMonth && day === today.getDate();
          
          return (
            <div 
              key={day} 
              className={`h-8 w-8 flex items-center justify-center rounded-full text-xs transition-all 
                ${isToday ? 'ring-2 ring-orange-500 font-bold text-gray-900 dark:text-white' : ''} 
                ${status === 'booked' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold' : ''} 
                ${status === 'pending' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : ''} 
                ${!status ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, trend, subValue, icon: Icon, color }) => {
  const colorClasses = {
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {Math.abs(Number(trend).toFixed(1))}%
          </div>
        )}
        {subValue && (
          <span className="text-xs text-gray-400 ml-auto truncate max-w-[120px]" title={subValue}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

const QuickActionBtn = ({ label, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center bg-white/5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all py-4 px-2 rounded-lg text-center group border border-gray-100 dark:border-gray-700"
  >
    <Icon size={20} className="mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
  </button>
);

export default DashboardPage;