import React, { useState } from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  UserRoundIcon,
  HandshakeIcon,
  ListChecksIcon,
  BellRingIcon,
  CreditCardIcon,
  FileText,
  FileTextIcon,
  LineChartIcon,
  UsersIcon,
  ShieldCheckIcon,
  SettingsIcon,
  XIcon,
} from "../icons/IconComponents";

const NavLink = ({ to, icon: Icon, labelKey, badge, isCollapsed }) => {
  const { t } = useTranslation();

  return (
    <RouterNavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-[#f97316] text-white shadow-lg shadow-orange-500/30"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 min-w-0">
            <Icon
              className={`flex-shrink-0 ${isCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium truncate">
                {t(labelKey)}
              </span>
            )}
          </div>
          {!isCollapsed && badge && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
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

  return (
    <div>
      {!isCollapsed && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
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

  // Sample badge counts (you can fetch these from your API)
  const badges = {
    events: "12",
    payments: "3",
    tasks: "8",
    reminders: "5",
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} bottom-0 bg-white z-40 transition-all duration-300 dark:bg-gray-900 dark:border-gray-700 ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 m-4 shrink-0 dark:border-gray-700">
            {!isCollapsed && (
              <Link to="/">
                <div className="size-full">
                  <img
                    src="/fiesta logo-01.png"
                    alt="Fiesta Logo"
                    className="w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link to="/" className="flex items-center justify-center w-full">
                <div className="relative h-25 w-20">
                  <img
                    src="/fiesta logo-01.png"
                    alt="Fiesta Logo"
                    className="h-30 w-24 "
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </Link>
            )}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-ornge-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
            <NavSection titleKey="sidebar.overview" isCollapsed={isCollapsed}>
              <NavLink
                to="/"
                icon={LayoutDashboardIcon}
                labelKey="common.dashboard"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            <NavSection titleKey="sidebar.operations" isCollapsed={isCollapsed}>
              <NavLink
                to="/events"
                icon={CalendarDaysIcon}
                labelKey="common.events"
                badge={null}
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/clients"
                icon={UserRoundIcon}
                labelKey="common.clients"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/partners"
                icon={HandshakeIcon}
                labelKey="common.partners"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/tasks"
                icon={ListChecksIcon}
                labelKey="common.tasks"
                badge={null}
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/reminders"
                icon={BellRingIcon}
                labelKey="common.reminders"
                badge={null}
                isCollapsed={isCollapsed}
              />
            </NavSection>

            <NavSection titleKey="sidebar.financial" isCollapsed={isCollapsed}>
              <NavLink
                to="/finance"
                icon={LineChartIcon}
                labelKey="common.finance"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/payments"
                icon={CreditCardIcon}
                labelKey="common.payments"
                badge={null}
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/invoices"
                icon={FileTextIcon}
                labelKey="common.invoices"
                isCollapsed={isCollapsed}
              />
            </NavSection>

            <NavSection titleKey="sidebar.management" isCollapsed={isCollapsed}>
              <NavLink
                to="/team"
                icon={UsersIcon}
                labelKey="common.team"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/roles"
                icon={ShieldCheckIcon}
                labelKey="common.roles"
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/settings"
                icon={SettingsIcon}
                labelKey="common.settings"
                isCollapsed={isCollapsed}
              />
            </NavSection>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <p className="text-xs text-gray-500 text-center dark:text-gray-400 mb-3">
                &copy; 2024 Fiesta Inc. {t("common.allRightsReserved")}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
