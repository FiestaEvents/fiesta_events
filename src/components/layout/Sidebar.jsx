import React from "react";
import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
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
  Settings,
  X
} from "lucide-react";

// ✅ Animated NavLink Component
const NavLink = ({ to, icon: Icon, labelKey, badge, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <RouterNavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `relative flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 group overflow-hidden ${
          isActive
            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <motion.div
          className={`flex items-center w-full ${isCollapsed ? "justify-center" : ""}`}
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.95 }}   
        >
          {/* Icon */}
          <Icon
            className={`flex-shrink-0 transition-all duration-300 ${
              isCollapsed ? "w-6 h-6" : "w-5 h-5"
            }`}
          />

          {/* Text Label - Fades out smoothly on collapse */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
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
              className={`ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full shadow-sm`}
            >
              {badge}
            </motion.span>
          )}
        </motion.div>
      )}
    </RouterNavLink>
  );
};

const NavSection = ({ titleKey, children, isCollapsed }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="mb-2">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.h3
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t(titleKey)}
          </motion.h3>
        )}
      </AnimatePresence>
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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 bg-white dark:bg-gray-900 z-40 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-72"} 
        ${isRTL ? "right-0" : "left-0"}
        ${
          isOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header / Logo Area */}
          <div className="h-20 flex items-center justify-center shrink-0 mx-4">
             {!isCollapsed ? (
                <Link to="/" className="flex items-center gap-2 overflow-hidden">
                  <motion.img 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    src="/fiesta logo-01.png" 
                    alt="Logo" 
                    className="h-10 object-contain" 
                  />
                </Link>
             ) : (
                <Link to="/">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    F
                    </div>
                </Link>
             )}
             
             {/* Mobile Close Button */}
             <button
                onClick={onClose}
                className="lg:hidden absolute right-4 p-2 text-gray-500 hover:text-red-500"
              >
                <X size={24} />
              </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
            
            {/* ✅ FIXED: Restored Quick Access / Overview Section with both Home and Dashboard */}
            <NavSection titleKey="sidebar.overview" isCollapsed={isCollapsed}>
              <NavLink to="/home" icon={LayoutDashboard} labelKey="common.home" isCollapsed={isCollapsed} />
              <NavLink to="/dashboard" icon={LayoutDashboard} labelKey="common.dashboard" isCollapsed={isCollapsed} />
            </NavSection>

            <NavSection titleKey="sidebar.operations" isCollapsed={isCollapsed}>
              <NavLink to="/events" icon={CalendarDays} labelKey="common.events" isCollapsed={isCollapsed} />
              <NavLink to="/clients" icon={UserRound} labelKey="common.clients" isCollapsed={isCollapsed} />
              <NavLink to="/partners" icon={Handshake} labelKey="common.partners" isCollapsed={isCollapsed} />
              <NavLink to="/tasks" icon={ListChecks} labelKey="common.tasks" isCollapsed={isCollapsed} />
              <NavLink to="/reminders" icon={BellRing} labelKey="common.reminders" isCollapsed={isCollapsed}/>
            </NavSection>

            <NavSection titleKey="sidebar.financial" isCollapsed={isCollapsed}>
              <NavLink to="/finance" icon={LineChart} labelKey="common.finance" isCollapsed={isCollapsed} />
              <NavLink to="/payments" icon={CreditCard} labelKey="common.payments" isCollapsed={isCollapsed} />
              <NavLink to="/invoices" icon={FileText} labelKey="common.invoices" isCollapsed={isCollapsed} />
            </NavSection>

            <NavSection titleKey="sidebar.management" isCollapsed={isCollapsed}>
              <NavLink to="/contracts" icon={Settings} labelKey="common.contracts" isCollapsed={isCollapsed} />
              <NavLink to="/documents" icon={FileText} labelKey="common.documents" isCollapsed={isCollapsed} />
              <NavLink to="/settings" icon={Settings} labelKey="common.settings" isCollapsed={isCollapsed} />
            </NavSection>

          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
              &copy; 2025 Fiesta Inc.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;