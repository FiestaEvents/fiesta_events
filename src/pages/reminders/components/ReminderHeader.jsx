import React from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import Badge, { StatusBadge } from "../../../components/common/Badge";

const ReminderHeader = ({
  reminder,
  onBack,
  onEdit,
  onDelete,
  onComplete,
  onSnooze,
  onCancel,
  actionLoading,
}) => {
  const { t } = useTranslation();

  // Helper to map priority to theme variants
  const getPriorityVariant = (priority) => {
    const map = {
      urgent: "danger",
      high: "warning", // Orange/Red
      medium: "info", // Blue
      low: "secondary", // Gray
    };
    return map[priority?.toLowerCase()] || "secondary";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
      {/* Top Navigation & Actions */}
      <div className="flex justify-between items-center gap-2 mb-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("reminders.backToReminders", "Back")}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            title={t("reminders.actions.edit", "Edit")}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title={t("reminders.actions.delete", "Delete")}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Reminder Identity */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-md">
          <Bell className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white break-words leading-tight">
          {reminder.title || t("reminders.untitled", "Untitled Reminder")}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <StatusBadge status={reminder.status} size="md" dot={true} />

          {reminder.priority && (
            <Badge
              variant={getPriorityVariant(reminder.priority)}
              size="md"
              className="capitalize"
            >
              {reminder.priority}
            </Badge>
          )}
        </div>
      </div>

      {/* Primary Actions (Snooze/Complete/Cancel) */}
      {reminder.status === "active" && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
          <Button
            onClick={onComplete}
            disabled={actionLoading}
            className="w-full justify-center bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            icon={CheckCircle}
          >
            {actionLoading
              ? t("reminders.completing", "Completing...")
              : t("reminders.markComplete", "Mark Complete")}
          </Button>

          <Button
            onClick={onSnooze}
            disabled={actionLoading}
            variant="outline"
            className="w-full justify-center text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
            icon={Clock}
          >
            {actionLoading
              ? t("reminders.snoozing", "Snoozing...")
              : t("reminders.snooze1Hour", "Snooze 1 Hour")}
          </Button>

          <Button
            onClick={onCancel}
            disabled={actionLoading}
            variant="outline"
            className="w-full justify-center text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            icon={XCircle}
          >
            {actionLoading
              ? t("reminders.cancelling", "Cancelling...")
              : t("reminders.cancelReminder", "Cancel Reminder")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReminderHeader;
