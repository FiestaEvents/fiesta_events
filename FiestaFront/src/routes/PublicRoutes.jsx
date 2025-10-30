import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import DocumentTitle from "../components/common/DocumentTitle.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

// Lazy-loaded auth pages
const LoginPage = lazy(() => import("../pages/auth/Login.jsx"));
const RegisterPage = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPassword.jsx"));

// Auth route wrapper (redirects authenticated users to dashboard)
const AuthRoute = ({ children, allowAuthenticated = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect authenticated users to dashboard (except for password reset)
  if (isAuthenticated && !allowAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoutes = () => (
  <Routes>
    <Route
      path="login"
      element={
        <AuthRoute>
          <DocumentTitle title="Login">
            <LoginPage />
          </DocumentTitle>
        </AuthRoute>
      }
    />
    <Route
      path="register"
      element={
        <AuthRoute>
          <DocumentTitle title="Register">
            <RegisterPage />
          </DocumentTitle>
        </AuthRoute>
      }
    />
    <Route
      path="forgot-password"
      element={
        <AuthRoute allowAuthenticated>
          <DocumentTitle title="Forgot Password">
            <ForgotPasswordPage />
          </DocumentTitle>
        </AuthRoute>
      }
    />
    <Route
      path="reset-password/:token"
      element={
        <AuthRoute allowAuthenticated>
          <DocumentTitle title="Reset Password">
            <ResetPasswordPage />
          </DocumentTitle>
        </AuthRoute>
      }
    />
    
    {/* Redirect /auth to /auth/login */}
    <Route path="/" element={<Navigate to="login" replace />} />
    <Route path="*" element={<Navigate to="login" replace />} />
  </Routes>
);

export default PublicRoutes;