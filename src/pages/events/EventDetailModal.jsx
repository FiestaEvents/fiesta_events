// EventDetailModal.jsx
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
import { toast } from "react-hot-toast";
import { eventService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";

const EventDetailModal = ({ isOpen, onClose, event, onEdit, refreshData }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("tn-TN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  const handleDelete = async () => {
    if (
      window.confirm(
        t("eventDetailModal.actions.delete.confirm", { eventTitle: event.title })
      )
    ) {
      setIsDeleting(true);
      try {
        await eventService.deleteEvent(event._id);
        toast.success(t("eventDetailModal.actions.delete.success"));
        console.log(`Event ${event._id} deleted successfully`);
        onClose();
        refreshData(); // Refresh the data after deletion
      } catch (error) {
        console.error("Failed to delete event:", error);
        toast.error(t("eventDetailModal.actions.delete.error"));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle viewing full event details
  const handleViewFullDetails = () => {
    onClose(); // Close the current modal
    navigate(`/events/${event._id}/detail`); // Navigate to the full event detail page
  };

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
                <h3
                  className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  {event.title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  title={t("eventDetailModal.close")}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge color={getStatusColor(event.status)}>
                    {t(`eventDetailModal.status.${event.status}`)}
                  </Badge>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">{t("eventDetailModal.description")}:</span>{" "}
                    {event.description || t("eventDetailModal.noDescription")}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <CalendarIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span>{formatDateLong(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span>
                      {formatTime(event.startDate)}
                      {event.endDate ? ` - ${formatTime(event.endDate)}` : ""}
                    </span>
                  </div>
                  {event.clientId?.name && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>
                        {t("eventDetailModal.client")}:{" "}
                        <span className="font-medium">
                          {event.clientId.name}
                        </span>
                      </span>
                    </div>
                  )}
                  {event.guestCount && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{event.guestCount} {t("eventDetailModal.guests")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-between gap-3 rounded-b-xl">
              <Button
                variant="danger"
                icon={Trash2}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t("eventDetailModal.actions.delete.deleting") : t("eventDetailModal.actions.delete.button")}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(event)}
                >
                  {t("eventDetailModal.actions.edit")}
                </Button>
                {/* Small square button for View Full Details */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewFullDetails}
                  className="gap-3 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                  title={t("eventDetailModal.actions.viewFullDetailsTitle")}
                >
                  {t("eventDetailModal.actions.viewFullDetails")}
                  <ArrowRight className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;