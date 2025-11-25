import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { 
  LayoutDashboard, 
  CalendarDays, 
  UserRound, 
  Handshake, 
  ListChecks, 
  BellRing, 
  LineChart, 
  CreditCard, 
  FileText, 
  Settings,
  X 
} from "lucide-react";

const AppLauncher = ({ isOpen, onClose, toggleRef }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        (!toggleRef.current || !toggleRef.current.contains(event.target))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, toggleRef]);

  if (!isOpen) return null;

  // Configuration with specific styling to match your image
  const mainApps = [
    { to: "/dashboard", icon: LayoutDashboard, label: "common.dashboard", color: "text-blue-600 bg-blue-50" },
    { to: "/events", icon: CalendarDays, label: "common.events", color: "text-purple-600 bg-purple-50" },
    { to: "/clients", icon: UserRound, label: "common.clients", color: "text-pink-600 bg-pink-50" },
    { to: "/partners", icon: Handshake, label: "common.partners", color: "text-orange-600 bg-orange-50" },
    { to: "/tasks", icon: ListChecks, label: "common.tasks", color: "text-green-600 bg-green-50" },
    { to: "/reminders", icon: BellRing, label: "common.reminders", color: "text-teal-600 bg-teal-50" },
    { to: "/finance", icon: LineChart, label: "common.finance", color: "text-indigo-600 bg-indigo-50" },
    { to: "/payments", icon: CreditCard, label: "common.payments", color: "text-cyan-600 bg-cyan-50" },
    { to: "/invoices", icon: FileText, label: "common.invoices", color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-gray-100/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* 
        This is the Main White Card 
      */}
      <div 
        ref={menuRef}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button - Positioned inside the card top-right */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center justify-center py-16 px-8 sm:px-16">
          
          {/* The 3x3 Grid */}
          <div className="grid grid-cols-3 gap-x-12 gap-y-12 w-full max-w-3xl">
            {mainApps.map((app, index) => (
              <Link
                key={index}
                to={app.to}
                onClick={onClose}
                className="group flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1"
              >
                {/* Icon Container - Squircle shape */}
                <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-4 ${app.color} dark:bg-gray-700 transition-transform duration-300 group-hover:scale-110`}>
                  <app.icon className="w-9 h-9" strokeWidth={1.8} />
                </div>
                
                {/* Label */}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {t(app.label)}
                </span>
              </Link>
            ))}
          </div>

          {/* Footer Area - Settings */}
          <div className="mt-16 w-full max-w-3xl border-t border-gray-100 dark:border-gray-700 pt-8 flex justify-center">
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-4 px-8 py-4 rounded-full bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
            >
              <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 group-hover:rotate-45 transition-transform duration-500">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-200" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("common.settings", "Settings")}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("common.managePreferences", "Manage your preferences")}
                </span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AppLauncher;