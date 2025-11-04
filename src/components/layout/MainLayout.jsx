import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-white-150 dark:bg-gray-900 scrollbar-hide">
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <div className="lg:pl-60">
        <TopBar onMenuClick={handleMenuClick} />
        <main className="relative top-10 ">
          <div className="container max-w-7xl sm:p-6 lg:p-10 ">
            <div className="w-full min-h-[calc(100vh-4rem-1.5rem)]  ">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
