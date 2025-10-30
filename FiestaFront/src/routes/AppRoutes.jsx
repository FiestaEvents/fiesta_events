import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import PublicRoutes from "./PublicRoutes.jsx";
import ProtectedRoutes from "./ProtectedRoutes.jsx";

// Global loader component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner size="large" />
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public Routes (Auth) */}
      <Route path="/auth/*" element={<PublicRoutes />} />
      
      {/* Protected Routes (Main App) */}
      <Route path="/*" element={<ProtectedRoutes />} />
      
      {/* Redirect /login and /register to new auth paths */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;