import React, { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useLanguage } from "../../context/LanguageContext";

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isRTL } = useLanguage();

  // Load collapse state from localStorage on mount
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

  // Calculate padding based on RTL and collapse state
  const sidebarPadding = isCollapsed
    ? (isRTL ? "lg:pr-20" : "lg:pl-20")
    : (isRTL ? "lg:pr-64" : "lg:pl-64");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Standard Sidebar */}
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
        <main className="p-16">
          <div className="p-4">
            <div className="w-full min-h-[calc(100vh-4rem-3rem)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;