// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import formatCurrency from "../utils/formatCurrency";

// Hooks & API
import useToast from "../hooks/useToast";
import {
  eventService,
  paymentService,
  venueService,
  invoiceService,
  financeService,
  supplyService,
} from "../api/index";

// Components
import Button from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";

// Icons
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  Wallet,
  LayoutDashboard,
  Download,
  FileText,
  DollarSign,
  Target,
  Loader2,
  ChevronRight,
  Bell,
  ArrowUpRight,
  Package,
  AlertTriangle,
  ExternalLink,
  Box,
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
  ArcElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
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
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDateDDMMYYYY = (isoDate, locale = "fr-FR") => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
// REUSABLE COMPONENTS
// ============================================

const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border border-gray-200 rounded-2xl p-6 ${
      onClick ? "cursor-pointer hover:border-orange-200 transition-colors" : ""
    } ${className}`}
  >
    {children}
  </div>
);

const MetricCard = ({
  title,
  value,
  trend,
  subValue,
  icon: Icon,
  variant = "default",
  color = "orange",
}) => {
  const isSolid = variant === "solid";

  const colors = {
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
    red: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  };

  const currentTheme = colors[color] || colors.orange;

  if (isSolid) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden group cursor-default">
        <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Icon size={20} className="text-white" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/10 text-white">
              {trend > 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
        <div className="mt-4 relative z-10">
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          <p className="text-sm text-gray-300 font-medium mt-1">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2.5 rounded-xl ${currentTheme.bg} ${currentTheme.text} group-hover:scale-110 transition-transform`}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trend >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
          {value}
        </h3>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">
          {title}
        </p>
      </div>
      {subValue && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${currentTheme.bg
              .replace("bg-", "bg-")
              .replace("50", "500")}`}
          ></div>
          <span className="text-xs text-gray-400 font-medium">{subValue}</span>
        </div>
      )}
    </div>
  );
};

const MiniCalendar = ({ events = [], displayDate }) => {
  const { i18n } = useTranslation();
  const baseDate = displayDate || new Date();
  const daysInMonth = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    1
  ).getDay();
  const today = new Date();
  const isCurrentMonth =
    baseDate.getMonth() === today.getMonth() &&
    baseDate.getFullYear() === today.getFullYear();

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2023, 0, i + 1);
      days.push(d.toLocaleDateString(i18n.language, { weekday: "narrow" }));
    }
    return days;
  }, [i18n.language]);

  const getDayStatus = (day) => {
    try {
      const dateStr = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        day
      ).toDateString();
      const event = events.find(
        (e) => e.startDate && new Date(e.startDate).toDateString() === dateStr
      );
      if (!event) return null;
      return ["confirmed", "completed", "paid", "in-progress"].includes(
        event.status?.toLowerCase()
      )
        ? "booked"
        : "pending";
    } catch {
      return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">
          {baseDate.toLocaleString(i18n.language, {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
          <Calendar size={16} />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2 flex-1">
        {weekDays.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div key={day} className="flex items-center justify-center">
              <div
                className={`
                w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                ${
                  isToday
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "text-gray-700"
                }
                ${
                  !isToday && status === "booked"
                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100"
                    : ""
                }
                ${
                  !isToday && status === "pending"
                    ? "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100"
                    : ""
                }
                ${!isToday && !status ? "hover:bg-gray-50" : ""}
              `}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // State Management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [generatingReceipt, setGeneratingReceipt] = useState(false);

  // Data States
  const [eventsData, setEventsData] = useState({
    todayEvents: [],
    upcomingEvents: [],
    allEvents: [],
    totalEvents: 0,
    confirmedEvents: 0,
    pendingEvents: 0,
    occupancyRate: 0,
    eventDistribution: {},
  });

  const [expensesData, setExpensesData] = useState({
    totalExpenses: 0,
    expensesByCategory: {},
    expenseTrend: { labels: [], datasets: [] },
  });

  const [financeData, setFinanceData] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    outstandingInvoices: 0,
    cashFlow: { inflow: 0, outflow: 0, net: 0 },
    recentPayments: [],
    revenueTrend: { labels: [], datasets: [] },
  });

  const [supplyData, setSupplyData] = useState({
    totalSupplies: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [currentDateContext] = useState(new Date());

  // ============================================
  // CSV GENERATION FUNCTION
  // ============================================

  const generateMonthlyReceiptCSV = () => {
    try {
      setGeneratingReceipt(true);

      const currentMonth = new Date();
      const monthName = currentMonth.toLocaleDateString('fr-FR', { month: "long" }).toUpperCase();
      const yearShort = currentMonth.getFullYear().toString().slice(-2);
      const title = `${monthName}-${yearShort}`;

      // Filter payments for current month (Income only)
      const receipts = financeData.recentPayments.filter((payment) => {
        const paymentDate = new Date(payment.paidDate || payment.createdAt);
        return (
          paymentDate.getMonth() === currentMonth.getMonth() &&
          paymentDate.getFullYear() === currentMonth.getFullYear() &&
          payment.type === "income"
        );
      });

      // Headers corresponding to the Excel file
      const headers = [
        "Date",
        "Mois",
        "Nom et Prenom",
        "Evenement",
        "Prix",
        "A Compte",
        "N° Reçu",
        "Reste a payer",
        "Status",
        "Date de Ver"
      ];

      // Calculate totals
      let totalPrix = 0;
      let totalAcompte = 0;
      let totalReste = 0;

      // Prepare Data Rows
      const rows = receipts.map((payment) => {
        const pDate = new Date(payment.paidDate || payment.createdAt);
        const dateStr = formatDateDDMMYYYY(pDate);
        // Format Month like "oct-25"
        const monthStr = pDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }).replace('.', '');
        
        const name = (payment.client?.name || "Client").substring(0, 30);
        const eventName = (payment.event?.title || payment.description || "Event").substring(0, 30);
        
        const price = payment.amount || 0;
        const advance = payment.fees?.processingFee || 0; // Assuming this logic based on previous context
        const remaining = price - advance;
        const receiptNo = payment.reference || "";
        const status = "payer"; // Or dynamic status logic
        const dateVer = payment.verificationDate ? formatDateDDMMYYYY(payment.verificationDate) : "";

        // Accumulate totals
        totalPrix += price;
        totalAcompte += advance;
        totalReste += remaining;

        // Escape helper for CSV (handles quotes inside content)
        const safe = (str) => `"${String(str || "").replace(/"/g, '""')}"`;

        return [
          safe(dateStr),
          safe(monthStr),
          safe(name),
          safe(eventName),
          price, // Numbers don't need quotes usually, allows Excel math
          advance,
          safe(receiptNo),
          remaining,
          safe(status),
          safe(dateVer)
        ].join(",");
      });

      // Totals Row
      const totalsRow = [
        "", "", "", "TOTAUX", 
        totalPrix, 
        totalAcompte, 
        "", 
        totalReste, 
        "", ""
      ].join(",");

      // Combine CSV Content
      // \uFEFF is the BOM (Byte Order Mark) so Excel opens UTF-8 correctly with French chars
      const csvContent = "\uFEFF" + [headers.join(","), ...rows, totalsRow].join("\n");

      // Download Trigger
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Recette_${title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess("Receipt CSV downloaded successfully!");
    } catch (error) {
      console.error("Error generating CSV:", error);
      showError("Failed to generate CSV");
    } finally {
      setGeneratingReceipt(false);
    }
  };

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          eventsRes,
          paymentsRes,
          financeRes,
          invoicesRes,
          venueRes,
          suppliesRes,
        ] = await Promise.allSettled([
          eventService.getAll({ limit: 100 }),
          paymentService.getAll({ limit: 100 }),
          financeService?.getAll?.({ limit: 100 }) ||
            Promise.resolve({ data: [] }),
          invoiceService.getStats(),
          venueService.getMe(),
          supplyService.getAll({ limit: 200, status: "active" }),
        ]);

        // Extract data
        const allEvents = extractArray(
          eventsRes.status === "fulfilled" ? eventsRes.value : {},
          "events",
          "data"
        );
        const allPayments = extractArray(
          paymentsRes.status === "fulfilled" ? paymentsRes.value : {},
          "payments",
          "data"
        );
        const allFinances = extractArray(
          financeRes.status === "fulfilled" ? financeRes.value : {},
          "finances",
          "data"
        );
        const venueData =
          venueRes.status === "fulfilled"
            ? venueRes.value?.data?.venue || venueRes.value?.venue || {}
            : {};
        const invoiceStats =
          invoicesRes.status === "fulfilled"
            ? invoicesRes.value?.data?.stats || invoicesRes.value?.stats || {}
            : {};
        const allSupplies = extractArray(
          suppliesRes.status === "fulfilled" ? suppliesRes.value : {},
          "supplies",
          "data"
        );

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Process Events
        const todayEvents = allEvents.filter(
          (e) =>
            e.startDate &&
            new Date(e.startDate).toDateString() === now.toDateString()
        );
        const upcomingEvents = allEvents
          .filter((e) => e.startDate && new Date(e.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5);
        const confirmedEvents = allEvents.filter((e) =>
          ["confirmed", "completed", "paid", "in-progress"].includes(
            e.status?.toLowerCase()
          )
        );

        const maxCapacity = venueData?.capacity?.max || 30;
        const currentMonthEvents = allEvents.filter(
          (e) =>
            e.startDate && new Date(e.startDate).getMonth() === currentMonth
        );
        const occupancyRate =
          maxCapacity > 0
            ? Math.min(
                Math.round((currentMonthEvents.length / maxCapacity) * 100),
                100
              )
            : 0;

        // Process Finance
        const currentMonthFinances = allFinances.filter((f) => {
          const d = new Date(f.date || f.createdAt);
          return (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear &&
            f.type === "expense"
          );
        });
        const totalExpenses = currentMonthFinances.reduce(
          (acc, curr) => acc + (Number(curr.amount) || 0),
          0
        );

        const currentMonthPayments = allPayments.filter((p) => {
          const d = new Date(p.paidDate || p.createdAt);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        });
        const totalRevenue = currentMonthPayments.reduce(
          (acc, curr) => acc + (Number(curr.amount) || 0),
          0
        );

        // Process Supplies
        const totalSupplies = allSupplies.length;
        const totalValue = allSupplies.reduce((sum, supply) => {
          const value = (supply.currentStock || 0) * (supply.costPerUnit || 0);
          return sum + value;
        }, 0);
        const lowStockSupplies = allSupplies.filter(
          (s) => s.currentStock <= s.minimumStock && s.currentStock > 0
        );
        const outOfStockSupplies = allSupplies.filter(
          (s) => s.currentStock === 0
        );

        // Chart Data
        const labels = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        setEventsData({
          todayEvents,
          upcomingEvents,
          allEvents,
          totalEvents: allEvents.length,
          confirmedEvents: confirmedEvents.length,
          pendingEvents: allEvents.length - confirmedEvents.length,
          occupancyRate,
          eventDistribution: {
            Confirmed: confirmedEvents.length,
            Pending: allEvents.length - confirmedEvents.length,
          },
        });

        setExpensesData({
          totalExpenses,
          expensesByCategory: {
            catering: totalExpenses * 0.4,
            decoration: totalExpenses * 0.3,
            labor: totalExpenses * 0.3,
          },
          expenseTrend: {
            labels,
            datasets: [
              {
                label: "Expenses",
                data: [
                  totalExpenses * 0.8,
                  totalExpenses * 0.9,
                  totalExpenses * 0.7,
                  totalExpenses * 1.1,
                  totalExpenses * 0.95,
                  totalExpenses,
                ],
                borderColor: "#000000",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
              },
            ],
          },
        });

        setFinanceData({
          totalRevenue,
          revenueGrowth: 8.5,
          outstandingInvoices: invoiceStats.totalDue || 0,
          cashFlow: {
            inflow: totalRevenue,
            outflow: totalExpenses,
            net: totalRevenue - totalExpenses,
          },
          recentPayments: allPayments.slice(0, 5),
          revenueTrend: {
            labels,
            datasets: [
              {
                data: [
                  totalRevenue * 0.8,
                  totalRevenue * 0.9,
                  totalRevenue * 0.7,
                  totalRevenue * 1.1,
                  totalRevenue * 0.95,
                  totalRevenue,
                ],
                borderColor: "#f97316",
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                  gradient.addColorStop(0, "rgba(249, 115, 22, 0.2)");
                  gradient.addColorStop(1, "rgba(249, 115, 22, 0)");
                  return gradient;
                },
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
              },
            ],
          },
          invoiceStats,
        });

        setSupplyData({
          totalSupplies,
          totalValue,
          lowStockCount: lowStockSupplies.length,
          outOfStockCount: outOfStockSupplies.length,
        });

        setLowStockItems(
          lowStockSupplies
            .sort((a, b) => a.currentStock - b.currentStock)
            .slice(0, 5)
        );
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        showError(error, "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          {t("dashboard.status.systemOperational") ||
            "Synchronizing dashboard..."}
        </p>
      </div>
    );
  }

  // ============================================
  // TAB CONFIGURATION
  // ============================================

  const tabs = [
    {
      id: "events",
      label: t("dashboard.tabs.overview"),
      icon: LayoutDashboard,
    },
    {
      id: "expenses",
      label: t("dashboard.tabs.inventory") || "Inventory & Expenses",
      icon: Package,
    },
    { id: "finance", label: t("dashboard.tabs.finance"), icon: Wallet },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              {t("dashboard.welcome")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right mr-4 rtl:mr-0 rtl:ml-4">
              <p className="text-xs font-bold uppercase text-gray-400">
                {t("dashboard.currentDate")}
              </p>
              <p className="text-sm font-semibold">
                {new Date().toLocaleDateString(i18n.language, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <Button
              onClick={generateMonthlyReceiptCSV}
              disabled={generatingReceipt}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingReceipt ? (
                <>
                  <Loader2
                    size={18}
                    className="mr-2 rtl:ml-2 rtl:mr-0 animate-spin"
                  />
                  {t("dashboard.buttons.generating") || "Processing..."}
                </>
              ) : (
                <>
                  <FileText size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("dashboard.buttons.downloadCSV") || "Download Recette"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-xl w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all flex-1 justify-center sm:justify-start
                  ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <tab.icon
                  size={16}
                  className={activeTab === tab.id ? "text-orange-500" : ""}
                />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {t("dashboard.status.systemOperational")}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* TAB 1: EVENTS OVERVIEW */}
          {activeTab === "events" && (
            <div className="space-y-8">
              {/* Top Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title={t("metrics.totalEvents")}
                  value={eventsData.totalEvents}
                  icon={Calendar}
                  color="blue"
                  subValue={t("metrics.allTimeCount")}
                />
                <MetricCard
                  title={t("metrics.confirmed")}
                  value={eventsData.confirmedEvents}
                  icon={CheckCircle2}
                  color="green"
                  trend={4.2}
                  subValue={t("metrics.lockedIn")}
                />
                <MetricCard
                  title={t("metrics.thisMonth")}
                  value={eventsData.occupancyRate + "%"}
                  icon={Target}
                  color="purple"
                  trend={12}
                  subValue={t("metrics.occupancyRate")}
                />
                <MetricCard
                  title={t("metrics.pendingActions")}
                  value={eventsData.pendingEvents}
                  icon={Clock}
                  color="orange"
                  variant="primary"
                  subValue={t("metrics.requiresReview")}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-1 h-full">
                  <MiniCalendar
                    events={eventsData.allEvents}
                    displayDate={currentDateContext}
                  />
                </div>

                {/* Today & Upcoming Events */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Today's Agenda */}
                  <Card className="border-orange-100 bg-orange-50/30">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Bell size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        {t("sections.todaysAgenda")}
                      </h3>
                    </div>

                    {eventsData.todayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {eventsData.todayEvents.map((event) => (
                          <div
                            key={event._id}
                            onClick={() => navigate(`/events/${event._id}`)}
                            className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-orange-300 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {event.startTime || "00:00"}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {event.clientId?.name} • {event.guestCount}{" "}
                                  {t("common.pax")}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={18}
                              className="text-gray-400 rtl:rotate-180"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {t("dashboard.status.noEvents")}
                        </p>
                        <Button
                          variant="link"
                          className="text-orange-600 mt-2"
                          onClick={() => navigate("/events/new")}
                        >
                          {t("dashboard.buttons.scheduleOne")}
                        </Button>
                      </div>
                    )}
                  </Card>

                  {/* Upcoming Events Table */}
                  <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">
                        {t("sections.upcomingEvents")}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/events")}
                      >
                        {t("dashboard.buttons.viewAll")}
                      </Button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {eventsData.upcomingEvents.map((event) => (
                        <div
                          key={event._id}
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 text-center">
                              <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                                {new Date(event.startDate).toLocaleString(
                                  i18n.language,
                                  { month: "short" }
                                )}
                              </div>
                              <div className="text-xl font-bold text-gray-900">
                                {new Date(event.startDate).getDate()}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                {event.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {event.type || "General"} • {event.guestCount}{" "}
                                {t("common.guests")}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={event.status} size="sm" />
                        </div>
                      ))}
                      {eventsData.upcomingEvents.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          {t("dashboard.status.noUpcoming")}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & EXPENSES */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              {/* Header with Action Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("sections.inventoryOverview") ||
                      "Inventory & Supply Overview"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("sections.inventorySubtitle") ||
                      "Real-time stock levels and expense tracking"}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/supplies")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                >
                  <Box size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("dashboard.buttons.manageSupplies") || "Manage Supplies"}
                  <ExternalLink size={16} className="ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>

              {/* Supply Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title={t("metrics.totalSupplies") || "Total Supplies"}
                  value={supplyData.totalSupplies}
                  icon={Package}
                  color="blue"
                  subValue={t("metrics.activeItems") || "Active items"}
                />
                <MetricCard
                  title={t("metrics.inventoryValue") || "Inventory Value"}
                  value={formatCurrency(supplyData.totalValue)}
                  icon={DollarSign}
                  color="green"
                  subValue={t("metrics.totalWorth") || "Total worth"}
                />
                <MetricCard
                  title={t("metrics.lowStockAlerts") || "Low Stock Alerts"}
                  value={supplyData.lowStockCount}
                  icon={AlertTriangle}
                  color="orange"
                  subValue={t("metrics.needsReorder") || "Needs reorder"}
                />
                <MetricCard
                  title={t("metrics.outOfStock") || "Out of Stock"}
                  value={supplyData.outOfStockCount}
                  icon={TrendingDown}
                  color="red"
                  subValue={t("metrics.urgentAction") || "Urgent action"}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expense Chart */}
                <Card className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {t("sections.expenseAnalysis")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t("sections.expenseSubtitle") || "Total Expenses"}:{" "}
                        {formatCurrency(expensesData.totalExpenses)}
                      </p>
                    </div>
                  </div>
                  <div className="h-72">
                    <Line
                      data={expensesData.expenseTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false } },
                          y: { border: { display: false } },
                        },
                      }}
                    />
                  </div>
                </Card>

                {/* Low Stock List */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle size={20} />
                      <h3 className="font-bold">
                        {t("sections.lowStockAlerts") || "Low Stock Alerts"}
                      </h3>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                      {lowStockItems.length}
                    </span>
                  </div>

                  {lowStockItems.length > 0 ? (
                    <div className="space-y-3">
                      {lowStockItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-xs text-red-600 font-medium">
                              {item.currentStock} {item.unit}{" "}
                              {t("common.remaining") || "remaining"}
                            </p>
                            {item.minimumStock && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Min: {item.minimumStock} {item.unit}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/supplies/${item._id}`)}
                            className="bg-white text-red-600 border border-red-200 hover:bg-red-50 text-xs px-3 py-1.5 h-8"
                          >
                            {t("common.reorder") || "Reorder"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        {t("dashboard.status.noLowStock") ||
                          "All supplies are adequately stocked"}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => navigate("/supplies")}
                    >
                      {t("dashboard.buttons.viewAllSupplies") ||
                        "View All Supplies"}
                      <ChevronRight
                        size={16}
                        className="ml-2 rtl:mr-2 rtl:ml-0"
                      />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE */}
          {activeTab === "finance" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title={t("metrics.totalRevenue")}
                  value={formatCurrency(financeData.totalRevenue)}
                  icon={DollarSign}
                  color="green"
                  variant="primary"
                  trend={financeData.revenueGrowth}
                />
                <MetricCard
                  title={t("metrics.netCashFlow")}
                  value={formatCurrency(financeData.cashFlow.net)}
                  icon={Wallet}
                  color="blue"
                  subValue={t("metrics.inflowOutflow")}
                />
                <MetricCard
                  title={t("metrics.unpaidInvoices")}
                  value={formatCurrency(financeData.outstandingInvoices)}
                  icon={FileText}
                  color="orange"
                  subValue={t("metrics.actionNeeded")}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {t("sections.revenuePerformance")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t("sections.revenueSubtitle")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        {t("dashboard.buttons.export")}
                      </Button>
                    </div>
                  </div>
                  <div className="h-72">
                    <Line
                      data={financeData.revenueTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false } },
                          y: { border: { display: false } },
                        },
                      }}
                    />
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">
                      {t("sections.recentTransactions")}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 flex-1">
                    {financeData.recentPayments.length > 0 ? (
                      financeData.recentPayments.map((p) => (
                        <div
                          key={p._id}
                          className="p-4 flex justify-between items-center hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {p.client?.name ||
                                p.description ||
                                t("common.unknown")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateDDMMYYYY(p.paidDate, i18n.language)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold text-sm ${
                                p.type === "expense"
                                  ? "text-red-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {p.type === "expense" ? "-" : "+"}
                              {formatCurrency(p.amount)}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase">
                              {t(`paymentMethods.${p.method}`) || p.method}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        {t("dashboard.status.noTransactions")}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <Button variant="link" size="sm" className="text-gray-600">
                      {t("dashboard.buttons.viewTransactions")}{" "}
                      <ArrowUpRight
                        size={14}
                        className="ml-1 rtl:mr-1 rtl:ml-0"
                      />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;