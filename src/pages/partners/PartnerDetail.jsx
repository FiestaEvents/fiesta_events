import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";
// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal, { ConfirmModal } from "../../components/common/Modal";

// Sub-components
import EventDetailModal from "../events/EventDetailModal";
import EventForm from "../events/EventForm/SharedEventForm";
import PartnerForm from "./PartnerForm";
import PartnerHeader from "./components/PartnerHeader";
import PartnerInfo from "./components/PartnerInfo";
import EventsTab from "./components/EventsTab";
import PerformanceTab from "./components/PerformanceTab";
import OverviewTab from "./components/OverviewTab";

// Services & Hooks
import { partnerService } from "../../api/index";
import { usePartnerDetail } from "../../hooks/usePartnerDetail";
import { useToast } from "../../hooks/useToast";

const PartnerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  
  // ✅ Use extended toast methods
  const { showSuccess, apiError, showInfo, promise } = useToast();

  const { partnerData, events, eventsStats, loading, error, refreshData } = usePartnerDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Event Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return date;
    }
  }, []);

  // --- Event Handlers ---

  const handleViewEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, []);

  const handleEditEvent = useCallback((event) => {
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
      apiError(null, "Cannot edit partner: Partner ID not found");
      return;
    }
    setIsEditModalOpen(true);
  }, [id, apiError]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t("partnerDetail.notifications.updated"));
  }, [refreshData, showSuccess, t]);

  const handleDeletePartner = useCallback(async () => {
    if (!id) {
      apiError(null, "Cannot delete partner: Partner ID not found");
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
      // Toast handles the error display
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, t, apiError]);

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

  // --- Render States ---

  if (loading && !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <OrbitLoader className="w-12 h-12 text-orange-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("partnerDetail.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {!partnerData ? t("partnerDetail.error.notFound") : t("partnerDetail.error.loading")}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || t("partnerDetail.error.message")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/partners")}
            >
              {t("partnerDetail.backToPartners")}
            </Button>
            {error && (
              <Button
                variant="primary"
                onClick={handleRetry}
              >
                {t("partnerDetail.error.retry")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - Partner Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
                <PartnerHeader
                  partner={partnerData}
                  onBack={() => navigate("/partners")}
                  onEdit={handleEditPartner}
                  onDelete={() => setIsDeleteModalOpen(true)}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <PartnerInfo 
                  partner={partnerData} 
                  formatDate={formatDate}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800/30">
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

      {/* --- Modals --- */}

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