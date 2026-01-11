import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrbitLoader from '../components/common/LoadingSpinner';

const SuperAdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;
  }

  if (!user || !user.isSuperAdmin) {
    // Redirect unauthorized users to their normal dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;