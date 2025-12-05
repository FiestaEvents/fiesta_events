// src/routes/AppRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./ProtectedRoutes.jsx";

// ✅ Keep LoadingSpinner static so it's available immediately
import OrbitLoader from "../components/common/LoadingSpinner.jsx";
import PageTransition from "../components/common/PageTransition.jsx";
import FiestaVenue from "../pages/website/fiesta-venue.jsx";

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
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Landing = lazy(() => import("../pages/website/landing.jsx"));

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
const ContractsList = lazy(
  () => import("../pages/contracts/ContractListPage.jsx")
);
const ContractFormPage = lazy(
  () => import("../pages/contracts/ContractFormPage.jsx")
);
const ContractDetail = lazy(
  () => import("../pages/contracts/ContractDetailPage.jsx")
);
const ContractSettingsPage = lazy(
  () => import("../pages/contracts/ContractSettingsPage.jsx")
);

// Finance
const Finance = lazy(() => import("../pages/finance/Finance.jsx"));
const FinanceReports = lazy(() => import("../pages/finance/Reports.jsx"));
const Transactions = lazy(() => import("../pages/finance/Transactions.jsx"));
const Analytics = lazy(() => import("../pages/finance/Analytics.jsx"));
const Profitability = lazy(() => import("../pages/finance/Profitability.jsx"));
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
const DocumentsSettings = lazy(
  () => import("../pages/settings/DocumentsSettings.jsx")
);

// Supplies - ✅ FIXED: Correct path with capital S and plural
const SuppliesPage = lazy(() => import("../pages/Supplies/SuppliesPage.jsx"));
const SupplyDetail = lazy(() => import("../pages/Supplies/SupplyDetail.jsx"));
const SupplyForm = lazy(() => import("../pages/Supplies/SupplyForm.jsx"));

// ============================================
// ROUTING CONFIGURATION
// ============================================

const AppRoutes = () => {
  // Center the spinner for the initial load
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <OrbitLoader/>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ============================================ */}
        {/* PUBLIC ROUTES */}
        {/* ============================================ */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/landing"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route path="/fiesta-venue" element={<FiestaVenue />} />
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* ============================================ */}
        {/* AUTH LAYOUT ROUTES */}
        {/* ============================================ */}
        <Route element={<AuthLayout />}>
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />
        </Route>

        {/* ============================================ */}
        {/* PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard & Home */}
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/home"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* EVENTS */}
            {/* ============================================ */}
            <Route
              path="/events"
              element={
                <PageTransition>
                  <EventsList />
                </PageTransition>
              }
            />
            <Route
              path="/events/new"
              element={
                <PageTransition>
                  <CreateEventPage />
                </PageTransition>
              }
            />
            <Route
              path="/events/:id/edit"
              element={
                <PageTransition>
                  <EditEventPage />
                </PageTransition>
              }
            />
            <Route
              path="/events/:id/detail"
              element={
                <PageTransition>
                  <EventDetail />
                </PageTransition>
              }
            />
            <Route
              path="/events/:id"
              element={
                <PageTransition>
                  <EventDetail />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* CLIENTS */}
            {/* ============================================ */}
            <Route
              path="/clients"
              element={
                <PageTransition>
                  <ClientsList />
                </PageTransition>
              }
            />
            <Route
              path="/clients/new"
              element={
                <PageTransition>
                  <ClientForm />
                </PageTransition>
              }
            />
            <Route
              path="/clients/:id"
              element={
                <PageTransition>
                  <ClientDetail />
                </PageTransition>
              }
            />
            <Route
              path="/clients/:id/edit"
              element={
                <PageTransition>
                  <ClientForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* PARTNERS */}
            {/* ============================================ */}
            <Route
              path="/partners"
              element={
                <PageTransition>
                  <PartnersList />
                </PageTransition>
              }
            />
            <Route
              path="/partners/new"
              element={
                <PageTransition>
                  <PartnerForm />
                </PageTransition>
              }
            />
            <Route
              path="/partners/:id"
              element={
                <PageTransition>
                  <PartnerDetail />
                </PageTransition>
              }
            />
            <Route
              path="/partners/:id/edit"
              element={
                <PageTransition>
                  <PartnerForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* PAYMENTS */}
            {/* ============================================ */}
            <Route
              path="/payments"
              element={
                <PageTransition>
                  <PaymentsList />
                </PageTransition>
              }
            />
            <Route
              path="/payments/new"
              element={
                <PageTransition>
                  <PaymentForm />
                </PageTransition>
              }
            />
            <Route
              path="/payments/:id"
              element={
                <PageTransition>
                  <PaymentDetail />
                </PageTransition>
              }
            />
            <Route
              path="/payments/:id/edit"
              element={
                <PageTransition>
                  <PaymentForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* INVOICES */}
            {/* ============================================ */}
            <Route
              path="/invoices"
              element={
                <PageTransition>
                  <Invoices />
                </PageTransition>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <PageTransition>
                  <InvoiceFormPage />
                </PageTransition>
              }
            />
            <Route
              path="/invoices/:id/edit"
              element={
                <PageTransition>
                  <InvoiceFormPage />
                </PageTransition>
              }
            />
            <Route
              path="/invoices/settings"
              element={
                <PageTransition>
                  <InvoiceSettingPage />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* CONTRACTS */}
            {/* ============================================ */}
            <Route
              path="/contracts"
              element={
                <PageTransition>
                  <ContractsList />
                </PageTransition>
              }
            />
            <Route
              path="/contracts/settings"
              element={
                <PageTransition>
                  <ContractSettingsPage />
                </PageTransition>
              }
            />
            <Route
              path="/contracts/new"
              element={
                <PageTransition>
                  <ContractFormPage />
                </PageTransition>
              }
            />
            <Route
              path="/contracts/:id"
              element={
                <PageTransition>
                  <ContractDetail />
                </PageTransition>
              }
            />
            <Route
              path="/contracts/:id/edit"
              element={
                <PageTransition>
                  <ContractFormPage />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* FINANCE */}
            {/* ============================================ */}
            <Route
              path="/finance"
              element={
                <PageTransition>
                  <Finance />
                </PageTransition>
              }
            />
            <Route
              path="/finance/transactions"
              element={
                <PageTransition>
                  <Transactions />
                </PageTransition>
              }
            />
            <Route
              path="/finance/analytics"
              element={
                <PageTransition>
                  <Analytics />
                </PageTransition>
              }
            />
            <Route
              path="/finance/reports"
              element={
                <PageTransition>
                  <FinanceReports />
                </PageTransition>
              }
            />
            <Route
              path="/finance/profitability"
              element={
                <PageTransition>
                  <Profitability />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* TASKS */}
            {/* ============================================ */}
            <Route
              path="/tasks"
              element={
                <PageTransition>
                  <TasksList />
                </PageTransition>
              }
            />
            <Route
              path="/tasks/board"
              element={
                <PageTransition>
                  <TasksList />
                </PageTransition>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <PageTransition>
                  <TaskDetail />
                </PageTransition>
              }
            />
            <Route
              path="/tasks/:id/edit"
              element={
                <PageTransition>
                  <TaskForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* REMINDERS */}
            {/* ============================================ */}
            <Route
              path="/reminders"
              element={
                <PageTransition>
                  <RemindersList />
                </PageTransition>
              }
            />
            <Route
              path="/reminders/new"
              element={
                <PageTransition>
                  <ReminderForm />
                </PageTransition>
              }
            />
            <Route
              path="/reminders/:id"
              element={
                <PageTransition>
                  <ReminderDetail />
                </PageTransition>
              }
            />
            <Route
              path="/reminders/:id/edit"
              element={
                <PageTransition>
                  <ReminderForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* TEAM */}
            {/* ============================================ */}
            <Route
              path="/team"
              element={
                <PageTransition>
                  <TeamList />
                </PageTransition>
              }
            />
            <Route
              path="/team/invite"
              element={
                <PageTransition>
                  <InviteTeam />
                </PageTransition>
              }
            />
            <Route
              path="/team/:id"
              element={
                <PageTransition>
                  <TeamMemberDetail />
                </PageTransition>
              }
            />
            <Route
              path="/team/:id/edit"
              element={
                <PageTransition>
                  <TeamMemberEdit />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* ROLES */}
            {/* ============================================ */}
            <Route
              path="/roles"
              element={
                <PageTransition>
                  <RolesList />
                </PageTransition>
              }
            />
            <Route
              path="/roles/new"
              element={
                <PageTransition>
                  <RoleForm />
                </PageTransition>
              }
            />
            <Route
              path="/roles/:id/edit"
              element={
                <PageTransition>
                  <RoleForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* SUPPLIES - ✅ FIXED: Moved inside MainLayout with correct paths */}
            {/* ============================================ */}
            <Route
              path="/supplies"
              element={
                <PageTransition>
                  <SuppliesPage />
                </PageTransition>
              }
            />
            <Route
              path="/supplies/new"
              element={
                <PageTransition>
                  <SupplyForm />
                </PageTransition>
              }
            />
            <Route
              path="/supplies/:id"
              element={
                <PageTransition>
                  <SupplyDetail />
                </PageTransition>
              }
            />
            <Route
              path="/supplies/:id/edit"
              element={
                <PageTransition>
                  <SupplyForm />
                </PageTransition>
              }
            />

            {/* ============================================ */}
            {/* SETTINGS */}
            {/* ============================================ */}
            <Route
              path="/settings"
              element={
                <PageTransition>
                  <VenueSettings />
                </PageTransition>
              }
            />
            <Route
              path="/documents"
              element={
                <PageTransition>
                  <DocumentsSettings />
                </PageTransition>
              }
            />
          </Route>
        </Route>

        {/* ============================================ */}
        {/* CATCH-ALL */}
        {/* ============================================ */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;