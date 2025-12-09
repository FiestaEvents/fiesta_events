import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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
  ArrowRight
} from "lucide-react";

const Home = () => {
  const { t } = useTranslation();

  // --- Animation Variants ---

  // Container to orchestrate the staggered entrance of children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  // Individual Card Entrance
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  // Header Entrance
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Icon Hover Effect
  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: [0, -5, 5, 0], // Subtle wiggle
      transition: { duration: 0.4 } 
    }
  };

  // Arrow Slide Effect
  const arrowVariants = {
    rest: { x: -10, opacity: 0 },
    hover: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const modules = [
    {
      title: t("common.dashboard", "Dashboard"),
      id: "dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
      description: t("home.dashboardDesc", "Reports & Analytics")
    },
    {
      title: t("common.events", "Events"),
      id: "events",
      icon: Calendar,
      path: "/events",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
      description: t("home.eventsDesc", "Calendar Management")
    },
    {
      title: t("common.clients", "Clients"),
      id: "clients",
      icon: Users,
      path: "/clients",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "group-hover:border-purple-200 dark:group-hover:border-purple-800",
      description: t("home.clientsDesc", "Customer Database")
    },
    {
      title: t("common.partners", "Partners"),
      id: "partners",
      icon: Handshake,
      path: "/partners",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      border: "group-hover:border-teal-200 dark:group-hover:border-teal-800",
      description: t("home.partnersDesc", "Vendor Relationships")
    },
    {
      title: t("common.tasks", "Tasks"),
      id: "tasks",
      icon: ClipboardList,
      path: "/tasks",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "group-hover:border-indigo-200 dark:group-hover:border-indigo-800",
      description: t("home.tasksDesc", "To-Do Lists")
    },
    {
      title: t("common.reminders", "Reminders"),
      id: "reminders",
      icon: Bell,
      path: "/reminders",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "group-hover:border-yellow-200 dark:group-hover:border-yellow-800",
      description: t("home.remindersDesc", "Alerts & Notifications")
    },
    {
      title: t("common.supplies", "Supplies"),
      id: "supplies",
      icon: Package,
      path: "/supplies",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "group-hover:border-red-200 dark:group-hover:border-red-800",
      description: t("home.suppliesDesc", "Inventory & Stock")
    },
    {
      title: t("common.finance", "Finance"),
      id: "finance",
      icon: TrendingUp,
      path: "/finance",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "group-hover:border-green-200 dark:group-hover:border-green-800",
      description: t("home.financeDesc", "Financial Overview")
    },
    {
      title: t("common.payments", "Payments"),
      id: "payments",
      icon: Wallet,
      path: "/payments",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
      description: t("home.paymentsDesc", "Income Tracking")
    },
    {
      title: t("common.invoices", "Invoices"),
      id: "invoices",
      icon: Receipt,
      path: "/invoices",
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "group-hover:border-cyan-200 dark:group-hover:border-cyan-800",
      description: t("home.invoicesDesc", "Billing & Charges")
    },
    {
      title: t("common.contracts", "Contracts"),
      id: "contracts",
      icon: FileSignature,
      path: "/contracts",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
      description: t("home.contractsDesc", "Legal Agreements")
    },
    {
      title: t("common.documents", "Documents"),
      id: "documents",
      icon: FolderOpen,
      path: "/documents",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      border: "group-hover:border-pink-200 dark:group-hover:border-pink-800",
      description: t("home.documentsDesc", "Template Layouts")
    },
    {
      title: t("common.settings", "Settings"),
      id: "settings",
      icon: Settings,
      path: "/settings",
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-700/50",
      border: "group-hover:border-gray-300 dark:group-hover:border-gray-600",
      description: t("home.settingsDesc", "System Configuration")
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-screen-2xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      
      {/* --- Header Section --- */}
      <motion.div 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="mb-10 md:mb-14 text-center"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          {t("home.welcome", "Welcome Back")}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {t("home.subtitle", "Select a module below to get started with your management tasks.")}
        </p>
      </motion.div>

      {/* --- Grid Section --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <motion.div
              key={module.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
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
                {/* Icon & Arrow Row */}
                <div className="flex w-full justify-between items-start mb-5">
                  <motion.div 
                    variants={iconVariants}
                    initial="rest"
                    whileHover="hover"
                    className={`
                      p-3.5 rounded-2xl
                      ${module.bg} ${module.color}
                    `}
                  >
                    <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                  </motion.div>
                  
                  <motion.div 
                    variants={arrowVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </div>

                {/* Text Content */}
                <div className="mt-auto z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors duration-300">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {module.description}
                  </p>
                </div>
                
                {/* Subtle Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/80 dark:to-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Home;