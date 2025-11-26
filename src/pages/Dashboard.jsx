// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

// Components
import Button from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Utils
import formatCurrency from "../utils/formatCurrency";

// Icons
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Target,
  TrendingDown as TrendingDownIcon,
  Activity,
  BarChart3,
  PieChart,
  Mail,
  Phone,
  MapPin,
  Eye,
  Receipt,
  RefreshCw,
  AlertCircle,
  XCircle,
  Bell
} from "lucide-react";

// Chart.js
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
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, Filler, ArcElement
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDateDDMMYYYY = (isoDate) => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("en-GB");
  } catch {
    return "";
  }
};

const extractArray = (response, ...keys) => {
  if (!response) return [];
  for (const key of keys) {
    const value = response[key];
    if (Array.isArray(value)) return value;
  }
  if (response.data) {
    for (const key of keys) {
      const value = response.data[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
};

// ============================================
// COLLAPSIBLE CARD COMPONENT
// ============================================

const CollapsibleCard = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = false,
  summary = null,
  iconColor = "orange"
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const iconColorClasses = {
    orange: "text-orange-500",
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`${iconColorClasses[iconColor]}`} size={20} />}
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {summary && !isExpanded && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{summary}</span>
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// METRIC CARD COMPONENT
// ============================================

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  subValue, 
  icon: Icon, 
  color,
  onClick = null,
  loading = false
}) => {
  const colorClasses = {
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                {title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            {trend !== undefined && (
              <div className={`flex items-center text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDownIcon size={14} className="mr-1" />}
                {Math.abs(Number(trend).toFixed(1))}%
              </div>
            )}
            {subValue && (
              <span className="text-xs text-gray-400 ml-auto truncate max-w-[120px]" title={subValue}>
                {subValue}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

const ProgressBar = ({ value, max, label, color = "orange" }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const colorClasses = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500"
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`${colorClasses[color]} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// MINI CALENDAR COMPONENT
// ============================================

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
    } catch {
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
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded uppercase tracking-wide">
          {t('dashboard.calendar.occupancy')}
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

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiError } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  
  const [metrics, setMetrics] = useState({
    revenue: { current: 0, growth: 0, outstanding: 0, lastMonth: 0 },
    occupancy: { rate: 0, totalEvents: 0 },
    leads: { conversionRate: 0, pending: 0 },
    operations: { pendingTasks: 0, urgentReminders: 0 }
  });

  const [cashFlow, setCashFlow] = useState({
    inflow: 0,
    outflow: 0,
    net: 0,
    receivables: 0,
    payables: 0
  });

  const [charts, setCharts] = useState({
    revenueTrend: { labels: [], datasets: [] },
    eventDistribution: { labels: [], datasets: [] }
  });

  const [activity, setActivity] = useState({
    todayEvents: [],
    upcoming: [],
    payments: [],
    actions: [],
    riskyEvents: [],
    pendingLeads: [],
    allEvents: [],
    recentActivity: []
  });

  const [insights, setInsights] = useState({
    pipeline: { enquiries: 0, quoted: 0, confirmed: 0, completed: 0 },
    retention: { new: 0, returning: 0, ltv: 0 },
    responseTime: { avg: 0, target: 2, slowest: 0 },
    cancellation: { rate: 0, lost: 0, reason: '' },
    avgEventValue: { current: 0, lastMonth: 0, trend: 0 },
    eventCategories: {}
  });

  const [goals, setGoals] = useState({
    revenue: { current: 0, target: 50000 },
    bookings: { current: 0, target: 20 },
    avgValue: { current: 0, target: 3500 }
  });

  const [currentDateContext, setCurrentDateContext] = useState(new Date());

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parallel fetching with error handling
        const [dashboardRes, eventsRes, paymentsRes, tasksRes, invoicesRes, venueRes] = 
          await Promise.allSettled([
            dashboardService.getStats(),
            eventService.getAll({ limit: 100, includeArchived: false }),
            paymentService.getAll({ limit: 100 }),
            taskService.getMyTasks(),
            invoiceService.getStats(),
            venueService.getMe()
          ]);

        // Extract data safely
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

        // Date context
        let relevantDate = new Date();
        if (allEvents.length > 0) {
          const sortedEvents = [...allEvents].sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
          );
          const nextEvent = sortedEvents.find(e => 
            new Date(e.startDate) >= new Date().setHours(0,0,0,0)
          );
          if (nextEvent) relevantDate = new Date(nextEvent.startDate);
        }

        setCurrentDateContext(relevantDate);
        const currentMonth = relevantDate.getMonth();
        const currentYear = relevantDate.getFullYear();
        const now = new Date();

        // ============================================
        // METRICS CALCULATION
        // ============================================

        // Revenue
        const currentMonthPayments = allPayments.filter(p => {
          const paymentDate = new Date(p.paidDate || p.createdAt);
          return paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        });
        
        const currentMonthRevenue = currentMonthPayments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0), 0
        );

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const lastMonthPayments = allPayments.filter(p => {
          const paymentDate = new Date(p.paidDate || p.createdAt);
          return paymentDate.getMonth() === lastMonth && 
                 paymentDate.getFullYear() === lastMonthYear;
        });
        
        const lastMonthRevenue = lastMonthPayments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0), 0
        );

        const revenueGrowth = lastMonthRevenue > 0 
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : (currentMonthRevenue > 0 ? 100 : 0);

        // Occupancy
        const currentMonthEvents = allEvents.filter(e => {
          if (!e.startDate) return false;
          const eventDate = new Date(e.startDate);
          return eventDate.getMonth() === currentMonth && 
                 eventDate.getFullYear() === currentYear;
        });
        
        const maxCapacity = venueData?.capacity?.max || 30;
        const occupancyRate = maxCapacity > 0 
          ? Math.min(Math.round((currentMonthEvents.length / maxCapacity) * 100), 100)
          : 0;

        // Leads
        const pendingEvents = allEvents.filter(e => e.status === 'pending');
        const confirmedEvents = allEvents.filter(e => 
          ['confirmed', 'completed', 'paid', 'in-progress'].includes(e.status?.toLowerCase())
        );
        
        const totalLeads = pendingEvents.length + confirmedEvents.length;
        const conversionRate = totalLeads > 0 
          ? Math.round((confirmedEvents.length / totalLeads) * 100)
          : 0;

        // Operations
        const pendingTasks = allTasks.filter(t => t.status !== 'completed');
        const urgentTasks = allTasks.filter(t => 
          (t.priority === 'high' || t.priority === 'urgent') && 
          t.status !== 'completed'
        );

        setMetrics({
          revenue: { 
            current: currentMonthRevenue, 
            growth: revenueGrowth, 
            outstanding: invoiceStats.totalDue || 0,
            lastMonth: lastMonthRevenue
          },
          occupancy: { 
            rate: occupancyRate, 
            totalEvents: currentMonthEvents.length 
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

        // ============================================
        // CASH FLOW CALCULATION
        // ============================================

        const totalInflow = currentMonthPayments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0), 0
        );
        
        // Estimate outflow from finance records if available
        const estimatedOutflow = totalInflow * 0.65; // Placeholder
        const netCash = totalInflow - estimatedOutflow;

        setCashFlow({
          inflow: totalInflow,
          outflow: estimatedOutflow,
          net: netCash,
          receivables: invoiceStats.totalDue || 0,
          payables: estimatedOutflow * 0.2 // Placeholder
        });

        // ============================================
        // ACTIVITY DATA
        // ============================================

        // Today's events
        const todayEvents = allEvents.filter(e => {
          if (!e.startDate) return false;
          const eventDate = new Date(e.startDate);
          return eventDate.toDateString() === now.toDateString();
        });

        // Upcoming events
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingEvents = allEvents
          .filter(e => {
            if (!e.startDate) return false;
            const eventDate = new Date(e.startDate);
            return eventDate >= now && eventDate <= thirtyDaysFromNow;
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5);

        // Recent payments
        const recentPayments = [...allPayments]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Risky events
        const riskyEvents = allEvents
          .filter(e => 
            ['confirmed', 'in-progress'].includes(e.status?.toLowerCase()) &&
            (!e.partners || e.partners.length === 0) &&
            new Date(e.startDate) >= now
          )
          .slice(0, 3);

        // Action items
        const actionItems = [];
        if (invoiceStats.overdue > 0) {
          actionItems.push({ 
            type: 'critical', 
            text: t('dashboard.actions.overdue_invoices', { count: invoiceStats.overdue }),
            link: '/invoices?status=overdue' 
          });
        }
        if (pendingEvents.length > 0) {
          actionItems.push({ 
            type: 'warning', 
            text: t('dashboard.actions.new_enquiries', { count: pendingEvents.length }),
            link: '/events?status=pending' 
          });
        }
        if (urgentTasks.length > 0) {
          actionItems.push({ 
            type: 'info', 
            text: t('dashboard.actions.urgent_tasks', { count: urgentTasks.length }),
            link: '/tasks' 
          });
        }

        // Recent activity
        const recentActivity = [
          ...recentPayments.slice(0, 2).map(p => ({
            type: 'payment',
            text: t('dashboard.activity.payment_received', { 
              amount: formatCurrency(p.amount),
              client: p.clientId?.name || 'Client'
            }),
            time: p.createdAt,
            icon: DollarSign
          })),
          ...upcomingEvents.slice(0, 2).map(e => ({
            type: 'booking',
            text: t('dashboard.activity.new_booking', { title: e.title }),
            time: e.createdAt,
            icon: CalendarIcon
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);

        setActivity({
          todayEvents,
          upcoming: upcomingEvents,
          payments: recentPayments,
          actions: actionItems,
          riskyEvents,
          pendingLeads: pendingEvents.slice(0, 5),
          allEvents,
          recentActivity
        });

        // ============================================
        // INSIGHTS CALCULATION
        // ============================================

        // Pipeline
        const quotedEvents = allEvents.filter(e => e.status === 'quoted' || e.quoted);
        const completedEvents = allEvents.filter(e => e.status === 'completed');

        // Retention
        const clientEvents = allEvents.reduce((acc, event) => {
          const clientId = event.clientId?._id || event.clientId;
          if (!clientId) return acc;
          acc[clientId] = (acc[clientId] || 0) + 1;
          return acc;
        }, {});

        const newClients = Object.values(clientEvents).filter(count => count === 1).length;
        const returningClients = Object.values(clientEvents).filter(count => count > 1).length;
        const avgLTV = confirmedEvents.reduce((sum, e) => 
          sum + (e.pricing?.totalAmount || 0), 0
        ) / (newClients + returningClients || 1);

        // Response time (placeholder - would need actual tracking)
        const avgResponseTime = 3.2;
        const slowestResponseTime = 8.5;

        // Cancellation
        const cancelledEvents = allEvents.filter(e => e.status === 'cancelled');
        const cancellationRate = allEvents.length > 0 
          ? (cancelledEvents.length / allEvents.length) * 100 
          : 0;
        const cancelledRevenue = cancelledEvents.reduce((sum, e) => 
          sum + (e.pricing?.totalAmount || 0), 0
        );

        // Event categories
        const categories = allEvents.reduce((acc, e) => {
          const type = e.type || 'other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        // Avg event value
        const currentAvgValue = confirmedEvents.length > 0
          ? confirmedEvents.reduce((sum, e) => sum + (e.pricing?.totalAmount || 0), 0) / confirmedEvents.length
          : 0;

        const lastMonthEvents = allEvents.filter(e => {
          const eventDate = new Date(e.startDate);
          return eventDate.getMonth() === lastMonth && 
                 eventDate.getFullYear() === lastMonthYear &&
                 ['confirmed', 'completed'].includes(e.status?.toLowerCase());
        });

        const lastMonthAvgValue = lastMonthEvents.length > 0
          ? lastMonthEvents.reduce((sum, e) => sum + (e.pricing?.totalAmount || 0), 0) / lastMonthEvents.length
          : 0;

        const avgValueTrend = lastMonthAvgValue > 0
          ? ((currentAvgValue - lastMonthAvgValue) / lastMonthAvgValue) * 100
          : 0;

        setInsights({
          pipeline: {
            enquiries: pendingEvents.length,
            quoted: quotedEvents.length,
            confirmed: confirmedEvents.length,
            completed: completedEvents.length
          },
          retention: {
            new: newClients,
            returning: returningClients,
            ltv: avgLTV
          },
          responseTime: {
            avg: avgResponseTime,
            target: 2,
            slowest: slowestResponseTime
          },
          cancellation: {
            rate: cancellationRate,
            lost: cancelledRevenue,
            reason: 'Date conflict' // Placeholder
          },
          avgEventValue: {
            current: currentAvgValue,
            lastMonth: lastMonthAvgValue,
            trend: avgValueTrend
          },
          eventCategories: categories
        });

        // ============================================
        // GOALS CALCULATION
        // ============================================

        setGoals({
          revenue: { 
            current: currentMonthRevenue, 
            target: 50000 
          },
          bookings: { 
            current: currentMonthEvents.length, 
            target: 20 
          },
          avgValue: { 
            current: currentAvgValue, 
            target: 3500 
          }
        });

        // ============================================
        // CHARTS DATA
        // ============================================

        // Event Distribution
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
          else statusCounts.Pending++;
        });

        // Revenue Trend (last 6 months)
        const monthNames = [];
        const revenueData = [];
        const lastYearData = [];
        
        for (let i = 5; i >= 0; i--) {
          const targetMonth = currentMonth - i;
          const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
          const adjustedMonth = targetMonth < 0 ? 12 + targetMonth : targetMonth;
          
          const monthName = new Date(targetYear, adjustedMonth, 1)
            .toLocaleString('default', { month: 'short' });
          monthNames.push(monthName);
          
          // Current year revenue
          const monthRevenue = allPayments
            .filter(p => {
              const paymentDate = new Date(p.paidDate || p.createdAt);
              return paymentDate.getMonth() === adjustedMonth && 
                     paymentDate.getFullYear() === targetYear;
            })
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          
          revenueData.push(monthRevenue);
          
          // Last year revenue (placeholder)
          lastYearData.push(monthRevenue * 0.85);
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
            datasets: [
              {
                label: t('dashboard.charts.current_year'),
                data: revenueData,
                borderColor: '#F97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#F97316',
                pointRadius: 4,
                pointHoverRadius: 6
              },
              {
                label: t('dashboard.charts.last_year'),
                data: lastYearData,
                borderColor: '#94a3b8',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderDash: [5, 5],
                pointRadius: 3,
                pointHoverRadius: 5
              }
            ]
          }
        });

      } catch (error) {
        console.error("Dashboard fetch error:", error);
        apiError(error, t('dashboard.errors.fetch_failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiError, t]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            {t('dashboard.loading')}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* ============================================ */}
      {/* TODAY'S COMMAND CENTER */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard size={28} />
              {t('dashboard.today.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button 
            variant="white" 
            size="sm"
            onClick={() => navigate('/events')}
            className="bg-white text-gray-600 hover:bg-gray-50"
          >
            {t('dashboard.today.view_schedule')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CalendarIcon size={24} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.today.events')}</p>
                <p className="text-2xl font-bold">{activity.todayEvents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign size={24} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.today.expected_revenue')}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    activity.todayEvents.reduce((sum, e) => 
                      sum + (e.pricing?.totalAmount || 0), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.today.pending_tasks')}</p>
                <p className="text-2xl font-bold">{metrics.operations.pendingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Events List */}
        {activity.todayEvents.length > 0 && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} />
              {t('dashboard.today.events_list')}
            </h3>
            <div className="space-y-2">
              {activity.todayEvents.map(event => (
                <div 
                  key={event._id}
                  className="bg-white/10 rounded p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-semibold">{event.startTime || '00:00'}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.clientId?.name} • {event.guestCount} {t('dashboard.today.guests')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* ACTION CENTER */}
      {/* ============================================ */}
      {activity.actions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-gray-500 dark:text-gray-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('dashboard.actions.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activity.actions.map((action, idx) => (
              <div
                key={idx}
                onClick={() => navigate(action.link)}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  ${action.type === 'critical' 
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                    : action.type === 'warning' 
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'}`}
              >
                {action.type === 'critical' ? (
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                ) : action.type === 'warning' ? (
                  <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                ) : (
                  <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                )}
                <div className="flex-1">
                  <p className={`font-semibold text-sm
                    ${action.type === 'critical' 
                      ? 'text-red-700 dark:text-red-300' 
                      : action.type === 'warning' 
                      ? 'text-amber-700 dark:text-amber-300' 
                      : 'text-blue-700 dark:text-blue-300'}`}
                  >
                    {action.text}
                  </p>
                </div>
                <ArrowRight size={18} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FINANCIAL COMMAND CENTER */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="text-orange-500" size={24} />
          {t('dashboard.financial.title')}
        </h2>
        
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <MetricCard
            title={t('dashboard.financial.cash_position')}
            value={formatCurrency(cashFlow.net)}
            icon={Wallet}
            color="green"
            subValue={t('dashboard.financial.net_cash')}
          />
          <MetricCard
            title={t('dashboard.financial.monthly_revenue')}
            value={formatCurrency(metrics.revenue.current)}
            trend={metrics.revenue.growth}
            icon={TrendingUp}
            color="orange"
            subValue={t('dashboard.financial.vs_last_month')}
          />
          <MetricCard
            title={t('dashboard.financial.bookings')}
            value={metrics.occupancy.totalEvents}
            icon={CalendarIcon}
            color="blue"
            subValue={`${metrics.leads.conversionRate}% ${t('dashboard.financial.conversion')}`}
          />
          <MetricCard
            title={t('dashboard.financial.avg_value')}
            value={formatCurrency(insights.avgEventValue.current)}
            trend={insights.avgEventValue.trend}
            icon={Target}
            color="purple"
            subValue={t('dashboard.financial.per_event')}
          />
        </div>

        {/* Expandable Sections */}
        <div className="space-y-4">
          
          {/* Cash Flow Details */}
          <CollapsibleCard
            title={t('dashboard.financial.cash_flow_details')}
            icon={Activity}
            iconColor="blue"
            summary={`${t('dashboard.financial.net')}: ${formatCurrency(cashFlow.net)}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('dashboard.financial.money_in')}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(cashFlow.inflow)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('dashboard.financial.money_out')}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(cashFlow.outflow)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('dashboard.financial.net_cash')}
                </p>
                <p className={`text-2xl font-bold ${cashFlow.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(cashFlow.net)}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
                {t('dashboard.financial.upcoming')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.financial.receivables')}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(cashFlow.receivables)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.financial.payables')}
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(cashFlow.payables)}
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* Invoice Aging */}
          <CollapsibleCard
            title={t('dashboard.financial.invoice_aging')}
            icon={Receipt}
            iconColor="orange"
            summary={`${t('dashboard.financial.outstanding')}: ${formatCurrency(metrics.revenue.outstanding)}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-300">
                    {t('dashboard.financial.aging_0_30')}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    4 {t('dashboard.financial.invoices')}
                  </p>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(metrics.revenue.outstanding * 0.7)}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-300">
                    {t('dashboard.financial.aging_31_60')}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    2 {t('dashboard.financial.invoices')}
                  </p>
                </div>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(metrics.revenue.outstanding * 0.2)}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-300">
                    {t('dashboard.financial.aging_60_plus')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    1 {t('dashboard.financial.invoices')} - {t('dashboard.financial.critical')}
                  </p>
                </div>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(metrics.revenue.outstanding * 0.1)}
                </p>
              </div>
            </div>
          </CollapsibleCard>

          {/* Goals Progress */}
          <CollapsibleCard
            title={t('dashboard.financial.goals_this_month')}
            icon={Target}
            iconColor="purple"
            summary={`${t('dashboard.financial.revenue')}: ${Math.round((goals.revenue.current / goals.revenue.target) * 100)}%`}
          >
            <div className="space-y-6">
              <ProgressBar
                value={goals.revenue.current}
                max={goals.revenue.target}
                label={`${t('dashboard.financial.revenue')}: ${formatCurrency(goals.revenue.current)} / ${formatCurrency(goals.revenue.target)}`}
                color="orange"
              />
              <ProgressBar
                value={goals.bookings.current}
                max={goals.bookings.target}
                label={`${t('dashboard.financial.bookings')}: ${goals.bookings.current} / ${goals.bookings.target}`}
                color="blue"
              />
              <ProgressBar
                value={goals.avgValue.current}
                max={goals.avgValue.target}
                label={`${t('dashboard.financial.avg_value')}: ${formatCurrency(goals.avgValue.current)} / ${formatCurrency(goals.avgValue.target)}`}
                color="purple"
              />
            </div>
          </CollapsibleCard>

        </div>
      </div>

      {/* ============================================ */}
      {/* CALENDAR & BOOKING OVERVIEW */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="text-orange-500" size={24} />
          {t('dashboard.calendar.title')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mini Calendar */}
          <div>
            <MiniCalendar 
              events={activity.allEvents} 
              displayDate={currentDateContext} 
            />
            
            {/* Occupancy Stats */}
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.calendar.occupancy_rate')}
                </span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {metrics.occupancy.rate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.occupancy.rate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metrics.occupancy.totalEvents}/{30} {t('dashboard.calendar.days_booked')}
              </p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={18} />
                  {t('dashboard.calendar.upcoming_events')}
                </h3>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.clientId?.name || t('dashboard.calendar.unknown_client')} • {event.guestCount || 0} {t('dashboard.calendar.guests')}
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
                    {t('dashboard.calendar.no_upcoming')}
                  </div>
                )}
              </div>
            </div>

            {/* Risky Events Warning */}
            {activity.riskyEvents.length > 0 && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                  <h4 className="font-bold text-red-900 dark:text-red-300">
                    {t('dashboard.calendar.missing_vendors')}
                  </h4>
                </div>
                <div className="space-y-2">
                  {activity.riskyEvents.map(event => (
                    <div
                      key={event._id}
                      className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {event.title}
                      </span>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => navigate(`/events/${event._id}/detail`)}
                      >
                        {t('dashboard.calendar.assign_now')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* PERFORMANCE METRICS WITH TABS */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="text-orange-500" size={24} />
          {t('dashboard.performance.title')}
        </h2>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {['revenue', 'events', 'clients'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t(`dashboard.performance.tabs.${tab}`)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="h-80">
                  <Line
                    data={charts.revenueTrend}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top'
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => formatCurrency(context.parsed.y)
                          }
                        }
                      },
                      scales: {
                        y: {
                          grid: { color: '#f3f4f6' },
                          ticks: {
                            callback: (value) => formatCurrency(value)
                          }
                        },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('dashboard.performance.current_month')}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(metrics.revenue.current)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('dashboard.performance.last_month')}
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(metrics.revenue.lastMonth)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('dashboard.performance.growth')}
                    </p>
                    <p className={`text-2xl font-bold ${metrics.revenue.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metrics.revenue.growth >= 0 ? '+' : ''}{metrics.revenue.growth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80 flex items-center justify-center">
                  <Doughnut
                    data={charts.eventDistribution}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: {
                        legend: { position: 'right' }
                      }
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {t('dashboard.performance.event_breakdown')}
                  </h4>
                  {Object.entries(insights.eventCategories).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {type}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                    {t('dashboard.performance.client_retention')}
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('dashboard.performance.new_clients')}
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {insights.retention.new}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${(insights.retention.new / (insights.retention.new + insights.retention.returning)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('dashboard.performance.returning_clients')}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {insights.retention.returning}
                        </span>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-2">
                        <div
                          className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                          style={{
                            width: `${(insights.retention.returning / (insights.retention.new + insights.retention.returning)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t('dashboard.performance.avg_ltv')}
                      </p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(insights.retention.ltv)}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                    {t('dashboard.performance.sales_pipeline')}
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: t('dashboard.performance.enquiries'), value: insights.pipeline.enquiries, color: 'yellow' },
                      { label: t('dashboard.performance.quoted'), value: insights.pipeline.quoted, color: 'blue' },
                      { label: t('dashboard.performance.confirmed'), value: insights.pipeline.confirmed, color: 'green' },
                      { label: t('dashboard.performance.completed'), value: insights.pipeline.completed, color: 'purple' }
                    ].map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{stage.label}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{stage.value}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`bg-${stage.color}-500 h-2 rounded-full`}
                              style={{
                                width: `${(stage.value / insights.pipeline.enquiries) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        {idx < 3 && <ChevronRight size={16} className="text-gray-400" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('dashboard.performance.conversion_rate')}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {insights.pipeline.enquiries > 0
                          ? Math.round((insights.pipeline.confirmed / insights.pipeline.enquiries) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* BUSINESS INSIGHTS */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChart className="text-orange-500" size={24} />
          {t('dashboard.insights.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Lead Response Time */}
          <CollapsibleCard
            title={t('dashboard.insights.response_time')}
            icon={Clock}
            iconColor="blue"
            summary={`${t('dashboard.insights.avg')}: ${insights.responseTime.avg}h`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.insights.average')}</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.responseTime.avg}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.insights.target')}</span>
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  &lt;{insights.responseTime.target}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.insights.slowest')}</span>
                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {insights.responseTime.slowest}h
                </span>
              </div>
              <div className={`p-3 rounded-lg ${
                insights.responseTime.avg <= insights.responseTime.target
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                <p className="text-sm font-medium">
                  {insights.responseTime.avg <= insights.responseTime.target
                    ? t('dashboard.insights.on_target')
                    : t('dashboard.insights.needs_improvement')}
                </p>
              </div>
            </div>
          </CollapsibleCard>

          {/* Cancellation Analysis */}
          <CollapsibleCard
            title={t('dashboard.insights.cancellation')}
            icon={XCircle}
            iconColor="red"
            summary={`${insights.cancellation.rate.toFixed(1)}% ${t('dashboard.insights.rate')}`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.insights.cancellation_rate')}</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {insights.cancellation.rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.insights.revenue_lost')}</span>
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {formatCurrency(insights.cancellation.lost)}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('dashboard.insights.main_reason')}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {insights.cancellation.reason}
                </p>
              </div>
            </div>
          </CollapsibleCard>

        </div>
      </div>

      {/* ============================================ */}
      {/* BOTTOM SECTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="text-purple-500" size={20} />
            {t('dashboard.leads.title')}
          </h3>
          <div className="space-y-4">
            {activity.pendingLeads.length > 0 ? activity.pendingLeads.map(event => (
              <div key={event._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
                    {event.clientId?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                      {event.clientId?.name || t('dashboard.leads.unknown')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
                {t('dashboard.leads.no_pending')}
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="text-green-500" size={20} />
            {t('dashboard.activity.title')}
          </h3>
          <div className="space-y-3">
            {activity.recentActivity.length > 0 ? activity.recentActivity.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.time).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-400 text-center py-4">
                {t('dashboard.activity.no_recent')}
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;