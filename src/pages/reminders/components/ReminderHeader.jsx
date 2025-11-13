import React from "react";
import { Bell, Edit, Trash2, CheckCircle, Clock, XCircle ,ArrowLeft} from "lucide-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ReminderHeader = ({
  reminder,
  onBack,
  onEdit,
  onDelete,
  onComplete,
  onSnooze,
  onCancel,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  actionLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center border border-gray-300 p-1 rounded-lg pr-2 gap-2 text-sm text-gray-600 hover:text-gray-900 transition dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reminders
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-white"
            title="Edit Reminder"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900"
            title="Delete Reminder"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reminder Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
          <Bell className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white">
          {reminder.title || "Untitled Reminder"}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reminder.status)}`}
          >
            {getStatusLabel(reminder.status)}
          </span>
          
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(reminder.priority)}`}
          >
            {reminder.priority} Priority
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {reminder.status === "active" && (
          <>
            <button
              onClick={onSnooze}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-200 hover:bg-orange-200 transition disabled:opacity-50 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-800"
            >
              <Clock className="w-4 h-4" />
              {actionLoading ? "Snoozing..." : "Snooze 1 Hour"}
            </button>
            <button
              onClick={onComplete}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200 hover:bg-green-200 transition disabled:opacity-50 dark:bg-green-900 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading ? "Completing..." : "Mark Complete"}
            </button>
          </>
        )}
        {reminder.status === "active" && (
          <button
            onClick={onCancel}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200 hover:bg-red-200 transition disabled:opacity-50 dark:bg-red-900 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800"
          >
            <XCircle className="w-4 h-4" />
            {actionLoading ? "Cancelling..." : "Cancel Reminder"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReminderHeader;