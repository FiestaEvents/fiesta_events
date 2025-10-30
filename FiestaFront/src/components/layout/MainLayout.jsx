
import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <div className="lg:pl-64">
        <TopBar onMenuClick={handleMenuClick} />
        <main className="pt-10">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
