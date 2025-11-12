// ClientDetail.jsx
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import ClientHeader from "./components/ClientHeader";
import ClientInfo from "./components/ClientInfo";
import EventsTab from "./components/EventsTab";
import PaymentsTab from "./components/PaymentsTab";
import ActivityTab from "./components/ActivityTab";
import Modal, { ConfirmModal } from "../../components/common/Modal";
import ClientForm from "./ClientForm";
import EventDetailModal from "../events/EventDetailModal";
import Badge from "../../components/common/Badge";
// Hooks and Services
import { useClientDetail } from "../../hooks/useClientDetail";
import { clientService } from "../../api/index";
import { formatCurrency } from "../../utils/formatCurrency";

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Use custom hook for client data
  const { clientData, events, eventsStats, loading, error, refreshData } =
    useClientDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("events");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Utility functions
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return date;
    }
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      paid: "Paid",
      partial: "Partial",
      overdue: "Overdue",
    };
    return labels[status] || status || "Unknown";
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      active:
        "bg-green-600 text-white border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      inactive:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      pending:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      confirmed:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      completed:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      paid: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      partial:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      overdue:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  // Event handlers
  const handleViewEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, []);

  const handleEditEvent = useCallback(
    (eventId) => {
      setIsEventModalOpen(false);
      navigate(`/events/${eventId}/edit`, {
        state: {
          returnUrl: `/clients/${id}`,
        },
      });
    },
    [navigate, id]
  );

  const handleNavigateToEvent = useCallback(
    (eventId, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      navigate(`/events/${eventId}`, {
        state: { fromClient: id },
      });
    },
    [navigate, id]
  );

  const handleEditClient = useCallback(() => {
    if (!id) {
      toast.error("Cannot edit client: Client ID not found");
      return;
    }
    setIsEditModalOpen(true);
  }, [id]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    toast.success("Client updated successfully");
  }, [refreshData]);

  const handleDeleteClient = useCallback(async () => {
    if (!id) {
      toast.error("Cannot delete client: Client ID not found");
      return;
    }

    try {
      setDeleteLoading(true);
      await clientService.delete(id);
      toast.success("Client deleted successfully");
      setIsDeleteModalOpen(false);
      navigate("/clients");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete client";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate]);

  const handleCreateEvent = useCallback(() => {
    if (!id) {
      toast.error("Cannot create event: Client ID not found");
      return;
    }

    navigate("/events/new", {
      state: {
        prefillClient: {
          _id: id,
          name: clientData?.name,
          email: clientData?.email,
          phone: clientData?.phone,
        },
        returnUrl: `/clients/${id}`,
      },
    });
  }, [navigate, id, clientData]);

  const handleRecordPayment = useCallback(
    (eventId) => {
      if (!eventId) {
        toast.error("Please select an event first");
        return;
      }

      if (!id) {
        toast.error("Cannot record payment: Client ID not found");
        return;
      }

      navigate(`/payments/new`, {
        state: {
          prefillEvent: {
            _id: eventId,
            clientId: id,
            clientName: clientData?.name,
          },
        },
      });
    },
    [navigate, id, clientData]
  );

  // Loading state
  if (loading && !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading client details...
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {!clientData ? "Client Not Found" : "Error Loading Client"}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message || "The client you're looking for doesn't exist."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/clients")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition "
              >
                Back to Clients
              </button>
              {error && (
                <button
                  onClick={refreshData}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Details - Fixed Position */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <ClientHeader
                client={clientData}
                onBack={() => navigate("/clients")}
                onEdit={handleEditClient}
                onDelete={() => setIsDeleteModalOpen(true)}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <ClientInfo client={clientData} formatDate={formatDate} />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800">
                <nav className="flex -mb-px">
                  {["events", "payments", "activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === tab
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-orange-300 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "events" && (
                  <EventsTab
                    events={events}
                    eventsStats={eventsStats}
                    loading={loading}
                    onRefresh={refreshData}
                    onCreateEvent={handleCreateEvent}
                    onViewEvent={handleViewEvent}
                    onNavigateToEvent={handleNavigateToEvent}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                )}

                {activeTab === "payments" && (
                  <PaymentsTab
                    events={events}
                    eventsStats={eventsStats}
                    onRecordPayment={handleRecordPayment}
                  />
                )}

                {activeTab === "activity" && (
                  <ActivityTab
                    events={events}
                    eventsStats={eventsStats}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        size="lg"
      >
        <ClientForm
          client={clientData}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        message={`Are you sure you want to delete "${clientData?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Client"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      <EventDetailModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        refreshData={refreshData}
      />
    </div>
  );
};

export default ClientDetail;
