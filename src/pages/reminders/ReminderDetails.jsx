import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal, { ConfirmModal } from "../../components/common/Modal";

// ✅ Sub-components
import ReminderInfo from "./components/ReminderInfo";
import ReminderForm from "./ReminderForm";

// ✅ Services & Hooks
import { reminderService } from "../../api/index";
import { useReminderDetail } from "../../hooks/useReminderDetail";
import { useToast } from "../../hooks/useToast";

const ReminderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, promise } = useToast();
  const { t, i18n } = useTranslation();

  const { reminderData, loading, error, refreshData } = useReminderDetail(id);

  // UI state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Helper: Locale-aware Date Format
  const formatDate = useCallback(
    (date) => {
      if (!date) return "-";

      const localeMap = {
        en: "en-GB",
        fr: "fr-FR",
        ar: "ar-TN",
      };

      const currentLocale = localeMap[i18n.language] || "en-GB";

      try {
        return new Date(date).toLocaleDateString(currentLocale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return date;
      }
    },
    [i18n.language]
  );

  // --- Handlers ---

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t("reminders.notifications.updateSuccess"));
  }, [refreshData, showSuccess, t]);

  const handleDeleteReminder = useCallback(async () => {
    try {
      setDeleteLoading(true);
      await promise(reminderService.delete(id), {
        loading: t("reminders.notifications.deleting", {
          name: reminderData?.title,
        }),
        success: t("reminders.notifications.deleted"),
        error: t("reminders.notifications.deleteError"),
      });
      setIsDeleteModalOpen(false);
      navigate("/reminders");
    } catch (err) {
      console.error("Delete reminder error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, t, reminderData]);

  const handleComplete = useCallback(async () => {
    try {
      setActionLoading(true);
      const isCompleting = reminderData.status !== "completed";

      await promise(reminderService.toggleComplete(id), {
        loading: t("reminders.notifications.updating"),
        success: isCompleting
          ? t("reminders.notifications.markedCompleted")
          : t("reminders.notifications.reactivated"),
        error: t("reminders.notifications.updateError"),
      });
      await refreshData();
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setActionLoading(false);
    }
  }, [id, reminderData, refreshData, promise, t]);

  // --- Render States ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <OrbitLoader />
      </div>
    );
  }

  if (error || !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("reminders.errors.notFound")}
          </h3>
          <Button
            variant="outline"
            onClick={() => navigate("/reminders")}
            className="mt-6"
          >
            {t("reminders.actions.backToList")}
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = reminderData.status === "completed";

  // --- Main Layout ---
  return (
    <div className="min-h-full bg-white dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/reminders")}
            className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2 rtl:rotate-180" />
            {t("reminders.actions.back")}
          </button>

          <div className="flex gap-3">
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {t("common.delete")}
            </Button>
            <Button
              variant="outline"
              icon={Edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              {t("common.edit")}
            </Button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Hero Section */}
          <div
            className={`p-8 border-b border-gray-100 dark:border-gray-700 ${
              isCompleted
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {reminderData.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg flex items-center gap-2">
                  {t("reminders.dateTimeFormat", {
                    date: formatDate(reminderData.reminderDate),
                    time: reminderData.reminderTime,
                  })}
                </p>
              </div>

              <Button
                variant={isCompleted ? "outline" : "primary"}
                size="lg"
                icon={isCompleted ? RotateCcw : CheckCircle}
                onClick={handleComplete}
                loading={actionLoading}
                className={
                  isCompleted
                    ? "bg-white dark:bg-gray-800 border-green-500 text-green-600 dark:text-green-400 dark:border-green-400"
                    : ""
                }
              >
                {isCompleted
                  ? t("reminders.status.completed")
                  : t("reminders.actions.markDone")}
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <ReminderInfo reminder={reminderData} formatDate={formatDate} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("reminders.form.editTitle")}
        size="lg"
      >
        <ReminderForm
          reminder={reminderData}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteReminder}
        title={t("reminders.modals.delete.title")}
        message={t("reminders.modals.delete.description", {
          name: reminderData.title,
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ReminderDetails;
