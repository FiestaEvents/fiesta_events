import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  AlertTriangle, 
  ArrowLeft,
  Users,
  CreditCard,
  Activity,
  Package,
} from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";
// ✅ API & Services
import { eventService } from "../../api/index";
import { useEventDetail } from "../../hooks/useEventDetail";
import { useToast } from "../../hooks/useToast";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal, { ConfirmModal } from "../../components/common/Modal";

// ✅ Sub-components
import EventForm from "./EventForm/SharedEventForm";
import EventHeader from "./components/EventHeader";
import EventInfo from "./components/EventInfo";
import EventPartnersTab from "./components/EventPartnersTab";
import EventPaymentsTab from "./components/EventPaymentsTab";
import EventActivityTab from "./components/EventActivityTab";
import EventSuppliesTab from "./components/EventSuppliesTab"; 
const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  
  // ✅ Use extended toast methods
  const { showSuccess, apiError, showInfo, promise } = useToast();

  // Use custom hook for event data
  const { eventData, payments, loading, error, refreshData } = useEventDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("partners");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ✅ Helper: Strict DD/MM/YYYY
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return date;
    }
  }, []);

  // ✅ Helper: Strict DD/MM/YYYY HH:MM
  const formatDateTime = useCallback((date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    } catch {
      return date;
    }
  }, []);

  // Event handlers
const handleEditEvent = useCallback(() => {
  navigate(`/events/${id}/edit`);
}, [navigate, id]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t("eventDetail.actions.editSuccess"));
  }, [refreshData, showSuccess, t]);

  const handleDeleteEvent = useCallback(async () => {
    if (!id) {
      apiError(null, t("eventDetail.errors.delete"));
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
      // Promise toast handles UI feedback
      console.error("Delete event error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, t, apiError]);

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
      apiError(null, t("eventDetail.errors.payment"));
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
  }, [navigate, id, eventData, apiError, t]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo(t("eventDetail.actions.retry"));
  }, [refreshData, showInfo, t]);

  // Loading state
  if (loading && !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <OrbitLoader className="w-12 h-12 text-orange-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {!eventData ? t("eventDetail.errors.notFound") : t("eventDetail.errors.loading")}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || t("eventDetail.errors.notFoundDescription")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/events")}
            >
              {t("eventDetail.actions.backToEvents")}
            </Button>
            {error && (
              <Button
                variant="primary"
                onClick={handleRetry}
              >
                {t("eventDetail.actions.tryAgain")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tab Configuration
  const tabs = [
    { id: "partners", label: t("eventDetail.tabs.partners"), icon: Users },
    { id: "payments", label: t("eventDetail.tabs.payments"), icon: CreditCard },
    { id: "supplies", label: t("eventDetail.tabs.supplies"), icon: Package },
    { id: "activity", label: t("eventDetail.tabs.activity"), icon: Activity },
  ];

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
              <div className="border-b border-gray-200 dark:border-orange-800/30">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-orange-300 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
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
              {activeTab === "supplies" && (
                  <EventSuppliesTab event={eventData} />
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