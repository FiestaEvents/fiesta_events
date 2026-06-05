import React from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Edit,
  Trash2,
  CheckCircle,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

// Generic Components
import Button from "../../../components/common/Button";
import Badge, { StatusBadge } from "../../../components/common/Badge";

const ReminderHeader = ({
  reminder,
  onBack,
  onEdit,
  onDelete,
  onComplete,
  actionLoading,
}) => {
  const { t } = useTranslation();

  // Helper to map priority to theme variants
  const getPriorityVariant = (priority) => {
    const map = {
      urgent: "danger",
      high: "warning",
      medium: "info",
      low: "secondary",
    };
    return map[priority?.toLowerCase()] || "secondary";
  };

  const isCompleted = reminder.status === "completed";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
      
      {/* Top Navigation & Actions */}
      <div className="flex justify-between items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={ArrowLeft}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">{t("common.back", "Back")}</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            title={t("common.edit", "Edit")}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title={t("common.delete", "Delete")}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Reminder Identity */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg mb-4">
          <Bell className="w-10 h-10" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white break-words leading-tight px-2">
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
              {t(`reminders.priority.${reminder.priority}`, reminder.priority)}
            </Badge>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700 my-6"></div>

      {/* Quick Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {t("reminders.form.fields.type", "Type")}
          </span>
          <Badge variant="secondary" size="sm" className="capitalize">
            {t(`reminders.type.${reminder.type}`, reminder.type)}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {t("reminders.form.fields.date", "Date")}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(reminder.reminderDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {t("reminders.form.fields.time", "Time")}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {reminder.reminderTime}
          </span>
        </div>
      </div>

      {/* Primary Action - Toggle Complete */}
      <Button
        onClick={onComplete}
        disabled={actionLoading}
        className={`w-full justify-center ${
          isCompleted
            ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
            : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        }`}
        icon={isCompleted ? RotateCcw : CheckCircle}
        size="lg"
      >
        {actionLoading
          ? t("reminders.updating", "Updating...")
          : isCompleted
          ? t("reminders.actions.reactivate", "Reactivate")
          : t("reminders.actions.markComplete", "Mark Complete")}
      </Button>

      {/* Metadata Footer */}
      {reminder.createdBy && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>{t("common.createdBy", "Created by")}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {reminder.createdBy?.name || t("common.unknown", "Unknown")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("common.createdAt", "Created")}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {new Date(reminder.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderHeader;