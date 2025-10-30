import React from 'react';
import { NavLink as RouterNavLink, Link } from 'react-router-dom';
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
  PartyPopperIcon,
} from '../icons/IconComponents';

const NavLink = ({ to, icon: Icon, label }) => (
  <RouterNavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-orange-50 text-orange-500 dark:bg-gray-700 dark:text-orange-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`
    }
  >
    <Icon className="h-5 w-5 mr-3" />
    <span className="font-medium text-sm">{label}</span>
  </RouterNavLink>
);

const NavSection = ({ title, children }) => (
  <div>
    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:transform-none dark:bg-gray-800 dark:border-gray-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0 dark:border-gray-700">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
            >
              <PartyPopperIcon className="h-7 w-7 text-orange-500" />
              <span>Fiesta</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <NavSection title="Overview">
              <NavLink to="/" icon={LayoutDashboardIcon} label="Dashboard" />
            </NavSection>

            <NavSection title="Operations">
              <NavLink to="/events" icon={CalendarDaysIcon} label="Events" />
              <NavLink to="/calendar" icon={CalendarDaysIcon} label="Calendar" />
              <NavLink to="/clients" icon={UserRoundIcon} label="Clients" />
              <NavLink to="/partners" icon={HandshakeIcon} label="Partners" />
              <NavLink to="/tasks" icon={ListChecksIcon} label="Tasks" />
              <NavLink to="/reminders" icon={BellRingIcon} label="Reminders" />
            </NavSection>

            <NavSection title="Financial">
              <NavLink to="/payments" icon={CreditCardIcon} label="Payments" />
              <NavLink to="/invoices" icon={FileTextIcon} label="Invoices" />
              <NavLink to="/finance" icon={LineChartIcon} label="Finance" />
            </NavSection>

            <NavSection title="Management">
              <NavLink to="/team" icon={UsersIcon} label="Team" />
              <NavLink to="/roles" icon={ShieldCheckIcon} label="Roles" />
              <NavLink to="/settings" icon={SettingsIcon} label="Settings" />
            </NavSection>
          </nav>

          <div className="p-4 border-t border-gray-200 mt-auto dark:border-gray-700">
            <p className="text-xs text-gray-500 text-center dark:text-gray-400">
              &copy; 2024 Fiesta Inc. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
