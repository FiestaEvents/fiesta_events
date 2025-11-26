import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes.jsx";

// ✅ Keep LoadingSpinner static so it's available immediately
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

// ============================================
// LAZY IMPORTS (Code Splitting)
// ============================================

// Layouts
const AuthLayout = lazy(() => import("../components/layout/AuthLayout.jsx"));
const MainLayout = lazy(() => import("../components/layout/MainLayout.jsx"));

// Auth Pages
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));

// Main
const Home = lazy(() => import("../pages/Home.jsx"));
const Dashboard = lazy(() => import("../pages/Dashboard2.jsx"));
const Landing = lazy(() => import("../pages/landing.jsx"));

// Events
const EventsList = lazy(() => import("../pages/events/EventsList.jsx"));
const EventDetail = lazy(() => import("../pages/events/EventDetail.jsx"));
const CreateEventPage = lazy(
  () => import("../pages/events/EventForm/CreateEventPage.jsx")
);
const EditEventPage = lazy(
  () => import("../pages/events/EventForm/EditEventPage.jsx")
);

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

// Invoices
const Invoices = lazy(() => import("../pages/invoices/InvoicesPage.jsx"));
const InvoiceFormPage = lazy(
  () => import("../pages/invoices/InvoiceFormPage.jsx")
);
const InvoiceSettingPage = lazy(
  () => import("../pages/invoices/InvoiceCustomizationPage.jsx")
);

// Contracts
const ContractsList = lazy(() => import("../pages/contracts/ContractListPage.jsx"));
const ContractFormPage = lazy(() => import("../pages/contracts/ContractFormPage.jsx"));
const ContractDetail = lazy(() => import("../pages/contracts/ContractDetailPage.jsx"));
const ContractSettingsPage = lazy(() => import("../pages/contracts/ContractSettingsPage.jsx"));

// Finance
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

// Settings
const VenueSettings = lazy(() => import("../pages/settings/VenueSettings.jsx"));

// ============================================
// ROUTING CONFIGURATION
// ============================================

const AppRoutes = () => {
  // Center the spinner for the initial load
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Navigate to="/landing" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />

            {/* Events */}
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/:id/edit" element={<EditEventPage />} />
            <Route path="/events/:id/detail" element={<EventDetail />} />
            <Route path="/events/:id" element={<EventDetail />} />

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
            <Route path="/invoices/settings" element={<InvoiceSettingPage />} />

            {/* Contracts */}
            <Route path="/contracts" element={<ContractsList />} />
            <Route path="/contracts/new" element={<ContractFormPage />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/contracts/:id/edit" element={<ContractFormPage />} />
            <Route path="/contracts/settings" element={<ContractSettingsPage />} />

            {/* Finance */}
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/transactions" element={<Transactions />} />
            <Route path="/finance/analytics" element={<Analytics />} />
            <Route path="/finance/reports" element={<FinanceReports />} />

            {/* Tasks */}
            <Route path="/tasks" element={<TasksList />} />
            <Route path="/tasks/board" element={<TasksList />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
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

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;