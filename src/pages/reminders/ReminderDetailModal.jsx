import React, { useState } from "react";
import { Trash2, Edit, Clock, BellOff, ArrowRight, Calendar, User, Tag, AlignLeft, Link2, Repeat, Bell, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addHours, addDays } from "date-fns";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge, { StatusBadge } from "../../components/common/Badge";
import { useToast } from "../../context/ToastContext";
import { reminderService } from "../../api/index";

const ReminderDetailModal = ({ isOpen, onClose, reminder, onEdit, refreshData }) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { promise } = useToast();

  if (!reminder) return null;

  const formatDateTime = (date, time) => {
    if (!date) return "";
    const d = new Date(date).toLocaleDateString("en-GB");
    return time ? `${d} • ${time}` : d;
  };

  const formatDateLong = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleAction = async (apiCall, messages) => {
    try {
      setIsProcessing(true);
      await promise(apiCall, messages);
      onClose();
      if (refreshData) refreshData();
    } catch (e) { console.error(e); } 
    finally { setIsProcessing(false); }
  };

  const handleSnooze = (d, u) => handleAction(
    reminderService.snooze(reminder._id, { snoozeUntil: (u === 'days' ? addDays(new Date(), d) : addHours(new Date(), d)).toISOString(), duration: d, unit: u }),
    { loading: t('reminders.notifications.snoozing'), success: t('reminders.notifications.snoozed'), error: t('reminders.notifications.snoozeError') }
  );

  const handleUnsnooze = () => handleAction(
    reminderService.update(reminder._id, { status: "active", snoozeUntil: null }),
    { loading: t('reminders.notifications.activating'), success: t('reminders.notifications.unsnoozed'), error: t('reminders.notifications.activateError') }
  );

  const handleDelete = () => handleAction(
    reminderService.delete(reminder._id),
    { loading: t('reminders.notifications.deleting'), success: t('reminders.notifications.deleted'), error: t('reminders.notifications.deleteError') }
  );

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/reminders/${reminder._id}`);
  };

  // --- UI Helpers ---
  const InfoRow = ({ icon: Icon, label, value, color="blue" }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400 flex-shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-0.5">{label}</p>
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={reminder.title} size="md">
        <div className="space-y-6">
          
          {/* Header Status */}
          <div className="flex gap-2 -mt-2">
            <StatusBadge status={reminder.status} dot />
            {reminder.priority && (
              <Badge variant={reminder.priority === 'high' ? 'warning' : 'secondary'} className="capitalize">
                {reminder.priority}
              </Badge>
            )}
          </div>
          
          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 shadow-sm">
            <InfoRow icon={Calendar} label={t('reminders.details.reminderInfo', "Reminder Info")} value={formatDateTime(reminder.reminderDate, reminder.reminderTime)} color="orange" />
            {reminder.isRecurring && <InfoRow icon={Repeat} label={t('reminders.recurrence.label', "Repeat")} value={`${reminder.recurrence.frequency} (${reminder.recurrence.interval})`} color="blue" />}
            {reminder.createdBy && <InfoRow icon={User} label={t('reminders.details.createdBy', "Created By")} value={reminder.createdBy.name} color="purple" />}
          </div>

          {/* Snooze Banner */}
          {reminder.status === 'snoozed' && reminder.snoozeUntil && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
              <Clock className="w-4 h-4" />
              <span>Snoozed until <strong>{formatDateLong(reminder.snoozeUntil)}</strong></span>
            </div>
          )}

          {/* Description */}
          {reminder.description && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800/30 leading-relaxed">
              {reminder.description}
            </div>
          )}

          {/* Quick Snooze Actions (only if active) */}
          {reminder.status === 'active' && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSnooze(1, 'hours')} className="text-xs">+1 Hour</Button>
              <Button variant="outline" size="sm" onClick={() => handleSnooze(1, 'days')} className="text-xs">+1 Day</Button>
              <Button variant="outline" size="sm" onClick={() => handleSnooze(1, 'weeks')} className="text-xs">+1 Week</Button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="danger" // ✅ Fixed: Uses Red Danger Button
                icon={Trash2} 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing}
                size="sm"
                className="w-full sm:w-auto"
              >
                {t("common.delete", "Delete")}
              </Button>
              
              {reminder.status === 'snoozed' && (
                <Button 
                  variant="outline" 
                  icon={BellOff} 
                  onClick={handleUnsnooze}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {t('reminders.actions.unsnooze', "Unsnooze")}
                </Button>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                icon={Edit} 
                onClick={() => onEdit(reminder)} 
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {t("common.edit", "Edit")}
              </Button>
              
              <Button 
                variant="primary" 
                icon={ArrowRight} 
                onClick={handleViewFullDetails} 
                size="sm"
                className="flex-1 sm:flex-none gap-2"
              >
                {t("common.viewDetails", "View Details")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t("common.confirmDelete", "Confirm Delete")} size="sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {t("reminders.notifications.deleteConfirm", "Are you sure you want to delete this reminder?")}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{t("common.cancel", "Cancel")}</Button>
            <Button variant="danger" loading={isProcessing} onClick={handleDelete}>{t("common.delete", "Delete")}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReminderDetailModal;