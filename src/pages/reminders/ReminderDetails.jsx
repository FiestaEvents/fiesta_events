import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";
// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal, { ConfirmModal } from "../../components/common/Modal";

// ✅ Sub-components
import ReminderHeader from "./components/ReminderHeader";
import ReminderInfo from "./components/ReminderInfo";
import DetailsTab from "./components/DetailsTab";
import RecurrenceTab from "./components/RecurrenceTab";
import HistoryTab from "./components/HistoryTab";
import ReminderForm from "./ReminderForm";

// ✅ Services & Hooks
import { reminderService } from "../../api/index";
import { useReminderDetail } from "../../hooks/useReminderDetail";
import { useToast } from "../../hooks/useToast";

const ReminderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, apiError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  const { reminderData, loading, error, refreshData } = useReminderDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("details");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return date;
    }
  }, []);

  // --- Handlers ---

  const handleEditReminder = useCallback(() => {
    if (!id) {
      apiError(null, t('reminders.validation.invalidId'));
      return;
    }
    setIsEditModalOpen(true);
  }, [id, apiError, t]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t('reminders.notifications.updated'));
  }, [refreshData, showSuccess, t]);

  const handleDeleteReminder = useCallback(async () => {
    if (!id) {
      apiError(null, t('reminders.validation.invalidId'));
      return;
    }

    try {
      setDeleteLoading(true);
      await promise(
        reminderService.delete(id),
        {
          loading: t('reminders.notifications.deleting'),
          success: t('reminders.notifications.deleted'),
          error: t('reminders.notifications.deleteError')
        }
      );
      setIsDeleteModalOpen(false);
      navigate("/reminders");
    } catch (err) {
      console.error("Delete reminder error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, t, apiError]);

  // Action Handlers (Complete, Snooze, Cancel)
  const handleAction = useCallback(async (actionType) => {
    if (!id) return apiError(null, t('reminders.validation.invalidId'));

    try {
      setActionLoading(true);
      let actionPromise;
      let messages = {};

      switch (actionType) {
        case 'complete':
          actionPromise = reminderService.complete ? reminderService.complete(id) : reminderService.update(id, { status: "completed" });
          messages = { loading: t('reminders.notifications.completing'), success: t('reminders.notifications.completed'), error: t('reminders.notifications.completeError') };
          break;
        case 'snooze':
          actionPromise = reminderService.snooze(id, { hours: 1 });
          messages = { loading: t('reminders.notifications.snoozing', { duration: 1, unit: 'hour' }), success: t('reminders.notifications.snoozed'), error: t('reminders.notifications.snoozeError') };
          break;
        case 'cancel':
          actionPromise = reminderService.cancel ? reminderService.cancel(id) : reminderService.update(id, { status: "cancelled" });
          messages = { loading: t('reminders.notifications.cancelling'), success: t('reminders.notifications.cancelled'), error: t('reminders.notifications.cancelError') };
          break;
        default:
          return;
      }

      await promise(actionPromise, messages);
      await refreshData();
    } catch (err) {
      console.error(`${actionType} error:`, err);
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, t, apiError]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo(t('reminders.notifications.loadingDetails'));
  }, [refreshData, showInfo, t]);

  // --- Render States ---

  if (loading && !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <OrbitLoader className="w-12 h-12 text-orange-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">{t('reminders.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (error || !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {!reminderData ? t('reminders.notFound') : t('reminders.errorLoading')}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || t('reminders.notFoundDescription')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/reminders")}>
              {t('reminders.backToReminders')}
            </Button>
            {error && (
              <Button variant="primary" onClick={handleRetry}>
                {t('reminders.tryAgain')}
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
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <ReminderHeader
                reminder={reminderData}
                onBack={() => navigate("/reminders")}
                onEdit={handleEditReminder}
                onDelete={() => setIsDeleteModalOpen(true)}
                onComplete={() => handleAction('complete')}
                onSnooze={() => handleAction('snooze')}
                onCancel={() => handleAction('cancel')}
                actionLoading={actionLoading}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
              <ReminderInfo 
                reminder={reminderData} 
                formatDate={formatDate}
              />
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800/30">
                <nav className="flex -mb-px">
                  {[
                    { id: "details", label: t('reminders.details.tab') },
                    { id: "recurrence", label: t('reminders.details.recurrenceSettings') },
                    { id: "history", label: t('reminders.details.activityHistory') },
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
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <DetailsTab
                    reminder={reminderData}
                    formatDate={formatDate}
                  />
                )}
                {activeTab === "recurrence" && (
                  <RecurrenceTab
                    reminder={reminderData}
                    formatDate={formatDate}
                  />
                )}
                {activeTab === "history" && (
                  <HistoryTab
                    reminder={reminderData}
                    formatDate={formatDate}
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
        title={t('reminders.form.editTitle')}
        size="lg"
      >
        <ReminderForm
          reminder={reminderData}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteReminder}
        title={t('reminders.modals.delete.title')}
        message={t('reminders.modals.delete.description', { name: reminderData?.title })}
        confirmText={t('reminders.modals.delete.confirm')}
        cancelText={t('reminders.modals.delete.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ReminderDetails;