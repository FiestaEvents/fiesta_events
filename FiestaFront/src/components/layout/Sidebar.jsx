import React from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  UserRoundIcon,
  HandshakeIcon,
  ListChecksIcon,
  BellRingIcon,
  CreditCardIcon,
  FileTextIcon,
  LineChartIcon,
  UsersIcon,
  ShieldCheckIcon,
  SettingsIcon,
  XIcon,
} from "../icons/IconComponents";

const NavLink = ({ to, icon: Icon, labelKey }) => {
  const { t } = useTranslation();
  
  return (
    <RouterNavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-lg transition-colors group ${
          isActive
            ? "bg-orange-100 text-orange-600 border-r-2 border-orange-500 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-400"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-500 dark:text-gray-300 dark:hover:bg-orange-900/10 dark:hover:text-orange-300"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon 
            className={`h-5 w-5 mr-3 transition-colors ${
              isActive 
                ? "text-orange-500 dark:text-orange-400" 
                : "text-gray-500 group-hover:text-orange-500 dark:text-gray-400 dark:group-hover:text-orange-300"
            }`} 
          />
          <span className="font-medium text-sm">{t(labelKey)}</span>
        </>
      )}
    </RouterNavLink>
  );
};

const NavSection = ({ titleKey, children }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">
        {t(titleKey)}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:transform-none dark:bg-gray-800 dark:border-gray-700 ${
          isOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0 dark:border-gray-700">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-orange-500 transition-colors"
            >
              <div className="relative h-22 w-15">
                {/* Light mode logo */}
                <img
                  src="/fiesta logo-01.png"
                  alt="Fiesta Logo"
                  className="h-24 w-40 dark:hidden"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />

                {/* Dark mode logo */}
                <img
                  src="/fiesta logo-01.png"
                  alt="Fiesta Logo"
                  className="hidden h-24 w-40 dark:block"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />

                {/* Fallback if both logos fail */}
                <div className="hidden h-24 w-40 bg-orange-500 rounded-lg items-center justify-center text-white text-lg font-bold">
                  F
                </div>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-300 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <NavSection titleKey="sidebar.overview">
              <NavLink to="/" icon={LayoutDashboardIcon} labelKey="common.dashboard" />
            </NavSection>

            <NavSection titleKey="sidebar.operations">
              <NavLink to="/events" icon={CalendarDaysIcon} labelKey="common.events" />
              <NavLink to="/clients" icon={UserRoundIcon} labelKey="common.clients" />
              <NavLink to="/partners" icon={HandshakeIcon} labelKey="common.partners" />
              <NavLink to="/tasks" icon={ListChecksIcon} labelKey="common.tasks" />
              <NavLink to="/reminders" icon={BellRingIcon} labelKey="common.reminders" />
            </NavSection>

            <NavSection titleKey="sidebar.financial">
              <NavLink to="/payments" icon={CreditCardIcon} labelKey="common.payments" />
              <NavLink to="/invoices" icon={FileTextIcon} labelKey="common.invoices" />
              <NavLink to="/finance" icon={LineChartIcon} labelKey="common.finance" />
            </NavSection>

            <NavSection titleKey="sidebar.management">
              <NavLink to="/team" icon={UsersIcon} labelKey="common.team" />
              <NavLink to="/roles" icon={ShieldCheckIcon} labelKey="common.roles" />
              <NavLink to="/settings" icon={SettingsIcon} labelKey="common.settings" />
            </NavSection>
          </nav>

          <div className="p-4 border-t border-gray-200 mt-auto dark:border-gray-700">
            <p className="text-xs text-gray-500 text-center dark:text-gray-400">
              &copy; 2024 Fiesta Inc. {t('common.allRightsReserved')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;