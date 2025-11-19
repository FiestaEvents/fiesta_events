// ClientDetail.jsx - UPDATED (only pass eventId)
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";

// Components
import Modal, { ConfirmModal } from "../../components/common/Modal";
import EventDetailModal from "../events/EventDetailModal";
import EventForm from "../events/EventForm";
import ClientForm from "./ClientForm";
import ActivityTab from "./components/ActivityTab";
import ClientHeader from "./components/ClientHeader";
import ClientInfo from "./components/ClientInfo";
import EventsTab from "./components/EventsTab";
import PaymentsTab from "./components/PaymentsTab";

// Hooks and Services
import { clientService } from "../../api/index";
import { useClientDetail } from "../../hooks/useClientDetail";

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError, showInfo, promise } = useToast();

  const { clientData, events, eventsStats, loading, error, refreshData } =
    useClientDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("activity");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // EventForm modal state - SIMPLIFIED: only store eventId
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

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
      active: "bg-green-600 text-white border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      pending: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      confirmed: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      completed: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      paid: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      partial: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      overdue: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100";
  }, []);

  // Event handlers
  const handleViewEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, []);

  // UPDATED: Only store eventId, not the full event object
  const handleEditEvent = useCallback((event) => {
    console.log("Edit event called with:", event);
    setIsEventModalOpen(false);
    
    // Extract just the ID
    const eventId = typeof event === 'object' ? event._id : event;
    setEditingEventId(eventId);
    setIsEventFormOpen(true);
  }, []);

  const handleNavigateToEvent = useCallback(
    (eventId, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      navigate(`/events/${eventId}/detail`, {
        state: {
          fromClient: id,
          clientData: clientData,
        },
      });
    },
    [navigate, id, clientData]
  );

  const handleEditClient = useCallback(() => {
    if (!id) {
      showError("Cannot edit client: Client ID not found");
      return;
    }
    setIsEditModalOpen(true);
  }, [id, showError]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess("Client updated successfully");
  }, [refreshData, showSuccess]);

  const handleDeleteClient = useCallback(async () => {
    if (!id) {
      showError("Cannot delete client: Client ID not found");
      return;
    }

    try {
      setDeleteLoading(true);
      await promise(clientService.delete(id), {
        loading: "Deleting client...",
        success: "Client deleted successfully",
        error: "Failed to delete client",
      });
      setIsDeleteModalOpen(false);
      navigate("/clients");
    } catch (err) {
      console.error("Delete client error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, showError]);

  const handleCreateEvent = useCallback(() => {
    if (!id) {
      showError("Cannot create event: Client ID not found");
      return;
    }

    setEditingEventId(null);
    setIsEventFormOpen(true);
  }, [id, showError]);

  // EventForm modal handlers
  const handleEventFormClose = useCallback(() => {
    setIsEventFormOpen(false);
    setEditingEventId(null);
  }, []);

  const handleEventFormSuccess = useCallback(async () => {
    setIsEventFormOpen(false);
    setEditingEventId(null);
    await refreshData();
    showSuccess(
      editingEventId
        ? "Event updated successfully!"
        : "Event created successfully!"
    );
  }, [editingEventId, refreshData, showSuccess]);

  const handleRecordPayment = useCallback(
    (eventId) => {
      if (!eventId) {
        showError("Please select an event first");
        return;
      }

      if (!id) {
        showError("Cannot record payment: Client ID not found");
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
    [navigate, id, clientData, showError]
  );

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo("Retrying to load client details...");
  }, [refreshData, showInfo]);

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
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                Back to Clients
              </button>
              {error && (
                <button
                  onClick={handleRetry}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Client Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-800">
                <ClientHeader
                  client={clientData}
                  onBack={() => navigate("/clients")}
                  onEdit={handleEditClient}
                  onDelete={() => setIsDeleteModalOpen(true)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:border-gray-800">
                <ClientInfo client={clientData} formatDate={formatDate} />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800">
                <nav className="flex -mb-px">
                  {["activity", "events", "payments"].map((tab) => (
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

      {/* UPDATED: Only pass eventId and prefillClient */}
      {isEventFormOpen && (
        <EventForm
          isOpen={isEventFormOpen}
          onClose={handleEventFormClose}
          onSuccess={handleEventFormSuccess}
          eventId={editingEventId}  // ✅ Only eventId
          prefillClient={!editingEventId ? {  // ✅ Only for new events
            _id: id,
            name: clientData?.name,
            email: clientData?.email,
            phone: clientData?.phone,
          } : null}
        />
      )}
    </div>
  );
};

export default ClientDetail;