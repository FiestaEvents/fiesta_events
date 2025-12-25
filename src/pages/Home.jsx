import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { usePermission } from "../hooks/usePermission";
import { useAuth } from "../context/AuthContext"; // ✅ Added to get Category
import {
  LayoutDashboard,
  Calendar,
  Users,
  Handshake,
  ClipboardList,
  Bell,
  TrendingUp,
  Wallet,
  Receipt,
  FileSignature,
  FolderOpen,
  Settings,
  Package,
  ArrowRight,
  ShieldCheck,
  UserCog,
  Briefcase, // Service Jobs
  Truck, // Driver Schedule/Vehicle
  Camera, // Portfolio
  Layers, // Generic Resources
} from "lucide-react";

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // 1. Determine Vertical Configuration
  const category = user?.business?.category || "venue";

  // Dynamic Label/Icon Logic
  const getVerticalConfig = (cat) => {
    switch (cat) {
      case 'driver':
      case 'transport':
        return {
          eventsTitle: 'common.schedule',
          eventsDesc: 'home.scheduleDesc', // "Route & Shift Management"
          eventsIcon: Calendar,
          resourcesTitle: 'common.vehicles', 
          resourcesIcon: Truck,
          showPortfolio: false,
          showPartners: false
        };
      case 'photography':
      case 'videography':
        return {
          eventsTitle: 'common.jobs',
          eventsDesc: 'home.jobsDesc', // "Gig Management"
          eventsIcon: Briefcase,
          resourcesTitle: 'common.equipment',
          resourcesIcon: Camera,
          showPortfolio: true,
          showPartners: false
        };
      case 'venue':
      default:
        return {
          eventsTitle: 'common.events',
          eventsDesc: 'home.eventsDesc',
          eventsIcon: Calendar,
          resourcesTitle: 'common.supplies',
          resourcesIcon: Package,
          showPortfolio: false,
          showPartners: true
        };
    }
  };

  const config = getVerticalConfig(category);

  // --- Permissions Hooks ---
  const canViewEvents = usePermission("events.read.all");
  const canViewClients = usePermission("clients.read.all");
  const canViewPartners = usePermission("partners.read.all");
  const canViewSupplies = usePermission("supplies.read.all");
  const canViewTasks = usePermission("tasks.read.all");
  const canViewReminders = usePermission("reminders.read.all");
  
  // New: Portfolio Permission
  const canViewPortfolio = usePermission("portfolio.read.all");

  const canViewFinance = usePermission("finance.read.all");
  const canViewPayments = usePermission("payments.read.all");
  
  const canViewContracts = usePermission("contracts.read.all");
  const canViewDocs = usePermission("settings.read");
  const canViewSettings = usePermission("business.update"); // Updated

  const canViewTeam = usePermission("users.read.all");
  const canViewRoles = usePermission("roles.read.all");

  // --- Module Definitions ---
  const allModules = [
    // 1. Overview
    {
      title: t("common.dashboard"),
      id: "dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      show: true,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
      description: t("home.dashboardDesc", "Reports & Analytics")
    },
    // 2. Operations
    {
      title: t(config.eventsTitle), // Dynamic Title
      id: "events",
      icon: config.eventsIcon,      // Dynamic Icon
      path: "/events",
      show: canViewEvents,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
      description: t(config.eventsDesc, "Management")
    },
    {
      title: t("common.portfolio"), // New Portfolio Module
      id: "portfolio",
      icon: Camera,
      path: "/portfolio",
      show: canViewPortfolio || config.showPortfolio,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      border: "group-hover:border-pink-200 dark:group-hover:border-pink-800",
      description: t("home.portfolioDesc", "Gallery & Projects")
    },
    {
      title: t("common.clients"),
      id: "clients",
      icon: Users,
      path: "/clients",
      show: canViewClients,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "group-hover:border-purple-200 dark:group-hover:border-purple-800",
      description: t("home.clientsDesc", "Customer Database")
    },
    {
      title: t("common.partners"),
      id: "partners",
      icon: Handshake,
      path: "/partners",
      show: canViewPartners && config.showPartners, // Hide for some service providers
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      border: "group-hover:border-teal-200 dark:group-hover:border-teal-800",
      description: t("home.partnersDesc", "Vendor Relationships")
    },
    {
      title: t(config.resourcesTitle), // Supplies / Equipment / Vehicles
      id: "supplies",
      icon: config.resourcesIcon,
      path: "/supplies",
      show: canViewSupplies,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "group-hover:border-red-200 dark:group-hover:border-red-800",
      description: t("home.suppliesDesc", "Inventory & Stock")
    },
    {
      title: t("common.tasks"),
      id: "tasks",
      icon: ClipboardList,
      path: "/tasks",
      show: canViewTasks,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "group-hover:border-indigo-200 dark:group-hover:border-indigo-800",
      description: t("home.tasksDesc", "To-Do Lists")
    },
    {
      title: t("common.reminders"),
      id: "reminders",
      icon: Bell,
      path: "/reminders",
      show: canViewReminders,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "group-hover:border-yellow-200 dark:group-hover:border-yellow-800",
      description: t("home.remindersDesc", "Alerts & Notifications")
    },
    // 3. Finance
    {
      title: t("common.finance"),
      id: "finance",
      icon: TrendingUp,
      path: "/finance",
      show: canViewFinance,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "group-hover:border-green-200 dark:group-hover:border-green-800",
      description: t("home.financeDesc", "Financial Overview")
    },
    {
      title: t("common.payments"),
      id: "payments",
      icon: Wallet,
      path: "/payments",
      show: canViewPayments,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
      description: t("home.paymentsDesc", "Income Tracking")
    },
    {
      title: t("common.invoices"),
      id: "invoices",
      icon: Receipt,
      path: "/invoices",
      show: canViewFinance, // Typically tied to finance
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "group-hover:border-cyan-200 dark:group-hover:border-cyan-800",
      description: t("home.invoicesDesc", "Billing & Charges")
    },
    // 4. Team & Roles
    {
      title: t("common.team"),
      id: "team",
      icon: UserCog,
      path: "/team",
      show: canViewTeam,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      border: "group-hover:border-pink-200 dark:group-hover:border-pink-800",
      description: t("home.teamDesc", "Manage Staff")
    },
    {
      title: t("common.roles"),
      id: "roles",
      icon: ShieldCheck,
      path: "/roles",
      show: canViewRoles,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "group-hover:border-violet-200 dark:group-hover:border-violet-800",
      description: t("home.rolesDesc", "Access Control")
    },
    // 5. Management
    {
      title: t("common.contracts"),
      id: "contracts",
      icon: FileSignature,
      path: "/contracts",
      show: canViewContracts,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
      description: t("home.contractsDesc", "Legal Agreements")
    },
    {
      title: t("common.documents"),
      id: "documents",
      icon: FolderOpen,
      path: "/documents",
      show: canViewDocs,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-900/20",
      border: "group-hover:border-sky-200 dark:group-hover:border-sky-800",
      description: t("home.documentsDesc", "Template Layouts")
    },
    {
      title: t("common.settings"),
      id: "settings",
      icon: Settings,
      path: "/settings",
      show: canViewSettings,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-700/50",
      border: "group-hover:border-gray-300 dark:group-hover:border-gray-600",
      description: t("home.settingsDesc", "System Configuration")
    }
  ];

  // Filter out hidden modules
  const visibleModules = allModules.filter(m => m.show);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-screen-2xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
          {t("home.welcome", "Welcome Back")}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {t("home.subtitle", "Select a module to manage your business operations.")}
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {visibleModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <motion.div
              key={module.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link
                to={module.path}
                className={`
                  group relative flex flex-col items-start p-6 h-full
                  bg-white dark:bg-gray-800 
                  rounded-2xl border border-gray-100 dark:border-gray-700
                  shadow-sm hover:shadow-xl dark:hover:shadow-black/40
                  transition-all duration-300 ease-out
                  ${module.border}
                  overflow-hidden
                `}
              >
                {/* Icon Header */}
                <div className="flex w-full justify-between items-start mb-5 relative z-10">
                  <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${module.bg} ${module.color}`}>
                    <IconComponent className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 transition-all duration-300 group-hover:text-orange-500 group-hover:translate-x-1" />
                </div>

                {/* Text Content */}
                <div className="mt-auto z-10">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {module.description}
                  </p>
                </div>
                
                {/* Background Decoration */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${module.bg}`} />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Home;