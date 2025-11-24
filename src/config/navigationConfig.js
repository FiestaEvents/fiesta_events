// src/config/navigationConfig.js
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
  SettingsIcon,
  UsersIcon, // Ensure you have imported all icons used below
} from "../components/icons/IconComponents"; 

export const navigationConfig = [
  {
    titleKey: "sidebar.overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboardIcon, labelKey: "common.dashboard", color: "bg-blue-600" },
    ],
  },
  {
    titleKey: "sidebar.operations",
    items: [
      { to: "/events", icon: CalendarDaysIcon, labelKey: "common.events", color: "bg-purple-600" },
      { to: "/clients", icon: UserRoundIcon, labelKey: "common.clients", color: "bg-pink-600" },
      { to: "/partners", icon: HandshakeIcon, labelKey: "common.partners", badge: "New", color: "bg-orange-500" },
      { to: "/tasks", icon: ListChecksIcon, labelKey: "common.tasks", color: "bg-green-600" },
      { to: "/reminders", icon: BellRingIcon, labelKey: "common.reminders", color: "bg-teal-600" },
    ],
  },
  {
    titleKey: "sidebar.financial",
    items: [
      { to: "/finance", icon: LineChartIcon, labelKey: "common.finance", color: "bg-indigo-600" },
      { to: "/payments", icon: CreditCardIcon, labelKey: "common.payments", color: "bg-cyan-700" },
      { to: "/invoices", icon: FileTextIcon, labelKey: "common.invoices", color: "bg-emerald-700" },
    ],
  },
  {
    titleKey: "sidebar.management",
    items: [
      { to: "/users", icon: UsersIcon, labelKey: "common.users", color: "bg-slate-600" },
      { to: "/settings", icon: SettingsIcon, labelKey: "common.settings", color: "bg-gray-700" },
    ],
  },
];