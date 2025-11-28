import React, { useState } from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Handshake,
  ClipboardList,
  Bell,
  Wallet,
  CreditCard,
  Receipt,
  FileSignature,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  TrendingUp,
  Sparkles
} from "lucide-react";

// ============================================================
// TOOLTIP COMPONENT
// ============================================================
const Tooltip = ({ children, text, isRTL, show }) => {
  if (!show || !text) return children;

  return (
    <div className="relative group">
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: isRTL ? 10 : -10 }}
        whileHover={{ opacity: 1, scale: 1, x: 0 }}
        className={`absolute top-1/2 -translate-y-1/2 ${
          isRTL ? "right-full mr-2" : "left-full ml-2"
        } px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}
      >
        {text}
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "right-0 translate-x-full" : "left-0 -translate-x-full"
          } w-0 h-0 border-t-4 border-b-4 border-transparent ${
            isRTL ? "border-r-4 border-r-gray-900 dark:border-r-gray-700" : "border-l-4 border-l-gray-900 dark:border-l-gray-700"
          }`}
        />
      </motion.div>
    </div>
  );
};

// ============================================================
// ANIMATED NAVLINK COMPONENT
// ============================================================
const NavLink = ({ to, icon: Icon, labelKey, badge, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <Tooltip text={t(labelKey)} isRTL={isRTL} show={isCollapsed}>
      <RouterNavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          `relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            isActive
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <motion.div
            className={`flex items-center w-full ${isCollapsed ? "justify-center" : ""}`}
            whileHover={{ scale: 1.02, x: isRTL ? -2 : 2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active Indicator */}
            {isActive && !isCollapsed && (
              <motion.div
                layoutId="activeIndicator"
                className={`absolute ${isRTL ? "right-0" : "left-0"} top-0 bottom-0 w-1 bg-white rounded-r-full`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon with pulse effect on active */}
            <div className="relative">
              <Icon
                className={`flex-shrink-0 transition-all duration-300 ${
                  isCollapsed ? "w-6 h-6" : "w-5 h-5"
                }`}
              />
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>

            {/* Text Label */}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className={`whitespace-nowrap font-medium text-sm ${
                    isRTL ? "mr-3" : "ml-3"
                  }`}
                >
                  {t(labelKey)}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Badge */}
            {!isCollapsed && badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className={`${isRTL ? "mr-auto" : "ml-auto"} px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full shadow-sm`}
              >
                {badge}
              </motion.span>
            )}
          </motion.div>
        )}
      </RouterNavLink>
    </Tooltip>
  );
};

// ============================================================
// NAV SECTION COMPONENT
// ============================================================
const NavSection = ({ titleKey, children, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="mb-6">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3
              className={`px-3 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
              <span>{t(titleKey)}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
            </h3>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="my-4 mx-auto w-8 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        )}
      </AnimatePresence>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

// ============================================================
// MAIN SIDEBAR COMPONENT
// ============================================================
const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 288, // w-20 = 80px, w-72 = 288px
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 shadow-xl
        ${isRTL ? "right-0" : "left-0"}
        ${
          isOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header / Logo Area */}
          <div className="h-20 flex items-center justify-center shrink-0 px-4 relative border-b border-gray-100 dark:border-gray-800">
            <Link to="/" className="flex items-center justify-center w-full">
              <motion.img
                src="/fiesta logo-01.png"
                alt="Fiesta Logo"
                animate={{
                  height: isCollapsed ? "32px" : "40px",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                className="object-contain"
              />
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden absolute right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
            {/* Overview Section */}
            <NavSection titleKey="sidebar.overview" isCollapsed={isCollapsed}>
              <NavLink
                to="/home"
                icon={Home}
                labelKey="common.home"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/dashboard"
                icon={LayoutDashboard}
                labelKey="common.dashboard"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            {/* Operations Section */}
            <NavSection titleKey="sidebar.operations" isCollapsed={isCollapsed}>
              <NavLink
                to="/events"
                icon={Calendar}
                labelKey="common.events"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/clients"
                icon={Users}
                labelKey="common.clients"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/partners"
                icon={Handshake}
                labelKey="common.partners"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/tasks"
                icon={ClipboardList}
                labelKey="common.tasks"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/reminders"
                icon={Bell}
                labelKey="common.reminders"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            {/* Financial Section */}
            <NavSection titleKey="sidebar.financial" isCollapsed={isCollapsed}>
              <NavLink
                to="/finance"
                icon={TrendingUp}
                labelKey="common.finance"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/payments"
                icon={Wallet}
                labelKey="common.payments"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/invoices"
                icon={Receipt}
                labelKey="common.invoices"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            {/* Management Section */}
            <NavSection titleKey="sidebar.management" isCollapsed={isCollapsed}>
              <NavLink
                to="/contracts"
                icon={FileSignature}
                labelKey="common.contracts"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/documents"
                icon={FolderOpen}
                labelKey="common.documents"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/settings"
                icon={Settings}
                labelKey="common.settings"
                isCollapsed={isCollapsed}
              />
            </NavSection>
          </nav>

          {/* Footer */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 border-t border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <Sparkles className="w-3 h-3" />
                  <span>© 2025 Fiesta Inc.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;