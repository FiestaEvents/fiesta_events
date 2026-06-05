// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency";
import {
  motion,
  AnimatePresence,
  useInView,
  useSpring,
  useTransform,
} from "framer-motion";

// Hooks & API
import useToast from "../../hooks/useToast";
import {
  eventService,
  paymentService,
  venueService,
  invoiceService,
  financeService,
  supplyService,
} from "../../api/index";

// Components
import Button from "../../components/common/Button";
import { StatusBadge } from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

// Icons
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  Wallet,
  LayoutDashboard,
  FileText,
  DollarSign,
  Target,
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

// Set default chart colors for better visibility in both modes
ChartJS.defaults.color = "#9CA3AF"; // gray-400
ChartJS.defaults.borderColor = "rgba(156, 163, 175, 0.1)"; // gray-400 with low opacity

// ============================================
// ANIMATION VARIANTS & UTILS
// ============================================

// Stagger container for lists/grids
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Item animation (Slide Up)
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Tab Transition
const tabContentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// Number Counter Component
const CountUp = ({ value, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Parse numeric value from string (handles "12.5" or "100")
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;
  const isFloat =
    value.toString().includes(".") ||
    (typeof value === "number" && !Number.isInteger(value));

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 1.5,
  });

  useEffect(() => {
    if (isInView && !isNaN(numericValue)) {
      springValue.set(numericValue);
    }
  }, [isInView, numericValue, springValue]);

  const displayValue = useTransform(springValue, (latest) => {
    if (isNaN(latest)) return value;
    if (isFloat) return prefix + latest.toFixed(1) + suffix;
    return prefix + Math.round(latest).toLocaleString() + suffix;
  });

  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

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
  <motion.div
    variants={itemVariants} // Apply animation variant
    onClick={onClick}
    whileHover={
      onClick
        ? { scale: 1.01, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }
        : {}
    }
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 ${
      onClick
        ? "cursor-pointer hover:border-orange-200 dark:hover:border-orange-900 transition-colors"
        : ""
    } ${className}`}
  >
    {children}
  </motion.div>
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
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-100",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-100",
    },
    red: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-100",
    },
  };

  const currentTheme = colors[color] || colors.orange;

  if (isSolid) {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white shadow-xl relative overflow-hidden group cursor-default"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 p-16 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"
        />
        <div className="flex justify-between items-start relative z-10">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Icon size={20} className="text-white" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/10 text-white">
              {trend > 0 ? "+" : ""}
              <CountUp value={trend} suffix="%" />
            </div>
          )}
        </div>
        <div className="mt-4 relative z-10">
          <h3 className="text-3xl font-bold text-white">
            {typeof value === "number" || !isNaN(parseFloat(value)) ? (
              <CountUp value={value} />
            ) : (
              value
            )}
          </h3>
          <p className="text-sm text-gray-300 font-medium mt-1">{title}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 group shadow-sm hover:shadow-md"
    >
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
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <CountUp value={Math.abs(trend)} suffix="%" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {typeof value === "number" ||
          !isNaN(parseFloat(String(value).replace(/[^0-9.-]+/g, ""))) ? (
            <CountUp value={value} />
          ) : (
            value
          )}
        </h3>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
          {title}
        </p>
      </div>
      {subValue && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${currentTheme.bg
              .replace("bg-", "bg-")
              .replace("50", "500")}`}
          ></div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {subValue}
          </span>
        </div>
      )}
    </motion.div>
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
        <h3 className="font-bold text-gray-900 dark:text-white">
          {baseDate.toLocaleString(i18n.language, {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
          <Calendar size={16} />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2 flex-1">
        {weekDays.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
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
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className="flex items-center justify-center"
            >
              <div
                className={`
                w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                ${
                  isToday
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none"
                    : "text-gray-700 dark:text-gray-300"
                }
                ${
                  !isToday && status === "booked"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-100 dark:ring-emerald-800"
                    : ""
                }
                ${
                  !isToday && status === "pending"
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-100 dark:ring-amber-800"
                    : ""
                }
                ${
                  !isToday && !status
                    ? "hover:bg-gray-50 dark:hover:bg-gray-700"
                    : ""
                }
              `}
              >
                {day}
              </div>
            </motion.div>
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
      // Format filename like "OCTOBRE-25"
      const monthName = currentMonth
        .toLocaleDateString("fr-FR", { month: "long" })
        .toUpperCase();
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
        "Date de Ver",
      ];

      // Variables to calculate totals
      let totalPrix = 0;
      let totalAcompte = 0;
      let totalReste = 0;

      // Prepare Data Rows
      const rows = receipts.map((payment) => {
        const pDate = new Date(payment.paidDate || payment.createdAt);
        const dateStr = formatDateDDMMYYYY(pDate);

        // Format Month like "oct-25"
        const monthStr = pDate
          .toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
          .replace(".", "");

        const name = (payment.client?.name || "Client").substring(0, 30);
        const eventName = (
          payment.event?.title ||
          payment.description ||
          "Event"
        ).substring(0, 30);

        const price = payment.amount || 0;
        // Logic for "A Compte" (Deposit) vs Total Price.
        // Adjust this logic if your data structure for deposits is different.
        const advance = payment.fees?.processingFee || 0;
        const remaining = price - advance;
        const receiptNo = payment.reference || "";
        const status = "payer";
        const dateVer = payment.verificationDate
          ? formatDateDDMMYYYY(payment.verificationDate)
          : "";

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
          safe(dateVer),
        ].join(",");
      });

      // Create Totals Row
      const totalsRow = [
        "",
        "",
        "",
        "TOTAUX",
        totalPrix,
        totalAcompte,
        "",
        totalReste,
        "",
        "",
      ].join(",");

      // Combine CSV Content
      // \uFEFF is the BOM (Byte Order Mark) so Excel opens UTF-8 correctly with French chars (é, à, etc.)
      const csvContent =
        "\uFEFF" + [headers.join(","), ...rows, totalsRow].join("\n");

      // Trigger Download
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
                borderColor: "#ef4444", // red-500
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                  gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)");
                  gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
                  return gradient;
                },
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: true,
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
                label: "Revenue",
                data: [
                  totalRevenue * 0.8,
                  totalRevenue * 0.9,
                  totalRevenue * 0.7,
                  totalRevenue * 1.1,
                  totalRevenue * 0.95,
                  totalRevenue,
                ],
                borderColor: "#f97316", // orange-500
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <OrbitLoader className="mb-6" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="text-gray-500 dark:text-gray-400 font-medium"
        >
          {t("dashboard.status.systemOperational") ||
            "Synchronizing dashboard..."}
        </motion.p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {t("dashboard.welcome")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right mr-4 rtl:mr-0 rtl:ml-4">
              <p className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">
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
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 shadow-lg shadow-green-200 dark:shadow-none"
            >
              {generatingReceipt ? (
                <>
                  <OrbitLoader
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
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex p-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-6 py-2 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm ring-1 ring-black/5 dark:ring-white/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-gray-900 dark:text-white"
                      : ""
                  }`}
                >
                  <tab.icon
                    size={16}
                    className={activeTab === tab.id ? "text-orange-500" : ""}
                  />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              {t("dashboard.status.systemOperational")}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* TAB 1: EVENTS OVERVIEW */}
            {activeTab === "events" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
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
                    value={eventsData.occupancyRate} // Pass number directly for CountUp
                    trend={12} // Trend is separate
                    subValue={t("metrics.occupancyRate")}
                    icon={Target}
                    color="purple"
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
                    <Card className="border-orange-100 bg-orange-50/30 dark:bg-orange-900/10 dark:border-orange-900/30">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                          <Bell size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {t("sections.todaysAgenda")}
                        </h3>
                      </div>

                      {eventsData.todayEvents.length > 0 ? (
                        <div className="space-y-3">
                          {eventsData.todayEvents.map((event) => (
                            <motion.div
                              whileHover={{ x: 5 }}
                              key={event._id}
                              onClick={() => navigate(`/events/${event._id}`)}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                  {event.startTime || "00:00"}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white">
                                    {event.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {event.clientId?.name} • {event.guestCount}{" "}
                                    {t("common.pax")}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight
                                size={18}
                                className="text-gray-400 dark:text-gray-500 rtl:rotate-180"
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("dashboard.status.noEvents")}
                          </p>
                          <Button
                            variant="link"
                            className="text-orange-600 dark:text-orange-400 mt-2"
                            onClick={() => navigate("/events/new")}
                          >
                            {t("dashboard.buttons.scheduleOne")}
                          </Button>
                        </div>
                      )}
                    </Card>

                    {/* Upcoming Events Table */}
                    <Card className="p-0 overflow-hidden">
                      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">
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
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {eventsData.upcomingEvents.map((event, index) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{
                              backgroundColor: "rgba(0,0,0,0.02)",
                            }}
                            className="p-4 flex items-center justify-between transition cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            key={event._id}
                            onClick={() => navigate(`/events/${event._id}`)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 text-center">
                                <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                                  {new Date(event.startDate).toLocaleString(
                                    i18n.language,
                                    { month: "short" }
                                  )}
                                </div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                  {new Date(event.startDate).getDate()}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {event.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {event.type || "General"} • {event.guestCount}{" "}
                                  {t("common.guests")}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={event.status} size="sm" />
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: INVENTORY & EXPENSES */}
            {activeTab === "expenses" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Header with Action Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t("sections.inventoryOverview") ||
                        "Inventory & Supply Overview"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t("sections.inventorySubtitle") ||
                        "Real-time stock levels and expense tracking"}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/supplies")}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-0.5"
                  >
                    <Box size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("dashboard.buttons.manageSupplies") || "Manage Supplies"}
                    <ExternalLink
                      size={16}
                      className="ml-2 rtl:mr-2 rtl:ml-0"
                    />
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
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {t("sections.expenseAnalysis")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              mode: "index",
                              intersect: false,
                              backgroundColor: "rgba(17, 24, 39, 0.8)",
                              titleColor: "#fff",
                              bodyColor: "#fff",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                              borderWidth: 1,
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: { color: "#9CA3AF" },
                            },
                            y: {
                              border: { display: false },
                              grid: {
                                color: "rgba(156, 163, 175, 0.1)",
                              },
                              ticks: { color: "#9CA3AF" },
                            },
                          },
                          animation: {
                            duration: 2000,
                            easing: "easeOutQuart",
                          },
                        }}
                      />
                    </div>
                  </Card>

                  {/* Low Stock List */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle size={20} />
                        <h3 className="font-bold">
                          {t("sections.lowStockAlerts") || "Low Stock Alerts"}
                        </h3>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-bold"
                      >
                        {lowStockItems.length}
                      </motion.span>
                    </div>

                    {lowStockItems.length > 0 ? (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                      >
                        {lowStockItems.map((item) => (
                          <motion.div
                            variants={itemVariants}
                            key={item._id}
                            className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                {item.name}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                {item.currentStock} {item.unit}{" "}
                                {t("common.remaining") || "remaining"}
                              </p>
                              {item.minimumStock && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                  Min: {item.minimumStock} {item.unit}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/supplies/${item._id}`)}
                              className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-3 py-1.5 h-8"
                            >
                              {t("common.reorder") || "Reorder"}
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          {t("dashboard.status.noLowStock") ||
                            "All supplies are adequately stocked"}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
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
              </motion.div>
            )}

            {/* TAB 3: FINANCE */}
            {activeTab === "finance" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
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
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {t("sections.revenuePerformance")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              mode: "index",
                              intersect: false,
                              backgroundColor: "rgba(17, 24, 39, 0.8)",
                              titleColor: "#fff",
                              bodyColor: "#fff",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                              borderWidth: 1,
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: { color: "#9CA3AF" },
                            },
                            y: {
                              border: { display: false },
                              grid: {
                                color: "rgba(156, 163, 175, 0.1)",
                              },
                              ticks: { color: "#9CA3AF" },
                            },
                          },
                          animation: {
                            duration: 2000,
                          },
                        }}
                      />
                    </div>
                  </Card>

                  <Card className="p-0 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {t("sections.recentTransactions")}
                      </h3>
                    </div>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="divide-y divide-gray-100 dark:divide-gray-700 flex-1"
                    >
                      {financeData.recentPayments.length > 0 ? (
                        financeData.recentPayments.map((p) => (
                          <motion.div
                            variants={itemVariants}
                            key={p._id}
                            className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">
                                {p.client?.name ||
                                  p.description ||
                                  t("common.unknown")}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateDDMMYYYY(p.paidDate, i18n.language)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold text-sm ${
                                  p.type === "expense"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {p.type === "expense" ? "-" : "+"}
                                {formatCurrency(p.amount)}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">
                                {t(`paymentMethods.${p.method}`) || p.method}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                          {t("dashboard.status.noTransactions")}
                        </div>
                      )}
                    </motion.div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {t("dashboard.buttons.viewTransactions")}{" "}
                        <ArrowUpRight
                          size={14}
                          className="ml-1 rtl:mr-1 rtl:ml-0"
                        />
                      </Button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardPage;