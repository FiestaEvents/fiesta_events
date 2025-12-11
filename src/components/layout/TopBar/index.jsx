import React from "react";
import { Link } from "react-router-dom";
import { Menu, LayoutGrid, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Contexts
import { useTheme } from "../../../context/ThemeContext";
import { useLanguage } from "../../../context/LanguageContext";
import LanguageSwitcher from "../../common/LanguageSwitcher";

// Modular Components
import SearchBar from "./SearchBar";
import NotificationMenu from "./NotificationMenu";
import UserMenu from "./UserMenu";

const TopBar = ({ onMenuClick, isCollapsed, onToggleCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const { isRTL } = useLanguage();

  const topBarOffset = isCollapsed
    ? (isRTL ? "lg:right-16" : "lg:left-16")
    : (isRTL ? "lg:right-56" : "lg:left-56");

  // Animation Variants for the Icons
  const iconVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 } 
    },
    exit: { 
      scale: 0, 
      rotate: 180, 
      opacity: 0,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <header className={`fixed top-0 ${isRTL ? "left-0 right-0" : "left-0 right-0"} h-16 bg-white/90 backdrop-blur-md z-40 transition-all duration-300 ${topBarOffset} dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        
        {/* --- LEFT: Logo & Mobile Menu --- */}
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
          
          <motion.button whileTap={{ scale: 0.95 }} onClick={onToggleCollapse} className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
          
          <Link to="/home" className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20">
            <LayoutGrid className="w-5 h-5 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 transition-colors" />
          </Link>
          
          <Link to="/" className="lg:hidden block">
            <img src="/fiesta logo-01.png" className="h-8 w-auto" alt="Logo" onError={(e) => (e.target.style.display = "none")} />
          </Link>
        </div>

        {/* --- CENTER: Search --- */}
        <SearchBar />

        {/* --- RIGHT: Actions --- */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* =======================================================
              COOL THEME TOGGLE ANIMATION
             ======================================================= */}
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={toggleTheme} 
            className={`
              relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300
              ${theme === "light" 
                ? "bg-orange-100 hover:bg-orange-200" 
                : "bg-gray-800 hover:bg-gray-700"
              }
            `}
            aria-label="Toggle Dark Mode"
          >
            {/* The AnimatePresence allows the exit animation to play */}
            <AnimatePresence mode="wait" initial={false}>
              {theme === "light" ? (
                <motion.div
                  key="sun"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute"
                >
                  <Sun className="w-5 h-5 text-orange-600 fill-orange-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute"
                >
                  <Moon className="w-5 h-5 text-blue-400 fill-blue-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <NotificationMenu />
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopBar;