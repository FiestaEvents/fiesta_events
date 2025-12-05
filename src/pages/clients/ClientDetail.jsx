import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {AlertTriangle, ArrowLeft, Calendar, CreditCard, Activity } from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";
// ✅ Generic Components & Config
import Button from "../../components/common/Button";
import Modal, { ConfirmModal } from "../../components/common/Modal";
import { statusToBadgeVariant } from "../../config/theme.config"; 

// Hooks and Services
import { useToast } from "../../hooks/useToast";
import { clientService } from "../../api/index";
import { useClientDetail } from "../../hooks/useClientDetail";

// Sub-components
import EventDetailModal from "../events/EventDetailModal";
import EventForm from "../events/EventForm/SharedEventForm";
import ClientForm from "./ClientForm";
import ClientHeader from "./components/ClientHeader";
import ClientInfo from "./components/ClientInfo";
import EventsTab from "./components/EventsTab";
import PaymentsTab from "./components/PaymentsTab";
import ActivityTab from "./components/ActivityTab";

const ClientDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showInfo, promise, apiError } = useToast();

  const { clientData, events, eventsStats, loading, error, refreshData } = useClientDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("activity");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Event Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // ✅ Helpers
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-GB"); 
    } catch {
      return date;
    }
  }, []);

  const getStatusLabel = useCallback((status) => {
    return t(`clientDetail.status.${status}`) || status || t("clients.table.defaultValues.unnamed");
  }, [t]);

  const getStatusVariant = useCallback((status) => {
    return statusToBadgeVariant[status] || 'secondary';
  }, []);

  // --- Handlers ---

  // ✅ Defined Missing Handler
  const handleEventFormClose = useCallback(() => {
    setIsEventFormOpen(false);
    setEditingEventId(null);
  }, []);

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

  const handleNavigateToEvent = useCallback((eventId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    navigate(`/events/${eventId}/detail`, { state: { fromClient: id, clientData } });
  }, [navigate, id, clientData]);
  
  const handleEditClient = useCallback(() => {
    if (!id) return apiError(null, t("clients.errors.invalidId"));
    setIsEditModalOpen(true);
  }, [id, apiError, t]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t("clients.toast.updateSuccess"));
  }, [refreshData, showSuccess, t]);

  const handleDeleteClient = useCallback(async () => {
    if (!id) return apiError(null, t("clients.errors.invalidId"));

    try {
      setDeleteLoading(true);
      await promise(clientService.delete(id), {
        loading: t("clients.toast.deleting", { name: clientData?.name }),
        success: t("clients.toast.deleteSuccess", { name: clientData?.name }),
        error: t("clients.toast.deleteError", { name: clientData?.name }),
      });
      setIsDeleteModalOpen(false);
      navigate("/clients");
    } catch (err) {
      // Toast handles UI
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, clientData, t, apiError]);

  const handleCreateEvent = useCallback(() => {
    if (!id) return apiError(null, t("clients.errors.invalidId"));
    setEditingEventId(null);
    setIsEventFormOpen(true);
  }, [id, apiError, t]);

  const handleEventFormSuccess = useCallback(async () => {
    setIsEventFormOpen(false);
    setEditingEventId(null);
    await refreshData();
    showSuccess(editingEventId ? t("events.toast.updateSuccess") : t("events.toast.createSuccess"));
  }, [editingEventId, refreshData, showSuccess, t]);

  const handleRecordPayment = useCallback((eventId) => {
    if (!eventId) return apiError(null, "Please select an event first");
    navigate(`/payments/new`, {
      state: { prefillEvent: { _id: eventId, clientId: id, clientName: clientData?.name } },
    });
  }, [navigate, id, clientData, apiError]);

  // --- Loading & Error States ---

  if (loading && !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <OrbitLoader />
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {!clientData ? t("clientDetail.notFound") : t("clientDetail.errorLoading")}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || t("clientDetail.notFoundDescription")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/clients")} icon={ArrowLeft}>
              {t("clientDetail.buttons.backToClients")}
            </Button>
            {error && (
              <Button variant="primary" onClick={() => { refreshData(); showInfo(t("clientDetail.loading")); }}>
                {t("clientDetail.buttons.tryAgain")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Tabs Config ---
  const tabs = [
    { id: "activity", label: t("clientDetail.labels.activityTimeline"), icon: Activity },
    { id: "events", label: t("clientDetail.labels.eventHistory"), icon: Calendar },
    { id: "payments", label: t("clientDetail.labels.totalRevenue"), icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- Left Column: Header & Info (4 Cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ClientHeader
                client={clientData}
                onBack={() => navigate("/clients")}
                onEdit={handleEditClient}
                onDelete={() => setIsDeleteModalOpen(true)}
                getStatusVariant={getStatusVariant}
                getStatusLabel={getStatusLabel}
              />
            </div>

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <ClientInfo client={clientData} formatDate={formatDate} />
            </div>
          </div>

          {/* --- Right Column: Tabs & Content (8 Cols) --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px] flex flex-col">
              
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex overflow-x-auto no-scrollbar" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 group flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                        ${activeTab === tab.id
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"}`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1">
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
                    getStatusVariant={getStatusVariant}
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
                    getStatusVariant={getStatusVariant}
                    getStatusLabel={getStatusLabel}
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
        title={t("clientDetail.modals.editClient")}
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
        title={t("clientDetail.modals.deleteClient")}
        message={t("clientDetail.modals.deleteMessage", { name: clientData?.name })}
        confirmText={t("clients.buttons.deleteClient")}
        cancelText={t("clients.buttons.cancel")}
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
          prefillClient={!editingEventId ? {
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