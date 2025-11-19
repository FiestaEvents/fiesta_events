import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes.jsx";

// Layouts
import AuthLayout from "../components/layout/AuthLayout.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";

// Common components
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

// Auth Pages
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";

// Main
import Dashboard from "../pages/Dashboard.jsx";

// Events
import EventsList from "../pages/events/EventsList.jsx";
import EventDetail from "../pages/events/EventDetail.jsx";
import EventForm from "../pages/events/EventForm/index.jsx";

// Clients
import ClientsList from "../pages/clients/ClientsList.jsx";
import ClientDetail from "../pages/clients/ClientDetail.jsx";
import ClientForm from "../pages/clients/ClientForm.jsx";

// Partners
import PartnersList from "../pages/partners/PartnersList.jsx";
import PartnerDetail from "../pages/partners/PartnerDetail.jsx";
import PartnerForm from "../pages/partners/PartnerForm.jsx";

// Payments
import PaymentsList from "../pages/payments/PaymentsList.jsx";
import PaymentDetail from "../pages/payments/PaymentDetail.jsx";
import PaymentForm from "../pages/payments/PaymentForm.jsx";

// Invoices
import Invoices from "../pages/invoices/InvoicesPage.jsx";
import InvoiceFormPage from "../pages/invoices/InvoiceFormPage.jsx";

// Finance
import Finance from "../pages/finance/Finance.jsx";
import FinanceReports from "../pages/finance/Reports.jsx";
import Transactions from "../pages/finance/Transactions.jsx";
import Analytics from "../pages/finance/Analytics.jsx";

// Tasks
import TasksList from "../pages/tasks/TasksList.jsx";
import TaskDetail from "../pages/tasks/TaskDetail.jsx";
import TaskForm from "../pages/tasks/TaskForm.jsx";

// Reminders
import RemindersList from "../pages/reminders/RemindersList.jsx";
import ReminderDetail from "../pages/reminders/ReminderDetails.jsx";
import ReminderForm from "../pages/reminders/ReminderForm.jsx";

// Team
import TeamList from "../pages/team/TeamList.jsx";
import TeamMemberDetail from "../pages/team/TeamMemberDetail.jsx";
import InviteTeam from "../pages/team/InviteTeam.jsx";
import TeamMemberEdit from "../pages/team/TeamForm.jsx";

// Roles
import RolesList from "../pages/roles/RolesList.jsx";
import RoleForm from "../pages/roles/RoleForm.jsx";

// Settings
import VenueSettings from "../pages/settings/VenueSettings.jsx";
import Landing from "../pages/landing.jsx";

// ============================================
// ROUTING CONFIGURATION
// ============================================

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Events */}
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/:id/detail" element={<EventDetail />} />
          <Route path="/events/:id" element={<EventForm />} />

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
  );
};

export default AppRoutes;
