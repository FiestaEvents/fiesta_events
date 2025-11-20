import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit,
  Clock,
  BellOff,
  ArrowRight,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { reminderService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { format, addHours, addDays } from "date-fns";

const ReminderDetailModal = ({ isOpen, onClose, reminder, onEdit, refreshData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, promise } = useToast();
  const { t } = useTranslation();

  if (!isOpen || !reminder) return null;

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "active":
        return "blue";
      case "snoozed":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "event":
        return "blue";
      case "payment":
        return "yellow";
      case "task":
        return "purple";
      case "maintenance":
        return "orange";
      case "followup":
        return "green";
      default:
        return "gray";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "gray";
      default:
        return "gray";
    }
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const weekday = d.toLocaleString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const datePart = formatDateLong(dateString);
    if (timeString) {
      return `${datePart} at ${timeString}`;
    }
    return datePart;
  };

  // Handle snooze action
  const handleSnooze = async (duration, unit = 'hours') => {
    if (!reminder._id) return;

    try {
      setIsProcessing(true);

      const now = new Date();
      let snoozeUntil;
      
      switch (unit) {
        case 'hours':
          snoozeUntil = addHours(now, duration);
          break;
        case 'days':
          snoozeUntil = addDays(now, duration);
          break;
        default:
          snoozeUntil = addHours(now, duration);
      }

      const snoozeData = {
        snoozeUntil: snoozeUntil.toISOString(),
        duration: duration,
        unit: unit
      };

      await promise(
        reminderService.snooze(reminder._id, snoozeData),
        {
          loading: t('reminders.notifications.snoozing', { duration, unit }),
          success: t('reminders.notifications.snoozed', { duration, unit }),
          error: t('reminders.notifications.snoozeError')
        }
      );
      
      onClose();
      refreshData();
    } catch (err) {
      console.error("Error snoozing reminder:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle unsnooze
  const handleUnsnooze = async () => {
    if (!reminder._id) return;

    try {
      setIsProcessing(true);
      
      await promise(
        reminderService.update(reminder._id, { 
          status: "active",
          snoozeUntil: null
        }),
        {
          loading: t('reminders.notifications.activating'),
          success: t('reminders.notifications.unsnoozed'),
          error: t('reminders.notifications.activateError')
        }
      );
      
      onClose();
      refreshData();
    } catch (err) {
      console.error("Error unsnoozing reminder:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!reminder._id) return;
    
    try {
      setIsProcessing(true);
      await promise(
        reminderService.delete(reminder._id),
        {
          loading: t('reminders.notifications.deleting'),
          success: t('reminders.notifications.deleted'),
          error: t('reminders.notifications.deleteError')
        }
      );
      onClose();
      refreshData();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/reminders/${reminder._id}`);
  };

  const isSnoozed = reminder.status === "snoozed";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="border-0">
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                    id="modal-title"
                  >
                    {reminder.title || t('reminders.untitled')}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge color={getStatusBadgeColor(reminder.status)}>
                      {reminder.status ? reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1) : t('reminders.status.active')}
                    </Badge>
                    <Badge color={getTypeBadgeColor(reminder.type)}>
                      {reminder.type ? reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1) : t('reminders.type.other')}
                    </Badge>
                    <Badge color={getPriorityBadgeColor(reminder.priority)}>
                      {reminder.priority ? reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1) : t('reminders.priority.medium')}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors ml-4 flex-shrink-0"
                  title={t('reminders.close')}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                {/* Description */}
                {reminder.description && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      {t('reminders.details.description')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {reminder.description}
                    </p>
                  </div>
                )}

                {/* Reminder Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t('reminders.details.reminderDetails')}
                  </h4>
                  <div className="space-y-3">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('reminders.details.dateTime')}</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(reminder.reminderDate, reminder.reminderTime)}
                        </div>
                      </div>
                    </div>

                    {/* Snooze Information */}
                    {isSnoozed && reminder.snoozeUntil && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">{t('reminders.details.snoozedUntil')}</div>
                          <div className="font-medium text-yellow-600 dark:text-yellow-400">
                            {formatDateLong(reminder.snoozeUntil)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Created By */}
                    {reminder.createdBy && (
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">{t('reminders.details.createdBy')}</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {reminder.createdBy.name || t('reminders.unknown')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Entities */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t('reminders.details.relatedTo')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reminder.relatedEvent && (
                      <Badge color="purple" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('reminders.type.event')}
                      </Badge>
                    )}
                    {reminder.relatedTask && (
                      <Badge color="blue" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {t('reminders.type.task')}
                      </Badge>
                    )}
                    {reminder.relatedPayment && (
                      <Badge color="green" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {t('reminders.type.payment')}
                      </Badge>
                    )}
                    {!reminder.relatedEvent && !reminder.relatedTask && !reminder.relatedPayment && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('reminders.noRelatedEntities')}</span>
                    )}
                  </div>
                </div>

                {/* Recurrence */}
                {reminder.recurrence && reminder.recurrence.enabled && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      {t('reminders.details.recurrence')}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reminder.recurrence.frequency} {t('reminders.every')} {reminder.recurrence.interval}{" "}
                      {reminder.recurrence.frequency === "daily" ? t('reminders.days') : 
                       reminder.recurrence.frequency === "weekly" ? t('reminders.weeks') : 
                       reminder.recurrence.frequency === "monthly" ? t('reminders.months') : t('reminders.years')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between gap-3 rounded-b-xl">
              <div className="flex gap-2">
                {/* Snooze/Unsnooze Button */}
                {!isSnoozed ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      icon={Clock}
                      onClick={() => handleSnooze(1, 'hours')}
                      disabled={isProcessing}
                      size="sm"
                    >
                      1H
                    </Button>
                    <Button
                      variant="outline"
                      icon={Clock}
                      onClick={() => handleSnooze(4, 'hours')}
                      disabled={isProcessing}
                      size="sm"
                    >
                      4H
                    </Button>
                    <Button
                      variant="outline"
                      icon={Clock}
                      onClick={() => handleSnooze(1, 'days')}
                      disabled={isProcessing}
                      size="sm"
                    >
                      1D
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    icon={BellOff}
                    onClick={handleUnsnooze}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {t('reminders.actions.unsnooze')}
                  </Button>
                )}

                {/* Delete Button */}
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={handleDelete}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? t('reminders.deleting') : t('reminders.actions.delete')}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(reminder)}
                  size="sm"
                >
                  {t('reminders.actions.edit')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewFullDetails}
                  className="gap-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                  title={t('reminders.actions.viewDetails')}
                >
                  {t('reminders.actions.moreDetails')}
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderDetailModal;