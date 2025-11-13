// ReminderDetails.jsx
import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      active: "Active",
      completed: "Completed",
      snoozed: "Snoozed",
      cancelled: "Cancelled",
    };
    return labels[status] || status || "Unknown";
  }, []);

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
      showError("Cannot edit reminder: Reminder ID not found");
      return;
    }
    setIsEditModalOpen(true);
  }, [id, showError]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess("Reminder updated successfully");
  }, [refreshData, showSuccess]);

  const handleDeleteReminder = useCallback(async () => {
    if (!id) {
      showError("Cannot delete reminder: Reminder ID not found");
      return;
    }

    try {
      setDeleteLoading(true);
      await promise(
        reminderService.delete(id),
        {
          loading: "Deleting reminder...",
          success: "Reminder deleted successfully",
          error: "Failed to delete reminder"
        }
      );
      setIsDeleteModalOpen(false);
      navigate("/reminders");
    } catch (err) {
      console.error("Delete reminder error:", err);
      // Error is handled by the promise toast
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, showError]);

  const handleComplete = useCallback(async () => {
    if (!id) {
      showError("Cannot complete reminder: Reminder ID not found");
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        reminderService.complete ? 
          reminderService.complete(id) : 
          reminderService.update(id, { status: "completed" }),
        {
          loading: "Completing reminder...",
          success: "Reminder marked as completed",
          error: "Failed to complete reminder"
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Complete reminder error:", err);
      // Error is handled by the promise toast
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError]);

  const handleSnooze = useCallback(async () => {
    if (!id) {
      showError("Cannot snooze reminder: Reminder ID not found");
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        reminderService.snooze(id, { hours: 1 }),
        {
          loading: "Snoozing reminder...",
          success: "Reminder snoozed for 1 hour",
          error: "Failed to snooze reminder"
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Snooze reminder error:", err);
      // Error is handled by the promise toast
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError]);

  const handleCancel = useCallback(async () => {
    if (!id) {
      showError("Cannot cancel reminder: Reminder ID not found");
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        reminderService.cancel ? 
          reminderService.cancel(id) : 
          reminderService.update(id, { status: "cancelled" }),
        {
          loading: "Cancelling reminder...",
          success: "Reminder cancelled",
          error: "Failed to cancel reminder"
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Cancel reminder error:", err);
      // Error is handled by the promise toast
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo("Retrying to load reminder details...");
  }, [refreshData, showInfo]);

  // Loading state
  if (loading && !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading reminder details...
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
              {!reminderData ? "Reminder Not Found" : "Error Loading Reminder"}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message || "The reminder you're looking for doesn't exist."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/reminders")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                Back to Reminders
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
                    { id: "details", label: "Details" },
                    { id: "recurrence", label: "Recurrence" },
                    { id: "history", label: "History" },
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
  title="Edit Reminder"
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
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderData?.title}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Reminder"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ReminderDetails;