import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";
import DocumentTitle from "../components/common/DocumentTitle.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

// Lazy-loaded protected pages
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const EventsPage = lazy(() => import("../pages/events/EventsPage.jsx"));
const CalendarPage = lazy(() => import("../pages/calendar/CalendarPage.jsx"));
const ClientsPage = lazy(() => import("../pages/clients/ClientsPage.jsx"));
const PartnersPage = lazy(() => import("../pages/partners/PartnersPage.jsx"));
const TasksPage = lazy(() => import("../pages/tasks/TasksPage.jsx"));
const RemindersPage = lazy(() => import("../pages/reminders/RemindersPage.jsx"));
const PaymentsPage = lazy(() => import("../pages/payments/PaymentsPage.jsx"));
const InvoicesPage = lazy(() => import("../pages/invoices/InvoicesPage.jsx"));
const FinancePage = lazy(() => import("../pages/finance/FinancePage.jsx"));
const TeamPage = lazy(() => import("../pages/team/TeamPage.jsx"));
const RolesPage = lazy(() => import("../pages/roles/RolesPage.jsx"));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage.jsx"));
const ProfilePage = lazy(() => import("../pages/Profile.jsx"));
// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const ProtectedRoutes = () => (
  <ProtectedRoute>
    <Routes>
      {/* All routes wrapped in MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <DocumentTitle title="Dashboard">
              <Dashboard />
            </DocumentTitle>
          }
        />
        <Route
          path="events"
          element={
            <DocumentTitle title="Events">
              <EventsPage />
            </DocumentTitle>
          }
        />
        <Route
          path="calendar"
          element={
            <DocumentTitle title="Calendar">
              <CalendarPage />
            </DocumentTitle>
          }
        />
        <Route
          path="clients"
          element={
            <DocumentTitle title="Clients">
              <ClientsPage />
            </DocumentTitle>
          }
        />
        <Route
          path="partners"
          element={
            <DocumentTitle title="Partners">
              <PartnersPage />
            </DocumentTitle>
          }
        />
        <Route
          path="tasks"
          element={
            <DocumentTitle title="Tasks">
              <TasksPage />
            </DocumentTitle>
          }
        />
        <Route
          path="reminders"
          element={
            <DocumentTitle title="Reminders">
              <RemindersPage />
            </DocumentTitle>
          }
        />
        <Route
          path="payments"
          element={
            <DocumentTitle title="Payments">
              <PaymentsPage />
            </DocumentTitle>
          }
        />
        <Route
          path="invoices"
          element={
            <DocumentTitle title="Invoices">
              <InvoicesPage />
            </DocumentTitle>
          }
        />
        <Route
          path="finance"
          element={
            <DocumentTitle title="Finance">
              <FinancePage />
            </DocumentTitle>
          }
        />
        <Route
          path="team"
          element={
            <DocumentTitle title="Team">
              <TeamPage />
            </DocumentTitle>
          }
        />
        <Route
          path="roles"
          element={
            <DocumentTitle title="Roles & Permissions">
              <RolesPage />
            </DocumentTitle>
          }
        />
        <Route
          path="settings"
          element={
            <DocumentTitle title="Settings">
              <SettingsPage />
            </DocumentTitle>
          }
        />
                <Route
          path="settings"
          element={
            <DocumentTitle title="Settings">
              <SettingsPage />
            </DocumentTitle>
          }
        />
                <Route
          path="settings"
          element={
            <DocumentTitle title="Settings">
              <SettingsPage />
            </DocumentTitle>
          }
        />
        <Route
          path="profile"
          element={
            <DocumentTitle title="Profile">
              <ProfilePage />
            </DocumentTitle>
          }
        />

        {/* 404 Page - Rendered inside MainLayout */}
        <Route
          path="*"
          element={
            <DocumentTitle title="Page Not Found">
              <NotFoundPage />
            </DocumentTitle>
          }
        />
      </Route>
    </Routes>
  </ProtectedRoute>
);

export default ProtectedRoutes;