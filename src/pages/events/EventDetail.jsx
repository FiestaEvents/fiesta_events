// EventDetail.jsx
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";

// Components
import Modal, { ConfirmModal } from "../../components/common/Modal";
import EventForm from "./EventForm";
import EventHeader from "./components/EventHeader.jsx";
import EventInfo from "./components/EventInfo.jsx";
import EventPartnersTab from "./components/EventPartnersTab.jsx";
import EventPaymentsTab from "./components/EventPaymentsTab.jsx";
import EventActivityTab from "./components/EventActivityTab.jsx";

// Hooks and Services
import { eventService } from "../../api/index";
import { useEventDetail } from "../../hooks/useEventDetail";
import { useTranslation } from "react-i18next";

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // Use custom hook for event data
  const { eventData, payments, loading, error, refreshData } = useEventDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("partners");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const formatDateTime = useCallback((date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return date;
    }
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      pending: t("eventDetail.status.pending"),
      confirmed: t("eventDetail.status.confirmed"),
      "in-progress": t("eventDetail.status.in-progress"),
      completed: t("eventDetail.status.completed"),
      cancelled: t("eventDetail.status.cancelled"),
    };
    return labels[status] || status || t("eventDetail.status.unknown");
  }, [t]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100",
      confirmed:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100",
      "in-progress":
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-100",
      completed:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  // Event handlers
  const handleEditEvent = useCallback(() => {
    if (!id) {
      showError(t("eventDetail.errors.edit"));
      return;
    }
    setIsEditModalOpen(true);
  }, [id, showError, t]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t("eventDetail.actions.editSuccess"));
  }, [refreshData, showSuccess, t]);

  const handleDeleteEvent = useCallback(async () => {
    if (!id) {
      showError(t("eventDetail.errors.delete"));
      return;
    }

    try {
      setDeleteLoading(true);
      await promise(
        eventService.delete(id),
        {
          loading: t("eventDetail.actions.deleteLoading"),
          success: t("eventDetail.actions.deleteSuccess"),
          error: t("eventDetail.actions.deleteError")
        }
      );
      setIsDeleteModalOpen(false);
      navigate("/events");
    } catch (err) {
      console.error("Delete event error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, showError, t]);

  const handleNavigateToClient = useCallback(() => {
    if (eventData?.clientId?._id) {
      navigate(`/clients/${eventData.clientId._id}`);
    }
  }, [navigate, eventData]);

  const handleNavigateToPartner = useCallback((partnerId) => {
    if (partnerId) {
      navigate(`/partners/${partnerId}`);
    }
  }, [navigate]);

  const handleRecordPayment = useCallback(() => {
    if (!id) {
      showError(t("eventDetail.errors.payment"));
      return;
    }

    navigate(`/payments/new`, {
      state: {
        prefillEvent: {
          _id: id,
          clientId: eventData?.clientId?._id,
          clientName: eventData?.clientId?.name,
          eventTitle: eventData?.title,
        },
      },
    });
  }, [navigate, id, eventData, showError, t]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo(t("eventDetail.actions.retry"));
  }, [refreshData, showInfo, t]);

  // Loading state
  if (loading && !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("eventDetail.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {!eventData ? t("eventDetail.errors.notFound") : t("eventDetail.errors.loading")}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message || t("eventDetail.errors.notFoundDescription")}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/events")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                {t("eventDetail.actions.backToEvents")}
              </button>
              {error && (
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  {t("eventDetail.actions.tryAgain")}
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
          {/* Left Column - Event Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
                <EventHeader
                  event={eventData}
                  onBack={() => navigate("/events")}
                  onEdit={handleEditEvent}
                  onDelete={() => setIsDeleteModalOpen(true)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <EventInfo 
                  event={eventData} 
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  onNavigateToClient={handleNavigateToClient}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800">
                <nav className="flex -mb-px">
                  {["partners", "payments", "activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === tab
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-orange-300 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {t(`eventDetail.tabs.${tab}`)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "partners" && (
                  <EventPartnersTab
                    partners={eventData.partners || []}
                    loading={loading}
                    onRefresh={refreshData}
                    onNavigateToPartner={handleNavigateToPartner}
                  />
                )}

                {activeTab === "payments" && (
                  <EventPaymentsTab
                    payments={payments || []}
                    event={eventData}
                    onRecordPayment={handleRecordPayment}
                    formatDate={formatDate}
                  />
                )}

                {activeTab === "activity" && (
                  <EventActivityTab
                    event={eventData}
                    formatDateTime={formatDateTime}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EventForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          eventId={id}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEvent}
        title={t("eventDetail.deleteModal.title")}
        message={t("eventDetail.deleteModal.message", { eventTitle: eventData?.title })}
        confirmText={t("eventDetail.deleteModal.confirmText")}
        cancelText={t("eventDetail.deleteModal.cancelText")}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default EventDetail;