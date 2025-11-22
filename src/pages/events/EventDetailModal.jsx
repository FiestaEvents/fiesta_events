import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast"; // ✅ Custom Toast
import { eventService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";

const EventDetailModal = ({ isOpen, onClose, event, onEdit, refreshData }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast(); // ✅ Use toast hook

  if (!isOpen || !event) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      confirmed: "blue",
      "in-progress": "purple",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  // ✅ FIX: Tunisian Date Format (DD/MM/YYYY)
  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-TN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(d);
  };

  // ✅ FIX: Time Format (24h standard or 12h based on locale preference)
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-TN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24h format is standard in TN
    }).format(d);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        t("eventDetailModal.actions.delete.confirm", { eventTitle: event.title })
      )
    ) {
      setIsDeleting(true);
      try {
        await eventService.delete(event._id); // ✅ Correct service call
        showSuccess(t("eventDetailModal.actions.delete.success"));
        onClose();
        refreshData(); 
      } catch (error) {
        console.error("Failed to delete event:", error);
        showError(t("eventDetailModal.actions.delete.error"));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle viewing full event details
  const handleViewFullDetails = () => {
    onClose(); 
  navigate(`/events/${event._id}/detail`);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center Modal Logic */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal Content */}
        <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-gray-100 dark:border-gray-700">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/50">
            <div>
               <h3
                className="text-xl font-bold leading-6 text-gray-900 dark:text-white"
                id="modal-title"
              >
                {event.title}
              </h3>
              <div className="mt-2">
                <Badge color={getStatusColor(event.status)}>
                  {t(`eventDetail.status.${event.status}`) || event.status}
                </Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              title={t("eventDetailModal.close")}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-5">
            
            {/* Description */}
            {event.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                {event.description}
              </div>
            )}

            {/* Info Grid */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                   <CalendarIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Date</span>
                   <span className="font-medium">{formatDateLong(event.startDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                   <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Time</span>
                   <span className="font-medium">
                    {formatTime(event.startDate)}
                    {event.endDate ? ` - ${formatTime(event.endDate)}` : ""}
                   </span>
                </div>
              </div>

              {event.clientId?.name && (
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                     <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{t("eventDetailModal.client")}</span>
                    <span className="font-medium">{event.clientId.name}</span>
                  </div>
                </div>
              )}

              {event.guestCount && (
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                     <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                     <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{t("eventDetailModal.guests")}</span>
                     <span className="font-medium">{event.guestCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="danger"
              icon={Trash2}
              onClick={handleDelete}
              disabled={isDeleting}
              size="sm"
              className="bg-white border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-600"
            >
              {isDeleting ? t("eventDetailModal.actions.delete.deleting") : t("eventDetailModal.actions.delete.button")}
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                icon={Edit}
                size="sm"
                onClick={() => onEdit(event)}
              >
                {t("eventDetailModal.actions.edit")}
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewFullDetails}
                className="gap-2"
              >
                {t("eventDetailModal.actions.viewFullDetails")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;