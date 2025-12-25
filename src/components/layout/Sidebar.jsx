import React from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { usePermission } from "../../hooks/usePermission";
import { useAuth } from "../../context/AuthContext"; //
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Handshake,
  ClipboardList,
  Bell,
  Wallet,
  Receipt,
  FileSignature,
  FolderOpen,
  Settings,
  X,
  Home,
  TrendingUp,
  Sparkles,
  BoxIcon,
  ShieldCheck,
  UserCog,
  Truck,
  Camera, 
  MapPin,
  Layers,
} from "lucide-react";

// ============================================================
// CONFIG: Vertical Specific Labels & Icons
// ============================================================
const getVerticalConfig = (category) => {
  switch (category) {
    case "driver":
    case "transport":
      return {
        eventsLabel: "common.schedule",
        eventsIcon: Calendar,
        resourcesLabel: "common.vehicles",
        resourcesIcon: Truck,
        showSupplies: true, // Fuel/Maintenance supplies
      };
    case "photography":
    case "videography":
      return {
        eventsLabel: "common.jobs",
        eventsIcon: Briefcase,
        resourcesLabel: "common.equipment",
        resourcesIcon: Camera,
        showSupplies: false,
      };
    case "catering":
    case "bakery":
      return {
        eventsLabel: "common.orders",
        eventsIcon: ClipboardList,
        resourcesLabel: "common.kitchen",
        resourcesIcon: Layers,
        showSupplies: true, // Ingredients
      };
    case "venue":
    default:
      return {
        eventsLabel: "common.events",
        eventsIcon: Calendar,
        resourcesLabel: "common.spaces",
        resourcesIcon: Layers,
        showSupplies: true,
      };
  }
};

// ============================================================
// TOOLTIP COMPONENT (Unchanged)
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
            isRTL
              ? "border-r-4 border-r-gray-900 dark:border-r-gray-700"
              : "border-l-4 border-l-gray-900 dark:border-l-gray-700"
          }`}
        />
      </motion.div>
    </div>
  );
};

// ============================================================
// NAVLINK COMPONENT (Unchanged)
// ============================================================
const NavLink = ({ to, icon: Icon, label, badge, isCollapsed }) => {
  const { isRTL } = useLanguage();

  return (
    <Tooltip text={label} isRTL={isRTL} show={isCollapsed}>
      <RouterNavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          `relative flex items-center px-2 py-2 rounded-lg transition-all duration-200 group ${
            isActive
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <motion.div
            className={`flex items-center w-full ${isCollapsed ? "justify-center" : ""}`}
            whileHover={isActive ? {} : { scale: 1.02, x: isRTL ? -2 : 2 }}
            whileTap={isActive ? {} : { scale: 0.98 }}
          >
            {isActive && !isCollapsed && (
              <motion.div
                layoutId="activeIndicator"
                className={`absolute ${isRTL ? "right-0" : "left-0"} top-0 bottom-0 w-1 bg-white rounded-r-full`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <div className="relative">
              <Icon
                className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
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

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className={`whitespace-nowrap font-medium text-xs ${isRTL ? "mr-3" : "ml-3"}`}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {!isCollapsed && badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className={`${isRTL ? "mr-auto" : "ml-auto"} px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-sm`}
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

  if (!children || (Array.isArray(children) && children.every((c) => !c)))
    return null;

  return (
    <div className="mb-4">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3
              className={`px-2 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
              <span>{t(titleKey)}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
            </h3>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="my-2 mx-auto w-6 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        )}
      </AnimatePresence>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
};

// ============================================================
// MAIN SIDEBAR COMPONENT
// ============================================================
const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth(); // ✅ Get User Context

  // 1. Determine Vertical Configuration
  // We use user.business.category if populated, otherwise default to 'venue'
  const category = user?.business?.category || "venue";
  const config = getVerticalConfig(category);

  // 2. Permissions Hooks
  const canViewEvents = usePermission("events.read.all");
  const canViewClients = usePermission("clients.read.all");
  const canViewPartners = usePermission("partners.read.all");
  const canViewSupplies = usePermission("supplies.read.all");
  const canViewTasks = usePermission("tasks.read.all");
  const canViewReminders = usePermission("reminders.read.all");

  // New Permissions for Resources/Portfolio
  const canViewResources =
    usePermission("venue.read") || usePermission("business.read");
  const canViewPortfolio = usePermission("portfolio.read.all");

  const canViewFinance = usePermission("finance.read.all");
  const canViewPayments = usePermission("payments.read.all");
  const canViewContracts = usePermission("contracts.read.all");
  const canViewDocs = usePermission("settings.read");
  const canViewSettings = usePermission("business.update"); // Updated permission name

  const canViewTeam = usePermission("users.read.all");
  const canViewRoles = usePermission("roles.read.all");

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
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 bottom-0 bg-white dark:bg-gray-900 z-50 shadow-xl dark:border-gray-800
        ${isRTL ? "right-0 border-r-0 border-l" : "left-0"}
        ${isOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-center shrink-0 px-4 relative dark:border-gray-800/50">
            <Link
              to="/"
              className="flex items-center justify-center w-full overflow-hidden"
            >
              <motion.img
                src="/fiesta logo-01.png"
                alt="Fiesta Logo"
                animate={{ height: isCollapsed ? "24px" : "32px" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="object-contain max-w-full"
              />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden absolute right-4 p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
            {/* 1. Overview */}
            <NavSection titleKey="sidebar.overview" isCollapsed={isCollapsed}>
              <NavLink
                to="/home"
                icon={Home}
                label={t("common.home")}
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/dashboard"
                icon={LayoutDashboard}
                label={t("common.dashboard")}
                isCollapsed={isCollapsed}
              />
            </NavSection>

            {/* 2. Operations (Dynamic based on Category) */}
            <NavSection titleKey="sidebar.operations" isCollapsed={isCollapsed}>
              {/* Dynamic Events Link (Events / Jobs / Schedule) */}
              {canViewEvents && (
                <NavLink
                  to="/events"
                  icon={config.eventsIcon}
                  label={t(config.eventsLabel)}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* Dynamic Resources Link (Spaces / Equipment / Vehicles) */}
              {canViewResources &&
                category === "venue" && ( // Only Venues usually manage Spaces via UI currently
                  <NavLink
                    to="/spaces" // Route might need update to /resources later
                    icon={config.resourcesIcon}
                    label={t(config.resourcesLabel)}
                    isCollapsed={isCollapsed}
                  />
                )}

              {/* Clients */}
              {canViewClients && (
                <NavLink
                  to="/clients"
                  icon={Users}
                  label={t("common.clients")}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* Portfolio (For Creatives) */}
              {(canViewPortfolio ||
                category === "photography" ||
                category === "videography") && (
                <NavLink
                  to="/portfolio"
                  icon={Camera}
                  label={t("common.portfolio")}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* Partners (Usually specific to Venues/Planners) */}
              {canViewPartners && category === "venue" && (
                <NavLink
                  to="/partners"
                  icon={Handshake}
                  label={t("common.partners")}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* Supplies (Configurable) */}
              {canViewSupplies && config.showSupplies && (
                <NavLink
                  to="/supplies"
                  icon={BoxIcon}
                  label={t("common.supplies")}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* Tasks & Reminders (Everyone) */}
              {canViewTasks && (
                <NavLink
                  to="/tasks"
                  icon={ClipboardList}
                  label={t("common.tasks")}
                  isCollapsed={isCollapsed}
                />
              )}
              {canViewReminders && (
                <NavLink
                  to="/reminders"
                  icon={Bell}
                  label={t("common.reminders")}
                  isCollapsed={isCollapsed}
                />
              )}
            </NavSection>

            {/* 3. Financial */}
            {(canViewFinance || canViewPayments) && (
              <NavSection
                titleKey="sidebar.financial"
                isCollapsed={isCollapsed}
              >
                {canViewFinance && (
                  <NavLink
                    to="/finance"
                    icon={TrendingUp}
                    label={t("common.finance")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {canViewPayments && (
                  <NavLink
                    to="/payments"
                    icon={Wallet}
                    label={t("common.payments")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {canViewFinance && (
                  <NavLink
                    to="/invoices"
                    icon={Receipt}
                    label={t("common.invoices")}
                    isCollapsed={isCollapsed}
                  />
                )}
              </NavSection>
            )}

            {/* 4. Team & Administration */}
            {(canViewTeam || canViewRoles) && (
              <NavSection titleKey="sidebar.team" isCollapsed={isCollapsed}>
                {canViewTeam && (
                  <NavLink
                    to="/team"
                    icon={UserCog}
                    label={t("common.team")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {canViewRoles && (
                  <NavLink
                    to="/roles"
                    icon={ShieldCheck}
                    label={t("common.roles")}
                    isCollapsed={isCollapsed}
                  />
                )}
              </NavSection>
            )}

            {/* 5. Management */}
            {(canViewContracts || canViewSettings) && (
              <NavSection
                titleKey="sidebar.management"
                isCollapsed={isCollapsed}
              >
                {canViewContracts && (
                  <NavLink
                    to="/contracts"
                    icon={FileSignature}
                    label={t("common.contracts")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {canViewDocs && (
                  <NavLink
                    to="/documents"
                    icon={FolderOpen}
                    label={t("common.documents")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {canViewSettings && (
                  <NavLink
                    to="/settings"
                    icon={Settings}
                    label={t("common.settings")}
                    isCollapsed={isCollapsed}
                  />
                )}
              </NavSection>
            )}
          </nav>

          {/* Footer */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 border-t border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap overflow-hidden">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{t("allRightsReserved")} © 2025</span>
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
