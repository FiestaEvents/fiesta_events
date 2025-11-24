import React from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Handshake,
  ListChecks,
  BellRing,
  CreditCard,
  FileText,
  LineChart,
  Users,
  Settings,
  X,
} from "lucide-react"; // Updated to use Lucide imports directly

const NavLink = ({ to, icon: Icon, labelKey, badge, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <RouterNavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`flex items-center min-w-0 ${
              isCollapsed
                ? "justify-center w-full"
                : isRTL
                  ? "gap-3 flex-row-reverse"
                  : "gap-3"
            }`}
          >
            <Icon
              className={`flex-shrink-0 ${isCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium truncate">{t(labelKey)}</span>
            )}
          </div>
          {!isCollapsed && badge && (
            <span
              className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full ${
                isRTL ? "mr-auto" : "ml-auto"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </RouterNavLink>
  );
};

const NavSection = ({ titleKey, children, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div>
      {!isCollapsed && (
        <h3
          className={`px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t(titleKey)}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 bg-white z-40 transition-all duration-300 dark:bg-gray-900 dark:border-gray-700
        ${isCollapsed ? "w-20" : "w-64"}
        ${isRTL ? "right-0 border-l" : "left-0 border-r"}
        ${
          isOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <div
            className={`flex items-center h-16 m-4 shrink-0 dark:border-gray-700 ${
              isCollapsed
                ? "justify-center"
                : isRTL
                  ? "justify-between flex-row-reverse"
                  : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <Link to="/" className="flex-shrink-0">
                <div className="h-12 w-auto">
                  <img
                    src="/fiesta logo-01.png"
                    alt="Fiesta Logo"
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link to="/" className="flex items-center justify-center">
                 {/* Small logo or Icon here */}
                 <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
              </Link>
            )}
            {!isCollapsed && (
              <button
                onClick={onClose}
                className="lg:hidden text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
            {/* Overview Section */}
            <NavSection titleKey="sidebar.overview" isCollapsed={isCollapsed}>
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
                icon={CalendarDays}
                labelKey="common.events"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/clients"
                icon={UserRound}
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
                icon={ListChecks}
                labelKey="common.tasks"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/reminders"
                icon={BellRing}
                labelKey="common.reminders"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            {/* Financial Section */}
            <NavSection titleKey="sidebar.financial" isCollapsed={isCollapsed}>
              <NavLink
                to="/finance"
                icon={LineChart}
                labelKey="common.finance"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/payments"
                icon={CreditCard}
                labelKey="common.payments"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/invoices"
                icon={FileText}
                labelKey="common.invoices"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            {/* Management Section */}
            <NavSection titleKey="sidebar.management" isCollapsed={isCollapsed}>
              <NavLink
                to="/settings"
                icon={Settings}
                labelKey="common.settings"
                isCollapsed={isCollapsed}
              />
            </NavSection>
          </nav>

          {/* Footer */}
          <div
            className={`p-3 border-t border-gray-200 dark:border-gray-700 ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <p
              className={`text-xs text-gray-500 dark:text-gray-400 mb-3 ${
                isRTL ? "text-right" : "text-center"
              }`}
            >
              &copy; 2025 Fiesta Inc. {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;