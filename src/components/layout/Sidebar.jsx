import React from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { usePermission } from "../../hooks/usePermission";
import { useAuth } from "../../context/AuthContext";
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
        resourcesLabel: "common.vehicles", // Use translation key
        resourcesIcon: Truck,
        showSupplies: false, // ❌ Hide
        showPortfolio: false, // ❌ Hide
        showPartners: false, // ❌ Hide
      };
    case "photography":
    case "videography":
      return {
        eventsLabel: "common.jobs",
        eventsIcon: Briefcase,
        resourcesLabel: "common.equipment",
        resourcesIcon: Camera,
        showSupplies: false, // ❌ Hide
        showPortfolio: true, // ✅ Show
        showPartners: false,
      };
    case "catering":
    case "bakery":
      return {
        eventsLabel: "common.orders",
        eventsIcon: ClipboardList,
        resourcesLabel: "common.kitchen",
        resourcesIcon: Layers,
        showSupplies: true, // ✅ Show
        showPortfolio: true, // ✅ Show
        showPartners: true,
      };
    case "venue":
    default:
      return {
        eventsLabel: "common.events",
        eventsIcon: Calendar,
        resourcesLabel: "common.spaces",
        resourcesIcon: Layers,
        showSupplies: true,
        showPortfolio: false,
        showPartners: true,
      };
  }
};

const Tooltip = ({ children, text, isRTL, show }) => {
  if (!show || !text) return children;
  return (
    <div className="relative group">
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: isRTL ? 10 : -10 }}
        whileHover={{ opacity: 1, scale: 1, x: 0 }}
        className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-full mr-2" : "left-full ml-2"} px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}
      >
        {text}
      </motion.div>
    </div>
  );
};

const NavLink = ({ to, icon: Icon, label, isCollapsed }) => {
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
              />
            )}
            <div className="relative">
              <Icon
                className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
              />
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
          </motion.div>
        )}
      </RouterNavLink>
    </Tooltip>
  );
};

const NavSection = ({ titleKey, children, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Clean null children
  const validChildren = React.Children.toArray(children).filter(
    (child) => child
  );
  if (validChildren.length === 0) return null;

  return (
    <div className="mb-4">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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
      <div className="space-y-0.5">{validChildren}</div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const category = user?.business?.category || "venue";
  const config = getVerticalConfig(category);

  // Permission Hooks
  const canViewEvents = usePermission("events.read.all");
  const canViewClients = usePermission("clients.read.all");
  const canViewPartners = usePermission("partners.read.all");
  const canViewSupplies = usePermission("supplies.read.all");
  const canViewTasks = usePermission("tasks.read.all");
  const canViewReminders = usePermission("reminders.read.all");

  const canViewResources =
    usePermission("venue.read") || usePermission("business.read");
  const canViewPortfolio = usePermission("portfolio.read.all");
  const canViewFinance = usePermission("finance.read.all");
  const canViewPayments = usePermission("payments.read.all");
  const canViewContracts = usePermission("contracts.read.all");
  const canViewDocs = usePermission("settings.read");
  const canViewSettings = usePermission("business.update");
  const canViewTeam = usePermission("users.read.all");
  const canViewRoles = usePermission("roles.read.all");

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 240 }}
        className={`fixed top-0 bottom-0 bg-white dark:bg-gray-900 z-50 shadow-xl dark:border-gray-800 ${isRTL ? "right-0 border-r-0 border-l" : "left-0"} ${isOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-center shrink-0 px-4 relative">
            <Link
              to="/"
              className="flex items-center justify-center w-full overflow-hidden"
            >
              <motion.img
                src="/fiesta logo-01.png"
                alt="Fiesta Logo"
                animate={{ height: isCollapsed ? "24px" : "32px" }}
                className="object-contain max-w-full"
              />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden absolute right-4 p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
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

            <NavSection titleKey="sidebar.operations" isCollapsed={isCollapsed}>
              {canViewEvents && (
                <NavLink
                  to="/events"
                  icon={config.eventsIcon}
                  label={t(config.eventsLabel)}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* ✅ VEHICLE / RESOURCE LINK */}
              {/* Drivers manage vehicles via Settings currently, or a future /resources route */}
              {canViewResources &&
                (category === "driver" || category === "transport" ? (
                  <NavLink
                    to="/fleet"
                    icon={config.resourcesIcon}
                    label={t(config.resourcesLabel)}
                    isCollapsed={isCollapsed}
                  />
                ) : category === "venue" ? (
                  <NavLink
                    to="/settings"
                    icon={config.resourcesIcon}
                    label={t(config.resourcesLabel)}
                    isCollapsed={isCollapsed}
                  />
                ) : null)}
              {canViewClients && (
                <NavLink
                  to="/clients"
                  icon={Users}
                  label={t("common.clients")}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* ✅ PORTFOLIO (Hidden for Drivers) */}
              {canViewPortfolio && config.showPortfolio && (
                <NavLink
                  to="/portfolio"
                  icon={Camera}
                  label={t("common.portfolio")}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* ✅ SUPPLIES (Hidden for Drivers) */}
              {canViewSupplies && config.showSupplies && (
                <NavLink
                  to="/supplies"
                  icon={BoxIcon}
                  label={t("common.supplies")}
                  isCollapsed={isCollapsed}
                />
              )}

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

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 border-t border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 whitespace-nowrap overflow-hidden">
                  <Sparkles className="w-2.5 h-2.5" />{" "}
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
