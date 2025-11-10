import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes.jsx";

// Common component for Suspense fallback
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

// Layouts
import AuthLayout from "../components/layout/AuthLayout.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";

// ============================================
// LAZY-LOADED PAGE COMPONENTS
// (Standardized to List/Detail/Form naming)
// ============================================

// Auth Pages
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));

// Main Pages
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));

// Events
const EventsList = lazy(() => import("../pages/events/EventsList.jsx"));
const EventDetail = lazy(() => import("../pages/events/EventDetailModal.jsx"));
const EventForm = lazy(() => import("../pages/events/EventForm.jsx"));

// Clients
const ClientsList = lazy(() => import("../pages/clients/ClientsList.jsx"));
const ClientDetail = lazy(() => import("../pages/clients/ClientDetail.jsx"));
const ClientForm = lazy(() => import("../pages/clients/ClientForm.jsx"));

// Partners
const PartnersList = lazy(() => import("../pages/partners/PartnersList.jsx"));
const PartnerDetail = lazy(() => import("../pages/partners/PartnerDetail.jsx"));
const PartnerForm = lazy(() => import("../pages/partners/PartnerForm.jsx"));

// Payments
const PaymentsList = lazy(() => import("../pages/payments/PaymentsList.jsx"));
const PaymentDetail = lazy(() => import("../pages/payments/PaymentDetail.jsx"));
const PaymentForm = lazy(() => import("../pages/payments/PaymentForm.jsx"));

// Invoices (Working)
const Invoices = lazy(() => import("../pages/invoices/InvoicesPage.jsx"));
const InvoiceFormPage = lazy(
  () => import("../pages/invoices/InvoiceFormPage.jsx")
);

// Finance (Working)
const Finance = lazy(() => import("../pages/finance/Finance.jsx"));
const FinanceReports = lazy(() => import("../pages/finance/Reports.jsx"));
const Transactions = lazy(() => import("../pages/finance/Transactions.jsx"));
const Analytics = lazy(() => import("../pages/finance/Analytics.jsx"));

// Tasks
const TasksList = lazy(() => import("../pages/tasks/TasksList.jsx"));
const TaskDetail = lazy(() => import("../pages/tasks/TaskDetail.jsx"));
const TaskForm = lazy(() => import("../pages/tasks/TaskForm.jsx"));

// Reminders
const RemindersList = lazy(
  () => import("../pages/reminders/RemindersList.jsx")
);
const ReminderDetail = lazy(
  () => import("../pages/reminders/ReminderDetails.jsx")
);
const ReminderForm = lazy(() => import("../pages/reminders/ReminderForm.jsx"));

// Team
const TeamList = lazy(() => import("../pages/team/TeamList.jsx"));
const TeamMemberDetail = lazy(
  () => import("../pages/team/TeamMemberDetail.jsx")
);
const InviteTeam = lazy(() => import("../pages/team/InviteTeam.jsx"));
const TeamMemberEdit = lazy(() => import("../pages/team/TeamForm.jsx"));

// Roles
const RolesList = lazy(() => import("../pages/roles/RolesList.jsx"));
const RoleForm = lazy(() => import("../pages/roles/RoleForm.jsx"));

// Settings (Working)
const VenueSettings = lazy(() => import("../pages/settings/VenueSettings.jsx"));
const ProfileSettings = lazy(
  () => import("../pages/settings/ProfileSettings.jsx")
);
const SecuritySettings = lazy(
  () => import("../pages/settings/SecuritySettings.jsx")
);

// ============================================
// ROUTING CONFIGURATION
// ============================================
const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* PUBLIC ROUTES (Auth Layout) */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* PROTECTED ROUTES (Authentication Guard) */}
        <Route element={<ProtectedRoute />}>
          {/* MainLayout WRAPPER */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Events */}
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventForm />} />

            {/* Clients */}
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />

            {/* Partners */}
            <Route path="/partners" element={<PartnersList />} />
            <Route path="/partners/new" element={<PartnerForm />} />
            <Route path="/partners/:id" element={<PartnerDetail />} />
            <Route path="/partners/:id/edit" element={<PartnerForm />} />

            {/* Payments */}
            <Route path="/payments" element={<PaymentsList />} />
            <Route path="/payments/new" element={<PaymentForm />} />
            <Route path="/payments/:id" element={<PaymentDetail />} />
            <Route path="/payments/:id/edit" element={<PaymentForm />} />

            {/* Invoices */}
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceFormPage />} />
            <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
            {/* Finance */}
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/transactions" element={<Transactions />} />
            <Route path="/finance/analytics" element={<Analytics />} />
            <Route path="/finance/reports" element={<FinanceReports />} />
            {/* Tasks */}
            <Route path="/tasks" element={<TasksList />} />
            <Route path="/tasks/board" element={<TasksList />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/:id/edit" element={<TaskForm />} />

            {/* Reminders */}
            <Route path="/reminders" element={<RemindersList />} />
            <Route path="/reminders/new" element={<ReminderForm />} />
            <Route path="/reminders/:id" element={<ReminderDetail />} />
            <Route path="/reminders/:id/edit" element={<ReminderForm />} />

            {/* Team */}
            <Route path="/team" element={<TeamList />} />
            <Route path="/team/invite" element={<InviteTeam />} />
            <Route path="/team/:id" element={<TeamMemberDetail />} />
            <Route path="/team/:id/edit" element={<TeamMemberEdit />} />

            {/* Roles */}
            <Route path="/roles" element={<RolesList />} />
            <Route path="/roles/new" element={<RoleForm />} />
            <Route path="/roles/:id/edit" element={<RoleForm />} />

            {/* Settings  */}
            <Route path="/settings" element={<VenueSettings />} />
          </Route>
        </Route>

        {/* Catch-all for Not Found */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
