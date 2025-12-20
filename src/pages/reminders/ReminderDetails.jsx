import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Info, Layers, History } from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";

// Components
import Modal, { ConfirmModal } from "../../components/common/Modal";
import ReminderHeader from "./components/ReminderHeader";
import ReminderInfo from "./components/ReminderInfo";
import DetailsTab from "./components/DetailsTab";
import HistoryTab from "./components/HistoryTab";
import ReminderForm from "./ReminderForm";

// Services & Hooks
import { reminderService } from "../../api/index";
import { useReminderDetail } from "../../hooks/useReminderDetail";
import { useToast } from "../../hooks/useToast";

const ReminderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, promise } = useToast();
  const { t, i18n } = useTranslation();

  const { reminderData, loading, error, refreshData } = useReminderDetail(id);

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Format Date Helper
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

  // ==========================================
  // HANDLERS
  // ==========================================

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

  // ==========================================
  // TABS CONFIGURATION
  // ==========================================
  const tabs = [
    {
      id: "overview",
      label: t("reminders.tabs.overview", "Overview"),
      icon: Info,
    },
    {
      id: "details",
      label: t("reminders.tabs.details", "Details"),
      icon: Layers,
    },
    {
      id: "history",
      label: t("reminders.tabs.history", "History"),
      icon: History,
    },
  ];

  // ==========================================
  // RENDER STATES
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  }

  if (error || !reminderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("reminders.errors.notFound")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t("reminders.errors.notFoundDescription", "The reminder you're looking for doesn't exist or has been deleted.")}
          </p>
          <button
            onClick={() => navigate("/reminders")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t("reminders.actions.backToList")}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN LAYOUT
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Reminder Header */}
          <div className="lg:col-span-4">
            <ReminderHeader
              reminder={reminderData}
              onBack={() => navigate("/reminders")}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
              onComplete={handleComplete}
              actionLoading={actionLoading}
            />
          </div>

          {/* RIGHT CONTENT - Tabs & Details */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8">
                {activeTab === "overview" && (
                  <ReminderInfo reminder={reminderData} formatDate={formatDate} />
                )}
                {activeTab === "details" && (
                  <DetailsTab reminder={reminderData} />
                )}
                {activeTab === "history" && (
                  <HistoryTab reminder={reminderData} formatDate={formatDate} />
                )}
              </div>
            </div>
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