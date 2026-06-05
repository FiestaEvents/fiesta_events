import React, { useState } from "react";
import { Trash2, CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useToast } from "../../context/ToastContext";
import { reminderService } from "../../api/index";

const ReminderDetailModal = ({ isOpen, onClose, reminder, refreshData }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { promise } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!reminder) return null;

  // Dynamic Date Formatter based on language
  const formatDateTime = (date, time) => {
    if (!date) return "";
    
    const localeMap = {
      en: "en-GB",
      fr: "fr-FR",
      ar: "ar-TN",
    };

    const d = new Date(date).toLocaleDateString(localeMap[i18n.language] || "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return time ? t("reminders.dateTimeFormat", { date: d, time }) : d;
  };

  // Actions
  const handleAction = async (apiCall, messages) => {
    try {
      setIsProcessing(true);
      await promise(apiCall, messages);
      onClose();
      if (refreshData) refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () =>
    handleAction(reminderService.toggleComplete(reminder._id), {
      loading: t("reminders.notifications.updating"),
      success: t("reminders.notifications.markedCompleted"),
      error: t("reminders.notifications.updateError"),
    });

  const handleDelete = () =>
    handleAction(reminderService.delete(reminder._id), {
      loading: t("reminders.notifications.deleting", { name: reminder.title }),
      success: t("reminders.notifications.deleted"),
      error: t("reminders.notifications.deleteError"),
    });

  const handleReschedule = () => {
    onClose();
    navigate(`/reminders/${reminder._id}/edit`);
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/reminders/${reminder._id}`);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("reminders.modals.detail.title")}
        size="md"
      >
        <div className="p-6 space-y-6">
          {/* Big Date Display */}
          <div className="flex items-center gap-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-orange-500">
              <Calendar size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                {t("reminders.modals.detail.dueDate")}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {formatDateTime(reminder.reminderDate, reminder.reminderTime)}
              </p>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {reminder.title}
            </h3>
            {reminder.description ? (
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {reminder.description}
              </p>
            ) : (
              <p className="text-gray-400 italic">
                {t("reminders.modals.detail.noNotes")}
              </p>
            )}
          </div>

          {/* Action Buttons (Big & Clear) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              icon={CheckCircle}
              onClick={handleComplete}
              disabled={isProcessing}
              className="w-full justify-center text-base py-4 shadow-md hover:shadow-lg transition-all bg-green-600 hover:bg-green-700 border-transparent"
            >
              {t("reminders.actions.markDone")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={Calendar}
              onClick={handleReschedule}
              className="w-full justify-center text-base py-4 border-2"
            >
              {t("reminders.actions.reschedule")}
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Trash2 size={18} />
              {t("common.delete")}
            </button>

            <button
              onClick={handleViewFullDetails}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              {t("reminders.actions.viewFull")}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("reminders.modals.delete.title")}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce-short">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t("reminders.modals.delete.question")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t("reminders.modals.delete.warning")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="justify-center"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={isProcessing}
              onClick={handleDelete}
              className="justify-center"
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReminderDetailModal;