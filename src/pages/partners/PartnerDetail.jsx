import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

// Components
import Modal, { ConfirmModal } from "../../components/common/Modal";
import EventDetailModal from "../events/EventDetailModal";
import EventForm from "../events/EventForm";
import PartnerForm from "./PartnerForm";
import PartnerHeader from "./components/PartnerHeader";
import PartnerInfo from "./components/PartnerInfo";
import EventsTab from "./components/EventsTab";
import PerformanceTab from "./components/PerformanceTab";
import OverviewTab from "./components/OverviewTab";

// Hooks and Services
import { partnerService } from "../../api/index";
import { usePartnerDetail } from "../../hooks/usePartnerDetail";

const PartnerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  const { partnerData, events, eventsStats, loading, error, refreshData } =
    usePartnerDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // EventForm modal state
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
      active: t("partnerHeader.status.active"),
      inactive: t("partnerHeader.status.inactive"),
      pending: t("partnerHeader.status.pending"),
    };
    return labels[status] || status || t("common.unknown");
  }, [t]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      active: "bg-green-600 text-white border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      pending: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100";
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      catering: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      decoration: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:border-pink-700",
      photography: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:border-purple-700",
      music: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:border-indigo-700",
      security: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700",
      cleaning: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700",
      audio_visual: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      floral: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:border-pink-700",
      entertainment: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      vendor: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      supplier: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700",
      sponsor: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:border-purple-700",
      contractor: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700";
  }, []);

  const getEventStatusColor = useCallback((status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      "in-progress": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700",
      cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700";
  }, []);

  // Event handlers
  const handleViewEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, []);

  const handleEditEvent = useCallback((event) => {
    console.log("Edit event called with:", event);
    setIsEventModalOpen(false);
    
    const eventId = typeof event === 'object' ? event._id : event;
    setEditingEventId(eventId);
    setIsEventFormOpen(true);
  }, []);

  const handleNavigateToEvent = useCallback(
    (eventId, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      navigate(`/events/${eventId}/detail`, {
        state: { 
          fromPartner: id,
          partnerData: partnerData 
        },
      });
    },
    [navigate, id, partnerData]
  );

  const handleEditPartner = useCallback(() => {
    if (!id) {
      showError("Cannot edit partner: Partner ID not found");
      return;
    }
    setIsEditModalOpen(true);
  }, [id, showError]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t("partnerDetail.notifications.updated"));
  }, [refreshData, showSuccess, t]);

  const handleDeletePartner = useCallback(async () => {
    if (!id) {
      showError("Cannot delete partner: Partner ID not found");
      return;
    }

    try {
      setDeleteLoading(true);
      await promise(
        partnerService.delete(id),
        {
          loading: t("partnerDetail.modals.deletePartner.deleting"),
          success: t("partnerDetail.notifications.deleted"),
          error: t("partnerDetail.modals.deletePartner.errorDeleting")
        }
      );
      setIsDeleteModalOpen(false);
      navigate("/partners");
    } catch (err) {
      console.error("Delete partner error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, showError, t]);

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
        ? t("partnerDetail.notifications.eventUpdated")
        : t("partnerDetail.notifications.eventCreated")
    );
  }, [editingEventId, refreshData, showSuccess, t]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo(t("partnerDetail.error.retrying"));
  }, [refreshData, showInfo, t]);

  // Loading state
  if (loading && !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("partnerDetail.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {!partnerData ? t("partnerDetail.error.notFound") : t("partnerDetail.error.loading")}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message || t("partnerDetail.error.message")}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/partners")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                {t("partnerDetail.backToPartners")}
              </button>
              {error && (
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  {t("partnerDetail.error.retry")}
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
          {/* Left Column - Partner Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <PartnerHeader
                  partner={partnerData}
                  onBack={() => navigate("/partners")}
                  onEdit={handleEditPartner}
                  onDelete={() => setIsDeleteModalOpen(true)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getCategoryColor={getCategoryColor}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <PartnerInfo 
                  partner={partnerData} 
                  formatDate={formatDate}
                  getCategoryColor={getCategoryColor}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800">
                <nav className="flex -mb-px">
                  {[
                    { id: "overview", label: t("partnerDetail.tabs.overview") },
                    { id: "events", label: t("partnerDetail.tabs.events") },
                    { id: "performance", label: t("partnerDetail.tabs.performance") },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === tab.id
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-orange-300 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "events" && events?.length > 0 && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-orange-100 text-orange-600 dark:bg-orange-600 dark:text-orange-300">
                          {events.length}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <OverviewTab
                    partner={partnerData}
                    events={events}
                    eventsStats={eventsStats}
                    formatDate={formatDate}
                  />
                )}

                {activeTab === "events" && (
                  <EventsTab
                    events={events}
                    eventsStats={eventsStats}
                    loading={loading}
                    onRefresh={refreshData}
                    onViewEvent={handleViewEvent}
                    onNavigateToEvent={handleNavigateToEvent}
                    formatDate={formatDate}
                    getEventStatusColor={getEventStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                )}

                {activeTab === "performance" && (
                  <PerformanceTab
                    partner={partnerData}
                    events={events}
                    eventsStats={eventsStats}
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
        title={t("partnerDetail.modals.editPartner")}
        size="lg"
      >
        <PartnerForm
          partner={partnerData}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePartner}
        title={t("partnerDetail.modals.deletePartner.title")}
        message={t("partnerDetail.modals.deletePartner.message", { name: partnerData?.name })}
        confirmText={t("partnerDetail.modals.deletePartner.confirm")}
        cancelText={t("partnerDetail.modals.deletePartner.cancel")}
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

      {/* Event Form Modal */}
      {isEventFormOpen && (
        <EventForm
          isOpen={isEventFormOpen}
          onClose={handleEventFormClose}
          onSuccess={handleEventFormSuccess}
          eventId={editingEventId}
        />
      )}
    </div>
  );
};

export default PartnerDetail;