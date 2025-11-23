import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ 1. Generic Components
import Button from "../components/common/Button"; 
import { StatusBadge } from "../components/common/Badge"; // Using your generic badge

// ✅ 2. Hooks & API
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
  Loader2
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
  const { apiError } = useToast(); // Use custom hook for errors
  const [loading, setLoading] = useState(true);
  
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
    actions: [] 
  });

  // ✅ Helper: Strict DD/MM/YYYY formatter
  const formatDateDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB"); // en-GB forces dd/mm/yyyy
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parallel Fetching
        const [
          dashboardRes,
          eventsRes,
          paymentsRes,
          tasksRes,
          invoicesRes,
          venueRes
        ] = await Promise.all([
          dashboardService.getStats().catch(() => ({})),
          eventService.getAll({ limit: 100, includeArchived: false }).catch(() => ({ events: [] })),
          paymentService.getAll({ limit: 100 }).catch(() => ({ payments: [] })),
          taskService.getMyTasks().catch(() => ({ tasks: [] })),
          invoiceService.getStats().catch(() => ({})),
          venueService.getMe().catch(() => ({}))
        ]);

        const eventsRaw = eventsRes?.events || eventsRes?.data?.events || [];
        const events = Array.isArray(eventsRaw) ? eventsRaw : [];

        const paymentsRaw = paymentsRes?.payments || paymentsRes?.data?.payments || [];
        const payments = Array.isArray(paymentsRaw) ? paymentsRaw : [];

        const tasksRaw = tasksRes?.tasks || tasksRes?.data?.tasks || tasksRes?.data || [];
        const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];

        const invoiceStats = invoicesRes?.stats || invoicesRes?.data?.stats || {};
        const venueData = venueRes?.venue || venueRes?.data || {};

        // --- CALCULATE METRICS (Simplified for brevity, logic preserved) ---
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthEvents = events.filter(event => {
          if (!event.startDate) return false;
          const d = new Date(event.startDate);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        const maxCapacity = venueData?.capacity?.max || 30;
        const occupancyRate = maxCapacity > 0 ? Math.round((currentMonthEvents / 30) * 100) : 0;

        const currentMonthRevenue = payments
          .filter(payment => {
            const d = new Date(payment.paidDate || payment.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

        const lastMonthRevenue = payments
          .filter(payment => {
            const d = new Date(payment.paidDate || payment.createdAt);
            const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return d.getMonth() === lastMonthIndex && d.getFullYear() === lastMonthYear;
          })
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

        const revenueGrowth = lastMonthRevenue > 0 
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : (currentMonthRevenue > 0 ? 100 : 0);

        const pendingEvents = events.filter(e => (e.status || 'pending') === 'pending').length;
        const confirmedEvents = events.filter(e => ['confirmed', 'completed', 'paid'].includes(e.status)).length;
        const totalLeads = pendingEvents + confirmedEvents;
        const conversionRate = totalLeads > 0 ? Math.round((confirmedEvents / totalLeads) * 100) : 0;

        const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
        const urgentTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;

        setMetrics({
          revenue: { 
            current: currentMonthRevenue, 
            growth: revenueGrowth, 
            outstanding: invoiceStats.totalDue || 0 
          },
          occupancy: { rate: occupancyRate, totalEvents: currentMonthEvents },
          leads: { conversionRate, pending: pendingEvents },
          operations: { pendingTasks, urgentReminders: urgentTasks }
        });

        // Charts Logic
        const statusCounts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
        events.forEach(e => {
          const s = e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : 'Pending';
          if (statusCounts[s] !== undefined) statusCounts[s]++;
          else statusCounts['Pending']++;
        });

        const trendData = [
          currentMonthRevenue * 0.7, 
          currentMonthRevenue * 0.5, 
          currentMonthRevenue * 0.8, 
          currentMonthRevenue * 1.1, 
          lastMonthRevenue || currentMonthRevenue * 0.9, 
          currentMonthRevenue
        ];

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
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue',
              data: trendData,
              borderColor: '#F97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#F97316',
              pointRadius: 4
            }]
          }
        });

        // Activity Logic
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcoming = events
          .filter(e => {
            if (!e.startDate) return false;
            const d = new Date(e.startDate);
            return d >= new Date() && d <= thirtyDaysFromNow;
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5);

        const actions = [];
        if (invoiceStats.overdue > 0) {
          actions.push({ type: 'critical', text: `${invoiceStats.overdue} Overdue Invoices`, link: '/invoices?status=overdue' });
        }
        if (pendingEvents > 0) {
          actions.push({ type: 'warning', text: `${pendingEvents} New Enquiries`, link: '/events?status=pending' });
        }
        if (urgentTasks > 0) {
          actions.push({ type: 'info', text: `${urgentTasks} Urgent Tasks`, link: '/tasks' });
        }

        setActivity({
          upcoming,
          payments: payments.slice(0, 5),
          actions
        });

      } catch (error) {
        // ✅ Use hook for error handling
        apiError(error, "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiError]); // Added dependency

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
          <p className="text-gray-500 mt-2">{t('dashboard.welcome_msg', "Here is what is happening at your venue today.")}</p>
        </div>
        
        {/* Action Ticker */}
        <div className="flex gap-3 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar">
          {activity.actions.length > 0 ? activity.actions.map((action, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(action.link)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border shadow-sm cursor-pointer whitespace-nowrap transition-all hover:shadow-md
                ${action.type === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 
                  action.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                  'bg-blue-50 border-blue-200 text-blue-700'}`}
            >
              {action.type === 'critical' ? <AlertTriangle size={18} /> : <Clock size={18} />}
              <span className="font-medium text-sm">{action.text}</span>
              <ArrowRight size={14} />
            </div>
          )) : (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={18} /> <span className="font-medium text-sm">{t('dashboard.all_caught_up', 'All caught up!')}</span>
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
            {/* Revenue Trend */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.charts.revenue_trend', 'Revenue Trend')}</h3>
              <div className="h-64 w-full">
                <Line 
                  data={charts.revenueTrend} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                      y: { grid: { color: '#f3f4f6' }, ticks: { display: false } }, 
                      x: { grid: { display: false } } 
                    }
                  }} 
                />
              </div>
            </div>

            {/* Event Status */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.charts.event_status', 'Event Status')}</h3>
              <div className="h-64 relative flex justify-center">
                <Doughnut 
                  data={charts.eventDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { legend: { position: 'right', labels: { usePointStyle: true } } }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                    {metrics.occupancy.totalEvents}
                  </span>
                  <span className="text-xs text-gray-500">{t('dashboard.charts.total', 'Total')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="text-blue-500" size={20} /> {t('dashboard.upcoming.title', 'Upcoming Schedule')}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>{t('dashboard.view_all', 'View All')}</Button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activity.upcoming.length > 0 ? activity.upcoming.map(event => (
                <div 
                  key={event._id} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center justify-between group cursor-pointer" 
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="flex items-center gap-4">
                    {/* Calendar Box */}
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
                    {/* ✅ Uses Generic StatusBadge component */}
                    <StatusBadge status={event.status} size="sm" dot={true} />
                    <ArrowRight className="text-gray-300 group-hover:text-orange-500" size={18} />
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">{t('dashboard.upcoming.no_events', 'No upcoming events scheduled.')}</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (33%) */}
        <div className="space-y-8">
          
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-green-500" size={20} /> {t('dashboard.recent_inflow', 'Recent Inflow')}
              </h3>
            </div>
            <div>
              {activity.payments.length > 0 ? activity.payments.map((pay, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <span className="text-xs font-bold">$</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {pay.clientId?.name || "Client Payment"}
                      </span>
                      {/* ✅ Fixed Date Format to DD/MM/YYYY */}
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
                <div className="p-6 text-center text-gray-500 text-sm">{t('dashboard.no_payments', 'No recent payments.')}</div>
              )}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 text-center">
              <button onClick={() => navigate('/finance')} className="text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700">
                {t('dashboard.view_financial', 'View Financial Report')}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <LayoutDashboard size={18} /> {t('dashboard.quick_actions', 'Quick Actions')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionBtn icon={Plus} label={t('dashboard.actions.new_event', "New Event")} onClick={() => navigate('/events/new')} />
              <QuickActionBtn icon={Users} label={t('dashboard.actions.add_client', "Add Client")} onClick={() => navigate('/clients')} />
              <QuickActionBtn icon={FileText} label={t('dashboard.actions.new_invoice', "New Invoice")} onClick={() => navigate('/invoices')} />
              <QuickActionBtn icon={Settings} label={t('dashboard.actions.settings', "Settings")} onClick={() => navigate('/settings')} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

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
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
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
        {subValue && <span className="text-xs text-gray-400 ml-auto truncate max-w-[120px]" title={subValue}>{subValue}</span>}
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