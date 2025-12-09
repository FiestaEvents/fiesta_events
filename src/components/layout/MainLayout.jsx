import React, { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useLanguage } from "../../context/LanguageContext";

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isRTL } = useLanguage();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  }, []);

  const sidebarPadding = isCollapsed
    ? isRTL
      ? "lg:pr-8"
      : "lg:pl-8"
    : isRTL
      ? "lg:pr-44"
      : "lg:pl-44";

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-300">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className={`transition-all duration-300 ${sidebarPadding}`}>
        <TopBar
          onMenuClick={handleMenuClick}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <main className="md:p-20 p-16 px-0 md:pt-24 pt-20 flex justify-center ">
          <div className="w-full min-h-[calc(100vh-4rem-2rem)] hidden-scroll">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
