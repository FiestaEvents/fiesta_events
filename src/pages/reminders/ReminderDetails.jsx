import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";

// Components
import Modal, { ConfirmModal } from "../../components/common/Modal";
import ReminderHeader from "./components/ReminderHeader.jsx";
import ReminderInfo from "./components/ReminderInfo.jsx";
import DetailsTab from "./components/DetailsTab.jsx";
import RecurrenceTab from "./components/RecurrenceTab.jsx";
import HistoryTab from "./components/HistoryTab.jsx";
import ReminderForm from "./ReminderForm.jsx";
// Hooks and Services
import { reminderService } from "../../api/index";
import { useReminderDetail } from "../../hooks/useReminderDetail.js";

const ReminderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // Use custom hook for reminder data
  const { reminderData, loading, error, refreshData } = useReminderDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("details");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      active: t('reminders.status.active'),
      completed: t('reminders.status.completed'),
      snoozed: t('reminders.status.snoozed'),
      cancelled: t('reminders.status.cancelled'),
    };
    return labels[status] || status || t('reminders.unknown');
  }, [t]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      active:
        "bg-green-600 text-white border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      completed:
        "bg-blue-600 text-white border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100",
      snoozed:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      low:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
      medium:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100",
      high:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      urgent:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    };
    return (
      colors[priority] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  // Event handlers
  const handleEditReminder = useCallback(() => {
    if (!id) {
      showError(t('reminders.validation.invalidId'));
      return;
    }
    setIsEditModalOpen(true);
  }, [id, showError, t]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t('reminders.notifications.updated'));
  }, [refreshData, showSuccess, t]);

  const handleDeleteReminder = useCallback(async () => {
    if (!id) {
      showError(t('reminders.validation.invalidId'));
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
  }, [id, navigate, promise, showError, t]);

  const handleComplete = useCallback(async () => {
    if (!id) {
      showError(t('reminders.validation.invalidId'));
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        reminderService.complete ? 
          reminderService.complete(id) : 
          reminderService.update(id, { status: "completed" }),
        {
          loading: t('reminders.notifications.completing'),
          success: t('reminders.notifications.completed'),
          error: t('reminders.notifications.completeError')
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Complete reminder error:", err);
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError, t]);

  const handleSnooze = useCallback(async () => {
    if (!id) {
      showError(t('reminders.validation.invalidId'));
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        reminderService.snooze(id, { hours: 1 }),
        {
          loading: t('reminders.notifications.snoozing', { duration: 1, unit: 'hour' }),
          success: t('reminders.notifications.snoozed', { duration: 1, unit: 'hour' }),
          error: t('reminders.notifications.snoozeError')
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Snooze reminder error:", err);
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError, t]);

  const handleCancel = useCallback(async () => {
    if (!id) {
      showError(t('reminders.validation.invalidId'));
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        reminderService.cancel ? 
          reminderService.cancel(id) : 
          reminderService.update(id, { status: "cancelled" }),
        {
          loading: t('reminders.notifications.cancelling'),
          success: t('reminders.notifications.cancelled'),
          error: t('reminders.notifications.cancelError')
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Cancel reminder error:", err);
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError, t]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo(t('reminders.notifications.loadingDetails'));
  }, [refreshData, showInfo, t]);

  // Loading state
  if (loading && !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('reminders.loadingDetails')}
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {!reminderData ? t('reminders.notFound') : t('reminders.errorLoading')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message || t('reminders.notFoundDescription')}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/reminders")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                {t('reminders.backToReminders')}
              </button>
              {error && (
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  {t('reminders.tryAgain')}
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
          {/* Left Column - Reminder Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <ReminderHeader
                  reminder={reminderData}
                  onBack={() => navigate("/reminders")}
                  onEdit={handleEditReminder}
                  onDelete={() => setIsDeleteModalOpen(true)}
                  onComplete={handleComplete}
                  onSnooze={handleSnooze}
                  onCancel={handleCancel}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityColor={getPriorityColor}
                  actionLoading={actionLoading}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <ReminderInfo 
                  reminder={reminderData} 
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
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
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
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
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
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