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
  Settings
} from "lucide-react";

const Home = () => {
  const { t } = useTranslation();

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  const modules = [
    {
      title: t("common.dashboard", "Dashboard"),
      id: "dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "text-blue-600 dark:text-blue-400",
      bgHover: "hover:border-blue-500 hover:shadow-blue-500/20",
      description: t("home.dashboardDesc", "Reports & Analytics")
    },
    {
      title: t("common.events", "Events"),
      id: "events",
      icon: Calendar,
      path: "/events",
      color: "text-emerald-600 dark:text-emerald-400",
      bgHover: "hover:border-emerald-500 hover:shadow-emerald-500/20",
      description: t("home.eventsDesc", "Calendar Management")
    },
    {
      title: t("common.clients", "Clients"),
      id: "clients",
      icon: Users,
      path: "/clients",
      color: "text-purple-600 dark:text-purple-400",
      bgHover: "hover:border-purple-500 hover:shadow-purple-500/20",
      description: t("home.clientsDesc", "Customer Database")
    },
    {
      title: t("common.partners", "Partners"),
      id: "partners",
      icon: Handshake,
      path: "/partners",
      color: "text-teal-600 dark:text-teal-400",
      bgHover: "hover:border-teal-500 hover:shadow-teal-500/20",
      description: t("home.partnersDesc", "Vendor Relationships")
    },
    {
      title: t("common.tasks", "Tasks"),
      id: "tasks",
      icon: ClipboardList,
      path: "/tasks",
      color: "text-indigo-600 dark:text-indigo-400",
      bgHover: "hover:border-indigo-500 hover:shadow-indigo-500/20",
      description: t("home.tasksDesc", "To-Do Lists")
    },
    {
      title: t("common.reminders", "Reminders"),
      id: "reminders",
      icon: Bell,
      path: "/reminders",
      color: "text-yellow-600 dark:text-yellow-400",
      bgHover: "hover:border-yellow-500 hover:shadow-yellow-500/20",
      description: t("home.remindersDesc", "Alerts & Notifications")
    },
    {
      title: t("common.finance", "Finance"),
      id: "finance",
      icon: TrendingUp,
      path: "/finance",
      color: "text-green-600 dark:text-green-400",
      bgHover: "hover:border-green-500 hover:shadow-green-500/20",
      description: t("home.financeDesc", "Financial Overview")
    },
    {
      title: t("common.payments", "Payments"),
      id: "payments",
      icon: Wallet,
      path: "/payments",
      color: "text-orange-600 dark:text-orange-400",
      bgHover: "hover:border-orange-500 hover:shadow-orange-500/20",
      description: t("home.paymentsDesc", "Income Tracking")
    },
    {
      title: t("common.invoices", "Invoices"),
      id: "invoices",
      icon: Receipt,
      path: "/invoices",
      color: "text-cyan-600 dark:text-cyan-400",
      bgHover: "hover:border-cyan-500 hover:shadow-cyan-500/20",
      description: t("home.invoicesDesc", "Billing & Charges")
    },
    {
      title: t("common.contracts", "Contracts"),
      id: "contracts",
      icon: FileSignature,
      path: "/contracts",
      color: "text-rose-600 dark:text-rose-400",
      bgHover: "hover:border-rose-500 hover:shadow-rose-500/20",
      description: t("home.contractsDesc", "Legal Agreements")
    },
    {
      title: t("common.documents", "Documents"),
      id: "documents",
      icon: FolderOpen,
      path: "/documents",
      color: "text-pink-600 dark:text-pink-400",
      bgHover: "hover:border-pink-500 hover:shadow-pink-500/20",
      description: t("home.documentsDesc", "Template Layouts")
    },
    {
      title: t("common.settings", "Settings"),
      id: "settings",
      icon: Settings,
      path: "/settings",
      color: "text-gray-600 dark:text-gray-400",
      bgHover: "hover:border-gray-500 hover:shadow-gray-500/20",
      description: t("home.settingsDesc", "System Configuration")
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
      >
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <motion.div
              key={module.id}
              variants={itemVariants}
            >
              <Link
                to={module.path}
                className={`
                  group flex flex-col items-center justify-center 
                  bg-white dark:bg-gray-800 
                  p-6 md:p-8 rounded-2xl 
                  border-2 border-gray-100 dark:border-gray-700 
                  shadow-sm 
                  transition-all duration-300
                  ${module.bgHover}
                  hover:shadow-xl
                `}
              >
                {/* Animated Icon Wrapper */}
                <motion.div 
                  className="mb-6"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <IconComponent className={`w-16 h-16 ${module.color}`} />
                </motion.div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center group-hover:scale-105 transition-transform duration-200">
                  {module.title}
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium text-center">
                  {module.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Home;