import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getUserInitials = () =>
    user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U";
  
  const userAvatar = user?.avatar || null;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {user?.role?.name || "Staff"}
          </p>
        </div>
        <div className="relative">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="Avatar"
              className="w-9 h-9 rounded-lg object-cover bg-gray-200"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {getUserInitials()}
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 ${isRTL ? "left-0" : "right-0"}`}
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getUserInitials()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="p-1">
              <button
                onClick={() => { navigate("/Profile"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Settings className="w-4 h-4" /> {t("common.ProfileSettings")}
              </button>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <LogOut className="w-4 h-4" /> {t("common.logout")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;